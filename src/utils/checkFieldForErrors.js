import {
  checkDateValue,
  checkEmailValue,
  checkNameValue,
  checkPhoneValue,
  checkTaxIdValue,
  checkUrlValue,
} from "@/utils/checkFieldForErrors2";

const OTP_PATTERNS = ["otp", "verification code", "verify code", "passcode", "access code", "one-time", "pin code"];
const TEXTUAL_LABEL_PATTERNS = [
  "state",
  "province",
  "region",
  "city",
  "town",
  "municipality",
  "country",
  "id type",
  "id_type",
  "idtype",
  "license type",
  "license_type",
  "licensetype",
  "document type",
  "doc type",
  "id issuer",
  "id_issuer",
];

// client-side typo check for one applicant field; returns { description, suggestion } or null
export const checkFieldForErrors = (fieldId, fieldLabel, fieldType, value) => {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;

  const id = (fieldId || "").toLowerCase();
  const label = (fieldLabel || "").toLowerCase();
  const type = (fieldType || "text").toLowerCase();

  // one-time codes are never validated
  if (OTP_PATTERNS.some((p) => id.includes(p) || label.includes(p))) return null;

  const matchesAny = (patterns) => patterns.some((p) => id.includes(p) || label.includes(p));

  const isEmailField = type === "email" || matchesAny(["email", "e-mail", "e_mail"]);
  const isPhoneField = type === "tel" || matchesAny(["phone", "mobile", "cell", "fax", "telephone"]);
  const isDateField =
    type === "date" || matchesAny(["date", "dob", "birth", "expir", "issued", "issue date", "effective"]);
  const isURLField =
    type === "url" ||
    (matchesAny(["website", "web site", "url", "site", "domain", "homepage"]) &&
      !matchesAny(["no website", "has no website", "without a website", "without website"]));
  const isNameField =
    !isEmailField &&
    !isPhoneField &&
    !isDateField &&
    !isURLField &&
    matchesAny(["first name", "last name", "full name", "middle name", "given name", "surname", "fname", "lname", "fullname"]);
  const isEINField = matchesAny(["ein", "tax id", "tax_id", "taxid", "tax identification", "federal id", "fein"]);
  const isExpiryDate = matchesAny(["expir", "expiry", "expiration", "exp date"]);
  const dateKinds = {
    isBirthDate: matchesAny(["birth", "dob", "date of birth", "birthdate"]),
    isExpiryDate,
    isIssueDate: !isExpiryDate && matchesAny(["issue date", "issued", "issue_date", "issuance", "date issued"]),
  };

  if (isEmailField) return checkEmailValue(v);
  if (isPhoneField) return checkPhoneValue(v);

  // text typed into a date field
  if (isDateField && v.length >= 3 && !/\d/.test(v)) {
    return {
      description: "This date field appears to contain text rather than a date — did you enter this in the right field?",
      suggestion: null,
    };
  }
  if (isDateField && /\d/.test(v)) return checkDateValue(v, dateKinds);
  if (isURLField) return checkUrlValue(v);
  if (isEINField) return checkTaxIdValue(v);

  // letters only in a zip or postal code
  const isZipField = matchesAny(["zip", "postal", "postcode", "post code", "zip code"]);
  if (isZipField && /^[a-zA-Z\s]+$/.test(v) && v.length >= 2) {
    return {
      description:
        "This ZIP / postal code field appears to contain only letters — did you enter this in the right field?",
      suggestion: null,
    };
  }

  // digits only in a field that expects words
  const isTextualLabelField =
    !isEmailField &&
    !isPhoneField &&
    !isDateField &&
    !isURLField &&
    !isEINField &&
    !isZipField &&
    matchesAny(TEXTUAL_LABEL_PATTERNS);
  if (isTextualLabelField && /^\d+$/.test(v)) {
    return {
      description:
        "This field expects a text value (like a name or location), but the entered value is all numbers — did you enter this in the right field?",
      suggestion: null,
    };
  }

  if (isNameField) return checkNameValue(v);

  // an email typed into a location field
  if (
    !isEmailField &&
    !isPhoneField &&
    !isDateField &&
    !isURLField &&
    !isEINField &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) &&
    matchesAny(["city", "state", "country", "address", "zip", "postal"])
  ) {
    return {
      description: "This looks like an email address, but this field expects a location or address.",
      suggestion: null,
    };
  }

  return null;
};
