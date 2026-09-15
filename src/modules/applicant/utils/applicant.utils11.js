import { additionalOwnersFields, formFieldsStaticKeys } from "@/constants";
import { isSignatureComplete, normalizeSignature } from "@/utils/signatureShape";
import {
  EMAIL_PATTERN,
  FIELD_BLOCK_TYPE,
  FIELD_NAMES,
  OWNER_ROLES,
  ROLE_FILLING_VALUES,
  ROLLING_OWNER_IS_OWNER_FIELD,
  ROLLING_OWNER_PERCENTAGE_FIELD,
  ROLLING_OWNER_SSN_FIELD,
  YES_NO,
} from "./applicant.constants";
import { findFieldKeyByName } from "./applicant.utils3";

const REQUIRED_OWNER_KEYS = ["name", "email", "role", "have_detail"];

export const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row_${Math.random().toString(36).slice(2)}${Date.now()}`;

export const makeBlankOwner = () =>
  Object.keys(additionalOwnersFields).reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

export const isAdditionalOwnersBlock = (field) =>
  field?.type === FIELD_BLOCK_TYPE && field?.name === formFieldsStaticKeys.additional_owners_key;

const isOperatorRole = (roleValue) =>
  roleValue === ROLE_FILLING_VALUES.PRIMARY_OPERATOR_AND_CONTROLLER || roleValue === ROLE_FILLING_VALUES.BOTH;

// rolling-owner questions depend on the role picked in the ID Mission step
export const buildOwnerFormFields = (fields, idMissionRoleValue, isRollingOwner, mustHaveOtherOperators) => {
  const base = (Array.isArray(fields) ? fields : []).map((f) => {
    if (!mustHaveOtherOperators) return f;
    if (!f?.name?.includes(FIELD_NAMES.ADDITIONAL_OWNERS_25_PERCENT)) return f;
    return {
      ...f,
      options: (f.options || []).map((o) => (o.value === YES_NO.NO ? { ...o, disabled: true } : o)),
    };
  });
  if (isOperatorRole(idMissionRoleValue)) {
    return isRollingOwner
      ? [ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_IS_OWNER_FIELD, ROLLING_OWNER_PERCENTAGE_FIELD, ...base]
      : [ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_IS_OWNER_FIELD, ...base];
  }
  if (idMissionRoleValue === ROLE_FILLING_VALUES.PRIMARY_CONTACT) {
    return isRollingOwner
      ? [ROLLING_OWNER_IS_OWNER_FIELD, ROLLING_OWNER_SSN_FIELD, ROLLING_OWNER_PERCENTAGE_FIELD, ...base]
      : [ROLLING_OWNER_IS_OWNER_FIELD, ...base];
  }
  return [...base];
};

export const buildOwnersInitialForm = (formFields, reduxData, isSignature) => {
  const initialForm = {};
  formFields.forEach((field) => {
    if (isAdditionalOwnersBlock(field)) {
      const saved = reduxData?.[field?.uniqueId]?.value;
      initialForm[field.uniqueId] = {
        name: field.name,
        value: Array.isArray(saved) && saved.length ? saved : [makeBlankOwner()],
      };
    } else {
      initialForm[field.uniqueId] = { name: field.name, value: reduxData?.[field?.uniqueId]?.value || "" };
    }
  });
  if (isSignature) initialForm.signature = normalizeSignature(reduxData?.signature);
  return initialForm;
};

// first hydrate takes everything, later only keys are added or removed
export const mergeFormShape = (prev, initialForm) => {
  if (!prev || Object.keys(prev).length === 0) return initialForm;
  const toAdd = Object.fromEntries(Object.entries(initialForm).filter(([key]) => !(key in prev)));
  const toRemoveKeys = Object.keys(prev).filter((key) => !(key in initialForm));
  if (Object.keys(toAdd).length === 0 && toRemoveKeys.length === 0) return prev;
  const cleaned = Object.fromEntries(Object.entries(prev).filter(([key]) => !toRemoveKeys.includes(key)));
  return { ...cleaned, ...toAdd };
};

const isOwnerComplete = (owner) => REQUIRED_OWNER_KEYS.every((key) => String(owner?.[key] ?? "").trim() !== "");

export const getOwnersValidation = ({ form, owners, requiredNames, isSignature, idMissionRoleValue }) => {
  const get25Key = findFieldKeyByName(form, FIELD_NAMES.ADDITIONAL_OWNERS_25_PERCENT);
  const hasOwnersWith25 = get25Key ? form?.[get25Key]?.value === YES_NO.YES : false;
  const rollingOwnerKey = findFieldKeyByName(form, FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER);
  const isApplicantAlsoOwner = rollingOwnerKey ? form?.[rollingOwnerKey]?.value === YES_NO.YES : false;

  const allFilled = requiredNames.every(({ uniqueId }) => {
    const val = form[uniqueId]?.value;
    if (val == null) return false;
    if (typeof val === "string") return val.trim() !== "";
    return true;
  });
  const isSignatureDone = !isSignature || isSignatureComplete(form?.signature);
  const areOwnersComplete = !hasOwnersWith25 || owners.every(isOwnerComplete);
  const isEmailValidated =
    !hasOwnersWith25 || !owners.length || owners.every((o) => EMAIL_PATTERN.test(String(o?.email ?? "").toLowerCase()));
  // an added owner counts as operator only by role; no recorded role falls back to the applicant answer
  const hasOperatorOwner = owners.some((o) => [OWNER_ROLES.PRIMARY_OPERATOR, OWNER_ROLES.BOTH].includes(o?.role ?? ""));
  const isOperatorExist =
    (hasOwnersWith25 && hasOperatorOwner) ||
    isOperatorRole(idMissionRoleValue) ||
    (!idMissionRoleValue && isApplicantAlsoOwner);

  if (!allFilled || !isSignatureDone || !areOwnersComplete)
    return { isValid: false, message: "Some Required Fields are Missing" };
  if (!isEmailValidated) return { isValid: false, message: "A valid email is required for every owner" };
  if (!isOperatorExist) return { isValid: false, message: "At least one primary operator required" };
  return { isValid: true, message: "" };
};
