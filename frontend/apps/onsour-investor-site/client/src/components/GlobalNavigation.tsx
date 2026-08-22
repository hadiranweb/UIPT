import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu, X } from "lucide-react";
import { GlobalCommandPalette } from "./GlobalCommandPalette";
import { globalNavGroups, globalNavItems, isNavItemActive } from "./globalNavigation";

export function GlobalNavigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isMenuOpen) return;
    firstMenuLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="global-nav-shell">
        <div className="global-nav-inner">
          <Link href="/" className="brand-lockup" aria-label="ONSOUR home">
            <span className="brand-orbit-mark" aria-hidden="true"><span /></span>
            <span>ONSOUR</span>
          </Link>

          <nav className="global-nav-desktop" aria-label="Primary navigation">
            {globalNavGroups.map((group) => (
              <div className="global-nav-group" key={group.id}>
                <span className="global-nav-group-label">{group.label}</span>
                <div className="global-nav-group-links">
                  {globalNavItems.filter((item) => item.group === group.id).map((item) => {
                    const active = isNavItemActive(location, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`global-nav-link ${active ? "is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        title={item.description}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <GlobalCommandPalette onOpen={() => setIsMenuOpen(false)} />
          <Link href="/lab" className="global-nav-cta">
            Open Live Lab <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            ref={menuButtonRef}
            className="global-nav-menu-button"
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="global-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div id="global-mobile-menu" className="global-mobile-menu" role="dialog" aria-modal="true" aria-label="Primary navigation menu">
          <div className="global-mobile-menu-inner">
            <p className="global-mobile-kicker">ONSOUR / SUPER-PLATFORM</p>
            {globalNavGroups.map((group) => (
              <section className="global-mobile-group" key={group.id} aria-labelledby={`mobile-${group.id}-label`}>
                <h2 id={`mobile-${group.id}-label`}>{group.label}</h2>
                {globalNavItems.filter((item) => item.group === group.id).map((item, index) => {
                  const active = isNavItemActive(location, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ref={group.id === "platform" && index === 0 ? firstMenuLinkRef : undefined}
                      className={`global-mobile-link ${active ? "is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  );
                })}
              </section>
            ))}
            <Link href="/lab" className="global-mobile-cta">Open Live Dispersion Lab <ArrowRight size={17} /></Link>
          </div>
        </div>
      )}
    </>
  );
}
