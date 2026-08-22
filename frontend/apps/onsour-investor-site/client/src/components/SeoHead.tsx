import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, any>;
};

export function SeoHead({
  title,
  description,
  canonicalPath = "",
  ogType = "website",
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${canonicalPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);

    let ogTp = document.querySelector('meta[property="og:type"]');
    if (!ogTp) {
      ogTp = document.createElement("meta");
      ogTp.setAttribute("property", "og:type");
      document.head.appendChild(ogTp);
    }
    ogTp.setAttribute("content", ogType);

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "application/ld+json");
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, canonicalPath, ogType, jsonLd]);

  return null;
}
