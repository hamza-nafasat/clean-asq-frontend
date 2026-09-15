import { RiSparkling2Line } from "react-icons/ri";
import { BRANDING_AI_ICON_SRC } from "../utils/branding.constants";
import { getContrastColor } from "../utils/branding.utils2";

const BrandingAiWidgetPreview = ({
  launchColor = "",
  headerColor = "",
  bannerColor = "",
  bannerTextColor = "",
  useCustomIcon = true,
}) => {
  const launchTextColor = getContrastColor(launchColor);
  const headerTextColor = getContrastColor(headerColor);

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
              <img
                src={BRANDING_AI_ICON_SRC}
                alt=""
                style={{ width: "140%", height: "140%", minWidth: "140%", minHeight: "140%" }}
                draggable={false}
              />
            ) : (
              <RiSparkling2Line className="h-8 w-8" style={{ color: launchTextColor }} />
            )}
          </div>
          <span className="text-xs text-gray-400">Launch</span>
        </div>

        {/* Widget panel */}
        <div className="rounded-xl shadow-xl overflow-hidden border border-gray-200" style={{ width: 220 }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: headerColor }}>
            {useCustomIcon ? (
              <img src={BRANDING_AI_ICON_SRC} alt="" className="h-5 w-5 shrink-0" draggable={false} />
            ) : (
              <RiSparkling2Line className="h-4 w-4 shrink-0" style={{ color: headerTextColor }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold leading-tight truncate" style={{ color: headerTextColor }}>
                AI Assistant
              </div>
              <div className="text-[10px] leading-tight opacity-70 truncate" style={{ color: headerTextColor }}>
                Application Form
              </div>
            </div>
            <div className="text-lg leading-none opacity-60" style={{ color: headerTextColor }}>
              ×
            </div>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-black/10"
            style={{ backgroundColor: bannerColor }}
          >
            <span className="text-xs font-semibold flex-1 truncate" style={{ color: bannerTextColor }}>
              Choose your preferred language
            </span>
            <span className="text-xs rounded px-1 bg-white text-gray-700">🌐</span>
          </div>

          <div className="p-2.5 space-y-2 bg-[#f8f9ff]">
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-[10px] leading-tight max-w-[75%]"
                style={{ backgroundColor: headerColor, color: headerTextColor }}
              >
                Hi! I&apos;m your assistant 👋
              </div>
            </div>
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-sm px-2.5 py-1.5 text-[10px] leading-tight max-w-[75%] bg-gray-200 text-gray-700">
                How do I fill this in?
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingAiWidgetPreview;
