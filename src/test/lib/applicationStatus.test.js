/**
 * Module:  lib
 * Unit:    src/lib/applicationStatus.js
 * Covers:  drafts and submissions now share one page (QA 5.22), so each card
 *          must state its own status instead of relying on which tab the
 *          applicant was looking at.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { APPLICATION_STATUS, getApplicationStatusMeta } from "../../lib/applicationStatus.js";

describe("lib · applicationStatus", () => {
  describe("getApplicationStatusMeta()", () => {
    it("gives every known status a non-empty label", () => {
      // The exact wording is a product decision and may change; what must hold
      // is that each status renders something readable.
      for (const status of Object.values(APPLICATION_STATUS)) {
        const { label } = getApplicationStatusMeta(status);
        assert.equal(typeof label, "string", status);
        assert.ok(label.trim().length > 0, `${status} has no label`);
      }
    });

    it("gives the two statuses different labels", () => {
      assert.notEqual(
        getApplicationStatusMeta(APPLICATION_STATUS.draft).label,
        getApplicationStatusMeta(APPLICATION_STATUS.submitted).label,
      );
    });

    it("gives the two states visibly different colours", () => {
      const draft = getApplicationStatusMeta(APPLICATION_STATUS.draft).className;
      const submitted = getApplicationStatusMeta(APPLICATION_STATUS.submitted).className;
      assert.notEqual(draft, submitted, "statuses must be distinguishable at a glance");
      assert.match(draft, /amber/);
      assert.match(submitted, /green/);
    });

    it("explains each status in a tooltip", () => {
      assert.ok(getApplicationStatusMeta(APPLICATION_STATUS.draft).description.length > 0);
      assert.ok(getApplicationStatusMeta(APPLICATION_STATUS.submitted).description.length > 0);
    });
  });

  describe("unknown status", () => {
    it("never renders blank or crashes", () => {
      for (const status of [undefined, null, "", "archived", 42]) {
        const meta = getApplicationStatusMeta(status);
        assert.ok(meta.label, `no label for ${String(status)}`);
        assert.ok(meta.className, `no styling for ${String(status)}`);
      }
    });
  });

  describe("APPLICATION_STATUS", () => {
    it("exposes both states so callers never hard-code the strings", () => {
      assert.deepEqual(Object.keys(APPLICATION_STATUS).sort(), ["draft", "submitted"]);
    });
  });
});
