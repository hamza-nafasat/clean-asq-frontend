import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useApplyRulesOnFormMutation, useGetSingleSubmitFormQueryQuery } from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Tabs from "@/components/shared/Tabs";
import UnderwritingAnalysis from "./components/UnderwritingAnalysis";
import UnderwritingAppViewer from "./components/UnderwritingAppViewer";
import UnderwritingFormVersions from "./components/UnderwritingFormVersions";
import UnderwritingHistory from "./components/UnderwritingHistory";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  UNDERWRITING_FALLBACK_ROUTE,
  UNDERWRITING_SCREEN_CONTEXT,
  UNDERWRITING_TAB_BUTTONS,
  UNDERWRITING_TABS,
} from "./utils/underwriting.constants";
import { buildUnderwritingAssistantActions, buildUnderwritingScreenState } from "./utils/underwriting.assistant.utils";
import { getRulesCacheKey } from "./utils/underwriting.utils";

const SERVER_URL = getEnv("SERVER_URL");

const Underwriting = () => {
  const { applicantId } = useParams();
  const aiConfirm = useConfirm();
  const [activeTab, setActiveTab] = useState(UNDERWRITING_TABS.HISTORY);
  const { data: submitFormData } = useGetSingleSubmitFormQueryQuery({ _id: applicantId }, { skip: !applicantId });
  const [applyRulesOnForm, { data: rulesData }] = useApplyRulesOnFormMutation({
    fixedCacheKey: getRulesCacheKey(applicantId),
  });
  const hasUnderwritingPermission = usePermission(PERMISSIONS.UNDERWRITING);

  useScreenContext({
    ...UNDERWRITING_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/underwriting-chat`,
    currentState: buildUnderwritingScreenState({ submission: submitFormData?.data, ruleResults: rulesData?.data }),
    actions: buildUnderwritingAssistantActions({
      submittedFormId: applicantId,
      applyRulesOnForm,
      askConfirm: aiConfirm.ask,
    }),
    deps: { submission: submitFormData?.data, rulesData },
  });

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

      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
      />
    </div>
  );
};

export default Underwriting;
