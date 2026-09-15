import { useCallback, useEffect, useRef, useState } from "react";
import { FiDownload, FiExternalLink, FiX } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import useAiChat from "@/hooks/useAiChat";
import useBranding from "@/hooks/useBranding";
import { DOCUMENT_STATUSES } from "@/constants";
import { buildDocumentPdfDefinition, extractReadableText, getContrastColor } from "@/utils/documentPdf";
import getEnv from "@/utils/env";

pdfMake.vfs = pdfFonts.vfs;

const SERVER_URL = getEnv("SERVER_URL");

const DocumentModal = ({ url, title, onClose }) => {
  const { aiHeaderColor, accentColor, fontFamily } = useBranding();
  const { setOverlayContext, clearOverlayContext, assistantMode, setIsOpen, addMessage } = useAiChat();

  const headerBg = aiHeaderColor || accentColor || "#1e3a5f";
  const headerText = getContrastColor(headerBg);
  const [docText, setDocText] = useState(null);

  const iframeRef = useRef(null);
  const [docStatus, setDocStatus] = useState(DOCUMENT_STATUSES.LOADING);

  // open the ai assistant with the document
  useEffect(() => {
    sessionStorage.removeItem("ai-widget-user-closed");
    setIsOpen(true);
    addMessage({
      role: "assistant",
      content: `I can see you've opened **${title}**. I can summarize this document, answer questions about it, or create a downloadable copy for you — just ask!`,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // download used by the header button and the ai tool
  const downloadDocument = useCallback(async () => {
    const proxyEndpoint =
      assistantMode === "applicant"
        ? `${SERVER_URL}/api/ai/applicant-document-text`
        : `${SERVER_URL}/api/ai/document-text`;
    let text = "";
    let structuredHtml = "";
    let docTitle = title;
    try {
      const res = await fetch(proxyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success && data.data?.text) text = data.data.text;
      if (data.success && data.data?.title) docTitle = data.data.title;
      if (data.success && data.data?.bodyHtml) structuredHtml = data.data.bodyHtml;
    } catch {
      /* fall through */
    }
    if (!text) text = docText || "";

    const source = structuredHtml || text || "Document content could not be retrieved.";
    const docDef = buildDocumentPdfDefinition({ docTitle, url, source });

    const safeFilename = docTitle.replace(/[^a-z0-9]/gi, "_");
    pdfMake.createPdf(docDef).download(`${safeFilename}.pdf`);
  }, [url, title, assistantMode, docText]);

  // header download with chat feedback
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

  // keep the ai overlay context in sync with the document
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

  // extract document text after the iframe loads
  const handleIframeLoad = () => {
    // same-origin documents can be read directly
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.body) {
        const text = extractReadableText(doc.body.cloneNode(true));
        if (text) {
          setDocText(text);
          setDocStatus(DOCUMENT_STATUSES.READY);
          return;
        }
      }
    } catch {
      // cross-origin, fall through to fetch
    }

    fetch(url)
      .then((r) => r.text())
      .then((html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        const text = extractReadableText(div);
        if (text) {
          setDocText(text);
          setDocStatus(DOCUMENT_STATUSES.READY);
        } else {
          setDocStatus(DOCUMENT_STATUSES.UNAVAILABLE);
        }
      })
      .catch(() => setDocStatus(DOCUMENT_STATUSES.UNAVAILABLE));
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: headerBg }}>
          {/* Title + AI status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate" style={{ color: headerText }}>
              {title}
            </span>
            {docStatus === DOCUMENT_STATUSES.LOADING && (
              <span className="text-xs opacity-60 shrink-0" style={{ color: headerText }}>
                · loading…
              </span>
            )}
            {docStatus === DOCUMENT_STATUSES.READY && (
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

        {/* Document */}
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
};

export default DocumentModal;
