const HEADING_SIZES = { h1: 20, h2: 16, h3: 14, h4: 12, h5: 11, h6: 10 };
const DEFAULT_HEADING_SIZE = 12;
const TOP_HEADING = "h1";
const MIN_DOCUMENT_TEXT_LENGTH = 20;
const NON_TEXT_SELECTOR = "script, style, noscript, svg";

const DOCUMENT_PDF_STYLES = {
  metaTitle: { fontSize: 10, bold: true, color: "#333333", margin: [0, 0, 0, 2] },
  meta: { fontSize: 8, color: "#666666" },
  metaUrl: { fontSize: 8, color: "#0066cc" },
  body: { fontSize: 10, lineHeight: 1.6, color: "#111111", margin: [0, 0, 0, 8] },
};

// "#000000" or "#ffffff", whichever contrasts better with the background
export const getContrastColor = (hex = "#000000") => {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? "#000000" : "#ffffff";
};

// readable text of an html node, or null when too short
export const extractReadableText = (root) => {
  root.querySelectorAll(NON_TEXT_SELECTOR).forEach((el) => el.remove());
  const text = (root.innerText || root.textContent || "").replace(/\s{3,}/g, "\n\n").trim();
  return text.length > MIN_DOCUMENT_TEXT_LENGTH ? text : null;
};

const getDownloadTimestamp = () =>
  new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

// pdfmake definition with a metadata header and one node per chunk
export const buildDocumentPdfDefinition = ({ docTitle, url, source }) => {
  const pdfContent = [
    { text: docTitle, style: "metaTitle" },
    {
      columns: [
        { text: `Downloaded: ${getDownloadTimestamp()}`, style: "meta" },
        { text: `Source: ${url}`, style: "metaUrl", alignment: "right", link: url },
      ],
      margin: [0, 4, 0, 0],
    },
    {
      canvas: [{ type: "line", x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: "#cccccc" }],
      margin: [0, 8, 0, 16],
    },
  ];

  source.split(/\n{2,}/).forEach((chunk) => {
    const t = chunk.trim();
    if (!t) return;
    const headingMatch = t.match(/^<(h[1-6])>([\s\S]*?)<\/h[1-6]>$/i);
    if (headingMatch) {
      const level = headingMatch[1].toLowerCase();
      const headingText = headingMatch[2].replace(/<[^>]+>/g, "").trim();
      if (!headingText) return;
      pdfContent.push({
        text: headingText,
        fontSize: HEADING_SIZES[level] || DEFAULT_HEADING_SIZE,
        bold: true,
        margin: [0, level === TOP_HEADING ? 16 : 12, 0, 4],
        color: "#111111",
      });
    } else {
      const plain = t.replace(/<[^>]+>/g, "").trim();
      if (!plain) return;
      pdfContent.push({ text: plain, style: "body" });
    }
  });

  return {
    content: pdfContent,
    styles: DOCUMENT_PDF_STYLES,
    defaultStyle: { font: "Roboto" },
    pageMargins: [56, 48, 56, 48],
  };
};
