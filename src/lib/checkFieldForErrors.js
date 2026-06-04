/**
 * Levenshtein edit distance — used for fuzzy domain matching.
 * Returns 99 immediately when length difference > 2 (fast shortcut for clearly different strings).
 */
function levenshtein(a, b) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 2) return 99;
  const prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const curr = [i];
    for (let j = 1; j <= lb; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev.splice(0, prev.length, ...curr);
  }
  return prev[lb];
}

/**
 * Client-side field error detection for the basic application assistant.
 * Checks an individual field value for obvious typos / validation failures
 * without any AI API call.
 *
 * @param {string} fieldId     The field's id / name attribute
 * @param {string} fieldLabel  The human-readable label (lowercased before comparison)
 * @param {string} fieldType   The input type (e.g. "text", "email", "tel", "date", "url")
 * @param {string} value       The current value of the field
 * @returns {{ description: string, suggestion: string|null }|null}
 */
export function checkFieldForErrors(fieldId, fieldLabel, fieldType, value) {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;

  const id    = (fieldId    || "").toLowerCase();
  const label = (fieldLabel || "").toLowerCase();
  const type  = (fieldType  || "text").toLowerCase();

  // ── Skip OTP / verification-code / passcode fields unconditionally ────────
  // These are transient codes — validating their format would produce false positives.
  const OTP_PATTERNS = ["otp", "verification code", "verify code", "passcode", "access code", "one-time", "pin code"];
  if (OTP_PATTERNS.some((p) => id.includes(p) || label.includes(p))) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const matchesAny = (patterns) => patterns.some((p) => id.includes(p) || label.includes(p));

  const isEmailField   = type === "email" || matchesAny(["email", "e-mail", "e_mail"]);
  const isPhoneField   = type === "tel"   || matchesAny(["phone", "mobile", "cell", "fax", "telephone"]);
  const isDateField    = type === "date"  || matchesAny(["date", "dob", "birth", "expir", "issued", "issue date", "effective"]);
  const isURLField     = type === "url"   || matchesAny(["website", "web site", "url", "site", "domain", "homepage"]);
  const isNameField    =
    !isEmailField && !isPhoneField && !isDateField && !isURLField &&
    matchesAny(["first name", "last name", "full name", "middle name", "given name", "surname", "fname", "lname", "fullname"]);
  const isEINField     = matchesAny(["ein", "tax id", "tax_id", "taxid", "tax identification", "federal id", "fein"]);
  const isBirthDate    = matchesAny(["birth", "dob", "date of birth", "birthdate"]);
  const isExpiryDate   = matchesAny(["expir", "expiry", "expiration", "exp date"]);
  const isIssueDate    = !isExpiryDate && matchesAny(["issue date", "issued", "issue_date", "issuance", "date issued"]);

  // ── Email ─────────────────────────────────────────────────────────────────
  if (isEmailField) {
    if (!v.includes("@")) {
      return {
        description: "This doesn't look like a valid email address — it's missing the @ symbol.",
        suggestion: null,
      };
    }

    const atIdx = v.lastIndexOf("@");
    const local  = v.slice(0, atIdx);
    const domain = v.slice(atIdx + 1).toLowerCase();

    if (!domain || !domain.includes(".")) {
      return {
        description: "This email address appears to be missing a domain (e.g. gmail.com).",
        suggestion: null,
      };
    }

    // Fuzzy domain check — catches all 1-edit-distance typos of well-known providers
    // (e.g. gmil.com, gmial.com, gmali.com, gmal.com, gmai.com, hotmial.com, outlok.com …)
    const WELL_KNOWN_DOMAINS = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
      "icloud.com", "me.com", "live.com", "aol.com",
      "protonmail.com", "ymail.com", "googlemail.com",
    ];
    if (!WELL_KNOWN_DOMAINS.includes(domain)) {
      for (const known of WELL_KNOWN_DOMAINS) {
        if (levenshtein(domain, known) === 1) {
          return {
            description: `The email domain "${domain}" looks like a typo.`,
            suggestion: `${local}@${known}`,
          };
        }
      }
    }

    // TLD typos (e.g. .cmo .ocm .con .cpm)
    const TLD_TYPOS = { cmo: "com", ocm: "com", con: "com", cpm: "com", cim: "com", coj: "com", cok: "com" };
    const tld = domain.split(".").pop();
    if (TLD_TYPOS[tld]) {
      const fixedDomain = domain.slice(0, domain.length - tld.length) + TLD_TYPOS[tld];
      return {
        description: `The email ending ".${tld}" looks like a typo — did you mean ".com"?`,
        suggestion: `${local}@${fixedDomain}`,
      };
    }

    return null;
  }

  // ── Phone ─────────────────────────────────────────────────────────────────
  if (isPhoneField) {
    // Country-code selectors (e.g. PhoneInput flag picker) return "US", "CA", etc.
    // These are 2–3 uppercase letters with no digits — not a real phone number entry.
    if (/^[A-Z]{1,3}$/.test(v)) return null;

    const digits = v.replace(/\D/g, "");
    if (digits.length === 0) {
      return {
        description: "This phone number field doesn't appear to contain any digits — did you enter this in the right field?",
        suggestion: null,
      };
    }
    // Only flag "too short" once enough digits are present to be a clear attempt
    // at a real number (not just a country/area code prefix like "+1" or "+44").
    if (digits.length >= 4 && digits.length < 7) {
      return {
        description: "This phone number looks too short — most phone numbers have at least 7 digits.",
        suggestion: null,
      };
    }
    if (digits.length > 15) {
      return {
        description: "This phone number looks too long — most phone numbers have at most 15 digits.",
        suggestion: null,
      };
    }
    return null;
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  // Catch text typed into a date field (e.g. a state name or address entered here by mistake)
  if (isDateField && v.length >= 3 && !/\d/.test(v)) {
    return {
      description: "This date field appears to contain text rather than a date — did you enter this in the right field?",
      suggestion: null,
    };
  }
  if (isDateField && /\d/.test(v)) {
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) {
      const now = new Date();

      if (isBirthDate) {
        const ageMs  = now - parsed;
        const ageYrs = ageMs / (365.25 * 24 * 60 * 60 * 1000);
        if (ageYrs < 0) {
          return { description: "This birth date appears to be in the future.", suggestion: null };
        }
        if (ageYrs < 18) {
          return { description: "This birth date would make the applicant under 18 years old.", suggestion: null };
        }
        if (ageYrs > 120) {
          return { description: "This birth date would make the applicant over 120 years old — please double-check the year.", suggestion: null };
        }
      }

      if (isExpiryDate && parsed < now) {
        return { description: "This expiry date appears to be in the past.", suggestion: null };
      }

      if (isIssueDate && parsed > now) {
        return { description: "This issue date appears to be in the future — ID documents cannot be issued in the future.", suggestion: null };
      }

      // Check for impossible month/day
      const month = parsed.getMonth() + 1;
      const day   = parsed.getDate();
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return { description: "This date doesn't look valid — please check the month and day.", suggestion: null };
      }
    }
    return null;
  }

  // ── URL / Website ─────────────────────────────────────────────────────────
  if (isURLField) {
    const stripped = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    if (!stripped.includes(".")) {
      return {
        description: "This doesn't look like a valid website URL — it's missing a domain extension (like .com).",
        suggestion: null,
      };
    }
    // TLD typos on URL
    const tld = stripped.split(".").pop().split("/")[0].split("?")[0].toLowerCase();
    const TLD_TYPOS = { cmo: "com", ocm: "com", con: "com", cpm: "com" };
    if (TLD_TYPOS[tld]) {
      const fixed = v.slice(0, v.length - tld.length) + TLD_TYPOS[tld];
      return {
        description: `The URL ending ".${tld}" looks like a typo — did you mean ".com"?`,
        suggestion: fixed,
      };
    }
    return null;
  }

  // ── EIN / Tax ID ──────────────────────────────────────────────────────────
  if (isEINField) {
    const digits = v.replace(/\D/g, "");
    if (digits.length === 0) {
      return {
        description: "This tax ID field appears to contain text rather than numbers — did you enter this in the right field?",
        suggestion: null,
      };
    }
    if (digits.length < 7 || digits.length > 15) {
      return {
        description: "This tax ID doesn't look right — the number of digits seems off.",
        suggestion: null,
      };
    }
    return null;
  }

  // ── ZIP / Postal code — pure alpha ────────────────────────────────────────
  // ZIP codes are numeric (US) or alphanumeric (CA, UK). All-letter values are
  // almost certainly a wrong-field entry (e.g. a state name typed into the ZIP box).
  const isZipField = matchesAny(["zip", "postal", "postcode", "post code", "zip code"]);
  if (isZipField && /^[a-zA-Z\s]+$/.test(v) && v.length >= 2) {
    return {
      description: "This ZIP / postal code field appears to contain only letters — did you enter this in the right field?",
      suggestion: null,
    };
  }

  // ── Textual label fields — pure digits ────────────────────────────────────
  // Fields where the expected value is a descriptive word (state name, city, country,
  // ID document type, license issuer, etc.). A value that is all digits almost always
  // means the applicant confused this field with a nearby numeric field.
  const isTextualLabelField =
    !isEmailField && !isPhoneField && !isDateField && !isURLField && !isEINField && !isZipField &&
    matchesAny([
      "state", "province", "region",
      "city", "town", "municipality",
      "country",
      "id type", "id_type", "idtype",
      "license type", "license_type", "licensetype",
      "document type", "doc type",
      "id issuer", "id_issuer",
    ]);
  if (isTextualLabelField && /^\d+$/.test(v)) {
    return {
      description: "This field expects a text value (like a name or location), but the entered value is all numbers — did you enter this in the right field?",
      suggestion: null,
    };
  }

  // ── Name field ────────────────────────────────────────────────────────────
  if (isNameField) {
    // All digits in a name field
    if (/^\d+$/.test(v)) {
      return {
        description: "This field expects a name, but the value appears to be all numbers.",
        suggestion: null,
      };
    }

    // Email address typed into a name field
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return {
        description: "This looks like an email address, but this field expects a person's name.",
        suggestion: null,
      };
    }

    // All lowercase — suggest capitalizing
    if (v.length > 1 && v === v.toLowerCase() && /^[a-z]/.test(v)) {
      const suggestion = v
        .split(" ")
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
      return {
        description: "Names are usually capitalized — did you mean to start with a capital letter?",
        suggestion,
      };
    }

    return null;
  }

  // ── Generic type-mismatch: email typed into a non-email field ─────────────
  // (Only for fields whose label suggests text content, not codes/IDs)
  if (
    !isEmailField && !isPhoneField && !isDateField && !isURLField && !isEINField &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) &&
    matchesAny(["city", "state", "country", "address", "zip", "postal"])
  ) {
    return {
      description: "This looks like an email address, but this field expects a location or address.",
      suggestion: null,
    };
  }

  return null;
}
