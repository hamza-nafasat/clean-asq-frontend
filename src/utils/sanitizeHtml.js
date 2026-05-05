import DOMPurify from "dompurify";

/**
 * Sanitize HTML + enforce iframe safety
 */
function sanitizeHtml(dirtyHtml = "") {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  // Step 1: basic sanitize
  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ["div", "span", "p", "b", "strong", "i", "ul", "ol", "li", "br", "iframe", "img"],
    ALLOWED_ATTR: ["style", "src", "width", "height", "loading", "alt"],
    FORBID_TAGS: ["script"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });

  // Step 2: DOM parsing (for iframe control)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = clean;

  const iframes = tempDiv.querySelectorAll("iframe");

  iframes.forEach((iframe) => {
    const src = iframe.getAttribute("src") || "";

    // Only allow Google Maps embeds
    const isGoogleMap = src.startsWith("https://www.google.com/maps") || src.startsWith("https://maps.google.com");

    if (!isGoogleMap) {
      iframe.remove();
      return;
    }

    // enforce safe defaults
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "250");

    // strip any dangerous attrs
    [...iframe.attributes].forEach((attr) => {
      if (!["src", "width", "height", "loading", "style"].includes(attr.name)) {
        iframe.removeAttribute(attr.name);
      }
    });
  });

  return tempDiv.innerHTML;
}
export { sanitizeHtml };
