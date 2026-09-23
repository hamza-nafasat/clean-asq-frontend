import { useEffect } from "react";
import { useDispatch } from "react-redux";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import Button from "@/components/shared/Button";
import { setCompanyName } from "@/redux/slices/branding.slice";
import { BRANDING_COPY_FEEDBACK_MS, BRANDING_HEADER_ALIGNMENTS, BRANDING_PREVIEW_STEPS } from "../utils/branding.constants";

const LOGO_JUSTIFY = {
  [BRANDING_HEADER_ALIGNMENTS.RIGHT]: "flex-end",
  [BRANDING_HEADER_ALIGNMENTS.CENTER]: "center",
  [BRANDING_HEADER_ALIGNMENTS.LEFT]: "flex-start",
};

const Preview = ({
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
  const dispatch = useDispatch();
  const { isCopied: copied, copy: handleCopy } = useCopyToClipboard(1500);

  useEffect(() => {
    dispatch(setCompanyName(companyName));
  }, [companyName, dispatch]);

  const logoJustify = LOGO_JUSTIFY[headerAlignment] ?? LOGO_JUSTIFY[BRANDING_HEADER_ALIGNMENTS.LEFT];
  const companySlug = (companyName || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const previewUrl = `https://${window.location.hostname}/${companySlug || "company-name"}`;

  return (
    <div className="mt-6 rounded-xl border border-[#F0F0F0] p-3 shadow-sm md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Preview</h2>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Application URL</span>
        <div
          className="flex flex-1 items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono cursor-pointer hover:bg-gray-100"
          onClick={() => handleCopy(previewUrl)}
        >
          {previewUrl}
        </div>
        {copied && <span className="text-xs text-green-600 whitespace-nowrap">Copied!</span>}
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-gray-200">
        {/* Header */}
        <div
          style={{ backgroundColor: headerBackground || "#ffffff", color: headerText || "#000000" }}
          className="flex items-center px-6 py-4"
        >
          <div style={{ display: "flex", width: "100%", justifyContent: logoJustify }}>
            {selectedLogo ? (
              <img
                src={selectedLogo}
                alt="logo"
                referrerPolicy="no-referrer"
                style={{
                  maxWidth: appLogoMaxWidth || 300,
                  maxHeight: appLogoMaxHeight || 100,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <span style={{ fontWeight: 600, fontSize: 18 }}>{companyName || "Company Name"}</span>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div style={{ backgroundColor: backgroundColor || "#ffffff" }} className="px-6 py-3">
          <div className="flex items-center gap-0">
            {BRANDING_PREVIEW_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    style={{
                      backgroundColor: i === 0 ? accentColor || "#6366f1" : "transparent",
                      borderColor: accentColor || "#6366f1",
                      color: i === 0 ? "#ffffff" : accentColor || "#6366f1",
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold"
                  >
                    {i + 1}
                  </div>
                  <span style={{ color: accentColor || "#6366f1", fontSize: 10, whiteSpace: "nowrap" }}>{step}</span>
                </div>
                {i < BRANDING_PREVIEW_STEPS.length - 1 && (
                  <div
                    style={{ backgroundColor: accentColor || "#6366f1", opacity: 0.3, height: 2, marginBottom: 18 }}
                    className="flex-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div style={{ backgroundColor: backgroundColor || "#ffffff" }} className="px-6 py-5">
          <p className="mb-4 text-sm font-medium" style={{ color: textColor || "#000000" }}>
            Please complete the fields below.{" "}
            <a href="#" className="underline" style={{ color: linkColor || "#0000EE" }}>
              Need help?
            </a>
          </p>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium" style={{ color: textColor || "#000000" }}>
              Business Name
            </label>
            <input
              readOnly
              value="Acme Corporation"
              style={{
                borderColor: frameColor || "#D1D5DB",
                color: textColor || "#000000",
                backgroundColor: backgroundColor || "#ffffff",
                width: "100%",
              }}
              className="rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium" style={{ color: textColor || "#000000" }}>
              Business Email <span style={{ color: accentColor || "#6366f1", fontSize: 10 }}>← focused</span>
            </label>
            <input
              readOnly
              value="hello@acmecorp.com"
              style={{
                borderColor: accentColor || "#6366f1",
                borderWidth: 2,
                backgroundColor: highlightingColor || "rgba(99,102,241,0.20)",
                color: textColor || "#000000",
                width: "100%",
              }}
              className="rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              label="Next Step"
              style={{
                color: buttonTextPrimary || "#ffffff",
                backgroundColor: primaryColor || "#E5E7EB",
                border: `1px solid ${primaryColor || "#E5E7EB"}`,
              }}
            />
            <Button
              variant="secondary"
              label="Save & Exit"
              className="border-none!"
              style={{
                color: buttonTextSecondary || "#000000",
                backgroundColor: secondaryColor || "#E5E7EB",
                border: `1px solid ${secondaryColor || "#E5E7EB"}`,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ backgroundColor: footerBackground || "#1f2937", color: footerText || "#ffffff" }}
          className="px-6 py-4 text-center text-xs"
        >
          © {new Date().getFullYear()} {companyName || "Company Name"}. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export const EmailTemplatePreview = ({ emailHeader = "", emailFooter = "", emailText, emailBodyColor }) => (
  <div className="rounded-xlp-3 mt-6 md:p-6">
    <h2 className="text-textPrimary text-[18px] font-medium">Email Preview</h2>

    <div className="mt-5 rounded-md p-3 md:p-6">
      <div className="flex w-full flex-col border-4">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailHeader) }} />
        <div
          className={`align-center flex w-full justify-center p-4 md:p-6`}
          style={{ color: emailText, background: emailBodyColor }}
        >
          Email Body will be here ...
        </div>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailFooter) }} />
      </div>
    </div>
  </div>
);

export default Preview;
