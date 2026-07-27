import DocumentModal from "@/components/shared/DocumentModal";
import { useBranding } from "@/hooks/BrandingContext";
import { useState } from "react";

function Footer() {
  const { applicationFooterText, applicationFooterTextSize, appFooterPadding, privacyPolicyUrl, termsOfServiceUrl } =
    useBranding();

  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div
        className="bg-footer flex w-full shrink-0 items-center justify-between gap-4 rounded-t-md border-t-2 px-4 shadow md:px-4 xl:px-20"
        style={{
          paddingTop: `${appFooterPadding ?? 16}px`,
          paddingBottom: `${appFooterPadding ?? 16}px`,
        }}
      >
        {/* Footer text */}
        <div className="text-footer-text font-semibold" style={{ fontSize: `${applicationFooterTextSize || 16}px` }}>
          {(applicationFooterText || "").replace("{year}", new Date().getFullYear())}
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-end gap-4 md:gap-2">
          {privacyPolicyUrl && (
            <button
              type="button"
              data-testid="footer-privacy-link"
              onClick={() => setOpenDoc({ url: privacyPolicyUrl, title: "Privacy Policy" })}
              className="text-footer-text hover:text-secondary cursor-pointer bg-transparent border-0 p-0 text-sm"
            >
              Privacy Policy
            </button>
          )}
          {termsOfServiceUrl && (
            <button
              type="button"
              data-testid="footer-tos-link"
              onClick={() => setOpenDoc({ url: termsOfServiceUrl, title: "Terms of Service" })}
              className="text-footer-text hover:text-secondary cursor-pointer bg-transparent border-0 p-0 text-sm"
            >
              Terms of Service
            </button>
          )}
        </div>
      </div>

      {openDoc && <DocumentModal url={openDoc.url} title={openDoc.title} onClose={() => setOpenDoc(null)} />}
    </>
  );
}

export default Footer;
