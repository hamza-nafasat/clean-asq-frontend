import { ID_MISSION_ROLES, SIGNATURE_KEY } from "@/constants";
import { ID_MISSION_OPTIONAL_KEYS } from "./applicant.constants";

// first + middle + last, else the full name
export const makeCompleteName = (firstName, middleName, lastName, fullName, name) => {
  if (firstName && middleName && lastName) return `${firstName} ${middleName} ${lastName}`;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return fullName || name || "";
};

// DD/MM/YYYY to YYYY-MM-DD
export const toIsoDate = (date) => {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};

// a date that may be DD/MM/YYYY or already ISO
const toSafeIsoDate = (date) => {
  if (!date || typeof date !== "string") return "";
  try {
    if (date.includes("/")) return toIsoDate(date);
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
    return date;
  } catch {
    return "";
  }
};

// map IDMission webhook Form_Data into the details-form shape
export const mapWebhookToIdMissionData = (f, { emailFallback = "", createdAt, verificationStatus } = {}) => ({
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
    value: f?.Expiration_Date ? toSafeIsoDate(f?.Expiration_Date) : "",
  },
  streetAddress: {
    name: "streetAddress",
    value: `${f?.ParsedAddressStreetNumber || ""} ${f?.ParsedAddressStreetName || ""}`.trim(),
  },
  phoneNumber: { name: "phoneNumber", value: f?.PhoneNumber || "" },
  zipCode: { name: "zipCode", value: f?.ParsedAddressPostalCode || "" },
  dateOfBirth: {
    name: "dateOfBirth",
    value: f?.Date_of_Birth ? toSafeIsoDate(f?.Date_of_Birth) : "",
  },
  country: { name: "country", value: f?.Issuing_Country || "" },
  issueDate: {
    name: "issueDate",
    value: f?.Issue_Date ? toSafeIsoDate(f?.Issue_Date) : "",
  },
  companyTitle: { name: "companyTitle", value: "" },
  state: { name: "state", value: f?.ParsedAddressProvince || "" },
  city: { name: "city", value: f?.ParsedAddressMunicipality || "" },
  data: { name: "data", value: f || "null" },
  ...(verificationStatus && { verificationStatus }),
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
    value: ID_MISSION_ROLES.PRIMARY_OPERATOR_AND_CONTROLLER,
  },
  signature: { name: SIGNATURE_KEY, value: { secureUrl: "", publicId: "", resourceType: "" } },
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
  signature: { name: SIGNATURE_KEY, value: saved?.signature?.value || "" },
  roleFillingForCompany: {
    name: "roleFillingForCompany",
    value: saved?.roleFillingForCompany?.value || ID_MISSION_ROLES.PRIMARY_OPERATOR_AND_CONTROLLER,
  },
  ...(saved?.verificationStatus && { verificationStatus: saved.verificationStatus }),
  createdAt: saved?.createdAt || new Date().toISOString(),
  updatedAt: saved?.updatedAt || new Date().toISOString(),
});

export const areIdMissionFieldsFilled = (data) =>
  Object.keys(data).every((name) => {
    if (name === ID_MISSION_OPTIONAL_KEYS.ADDRESS_2) return true;
    if (name === ID_MISSION_OPTIONAL_KEYS.VERIFICATION_STATUS) return true;
    if (name === SIGNATURE_KEY) return data[name]?.value?.secureUrl;
    const val = data[name];
    if (val == null) return false;
    if (typeof val === "string") return val.trim() !== "";
    if (typeof val === "object" && name !== ID_MISSION_OPTIONAL_KEYS.DATA)
      return Object.values(val).every((v) => v?.toString().trim() !== "");
    return true;
  });

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
