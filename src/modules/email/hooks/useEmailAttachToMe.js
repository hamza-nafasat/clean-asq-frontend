import { useDispatch } from "react-redux";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAttachTemplateToFormMutation } from "@/redux/apis/email.apis";
import { userExist } from "@/redux/slices/auth.slice";
import confirmOrCancel from "@/utils/confirmOrCancel";
import { EMAIL_TEMPLATE_TYPES } from "@/constants";

// ai toggles the attach to me checkbox
const useEmailAttachToMe = ({ templates = [], askConfirm }) => {
  const dispatch = useDispatch();
  const [attachEmailTemplate] = useAttachTemplateToFormMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();

  return async ({ templateId, attachToMe }) => {
    const template = templates.find((t) => String(t._id) === String(templateId));
    if (!template) throw new Error("Template not found");
    if (template.emailType !== EMAIL_TEMPLATE_TYPES.WELCOME) throw new Error("Only a welcome email template can be attached to you");
    await confirmOrCancel(askConfirm, {
      title: "Attach to Me",
      message: attachToMe
        ? `Use "${template.templateName}" as your welcome email? Accounts you create will receive it.`
        : `Stop using "${template.templateName}" as your welcome email?`,
      confirmButtonText: attachToMe ? "Attach" : "Detach",
    });
    await attachEmailTemplate({
      emailTemplateId: template._id,
      formIds: (template.forms || []).map((form) => form._id),
      attachToMe,
    }).unwrap();
    // refresh welcome mail on profile
    const profileRes = await getUserProfile().unwrap();
    if (profileRes?.success) dispatch(userExist(profileRes.data));
  };
};

export default useEmailAttachToMe;
