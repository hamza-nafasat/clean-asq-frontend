import {
  FIELD_FORMATS,
  FIELD_NAMES,
  FIELD_TYPES,
  ID_DETAIL_FIELDS,
  SECTION_TITLES,
  STATE_SUGGESTIONS,
  YES_NO_VALUES,
} from "@/constants";
import { ID_TYPE_SUGGESTIONS, MAJOR_CITIES } from "./applicant.data";

// section titles that map to a renderable stepper step
export const RENDERABLE_SECTION_TITLES = [
  SECTION_TITLES.COMPANY_INFORMATION,
  SECTION_TITLES.BENEFICIAL,
  SECTION_TITLES.BANK_ACCOUNT_INFO,
  SECTION_TITLES.AVG_TRANSACTIONS,
  SECTION_TITLES.INCORPORATION_ARTICLE,
  SECTION_TITLES.CUSTOM_SECTION,
  SECTION_TITLES.AGREEMENT,
];

export const SECTION_KEYS = {
  ID_MISSION: "idMission",
  METADATA: "metadata",
  COMPANY_INFORMATION: "company_information",
  COMPANY_HAS_NO_WEBSITE: "company_has_no_website",
};

// parts of field names matched with includes()
export const FIELD_NAME_PARTS = {
  DATE: "date",
  ARTICLE_URLS: "article_of_incorporation_urls",
};

export const COMPANY_VERIFICATION_STATUSES = {
  UNVERIFIED: "unverified",
};

export const LOOKUP_SOURCE_KEY_PART = "source";
export const LOOKUP_NOT_FOUND = "Not found";

export const BANK_FIELD_KINDS = {
  ROUTING: "routing",
  ACCOUNT: "account",
};

// input types never reached with the enter key
export const ENTER_SKIPPED_INPUT_TYPES = [FIELD_TYPES.RADIO, "hidden", FIELD_TYPES.FILE, "button", "submit"];

export const ID_MISSION_SOCKET_EVENTS = {
  PROCESSING_STARTED: "idMission_processing_started",
  VERIFIED: "idMission_verified",
  FAILED: "idMission_failed",
  OTHER: "idMission_other",
};

export const ID_MISSION_VERIFICATION_RESULTS = {
  FAILED: "failed",
  REJECTED: "rejected",
};

// server message for a missing draft
export const DRAFT_NOT_FOUND_MESSAGE = "Form Not Saved in draft";
export const QR_FETCH_TIMEOUT_MS = 10000;

// used when the block message has no minutes
export const OTP_BLOCK_FALLBACK_MINUTES = 1;

export const MAX_BENEFICIAL_OWNERS = 10;

export const SINGLE_APPLICATION_STAGES = {
  EMAIL: "email",
  IDMISSION_QR: "idmission-qr",
  IDMISSION_LOADING: "idmission-loading",
  IDMISSION_DETAILS: "idmission-details",
};

export const SINGLE_APPLICATION_SCREENS = {
  [SINGLE_APPLICATION_STAGES.EMAIL]: {
    screenName: "Email Verification",
    description:
      "The applicant must verify their email address. They enter their email, receive a one-time passcode (OTP), and enter it to confirm.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_QR]: {
    screenName: "Identity Verification — QR Code",
    description:
      "The applicant scans a QR code (or uses a web link) with their phone to complete photo ID verification through IDMission. No form fields to fill at this step. If they cannot scan, they can click 'Enter ID Details Manually' to type their ID details instead.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_LOADING]: {
    screenName: "Identity Verification — Loading Details",
    description:
      "Identity verification data is loading. Wait until personal details appear before confirming pre-filled values.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS]: {
    screenName: "Identity Verification — Personal Details",
    description:
      'The applicant completes their personal details and adds their signature to proceed. Some fields may already be filled from identity verification — present those pre-filled values to the applicant for confirmation before moving on to empty fields. For the roleFillingForCompany field, valid values are: "both" (operator and primary contact), "primaryContact" (primary contact only), or "primaryOperatorAndController" (C-level executive or owner). Present these as readable choices to the applicant.',
  },
};

export const AI_FIELD_IDS = {
  EMAIL: "email-field",
  OTP: "otp-field",
};

export const ADDRESS_AUTOCOMPLETE_OPTIONS = {
  types: ["address"],
  fields: ["address_components", "geometry", "formatted_address", "place_id"],
};

export const OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS = { types: ["address"], fields: ["formatted_address"] };

// page-only extras for id fields
const ID_DETAIL_FIELD_EXTRAS = {
  idType: { suggestions: ID_TYPE_SUGGESTIONS },
  idIssuer: { suggestions: STATE_SUGGESTIONS },
  idNumber: { hasEmptyFallback: true },
  streetAddress: { hasEmptyFallback: true, isAddressLookup: true },
  address2: { hasEmptyFallback: true },
  city: { suggestions: MAJOR_CITIES, hasEmptyFallback: true },
  zipCode: { hasEmptyFallback: true },
  state: { hasEmptyFallback: true },
  country: { hasEmptyFallback: true },
  companyTitle: { hasEmptyFallback: true },
  phoneNumber: { hasEmptyFallback: true },
};

// details form fields in render order; hasEmptyFallback keeps the original `|| ""` value
export const ID_MISSION_DETAIL_FIELDS = ID_DETAIL_FIELDS.map((field) => ({
  ...field,
  ...ID_DETAIL_FIELD_EXTRAS[field.name],
}));

// fields of the details form that must not block Continue
export const ID_MISSION_OPTIONAL_KEYS = {
  ADDRESS_2: "address2",
  DATA: "data",
  VERIFICATION_STATUS: "verificationStatus",
};

export const ROLLING_OWNER_SSN_FIELD = {
  label: "What is your Social Security, Tax, or National ID Number?",
  name: FIELD_NAMES.ROLLING_OWNER_SSN,
  uniqueId: FIELD_NAMES.ROLLING_OWNER_SSN,
  required: true,
  aiHelp: false,
  formatting: FIELD_FORMATS.SSN,
  isMasked: true,
  type: FIELD_TYPES.TEXT,
};

export const ROLLING_OWNER_IS_OWNER_FIELD = {
  label: "Are you a company owner holding 25% or more of the company?",
  name: FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER,
  uniqueId: FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER,
  required: true,
  aiHelp: false,
  type: FIELD_TYPES.RADIO,
  options: [
    { label: "Yes", value: YES_NO_VALUES.YES },
    { label: "No", value: YES_NO_VALUES.NO },
  ],
};

export const ROLLING_OWNER_PERCENTAGE_FIELD = {
  label: "What is you percentage of ownership?",
  name: FIELD_NAMES.ROLLING_OWNER_PERCENTAGE,
  uniqueId: FIELD_NAMES.ROLLING_OWNER_PERCENTAGE,
  required: true,
  aiHelp: false,
  type: FIELD_TYPES.RANGE,
};

export const NAICS_INPUT_ID = "naics-code";
export const NAICS_SUGGESTIONS_FLIP_SPACE = 350;

export const BANK_LOOKUP_ERROR_MESSAGE =
  "we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.";

export const DEFAULT_HEADER_TEXT_SIZE = 24;
export const DEFAULT_HEADER_FOOTER = { headerText: "", footerText: "All rights reserved" };

// field types rendered by ApplicantSectionField with their own input
export const SECTION_FIELD_INPUT_TYPES = [
  FIELD_TYPES.SELECT,
  FIELD_TYPES.MULTI_CHECKBOX,
  FIELD_TYPES.FILE,
  FIELD_TYPES.RADIO,
  FIELD_TYPES.RANGE,
  FIELD_TYPES.CHECKBOX,
];

// customize modal for a normal section or the owners section
export const CUSTOMIZE_VARIANTS = {
  FIELD: "field",
  OWNER: "owner",
};

export const SINGLE_APPLICATION_MODALS = {
  OTP_TEXT: "otpText",
  ID_MISSION_DATA_TEXT: "idMissionDataText",
  ID_MISSION_SECTION_TEXT: "idMissionSectionText",
  SIGNATURE: "signature",
  SIGNATURE_HELP: "signatureHelp",
};
