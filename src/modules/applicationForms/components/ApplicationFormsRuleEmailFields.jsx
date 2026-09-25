import { SelectInputType } from "@/components/global/DynamicField";
import Checkbox from "@/components/shared/Checkbox";
import { EMAIL_TEMPLATE_TYPES } from "@/constants";
import { RECIPIENT_EMAIL_OPTIONS, RULE_FIELDS } from "../utils/applicationForms.constants";

const ERROR_CLASSES = "mt-1 text-sm text-red-600";

const ApplicationFormsRuleEmailFields = ({ emailTemplates = [], rule = {}, errors = {}, onChange }) => {
  const templateOptions = emailTemplates
    ?.filter((template) => template?.emailType === EMAIL_TEMPLATE_TYPES.RULE_TRIGGERED)
    ?.map((template) => ({ label: template?.templateName, value: template?._id }));

  return (
    <>
      <Checkbox
        id={RULE_FIELDS.IS_EMAIL_SENT_ON}
        name={RULE_FIELDS.IS_EMAIL_SENT_ON}
        label="Send Email"
        checked={Boolean(rule.isEmailSentOn)}
        onChange={(e) => onChange?.({ target: { name: RULE_FIELDS.IS_EMAIL_SENT_ON, value: e.target.checked } })}
      />
      {rule.isEmailSentOn && (
        <>
          <SelectInputType
            field={{
              label: "Receiver's Email",
              options: RECIPIENT_EMAIL_OPTIONS,
              uniqueId: RULE_FIELDS.RECIEVER_EMAIL,
              name: RULE_FIELDS.RECIEVER_EMAIL,
            }}
            onChange={onChange}
            form={{ [RULE_FIELDS.RECIEVER_EMAIL]: { name: RULE_FIELDS.RECIEVER_EMAIL, value: rule.recieverEmail } }}
          />
          {errors[RULE_FIELDS.RECIEVER_EMAIL] && (
            <p className={ERROR_CLASSES}>{errors[RULE_FIELDS.RECIEVER_EMAIL]}</p>
          )}
          <SelectInputType
            field={{
              label: "Email Template",
              options: templateOptions,
              uniqueId: RULE_FIELDS.EMAIL_TEMPLATE_ID,
              name: RULE_FIELDS.EMAIL_TEMPLATE_ID,
            }}
            onChange={onChange}
            form={{
              [RULE_FIELDS.EMAIL_TEMPLATE_ID]: { name: RULE_FIELDS.EMAIL_TEMPLATE_ID, value: rule.emailTemplateId },
            }}
          />
          {errors[RULE_FIELDS.EMAIL_TEMPLATE_ID] && (
            <p className={ERROR_CLASSES}>{errors[RULE_FIELDS.EMAIL_TEMPLATE_ID]}</p>
          )}
        </>
      )}
    </>
  );
};

export default ApplicationFormsRuleEmailFields;
