import { FORM_PREVIEW_BADGES } from "../utils/aiChat.constants.js";

const FormPreviewSectionCard = ({ section, badge, children }) => (
  <div
    className={`rounded-lg border ${section.isHidden ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 bg-white"} overflow-hidden`}
  >
    <div
      className={`flex items-center justify-between px-3 py-1.5 ${section.isHidden ? "bg-gray-100" : "bg-indigo-50"}`}
    >
      <span className="text-[11px] font-semibold text-gray-700">{section.sectionName}</span>
      <span
        className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
          section.isHidden
            ? "bg-gray-200 text-gray-500"
            : badge === FORM_PREVIEW_BADGES.SYSTEM_STEP
              ? "bg-blue-100 text-blue-600"
              : badge === FORM_PREVIEW_BADGES.SIGNATURE
                ? "bg-purple-100 text-purple-600"
                : "bg-indigo-100 text-indigo-600"
        }`}
      >
        {badge}
      </span>
    </div>
    <div className="px-3 py-2">{children}</div>
  </div>
);

export default FormPreviewSectionCard;
