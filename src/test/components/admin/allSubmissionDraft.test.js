/**
 * Module:  components/admin
 * Unit:    AllSubmissionDraft.jsx
 * Covers:  QA 5.22 - drafts and submissions were split across tabs defaulting to
 *          "Draft", so an applicant whose only application was submitted saw a
 *          blank page and assumed their work was lost.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const source = readFileSync(path.join(root, "src/components/admin/AllSubmissionDraft.jsx"), "utf8");

describe("components/admin · AllSubmissionDraft", () => {
  it("[QA 5.22] no longer uses tabs", () => {
    for (const marker of ["activeTab", "setActiveTab", "tabs.map"]) {
      assert.ok(!source.includes(marker), `tab machinery still present: ${marker}`);
    }
  });

  it("[QA 5.22] renders both lists on the same page", () => {
    assert.match(source, /<Draft\b/, "Draft list must render");
    assert.match(source, /<Submission\b/, "Submission list must render");
    // Neither may sit behind a ternary that hides the other.
    assert.ok(!/\?\s*<Draft[\s\S]*:\s*<Submission/.test(source), "lists must not be mutually exclusive");
  });

  it("[QA 5.22] uses plain language rather than draft/submission jargon", () => {
    assert.match(source, /In progress/);
    assert.match(source, /Submitted/);
  });

  it("[QA 5.22] shows an empty state instead of a blank page", () => {
    assert.match(source, /no applications yet/i);
  });
});
