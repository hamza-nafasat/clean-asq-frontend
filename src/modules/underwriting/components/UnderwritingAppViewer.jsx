import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";

const UnderwritingAppViewer = ({ data = null }) => {
  const canUpdateApplication = usePermission(PERMISSIONS.UPDATE_APPLICATION);
  const userId = data?.user?._id;
  const pdfId = data?.form?._id;

  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <ApplicationPdfViewCommonProps
        userId={userId}
        pdfId={pdfId}
        className="rounded-lg!"
        isEditAble={canUpdateApplication}
      />
    </div>
  );
};

export default UnderwritingAppViewer;
