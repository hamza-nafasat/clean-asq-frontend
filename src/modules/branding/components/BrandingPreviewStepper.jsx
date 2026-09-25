import { BRANDING_PREVIEW_STEPS } from "../utils/branding.data";

const BrandingPreviewStepper = ({ accent, background, activeTextColor }) => (
  <div style={{ backgroundColor: background }} className="flex items-center gap-0 px-6 py-3">
    {BRANDING_PREVIEW_STEPS.map((step, i) => (
      <div key={step} className="flex flex-1 items-center">
        <div className="flex flex-col items-center gap-1">
          <span
            style={{
              backgroundColor: i === 0 ? accent : "transparent",
              borderColor: accent,
              color: i === 0 ? activeTextColor : accent,
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold"
          >
            {i + 1}
          </span>
          <span className="text-[10px] whitespace-nowrap" style={{ color: accent }}>
            {step}
          </span>
        </div>
        {i < BRANDING_PREVIEW_STEPS.length - 1 && (
          <hr className="mb-4.5 h-0.5 flex-1 border-0 opacity-30" style={{ backgroundColor: accent }} />
        )}
      </div>
    ))}
  </div>
);

export default BrandingPreviewStepper;
