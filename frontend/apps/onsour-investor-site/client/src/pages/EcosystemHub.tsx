import { Link } from "wouter";
import { ArrowLeft, Code2, Cpu, Database, FileText, ShieldCheck, Terminal, Workflow, Zap } from "lucide-react";
import { developerDocSections } from "@/data/developerDocs";
import { SeoHead } from "@/components/SeoHead";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function EcosystemHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "ONSOUR Developer Documentation & SDK Hub",
    "description": "Technical specs, Zod graph validation contracts, Rust Rayon cores, and tRPC persistence APIs.",
    "url": "https://onsourinvst-bj5yx9ml.manus.space/ecosystem"
  };

  return (
    <div className="site-shell docs-shell">
      <GlobalNavigation />
      <SeoHead
        title="ONSOUR Developer Hub | SDKs, Zod Contracts & Rust Core"
        description="Access ONSOUR's developer ecosystem: versioned Zod schemas, Rust Rayon parallel execution references, and type-safe tRPC persistence routers."
        canonicalPath="/ecosystem"
        jsonLd={jsonLd}
      />
      <main id="main-content" className="container docs-container" style={{ padding: "3rem 1.5rem", maxWidth: "1000px" }}>
        <Breadcrumbs items={[{ label: "Developer Hub" }]} />
        <div className="docs-header" style={{ marginBottom: "3rem" }}>
          <div className="eyebrow"><span className="eyebrow-pulse" /> DEVELOPER DOCUMENTATION &amp; SDK HUB</div>
          <h1>Build on the ONSOUR Ecosystem<br /><span>Contracts, SDKs &amp; API Specs</span></h1>
          <p className="hero-lede">Complete developer resources for integrating with ONSOUR's Rust core, tRPC persistence routers, and Zod v1 graph schemas.</p>
        </div>

        <div className="hub-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          {developerDocSections.map((sec) => (
            <div key={sec.id} className="hub-card" style={{ background: "rgba(12, 34, 48, 0.6)", border: "1px solid rgba(42, 133, 139, 0.25)", borderRadius: "1rem", padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span className="mono-label" style={{ color: "var(--accent-cyan)", background: "rgba(42, 133, 139, 0.15)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>{sec.category}</span>
                  <span className="mono-label" style={{ color: "#8faab7", fontSize: "0.75rem" }}>{sec.targetAudience}</span>
                </div>
                <h3 style={{ fontSize: "1.3rem", color: "#effffc", marginBottom: "0.5rem" }}>{sec.title}</h3>
                <p style={{ color: "#8faab7", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1rem" }}>{sec.summary}</p>
                {sec.codeSnippet && (
                  <pre style={{ background: "#02070c", border: "1px solid rgba(42, 133, 139, 0.2)", borderRadius: "6px", padding: "0.75rem", overflowX: "auto", fontSize: "0.8rem", color: "#74f0e4", fontFamily: "var(--font-mono)", marginBottom: "1rem" }}>
                    <code>{sec.codeSnippet}</code>
                  </pre>
                )}
              </div>
              <Link href={sec.linkTarget} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                Explore Specs →
              </Link>
            </div>
          ))}
        </div>

        <div className="docs-cta-card" style={{ background: "linear-gradient(135deg, rgba(42, 133, 139, 0.2) 0%, rgba(12, 34, 48, 0.8) 100%)", border: "1px solid rgba(42, 133, 139, 0.4)", borderRadius: "1rem", padding: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.5rem", color: "#effffc", marginBottom: "0.5rem" }}>Ready to test your first topology?</h3>
            <p style={{ color: "#8faab7", margin: 0 }}>Launch the browser-only simulator and verify governance barriers instantly.</p>
          </div>
          <Link href="/lab" className="button button-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Open Live Dispersion Lab <Zap size={16} />
          </Link>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
