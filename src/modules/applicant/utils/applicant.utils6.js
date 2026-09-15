import { KEYBOARD_KEYS } from "./applicant.constants";
import { formatData, makeCompleteName } from "./applicant.utils2";

const LINK_TAG = /<a(\s+.*?)?>/g;

// open every link in a new tab
export const withLinkTargets = (html) =>
  String(html || "").replace(LINK_TAG, (match) => {
    if (match.includes("target=")) return match;
    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
  });

// drop vw padding and width before adding link targets
export const formatOtpDisplayHtml = (html) =>
  withLinkTargets(
    String(html || "")
      .replace(/padding:\s*0\s*[\d.]+vw;?/g, "padding: 0;")
      .replace(/width:\s*[\d.]+vw;?/g, "width: 100%;"),
  );

export const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildVerificationPath = (formId, brandingName, draftId) =>
  `/verification?formid=${formId}&brandingName=${brandingName}${draftId ? `&draftId=${draftId}` : ""}`;

export const buildStepperPath = (formId, draftId) =>
  `/singleform/stepper/${formId}${draftId ? `?draftId=${draftId}` : ""}`;

export const buildApplicationFormPath = (brandingName, formId, draftId) =>
  `/application-form/${brandingName}/${formId}${draftId ? `?draftId=${draftId}` : ""}`;

export const buildSubmissionSuccessPath = (formId) => "/submited-successfully/" + formId;

// label + value rows of the ID Mission details form for the page download
export const collectIdMissionFieldRows = (container) => {
  if (!container) return [];
  const rows = [];
  container.querySelectorAll("input:not([type=hidden]):not([type=file]), select, textarea").forEach((el) => {
    const value = el.value?.trim();
    if (!value) return;
    const h4 = el.closest("div")?.parentElement?.querySelector("h4");
    const label = h4?.textContent?.trim() || el.placeholder || el.name || el.id;
    if (label) rows.push({ label: label.replace(/[*:]+$/, "").trim(), value });
  });
  return rows;
};

// label + value rows of a stepper step for the page download
export const collectStepFieldRows = (container) => {
  if (!container) return [];
  const rows = [];
  container.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "file" || el.type === "hidden") return;
    const value = el.value?.trim();
    if (!value) return;
    const label =
      document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
      el.getAttribute("data-ai-label") ||
      el.placeholder ||
      el.name ||
      "";
    if (label) rows.push({ label: label.replace(/[*:]+$/, "").trim(), value });
  });
  return rows;
};

// enter moves to the next text input, submits on the last one
export const focusNextInputOnEnter = (e, container, onLastField) => {
  if (e.key !== KEYBOARD_KEYS.ENTER || e.defaultPrevented) return;
  const active = e.target;
  if (active?.tagName?.toLowerCase() !== "input") return;
  if (active.type === "radio" || active.type === "checkbox") return;
  if (!container) return;
  // keep enter for the open places dropdown
  const pac = document.querySelector(".pac-container");
  if (pac && getComputedStyle(pac).display !== "none" && active.closest("[data-places-input]")) return;
  const inputs = Array.from(container.querySelectorAll("input:not([disabled]):not([readonly]):not([type=hidden])")).filter(
    (el) => el.offsetParent !== null && el.type !== "radio" && el.type !== "checkbox",
  );
  const idx = inputs.indexOf(active);
  if (idx === -1) return;
  e.preventDefault();
  if (idx < inputs.length - 1) inputs[idx + 1].focus();
  else onLastField?.(e);
};

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
  { email, createdAt, nameField = "idMissionName", issuerField = "idMissionIdIssuer", isRawStreet = false },
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
    value: f?.Expiration_Date ? formatData(f?.Expiration_Date) : "",
  },
  idMissionStreetAddress: {
    name: "idMissionStreetAddress",
    value: isRawStreet
      ? f?.ParsedAddressStreetNumber + f?.ParsedAddressStreetName || ""
      : (f?.ParsedAddressStreetNumber || "") + " " + (f?.ParsedAddressStreetName || ""),
  },
  idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: f?.PhoneNumber || "" },
  idMissionZipCode: { name: "idMissionZipCode", value: f?.ParsedAddressPostalCode || "" },
  idMissionDateOfBirth: {
    name: "idMissionDateOfBirth",
    value: f?.Date_of_Birth ? formatData(f?.Date_of_Birth) : "",
  },
  idMissionCountry: { name: "idMissionCountry", value: f?.Issuing_Country || "" },
  idMissionIssueDate: {
    name: "idMissionIssueDate",
    value: f?.Issue_Date ? formatData(f?.Issue_Date) : "",
  },
  idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
  idMissionState: { name: "idMissionState", value: f?.ParsedAddressProvince || "" },
  idMissionCity: { name: "idMissionCity", value: f?.ParsedAddressMunicipality || "" },
  idMissionData: { name: "idMissionData", value: f || "null" },
  createdAt: createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
