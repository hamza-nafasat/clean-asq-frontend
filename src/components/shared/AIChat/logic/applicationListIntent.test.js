import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isViewPdfIntent,
  isForwardFormIntent,
  isUnderwritingIntent,
  shouldBlockMistakenViewApplication,
  FORWARD_FORM_DECLINE_MESSAGE,
  getMistakenViewApplicationMessage,
} from "./applicationListIntent.js";

describe("applicationListIntent", () => {
  it("detects view pdf intent", () => {
    assert.equal(isViewPdfIntent("can you open the view pdf for this"), true);
    assert.equal(isViewPdfIntent("open the application detail"), true);
  });

  it("detects forward form intent", () => {
    assert.equal(isForwardFormIntent("open the forward form"), true);
    assert.equal(shouldBlockMistakenViewApplication("open the forward form"), true);
    assert.equal(getMistakenViewApplicationMessage("open the forward form"), FORWARD_FORM_DECLINE_MESSAGE);
  });

  it("detects underwriting intent", () => {
    assert.equal(isUnderwritingIntent("open underwriting"), true);
    assert.equal(shouldBlockMistakenViewApplication("open underwriting"), true);
    assert.equal(getMistakenViewApplicationMessage("open underwriting"), null);
  });

  it("does not confuse view pdf with forward or underwriting", () => {
    assert.equal(isViewPdfIntent("open the forward form"), false);
    assert.equal(isViewPdfIntent("open underwriting"), false);
  });
});
