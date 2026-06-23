import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveNavigationPageFromText,
  isModalOnlyRequest,
  shouldClientNavigateFromMessage,
} from "./navigationIntent.js";

describe("navigationIntent", () => {
  it("resolves navigation phrases from branding chat misuse", () => {
    assert.equal(resolveNavigationPageFromText("go to home page"), "home");
    assert.equal(resolveNavigationPageFromText("go to applications form page"), "application-forms");
    assert.equal(resolveNavigationPageFromText("open application from page"), "applications");
    assert.equal(resolveNavigationPageFromText("take me to the applications page"), "applications");
    assert.equal(resolveNavigationPageFromText("navigate to application forms"), "application-forms");
  });

  it("client-navigates pure navigation without calling AI", () => {
    assert.equal(shouldClientNavigateFromMessage("go to home page"), "home");
    assert.equal(shouldClientNavigateFromMessage("take me to the applications page"), "applications");
    assert.equal(shouldClientNavigateFromMessage("now apply google inc branding to first form"), null);
    assert.equal(shouldClientNavigateFromMessage("go to application forms and create a new form"), null);
  });

  it("routes branding list vs create separately", () => {
    assert.equal(resolveNavigationPageFromText("take me to branding"), "branding");
    assert.equal(resolveNavigationPageFromText("open the branding page"), "branding");
    assert.equal(resolveNavigationPageFromText("go to branding management"), "branding");
    assert.equal(resolveNavigationPageFromText("open new branding page"), "branding-create");
    assert.equal(resolveNavigationPageFromText("create new branding"), "branding-create");
    assert.equal(shouldClientNavigateFromMessage("take me to branding"), "branding");
    assert.equal(shouldClientNavigateFromMessage("open new branding page"), "branding-create");
    assert.equal(shouldClientNavigateFromMessage("create new branding"), "branding-create");
  });

  it("does not treat modal requests as navigation", () => {
    assert.equal(resolveNavigationPageFromText("open the apply branding modal"), null);
    assert.equal(resolveNavigationPageFromText("open the setlocation modal"), null);
    assert.equal(isModalOnlyRequest("open the update form modal"), true);
  });
});
