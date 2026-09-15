const WELL_KNOWN_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "live.com",
  "aol.com",
  "protonmail.com",
  "ymail.com",
  "googlemail.com",
];
const EMAIL_TLD_TYPOS = { cmo: "com", ocm: "com", con: "com", cpm: "com", cim: "com", coj: "com", cok: "com" };
const URL_TLD_TYPOS = { cmo: "com", ocm: "com", con: "com", cpm: "com" };
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

// edit distance; 99 when lengths differ by more than 2
const levenshtein = (a, b) => {
  const la = a.length,
    lb = b.length;
  if (Math.abs(la - lb) > 2) return 99;
  const prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev.splice(0, prev.length, ...curr);
  }
  return prev[lb];
};

const noSuggestion = (description) => ({ description, suggestion: null });

export const checkEmailValue = (v) => {
  if (!v.includes("@")) {
    return noSuggestion("This doesn't look like a valid email address — it's missing the @ symbol.");
  }
  const atIdx = v.lastIndexOf("@");
  const local = v.slice(0, atIdx);
  const domain = v.slice(atIdx + 1).toLowerCase();

  if (!domain || !domain.includes(".")) {
    return noSuggestion("This email address appears to be missing a domain (e.g. gmail.com).");
  }

  // one-edit typos of well-known providers
  if (!WELL_KNOWN_DOMAINS.includes(domain)) {
    const known = WELL_KNOWN_DOMAINS.find((d) => levenshtein(domain, d) === 1);
    if (known) return { description: `The email domain "${domain}" looks like a typo.`, suggestion: `${local}@${known}` };
  }

  const tld = domain.split(".").pop();
  if (EMAIL_TLD_TYPOS[tld]) {
    const fixedDomain = domain.slice(0, domain.length - tld.length) + EMAIL_TLD_TYPOS[tld];
    return {
      description: `The email ending ".${tld}" looks like a typo — did you mean ".com"?`,
      suggestion: `${local}@${fixedDomain}`,
    };
  }
  return null;
};

export const checkPhoneValue = (v) => {
  // country-code selector values such as "US"
  if (/^[A-Z]{1,3}$/.test(v)) return null;
  const digits = v.replace(/\D/g, "");
  if (digits.length === 0) {
    return noSuggestion(
      "This phone number field doesn't appear to contain any digits — did you enter this in the right field?",
    );
  }
  // only flag short numbers once past a country or area code
  if (digits.length >= 4 && digits.length < 7) {
    return noSuggestion("This phone number looks too short — most phone numbers have at least 7 digits.");
  }
  if (digits.length > 15) {
    return noSuggestion("This phone number looks too long — most phone numbers have at most 15 digits.");
  }
  return null;
};

export const checkDateValue = (v, { isBirthDate, isExpiryDate, isIssueDate }) => {
  const parsed = new Date(v);
  if (isNaN(parsed.getTime())) return null;
  const now = new Date();

  if (isBirthDate) {
    const ageYrs = (now - parsed) / YEAR_MS;
    if (ageYrs < 0) return noSuggestion("This birth date appears to be in the future.");
    if (ageYrs < 18) return noSuggestion("This birth date would make the applicant under 18 years old.");
    if (ageYrs > 120) {
      return noSuggestion("This birth date would make the applicant over 120 years old — please double-check the year.");
    }
  }
  if (isExpiryDate && parsed < now) return noSuggestion("This expiry date appears to be in the past.");
  if (isIssueDate && parsed > now) {
    return noSuggestion("This issue date appears to be in the future — ID documents cannot be issued in the future.");
  }

  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return noSuggestion("This date doesn't look valid — please check the month and day.");
  }
  return null;
};

export const checkUrlValue = (v) => {
  const stripped = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (!stripped.includes(".")) {
    return noSuggestion("This doesn't look like a valid website URL — it's missing a domain extension (like .com).");
  }
  const tld = stripped.split(".").pop().split("/")[0].split("?")[0].toLowerCase();
  if (URL_TLD_TYPOS[tld]) {
    return {
      description: `The URL ending ".${tld}" looks like a typo — did you mean ".com"?`,
      suggestion: v.slice(0, v.length - tld.length) + URL_TLD_TYPOS[tld],
    };
  }
  return null;
};

export const checkTaxIdValue = (v) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length === 0) {
    return noSuggestion(
      "This tax ID field appears to contain text rather than numbers — did you enter this in the right field?",
    );
  }
  if (digits.length < 7 || digits.length > 15) {
    return noSuggestion("This tax ID doesn't look right — the number of digits seems off.");
  }
  return null;
};

export const checkNameValue = (v) => {
  if (/^\d+$/.test(v)) return noSuggestion("This field expects a name, but the value appears to be all numbers.");
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return noSuggestion("This looks like an email address, but this field expects a person's name.");
  }
  // all lowercase: suggest capitalizing
  if (v.length > 1 && v === v.toLowerCase() && /^[a-z]/.test(v)) {
    const suggestion = v
      .split(" ")
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
    return { description: "Names are usually capitalized — did you mean to start with a capital letter?", suggestion };
  }
  return null;
};
