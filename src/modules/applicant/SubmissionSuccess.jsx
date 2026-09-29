import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiCheckCircle } from "react-icons/fi";
import { useGeneratePdfFormMutation, useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import { LAYOUT_ROUTES, SUBMISSION_SUCCESS_PARAMS, URL_PREFIXES } from "@/constants";
import downloadBlob from "@/utils/downloadBlob";

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get(SUBMISSION_SUCCESS_PARAMS.SUBMISSION_ID);
  const { user } = useSelector((state) => state.auth);
  const [generatePdfForm, { isLoading }] = useGeneratePdfFormMutation();
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId });
  const continueUrl = form?.data?.redirectUrl || LAYOUT_ROUTES.HOME;

  const handleDownload = async () => {
    if (!formId || !user?._id) return toast.error("Unable to download PDF.");
    try {
      const blob = await generatePdfForm({ _id: formId, userId: user._id, submissionId }).unwrap();
      downloadBlob(blob, `form-${formId}.pdf`);
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error("PDF download failed.");
    }
  };

  // the form's own site opens outside the app
  const handleFinish = () => {
    if (continueUrl.startsWith(URL_PREFIXES.HTTP)) window.location.assign(continueUrl);
    else navigate(continueUrl);
  };

  return (
    <article className="bg-background relative flex h-screen w-full flex-col items-center justify-center px-4 text-center">
      <FiCheckCircle size={64} className="shrink-0 text-green-500" aria-hidden="true" />
      <h1 className="text-primary mt-4 text-3xl font-semibold">Submission Completed</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-base">
        Your information has been submitted. We will review it and follow up soon.
      </p>
      <p className="text-muted-foreground mt-8 text-sm">You can now:</p>
      <div className="mt-3 flex gap-4">
        <Button
          disabled={isLoading}
          onClick={handleDownload}
          variant="link"
          className="text-primary underline-offset-4 hover:underline"
          label={isLoading ? "Preparing…" : "Download PDF"}
        />
        <Button
          onClick={handleFinish}
          variant="link"
          className="text-primary underline-offset-4 hover:underline"
          label="I’m finished"
        />
      </div>
    </article>
  );
};

export default SubmissionSuccess;
