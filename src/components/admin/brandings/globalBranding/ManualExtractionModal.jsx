import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiClipboard, FiExternalLink, FiX } from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useFetchBrandingMutation, useGetManualExtractionScriptQuery } from "@/redux/apis/brandingApis";
import getEnv from "@/lib/env";

const SERVER_URL = getEnv("SERVER_URL");

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepDot = ({ n, active, done }) => (
  <div className="flex items-center gap-1">
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
        done
          ? "border-green-500 bg-green-500 text-white"
          : active
            ? "border-primary bg-primary text-white"
            : "border-gray-300 bg-white text-gray-400"
      }`}
    >
      {done ? "✓" : n}
    </div>
  </div>
);

const StepBar = ({ current, total }) => (
  <div className="mb-6 flex items-center gap-2">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center">
        <StepDot n={i + 1} active={current === i + 1} done={current > i + 1} />
        {i < total - 1 && (
          <div className={`mx-1 h-0.5 w-8 ${current > i + 1 ? "bg-green-500" : "bg-gray-200"}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ─── Key hint ────────────────────────────────────────────────────────────────

const Kbd = ({ children }) => (
  <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
    {children}
  </kbd>
);

// ─── Auto tab ────────────────────────────────────────────────────────────────

const AutoTab = ({ onSwitchToManual, onApply, onClose }) => {
  const [url, setUrl] = useState("");
  const [fetchBranding, { isLoading }] = useFetchBrandingMutation();
  const [failed, setFailed] = useState(false);

  const handleExtract = async () => {
    if (!url) { toast.error("Please enter a website URL"); return; }
    setFailed(false);
    try {
      const res = await fetchBranding({ url }).unwrap();
      if (res.success) {
        onApply(res.data);
        onClose();
      }
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter a website URL and we'll extract its colors, logos, and fonts automatically.
      </p>
      <div className="flex items-end gap-3">
        <div className="grow">
          <TextField
            label="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
          />
        </div>
        <Button
          label="Extract"
          icon={IoColorPaletteOutline}
          onClick={handleExtract}
          loading={isLoading}
          disabled={isLoading}
          className="h-12.5!"
        />
      </div>
      {failed && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Extraction failed — this site may be blocking automated access.{" "}
          <button
            className="font-semibold underline hover:text-amber-900"
            onClick={onSwitchToManual}
          >
            Try Manual Extraction →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Manual tab ──────────────────────────────────────────────────────────────

const ManualTab = ({ initialUrl, script, onApply, onClose }) => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState(initialUrl || "");
  const [domData, setDomData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const waitingRef = useRef(false);

  // Copies the script using execCommand fallback (works without Clipboard API
  // permission and without needing the page to be focused).
  // Must be called from a user-gesture handler (click), not from useEffect.
  const copyScript = useCallback(() => {
    if (!script) return;

    const attemptCopy = () => {
      const ta = document.createElement("textarea");
      ta.value = script;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    };

    // Try modern API first, fall back to execCommand
    const p = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(script).then(() => true).catch(() => attemptCopy())
      : Promise.resolve(attemptCopy());

    p.then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("Clipboard copy failed — use the Copy button to try again.");
      }
    });
  }, [script]);

  // postMessage listener — active once site is opened
  useEffect(() => {
    const handler = (event) => {
      if (!waitingRef.current) return;
      try {
        const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (msg?.type === "fintainium-branding-extraction" && msg.data) {
          waitingRef.current = false;
          setDomData(msg.data);
          setStep(3);
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleOpenSite = () => {
    if (!url) { toast.error("Please enter a website URL"); return; }
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Ensure script is on clipboard before the user pastes in DevTools
    copyScript();

    // Open with opener reference (no noopener) so postMessage works
    window.open(fullUrl, "_blank", "noopener=no,noreferrer=no");

    waitingRef.current = true;
    setStep(2);
  };

  const handleApply = async () => {
    if (!domData) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/ai/process-manual-branding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Processing failed");
      onApply({ ...data.brandingData, screenshotUrl: data.screenshotUrl });
      toast.success("Branding extracted successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to process the extracted data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Step 1: URL entry ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-5">
        <StepBar current={1} total={3} />
        <p className="text-sm text-gray-500">
          Enter the website address, then click <strong>Open Site</strong>. We'll open it in a new
          tab, copy the extraction script to your clipboard, and start listening for results.
        </p>
        <div className="flex items-end gap-3">
          <div className="grow">
            <TextField
              label="Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => e.key === "Enter" && handleOpenSite()}
            />
          </div>
          <Button
            label="Open Site"
            icon={FiExternalLink}
            onClick={handleOpenSite}
            loading={!script}
            disabled={!url || !script}
            className="h-12.5!"
            title={!script ? "Loading extraction script…" : undefined}
          />
        </div>
      </div>
    );
  }

  // ── Step 2: Instructions + waiting ────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="space-y-5">
        <StepBar current={2} total={3} />
        <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span>The script is on your clipboard. We're listening for results.</span>
          <button
            onClick={copyScript}
            className="ml-4 flex shrink-0 items-center gap-1.5 rounded border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
          >
            {copied ? <FiCheck size={13} className="text-green-600" /> : <FiClipboard size={13} />}
            {copied ? "Copied!" : "Copy Again"}
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <p className="font-medium">In the browser tab that just opened:</p>
          <ol className="list-inside list-decimal space-y-2 pl-1">
            <li>
              Open the DevTools console —{" "}
              <span className="text-gray-500">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>J</Kbd>
              </span>{" "}
              on Windows/Linux, or{" "}
              <span className="text-gray-500">
                <Kbd>⌘</Kbd> + <Kbd>⌥</Kbd> + <Kbd>J</Kbd>
              </span>{" "}
              on Mac
            </li>
            <li>
              Click the <strong>Console</strong> tab
            </li>
            <li>
              Paste with <Kbd>Ctrl+V</Kbd> / <Kbd>⌘+V</Kbd> and press <Kbd>Enter</Kbd>
            </li>
          </ol>
          <p className="mt-1 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700 text-xs">
            <strong>First time?</strong> Chrome may show a "Don't paste code" warning. Type{" "}
            <Kbd>allow pasting</Kbd> and press Enter, then paste the script again.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2 text-sm text-gray-500">
          <Spinner />
          <span>Waiting for the script to run…</span>
        </div>
        <button
          className="text-xs text-gray-400 underline hover:text-gray-600"
          onClick={() => setStep(1)}
        >
          ← Start over with a different URL
        </button>
      </div>
    );
  }

  // ── Step 3: Results received ───────────────────────────────────────────────
  if (step === 3 && domData) {
    const previewLogos = (domData.logos || [])
      .filter((l) => !l.isFavicon && !l.isOg && l.src)
      .slice(0, 4);
    const previewColors = (domData.rawColors || []).slice(0, 8);

    return (
      <div className="space-y-5">
        <StepBar current={3} total={3} />
        <div className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✅ Results received from <strong>{domData.title || domData.url}</strong>
        </div>

        {/* Logo previews */}
        {previewLogos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Logos found ({previewLogos.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {previewLogos.map((l, i) => (
                <div
                  key={i}
                  className="flex h-16 w-24 items-center justify-center rounded border bg-gray-100 p-1"
                >
                  <img
                    src={l.src}
                    alt={`logo ${i + 1}`}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color swatches */}
        {previewColors.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Colors detected
            </p>
            <div className="flex flex-wrap gap-2">
              {previewColors.map((hex, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded border border-gray-200 shadow-sm"
                    style={{ background: hex }}
                    title={hex}
                  />
                  <span className="text-[10px] text-gray-400">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          label={isProcessing ? "Extracting…" : "Extract Branding"}
          icon={IoColorPaletteOutline}
          onClick={handleApply}
          loading={isProcessing}
          disabled={isProcessing}
        />
      </div>
    );
  }

  return null;
};

// ─── Main modal ───────────────────────────────────────────────────────────────

const ManualExtractionModal = ({
  isOpen,
  onClose,
  initialUrl = "",
  initialTab = "auto",  // "auto" | "manual"
  onApply,              // callback(brandingData) — same shape as applyExtractedBranding expects
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const bookmarkletRef = useRef(null);

  const { data: scriptData } = useGetManualExtractionScriptQuery(undefined, { skip: !isOpen });
  const script = scriptData?.script || null;

  // Sync tab when initialTab changes (e.g. AI triggers manual tab)
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // Inject bookmarklet anchor imperatively — React blocks javascript: hrefs otherwise
  const bookmarkletHref = script ? `javascript:${encodeURIComponent(script)}` : null;
  useEffect(() => {
    const el = bookmarkletRef.current;
    if (!el) return;
    if (!bookmarkletHref) { el.replaceChildren(); return; }
    const a = document.createElement("a");
    a.href = bookmarkletHref;
    a.draggable = true;
    a.className = "text-primary cursor-grab font-medium active:cursor-grabbing";
    a.title = "Drag this to your browser bookmarks bar. Click it on any site to extract branding without opening DevTools.";
    a.textContent = "🔖 Extract Branding";
    el.replaceChildren(a);
  }, [bookmarkletHref]);

  if (!isOpen) return null;

  const tabs = [
    { id: "auto",   label: "Auto Extract" },
    { id: "manual", label: "Manual Extract" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[92%] max-w-2xl flex-col rounded-md bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Extract Branding</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "auto" && (
            <AutoTab
              onSwitchToManual={() => setActiveTab("manual")}
              onApply={onApply}
              onClose={onClose}
            />
          )}
          {activeTab === "manual" && (
            <ManualTab
              key={initialUrl}
              initialUrl={initialUrl}
              script={script}
              onApply={onApply}
              onClose={onClose}
            />
          )}
        </div>

        {/* Bookmarklet footer — always visible on manual tab */}
        {activeTab === "manual" && script && (
          <div className="border-t bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500">
              Do this often?{" "}
              <span ref={bookmarkletRef} />
              {" "}← drag to your bookmarks bar to skip DevTools next time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualExtractionModal;
