import { useGeneratePdfFormMutation, useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from './shared/small/Button';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export const SubmissionSuccessPage = () => {
  const { formId } = useParams();
  const { user } = useSelector(state => state.auth);
  const [generatePdfForm, { isLoading }] = useGeneratePdfFormMutation();
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId });

  const submissionViewUrl = `/submission`;
  const continueUrl = form?.data?.redirectUrl || '/';

  const handleDownload = async (formId, userId) => {
    try {
      if (!formId || !userId) return toast.error('Unable to download PDF.');
      const blob = await generatePdfForm({ _id: formId, userId }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${formId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log('PDF download failed', err);
      toast.error('PDF download failed.');
    }
  };

  return (
    <div className="bg-background relative flex h-screen w-full flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />

      <h1 className="text-primary mt-4 text-3xl font-semibold">Submission Completed</h1>

      <p className="text-muted-foreground mt-2 max-w-md text-base">
        Your information has been submitted. We will review it and follow up soon.
      </p>

      <div className="text-muted-foreground mt-8 flex flex-col items-center gap-1 text-sm">
        <span>You can now:</span>
      </div>

      <div className="mt-3 flex gap-4">
        <Link to={submissionViewUrl}>
          <Button variant="link" className="text-primary underline-offset-4 hover:underline" label="View Submission" />
        </Link>

        <Button
          disabled={isLoading}
          onClick={() => handleDownload(formId, user?._id)}
          variant="link"
          className="text-primary underline-offset-4 hover:underline"
          label={isLoading ? 'Preparing…' : 'Download PDF'}
        />

        <Link to={continueUrl}>
          <Button variant="link" className="text-primary underline-offset-4 hover:underline" label="Continue to Next" />
        </Link>
      </div>
    </div>
  );
};
