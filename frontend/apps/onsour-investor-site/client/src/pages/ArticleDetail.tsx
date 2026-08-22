import { Link, useRoute } from "wouter";
import { ArrowLeft, BookOpen, Orbit, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { seoArticles } from "@/data/seoArticles";
import { SeoHead } from "@/components/SeoHead";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug;
  const article = seoArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="site-shell docs-shell" style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <h2>Article not found</h2>
        <p style={{ color: "#8faab7", margin: "1rem 0 2rem" }}>The requested whitepaper or research article does not exist or has been relocated.</p>
        <Link href="/articles" className="button button-primary" style={{ textDecoration: "none" }}>Return to Articles</Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": article.title,
    "description": article.summary,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "ONSOUR Research Group"
    },
    "keywords": article.keywords.join(", ")
  };

  return (
    <div className="site-shell docs-shell">
      <GlobalNavigation />
      <SeoHead
        title={`${article.title} | ONSOUR Research`}
        description={article.summary}
        canonicalPath={`/articles/${article.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <main id="main-content" className="container docs-container" style={{ padding: "3rem 1.5rem", maxWidth: "840px" }}>
        <Breadcrumbs items={[{ label: "Research", href: "/articles" }, { label: article.title }]} />
        <div className="docs-header" style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            <span className="mono-label" style={{ color: "var(--accent-cyan)", background: "rgba(42, 133, 139, 0.15)", padding: "0.25rem 0.6rem", borderRadius: "4px" }}>{article.category}</span>
            <span className="mono-label" style={{ color: "#8faab7" }}>{article.readTime} · Published {article.publishedAt}</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", lineHeight: "1.25", marginBottom: "1rem" }}>{article.title}</h1>
          <p className="hero-lede" style={{ fontSize: "1.2rem", color: "#8faab7" }}>{article.subtitle}</p>
        </div>

        <div className="article-content" style={{ color: "#c5d7df", fontSize: "1.1rem", lineHeight: "1.8" }} dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

        <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(42, 133, 139, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="mono-label" style={{ display: "block", marginBottom: "0.5rem" }}>EXPLORE THE IMPLEMENTATION</span>
            <Link href="/lab" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontFamily: "var(--font-mono)", fontWeight: 600 }}>→ Test these principles live in the Dispersion Lab</Link>
          </div>
          <Link href="/articles" className="button button-secondary" style={{ textDecoration: "none", color: "#effffc", background: "rgba(42,133,139,0.2)", padding: "0.6rem 1.2rem", borderRadius: "0.5rem" }}>
            Back to Research
          </Link>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
