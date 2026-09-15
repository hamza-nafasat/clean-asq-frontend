import { SelectInputType } from "@/components/global/DynamicField";
import Checkbox from "@/components/shared/Checkbox";
import { EMAIL_TEMPLATE_TYPES } from "@/constants";
import { RECIPIENT_EMAIL_OPTIONS } from "../utils/application-forms.constants";

const ApplicationFormsRuleEmailFields = ({
  emailTemplates = [],
  isEmailSentOn = false,
  setIsEmailSentOn,
  recieverEmail = "",
  setRecieverEmail,
  emailTemplateId = "",
  setEmailTemplateId,
}) => {
  const templateOptions = emailTemplates
    ?.filter((template) => template?.emailType === EMAIL_TEMPLATE_TYPES.RULE_TRIGGERED)
    ?.map((template) => ({
      label: template?.templateName,
      value: template?._id,
    }));

  return (
    <>
      <Checkbox
        id="isEmailSentOn"
        name="isEmailSentOn"
        label="Send Email"
        checked={isEmailSentOn}
        onChange={() => setIsEmailSentOn?.((prev) => !prev)}
      />
      {isEmailSentOn && (
        <>
          <SelectInputType
            field={{
              label: "Reciever's Email:",
              options: RECIPIENT_EMAIL_OPTIONS,
              uniqueId: "recieverEmail",
            }}
            onChange={(e) => setRecieverEmail?.(e.target.value)}
            form={{
              recieverEmail: { name: "recieverEmail", value: recieverEmail },
            }}
          />
          <SelectInputType
            field={{
              label: "Email Template:",
              options: templateOptions,
              uniqueId: "emailTemplateId",
            }}
            onChange={(e) => setEmailTemplateId?.(e.target.value)}
            form={{
              emailTemplateId: {
                name: "emailTemplateId",
                value: emailTemplateId,
              },
            }}
          />
        </>
      )}
    </>
  );
};

export default ApplicationFormsRuleEmailFields;
