import CompanyVerification from '@/components/admin/varification/CompanyVerification';
import CustomLoading from '@/components/shared/small/CustomLoading';
import useApplyBranding from '@/hooks/useApplyBranding';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Verification() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formid') || searchParams.get('formId');
  const brandingName = searchParams.get('brandingName');
  const draftId = searchParams.get('draftId');
  const { isApplied } = useApplyBranding({ formId });
  if (!isApplied) return <CustomLoading />;
  if (!user?._id)
    return navigate(`/application-form/${brandingName}/${formId}${draftId ? `?draftId=${draftId}` : ''}`);
  return (
    <div>
      <CompanyVerification formId={formId} brandingName={brandingName} draftId={draftId} />
    </div>
  );
}

export default Verification;
