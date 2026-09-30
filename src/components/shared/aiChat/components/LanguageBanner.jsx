import { useEffect, useState } from "react";
import CustomizableSelect from "@/components/shared/CustomizableSelect";
import { DEFAULT_LANGUAGE_CODE, LANGUAGES } from "@/lib/languages.js";
import {
  LANGUAGE_LABEL_ROTATE_MS,
  PREFERRED_LANGUAGE_LABELS,
} from "@/components/shared/aiChat/utils/aiChat.languageLabels.constants.js";

const LANGUAGE_OPTIONS = LANGUAGES.map((lang) => ({
  value: lang.code,
  searchText: `${lang.name} ${lang.nativeName}`,
  option: (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0">{lang.flag}</span>
      <span className="truncate">
        {lang.name} — {lang.nativeName}
      </span>
    </span>
  ),
}));

const LanguageBanner = ({
  effectiveBannerColor,
  effectiveBannerText,
  preferredLanguage,
  onSelectPreferredLanguage,
}) => {
  const [labelIndex, setLabelIndex] = useState(0);
  const label = PREFERRED_LANGUAGE_LABELS[labelIndex];

  // cycle the label through each language
  useEffect(() => {
    const timer = setInterval(
      () =>
        setLabelIndex((prev) => (prev + 1) % PREFERRED_LANGUAGE_LABELS.length),
      LANGUAGE_LABEL_ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2"
      style={{
        backgroundColor: effectiveBannerColor,
        borderColor: "rgba(0,0,0,0.1)",
      }}
    >
      <span
        lang={label.code}
        dir="auto"
        aria-live="off"
        className="min-w-0 text-xs leading-tight font-semibold"
        style={{ color: effectiveBannerText }}
      >
        {label.text}
      </span>
      <div className="w-44 shrink-0 sm:w-56">
        <CustomizableSelect
          options={LANGUAGE_OPTIONS}
          initialValue={preferredLanguage || DEFAULT_LANGUAGE_CODE}
          onSelect={onSelectPreferredLanguage}
          searchable
          searchPlaceholder="Search language…"
          buttonCs="rounded-lg border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-none md:text-xs"
          labelCs="min-w-0 truncate"
        />
      </div>
    </div>
  );
};

export default LanguageBanner;
