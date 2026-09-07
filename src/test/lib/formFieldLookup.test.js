/**
 * Module:  lib
 * Unit:    src/lib/formFieldLookup.js
 * Covers:  QA 5.13 - "Yes" was never auto-selected because the lookup searched
 *          the form KEY for the field name. Keys are uniqueIds, and for any
 *          database-backed field that is an opaque random string, so the match
 *          never succeeded. The same defect silently broke the operator
 *          validation that reads the very same field.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findFieldKeyByName, getFieldValueByName } from "../../lib/formFieldLookup.js";

// A realistic form: DB fields carry opaque uniqueIds, frontend-declared fields
// happen to use their own name as the uniqueId.
const FORM = {
  m2k3j4a1b2c3xyz1234: { name: "additional_owners_own_25_percent_or_more", value: "no" },
  rolling_owner_is_also_owner: { name: "rolling_owner_is_also_owner", value: "yes" },
  k9f2h1q7w3e5r8t0: { name: "ssn", value: "123-45-6789" },
  signature: { name: "signature", value: "" },
};

describe("lib · formFieldLookup", () => {
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
