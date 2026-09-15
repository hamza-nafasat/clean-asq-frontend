import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { FIELD_NAMES, ID_MISSION_OPTIONAL_KEYS, ROLE_FILLING_VALUES } from "./applicant.constants";
import { formatData, makeCompleteName } from "./applicant.utils2";

// normalize a date that may be DD/MM/YYYY or already ISO
export const safeFormatData = (date) => {
  if (!date || typeof date !== "string") return "";
  try {
    if (date.includes("/")) return formatData(date);
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
    return date;
  } catch {
    return "";
  }
};

// map IDMission webhook Form_Data into the details-form shape
export const mapWebhookToIdMissionData = (f, { emailFallback = "", createdAt } = {}) => ({
  name: {
    name: "name",
    value: makeCompleteName(f?.First_Name, f?.Middle_Name, f?.Last_Name, f?.FullName, f?.Name),
  },
  email: { name: "email", value: f?.Email || emailFallback || "" },
  idNumber: { name: "idNumber", value: f?.ID_Number || "" },
  idIssuer: {
    name: "idIssuer",
    value: f?.ID_State ? f?.ID_State + f?.Issuing_Country : f?.Issuing_Country || "",
  },
  idType: { name: "idType", value: f?.DocumentType || "" },
  idExpiryDate: {
    name: "idExpiryDate",
    value: f?.Expiration_Date ? safeFormatData(f?.Expiration_Date) : "",
  },
  streetAddress: {
    name: "streetAddress",
    value: `${f?.ParsedAddressStreetNumber || ""} ${f?.ParsedAddressStreetName || ""}`.trim(),
  },
  phoneNumber: { name: "phoneNumber", value: f?.PhoneNumber || "" },
  zipCode: { name: "zipCode", value: f?.ParsedAddressPostalCode || "" },
  dateOfBirth: {
    name: "dateOfBirth",
    value: f?.Date_of_Birth ? safeFormatData(f?.Date_of_Birth) : "",
  },
  country: { name: "country", value: f?.Issuing_Country || "" },
  issueDate: {
    name: "issueDate",
    value: f?.Issue_Date ? safeFormatData(f?.Issue_Date) : "",
  },
  companyTitle: { name: "companyTitle", value: "" },
  state: { name: "state", value: f?.ParsedAddressProvince || "" },
  city: { name: "city", value: f?.ParsedAddressMunicipality || "" },
  data: { name: "data", value: f || "null" },
  createdAt: createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const hasUsableIdMissionData = (mapped) => !!(mapped?.name?.value || mapped?.idNumber?.value);

export const buildInitialIdMissionData = (email) => ({
  name: { name: "name", value: "" },
  email: { value: email },
  idNumber: { name: "idNumber", value: "" },
  streetAddress: { name: "streetAddress", value: "" },
  phoneNumber: { name: "phoneNumber", value: "" },
  companyTitle: { name: "companyTitle", value: "" },
  issueDate: { name: "issueDate", value: "" },
  idIssuer: { name: "idIssuer", value: "" },
  idType: { name: "idType", value: "" },
  idExpiryDate: { name: "idExpiryDate", value: "" },
  city: { name: "city", value: "" },
  state: { value: "" },
  dateOfBirth: { name: "dateOfBirth", value: "" },
  zipCode: { name: "zipCode", value: "" },
  country: { name: "country", value: "" },
  roleFillingForCompany: {
    name: "roleFillingForCompany",
    value: ROLE_FILLING_VALUES.PRIMARY_OPERATOR_AND_CONTROLLER,
  },
  signature: { name: "signature", value: { secureUrl: "", publicId: "", resourceType: "" } },
  data: { name: "data", value: "null" },
});

// rebuild the details form from a saved draft entry
export const buildIdMissionDataFromDraft = (saved, email, { includeAddress2 = false } = {}) => ({
  name: { name: "name", value: saved?.name?.value || "" },
  email: { name: "email", value: email },
  idNumber: { name: "idNumber", value: saved?.idNumber?.value || "" },
  idIssuer: { name: "idIssuer", value: saved?.idIssuer?.value || "" },
  idType: { name: "idType", value: saved?.idType?.value || "" },
  idExpiryDate: { name: "idExpiryDate", value: saved?.idExpiryDate?.value || "" },
  streetAddress: { name: "streetAddress", value: saved?.streetAddress?.value || "" },
  ...(includeAddress2 && { address2: { name: "address2", value: saved?.address2?.value || "" } }),
  phoneNumber: { name: "phoneNumber", value: saved?.phoneNumber?.value || "" },
  zipCode: { name: "zipCode", value: saved?.zipCode?.value || "" },
  dateOfBirth: { name: "dateOfBirth", value: saved?.dateOfBirth?.value || "" },
  country: { name: "country", value: saved?.country?.value || "" },
  issueDate: { name: "issueDate", value: saved?.issueDate?.value || "" },
  companyTitle: { name: "companyTitle", value: saved?.companyTitle?.value || "" },
  state: { name: "state", value: saved?.state?.value || "" },
  city: { name: "city", value: saved?.city?.value || "" },
  signature: { name: "signature", value: saved?.signature?.value || "" },
  roleFillingForCompany: {
    name: "roleFillingForCompany",
    value: saved?.roleFillingForCompany?.value || ROLE_FILLING_VALUES.PRIMARY_OPERATOR_AND_CONTROLLER,
  },
  createdAt: saved?.createdAt || new Date().toISOString(),
  updatedAt: saved?.updatedAt || new Date().toISOString(),
});

export const areIdMissionFieldsFilled = (data) =>
  Object.keys(data).every((name) => {
    if (name === ID_MISSION_OPTIONAL_KEYS.ADDRESS_2) return true;
    if (name === FIELD_NAMES.SIGNATURE) return data[name]?.value?.secureUrl;
    const val = data[name];
    if (val == null) return false;
    if (typeof val === "string") return val.trim() !== "";
    if (typeof val === "object" && name !== ID_MISSION_OPTIONAL_KEYS.DATA)
      return Object.values(val).every((v) => v?.toString().trim() !== "");
    return true;
  });

// upload a new ID Mission signature after removing the old one
export const uploadIdMissionSignature = async (file, oldSignature) => {
  if (oldSignature?.publicId || oldSignature?.secureUrl) {
    await deleteImageFromCloudinary(oldSignature?.publicId, oldSignature?.resourceType);
  }
  const { secureUrl, publicId, resourceType } = await uploadImageOnCloudinary(file);
  if (!secureUrl || !publicId) return null;
  return { secureUrl, publicId, resourceType };
};

// signature display text, form level first, then the section
export const getIdMissionSignDisplayHtml = (formDocument, section) =>
  formDocument?.idMissionSignDisplayFormatedText ||
  formDocument?.idMissionSignDisplayText ||
  section?.signDisplayFormattedText ||
  section?.signDisplayText;

// split the IDMission full name into profile name parts
export const splitIdMissionName = (f) => {
  if (f.FullName?.split(" ").length > 2) {
    return {
      firstName: f?.First_Name || f?.FullName?.split(" ")?.[0] || "",
      middleName: f?.Middle_Name || f?.FullName?.split(" ")?.[1] || "",
      lastName: f?.Last_Name || f?.FullName?.split(" ")?.[2] || "",
    };
  }
  return {
    firstName: f?.First_Name || f?.FullName?.split(" ")?.[0] || "",
    middleName: "",
    lastName: f?.Last_Name || f?.FullName?.split(" ")?.[1] || "",
  };
};
