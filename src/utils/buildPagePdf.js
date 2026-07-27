import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

const HEADING_SIZES = { h1: 20, h2: 16, h3: 14, h4: 12, h5: 11, h6: 10 };

/**
 * Converts an HTML string to an array of pdfMake content nodes, preserving
 * heading hierarchy and collapsing everything else to plain-text paragraphs.
 */
function htmlToNodes(html, baseStyle = "body") {
  if (!html) return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  // Flatten block elements so we can split on newlines
  div.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6, br").forEach((el) => {
    el.insertAdjacentText("afterend", "\n\n");
  });
  const raw = (div.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  const nodes = [];
  raw.split(/\n{2,}/).forEach((chunk) => {
    const t = chunk.trim();
    if (t) nodes.push({ text: t, style: baseStyle });
  });
  return nodes;
}

/**
 * Converts an image URL to a base64 data URI so pdfMake can embed it.
 * Returns null on failure (signature will be omitted rather than crash).
 */
async function imageUrlToDataUri(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Converts a bodyHtml/text string (same format as DocumentModal uses) into pdfMake content nodes.
 */
function agreementContentNodes(source) {
  const nodes = [];
  (source || "").split(/\n{2,}/).forEach((chunk) => {
    const t = chunk.trim();
    if (!t) return;
    const headingMatch = t.match(/^<(h[1-6])>([\s\S]*?)<\/h[1-6]>$/i);
    if (headingMatch) {
      const level = headingMatch[1].toLowerCase();
      const headingText = headingMatch[2].replace(/<[^>]+>/g, "").trim();
      if (!headingText) return;
      nodes.push({
        text: headingText,
        fontSize: HEADING_SIZES[level] || 12,
        bold: true,
        margin: [0, level === "h1" ? 16 : 10, 0, 4],
        color: "#111111",
      });
    } else {
      const plain = t.replace(/<[^>]+>/g, "").trim();
      if (!plain) return;
      nodes.push({ text: plain, style: "body" });
    }
  });
  return nodes;
}

/**
 * Generates and downloads a PDF containing the current page's form data and
 * optionally one or more fetched agreement documents.
 *
 * @param {object} opts
 * @param {string}   opts.pageName      - Display name of the current page/section
 * @param {Array}    opts.fieldRows     - [{label, value}] pairs (text fields only, skip empties)
 * @param {string}   [opts.signatureUrl]  - Cloudinary URL of an uploaded signature image
 * @param {Array}    [opts.agreements]  - [{title, url, text, bodyHtml}] fetched agreement docs
 * @param {string}   [opts.userName]       - Full name of the applicant completing the form
 * @param {string}   [opts.userEmail]      - Email of the applicant completing the form
 * @param {string}   [opts.displayHtml]    - Section display text HTML (shown before field rows)
 * @param {string}   [opts.signDisplayHtml] - Signature display text HTML (shown before signature)
 */
export async function buildPagePdf({ pageName, fieldRows = [], signatureUrl = null, agreements = [], userName = null, userEmail = null, displayHtml = null, signDisplayHtml = null }) {
  const timestamp = new Date().toLocaleString(undefined, {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const divider = {
    canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#cccccc" }],
    margin: [0, 16, 0, 16],
  };

  const completedByParts = [userName, userEmail ? `(${userEmail})` : null].filter(Boolean);
  const completedByLine = completedByParts.length > 0 ? `Completed by: ${completedByParts.join(" ")}` : null;

  const content = [
    { text: pageName, style: "pageTitle" },
    { text: `Downloaded: ${timestamp}`, style: "meta", margin: [0, 2, 0, 0] },
    ...(completedByLine ? [{ text: completedByLine, style: "meta", margin: [0, 1, 0, 0] }] : []),
    { ...divider, margin: [0, 8, 0, 16] },
  ];

  // Section display text (instructions, agreements summary, etc.)
  const displayNodes = htmlToNodes(displayHtml, "displayText");
  if (displayNodes.length > 0) {
    content.push(...displayNodes);
    content.push({ text: "", margin: [0, 8, 0, 0] }); // spacer before fields
  }

  // Form fields
  if (fieldRows.length > 0) {
    fieldRows.forEach(({ label, value }) => {
      content.push({
        columns: [
          { text: label, bold: true, fontSize: 10, width: 180, color: "#444444" },
          { text: String(value ?? ""), fontSize: 10, color: "#111111" },
        ],
        margin: [0, 0, 0, 6],
      });
    });
  } else {
    content.push({ text: "No form fields completed.", style: "body", color: "#888888" });
  }

  // Signature display text (shown above signature box)
  const signDisplayNodes = htmlToNodes(signDisplayHtml, "displayText");
  if (signDisplayNodes.length > 0) {
    content.push({ text: "", margin: [0, 10, 0, 0] });
    content.push(...signDisplayNodes);
  }

  // Signature image
  if (signatureUrl) {
    const dataUri = await imageUrlToDataUri(signatureUrl);
    if (dataUri) {
      content.push(
        { text: "Signature:", bold: true, fontSize: 10, color: "#444444", margin: [0, 14, 0, 6] },
        { image: dataUri, width: 200, margin: [0, 0, 0, 4] },
      );
    }
  }

  // Associated agreements
  for (const agreement of agreements) {
    content.push(divider);
    content.push({
      text: `Agreement: ${agreement.title || agreement.url}`,
      style: "agreementTitle",
    });
    content.push({
      text: agreement.url,
      style: "metaUrl",
      link: agreement.url,
      margin: [0, 2, 0, 12],
    });
    const source = agreement.bodyHtml || agreement.text || "";
    if (source) {
      content.push(...agreementContentNodes(source));
    } else {
      content.push({ text: "Agreement content could not be retrieved.", style: "body", color: "#888888" });
    }
  }

  const docDef = {
    content,
    styles: {
      pageTitle:      { fontSize: 16, bold: true,  color: "#111111", margin: [0, 0, 0, 2] },
      agreementTitle: { fontSize: 13, bold: true,  color: "#111111", margin: [0, 0, 0, 2] },
      meta:           { fontSize: 8,               color: "#666666" },
      metaUrl:        { fontSize: 8,               color: "#0066cc" },
      body:           { fontSize: 10, lineHeight: 1.6, color: "#111111", margin: [0, 0, 0, 8] },
      displayText:    { fontSize: 10, lineHeight: 1.5, color: "#333333", margin: [0, 0, 0, 6] },
    },
    defaultStyle: { font: "Roboto" },
    pageMargins: [56, 48, 56, 48],
  };

  const safeFilename = pageName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  pdfMake.createPdf(docDef).download(`${safeFilename}.pdf`);
}
