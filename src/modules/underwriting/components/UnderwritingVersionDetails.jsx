import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import ErrorBoundary from "@/components/global/ErrorBoundary";

const UnderwritingVersionDetails = ({ version = null, submission = null }) => (
  <ErrorBoundary name="UnderwritingVersionDetails">
    <ApplicationPdfViewCommonProps
      userId={submission?.user?._id ?? submission?.user}
      pdfId={submission?.form?._id ?? version?.form?._id}
      initialSubmitData={version?.snapshot?.submitData}
      submittedFormId={submission?._id}
      className="rounded-lg"
    />
  </ErrorBoundary>
);

export default UnderwritingVersionDetails;
