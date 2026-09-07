/**
 * Module:  page/admin/userApplicationForms/Hidden
 * Unit:    HIdden.jsx - IDMission prefill
 * Covers:  QA items 5.45 / 5.47 - the beneficial owner could not submit because
 *          Date of Birth and ID Issue Date never populated. The prefill branches
 *          wrote `dateOfBirth` / `issueDate` while the form state was keyed
 *          `idMissionDateOfBirth` / `idMissionIssueDate`, so those two required
 *          fields stayed empty and the button stuck on "Fill All Required
 *          Fields".
 *
 * Rather than assert the three lines that were wrong, this checks the invariant
 * that was violated: every key a prefill branch writes must exist in the form's
 * initial state. That catches the next mismatch too.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

// Both screens hydrate the same IDMission field set from the same payload, and
// both had the same mismatch. Guard them together.
const SCREENS = {
  "HIdden.jsx (beneficial owner)": "src/page/admin/userApplicationForms/Hidden/HIdden.jsx",
  "CustomSection.jsx (personal details)": "src/components/applicationVerification/CustomSection.jsx",
};

const analyse = (relPath) => {
  const source = readFileSync(path.join(root, relPath), "utf8");
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

describe("IDMission prefill keys", () => {
  for (const [label, relPath] of Object.entries(SCREENS)) {
    describe(label, () => {
      const { stateKeys, namedWrites } = analyse(relPath);

      it("declares an initial state block", () => {
        assert.ok(stateKeys.size > 10, `only found ${stateKeys.size} state keys`);
      });

      it("[QA 5.45] every prefill key matches the name it declares", () => {
        // A branch writing `dateOfBirth: { name: "idMissionDateOfBirth" }` lands
        // in a key nothing reads - exactly the bug.
        const mismatched = namedWrites.filter((w) => w.key !== w.name);
        assert.deepEqual(
          mismatched.map((w) => `${w.key} declares "${w.name}"`),
          [],
        );
      });

      it("[QA 5.45] every prefill key exists in the initial form state", () => {
        const unknown = [...new Set(namedWrites.map((w) => w.key))].filter((k) => !stateKeys.has(k));
        assert.deepEqual(unknown, [], `written but never initialised: ${unknown.join(", ")}`);
      });

      it("[QA 5.45] the date fields that blocked submission are written correctly", () => {
        for (const field of ["idMissionDateOfBirth", "idMissionIssueDate", "idMissionIdExpiryDate"]) {
          const writes = namedWrites.filter((w) => w.name === field);
          assert.ok(writes.length > 0, `${field} is never prefilled`);
          for (const w of writes) assert.equal(w.key, field, `${field} written under key "${w.key}"`);
        }
      });
    });
  }
});
