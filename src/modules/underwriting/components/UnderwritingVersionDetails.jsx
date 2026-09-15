import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";

const UnderwritingVersionDetails = ({ selectedVersion = null, submitForm = null }) => {
  const userId = submitForm?.user?._id || submitForm?.user;
  const pdfId = submitForm?.form?._id || submitForm?.form || selectedVersion?.form?._id;
  const initialSubmitData = selectedVersion?.snapshot?.submitData;

  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <ApplicationPdfViewCommonProps
        userId={userId}
        pdfId={pdfId}
        initialSubmitData={initialSubmitData}
        submittedFormId={submitForm?._id}
        className="rounded-lg!"
      />
    </div>
  );
};

export default UnderwritingVersionDetails;
