import { useApplicantScreenContext } from "./useApplicantScreenContext";
import getEnv from "@/utils/env";
import { findAiFieldEl } from "@/utils/discoverFormFields";
import { buildPageFaqs } from "@/utils/aiHelpContext";
import {
  AI_FIELD_IDS,
  SINGLE_APPLICATION_SCREENS,
  SINGLE_APPLICATION_STAGES,
} from "@/modules/applicant/utils/applicant.constants";

const buildEmailStageFields = (email, otp) => [
  {
    id: AI_FIELD_IDS.EMAIL,
    label: "Email Address",
    type: "email",
    value: email,
    required: true,
    filled: !!email,
    isSignature: false,
  },
  {
    id: AI_FIELD_IDS.OTP,
    label: "OTP Code",
    type: "text",
    value: otp,
    required: true,
    filled: !!otp,
    isSignature: false,
  },
];

// register the email and ID Mission screens with the AI assistant
const useApplicantSingleApplicationAi = ({
  aiStage,
  formRef,
  emailVerified,
  email,
  otp,
  otpSent,
  webLink,
  idMissionDetailsReady,
  idMissionDetailsVisible,
  idMissionVerifiedData,
  isIdMissionProcessing,
  setEmail,
  setOtp,
  idMissionSection,
}) => {
  const isEmailStage = aiStage === SINGLE_APPLICATION_STAGES.EMAIL;

  useApplicantScreenContext(
    {
      screenId: `single-application-${aiStage}`,
      screenName: SINGLE_APPLICATION_SCREENS[aiStage].screenName,
      description: SINGLE_APPLICATION_SCREENS[aiStage].description,
      aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
      formRef: aiStage === SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS ? formRef : null,
      currentState: {
        ...(isEmailStage && { otpSent, fields: buildEmailStageFields(email, otp) }),
        ...(aiStage === SINGLE_APPLICATION_STAGES.IDMISSION_QR && { webLinkAvailable: !!webLink, fields: [] }),
        ...(aiStage === SINGLE_APPLICATION_STAGES.IDMISSION_LOADING && { fields: [] }),
        ...(aiStage === SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS && { pageFaqs: buildPageFaqs(idMissionSection) }),
      },
      actions: {
        scrollToField: ({ fieldId }) => {
          const el = findAiFieldEl(formRef.current, fieldId) || findAiFieldEl(document, fieldId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        ...(isEmailStage && {
          fillField: ({ fieldId, value }) => {
            if (fieldId === AI_FIELD_IDS.EMAIL) setEmail(value);
            else if (fieldId === AI_FIELD_IDS.OTP) setOtp(value);
          },
        }),
      },
      deps: [
        aiStage,
        email,
        otp,
        webLink,
        idMissionDetailsReady,
        idMissionDetailsVisible,
        idMissionVerifiedData,
        isIdMissionProcessing,
      ],
    },
    { clearOnMount: !emailVerified, autoOpen: false },
  );
};

export default useApplicantSingleApplicationAi;
