import { useState } from "react";

import useBranding from "@/hooks/useBranding";
import DocumentModal from "@/components/modals/DocumentModal";
import { renderFooterText } from "@/utils/footerWildcards";

const DEFAULT_FOOTER_PADDING = 16;
const DEFAULT_FOOTER_TEXT_SIZE = 16;
const FOOTER_LINK_CLASSES = "text-footer-text hover:text-secondary cursor-pointer bg-transparent border-0 p-0 text-sm";

const Footer = () => {
  const {
    applicationFooterText,
    applicationFooterTextSize,
    appFooterPadding,
    privacyPolicyUrl,
    termsOfServiceUrl,
    name,
  } = useBranding();

  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div
        className="bg-footer flex w-full shrink-0 items-center justify-between gap-4 rounded-t-md border-t-2 px-4 shadow md:px-4 xl:px-20"
        style={{
          paddingTop: `${appFooterPadding ?? DEFAULT_FOOTER_PADDING}px`,
          paddingBottom: `${appFooterPadding ?? DEFAULT_FOOTER_PADDING}px`,
        }}
      >
        {/* Footer text */}
        <div
          className="text-footer-text font-semibold"
          style={{ fontSize: `${applicationFooterTextSize || DEFAULT_FOOTER_TEXT_SIZE}px` }}
        >
          {renderFooterText(applicationFooterText, name)}
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-end gap-4 md:gap-2">
          {privacyPolicyUrl && (
            <button
              type="button"
              data-testid="footer-privacy-link"
              onClick={() => setOpenDoc({ url: privacyPolicyUrl, title: "Privacy Policy" })}
              className={FOOTER_LINK_CLASSES}
            >
              Privacy Policy
            </button>
          )}
          {termsOfServiceUrl && (
            <button
              type="button"
              data-testid="footer-tos-link"
              onClick={() => setOpenDoc({ url: termsOfServiceUrl, title: "Terms of Service" })}
              className={FOOTER_LINK_CLASSES}
            >
              Terms of Service
            </button>
          )}
        </div>
      </div>

      {openDoc && <DocumentModal url={openDoc.url} title={openDoc.title} onClose={() => setOpenDoc(null)} />}
    </>
  );
};

export default Footer;
