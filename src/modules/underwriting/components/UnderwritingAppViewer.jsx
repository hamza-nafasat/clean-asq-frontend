import usePermission from "@/hooks/usePermission";
import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import ErrorBoundary from "@/components/global/ErrorBoundary";
import { PERMISSIONS } from "@/utils/permissions";

const UnderwritingAppViewer = ({ submission = null }) => {
  const canUpdateUnderwriting = usePermission(PERMISSIONS.UPDATE_UNDERWRITING);

  return (
    <ErrorBoundary name="UnderwritingApplication">
      <ApplicationPdfViewCommonProps
        userId={submission?.user?._id}
        pdfId={submission?.form?._id}
        initialSubmitData={submission?.submitData}
        submittedFormId={submission?._id}
        className="rounded-lg"
        isEditAble={canUpdateUnderwriting}
      />
    </ErrorBoundary>
  );
};

export default UnderwritingAppViewer;
