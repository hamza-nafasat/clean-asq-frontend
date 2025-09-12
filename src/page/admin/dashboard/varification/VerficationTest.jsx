import CompanyVerificationTest from '@/components/admin/varification/CompanyVerificationTest';
import { useSearchParams } from 'react-router-dom';

function VerificationTest() {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  return (
    <div>
      <CompanyVerificationTest formId={formId} />
    </div>
  );
}

export default VerificationTest;
