/**
 * Module:  lib
 * Unit:    src/lib/ownerOperatorRules.js
 * Covers:  QA 5.13 - when the applicant declared they are only the primary
 *          contact, "No" must be unselectable on the other-operators question
 *          and "Yes" must be chosen for them.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRIMARY_CONTACT_ONLY,
  requiresOtherOperators,
  resolveOtherOperatorsAnswer,
} from "../../lib/ownerOperatorRules.js";

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
