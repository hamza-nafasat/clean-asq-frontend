/**
 * Module:  components/applicationVerification + related screens
 * Covers:  QA 5.3b (Skip visibility), 5.5 (email logo), 5.11 (no-website),
 *          5.13 (operator radio), 5.23 (PDF logo), 5.33 (resume dialog).
 *
 * These changes live inside JSX that Node cannot import, so they are asserted
 * against source text. Narrower than a runtime test, but each one fails loudly
 * if the fix is reverted.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const read = (p) => readFileSync(path.join(root, "src", p), "utf8");

describe("Part 5 · applicant flow fixes", () => {
  describe("[QA 5.3b] OTP Skip button", () => {
    const src = read("page/admin/userApplicationForms/ApplicationVerification/SingleApplication.jsx");

    it("is gated on isCreator, not on any signed-in user", () => {
      const skipBlock = src.slice(
        src.indexOf('label={"Skip"}') - 800,
        src.indexOf('label={"Skip"}') + 40,
      );
      assert.match(skipBlock, /\{isCreator && \(/, "Skip must be creator-only");
      assert.ok(!/\{user\?\._id && \(/.test(skipBlock), "must not show for every signed-in user");
    });
  });

  describe("[QA 5.5] email header logo", () => {
    const src = read("components/admin/brandings/globalBranding/GlobalBrandingPage.jsx");

    it("interpolates the logo unescaped so query params survive", () => {
      assert.match(src, /src="\{\{\{logo\}\}\}"/);
      assert.ok(!/src="\{\{logo\}\}"/.test(src), "escaped interpolation breaks Cloudinary URLs");
    });

    it("validates the URL before interpolating it raw", () => {
      assert.match(src, /logo: safeImageUrl\(/);
    });

    it("quotes the align attribute", () => {
      assert.match(src, /align="\{\{headerAlignment\}\}"/);
    });
  });

  describe("[QA 5.11] company has no website", () => {
    it("the declaration is persisted when the box is ticked", () => {
      assert.match(
        read("components/admin/varification/CompanyVerification.jsx"),
        /updateFormState\(\{ data: checked, name: "company_has_no_website" \}\)/,
      );
    });

    it("Company Info drops the Website URL requirement when declared", () => {
      const src = read("components/applicationVerification/CompanyInformation.jsx");
      assert.match(src, /company_has_no_website/);
      assert.match(src, /f\?\.name === "website_url" \? \{ \.\.\.f, required: false \}/);
    });

    it("Company Info renders from the derived field list", () => {
      const src = read("components/applicationVerification/CompanyInformation.jsx");
      assert.match(src, /effectiveFields\.map\(/, "must render the adjusted fields, not the raw ones");
    });
  });

  describe("[QA 5.13] other-operators question", () => {
    const src = read("components/applicationVerification/CompanyOwners.jsx");

    it('disables "No" when the applicant is only the primary contact', () => {
      assert.match(src, /mustHaveOtherOperators = idMissionRoleValue === "primaryContact"/);
      assert.match(src, /o\.value === "no" \? \{ \.\.\.o, disabled: true \}/);
    });

    it('pre-selects "Yes" without overwriting a saved answer', () => {
      assert.match(src, /if \(!key \|\| form\[key\]\?\.value\) return;/);
    });

    it("radio options support being disabled individually", () => {
      assert.match(
        read("components/shared/small/DynamicField.jsx"),
        /disabled=\{disabled \|\| option\?\.disabled\}/,
      );
    });
  });

  describe("[QA 5.23] PDF header logo", () => {
    const src = read("page/admin/userApplicationForms/ApplicationVerification/ApplicationPdfView.jsx");

    it("keeps its aspect ratio instead of being forced square", () => {
      assert.match(src, /className="h-12 w-auto max-w-\[220px\] object-contain"/);
      assert.ok(!/h-15 w-15/.test(src), "fixed square squashed non-square logos");
    });
  });

  describe("[QA 5.33] resuming a completed step", () => {
    const src = read("page/admin/userApplicationForms/ApplicationVerification/SingleApplication.jsx");

    it("does not open the completed-step dialog on draft restore", () => {
      const restore = src.slice(0, src.indexOf("] → idMissionVerified=true") + 400);
      assert.ok(
        !/setOpenRedirectModal\(true\)/.test(restore),
        "restoring a draft must render the completed screen, not a dialog",
      );
    });
  });
});
