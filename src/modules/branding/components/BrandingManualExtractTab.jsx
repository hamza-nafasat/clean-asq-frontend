import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiExternalLink } from "react-icons/fi";
import { useProcessManualBrandingMutation } from "@/redux/apis/branding.apis";
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
import { toHttpsUrl } from "@/utils/websiteUrl";

const BrandingManualExtractTab = ({ initialUrl = "", script = null, onApply, onClose }) => {
  const [step, setStep] = useState(BRANDING_MANUAL_EXTRACTION_STEPS.URL);
  const [url, setUrl] = useState(initialUrl || "");
  const [domData, setDomData] = useState(null);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const waitingRef = useRef(false);
  const [processManualBranding, { isLoading: isProcessing }] = useProcessManualBrandingMutation();

  // clipboard needs a user click
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

  // results from the opened site
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
    const fullUrl = toHttpsUrl(url);
    copyScript();
    // keep the opener so postMessage works
    window.open(fullUrl, "_blank", "noopener=no,noreferrer=no");
    waitingRef.current = true;
    setStep(BRANDING_MANUAL_EXTRACTION_STEPS.WAITING);
  };

  const handleApply = async () => {
    if (!domData) return;
    setError(null);
    try {
      const res = await processManualBranding({ domData }).unwrap();
      onApply?.({ ...res.data?.brandingData, screenshotUrl: res.data?.screenshotUrl });
      toast.success("Branding extracted successfully!");
      onClose?.();
    } catch (err) {
      console.error("Process manual branding error:", err);
      setError(err?.data?.message || "Failed to process the extracted data. Please try again.");
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
    <section className="space-y-5">
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
          size="field"
          title={!script ? "Loading extraction script…" : undefined}
        />
      </div>
    </section>
  );
};

export default BrandingManualExtractTab;
