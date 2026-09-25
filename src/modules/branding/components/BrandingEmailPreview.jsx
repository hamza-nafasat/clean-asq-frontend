import { sanitizeHtml } from "@/lib/sanitizeHtml";

const BrandingEmailPreview = ({ emailHeader = "", emailFooter = "", emailText, emailBodyColor }) => (
  <div className="mt-6 rounded-xl p-3 md:p-6">
    <h2 className="text-textPrimary text-[18px] font-medium">Email Preview</h2>

    <div className="mt-5 rounded-md p-3 md:p-6">
      <div className="flex w-full flex-col border-4">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailHeader) }} />
        <p className="flex w-full justify-center p-4 md:p-6" style={{ color: emailText, background: emailBodyColor }}>
          Email Body will be here ...
        </p>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailFooter) }} />
      </div>
    </div>
  </div>
);

export default BrandingEmailPreview;
