import { FIELD_TYPES } from "@/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { isSignatureComplete } from "@/utils/signatureShape";
import { COMPANY_OWNERSHIP_TYPES, FIELD_NAMES } from "./applicant.constants";
import { isRequiredValueFilled } from "./applicant.utils8";

// upload a new signature after removing the old one
export const uploadSignatureReplacing = async (file, oldSign) => {
  if (oldSign?.publicId) {
    const deleted = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
    if (!deleted) return { errorMessage: "File Not Deleted Please Try Again" };
  }
  const res = await uploadImageOnCloudinary(file);
  if (!res.publicId || !res.secureUrl || !res.resourceType) return { errorMessage: "File Not Uploaded Please Try Again" };
  return { res };
};

// company information form, prefilled from the draft first, then the lookup data
export const buildCompanyInformationForm = (fields, lookupData, reduxData) => {
  const initialForm = {};
  fields.forEach((field) => {
    const fieldName = field?.name?.trim()?.toLowerCase();
    const lookupItem = lookupData?.find((item) => item?.name?.trim()?.toLowerCase() === fieldName);
    const lookupValue = lookupItem?.result;
    const isDateField = !!lookupItem && lookupItem?.name?.trim()?.toLowerCase()?.includes(FIELD_NAMES.DATE_PART);
    const prefillValue = isDateField
      ? lookupValue
        ? new Date(lookupValue)?.toISOString()?.split("T")?.[0]
        : ""
      : lookupValue;
    initialForm[field.uniqueId] = {
      name: field.name,
      value: reduxData?.[field?.uniqueId]?.value || prefillValue || "",
    };
  });
  return initialForm;
};

export const isCompanyInformationComplete = ({ form, requiredNames, naics, isSignature }) => {
  const allFilled = requiredNames.every(({ uniqueId }) =>
    isRequiredValueFilled(form[uniqueId]?.value, { checkObjects: false }),
  );
  // a public company also needs its stock symbol
  const isStockSymbolDone =
    form?.[FIELD_NAMES.COMPANY_OWNERSHIP_TYPE]?.value !== COMPANY_OWNERSHIP_TYPES.PUBLIC ||
    !!form?.[FIELD_NAMES.STOCK_SYMBOL]?.value;
  const isSignatureDone = !isSignature || isSignatureComplete(form?.signature);
  return allFilled && !!naics && isStockSymbolDone && isSignatureDone;
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
    if (typeof val === "object") return isUploadedFile(val) || Object.values(val).every((v) => v?.toString().trim() !== "");
    return true;
  });
  return allFilled && (!isSignature || isSignatureComplete(form?.signature));
};
