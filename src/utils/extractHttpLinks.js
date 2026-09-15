// parses an HTML string and returns all unique http/https hyperlinks found in <a href> tags
export const extractHttpLinks = (html) => {
  if (!html) return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const seen = new Set();
  const links = [];
  div.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) return;
    if (!href.startsWith("http://") && !href.startsWith("https://")) return;
    if (seen.has(href)) return;
    seen.add(href);
    links.push({ url: href, linkText: a.textContent.trim() || href });
  });
  return links;
};
