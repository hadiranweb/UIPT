import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, Orbit, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { seoArticles } from "@/data/seoArticles";
import { SeoHead } from "@/components/SeoHead";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ArticlesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "ONSOUR Research Papers & Whitepapers",
    "description": "Rigorous first-principles whitepapers exploring Universal Integrated Physical Theory (UIPT) and Rust parallel execution kernels.",
    "url": "https://onsourinvst-bj5yx9ml.manus.space/articles"
  };

  return (
    <div className="site-shell docs-shell">
      <GlobalNavigation />
      <SeoHead
        title="ONSOUR Research Papers | UIPT & Decentralized Intelligence"
        description="Explore rigorous academic whitepapers and technical briefs on Universal Integrated Physical Theory, Landau-Ginzburg potentials, and Rayon parallel kernels."
        canonicalPath="/articles"
        jsonLd={jsonLd}
      />
      <main id="main-content" className="container docs-container" style={{ padding: "3rem 1.5rem", maxWidth: "1000px" }}>
        <Breadcrumbs items={[{ label: "Research" }]} />
        <div className="docs-header" style={{ marginBottom: "3rem" }}>
          <div className="eyebrow"><span className="eyebrow-pulse" /> UIPT RESEARCH &amp; WHITEPAPERS</div>
          <h1>Decentralized Intelligence<br /><span>Theory &amp; Architecture Papers</span></h1>
          <p className="hero-lede">Rigorous first-principles whitepapers exploring Universal Integrated Physical Theory (UIPT), Rust parallel execution kernels, and cryptographic determinism.</p>
        </div>

        <div className="articles-grid" style={{ display: "grid", gap: "2rem" }}>
          {seoArticles.map((article) => (
            <article key={article.slug} className="article-card" style={{ background: "rgba(12, 34, 48, 0.6)", border: "1px solid rgba(42, 133, 139, 0.25)", borderRadius: "1rem", padding: "2rem", transition: "all 0.2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="mono-label" style={{ color: "var(--accent-cyan)", background: "rgba(42, 133, 139, 0.15)", padding: "0.25rem 0.6rem", borderRadius: "4px" }}>{article.category}</span>
                <span className="mono-label" style={{ color: "#8faab7" }}>{article.readTime} · {article.publishedAt}</span>
              </div>
              <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--font-heading)", color: "#effffc", marginBottom: "0.75rem" }}>
                <Link href={`/articles/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{article.title}</Link>
              </h2>
              <p style={{ color: "#8faab7", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>{article.summary}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {article.keywords.map((kw) => (
                  <span key={kw} style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.05)", color: "#74f0e4", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>#{kw}</span>
                ))}
              </div>
              <Link href={`/articles/${article.slug}`} className="button button-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                Read Full Paper <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
