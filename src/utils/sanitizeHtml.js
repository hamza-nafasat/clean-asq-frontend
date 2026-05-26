import DOMPurify from "dompurify";

function sanitizeHtml(dirtyHtml = "") {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  // First sanitize
  const clean = DOMPurify.sanitize(dirtyHtml, {
    FORBID_TAGS: ["script"],
    // explicitly allow iframe
    ADD_TAGS: ["iframe"],
    // allow only required attrs
    ADD_ATTR: ["src", "width", "height", "style", "loading", "allowfullscreen"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onmouseenter"],
  });

  // Parse DOM
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = clean;

  const iframes = tempDiv.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    const src = iframe.getAttribute("src") || "";
    // allow only google maps
    const isGoogleMap = src.startsWith("https://www.google.com/maps") || src.startsWith("https://maps.google.com");

    if (!isGoogleMap) {
      iframe.remove();
      return;
    }

    // enforce safe defaults
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("height", "250");
    iframe.setAttribute("width", "100%");

    // remove unsafe attrs
    [...iframe.attributes].forEach((attr) => {
      const allowed = ["src", "width", "height", "loading", "style", "allowfullscreen"];

      if (!allowed.includes(attr.name.toLowerCase())) {
        iframe.removeAttribute(attr.name);
      }
    });
  });

  return tempDiv.innerHTML;
}

export { sanitizeHtml };
