// add target="_blank" to links that do not set a target
export const openLinksInNewTab = (html) =>
  String(html || "").replace(/<a(\s+.*?)?>/g, (match) => {
    if (match.includes("target=")) return match;
    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
  });
