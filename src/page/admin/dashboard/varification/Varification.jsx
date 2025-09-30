import { useSearchParams } from 'react-router-dom';
import CompanyVerification from '@/components/admin/varification/CompanyVerification';

function Verification() {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formid');

  return (
    <div>
      <CompanyVerification formId={formId} />
    </div>
  );
}

export default Verification;
