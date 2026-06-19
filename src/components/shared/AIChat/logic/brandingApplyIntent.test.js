import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  shouldBlockBrandingApplyForModalRequest,
  shouldBlockMistakenBrandingApply,
  isExplicitBrandingApplyIntent,
  getMistakenBrandingApplyDeclineMessage,
  APPLY_BRANDING_MODAL_DECLINE_MESSAGE,
} from "./brandingApplyIntent.js";

describe("brandingApplyIntent", () => {
  it("blocks apply-branding modal requests only", () => {
    const phrases = [
      "open the apply branding modal for fintanium branding",
      "can you able to open the modal of apply branding",
      "open the apply branding modal",
    ];
    for (const phrase of phrases) {
      assert.equal(shouldBlockBrandingApplyForModalRequest(phrase), true, phrase);
    }
  });

  it("does not treat other modals as apply-branding modal", () => {
    const phrases = [
      "can you able to open the modal of update form",
      "can you able to open the setlocation modal",
      "can you open the manage rule page",
    ];
    for (const phrase of phrases) {
      assert.equal(shouldBlockBrandingApplyForModalRequest(phrase), false, phrase);
      assert.equal(shouldBlockMistakenBrandingApply(phrase), true, phrase);
      assert.notEqual(getMistakenBrandingApplyDeclineMessage(phrase), APPLY_BRANDING_MODAL_DECLINE_MESSAGE, phrase);
    }
  });

  it("allows explicit branding apply requests", () => {
    const applyPhrases = [
      "apply the CompleatPay branding for website",
      "apply CompleatPay branding for home page only CompleatPay",
      "now i want you to apply compleatpay branding on home page",
      "apply compleatpay branding on for whole website as well",
      "apply Fintanium branding to form X",
    ];
    for (const phrase of applyPhrases) {
      assert.equal(shouldBlockMistakenBrandingApply(phrase), false, phrase);
      assert.equal(isExplicitBrandingApplyIntent(phrase), true, phrase);
    }
  });
});
