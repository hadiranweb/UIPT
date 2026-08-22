import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Code2, FlaskConical, Home, Orbit, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { globalCommands, groupCommands, searchGlobalCommands, type CommandGroup as CommandGroupName, type GlobalCommand } from "@/data/globalCommands";
import { scrollToHash, splitHref } from "@/lib/hashNavigation";

const groupIcons: Record<CommandGroupName, typeof Home> = {
  platform: Home,
  theory: Orbit,
  engine: Code2,
};

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type GlobalCommandPaletteProps = {
  onOpen?: () => void;
  onClose?: () => void;
};

export function GlobalCommandPalette({ onOpen, onClose }: GlobalCommandPaletteProps) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filteredCommands = useMemo(() => searchGlobalCommands(query), [query]);
  const sections = useMemo(() => groupCommands(filteredCommands), [filteredCommands]);

  const openPalette = () => {
    setOpen(true);
    onOpen?.();
  };

  const closePalette = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    onClose?.();
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    setShortcutLabel(/Mac|iPhone|iPad|iPod/i.test(window.navigator.platform) ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTextEntryTarget(event.target)) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      openPalette();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [location]);

  const navigateTo = (command: GlobalCommand) => {
    const { path, hash } = splitHref(command.href);
    const targetPath = path || window.location.pathname;
    closePalette(false);
    setLocation(command.href);

    if (!hash) return;
    window.requestAnimationFrame(() => {
      if (window.location.pathname === targetPath) {
        scrollToHash(hash, prefersReducedMotion() ? "auto" : "smooth");
      } else {
        window.requestAnimationFrame(() => scrollToHash(hash, prefersReducedMotion() ? "auto" : "smooth"));
      }
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      openPalette();
      return;
    }
    closePalette();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="global-command-trigger"
        aria-label="Search ONSOUR commands"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Search ONSOUR (Ctrl K or Command K)"
        onClick={openPalette}
      >
        <Search size={15} aria-hidden="true" />
        <span className="global-command-trigger-label">Search</span>
        <kbd aria-hidden="true">{shortcutLabel} K</kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search ONSOUR"
        description="Navigate through ONSOUR platform routes, UIPT theory sections, and Engine Specifications."
        className="global-command-dialog"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search theory, runtime, governance, or a route…"
          aria-label="Search ONSOUR commands"
        />
        <CommandList className="global-command-list">
          <CommandEmpty>No matching ONSOUR capability found.</CommandEmpty>
          {sections.map((section, sectionIndex) => {
            const GroupIcon = groupIcons[section.group];
            return (
              <div key={section.group}>
                {sectionIndex > 0 && <CommandSeparator />}
                <CommandGroup heading={section.label}>
                  {section.commands.map((command) => (
                    <CommandItem
                      key={command.id}
                      value={[command.label, command.description, command.href, ...command.keywords].join(" ")}
                      onSelect={() => navigateTo(command)}
                      className="global-command-item"
                    >
                      <span className={`global-command-icon global-command-icon-${command.group}`} aria-hidden="true">
                        {command.group === "platform" && command.href.includes("#lab") ? <FlaskConical size={17} /> : <GroupIcon size={17} />}
                      </span>
                      <span className="global-command-copy">
                        <strong>{command.label}</strong>
                        <small>{command.description}</small>
                      </span>
                      <CommandShortcut>{command.kind === "section" ? "SECTION" : "OPEN"}</CommandShortcut>
                      <ArrowRight className="global-command-arrow" size={15} aria-hidden="true" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
        <div className="global-command-footer" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
          <span className="global-command-footer-route">{sections.length ? `${filteredCommands.length} destinations` : "No destinations"}</span>
        </div>
      </CommandDialog>
    </>
  );
}

