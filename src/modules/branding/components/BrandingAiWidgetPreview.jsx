import { FiGlobe, FiX } from "react-icons/fi";
import { RiSparkling2Line } from "react-icons/ri";
import { getContrastColor } from "@/utils/contrastColor";
import { BRANDING_AI_ICON_SRC } from "../utils/branding.constants";

// matches the 1.05 contrast ratio cutoff
const WIDGET_CONTRAST_THRESHOLD = Math.sqrt(0.0525) - 0.05;

const BrandingAiWidgetPreview = ({
  launchColor = "",
  headerColor = "",
  bannerColor = "",
  bannerTextColor = "",
  useCustomIcon = true,
}) => {
  const launchTextColor = getContrastColor(launchColor, WIDGET_CONTRAST_THRESHOLD);
  const headerTextColor = getContrastColor(headerColor, WIDGET_CONTRAST_THRESHOLD);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">Preview</p>
      <div className="flex items-end gap-4">
        {/* Launch button */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="h-16 w-16 rounded-full shadow-lg flex items-center justify-center overflow-hidden p-0"
            style={{ backgroundColor: launchColor }}
          >
            {useCustomIcon ? (
              <img src={BRANDING_AI_ICON_SRC} alt="" className="size-[140%] min-h-[140%] min-w-[140%]" draggable={false} />
            ) : (
              <RiSparkling2Line className="h-8 w-8" style={{ color: launchTextColor }} />
            )}
          </div>
          <span className="text-xs text-gray-400">Launch</span>
        </div>

        {/* Widget panel */}
        <div className="w-[220px] overflow-hidden rounded-xl border border-gray-200 shadow-xl">
          <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: headerColor }}>
            {useCustomIcon ? (
              <img src={BRANDING_AI_ICON_SRC} alt="" className="h-5 w-5 shrink-0" draggable={false} />
            ) : (
              <RiSparkling2Line className="h-4 w-4 shrink-0" style={{ color: headerTextColor }} />
            )}
            <div className="min-w-0 flex-1" style={{ color: headerTextColor }}>
              <p className="truncate text-xs leading-tight font-semibold">AI Assistant</p>
              <p className="truncate text-[10px] leading-tight opacity-70">Application Form</p>
            </div>
            <FiX size={16} className="shrink-0 opacity-60" style={{ color: headerTextColor }} aria-hidden="true" />
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-black/10"
            style={{ backgroundColor: bannerColor }}
          >
            <span className="text-xs font-semibold flex-1 truncate" style={{ color: bannerTextColor }}>
              Choose your preferred language
            </span>
            <span className="rounded bg-white px-1 py-0.5 text-gray-700">
              <FiGlobe size={12} aria-hidden="true" />
            </span>
          </div>

          <div className="p-2.5 space-y-2 bg-chatBackground">
            <div className="flex justify-start">
              <p
                className="max-w-[75%] rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-[10px] leading-tight"
                style={{ backgroundColor: headerColor, color: headerTextColor }}
              >
                Hi! I&apos;m your assistant 👋
              </p>
            </div>
            <div className="flex justify-end">
              <p className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gray-200 px-2.5 py-1.5 text-[10px] leading-tight text-gray-700">
                How do I fill this in?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingAiWidgetPreview;
