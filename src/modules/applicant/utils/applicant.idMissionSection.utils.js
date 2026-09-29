import { makeCompleteName, toIsoDate } from "./applicant.idMission.utils";

export const buildInitialSectionIdMissionData = (email) => ({
  idMissionName: { name: "idMissionName", value: "" },
  idMissionEmail: { name: "idMissionEmail", value: email },
  idMissionIdNumber: { name: "idMissionIdNumber", value: "" },
  idMissionStreetAddress: { name: "idMissionStreetAddress", value: "" },
  idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: "" },
  idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
  idMissionIssueDate: { name: "idMissionIssueDate", value: "" },
  idMissionIdIssuer: { name: "idMissionIdIssuer", value: "" },
  idMissionIdType: { name: "idMissionIdType", value: "" },
  idMissionIdExpiryDate: { name: "idMissionIdExpiryDate", value: "" },
  idMissionCity: { name: "idMissionCity", value: "" },
  idMissionState: { name: "idMissionState", value: "" },
  idMissionDateOfBirth: { name: "idMissionDateOfBirth", value: "" },
  idMissionZipCode: { name: "idMissionZipCode", value: "" },
  idMissionCountry: { name: "idMissionCountry", value: "" },
  idMissionRoleFillingForCompany: { name: "idMissionRoleFillingForCompany", value: "" },
  idMissionData: { name: "idMissionData", value: "null" },
});

// map a section-level IDMission webhook; the failed and other events keep their original field shapes
export const buildSectionIdMissionData = (
  f,
  { email, createdAt, nameField = "idMissionName", issuerField = "idMissionIdIssuer" },
) => ({
  idMissionName: {
    name: nameField,
    value: makeCompleteName(f?.First_Name, f?.Middle_Name, f?.Last_Name, f?.FullName, f?.Name),
  },
  idMissionEmail: { name: "idMissionEmail", value: f?.Email || email || "" },
  idMissionIdNumber: { name: "idMissionIdNumber", value: f?.ID_Number || "" },
  idMissionIdIssuer: {
    name: issuerField,
    value: f?.ID_State ? f?.ID_State + f?.Issuing_Country : f?.Issuing_Country || "",
  },
  idMissionIdType: { name: "idMissionIdType", value: f?.DocumentType || "" },
  idMissionIdExpiryDate: {
    name: "idMissionIdExpiryDate",
    value: f?.Expiration_Date ? toIsoDate(f?.Expiration_Date) : "",
  },
  idMissionStreetAddress: {
    name: "idMissionStreetAddress",
    value: [f?.ParsedAddressStreetNumber, f?.ParsedAddressStreetName].filter(Boolean).join(" "),
  },
  idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: f?.PhoneNumber || "" },
  idMissionZipCode: { name: "idMissionZipCode", value: f?.ParsedAddressPostalCode || "" },
  idMissionDateOfBirth: {
    name: "idMissionDateOfBirth",
    value: f?.Date_of_Birth ? toIsoDate(f?.Date_of_Birth) : "",
  },
  idMissionCountry: { name: "idMissionCountry", value: f?.Issuing_Country || "" },
  idMissionIssueDate: {
    name: "idMissionIssueDate",
    value: f?.Issue_Date ? toIsoDate(f?.Issue_Date) : "",
  },
  idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
  idMissionState: { name: "idMissionState", value: f?.ParsedAddressProvince || "" },
  idMissionCity: { name: "idMissionCity", value: f?.ParsedAddressMunicipality || "" },
  idMissionData: { name: "idMissionData", value: f || "null" },
  createdAt: createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
