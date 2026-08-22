export type GlobalNavItem = {
  href: string;
  label: string;
  description: string;
  group: "platform" | "research" | "developers";
  external?: boolean;
};

export const globalNavItems: GlobalNavItem[] = [
  {
    href: "/",
    label: "Home",
    description: "ONSOUR platform overview",
    group: "platform",
  },
  {
    href: "/lab",
    label: "Live Lab",
    description: "Run graph analysis and governance experiments",
    group: "platform",
  },
  {
    href: "/theory",
    label: "Theory",
    description: "Explore the UIPT mathematical foundation",
    group: "research",
  },
  {
    href: "/articles",
    label: "Research",
    description: "Read UIPT research papers and technical briefs",
    group: "research",
  },
  {
    href: "/ecosystem",
    label: "Developer Hub",
    description: "Integrate contracts, SDKs, and runtime APIs",
    group: "developers",
  },
  {
    href: "/docs",
    label: "Engine Specs",
    description: "Inspect runtime, provenance, and persistence details",
    group: "developers",
  },
];

export const globalNavGroups = [
  { id: "platform", label: "Platform" },
  { id: "research", label: "Research" },
  { id: "developers", label: "Developers" },
] as const;

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/articles") return pathname === "/articles" || pathname.startsWith("/articles/");
  if (href === "/docs") return pathname === "/docs";
  if (href === "/lab") return pathname === "/lab";
  return pathname === href || pathname.startsWith(`${href}/`);
}
