import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiExternalLink } from "react-icons/fi";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import BrandingExtractionStepBar from "./BrandingExtractionStepBar";
import BrandingManualExtractResults from "./BrandingManualExtractResults";
import BrandingManualExtractWaiting from "./BrandingManualExtractWaiting";
import {
  BRANDING_COPY_FEEDBACK_MS,
  BRANDING_EXTRACTION_MESSAGE_TYPE,
  BRANDING_MANUAL_EXTRACTION_STEPS,
} from "../utils/branding.constants";
import { copyTextToClipboard } from "../utils/branding.utils";
import getEnv from "@/utils/env";

const SERVER_URL = getEnv("SERVER_URL");

const BrandingManualExtractTab = ({ initialUrl = "", script = null, onApply, onClose }) => {
  const [step, setStep] = useState(BRANDING_MANUAL_EXTRACTION_STEPS.URL);
  const [url, setUrl] = useState(initialUrl || "");
  const [domData, setDomData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const waitingRef = useRef(false);

  // must run from a click so the clipboard is allowed
  const copyScript = useCallback(() => {
    if (!script) return;
    copyTextToClipboard(script).then((ok) => {
      if (ok) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), BRANDING_COPY_FEEDBACK_MS);
      } else {
        toast.error("Clipboard copy failed — use the Copy button to try again.");
      }
    });
  }, [script]);

  // results posted back from the opened site
  useEffect(() => {
    const handler = (event) => {
      if (!waitingRef.current) return;
      try {
        const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (msg?.type === BRANDING_EXTRACTION_MESSAGE_TYPE && msg.data) {
          waitingRef.current = false;
          setDomData(msg.data);
          setStep(BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS);
        }
      } catch {
        // not a json message
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleOpenSite = () => {
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    copyScript();
    // keep the opener so postMessage works
    window.open(fullUrl, "_blank", "noopener=no,noreferrer=no");
    waitingRef.current = true;
    setStep(BRANDING_MANUAL_EXTRACTION_STEPS.WAITING);
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
      onApply?.({ ...data.data?.brandingData, screenshotUrl: data.data?.screenshotUrl });
      toast.success("Branding extracted successfully!");
      onClose?.();
    } catch (err) {
      console.error("Process manual branding error:", err);
      setError(err.message || "Failed to process the extracted data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === BRANDING_MANUAL_EXTRACTION_STEPS.WAITING) {
    return (
      <BrandingManualExtractWaiting
        isCopied={isCopied}
        onCopy={copyScript}
        onStartOver={() => setStep(BRANDING_MANUAL_EXTRACTION_STEPS.URL)}
      />
    );
  }

  if (step === BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS) {
    if (!domData) return null;
    return (
      <BrandingManualExtractResults domData={domData} error={error} isProcessing={isProcessing} onApply={handleApply} />
    );
  }

  return (
    <div className="space-y-5">
      <BrandingExtractionStepBar
        current={BRANDING_MANUAL_EXTRACTION_STEPS.URL}
        total={BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS}
      />
      <p className="text-sm text-gray-500">
        Enter the website address, then click <strong>Open Site</strong>. We'll open it in a new tab, copy the
        extraction script to your clipboard, and start listening for results.
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
};

export default BrandingManualExtractTab;
