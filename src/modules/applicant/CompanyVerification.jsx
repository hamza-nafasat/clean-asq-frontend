import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useApplyBranding from "@/hooks/useApplyBranding";
import CustomLoading from "@/components/shared/CustomLoading";
import ApplicantCompanyLookup from "./components/ApplicantCompanyLookup";
import { VERIFICATION_PARAMS } from "@/constants";
import { buildApplicationFormPath } from "@/utils/applicationPaths";

const CompanyVerification = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const formId = searchParams.get(VERIFICATION_PARAMS.FORM_ID);
  const brandingName = searchParams.get(VERIFICATION_PARAMS.BRANDING_NAME);
  const draftId = searchParams.get(VERIFICATION_PARAMS.DRAFT_ID);
  const { isApplied } = useApplyBranding({ formId });

  if (!isApplied) return <CustomLoading />;
  if (!user?._id) return <Navigate to={buildApplicationFormPath({ formId, brandingName, draftId })} replace />;
  return <ApplicantCompanyLookup formId={formId} brandingName={brandingName} draftId={draftId} />;
};

export default CompanyVerification;
