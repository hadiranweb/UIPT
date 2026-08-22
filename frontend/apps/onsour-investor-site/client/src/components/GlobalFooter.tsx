import { ArrowUpRight, Github } from "lucide-react";
import { Link } from "wouter";
import { globalNavItems } from "./globalNavigation";

export function GlobalFooter() {
  const platform = globalNavItems.filter((item) => item.group === "platform");
  const research = globalNavItems.filter((item) => item.group === "research");
  const developers = globalNavItems.filter((item) => item.group === "developers");

  return (
    <footer className="global-footer">
      <div className="container">
        <div className="global-footer-top">
          <div className="global-footer-intro">
            <Link href="/" className="brand-lockup" aria-label="ONSOUR home">
              <span className="brand-orbit-mark" aria-hidden="true"><span /></span>
              <span>ONSOUR</span>
            </Link>
            <p>A self-regulating runtime and open research surface for resilient intelligence.</p>
            <span className="global-footer-status"><span className="console-dot" /> UIPT / RUNTIME HOMEOSTASIS / ONLINE</span>
          </div>
          <div className="global-footer-columns">
            <FooterGroup title="Platform" items={platform} />
            <FooterGroup title="Research" items={research} />
            <FooterGroup title="Developers" items={developers} />
            <div className="global-footer-column">
              <span className="global-footer-column-title">Governance</span>
              <a href="https://github.com/hadiranweb/UIPT" target="_blank" rel="noreferrer" className="global-footer-link">
                <Github size={14} aria-hidden="true" /> UIPT on GitHub <ArrowUpRight size={13} aria-hidden="true" />
              </a>
              <Link href="/docs#api" className="global-footer-link">Persistence &amp; API</Link>
              <Link href="/docs#governance" className="global-footer-link">Epsilon governance</Link>
              <Link href="/articles/authoritative-replay-and-governance-snapshots" className="global-footer-link">Read governance paper</Link>
            </div>
          </div>
        </div>
        <div className="global-footer-bottom">
          <span>© 2026 ONSOUR / UIPT RESEARCH GROUP</span>
          <span>Independent core · auditable state · deterministic replay</span>
          <a href="mailto:hello@onsour.systems?subject=ONSOUR%20Platform%20Inquiry" className="global-footer-contact">Contact the team <ArrowUpRight size={13} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, items }: { title: string; items: typeof globalNavItems }) {
  return (
    <div className="global-footer-column">
      <span className="global-footer-column-title">{title}</span>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="global-footer-link">{item.label}</Link>
      ))}
    </div>
  );
}
