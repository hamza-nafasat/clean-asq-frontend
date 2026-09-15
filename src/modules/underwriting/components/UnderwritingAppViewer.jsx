import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";

const UnderwritingAppViewer = ({ data = null }) => {
  const userId = data?.user?._id;
  const pdfId = data?.form?._id;

  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <ApplicationPdfViewCommonProps userId={userId} pdfId={pdfId} className="rounded-lg!" isEditAble={true} />
    </div>
  );
};

export default UnderwritingAppViewer;
