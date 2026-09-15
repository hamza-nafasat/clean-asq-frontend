import CompanyVerificationTest from '../components/TestingCompanyLookup';
import { useSearchParams } from 'react-router-dom';

function VerificationTest() {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formid');
  return (
    <div>
      <CompanyVerificationTest formId={formId} />
    </div>
  );
}

export default VerificationTest;
