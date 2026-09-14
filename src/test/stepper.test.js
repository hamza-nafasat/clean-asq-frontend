/**
 * Category: Stepper - the applicant application flow (frontend)
 * Covers:   every QA script item in Parts 1-5 that happens inside the
 *           application itself, in flow order: header (2.3, 3.4), OTP (3.6,
 *           3.8, 5.3, 5.4), company name/URL (2.7, 2.8, 3.12, 5.6, 5.28),
 *           IDMission (2.9-2.15, 3.16-3.25, 5.8-5.10, 5.33), company info
 *           (2.16-2.22, 3.28-3.30, 5.11), ownership (2.23-2.26, 3.32, 5.13,
 *           5.14), bank (2.28-2.35), transaction processing (2.36), display
 *           text (1.25, 2.4), page downloads (2.5, 2.6, 3.36, 3.40), agreement
 *           and documents (2.39-2.42, 3.41, 3.43, 3.44), the application PDF
 *           (3.45, 5.23), customisation (1.21, 1.22, 4.16, 4.19, 4.20),
 *           drafts (5.29) and the hidden beneficial-owner form (5.44, 5.45).
 *
 * Sections:
 *   1. pure stepper logic   runtime tests
 *   2. screen contracts     source-text assertions, in application-flow order
 *
 * Tests marked `todo` guard a QA item that is still open in the code. They run
 * and report, but do not fail `npm test`; drop the todo once the fix lands.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { hasFieldValue, sectionEntries, sectionHasData, sectionsForPdf } from "../lib/sectionCompletion.js";
import {
  PRIMARY_CONTACT_ONLY,
  requiresOtherOperators,
  resolveOtherOperatorsAnswer,
} from "../lib/ownerOperatorRules.js";
import { findFieldKeyByName, getFieldValueByName } from "../lib/formFieldLookup.js";
import { isEnterSequenceType } from "../hooks/useEnterToNextField.js";
import { makeDocLinkHandler } from "../lib/makeDocLinkHandler.js";
import {
  getSignatureUrl,
  isSignatureComplete,
  normalizeFieldEntry,
  normalizeSignature,
} from "../utils/signatureShape.js";
import { formatData, makeCompleteName } from "../utils/idMissionMapingUtils.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => readFileSync(path.join(root, "src", p), "utf8");

/** Source between two markers (end exclusive). Fails if either marker is missing. */
const between = (source, startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `start marker not found: ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(end, -1, `end marker not found: ${endMarker}`);
  return source.slice(start, end);
};

/** Source around the first occurrence of `marker`. */
const around = (source, marker, before = 400, after = 400) => {
  const at = source.indexOf(marker);
  assert.notEqual(at, -1, `marker not found: ${marker}`);
  return source.slice(Math.max(0, at - before), at + after);
};

const SCREENS = {
  singleApplication: "page/admin/userApplicationForms/ApplicationVerification/SingleApplication.jsx",
  stepper: "page/admin/userApplicationForms/ApplicationVerification/ApplicationForm.jsx",
  pdfView: "page/admin/userApplicationForms/ApplicationVerification/ApplicationPdfView.jsx",
  hidden: "page/admin/userApplicationForms/Hidden/HIdden.jsx",
  companyVerification: "components/admin/varification/CompanyVerification.jsx",
  companyInformation: "components/applicationVerification/CompanyInformation.jsx",
  companyOwners: "components/applicationVerification/CompanyOwners.jsx",
  bankInfo: "components/applicationVerification/BankInfo.jsx",
  customSection: "components/applicationVerification/CustomSection.jsx",
  processingInfo: "components/applicationVerification/ProcessingInfo.jsx",
  agreement: "components/applicationVerification/AggrementBlock.jsx",
  documents: "components/applicationVerification/Documents.jsx",
  dynamicField: "components/shared/small/DynamicField.jsx",
  textField: "components/shared/small/TextField.jsx",
  submission: "components/LoadingWithTimerAfterSubmission.jsx",
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. pure stepper logic
// ═════════════════════════════════════════════════════════════════════════════

/**
 * lib/sectionCompletion.js - QA 3.45: the application PDF rendered blank pages
 * for hidden sections (Articles of Incorporation, Additional Owners).
 */
const PDF_SECTIONS = [
  { key: "company_information", title: "company_information_blk", isHidden: false },
  { key: "agreement", title: "agreement_blk", isHidden: false },
  { key: "incorporation_article", title: "incorporation_article_blk", isHidden: true },
  { key: "additional_owners", title: "custom_section", isHidden: true },
];
const VISIBLE_KEYS = ["company_information", "agreement"];
const field = (name, value) => ({ name, value });
const keysForPdf = (data) => sectionsForPdf(PDF_SECTIONS, data).map((s) => s.key);

describe("lib · sectionCompletion", () => {
  describe("hasFieldValue()", () => {
    it("rejects empty, blank and unset values", () => {
      for (const value of [null, undefined, "", "   ", [], {}, false, { secureUrl: "" }]) {
        assert.equal(hasFieldValue(value), false, `${JSON.stringify(value) ?? "undefined"} must not count`);
      }
    });

    it("accepts real values, including zero and uploaded files", () => {
      for (const value of ["Acme", 0, 42, true, ["a"], { secureUrl: "https://x/y.png" }]) {
        assert.equal(hasFieldValue(value), true, `${JSON.stringify(value)} must count`);
      }
    });
  });

  describe("sectionHasData()", () => {
    it("reports a section of blank fields as empty", () => {
      assert.equal(sectionHasData({ f1: field("name", ""), f2: field("ssn", null) }), false);
    });

    it("reports a section as filled when any one field has a value", () => {
      assert.equal(sectionHasData({ f1: field("name", ""), f2: field("ssn", "123") }), true);
    });
  });

  describe("sectionsForPdf()", () => {
    it("[QA 3.45] excludes a hidden section the applicant never completed", () => {
      const data = { company_information: { f1: field("legal_name", "Acme") } };
      assert.deepEqual(keysForPdf(data), VISIBLE_KEYS);
    });

    it("[QA 3.45] includes a hidden section the applicant did complete", () => {
      const data = {
        company_information: { f1: field("legal_name", "Acme") },
        additional_owners: { o1: field("owner_name", "Jane Doe") },
      };
      assert.deepEqual(keysForPdf(data), [...VISIBLE_KEYS, "additional_owners"]);
    });

    it("[QA 3.45] includes a hidden section whose only data is an uploaded file", () => {
      const data = {
        incorporation_article: { d1: field("doc", { secureUrl: "https://x/a.pdf" }) },
      };
      assert.ok(keysForPdf(data).includes("incorporation_article"));
    });

    it("never drops a visible section, even with no data at all", () => {
      assert.deepEqual(keysForPdf({}), VISIBLE_KEYS);
    });
  });

  describe("malformed input", () => {
    it("returns an empty list when sections or data are missing", () => {
      assert.deepEqual(sectionsForPdf(undefined, undefined), []);
      assert.deepEqual(sectionsForPdf(null, null), []);
    });
  });
});

/**
 * Multi-entry sections: additional_owners_information stores an ARRAY of field
 * maps, one per invited owner, instead of a single flat map.
 */
describe("lib · sectionCompletion · multi-entry sections", () => {
  const owner = (name, email) => ({
    u1: field("idMissionName", name),
    u2: field("idMissionEmail", email),
  });
  const blankOwner = { u1: field("idMissionName", ""), u2: field("idMissionEmail", "  ") };

  describe("sectionHasData() on an array", () => {
    it("reports an array of blank entries as empty", () => {
      assert.equal(sectionHasData([blankOwner, blankOwner]), false);
    });

    it("reports the section as filled when any one owner has data", () => {
      assert.equal(sectionHasData([blankOwner, owner("Jane Doe", "")]), true);
    });

    it("treats an empty array as no data", () => {
      assert.equal(sectionHasData([]), false);
    });
  });

  describe("sectionEntries()", () => {
    it("wraps a flat section as a single entry with no index", () => {
      const flat = { u1: field("legal_name", "Acme") };
      assert.deepEqual(sectionEntries(flat), [{ entry: flat, index: null }]);
    });

    it("returns nothing for a flat section with no answers", () => {
      assert.deepEqual(sectionEntries({ u1: field("legal_name", "") }), []);
    });

    it("returns one entry per owner that has data", () => {
      const a = owner("Jane Doe", "jane@x.com");
      const b = owner("Sam Roe", "sam@x.com");
      assert.deepEqual(sectionEntries([a, b]), [
        { entry: a, index: 0 },
        { entry: b, index: 1 },
      ]);
    });

    it("drops blank owners but keeps the original index of the survivors", () => {
      const real = owner("Jane Doe", "jane@x.com");
      const result = sectionEntries([blankOwner, real, blankOwner]);
      assert.equal(result.length, 1);
      assert.equal(result[0].index, 1, "index must point at the slot in the stored array");
    });

    it("returns nothing for missing or non-object data", () => {
      for (const bad of [null, undefined, "", 7]) {
        assert.deepEqual(sectionEntries(bad), []);
      }
    });
  });

  describe("sectionsForPdf() with an array section", () => {
    const SECTIONS_MULTI = [
      { key: "company_information", title: "company_information_blk", isHidden: false },
      { key: "additional_owners_information", title: "custom_section", isHidden: true },
    ];
    const keys = (data) => sectionsForPdf(SECTIONS_MULTI, data).map((s) => s.key);

    it("excludes the section when every owner entry is blank", () => {
      assert.deepEqual(keys({ additional_owners_information: [blankOwner] }), ["company_information"]);
    });

    it("includes the section when at least one owner was completed", () => {
      const data = { additional_owners_information: [blankOwner, owner("Jane Doe", "jane@x.com")] };
      assert.ok(keys(data).includes("additional_owners_information"));
    });
  });
});

/**
 * lib/ownerOperatorRules.js - QA 5.13: when the applicant declared they are only
 * the primary contact, "No" must be unselectable on the other-operators question
 * and "Yes" must be chosen for them.
 */
describe("lib · ownerOperatorRules", () => {
  describe("requiresOtherOperators()", () => {
    it("[QA 5.13] is true only when the applicant is the primary contact alone", () => {
      assert.equal(requiresOtherOperators(PRIMARY_CONTACT_ONLY), true);
    });

    it("is false when the applicant is themselves an operator", () => {
      for (const role of ["primaryOperatorAndController", "both"]) {
        assert.equal(requiresOtherOperators(role), false, role);
      }
    });

    it("is false when the role is unknown or missing", () => {
      for (const role of [undefined, null, "", "somethingElse"]) {
        assert.equal(requiresOtherOperators(role), false, String(role));
      }
    });
  });

  describe("resolveOtherOperatorsAnswer()", () => {
    describe("when another operator is mandatory", () => {
      it('[QA 5.13] auto-selects "yes" when unanswered', () => {
        for (const v of [undefined, null, ""]) {
          assert.equal(resolveOtherOperatorsAnswer(v, true), "yes", String(v));
        }
      });

      it('[QA 5.13] corrects a stale "no" left over from a draft', () => {
        // "No" is not selectable in this situation, so leaving it would block
        // Next with no way for the applicant to clear it.
        assert.equal(resolveOtherOperatorsAnswer("no", true), "yes");
      });

      it('leaves an existing "yes" alone', () => {
        assert.equal(resolveOtherOperatorsAnswer("yes", true), "yes");
      });
    });

    describe("when the applicant is an operator themselves", () => {
      it("never forces an answer", () => {
        assert.equal(resolveOtherOperatorsAnswer("no", false), "no");
        assert.equal(resolveOtherOperatorsAnswer("yes", false), "yes");
      });

      it("[QA 3.32] lets an operator owning > 25% answer \"no\" with no additional-owner prompt", () => {
        assert.equal(requiresOtherOperators("both"), false);
        assert.equal(resolveOtherOperatorsAnswer("no", requiresOtherOperators("both")), "no");
      });

      it("leaves the question unanswered", () => {
        assert.equal(resolveOtherOperatorsAnswer(undefined, false), "");
        assert.equal(resolveOtherOperatorsAnswer("", false), "");
      });
    });

    it("is idempotent - re-running never flips a resolved answer", () => {
      const once = resolveOtherOperatorsAnswer("no", true);
      assert.equal(resolveOtherOperatorsAnswer(once, true), once);
    });
  });
});

/**
 * lib/formFieldLookup.js - QA 5.13: "Yes" was never auto-selected because the
 * lookup searched the form KEY for the field name. Keys are uniqueIds, and for
 * any database-backed field that is an opaque random string.
 */
describe("lib · formFieldLookup", () => {
  // DB fields carry opaque uniqueIds; frontend-declared fields use their name.
  const FORM = {
    m2k3j4a1b2c3xyz1234: { name: "additional_owners_own_25_percent_or_more", value: "no" },
    rolling_owner_is_also_owner: { name: "rolling_owner_is_also_owner", value: "yes" },
    k9f2h1q7w3e5r8t0: { name: "ssn", value: "123-45-6789" },
    signature: { name: "signature", value: "" },
  };

  describe("findFieldKeyByName()", () => {
    it("[QA 5.13] finds a database-backed field whose key is an opaque uniqueId", () => {
      // This is the case the old `key.includes(name)` lookup always missed.
      assert.equal(
        findFieldKeyByName(FORM, "additional_owners_own_25_percent_or_more"),
        "m2k3j4a1b2c3xyz1234",
      );
    });

    it("finds a frontend-declared field whose key equals its name", () => {
      assert.equal(
        findFieldKeyByName(FORM, "rolling_owner_is_also_owner"),
        "rolling_owner_is_also_owner",
      );
    });

    it("returns undefined for a field that is not present", () => {
      assert.equal(findFieldKeyByName(FORM, "not_a_field"), undefined);
    });

    it("matches the whole name, never a partial one", () => {
      // "owners_own_25" must not match "additional_owners_own_25_percent_or_more".
      assert.equal(findFieldKeyByName(FORM, "owners_own_25"), undefined);
    });

    it("is safe with a missing form or name", () => {
      assert.equal(findFieldKeyByName(undefined, "x"), undefined);
      assert.equal(findFieldKeyByName(null, "x"), undefined);
      assert.equal(findFieldKeyByName(FORM, ""), undefined);
      assert.equal(findFieldKeyByName("nope", "x"), undefined);
    });
  });

  describe("getFieldValueByName()", () => {
    it("reads the value of a database-backed field", () => {
      assert.equal(getFieldValueByName(FORM, "additional_owners_own_25_percent_or_more"), "no");
    });

    it("distinguishes an empty value from an absent field", () => {
      assert.equal(getFieldValueByName(FORM, "signature"), "");
      assert.equal(getFieldValueByName(FORM, "not_a_field"), undefined);
    });
  });
});

/**
 * hooks/useEnterToNextField.js - Company Verification: Enter should walk legal
 * name -> website URL -> "this company has no website" checkbox, and submit
 * from the checkbox. Checkboxes used to be excluded outright.
 */
describe("hooks · useEnterToNextField · isEnterSequenceType()", () => {
  describe("text-like inputs always take part", () => {
    it("includes text, email, url, number, password, date, tel", () => {
      for (const t of ["text", "email", "url", "number", "password", "date", "tel"]) {
        assert.equal(isEnterSequenceType(t), true, t);
      }
    });

    it("treats a missing type as text", () => {
      assert.equal(isEnterSequenceType(undefined), true);
      assert.equal(isEnterSequenceType(""), true);
    });
  });

  describe("checkboxes are opt-in", () => {
    it("are skipped by default, so a screen of checkboxes never submits on Enter", () => {
      // Business Activities / Transaction Processing rely on this.
      assert.equal(isEnterSequenceType("checkbox"), false);
      assert.equal(isEnterSequenceType("checkbox", false), false);
    });

    it("take part when the screen opts in", () => {
      // Company Verification: the checkbox decides whether the URL is required,
      // so it is a genuine step in the sequence.
      assert.equal(isEnterSequenceType("checkbox", true), true);
    });
  });

  describe("types that never take part", () => {
    it("excludes radio, hidden, file, button and submit even when opted in", () => {
      for (const t of ["radio", "hidden", "file", "button", "submit"]) {
        assert.equal(isEnterSequenceType(t, false), false, t);
        assert.equal(isEnterSequenceType(t, true), false, `${t} (opted in)`);
      }
    });
  });

  describe("the Company Verification sequence", () => {
    it("[QA 2.7 / 2.8] walks name -> url -> checkbox when the URL field is visible", () => {
      const page = ["text", "url", "checkbox"];
      const inSequence = page.filter((t) => isEnterSequenceType(t, true));
      assert.deepEqual(inSequence, ["text", "url", "checkbox"]);
      // The checkbox is last, so Enter on it triggers the submit callback.
      assert.equal(inSequence[inSequence.length - 1], "checkbox");
    });

    it('[QA 5.6] walks name -> checkbox when "no website" hid the URL field', () => {
      const page = ["text", "checkbox"];
      assert.deepEqual(page.filter((t) => isEnterSequenceType(t, true)), ["text", "checkbox"]);
    });

    it("would have skipped the checkbox before the opt-in existed", () => {
      const page = ["text", "url", "checkbox"];
      assert.deepEqual(page.filter((t) => isEnterSequenceType(t, false)), ["text", "url"]);
    });
  });
});

describe("utils · signatureShape", () => {
  const UPLOADED = { publicId: "sig/abc", secureUrl: "https://res.cloudinary.com/x/sig.png", resourceType: "image" };

  describe("normalizeSignature()", () => {
    it("[QA 2.15 / 2.39] accepts the flat Cloudinary shape saved by older drafts", () => {
      assert.deepEqual(normalizeSignature(UPLOADED), { name: "signature", value: UPLOADED });
    });

    it("keeps the canonical nested shape as-is", () => {
      assert.deepEqual(normalizeSignature({ name: "signature", value: UPLOADED }).value, UPLOADED);
    });

    it("returns an empty signature for missing data", () => {
      for (const raw of [null, undefined, "", 5]) {
        assert.deepEqual(normalizeSignature(raw).value, { publicId: "", secureUrl: "", resourceType: "" });
      }
    });
  });

  describe("isSignatureComplete()", () => {
    it("[QA 2.15] is true only when both publicId and secureUrl exist", () => {
      assert.equal(isSignatureComplete(UPLOADED), true);
      assert.equal(isSignatureComplete({ ...UPLOADED, publicId: "" }), false);
      assert.equal(isSignatureComplete({ ...UPLOADED, secureUrl: "" }), false);
    });
  });

  describe("getSignatureUrl()", () => {
    it("[QA 3.45] resolves the URL the PDF renders, from either shape", () => {
      assert.equal(getSignatureUrl(UPLOADED), UPLOADED.secureUrl);
      assert.equal(getSignatureUrl({ value: UPLOADED }), UPLOADED.secureUrl);
      assert.equal(getSignatureUrl(null), "");
    });
  });

  describe("normalizeFieldEntry()", () => {
    it("[QA 5.33] restores a saved draft field to { name, value }", () => {
      assert.deepEqual(normalizeFieldEntry({ name: "ssn", value: "123" }), { name: "ssn", value: "123" });
      assert.deepEqual(normalizeFieldEntry("Acme", "legal_name"), { name: "legal_name", value: "Acme" });
    });

    it("wraps a flat uploaded file under the field name", () => {
      assert.deepEqual(normalizeFieldEntry(UPLOADED, "doc"), { name: "doc", value: UPLOADED });
    });

    it("keeps an explicit false or zero value", () => {
      assert.deepEqual(normalizeFieldEntry({ name: "f", value: 0 }), { name: "f", value: 0 });
    });

    describe("malformed input", () => {
      it("returns an empty value for null, undefined and empty string", () => {
        for (const raw of [null, undefined, ""]) {
          assert.deepEqual(normalizeFieldEntry(raw, "x"), { name: "x", value: "" });
        }
      });
    });
  });
});

describe("utils · idMissionMapingUtils", () => {
  describe("makeCompleteName()", () => {
    it("[QA 2.12] builds the full name from first, middle and last", () => {
      assert.equal(makeCompleteName("Hamza", "Ali", "Nafasat"), "Hamza Ali Nafasat");
    });

    it("drops a missing middle name", () => {
      assert.equal(makeCompleteName("Hamza", "", "Nafasat"), "Hamza Nafasat");
    });

    it("falls back to fullName, then name, then empty", () => {
      assert.equal(makeCompleteName("", "", "", "Hamza Nafasat"), "Hamza Nafasat");
      assert.equal(makeCompleteName("", "", "", "", "H. Nafasat"), "H. Nafasat");
      assert.equal(makeCompleteName(), "");
    });
  });

  describe("formatData()", () => {
    it("[QA 2.12 / 3.22] converts the IDMission DD/MM/YYYY date to the YYYY-MM-DD a date input needs", () => {
      assert.equal(formatData("16/07/1990"), "1990-07-16");
    });
  });
});

describe("lib · makeDocLinkHandler · makeDocLinkHandler()", () => {
  /** A fake click whose target sits inside an <a href> (or not). */
  const click = (href) => {
    const calls = { prevented: false, stopped: false };
    const anchor = href === null ? null : { getAttribute: () => href };
    return {
      calls,
      event: {
        target: { closest: () => anchor },
        preventDefault: () => { calls.prevented = true; },
        stopPropagation: () => { calls.stopped = true; },
      },
    };
  };

  it("[QA 3.41] opens a document link in the modal instead of navigating away", () => {
    let opened = null;
    const { event, calls } = click("https://fintainium.com/t&c/");
    makeDocLinkHandler((doc) => { opened = doc; })(event);
    assert.deepEqual(opened, { url: "https://fintainium.com/t&c/", title: "https://fintainium.com/t&c/" });
    assert.equal(calls.prevented, true);
    assert.equal(calls.stopped, true);
  });

  it("leaves in-page anchors, mailto, tel and javascript links alone", () => {
    for (const href of ["#section", "mailto:help@x.com", "tel:+15551234567", "javascript:void(0)", ""]) {
      let opened = null;
      const { event, calls } = click(href);
      makeDocLinkHandler((doc) => { opened = doc; })(event);
      assert.equal(opened, null, href);
      assert.equal(calls.prevented, false, href);
    }
  });

  it("ignores clicks that are not on a link", () => {
    let opened = null;
    makeDocLinkHandler((doc) => { opened = doc; })(click(null).event);
    assert.equal(opened, null);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. screen contracts - in application-flow order
// ═════════════════════════════════════════════════════════════════════════════

describe("stepper · application header", () => {
  it("[QA 2.3 / 3.4] stores the configured header text size", () => {
    assert.match(read("redux/slices/formSlice.js"), /state\.formHeaderTextSize = action\.payload\.headerTextSize;/);
  });

  it("[QA 2.3 / 3.4] renders the header text at the configured size", () => {
    assert.match(read("page/admin/layout/AdminHeader.jsx"), /fontSize: `\$\{formHeaderTextSize \|\| 24\}px`/);
  });

  it("[QA 2.3 / 3.4] every application screen publishes the form's header settings", () => {
    assert.match(read(SCREENS.singleApplication), /updateFormHeaderAndFooter\(\{ headerText, footerText, headerTextSize \}\)/);
    assert.match(read(SCREENS.companyVerification), /headerTextSize: formBackendData\?\.data\?\.headerTextSize \|\| 24,/);
    assert.match(read(SCREENS.stepper), /headerTextSize: form\?\.data\?\.headerTextSize \|\| 24,/);
  });
});

describe("stepper · OTP email verification", () => {
  const src = read(SCREENS.singleApplication);

  it("[QA 3.6 / 5.3] Enter in the email field sends the OTP", () => {
    assert.match(src, /if \(e\.key === "Enter"\) \{[^}]*sentOtpForEmail\(\)/);
  });

  it("[QA 3.6] moves the cursor to the OTP field once the code is sent", () => {
    assert.match(src, /document\.getElementById\("otp-field"\)\?\.focus\(\)/);
  });

  it("[QA 3.8 / 5.4] Enter in the OTP field submits the code", () => {
    assert.match(src, /if \(e\.key === "Enter"\) \{[^}]*verifyWithOtp\(\)/);
  });

  it("[QA 3.6 / 3.8] the shared text field forwards onKeyDown to the page", () => {
    assert.match(read(SCREENS.textField), /rest\.onKeyDown\?\.\(e\);/);
  });

  describe("[QA 5.3] Skip button", () => {
    it("is gated on isCreator, not on any signed-in user", () => {
      const skipBlock = src.slice(src.indexOf('label={"Skip"}') - 800, src.indexOf('label={"Skip"}') + 40);
      assert.match(skipBlock, /\{isCreator && \(/, "Skip must be creator-only");
      assert.ok(!/\{user\?\._id && \(/.test(skipBlock), "must not show for every signed-in user");
    });

    it("excludes guest users from isCreator", () => {
      assert.match(src, /const isCreator = user\?\._id && user\?\._id == form\?\.data\?\.owner && user\?\.role !== "guest";/);
    });
  });
});

describe("stepper · company name and URL", () => {
  const src = read(SCREENS.companyVerification);
  const submit = between(src, "const handleSubmit = async () => {", "submitFromEnterRef.current = () => {");

  it("[QA 2.7] Enter walks the fields and submits from the last one", () => {
    assert.match(src, /useEnterToNextField\(companyFormRef, \{\s*onLastFieldRef: submitFromEnterRef,\s*includeCheckboxes: true,/);
  });

  it("[QA 2.8 / 3.12 / 5.28] waits for verification before moving on", () => {
    assert.match(submit, /await companyVerifyPromise/);
  });

  it("[QA 2.8 / 3.12 / 5.28] starts the company lookup in the background, never awaited", () => {
    assert.match(submit, /\n\s*companyLookup\(id\);/);
    assert.ok(!/await companyLookup/.test(submit), "awaiting the lookup keeps the applicant on a spinner");
  });

  it("[QA 2.8 / 3.12 / 5.28] navigates to IDMission right after starting the lookup", () => {
    const lookup = submit.indexOf("companyLookup(id);");
    const go = submit.indexOf("return navigate(`/application-form/");
    assert.ok(lookup !== -1 && go !== -1 && lookup < go, "navigation must follow the fire-and-forget lookup");
  });

  it("[QA 5.6] skips verification entirely when the company has no website", () => {
    assert.match(submit, /if \(form\?\.noWebsite\) \{\s*return goToApplicationWithDraft\(\{ createIfMissing: true \}\);/);
  });

  it("[QA 5.11] persists the no-website declaration when the box is ticked", () => {
    assert.match(src, /updateFormState\(\{ data: checked, name: "company_has_no_website" \}\)/);
  });

  it("[QA 3.10 / 3.11] surfaces the server's verification message on failure", () => {
    assert.match(submit, /toast\.error\(error\?\.data\?\.message \|\| "Failed to verify company"\)/);
  });

  it("[QA 2.5] offers no page download on the company name/URL screen", () => {
    assert.ok(!src.includes("usePageDownload"));
  });
});

describe("stepper · IDMission identity verification", () => {
  const src = read(SCREENS.singleApplication);

  it("[QA 3.16] offers manual ID entry instead of scanning", () => {
    assert.match(src, /data-testid="idmission-manual-entry-btn"/);
  });

  it("[QA 3.19] pre-populates the email from the OTP step", () => {
    assert.match(src, /email: \{ name: "email", value: email \|\| formDataOfIdMission\?\.email\?\.value \|\| user\?\.email \|\| "" \}/);
  });

  it("[QA 3.20] highlights empty required fields", () => {
    assert.match(
      read(SCREENS.textField),
      /!value && required && !isPdf && borderAndBgChangeIfEmpty \? "border-accent bg-highlighting border-2"/,
    );
  });

  it(
    "[QA 3.20] marks Zip or Postal Code as required so it is highlighted too",
    { todo: 'open: the zipCode input is labelled "Zip or Postal Code:*" but has no required prop' },
    () => {
      assert.match(around(src, 'id="zipCode"', 300, 500), /\brequired\b/);
    },
  );

  it("[QA 3.21] Enter advances field by field through the details form", () => {
    assert.match(src, /<form ref=\{idMissionFormRef\} onKeyDown=\{handleIdMissionEnter\}/);
  });

  it("[QA 3.22] uses native date inputs so both typing and the calendar work", () => {
    assert.ok((src.match(/type="date"/g) || []).length >= 2, "expected the date of birth and ID date inputs");
  });

  describe("[QA 3.23 / 3.28] typeahead suggestions", () => {
    const textField = read(SCREENS.textField);

    it("offers ID Type and ID Issuer suggestions", () => {
      assert.match(src, /suggestions=\{\["Driver's License", "State ID", "Passport"\]\}/);
      assert.match(src, /suggestions=\{ID_ISSUE_STATES_AND_COUNTRIES\}/);
    });

    it("moves through suggestions with the arrow keys", () => {
      assert.match(textField, /e\.key === "ArrowDown"/);
      assert.match(textField, /e\.key === "ArrowUp"/);
    });

    it("selects the highlighted suggestion with Enter or Tab", () => {
      assert.match(textField, /\(e\.key === "Enter" \|\| e\.key === "Tab"\) && suggestionIndex >= 0/);
    });
  });

  it("[QA 3.24] fills the address sub-fields from Google Places", () => {
    assert.match(src, /data-places-input="true"/);
    assert.match(src, /zipCode: \{ name: "zipCode", value: parsed\.zipCode \}/);
  });

  it("[QA 2.13 / 3.26 / 5.10] offers all three role choices", () => {
    for (const value of ["primaryOperatorAndController", "primaryContact", "both"]) {
      assert.match(src, new RegExp(`value: "${value}",`), value);
    }
  });

  it("[QA 2.15] refuses to continue until the signature is saved", () => {
    assert.match(src, /You must save your signature before taking the next step\./);
  });

  it("[QA 3.25] keeps Next disabled and says fields are missing until all required are filled", () => {
    assert.match(src, /disabled=\{!isAllRequiredFieldsFilled \|\| submiting\}/);
    assert.match(src, /label=\{!isAllRequiredFieldsFilled \? "Some fields are missing" : "Continue to next"\}/);
  });

  it(
    "[QA 5.33] restoring a draft renders the completed screen without the completed-step dialog",
    // The previous version of this test only scanned the file up to the saved-form
    // log line, so it passed while the restore effect below still opened the dialog.
    { todo: "open: the draft-restore effect still calls setOpenRedirectModal(true)" },
    () => {
      const restore = between(
        src,
        "if (emailVerified && draftHasIdentity && !idMissionScanAppliedRef.current) {",
        "if (!qrCode && !webLink) {",
      );
      assert.ok(!/setOpenRedirectModal\(true\)/.test(restore), "restoring a draft must not open the dialog");
    },
  );

  it(
    "[QA 5.10] does not bounce back to IDMission while the signed-in user is still loading",
    { todo: "open (suspected cause): the stepper navigates back during render when user._id is not loaded yet" },
    () => {
      assert.ok(
        !/if \(!user\?\._id\)\s*\n\s*return navigate\(`\/application-form\//.test(read(SCREENS.stepper)),
        "render-time redirect sends the applicant back to the IDMission screen",
      );
    },
  );
});

/**
 * page/admin/userApplicationForms/Hidden + applicationVerification/CustomSection -
 * QA 5.45 / 5.47: the beneficial owner could not submit because Date of Birth and
 * ID Issue Date never populated (prefill wrote `dateOfBirth` while state was
 * keyed `idMissionDateOfBirth`). Checks the violated invariant: every key a
 * prefill branch writes must exist in the form's initial state.
 */
describe("IDMission prefill keys", () => {
  const PREFILL_SCREENS = {
    "HIdden.jsx (beneficial owner)": SCREENS.hidden,
    "CustomSection.jsx (personal details)": SCREENS.customSection,
  };

  const analyse = (relPath) => {
    const source = read(relPath);
    /** Keys declared in the initial form state (the `idMission*` block). */
    const stateKeys = new Set(
      [...source.matchAll(/^\s{4}(idMission[A-Za-z0-9_]*):\s*\{\s*name:\s*"([^"]+)"/gm)].map((m) => m[1]),
    );
    /** Every `key: { name: "idMission..." }` write, with the key it was written under. */
    const namedWrites = [
      ...source.matchAll(/([A-Za-z_][A-Za-z0-9_]*):\s*\{\s*\n?\s*name:\s*"(idMission[A-Za-z0-9_]*)"/g),
    ].map((m) => ({ key: m[1], name: m[2] }));
    return { stateKeys, namedWrites };
  };

  for (const [label, relPath] of Object.entries(PREFILL_SCREENS)) {
    describe(label, () => {
      const { stateKeys, namedWrites } = analyse(relPath);

      it("declares an initial state block", () => {
        assert.ok(stateKeys.size > 10, `only found ${stateKeys.size} state keys`);
      });

      it("[QA 5.45] every prefill key matches the name it declares", () => {
        const mismatched = namedWrites.filter((w) => w.key !== w.name);
        assert.deepEqual(mismatched.map((w) => `${w.key} declares "${w.name}"`), []);
      });

      it("[QA 5.45] every prefill key exists in the initial form state", () => {
        const unknown = [...new Set(namedWrites.map((w) => w.key))].filter((k) => !stateKeys.has(k));
        assert.deepEqual(unknown, [], `written but never initialised: ${unknown.join(", ")}`);
      });

      it("[QA 5.45] the date fields that blocked submission are written correctly", () => {
        for (const name of ["idMissionDateOfBirth", "idMissionIssueDate", "idMissionIdExpiryDate"]) {
          const writes = namedWrites.filter((w) => w.name === name);
          assert.ok(writes.length > 0, `${name} is never prefilled`);
          for (const w of writes) assert.equal(w.key, name, `${name} written under key "${w.key}"`);
        }
      });
    });
  }
});

describe("stepper · company information", () => {
  const src = read(SCREENS.companyInformation);

  it("[QA 2.17] shows the NAICS spinner on the button only, leaving other fields usable", () => {
    assert.match(src, /icon=\{naicsLoading && CgSpinner\}/);
    assert.match(src, /disabled=\{naicsLoading\}/);
  });

  it("[QA 2.18 / 2.21] looks up NAICS from the business description", () => {
    assert.match(src, /findNaicsToMccDetails\(\{ description \}\)\.unwrap\(\)/);
  });

  it("[QA 2.20] lists the other possible NAICS matches to choose from", () => {
    assert.match(src, /naicsApiData\?\.otherMatches\?\.map\(/);
  });

  it(
    "[QA 2.22 / 3.30] selects a typed NAICS suggestion with the arrow keys and Enter/Tab",
    { todo: "open: the naics-code input only supports mouse selection" },
    () => {
      assert.match(around(src, 'id="naics-code"', 200, 1200), /onKeyDown/);
    },
  );

  it(
    '[QA 5.11] renders "Find NAICS" next to the business description field',
    { todo: "open: the button renders after the whole field list, above the NAICS heading" },
    () => {
      // The description is rendered inside the field list; the button must be too.
      const mapStart = src.indexOf("effectiveFields.map(");
      assert.notEqual(mapStart, -1, "field list render not found");
      let depth = 0;
      let mapEnd = -1;
      for (let i = mapStart + "effectiveFields.map".length; i < src.length; i++) {
        if (src[i] === "(") depth++;
        else if (src[i] === ")" && --depth === 0) { mapEnd = i; break; }
      }
      const button = src.indexOf("label={`Find NAICS`}");
      assert.ok(button > mapStart && button < mapEnd, "Find NAICS renders after the field list, away from the description");
    },
  );

  describe("[QA 5.11] company has no website", () => {
    it("drops the Website URL requirement when declared", () => {
      assert.match(src, /company_has_no_website/);
      assert.match(src, /f\?\.name === "website_url" \? \{ \.\.\.f, required: false \}/);
    });

    it("renders from the derived field list", () => {
      assert.match(src, /effectiveFields\.map\(/, "must render the adjusted fields, not the raw ones");
    });
  });

  describe("[QA 2.19] company tax ID", () => {
    const dynamicField = read(SCREENS.dynamicField);

    it("formats the tax ID", () => {
      assert.match(dynamicField, /const isTaxId = name\.toLowerCase\(\)\.includes\("tax"\);/);
    });

    it("lets the applicant toggle a masked value's visibility", () => {
      assert.match(dynamicField, /aria-label=\{showMasked \? "Show value" : "Hide value"\}/);
    });

    it(
      "masks all but the last 4 digits",
      { todo: "open: masked values are replaced by one * per character, hiding the last 4 too" },
      () => {
        assert.ok(!/"\*"\.repeat\(value\.toString\(\)\.length\)/.test(dynamicField));
      },
    );
  });

  it("[QA 5.29] offers Save my progress", () => {
    assert.match(src, /label=\{"Save my progress"\}/);
  });
});

describe("stepper · ownership", () => {
  const src = read(SCREENS.companyOwners);

  it("[QA 2.23] masks the SSN with a visibility toggle", () => {
    assert.match(src, /name: "rolling_owner_ssn",[\s\S]{0,300}isMasked: true/);
    assert.match(read(SCREENS.textField), /type=\{showMasked \? "password" : type\}/);
  });

  it("[QA 2.24 / 2.25] adds another owner or operator", () => {
    assert.match(src, /onClick=\{handleAddOwner\}/);
    assert.match(src, /label="Add additional owner or operator"/);
  });

  describe("[QA 5.13] other-operators question", () => {
    it('disables the "No" option when another operator is mandatory', () => {
      // The decision itself is unit-tested in lib · ownerOperatorRules above.
      assert.match(src, /requiresOtherOperators\(idMissionRoleValue\)/);
      assert.match(src, /o\.value === "no" \? \{ \.\.\.o, disabled: true \}/);
    });

    it("resolves the stored answer through the shared rule", () => {
      assert.match(src, /resolveOtherOperatorsAnswer\(current, mustHaveOtherOperators\)/);
      assert.match(src, /if \(resolved === current\) return;/, "must not write when nothing changes");
    });

    it("radio options support being disabled individually", () => {
      assert.match(read(SCREENS.dynamicField), /disabled=\{disabled \|\| option\?\.disabled\}/);
    });
  });

  it(
    "[QA 5.13] keeps Next disabled while any added owner is missing required details",
    { todo: "open: per-owner validation only checks the email address" },
    () => {
      const validation = between(src, "const allFilled", "let isOperatorExist");
      assert.match(validation, /getOwnerVal\(o, "(name|role)"\)/);
    },
  );

  it(
    '[QA 5.14] requires at least one owner with the "primary operator" or "both" role before Next',
    { todo: "open: isOperatorExist is true for any owner, regardless of role" },
    () => {
      // The applicant's own role is already checked; an ADDED owner's role is not.
      const rule = between(src, "let isOperatorExist", "At least one primary operator required");
      assert.match(rule, /owners\.some\(\(o\) =>[\s\S]{0,160}getOwnerVal\(o, "role"\)/);
    },
  );

  it(
    '[QA 5.14] offers a "Save owner" button next to "Remove"',
    { todo: "open: each owner row only has a Remove button" },
    () => {
      assert.match(around(src, 'label="Remove"', 600, 200), /label="Save Owner"/i);
    },
  );
});

describe("stepper · bank account", () => {
  const src = read(SCREENS.bankInfo);
  const dynamicField = read(SCREENS.dynamicField);

  it("[QA 2.28] explains an unverifiable routing number", () => {
    assert.match(src, /unable to verify this routing number/);
  });

  it("[QA 2.29] Enter in the routing field starts the lookup", () => {
    assert.match(src, /data-bank-field="routing"/);
    assert.match(src, /lookupTriggerRef\.current\?\.\(\)/);
  });

  describe("[QA 2.30 / 2.31] routing confirmation modal", () => {
    it('Enter confirms the bank ("Yes") instead of re-running the lookup', () => {
      assert.match(src, /if \(e\.key !== "Enter" \|\| e\.repeat\) return;[\s\S]{0,160}if \(bankModal\.bankName\) confirmBankLookup\(\);/);
    });

    it("captures Enter before the routing field can see it", () => {
      assert.match(src, /window\.addEventListener\("keydown", onKeyDown, true\)/);
    });

    it("keeps a clickable Yes button", () => {
      assert.match(src, /data-testid="bank-lookup-yes-btn"/);
    });
  });

  it("[QA 2.32] blocks pasting into the confirm account number field", () => {
    assert.match(dynamicField, /onPaste: \(e\) => e\.preventDefault\(\)/);
  });

  it("[QA 2.33] flags a mismatched confirmation number", () => {
    assert.match(src, /XCircle/);
  });

  it("[QA 2.35] suggests account holder names from the lookup, selectable by keyboard", () => {
    assert.match(src, /suggestions=\{ownersFromLookup\}/);
    assert.match(dynamicField, /e\.key === "ArrowDown"/);
  });
});

describe("stepper · transaction processing", () => {
  it("[QA 2.36] shows volume fields only for checkboxes that define them", () => {
    assert.match(read(SCREENS.dynamicField), /conditional_fields\?\.map\(/);
  });
});

describe("stepper · owner's suggestions", () => {
  // Both screens that expose owner suggestions: Bank Account and Ownership.
  for (const [label, relPath] of [["BankInfo.jsx", SCREENS.bankInfo], ["CompanyOwners.jsx", SCREENS.companyOwners]]) {
    describe(label, () => {
      const source = read(relPath);

      it("[QA 1.21/1.22] spells it \"Owner's Suggestions\" on the button", () => {
        assert.match(source, /label=\{"Owner's Suggestions"\}/);
      });

      it("[QA 1.21/1.22] spells it \"Owner's Suggestions\" on the modal title", () => {
        assert.match(source, /title="Owner's Suggestions"/);
      });

      it("no longer contains the 'Suggesstions' typo in any user-visible string", () => {
        // Internal identifiers still use the old spelling; only rendered text matters.
        const visible = [
          ...source.matchAll(/label=\{"([^"]*)"\}/g),
          ...source.matchAll(/title="([^"]*)"/g),
        ].map((m) => m[1]);
        const bad = visible.filter((s) => /suggesstion/i.test(s));
        assert.deepEqual(bad, [], `user-visible typo(s): ${bad.join(", ")}`);
      });
    });
  }

  it("[QA 4.19 / 4.20] defaults an unconfigured section to founders", () => {
    assert.match(read(SCREENS.companyOwners), /step\?\.ownerSuggesstions \|\| \["founders"\]/);
  });
});

describe("stepper · display text", () => {
  it("[QA 2.4] renders formatted display text on every step type", () => {
    for (const relPath of [
      SCREENS.customSection, SCREENS.companyInformation, SCREENS.companyOwners, SCREENS.bankInfo, SCREENS.processingInfo,
    ]) {
      assert.match(read(relPath), /html=\{step\?\.ai_formatting \|\| step\?\.displayText\}/, relPath);
    }
  });

  it("[QA 1.25] renders the saved display text on the hidden additional-owners page", () => {
    assert.match(read(SCREENS.hidden), /section\?\.ai_formatting && \(/);
  });

  /**
   * redux/apis/formApis.js - QA 1.25: saving display text closed the modal but
   * the text never appeared. The mutation invalidated "Form" while the query
   * feeding the page provided no tags, so the screen kept stale data.
   */
  describe("redux/apis · formApis · [QA 1.25] cache tags", () => {
    const source = read("redux/apis/formApis.js");
    const endpointBlock = (name) => {
      const start = source.indexOf(`${name}: builder.`);
      assert.notEqual(start, -1, `endpoint ${name} not found`);
      let depth = 0;
      for (let i = source.indexOf("{", start); i < source.length; i++) {
        if (source[i] === "{") depth++;
        else if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
      }
      throw new Error(`could not delimit ${name}`);
    };

    it("registers the Form tag type", () => {
      const m = source.match(/tagTypes:\s*\[([^\]]*)\]/);
      const tagTypes = m ? m[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean) : [];
      assert.ok(tagTypes.includes("Form"), `tagTypes: ${tagTypes.join(", ")}`);
    });

    // Both feed a page that renders section display text.
    for (const query of ["getSpecialAccessOfSection", "getSingleFormQuery"]) {
      it(`${query} provides the Form tag`, () => {
        assert.match(
          endpointBlock(query),
          /providesTags:\s*\[[^\]]*"Form"/,
          `${query} must provide "Form", or updateFormSection's invalidation is a no-op`,
        );
      });
    }

    it("updateFormSection invalidates the Form tag", () => {
      assert.match(endpointBlock("updateFormSection"), /invalidatesTags:\s*\[[^\]]*"Form"/);
    });
  });
});

describe("stepper · download this page", () => {
  it("[QA 2.5] shows the IDMission download only once identity details exist", () => {
    assert.match(read(SCREENS.singleApplication), /getHasFields: \(\) => !!\(idMissionVerified && idMissionDetailsReady\)/);
  });

  it("[QA 2.6 / 3.40] pulls agreement documents linked from the page's display text", () => {
    assert.match(read("hooks/usePageDownload.js"), /extractHttpLinks\(displayHtml\)/);
    assert.match(read("utils/buildPagePdf.js"), /Agreement: \$\{agreement\.title \|\| agreement\.url\}/);
  });

  it("[QA 3.36 / 3.40] stamps the PDF with the download time and who completed it", () => {
    const pdf = read("utils/buildPagePdf.js");
    assert.match(pdf, /Downloaded: \$\{timestamp\}/);
    assert.match(pdf, /Completed by: /);
  });
});

describe("stepper · agreement, documents and submission", () => {
  it("[QA 2.39 / 5.18] labels Submit as missing fields until the agreement is complete", () => {
    assert.match(read(SCREENS.agreement), /"Some required fields are missing" : "Submit"/);
  });

  it("[QA 3.41] opens display-text links in the document modal", () => {
    const src = read(SCREENS.agreement);
    assert.match(src, /makeDocLinkHandler\(setOpenDoc\)/);
    assert.match(src, /<DocumentModal url=\{openDoc\.url\}/);
  });

  it("[QA 2.40] uploads Articles of Incorporation and submits", () => {
    const src = read(SCREENS.documents);
    assert.match(src, /<FileUploader/);
    assert.match(src, /onClick=\{submitFileDataHandler\}/);
  });

  it("[QA 2.41 / 3.45] downloads the full application PDF after submission", () => {
    const src = read(SCREENS.submission);
    assert.match(src, /generatePdfForm\(\{ _id: formId, userId \}\)/);
    assert.match(src, /Download PDF/);
  });

  it("[QA 2.42 / 3.44] sends I'm finished to the form's configured redirect URL", () => {
    const src = read(SCREENS.submission);
    assert.match(src, /const continueUrl = form\?\.data\?\.redirectUrl \|\| ['"]\/['"];/);
    assert.match(src, /<Link to=\{continueUrl\}>/);
  });
});

describe("stepper · [QA 5.23] application PDF header logo", () => {
  const src = read(SCREENS.pdfView);

  it("keeps its aspect ratio instead of being forced square", () => {
    const logoImg = around(src, 'alt="Logo"', 200, 200);
    // Height is pinned, width follows the aspect ratio, and it is capped so a
    // wide logo cannot push the title off the header.
    assert.match(logoImg, /\bh-\d/, "height must be constrained");
    assert.match(logoImg, /\bw-auto\b/, "width must follow the aspect ratio");
    assert.match(logoImg, /\bmax-w-/, "width must still be capped");
    assert.match(logoImg, /object-contain/);
  });

  it("no longer forces the logo into a fixed square", () => {
    assert.ok(!/h-15 w-15/.test(src), "a fixed square squashed every non-square logo");
    assert.ok(!/\}`\}/.test(around(src, 'alt="Logo"', 0, 200)), "stray brace in the className must stay removed");
  });
});

describe("stepper · customize form", () => {
  it("[QA 4.16] opens the Customize dialog and saves the form", () => {
    const src = read("components/applicationVerification/companyInfo/CustomizationFieldsModal.jsx");
    assert.match(src, /saveFormHandler\(fieldsData\)/);
    assert.match(src, /Save Form/);
  });
});

describe("stepper · hidden beneficial-owner form", () => {
  it("[QA 5.45] keeps Submit disabled until every required field is filled", () => {
    const src = read(SCREENS.hidden);
    assert.match(src, /disabled=\{isSubmittingSpecialAccessForm \|\| !isAllRequiredFieldsFilled\}/);
    assert.match(src, /isAllRequiredFieldsFilled \? "Submit" : "Fill All Required Fields"/);
  });

  it(
    "[QA 5.44] sends a beneficial owner from Drafts and Submissions to the form they must complete",
    { todo: "open: resuming only routes to verification or IDMission, never to the hidden owner form" },
    () => {
      assert.match(read("components/admin/Draft.jsx"), /navigate\(`\/hidden\//);
    },
  );
});

describe("stepper · page layout", () => {
  it(
    "[QA 5.11 / 5.13] keeps Previous/Next reachable - steps do not nest their own scroll container",
    { todo: "open (suspected cause): step roots add overflow-auto inside the dashboard's scroller" },
    () => {
      assert.ok(!/className="mt-14 h-full overflow-auto"/.test(read(SCREENS.companyInformation)));
      assert.ok(!/className="h-full w-full overflow-auto"/.test(read(SCREENS.companyOwners)));
    },
  );
});
