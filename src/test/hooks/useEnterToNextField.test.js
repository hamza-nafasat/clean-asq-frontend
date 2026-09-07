/**
 * Module:  hooks
 * Unit:    src/hooks/useEnterToNextField.js
 * Covers:  Company Verification - Enter should walk legal name -> website URL ->
 *          "this company has no website" checkbox, and submit from the checkbox.
 *          Checkboxes were excluded from the sequence outright, so Enter jumped
 *          straight from the URL field to submit and the checkbox was skipped.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isEnterSequenceType } from "../../hooks/useEnterToNextField.js";

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
    it("walks name -> url -> checkbox when the URL field is visible", () => {
      const page = ["text", "url", "checkbox"];
      const inSequence = page.filter((t) => isEnterSequenceType(t, true));
      assert.deepEqual(inSequence, ["text", "url", "checkbox"]);
      // The checkbox is last, so Enter on it triggers the submit callback.
      assert.equal(inSequence[inSequence.length - 1], "checkbox");
    });

    it('walks name -> checkbox when "no website" hid the URL field', () => {
      const page = ["text", "checkbox"];
      assert.deepEqual(page.filter((t) => isEnterSequenceType(t, true)), ["text", "checkbox"]);
    });

    it("would have skipped the checkbox before the opt-in existed", () => {
      const page = ["text", "url", "checkbox"];
      assert.deepEqual(page.filter((t) => isEnterSequenceType(t, false)), ["text", "url"]);
    });
  });
});
