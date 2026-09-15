import { useSearchParams } from "react-router-dom";
import TestingCompanyLookup from "./components/TestingCompanyLookup";
import { VERIFICATION_FORM_ID_PARAM } from "./utils/testing.constants";

const VerificationTest = () => {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get(VERIFICATION_FORM_ID_PARAM);

  return (
    <div>
      <TestingCompanyLookup formId={formId} />
    </div>
  );
};

export default VerificationTest;
