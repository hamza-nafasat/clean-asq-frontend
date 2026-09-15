import {
  additionalOwnersFields,
  FIELD_FORMATS,
  FIELD_NAMES,
  FIELD_TYPES,
  FORM_BLOCK_TYPE,
  formFieldsStaticKeys,
  ID_MISSION_ROLES,
  OWNER_ROLES,
  SIGNATURE_KEY,
  YES_NO_VALUES,
} from "@/constants";

const MAX_PERCENTAGE = 100;

export const ROLLING_OWNER_SSN_FIELD = {
  label: "What is your Social Security, Tax, or National ID Number?",
  name: FIELD_NAMES.ROLLING_OWNER_SSN,
  uniqueId: FIELD_NAMES.ROLLING_OWNER_SSN,
  required: true,
  aiHelp: false,
  formatting: FIELD_FORMATS.SSN,
  isMasked: false,
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

export const OWNER_ROLE_OPTIONS = [
  { label: "Primary Operator", value: OWNER_ROLES.PRIMARY_OPERATOR },
  { label: "Beneficial Owner", value: OWNER_ROLES.BENEFICIAL_OWNER },
  { label: "Both", value: OWNER_ROLES.BOTH },
];

export const HAVE_DETAIL_OPTIONS = [
  { label: "No", value: YES_NO_VALUES.NO },
  { label: "Yes", value: YES_NO_VALUES.YES },
];

export const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row_${Math.random().toString(36).slice(2)}${Date.now()}`;

export const makeBlankOwner = () =>
  Object.keys(additionalOwnersFields).reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

export const isOwnersBlock = (field) =>
  field.type === FORM_BLOCK_TYPE && field.name === formFieldsStaticKeys.additional_owners_key;

// rolling owner questions shown before the section's own fields
export const buildOwnerFormFields = ({ fields, idMissionRoleValue, isRollingOwner, sectionForm }) => {
  const base = Array.isArray(fields) ? fields : [];

  if (idMissionRoleValue === ID_MISSION_ROLES.PRIMARY_OPERATOR_AND_CONTROLLER || idMissionRoleValue === ID_MISSION_ROLES.BOTH) {
    return isRollingOwner
      ? [ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_IS_OWNER_FIELD, ROLLING_OWNER_PERCENTAGE_FIELD, ...base]
      : [ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_IS_OWNER_FIELD, ...base];
  }
  if (idMissionRoleValue === ID_MISSION_ROLES.PRIMARY_CONTACT) {
    return isRollingOwner
      ? [ROLLING_OWNER_IS_OWNER_FIELD, ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_PERCENTAGE_FIELD, ...base]
      : [ROLLING_OWNER_IS_OWNER_FIELD, ...base];
  }

  // submitted values still render before id mission is loaded
  const extras = [];
  if (sectionForm?.[FIELD_NAMES.ROLLING_OWNER_SSN]) extras.push(ROLLING_OWNER_SSN_FIELD);
  if (sectionForm?.[FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER]) extras.push(ROLLING_OWNER_IS_OWNER_FIELD);
  if (isRollingOwner || sectionForm?.[FIELD_NAMES.ROLLING_OWNER_PERCENTAGE]) extras.push(ROLLING_OWNER_PERCENTAGE_FIELD);
  return extras.length ? [...extras, ...base] : [...base];
};

// initial section values for fields not yet in the form
export const buildInitialOwnersForm = ({ formFields, reduxData, isSignature }) => {
  const initialForm = {};
  formFields.forEach((field) => {
    if (isOwnersBlock(field)) {
      const saved = reduxData?.[field?.uniqueId]?.value;
      initialForm[field.uniqueId] = {
        name: field.name,
        value: Array.isArray(saved) && saved.length ? saved : [makeBlankOwner()],
      };
    } else {
      initialForm[field.uniqueId] = { name: field.name, value: reduxData?.[field?.uniqueId]?.value || "" };
    }
  });

  if (isSignature) {
    const savedSignature = reduxData?.[SIGNATURE_KEY]?.value;
    const existingSignature = {};
    if (savedSignature?.publicId) existingSignature.publicId = savedSignature?.publicId;
    if (savedSignature?.secureUrl) existingSignature.secureUrl = savedSignature?.secureUrl;
    if (savedSignature?.resourceType) existingSignature.resourceType = savedSignature?.resourceType;
    initialForm[SIGNATURE_KEY] = {
      name: SIGNATURE_KEY,
      value: existingSignature?.publicId ? existingSignature : { publicId: "", secureUrl: "", resourceType: "" },
    };
  }
  return initialForm;
};

// keep digits and a dot, clamp to 0-100 and add a percent sign
export const formatOwnershipPercentage = (value) => {
  const raw = value.replace(/[^0-9.]/g, "");
  if (raw === "" || raw === ".") return raw;
  const num = Math.min(MAX_PERCENTAGE, Math.max(0, parseFloat(raw) || 0));
  return raw.endsWith(".") ? `${num}.` : `${num}%`;
};

export const getOwnerValue = (owner, key) => owner?.[key] ?? "";
