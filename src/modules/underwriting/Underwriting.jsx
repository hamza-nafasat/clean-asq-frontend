import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetSingleFormQueryQuery, useGetSingleSubmitFormQueryQuery } from "@/redux/apis/form.apis";
import { FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import useUnderwritingApplyRules from "./hooks/useUnderwritingApplyRules";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import Tabs from "@/components/shared/Tabs";
import UnderwritingAnalysis from "./components/UnderwritingAnalysis";
import UnderwritingAppViewer from "./components/UnderwritingAppViewer";
import UnderwritingApplyRulesModal from "./components/UnderwritingApplyRulesModal";
import UnderwritingFormVersions from "./components/UnderwritingFormVersions";
import UnderwritingHeading from "./components/UnderwritingHeading";
import UnderwritingHistory from "./components/UnderwritingHistory";
import { HTTP_STATUSES } from "@/constants";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  UNDERWRITING_AI_CHAT_PATH,
  UNDERWRITING_SCREEN_CONTEXT,
  UNDERWRITING_TAB_BUTTONS,
  UNDERWRITING_TABS,
} from "./utils/underwriting.constants";
import { buildUnderwritingAssistantActions, buildUnderwritingScreenState } from "./utils/underwriting.assistant.utils";
import { buildSectionNames } from "./utils/underwriting.utils";

const SERVER_URL = getEnv("SERVER_URL");

const Underwriting = () => {
  const { submissionId } = useParams();
  const [activeTab, setActiveTab] = useState(UNDERWRITING_TABS.HISTORY);
  const { data, isLoading, isError, error, refetch } = useGetSingleSubmitFormQueryQuery(
    { _id: submissionId },
    { skip: !submissionId },
  );
  const submission = data?.data;
  const { data: form } = useGetSingleFormQueryQuery({ _id: submission?.form?._id }, { skip: !submission?.form?._id });
  const canApplyRules = usePermission(PERMISSIONS.APPLY_UNDERWRITING_RULES);
  const { requestApplyRules, isBusy, modalProps } = useUnderwritingApplyRules(submissionId);
  const sectionNames = buildSectionNames(form?.data?.sections);

  useScreenContext({
    ...UNDERWRITING_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${UNDERWRITING_AI_CHAT_PATH}`,
    currentState: buildUnderwritingScreenState({ submission }),
    actions: buildUnderwritingAssistantActions({ requestApplyRules }),
  });

  const handleApplyRules = async () => {
    try {
      await requestApplyRules();
    } catch (previewError) {
      console.error("Preview rules error:", previewError);
      toast.error(previewError?.data?.message || "Could not check the rules");
    }
  };

  if (isLoading) return <LoadingState title="Loading application" />;
  if (isError || !submission)
    return (
      <EmptyState
        variant="panel"
        icon={<FiAlertCircle size={28} />}
        title={error?.status === HTTP_STATUSES.NOT_FOUND ? "Application not found" : "Could not load this application"}
      >
        {error?.status !== HTTP_STATUSES.NOT_FOUND && <Button type="button" label="Try again" onClick={refetch} />}
      </EmptyState>
    );

  return (
    <article className="bg-backgroundColor rounded-t-md p-4 md:p-6" data-testid="underwriting-page">
      <UnderwritingHeading submission={submission} />
      <div className="mb-5">
        <Tabs variant="button" tabs={UNDERWRITING_TAB_BUTTONS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === UNDERWRITING_TABS.HISTORY && (
        <UnderwritingHistory submissionId={submissionId} sectionNames={sectionNames} />
      )}
      {activeTab === UNDERWRITING_TABS.APPLICATION_ANALYSIS && (
        <UnderwritingAnalysis
          submission={submission}
          canApplyRules={canApplyRules}
          isBusy={isBusy}
          onApplyRules={handleApplyRules}
        />
      )}
      {activeTab === UNDERWRITING_TABS.APP_VIEWER && <UnderwritingAppViewer submission={submission} />}
      {activeTab === UNDERWRITING_TABS.FORM_VERSIONS && (
        <UnderwritingFormVersions submissionId={submissionId} submission={submission} sectionNames={sectionNames} />
      )}

      <UnderwritingApplyRulesModal {...modalProps} />
    </article>
  );
};

export default Underwriting;
