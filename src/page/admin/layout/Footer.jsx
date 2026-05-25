import { useBranding } from "@/hooks/BrandingContext";
import { useRef, useState } from "react";
import { FiExternalLink, FiPrinter, FiX } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";

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

function DocumentModal({ url, title, onClose }) {
  const { aiHeaderColor, accentColor, fontFamily } = useBranding();

  const headerBg = aiHeaderColor || accentColor || "#1e3a5f";
  const headerText = contrastColor(headerBg);

  const iframeRef = useRef(null);
  const [, setDocText] = useState(null); // extracted plain-text content
  const [docStatus, setDocStatus] = useState("loading"); // "loading" | "ready" | "unavailable"

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

  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.focus();
      iframeRef.current?.contentWindow?.print();
    } catch {
      // Cross-origin restriction — open in new tab so user can print from there
      window.open(url, "_blank");
    }
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
            {/* Print / Save */}
            <button
              type="button"
              onClick={handlePrint}
              title="Print or save this document"
              className="flex items-center gap-1.5 text-xs bg-transparent border-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: headerText }}
            >
              <FiPrinter className="h-4 w-4" />
              Print or Save
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

// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  const { applicationFooterText, applicationFooterTextSize, appFooterPadding, privacyPolicyUrl, termsOfServiceUrl } =
    useBranding();

  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div
        className="bg-footer flex w-full shrink-0 items-center justify-between gap-4 rounded-t-md border-t-2 px-4 shadow md:px-4 xl:px-20"
        style={{
          paddingTop: `${appFooterPadding ?? 16}px`,
          paddingBottom: `${appFooterPadding ?? 16}px`,
        }}
      >
        {/* Footer text */}
        <div className="text-footer-text font-semibold" style={{ fontSize: `${applicationFooterTextSize || 16}px` }}>
          {(applicationFooterText || "").replace("{year}", new Date().getFullYear())}
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-end gap-4 md:gap-2">
          {privacyPolicyUrl && (
            <button
              type="button"
              data-testid="footer-privacy-link"
              onClick={() => setOpenDoc({ url: privacyPolicyUrl, title: "Privacy Policy" })}
              className="text-footer-text hover:text-secondary cursor-pointer bg-transparent border-0 p-0 text-sm"
            >
              Privacy Policy
            </button>
          )}
          {termsOfServiceUrl && (
            <button
              type="button"
              data-testid="footer-tos-link"
              onClick={() => setOpenDoc({ url: termsOfServiceUrl, title: "Terms of Service" })}
              className="text-footer-text hover:text-secondary cursor-pointer bg-transparent border-0 p-0 text-sm"
            >
              Terms of Service
            </button>
          )}
        </div>
      </div>

      {openDoc && <DocumentModal url={openDoc.url} title={openDoc.title} onClose={() => setOpenDoc(null)} />}
    </>
  );
}

export default Footer;
