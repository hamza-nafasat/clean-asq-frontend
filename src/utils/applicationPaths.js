import { LAYOUT_ROUTES, STEPPER_PARAMS, SUBMISSION_SUCCESS_PARAMS, VERIFICATION_PARAMS } from "@/constants";

// "?name=value" for the values that are set
const buildQuery = (params) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value)).toString();
  return query ? `?${query}` : "";
};

export const buildVerificationPath = ({ formId, brandingName, draftId }) =>
  `${LAYOUT_ROUTES.VERIFICATION}${buildQuery({
    [VERIFICATION_PARAMS.FORM_ID]: formId,
    [VERIFICATION_PARAMS.BRANDING_NAME]: brandingName,
    [VERIFICATION_PARAMS.DRAFT_ID]: draftId,
  })}`;

export const buildApplicationFormPath = ({ formId, brandingName, draftId }) =>
  `${LAYOUT_ROUTES.APPLICATION_FORM}/${encodeURIComponent(brandingName)}/${formId}${buildQuery({
    [VERIFICATION_PARAMS.DRAFT_ID]: draftId,
  })}`;

export const buildStepperPath = ({ formId, draftId }) =>
  `${LAYOUT_ROUTES.STEPPER}/${formId}${buildQuery({ [STEPPER_PARAMS.DRAFT_ID]: draftId })}`;

export const buildSubmissionSuccessPath = ({ formId, submissionId }) =>
  `${LAYOUT_ROUTES.SUBMISSION_SUCCESS}/${formId}${buildQuery({
    [SUBMISSION_SUCCESS_PARAMS.SUBMISSION_ID]: submissionId,
  })}`;
