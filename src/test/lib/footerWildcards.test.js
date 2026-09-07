/**
 * Module:  lib
 * Unit:    src/lib/footerWildcards.js
 * Covers:  QA script item 1.7 note - the "+ {Year}" / "+ {Company}" buttons.
 *          The insert token and the substitution had drifted ({Company} vs
 *          {company}), so the company wildcard rendered literally in the footer.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FOOTER_WILDCARDS, renderFooterText } from "../../lib/footerWildcards.js";

const YEAR = String(new Date().getFullYear());

describe("lib · footerWildcards", () => {
  describe("FOOTER_WILDCARDS", () => {
    it("[QA 1.7] exposes the exact tokens the insert buttons write", () => {
      assert.equal(FOOTER_WILDCARDS.year, "{year}");
      assert.equal(FOOTER_WILDCARDS.company, "{company}");
    });

    it("every exposed token is resolved by renderFooterText", () => {
      // The drift guard: a token the buttons can insert but the renderer cannot
      // substitute would print literally in the footer.
      for (const token of Object.values(FOOTER_WILDCARDS)) {
        const out = renderFooterText(token, "Acme");
        assert.ok(!out.includes(token), `${token} was not substituted`);
      }
    });
  });

  describe("renderFooterText()", () => {
    it("substitutes the default footer text", () => {
      assert.equal(
        renderFooterText("©{year} {company}, All Rights Reserved", "Acme"),
        `©${YEAR} Acme, All Rights Reserved`,
      );
    });

    it("[QA 1.7] still substitutes legacy capitalised tokens", () => {
      // Brandings saved before the fix contain "{Company}".
      assert.equal(renderFooterText("©{Year} {Company}", "Acme"), `©${YEAR} Acme`);
    });

    it("substitutes every occurrence, not just the first", () => {
      assert.equal(renderFooterText("{company} — {company}", "Acme"), "Acme — Acme");
    });

    it("renders an empty company as empty rather than 'undefined'", () => {
      assert.equal(renderFooterText("©{year} {company}", ""), `©${YEAR} `);
      assert.equal(renderFooterText("©{year} {company}", undefined), `©${YEAR} `);
    });

    it("leaves text without wildcards untouched", () => {
      assert.equal(renderFooterText("All Rights Reserved", "Acme"), "All Rights Reserved");
    });
  });

  describe("malformed input", () => {
    it("handles empty and nullish templates", () => {
      for (const t of ["", null, undefined]) assert.equal(renderFooterText(t, "Acme"), "");
    });
  });
});
