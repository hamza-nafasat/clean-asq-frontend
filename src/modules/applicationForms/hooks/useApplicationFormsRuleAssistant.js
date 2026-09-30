import { useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import {
  useCreateFormRuleMutation,
  useDeleteSingleFormRuleMutation,
  useFormDataWhichUseToCreateFormsQuery,
  useGetFormRuleFromAiMutation,
  useGetSingleFormQueryQuery,
  useUpdateRulesOrderMutation,
  useUpdateSingleFormRuleMutation,
  useUpdateStatusSingleFormRuleMutation,
} from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { RULE_AI_CHAT_PATH, RULE_SCREEN_CONTEXT } from "../utils/applicationForms.ruleAssistant.constants";
import { buildRuleAssistantActions, buildRuleScreenState } from "../utils/applicationForms.ruleAssistant.utils";

const SERVER_URL = getEnv("SERVER_URL");

// registers the manage rules assistant
const useApplicationFormsRuleAssistant = ({ formId, rules = [] }) => {
  const aiConfirm = useConfirm();
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);

  const { data: formData } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const { data: sampleData } = useFormDataWhichUseToCreateFormsQuery({ formId }, { skip: !formId });
  const { data: emailTemplateData } = useGetAllEmailTemplatesQuery(undefined, { skip: !canReadEmail });
  const [createRule] = useCreateFormRuleMutation();
  const [getRuleFromAi] = useGetFormRuleFromAiMutation();
  const [updateRule] = useUpdateSingleFormRuleMutation();
  const [updateStatusRule] = useUpdateStatusSingleFormRuleMutation();
  const [updateRulesOrder] = useUpdateRulesOrderMutation();
  const [deleteRule] = useDeleteSingleFormRuleMutation();

  useScreenContext({
    ...RULE_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${RULE_AI_CHAT_PATH}`,
    currentState: buildRuleScreenState({
      formId,
      form: formData?.data,
      rules,
      emailTemplates: canReadEmail ? (emailTemplateData?.data ?? []) : null,
      sampleData: sampleData?.data,
    }),
    actions: buildRuleAssistantActions({
      formId,
      rules,
      canReadEmail,
      askConfirm: aiConfirm.ask,
      mutations: { createRule, getRuleFromAi, updateRule, updateStatusRule, updateRulesOrder, deleteRule },
    }),
  });

  return aiConfirm;
};

export default useApplicationFormsRuleAssistant;
