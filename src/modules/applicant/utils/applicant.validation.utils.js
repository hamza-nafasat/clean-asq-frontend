import { EMAIL_FORMAT, FIELD_TYPES } from "@/constants";
import { isSignatureComplete } from "@/utils/signatureShape";

// a required value counts as filled when strings, arrays and nested values are non-empty
export const isRequiredValueFilled = (val, { checkObjects = true } = {}) => {
  if (val == null) return false;
  if (typeof val === "string") return val.trim() !== "";
  if (Array.isArray(val))
    return (
      val.length > 0 &&
      val.every((item) =>
        typeof item === "object"
          ? Object.values(item).every((v) => v?.toString().trim() !== "")
          : item?.toString().trim() !== "",
      )
    );
  if (checkObjects && typeof val === "object") return Object.values(val).every((v) => v?.toString().trim() !== "");
  return true;
};

export const isCompanyInformationComplete = ({ form, requiredNames, naics, isSignature }) => {
  const allFilled = requiredNames.every(({ uniqueId }) =>
    isRequiredValueFilled(form[uniqueId]?.value, { checkObjects: false }),
  );
  const isSignatureDone = !isSignature || isSignatureComplete(form?.signature);
  return allFilled && !!naics && isSignatureDone;
};

const isUploadedFile = (val) => !!(val?.publicId && val?.secureUrl);

export const isCustomSectionValueFilled = (val, type) => {
  if (val == null) return false;
  if (type === FIELD_TYPES.FILE) return val?.file instanceof File || isUploadedFile(val);
  if (typeof val === "object" && !Array.isArray(val) && isUploadedFile(val)) return true;
  return isRequiredValueFilled(val);
};

export const areDocumentsComplete = ({ form, requiredNames, hasNewFile, isSignature }) => {
  const allFilled = requiredNames.every(({ uniqueId, type }) => {
    if (type === FIELD_TYPES.FILE) return hasNewFile || isUploadedFile(form?.[uniqueId]?.value || form?.[uniqueId]);
    const val = form[uniqueId]?.value;
    if (val == null) return false;
    if (typeof val === "string") return val.trim() !== "";
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object")
      return isUploadedFile(val) || Object.values(val).every((v) => v?.toString().trim() !== "");
    return true;
  });
  return allFilled && (!isSignature || isSignatureComplete(form?.signature));
};

export const validateEmail = (email) => (EMAIL_FORMAT.test(String(email).trim()) ? "" : "Enter a valid email");

// errors for the company name and website fields
export const validateCompanyLookup = ({ name, url }) => {
  const errors = {};
  if (!name.trim()) errors.name = "Enter the company name";
  if (!url.trim()) errors.url = "Enter the company website";
  return errors;
};

// a filled field whose follow-up fields are filled too
const isServiceFilled = (form, uniqueId) => {
  const value = form[uniqueId]?.value;
  if (!value || (typeof value === "string" && !value.trim())) return false;
  return Object.keys(form)
    .filter((key) => key.includes(`${uniqueId}/`))
    .every((key) => {
      const innerValue = form[key]?.value ?? form[key];
      return innerValue != null && !(typeof innerValue === "string" && !innerValue.trim());
    });
};

// every required field, or at least one when none are required
export const isProcessingInfoComplete = ({ form, fields, isSignature }) => {
  const requiredIds = fields.filter((f) => f.required).map((f) => f.uniqueId);
  const isFilled = requiredIds.length
    ? requiredIds.every((uniqueId) => isServiceFilled(form, uniqueId))
    : fields.some((f) => isServiceFilled(form, f.uniqueId));
  return isFilled && (!isSignature || isSignatureComplete(form?.signature));
};
