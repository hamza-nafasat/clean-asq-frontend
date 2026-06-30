import { LANGUAGES } from "../constants/languages.js";

export default function LanguageBanner({ bannerIdx, bannerFading, effectiveBannerColor, effectiveBannerText }) {
  return (
    <div
      className="flex items-center px-3 py-2 border-b"
      style={{ backgroundColor: effectiveBannerColor, borderColor: "rgba(0,0,0,0.1)" }}
    >
      <span
        className="text-sm font-semibold w-full text-center"
        style={{ color: effectiveBannerText, opacity: bannerFading ? 0 : 1, transition: "opacity 0.32s ease" }}
      >
        {LANGUAGES[bannerIdx].banner}
      </span>
    </div>
  );
}
