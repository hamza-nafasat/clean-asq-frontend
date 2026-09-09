/**
 * Module:  lib
 * Unit:    src/lib/sectionCompletion.js
 * Covers:  QA script item 3.45 - the application PDF rendered blank pages for
 *          hidden sections (Articles of Incorporation, Additional Owners).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasFieldValue, sectionEntries, sectionHasData, sectionsForPdf } from "../../lib/sectionCompletion.js";

const SECTIONS = [
  { key: "company_information", title: "company_information_blk", isHidden: false },
  { key: "agreement", title: "agreement_blk", isHidden: false },
  { key: "incorporation_article", title: "incorporation_article_blk", isHidden: true },
  { key: "additional_owners", title: "custom_section", isHidden: true },
];

const VISIBLE_KEYS = ["company_information", "agreement"];
const field = (name, value) => ({ name, value });
const keysForPdf = (data) => sectionsForPdf(SECTIONS, data).map((s) => s.key);

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
