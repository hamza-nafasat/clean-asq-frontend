import { useScreenContext } from "@/hooks/useScreenContext";
import {
  EMAIL_SCREEN_IDS,
  EMAIL_SCREEN_STATES,
  TEMPLATE_KEYWORDS,
  TEMPLATE_MODAL_MODES,
} from "../utils/email.constants";
import getEnv from "@/utils/env";

const EDITOR_GREETING = (templateName) =>
  `Hi! I can see you have **${templateName || "a template"}** open.\n\nI can help you:\n- **Draft** or rewrite the subject line and body\n- **Proofread and enhance** the existing content\n- **Reformat** for clarity and professionalism\n- **Insert variables** like {{recipientName}} or {{link}} where appropriate\n\nWhat would you like me to do?`;

const LIST_GREETING =
  "Hi! I'm your email template assistant.\n\nI can help you:\n- **Draft** new email templates from scratch\n- **Proofread and enhance** existing content\n- **Reformat** templates for clarity and professionalism\n\nTo get started, please **open or create an email template** using the list below — I'll be ready to help once you do!";

// forms of a template as id + name
const toFormRefs = (forms = []) => forms.map((form) => ({ _id: form._id, name: form.name }));

// register the email templates screen with the ai chat widget
const useEmailScreenContext = ({ user, templates = [], forms = [], openTemplate, modalMode, values, actions }) => {
  const openTemplateId = openTemplate?._id;
  const isModalOpen = Boolean(modalMode);
  const liveOpenTemplate = templates.find((template) => template._id === openTemplateId);
  const screenState = !isModalOpen
    ? EMAIL_SCREEN_STATES.LIST
    : openTemplateId
      ? EMAIL_SCREEN_STATES.EDIT
      : EMAIL_SCREEN_STATES.CREATE;

  const screenId = !isModalOpen
    ? EMAIL_SCREEN_IDS.LIST
    : openTemplateId
      ? `${EMAIL_SCREEN_IDS.TEMPLATE_PREFIX}${openTemplateId}`
      : EMAIL_SCREEN_IDS.NEW;

  const screenName = !isModalOpen
    ? "Email Templates"
    : openTemplateId
      ? `Email Template — ${values.templateName || "Untitled"}`
      : "Email Template (New)";

  useScreenContext({
    screenId,
    screenName,
    assistantName: "Email Composition Assistant",
    description:
      "The Email Templates screen lets admins create and edit transactional email templates used throughout the onboarding platform. Templates support placeholder variables for personalisation.",
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/email-chat`,
    greeting: isModalOpen ? EDITOR_GREETING(values.templateName) : LIST_GREETING,
    currentState: {
      screenState,
      templateName: values.templateName,
      emailType: values.emailType,
      subject: values.subject,
      body: values.body,
      isReadOnly: modalMode === TEMPLATE_MODAL_MODES.VIEW,
      availableVariables: TEMPLATE_KEYWORDS.map((keyword) => `{{${keyword}}}`).join(", "),
      templates: templates.map((template) => ({
        _id: template._id,
        templateName: template.templateName,
        emailType: template.emailType,
        subject: template.subject,
        attachedForms: toFormRefs(template.forms),
        isAttachedToMe: user?.welcomeMail === template._id,
      })),
      // from the live query so it updates after attach
      attachedForms: toFormRefs(liveOpenTemplate?.forms),
      availableForms: toFormRefs(forms),
    },
    actions,
    deps: {
      viewModalOpen: isModalOpen,
      viewModalDataId: openTemplateId,
      subject: values.subject,
      body: values.body,
      templateName: values.templateName,
      templatesCount: templates.length,
      attachedFormCount: liveOpenTemplate?.forms?.length ?? 0,
    },
  });
};

export default useEmailScreenContext;
