import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export const SubmissionSuccessPage = () => {
  const { formId } = useParams();
  const [seconds, setSeconds] = useState(3);
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId });

  useEffect(() => {
    if (seconds === 0 && form?.data?.redirectUrl) {
      window.location.href = form.data.redirectUrl;
      return;
    }
    const timer = setTimeout(() => setSeconds(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, form?.data?.redirectUrl]);

  return (
    <div className="bg-background relative flex h-screen w-full flex-col items-center justify-center text-center">
      {/* Timer in top-right */}
      <div className="bg-muted text-muted-foreground absolute top-4 right-4 rounded-full px-3 py-1 text-sm shadow">
        Redirecting in <span className="font-semibold">{seconds}</span>s
      </div>

      {/* Success Icon */}
      <CheckCircle2 className="h-16 w-16 text-green-500" />

      {/* Messages */}
      <h1 className="text-primary mt-4 text-3xl font-bold">Thank you for your submission!</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-lg">
        We have received your request and our team is reviewing it. You’ll get the result shortly.
      </p>
    </div>
  );
};
