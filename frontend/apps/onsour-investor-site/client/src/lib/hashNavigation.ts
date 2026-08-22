export function splitHref(href: string) {
  const [path, hash] = href.split("#");
  return { path: path || "", hash: hash || "" };
}

export function scrollToHash(hash: string, behavior: ScrollBehavior = "smooth", attemptsRemaining = 12) {
  if (typeof window === "undefined" || !hash) return;

  const target = document.getElementById(hash);
  if (target) {
    target.scrollIntoView({ behavior, block: "start" });
    return;
  }

  if (attemptsRemaining <= 0) return;
  window.requestAnimationFrame(() => scrollToHash(hash, behavior, attemptsRemaining - 1));
}

export function scrollToCurrentHash(behavior: ScrollBehavior = "auto") {
  if (typeof window === "undefined") return;
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!hash) return;
  scrollToHash(hash, behavior, 18);
}
