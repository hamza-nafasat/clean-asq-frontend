import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useGetSingleSubmitFormQueryQuery } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import Tabs from "@/components/shared/Tabs";
import UnderwritingAnalysis from "./components/UnderwritingAnalysis";
import UnderwritingAppViewer from "./components/UnderwritingAppViewer";
import UnderwritingFormVersions from "./components/UnderwritingFormVersions";
import UnderwritingHistory from "./components/UnderwritingHistory";
import { PERMISSIONS } from "@/utils/permissions";
import {
  UNDERWRITING_FALLBACK_ROUTE,
  UNDERWRITING_TAB_BUTTONS,
  UNDERWRITING_TABS,
} from "./utils/underwriting.constants";

const Underwriting = () => {
  const { applicantId } = useParams();
  const [activeTab, setActiveTab] = useState(UNDERWRITING_TABS.HISTORY);
  const { data: submitFormData } = useGetSingleSubmitFormQueryQuery({ _id: applicantId }, { skip: !applicantId });
  const hasUnderwritingPermission = usePermission(PERMISSIONS.UNDERWRITING);
  if (!hasUnderwritingPermission) return <Navigate to={UNDERWRITING_FALLBACK_ROUTE} />;
  return (
    <div className="bg-backgroundColor rounded-t-md p-4">
      <div className="mb-4">
        {/* Tabs */}
        <Tabs variant="button" tabs={UNDERWRITING_TAB_BUTTONS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {activeTab === UNDERWRITING_TABS.HISTORY && <UnderwritingHistory submittedFormId={applicantId} />}
      {activeTab === UNDERWRITING_TABS.APPLICATION_ANALYSIS && (
        <UnderwritingAnalysis submitFormData={submitFormData?.data} />
      )}
      {activeTab === UNDERWRITING_TABS.APP_VIEWER && <UnderwritingAppViewer data={submitFormData?.data} />}
      {activeTab === UNDERWRITING_TABS.FORM_VERSIONS && (
        <UnderwritingFormVersions submittedFormId={applicantId} submitForm={submitFormData?.data} />
      )}
    </div>
  );
};

export default Underwriting;
