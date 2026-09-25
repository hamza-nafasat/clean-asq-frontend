import { FaSpinner } from "react-icons/fa";
import { useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import { useFormDataWhichUseToCreateFormsQuery } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { SelectInputType } from "@/components/global/DynamicField";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import LoadingState from "@/components/shared/LoadingState";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import ApplicationFormsRuleAiControls from "./ApplicationFormsRuleAiControls";
import ApplicationFormsRuleEmailFields from "./ApplicationFormsRuleEmailFields";
import ApplicationFormsRulePreview from "./ApplicationFormsRulePreview";
import ApplicationFormsRulePromptCheck from "./ApplicationFormsRulePromptCheck";
import useApplicationFormsRuleForm from "../hooks/useApplicationFormsRuleForm";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { RULE_CATEGORIES_FIELD, RULE_FIELDS } from "../utils/applicationForms.constants";
import { hasGeneratedRule } from "../utils/applicationForms.validation.utils";

const ApplicationFormsRuleModal = ({ isOpen = false, onClose, mode = MODAL_MODES.ADD, formId = "", initialData = null }) => {
  const canCreateRule = usePermission(PERMISSIONS.CREATE_RULE);
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);
  const { data: formData, isLoading: isLoadingFormData } = useFormDataWhichUseToCreateFormsQuery(
    { formId },
    { skip: !isOpen || !formId },
  );
  const { data: emailTemplates, isLoading: isLoadingEmailTemplates } = useGetAllEmailTemplatesQuery(undefined, {
    skip: !isOpen || !canReadEmail,
  });
  const form = useApplicationFormsRuleForm({ mode, formId, initialData, onClose });
  const { rule, errors, isEdit, handleChange } = form;

  if (!isOpen) return null;

  const title = isEdit ? "Update Rule" : "Create Rule";

  return (
    <Modal onClose={onClose} title={title}>
      <ConfirmationModal
        isOpen={form.isConfirmOpen}
        onClose={form.closeConfirm}
        onConfirm={form.handleConfirmUpdate}
        isLoading={form.isSaving}
        title="Update Rule"
        message="Save the changes to this rule?"
        confirmButtonText="Update"
      />
      {isLoadingFormData || isLoadingEmailTemplates ? (
        <LoadingState title="Loading rule details" className="flex flex-col items-center gap-4 py-16" />
      ) : (
        <section className="flex w-full flex-col gap-6 p-4">
          {!isEdit && <ApplicationFormsRulePromptCheck formId={formId} />}
          <div className="flex w-full flex-col gap-2">
            <TextField
              label="Rule Name:"
              id={RULE_FIELDS.NAME}
              name={RULE_FIELDS.NAME}
              placeholder="Enter rule name"
              value={rule.name}
              onChange={handleChange}
              error={errors[RULE_FIELDS.NAME]}
            />
            <SelectInputType
              field={RULE_CATEGORIES_FIELD}
              onChange={handleChange}
              form={{ [RULE_FIELDS.CATEGORY]: { name: RULE_FIELDS.CATEGORY, value: rule.category } }}
            />
            {errors[RULE_FIELDS.CATEGORY] && <p className="mt-1 text-sm text-red-600">{errors[RULE_FIELDS.CATEGORY]}</p>}
            <TextField
              label="Prompt:"
              id={RULE_FIELDS.PROMPT}
              name={RULE_FIELDS.PROMPT}
              type="textarea"
              placeholder="Enter prompt for rule creation"
              value={rule.prompt}
              onChange={handleChange}
              error={errors[RULE_FIELDS.PROMPT]}
            />
            {canReadEmail && (
              <ApplicationFormsRuleEmailFields
                emailTemplates={emailTemplates?.data}
                rule={rule}
                errors={errors}
                onChange={handleChange}
              />
            )}
            {canCreateRule && (
              <ApplicationFormsRuleAiControls
                formData={formData?.data}
                isGenerating={form.isGenerating}
                canGenerate={Boolean(rule.prompt && rule.name && rule.category)}
                onGenerate={form.handleGenerate}
              />
            )}
          </div>

          <ApplicationFormsRulePreview {...rule} />
          <footer className="flex w-full justify-end gap-2">
            <Button label="Cancel" variant="secondary" onClick={onClose} />
            <Button
              label={title}
              variant="primary"
              icon={form.isSaving && FaSpinner}
              cnLeft="mr-2 h-4 w-4 animate-spin"
              onClick={form.handleSubmit}
              disabled={form.isSaving || !formId || !hasGeneratedRule(rule)}
            />
          </footer>
        </section>
      )}
    </Modal>
  );
};

export default ApplicationFormsRuleModal;
