import { useState } from "react";
import { toast } from "react-toastify";
import { IoColorPaletteOutline } from "react-icons/io5";
import { useFetchBrandingMutation } from "@/redux/apis/branding.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";

const BrandingAutoExtractTab = ({ onSwitchToManual, onApply, onClose }) => {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [fetchBranding, { isLoading }] = useFetchBrandingMutation();

  const handleExtract = async () => {
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }
    setFailed(false);
    try {
      const res = await fetchBranding({ url }).unwrap();
      if (res.success) {
        onApply?.(res.data);
        onClose?.();
      }
    } catch (error) {
      console.error("Extract branding error:", error);
      setFailed(true);
    }
  };

  return (
    <section className="space-y-4">
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
          size="field"
        />
      </div>
      {failed && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Extraction failed — this site may be blocking automated access.{" "}
          <button
            type="button"
            className="font-semibold underline hover:text-amber-900"
            onClick={() => onSwitchToManual?.()}
          >
            Try Manual Extraction →
          </button>
        </p>
      )}
    </section>
  );
};

export default BrandingAutoExtractTab;
