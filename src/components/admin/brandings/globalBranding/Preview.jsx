import Button from "@/components/shared/small/Button";
import { setCompanyName } from "@/redux/slices/brandingSlice";
import { detectLogo } from "@/utils/detectLogo";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const STEPS = ["Business Info", "Owners", "Documents", "Review"];

const Preview = ({
  primaryColor,
  companyName,
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
}) => {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    dispatch(setCompanyName(companyName));
    if (selectedLogo) {
      detectLogo(selectedLogo).then((res) => {
        console.log("res", res);
      });
    }
  }, [companyName, dispatch, selectedLogo]);

  const logoJustify = headerAlignment === "right" ? "flex-end" : headerAlignment === "center" ? "center" : "flex-start";

  const domain = window.location.hostname;
  const companySlug = (companyName || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const previewUrl = `https://${domain}/${companySlug || "company-name"}`;

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
                style={{ maxHeight: 48, maxWidth: 180, objectFit: "contain" }}
              />
            ) : (
              <span style={{ fontWeight: 600, fontSize: 18 }}>{companyName || "Company Name"}</span>
            )}
          </div>
        </div>

        {/* Stepper — inherits form background color */}
        <div style={{ backgroundColor: backgroundColor || "#ffffff" }} className="px-6 py-3">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => (
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
                {i < STEPS.length - 1 && (
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

          {/* Normal field */}
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

          {/* Highlighted field */}
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

          {/* Buttons */}
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

export const EmailTemplatePreview = ({ emailHeader, emailFooter, emailText, emailBodyColor }) => {
  return (
    <div className="rounded-xlp-3 mt-6 md:p-6">
      <h2 className="text-textPrimary text-[18px] font-medium">Email Preview</h2>

      <div className="mt-5 rounded-md p-3 md:p-6">
        <div className="flex w-full flex-col border-4">
          {/* Render processed HTML */}
          <div dangerouslySetInnerHTML={{ __html: emailHeader }} />
          <div
            className={`align-center flex w-full justify-center p-4 md:p-6`}
            style={{ color: emailText, background: emailBodyColor }}
          >
            Email Body will be here ...
          </div>
          <div dangerouslySetInnerHTML={{ __html: emailFooter }} />
        </div>
      </div>
    </div>
  );
};

export default Preview;
