import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import {
  useCheckFormRuleFromAiMutation,
  useCreateFormRuleMutation,
  useFormDataWhichUseToCreateFormsQuery,
  useGetFormRuleFromAiMutation,
  useUpdateSingleFormRuleMutation,
} from "@/redux/apis/form.apis";
import { SelectInputType } from "@/components/global/DynamicField";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import TextField from "@/components/shared/TextField";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import ApplicationFormsRuleAiControls from "./ApplicationFormsRuleAiControls";
import ApplicationFormsRuleEmailFields from "./ApplicationFormsRuleEmailFields";
import ApplicationFormsRulePreview from "./ApplicationFormsRulePreview";
import { RULE_CATEGORIES_FIELD, RULE_RECIPIENTS } from "../utils/applicationForms.constants";

const SPINNER_CLASSES = "mr-2 w-4 h-4 animate-spin";

const hasRuleDetails = (rule) =>
  !!(
    rule.prompt &&
    rule.name &&
    rule.handler &&
    rule.formula &&
    rule.example &&
    rule.explanation &&
    rule.category &&
    rule.order
  );

// every field filled and email settings complete
const isRuleComplete = (rule) =>
  hasRuleDetails(rule) &&
  !!String(rule.isEmailSentOn) &&
  !(rule.isEmailSentOn && !(rule.recieverEmail && rule.emailTemplateId));

const ApplicationFormsRuleCategoryField = ({ category = "", onChange }) => (
  <SelectInputType
    field={RULE_CATEGORIES_FIELD}
    onChange={(e) => onChange?.(e.target.value)}
    form={{ category: { name: "category", value: category } }}
  />
);

const CreateRuleModal = ({ formId, setModal, refetch }) => {
  const [promptForCheck, setPromptForCheck] = useState("");
  const [rule, setRule] = useState({
    prompt: "",
    name: "",
    category: "",
    order: "",
    handler: "",
    formula: "",
    example: "",
    explanation: "",
  });
  const [isEmailSentOn, setIsEmailSentOn] = useState(false);
  const [recieverEmail, setRecieverEmail] = useState(RULE_RECIPIENTS.APPLICANT);
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [canCreateFormRule, setCanCreateFormRule] = useState({
    canCreate: null,
    message: "",
  });
  const [createRule, { isLoading: isCreatingRule }] = useCreateFormRuleMutation();
  const [getFormRuleFromAi, { isLoading: isGettingFormRuleFromAi }] = useGetFormRuleFromAiMutation();
  const [checkFormRuleFromAi, { isLoading: isCheckingFormRuleFromAi }] = useCheckFormRuleFromAiMutation();
  const { data: formData, isLoading: isLoadingFormData } = useFormDataWhichUseToCreateFormsQuery({ formId });
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);
  const { data: emailTemplates, isLoading: isLoadingEmailTemplates } = useGetAllEmailTemplatesQuery(undefined, {
    skip: !canReadEmail,
  });

  const updateRule = (name, value) => setRule((prev) => ({ ...prev, [name]: value }));

  const handleCreateRule = async () => {
    try {
      const data = {
        formId,
        ...rule,
        isEmailSentOn: String(isEmailSentOn),
        recieverEmail,
        emailTemplateId,
      };
      if (
        !formId ||
        !isRuleComplete({
          ...rule,
          isEmailSentOn,
          recieverEmail,
          emailTemplateId,
        })
      ) {
        return toast.error("Please fill all the fields");
      }
      const res = await createRule(data).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Rule created successfully");
        await refetch?.();
        setModal?.(false);
      }
    } catch (error) {
      console.error("Create rule error:", error);
      toast.error(error?.data?.message || "Failed to create rule");
    }
  };

  const handleGetRuleFromAi = async () => {
    try {
      const { prompt, name, category } = rule;
      if (!formId || !prompt || !name || !category) return toast.error("Please fill all the fields");
      const res = await getFormRuleFromAi({
        formId,
        prompt,
        name,
        category,
      }).unwrap();
      if (res?.success) {
        const { name: aiName, handler, formula, example, explanation, order } = res?.data || {};
        setRule((prev) => ({
          ...prev,
          name: aiName,
          handler,
          formula,
          example,
          explanation,
          order,
        }));
      }
    } catch (error) {
      console.error("Get form rule from ai error:", error);
      toast.error(error?.data?.message || "Failed to get form rule from ai");
    }
  };

  const handleCheckPrompt = async () => {
    try {
      if (!promptForCheck) return toast.error("Please fill all the fields");
      const res = await checkFormRuleFromAi({
        formId,
        prompt: promptForCheck,
      }).unwrap();
      if (res?.success) {
        setCanCreateFormRule((prev) => ({
          ...prev,
          canCreate: res?.data?.canCreate,
          message: res?.data?.message,
        }));
      }
    } catch (error) {
      console.error("Check form rule from ai error:", error);
    }
  };

  if (isLoadingFormData || isLoadingEmailTemplates) return <CustomLoading />;

  return (
    <div className="flex items-center w-full justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h3 className="text-center text-2xl font-semibold text-gray-800">Create Rule</h3>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex item-center justify-center gap-2">
            <TextField
              label="Prompt for Check:"
              id="prompt-for-check"
              placeholder="Enter prompt for check"
              value={promptForCheck}
              onChange={(e) => setPromptForCheck(e.target.value)}
            />
            <Button
              label="Check"
              variant="primary"
              className="h-12! self-end"
              onClick={handleCheckPrompt}
              disabled={!promptForCheck || isCheckingFormRuleFromAi}
              icon={isCheckingFormRuleFromAi && FaSpinner}
              cnLeft={SPINNER_CLASSES}
            />
          </div>
          {canCreateFormRule.canCreate !== null && (
            <div className="flex flex-col gap-2">
              <p className={`text-sm ${canCreateFormRule.canCreate ? "text-green-700" : "text-red-500"}`}>
                {canCreateFormRule.message}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <TextField
            label="Rule Name:"
            id="rule-name"
            placeholder="Enter rule name"
            value={rule.name}
            onChange={(e) => updateRule("name", e.target.value)}
          />
          <ApplicationFormsRuleCategoryField
            category={rule.category}
            onChange={(value) => updateRule("category", value)}
          />
          <TextField
            label="Prompt:"
            id="prompt"
            type="textarea"
            placeholder="Enter prompt for rule creation"
            value={rule.prompt}
            onChange={(e) => updateRule("prompt", e.target.value)}
          />
          {canReadEmail && (
            <ApplicationFormsRuleEmailFields
              emailTemplates={emailTemplates?.data}
              isEmailSentOn={isEmailSentOn}
              setIsEmailSentOn={setIsEmailSentOn}
              recieverEmail={recieverEmail}
              setRecieverEmail={setRecieverEmail}
              emailTemplateId={emailTemplateId}
              setEmailTemplateId={setEmailTemplateId}
            />
          )}
          <ApplicationFormsRuleAiControls
            formData={formData?.data}
            isGenerating={isGettingFormRuleFromAi}
            canGenerate={!!(rule.prompt && rule.name && rule.category)}
            onGenerate={handleGetRuleFromAi}
          />
        </div>

        <ApplicationFormsRulePreview {...rule} />
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal?.(false)} />
          <Button
            label="Create Rule"
            variant="primary"
            icon={isCreatingRule && FaSpinner}
            cnLeft={SPINNER_CLASSES}
            onClick={handleCreateRule}
            disabled={isCreatingRule || !formId || !hasRuleDetails(rule)}
          />
        </div>
      </div>
    </div>
  );
};

const UpdateRuleModal = ({ ruleData = null, setModal, refetch }) => {
  const [rule, setRule] = useState({
    prompt: ruleData?.prompt,
    name: ruleData?.name,
    category: ruleData?.category,
    order: ruleData?.order,
    handler: ruleData?.handler,
    formula: ruleData?.formula,
    example: ruleData?.example,
    explanation: ruleData?.explanation,
  });
  const [emailTemplateId, setEmailTemplateId] = useState(ruleData?.emailTemplateId);
  const [isEmailSentOn, setIsEmailSentOn] = useState(ruleData?.isEmailSentOn);
  const [recieverEmail, setRecieverEmail] = useState(ruleData?.recieverEmail);
  const [updateRuleMutation, { isLoading: isUpdatingRule }] = useUpdateSingleFormRuleMutation();
  const canCreateRule = usePermission(PERMISSIONS.CREATE_RULE);
  const [getFormRuleFromAi, { isLoading: isGettingFormRuleFromAi }] = useGetFormRuleFromAiMutation();
  const { data: formData, isLoading: isLoadingFormData } = useFormDataWhichUseToCreateFormsQuery({
    formId: ruleData?.formId,
  });
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);
  const { data: emailTemplates, isLoading: isLoadingEmailTemplates } = useGetAllEmailTemplatesQuery(undefined, {
    skip: !canReadEmail,
  });

  const updateRule = (name, value) => setRule((prev) => ({ ...prev, [name]: value }));

  const handleUpdateRule = async () => {
    try {
      const data = {
        formId: ruleData?.formId,
        ...rule,
        isEmailSentOn: String(isEmailSentOn),
        recieverEmail,
        emailTemplateId,
      };
      if (
        !ruleData?._id ||
        !isRuleComplete({
          ...rule,
          isEmailSentOn,
          recieverEmail,
          emailTemplateId,
        })
      ) {
        return toast.error("Please fill all the fields");
      }
      const res = await updateRuleMutation({
        data,
        ruleId: ruleData?._id,
      }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Rule updated successfully");
        await refetch?.();
        setModal?.(false);
      }
    } catch (error) {
      console.error("Update rule error:", error);
      toast.error(error?.data?.message || "Failed to update rule");
    }
  };

  const handleGetRuleFromAi = async () => {
    try {
      const { prompt, name, category, order } = rule;
      if (!ruleData?.formId || !prompt || !name || !category) return toast.error("Please fill all the fields");
      const res = await getFormRuleFromAi({
        formId: ruleData?.formId,
        prompt,
        name,
        category,
        order,
      }).unwrap();
      if (res?.success) {
        const { name: aiName, handler, formula, example, explanation, category: aiCategory } = res?.data || {};
        setRule((prev) => ({
          ...prev,
          name: aiName,
          handler,
          formula,
          example,
          explanation,
          category: aiCategory,
        }));
      }
    } catch (error) {
      console.error("Get form rule from ai error:", error);
      toast.error(error?.data?.message || "Failed to get form rule from ai");
    }
  };

  if (isLoadingFormData || isLoadingEmailTemplates) return <CustomLoading />;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-2xl font-semibold text-gray-800">Update Rule</h3>
        <div className="flex flex-col gap-2 w-full">
          <TextField
            label="Rule Name:*"
            id="rule-name"
            placeholder="Enter rule name"
            value={rule.name}
            onChange={(e) => updateRule("name", e.target.value)}
          />
          <ApplicationFormsRuleCategoryField
            category={rule.category}
            onChange={(value) => updateRule("category", value)}
          />
          <TextField
            label="Prompt"
            id="prompt"
            type="textarea"
            placeholder="Enter prompt for rule creation"
            value={rule.prompt}
            onChange={(e) => updateRule("prompt", e.target.value)}
          />
          {canReadEmail && (
            <ApplicationFormsRuleEmailFields
              emailTemplates={emailTemplates?.data}
              isEmailSentOn={isEmailSentOn}
              setIsEmailSentOn={setIsEmailSentOn}
              recieverEmail={recieverEmail}
              setRecieverEmail={setRecieverEmail}
              emailTemplateId={emailTemplateId}
              setEmailTemplateId={setEmailTemplateId}
            />
          )}
          {canCreateRule && (
            <ApplicationFormsRuleAiControls
              formData={formData?.data}
              isGenerating={isGettingFormRuleFromAi}
              canGenerate={!!(rule.prompt && rule.name && rule.category)}
              onGenerate={handleGetRuleFromAi}
            />
          )}
        </div>

        <ApplicationFormsRulePreview {...rule} />
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal?.(false)} />
          <Button
            label="Update Rule"
            variant="primary"
            icon={isUpdatingRule && FaSpinner}
            cnLeft={SPINNER_CLASSES}
            onClick={handleUpdateRule}
            disabled={isUpdatingRule || !ruleData?._id || !hasRuleDetails(rule)}
          />
        </div>
      </div>
    </div>
  );
};

export { CreateRuleModal, UpdateRuleModal };
