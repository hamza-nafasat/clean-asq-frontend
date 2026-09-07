/**
 * Module:  components/applicationVerification
 * Covers:  QA items 1.21 / 1.22 - the button and modal read
 *          "Owners Suggesstions"; it should read "Owner's Suggestions".
 *
 * These are JSX literals, so the components cannot be imported here. Asserted
 * against source text - enough to catch the typo returning.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const read = (p) => readFileSync(path.join(root, "src/components/applicationVerification", p), "utf8");

// Both screens that expose owner suggestions: Bank Account and Ownership.
const SCREENS = ["BankInfo.jsx", "CompanyOwners.jsx"];

describe("components/applicationVerification · owner suggestions label", () => {
  for (const file of SCREENS) {
    describe(file, () => {
      const source = read(file);

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
});
