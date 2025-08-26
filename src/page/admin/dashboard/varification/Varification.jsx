import CompanyVerification from '@/components/admin/varification/CompanyVerification';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

function Verification() {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  return (
    <div>
      <CompanyVerification formId={formId} />
    </div>
  );
}

export default Verification;
