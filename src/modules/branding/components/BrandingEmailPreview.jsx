import { sanitizeHtml } from "@/lib/sanitizeHtml";

// header and footer html fill the column, like the sent email
const SECTION_CLASS = "[&>*]:box-border [&>*]:w-full! [&>*]:max-w-full! [&_img]:max-w-full";

const BrandingEmailPreview = ({ emailHeader = "", emailFooter = "", emailText, emailBodyColor }) => (
  <section className="mt-6 rounded-xl p-3 md:p-6">
    <h2 className="text-textPrimary text-[18px] font-medium">Email Preview</h2>

    <div className="mt-5 flex w-full flex-col overflow-hidden rounded-md border border-gray-200">
      <div className={SECTION_CLASS} dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailHeader) }} />
      <p className="px-4 py-6 text-center wrap-break-word" style={{ color: emailText, background: emailBodyColor }}>
        Email Body will be here ...
      </p>
      <div className={SECTION_CLASS} dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailFooter) }} />
    </div>
  </section>
);

export default BrandingEmailPreview;
