/**
 * Capture-phase click handler that opens document links in DocumentModal
 * instead of navigating / opening a new tab.
 * Skips hash, mailto, tel, and javascript URLs.
 */
export function makeDocLinkHandler(setDoc) {
  return (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setDoc({ url: href, title: href });
  };
}
