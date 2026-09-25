import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import Button from "@/components/shared/Button";
import BrandingPreviewStepper from "./BrandingPreviewStepper";
import { URL_PREFIXES } from "@/constants";
import { BRANDING_HEADER_ALIGNMENTS } from "../utils/branding.constants";

const LOGO_JUSTIFY_CLASSES = {
  [BRANDING_HEADER_ALIGNMENTS.RIGHT]: "justify-end",
  [BRANDING_HEADER_ALIGNMENTS.CENTER]: "justify-center",
  [BRANDING_HEADER_ALIGNMENTS.LEFT]: "justify-start",
};

const FALLBACK_COLORS = {
  accent: "#6366f1",
  background: "#ffffff",
  text: "#000000",
  link: "#0000EE",
  frame: "#D1D5DB",
  highlighting: "rgba(99,102,241,0.20)",
  button: "#E5E7EB",
  buttonTextPrimary: "#ffffff",
  buttonTextSecondary: "#000000",
  headerBackground: "#ffffff",
  headerText: "#000000",
  footerBackground: "#1f2937",
  footerText: "#ffffff",
};

const BrandingPreview = ({
  primaryColor,
  companyName = "",
  selectedLogo,
  secondaryColor,
  accentColor,
  buttonTextPrimary,
  buttonTextSecondary,
  linkColor,
  textColor,
  frameColor,
  highlightingColor,
  backgroundColor,
  headerBackground,
  headerText,
  footerBackground,
  footerText,
  headerAlignment,
  appLogoMaxWidth,
  appLogoMaxHeight,
}) => {
  const { isCopied: copied, copy: handleCopy } = useCopyToClipboard(1500);

  const logoJustify = LOGO_JUSTIFY_CLASSES[headerAlignment] ?? LOGO_JUSTIFY_CLASSES[BRANDING_HEADER_ALIGNMENTS.LEFT];
  const accent = accentColor || FALLBACK_COLORS.accent;
  const background = backgroundColor || FALLBACK_COLORS.background;
  const text = textColor || FALLBACK_COLORS.text;
  const displayName = companyName || "Company Name";
  const companySlug = (companyName || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const previewUrl = `${URL_PREFIXES.HTTPS}${window.location.hostname}/${companySlug || "company-name"}`;

  return (
    <div className="border-softBorder mt-6 rounded-xl border p-3 shadow-sm md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Preview</h2>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap text-gray-500">Application URL</span>
        <button
          type="button"
          aria-label="Copy application URL"
          onClick={() => handleCopy(previewUrl)}
          className="flex flex-1 cursor-pointer items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700 hover:bg-gray-100"
        >
          {previewUrl}
        </button>
        {copied && <span className="text-xs whitespace-nowrap text-green-600">Copied!</span>}
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-gray-200">
        {/* Header */}
        <div
          style={{
            backgroundColor: headerBackground || FALLBACK_COLORS.headerBackground,
            color: headerText || FALLBACK_COLORS.headerText,
          }}
          className={`flex w-full items-center px-6 py-4 ${logoJustify}`}
        >
          {selectedLogo ? (
            <img
              src={selectedLogo}
              alt="logo"
              referrerPolicy="no-referrer"
              className="block object-contain"
              style={{ maxWidth: appLogoMaxWidth || 300, maxHeight: appLogoMaxHeight || 100 }}
            />
          ) : (
            <span className="text-[18px] font-semibold">{displayName}</span>
          )}
        </div>

        <BrandingPreviewStepper accent={accent} background={background} activeTextColor={FALLBACK_COLORS.background} />

        {/* Form body */}
        <div style={{ backgroundColor: background }} className="px-6 py-5">
          <p className="mb-4 text-sm font-medium" style={{ color: text }}>
            Please complete the fields below.{" "}
            <a href="#" className="underline" style={{ color: linkColor || FALLBACK_COLORS.link }}>
              Need help?
            </a>
          </p>

          <div className="mb-4">
            <label htmlFor="branding-preview-name" className="mb-1 block text-xs font-medium" style={{ color: text }}>
              Business Name
            </label>
            <input
              id="branding-preview-name"
              readOnly
              value="Acme Corporation"
              style={{ borderColor: frameColor || FALLBACK_COLORS.frame, color: text, backgroundColor: background }}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="branding-preview-email" className="mb-1 block text-xs font-medium" style={{ color: text }}>
              Business Email{" "}
              <span className="text-[10px]" style={{ color: accent }}>
                ← focused
              </span>
            </label>
            <input
              id="branding-preview-email"
              readOnly
              value="hello@acmecorp.com"
              style={{
                borderColor: accent,
                backgroundColor: highlightingColor || FALLBACK_COLORS.highlighting,
                color: text,
              }}
              className="w-full rounded-md border-2 px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              label="Next Step"
              style={{
                color: buttonTextPrimary || FALLBACK_COLORS.buttonTextPrimary,
                backgroundColor: primaryColor || FALLBACK_COLORS.button,
                border: `1px solid ${primaryColor || FALLBACK_COLORS.button}`,
              }}
            />
            <Button
              variant="secondary"
              label="Save & Exit"
              style={{
                color: buttonTextSecondary || FALLBACK_COLORS.buttonTextSecondary,
                backgroundColor: secondaryColor || FALLBACK_COLORS.button,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            backgroundColor: footerBackground || FALLBACK_COLORS.footerBackground,
            color: footerText || FALLBACK_COLORS.footerText,
          }}
          className="px-6 py-4 text-center text-xs"
        >
          © {new Date().getFullYear()} {displayName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default BrandingPreview;
