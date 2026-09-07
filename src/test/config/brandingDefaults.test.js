/**
 * Module:  config (Vite env) + branding page defaults
 * Covers:  QA items 1.6, 1.7 and 4.7 - Terms of Service / Privacy Policy URLs
 *          did not default; and 1.10 - the browser tab title did not default.
 *
 * These defaults live in `.env` and in component useState initialisers, neither
 * of which Node can execute (import.meta.env is Vite-only, and the component
 * pulls in JSX). They are asserted against source text instead - a narrower
 * guarantee than a runtime test, but it still fails loudly if a default is
 * removed, which is exactly how 1.6/1.7 regressed in the first place.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

const env = read(".env");
const brandingPage = read("src/components/admin/brandings/globalBranding/GlobalBrandingPage.jsx");

/** Value of KEY="value" / KEY=value in a dotenv file. */
const envValue = (key) => {
  const m = env.match(new RegExp(`^\\s*${key}\\s*=\\s*"?([^"\\n\\r]*)"?`, "m"));
  return m ? m[1].trim() : null;
};

describe("config · branding defaults", () => {
  describe("[QA 1.6 / 1.7 / 4.7] legal URL defaults", () => {
    it("defines the Terms of Service default", () => {
      assert.equal(envValue("VITE_TERMS_OF_SERVICE_URL"), "https://fintainium.com/t&c/");
    });

    it("defines the Privacy Policy default", () => {
      assert.equal(envValue("VITE_PRIVACY_POLICY_URL"), "https://fintainium.com/pp/");
    });

    it("seeds both fields from env rather than an empty string", () => {
      assert.match(brandingPage, /useState\(getEnv\("VITE_PRIVACY_POLICY_URL"\)\)/);
      assert.match(brandingPage, /useState\(getEnv\("VITE_TERMS_OF_SERVICE_URL"\)\)/);
    });

    it("exposes both keys through the env helper", () => {
      const envHelper = read("src/lib/env.js");
      assert.match(envHelper, /VITE_PRIVACY_POLICY_URL/);
      assert.match(envHelper, /VITE_TERMS_OF_SERVICE_URL/);
    });
  });

  describe("[QA 1.10] browser tab title default", () => {
    it('seeds the tab title with "Online-Application"', () => {
      assert.match(brandingPage, /const \[tabTitle, setTabTitle\] = useState\("Online-Application"\)/);
    });
  });
});
