import { UseAIChat } from "@/context/AiChatContext";
import { useBranding } from "@/hooks/BrandingContext";
import getEnv from "@/lib/env";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiDownload, FiExternalLink, FiX } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

// Returns "#000" or "#fff" — whichever contrasts better against the given hex background.
function contrastColor(hex = "#000000") {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? "#000000" : "#ffffff";
}

const SERVER_URL = getEnv("SERVER_URL");

function DocumentModal({ url, title, onClose }) {
  const { aiHeaderColor, accentColor, fontFamily } = useBranding();
  const { setOverlayContext, clearOverlayContext, assistantMode, setIsOpen, addMessage } = UseAIChat();

  const headerBg = aiHeaderColor || accentColor || "#1e3a5f";
  const headerText = contrastColor(headerBg);
  const [docText, setDocText] = useState(null); // extracted plain-text content

  const iframeRef = useRef(null);
  const [docStatus, setDocStatus] = useState("loading"); // "loading" | "ready" | "unavailable"

  // Auto-open AI assistant when the document viewer opens.
  // Clear the "user closed" flag so the widget actually opens — the user deliberately
  // clicked a document link, which implies intent to use the AI assistant.
  useEffect(() => {
    sessionStorage.removeItem("ai-widget-user-closed");
    setIsOpen(true);
    addMessage({
      role: "assistant",
      content: `I can see you've opened **${title}**. I can summarize this document, answer questions about it, or create a downloadable copy for you — just ask!`,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable download function — used by both the header button and the AI tool call.
  const downloadDocument = useCallback(async () => {
    const proxyEndpoint =
      assistantMode === "applicant"
        ? `${SERVER_URL}/api/ai/applicant-document-text`
        : `${SERVER_URL}/api/ai/document-text`;
    let text = "";
    let structuredHtml = "";
    let docTitle = title; // fallback to the prop if backend doesn't return one
    try {
      const res = await fetch(proxyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success && data.text) text = data.text;
      if (data.success && data.title) docTitle = data.title;
      if (data.success && data.bodyHtml) structuredHtml = data.bodyHtml;
    } catch {
      /* fall through */
    }
    if (!text) text = docText || "";

    const timestamp = new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    // Convert bodyHtml chunks into pdfmake content nodes.
    // Each double-newline-separated chunk is either a heading tag or plain text.
    const source = structuredHtml || text || "Document content could not be retrieved.";
    const headingSizes = { h1: 20, h2: 16, h3: 14, h4: 12, h5: 11, h6: 10 };
    const pdfContent = [
      // Metadata header
      { text: docTitle, style: "metaTitle" },
      {
        columns: [
          { text: `Downloaded: ${timestamp}`, style: "meta" },
          { text: `Source: ${url}`, style: "metaUrl", alignment: "right", link: url },
        ],
        margin: [0, 4, 0, 0],
      },
      { canvas: [{ type: "line", x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 0.5, lineColor: "#cccccc" }], margin: [0, 8, 0, 16] },
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
          fontSize: headingSizes[level] || 12,
          bold: true,
          margin: [0, level === "h1" ? 16 : 12, 0, 4],
          color: "#111111",
        });
      } else {
        const plain = t.replace(/<[^>]+>/g, "").trim();
        if (!plain) return;
        pdfContent.push({ text: plain, style: "body" });
      }
    });

    const docDef = {
      content: pdfContent,
      styles: {
        metaTitle: { fontSize: 10, bold: true, color: "#333333", margin: [0, 0, 0, 2] },
        meta: { fontSize: 8, color: "#666666" },
        metaUrl: { fontSize: 8, color: "#0066cc" },
        body: { fontSize: 10, lineHeight: 1.6, color: "#111111", margin: [0, 0, 0, 8] },
      },
      defaultStyle: { font: "Roboto" },
      pageMargins: [56, 48, 56, 48],
    };

    const safeFilename = docTitle.replace(/[^a-z0-9]/gi, "_");
    pdfMake.createPdf(docDef).download(`${safeFilename}.pdf`);
  }, [url, title, assistantMode, docText]);

  // Button handler — triggers the same download as the AI tool, and surfaces
  // a chat message so the user sees feedback even if they had the widget closed.
  const handleSaveCopy = useCallback(async () => {
    sessionStorage.removeItem("ai-widget-user-closed");
    setIsOpen(true);
    addMessage({ role: "assistant", content: "Creating your download…" });
    await downloadDocument();
    addMessage({
      role: "assistant",
      content:
        "Your copy of this agreement has been downloaded. " +
        "If you'd like a combined download that also includes the information you entered on this page, " +
        "use the **Download** button on the form below.",
    });
  }, [downloadDocument, setIsOpen, addMessage]);

  // Register / update the overlay context whenever the document content changes.
  useEffect(() => {
    const aiEndpoint =
      assistantMode === "applicant"
        ? `${SERVER_URL}/api/ai/applicant-document-chat`
        : `${SERVER_URL}/api/ai/document-chat`;

    const description = docText
      ? `The applicant is reviewing the "${title}" document. ` +
        `Use the full document text below to summarize it, answer questions, ` +
        `and explain any sections they ask about.\n\n` +
        `--- DOCUMENT BEGIN ---\n${docText.slice(0, 14000)}\n--- DOCUMENT END ---`
      : `The applicant is opening the "${title}" document (${url}). ` +
        `The document is still loading — once it's ready you'll have the full text. ` +
        `Greet the applicant and let them know you can summarize or answer questions once it loads.`;

    setOverlayContext({
      screenId: `doc-viewer-${title.toLowerCase().replace(/\s+/g, "-")}`,
      screenName: title,
      aiEndpoint,
      description,
      currentState: {
        documentUrl: url,
        documentTitle: title,
        documentLoaded: docText !== null,
      },
      actions: { downloadDocument },
    });

    return () => clearOverlayContext();
  }, [url, title, assistantMode, docText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract document text after the iframe finishes loading.
  const handleIframeLoad = () => {
    // Attempt 1 — direct DOM access (works for same-origin documents)
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.body) {
        const clone = doc.body.cloneNode(true);
        clone.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove());
        const text = (clone.innerText || clone.textContent || "").replace(/\s{3,}/g, "\n\n").trim();
        if (text.length > 20) {
          setDocText(text);
          setDocStatus("ready");
          return;
        }
      }
    } catch {
      // Cross-origin — fall through to fetch
    }

    // Attempt 2 — fetch the URL and strip tags (works when CORS allows)
    fetch(url)
      .then((r) => r.text())
      .then((html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        div.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove());
        const text = (div.innerText || div.textContent || "").replace(/\s{3,}/g, "\n\n").trim();
        if (text.length > 20) {
          setDocText(text);
          setDocStatus("ready");
        } else {
          setDocStatus("unavailable");
        }
      })
      .catch(() => setDocStatus("unavailable"));
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        data-testid="document-modal"
        className="relative flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{
          width: "min(900px, 92vw)",
          height: "min(820px, 88vh)",
          fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header — branded ── */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: headerBg }}>
          {/* Title + AI status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate" style={{ color: headerText }}>
              {title}
            </span>
            {docStatus === "loading" && (
              <span className="text-xs opacity-60 shrink-0" style={{ color: headerText }}>
                · loading…
              </span>
            )}
            {docStatus === "ready" && (
              <span
                className="flex items-center gap-1 text-xs opacity-80 shrink-0"
                style={{ color: headerText }}
                title="Document loaded — AI assistant has full context"
              >
                <IoCheckmarkCircle className="h-3.5 w-3.5" />
                AI ready
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Save a copy */}
            <button
              type="button"
              onClick={handleSaveCopy}
              title="Save a copy of this document"
              className="flex items-center gap-1.5 text-xs bg-transparent border-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: headerText }}
            >
              <FiDownload className="h-3.5 w-3.5" />
              Save a copy
            </button>

            {/* Open in new tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: headerText }}
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              New tab
            </a>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document"
              className="opacity-70 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer"
              style={{ color: headerText }}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Document iframe ── */}
        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          className="flex-1 w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}

export default DocumentModal;
