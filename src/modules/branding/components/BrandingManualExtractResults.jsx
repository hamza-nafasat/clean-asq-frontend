import { IoColorPaletteOutline } from "react-icons/io5";
import Button from "@/components/shared/Button";
import BrandingExtractionStepBar from "./BrandingExtractionStepBar";
import { BRANDING_MANUAL_EXTRACTION_STEPS } from "../utils/branding.constants";

const BrandingManualExtractResults = ({ domData = {}, error = null, isProcessing = false, onApply }) => {
  const previewLogos = (domData.logos || []).filter((l) => !l.isFavicon && !l.isOg && l.src).slice(0, 4);
  const previewColors = (domData.rawColors || []).slice(0, 8);

  return (
    <div className="space-y-5">
      <BrandingExtractionStepBar
        current={BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS}
        total={BRANDING_MANUAL_EXTRACTION_STEPS.RESULTS}
      />
      <div className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
        ✅ Results received from <strong>{domData.title || domData.url}</strong>
      </div>

      {previewLogos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Logos found ({previewLogos.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {previewLogos.map((l, i) => (
              <div key={i} className="flex h-16 w-24 items-center justify-center rounded border bg-gray-100 p-1">
                <img
                  src={l.src}
                  alt={`logo ${i + 1}`}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {previewColors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Colors detected</p>
          <div className="flex flex-wrap gap-2">
            {previewColors.map((hex, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded border border-gray-200 shadow-sm" style={{ background: hex }} title={hex} />
                <span className="text-[10px] text-gray-400">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        label={isProcessing ? "Extracting…" : "Extract Branding"}
        icon={IoColorPaletteOutline}
        onClick={onApply}
        loading={isProcessing}
        disabled={isProcessing}
      />
    </div>
  );
};

export default BrandingManualExtractResults;
