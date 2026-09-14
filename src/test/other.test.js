/**
 * Category: Other - branding, email templates, strategies, form administration,
 *           authentication and applications (frontend)
 * Covers:   every QA script item in Parts 1-5 outside the AI assistant and the
 *           application flow: branding creation and extraction (1.2-1.11, 4.6,
 *           4.7), applying branding (1.12-1.14), email templates (1.15-1.18,
 *           5.5), strategies (1.19, 3.1, 5.25), the Application Forms page (1.1,
 *           1.20, 3.2, 5.1, 5.26), sign-in and password reset (5.19, 5.21,
 *           5.30, 5.31, 5.35-5.37, 5.42) and the drafts / applications pages
 *           (5.22, 5.39-5.41).
 *
 * Sections:
 *   1. pure logic          runtime tests
 *   2. page contracts      source-text assertions
 *
 * Tests marked `todo` guard a QA item that is still open; they do not fail `npm test`.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { FOOTER_WILDCARDS, renderFooterText } from "../lib/footerWildcards.js";
import { safeImageUrl } from "../lib/safeImageUrl.js";
import { executeBrandingAssignment } from "../lib/executeBrandingAssignment.js";
import { APPLICATION_STATUS, getApplicationStatusMeta } from "../lib/applicationStatus.js";
import { brandedButtonStyle, isUsableColor, readableTextOn, relativeLuminance } from "../lib/brandedButtonStyle.js";
import {
  EFFECT_OPTIONS,
  EFFECT_PRESETS,
  effectToBoxShadow,
  encodeEffectState,
  materialName,
  materialToGloss,
  parseEffectState,
  parseEffectValue,
} from "../lib/effectPresets.js";
import checkPermission, { webPermissions } from "../utils/checkPermission.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => readFileSync(path.join(root, p), "utf8");
const readSrc = (p) => read(path.join("src", p));

/** Source around the first occurrence of `marker`. */
const around = (source, marker, before = 300, after = 300) => {
  const at = source.indexOf(marker);
  assert.notEqual(at, -1, `marker not found: ${marker}`);
  return source.slice(Math.max(0, at - before), at + after);
};

const BRANDING = "components/admin/brandings/globalBranding";

// ═════════════════════════════════════════════════════════════════════════════
// 1. pure logic
// ═════════════════════════════════════════════════════════════════════════════

/**
 * lib/footerWildcards.js - QA 1.7 note: the "+ {Year}" / "+ {Company}" buttons.
 * The insert token and the substitution had drifted ({Company} vs {company}),
 * so the company wildcard rendered literally in the footer.
 */
describe("lib · footerWildcards", () => {
  const YEAR = String(new Date().getFullYear());

  describe("FOOTER_WILDCARDS", () => {
    it("[QA 1.7] exposes the exact tokens the insert buttons write", () => {
      assert.equal(FOOTER_WILDCARDS.year, "{year}");
      assert.equal(FOOTER_WILDCARDS.company, "{company}");
    });

    it("every exposed token is resolved by renderFooterText", () => {
      // A token the buttons can insert but the renderer cannot substitute
      // would print literally in the footer.
      for (const token of Object.values(FOOTER_WILDCARDS)) {
        assert.ok(!renderFooterText(token, "Acme").includes(token), `${token} was not substituted`);
      }
    });
  });

  describe("renderFooterText()", () => {
    it("substitutes the default footer text", () => {
      assert.equal(renderFooterText("©{year} {company}, All Rights Reserved", "Acme"), `©${YEAR} Acme, All Rights Reserved`);
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

/**
 * lib/safeImageUrl.js - QA 5.5: the logo did not render in the OTP email.
 * Handlebars escaped the URL ("&" -> "&amp;"), so the template now interpolates
 * it unescaped and this validator replaces the lost protection.
 */
describe("lib · safeImageUrl", () => {
  describe("[QA 5.5] passes the URLs that were being mangled", () => {
    it("keeps a Cloudinary transformation URL intact", () => {
      const url = "https://res.cloudinary.com/x/image/upload/w_300&h_100/logo.png";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps a signed URL with several query params intact", () => {
      const url = "https://cdn.example.com/logo.png?w=300&h=100&sig=abc";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps a plain https URL", () => {
      const url = "https://res.cloudinary.com/x/image/upload/v1/logo.png";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps an inline base64 image", () => {
      const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
      assert.equal(safeImageUrl(url), url);
    });
  });

  describe("rejects anything that could break out of the attribute", () => {
    it("rejects a quote that would close the src attribute", () => {
      assert.equal(safeImageUrl('https://x/a.png" onerror="alert(1)'), "");
    });

    it("rejects angle brackets and backticks", () => {
      for (const url of ["https://x/<script>.png", "https://x/`.png", "https://x/a>.png"]) {
        assert.equal(safeImageUrl(url), "", url);
      }
    });

    it("rejects whitespace inside the URL", () => {
      assert.equal(safeImageUrl("https://x/a b.png"), "");
    });

    it("rejects javascript: and other non-http protocols", () => {
      for (const url of ["javascript:alert(1)", "file:///etc/passwd", "ftp://x/a.png"]) {
        assert.equal(safeImageUrl(url), "", url);
      }
    });

    it("rejects a non-image data URI", () => {
      assert.equal(safeImageUrl("data:text/html;base64,PHNjcmlwdD4="), "");
    });

    it("rejects relative and malformed URLs", () => {
      for (const url of ["/logo.png", "logo.png", "://x"]) assert.equal(safeImageUrl(url), "", url);
    });
  });

  describe("malformed input", () => {
    it("returns an empty string for empty or non-string input", () => {
      for (const v of ["", "   ", null, undefined, 42, {}, []]) assert.equal(safeImageUrl(v), "");
    });
  });
});

describe("lib · executeBrandingAssignment", () => {
  it("[QA 1.13 / 4.10] unwraps the RTK mutation trigger once (not pre-unwrapped)", async () => {
    let called = false;
    const addBrandingMutation = (args) => {
      called = true;
      return { unwrap: async () => ({ success: true, message: "ok", args }) };
    };

    const res = await executeBrandingAssignment({
      addBrandingMutation,
      assignment: { brandingId: "b1", applyToHome: true },
    });

    assert.equal(called, true);
    assert.equal(res.success, true);
    assert.equal(res.args.onHome, "yes");
  });

  it("[QA 1.13 / 4.11] refreshes the profile so the home page shows the branding", async () => {
    const profile = { success: true, data: { branding: { colors: { primary: "#111" } } } };
    const res = await executeBrandingAssignment({
      addBrandingMutation: () => ({ unwrap: async () => ({ success: true }) }),
      getUserProfile: () => ({ unwrap: async () => profile }),
      brandingSetters: { setPrimaryColor: () => {} },
      dispatchUserRefresh: async (p) => {
        assert.equal(p, profile);
      },
      assignment: { brandingId: "b1", applyToHome: true },
    });
    assert.equal(res.success, true);
  });
});

/**
 * lib/applicationStatus.js - drafts and submissions share one page (QA 5.22),
 * so each card must state its own status.
 */
describe("lib · applicationStatus", () => {
  describe("getApplicationStatusMeta()", () => {
    it("[QA 5.22] gives every known status a non-empty label", () => {
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

describe("lib · brandedButtonStyle", () => {
  describe("isUsableColor()", () => {
    it("accepts 3- and 6-digit hex, ignoring surrounding whitespace", () => {
      for (const c of ["#fff", "#FFFFFF", " #1a3a5c "]) assert.equal(isUsableColor(c), true, c);
    });

    it("rejects named colours, partial hex and non-strings", () => {
      for (const c of ["red", "#12", "1a3a5c", null, undefined, 42]) assert.equal(isUsableColor(c), false, String(c));
    });
  });

  describe("relativeLuminance()", () => {
    it("[QA 1.4] is 1 for white and 0 for black", () => {
      assert.ok(Math.abs(relativeLuminance("#ffffff") - 1) < 1e-9);
      assert.equal(relativeLuminance("#000000"), 0);
    });

    it("treats shorthand hex like its long form", () => {
      assert.equal(relativeLuminance("#fff"), relativeLuminance("#ffffff"));
    });
  });

  describe("brandedButtonStyle()", () => {
    it("[QA 1.4] paints the button in the primary colour with the declared text colour", () => {
      assert.deepEqual(brandedButtonStyle({ primary: "#1a3a5c", buttonTextPrimary: "#ffffff" }), {
        backgroundColor: "#1a3a5c",
        borderColor: "#1a3a5c",
        color: "#ffffff",
        transition: "all 0.3s ease",
      });
    });

    it("never uses a text colour identical to the background", () => {
      const style = brandedButtonStyle({ primary: "#1a3a5c", buttonTextPrimary: "#1A3A5C" });
      assert.notEqual(style.color.toLowerCase(), "#1a3a5c");
    });

    it("returns no style when the primary colour is unusable", () => {
      assert.deepEqual(brandedButtonStyle({ primary: "blue" }), {});
      assert.deepEqual(brandedButtonStyle(undefined), {});
    });
  });

  it(
    "[QA 1.4] picks black text on a light background",
    () => {
      assert.equal(readableTextOn("#ffff00"), "#000000");
      assert.equal(brandedButtonStyle({ primary: "#ffffff", buttonTextPrimary: "#ffffff" }).color, "#000000");
    },
  );
});

describe("lib · effectPresets", () => {
  const preset = Object.keys(EFFECT_PRESETS).find((k) => k !== "none");

  describe("parseEffectState() / encodeEffectState()", () => {
    it("round-trips a stored effect state", () => {
      const state = { effects: { [preset]: 0.6 }, angle: 90 };
      assert.deepEqual(parseEffectState(encodeEffectState(state)), state);
    });

    it("stores no effects as none", () => {
      assert.equal(encodeEffectState({ effects: {}, angle: 90 }), "none");
      assert.deepEqual(parseEffectState("none"), { effects: {}, angle: 135 });
    });

    it("reads the legacy name:intensity format", () => {
      assert.deepEqual(parseEffectState(`${preset}:0.5`), { effects: { [preset]: 0.5 }, angle: 135 });
      assert.deepEqual(parseEffectValue(`${preset}:0.5`), { name: preset, intensity: 0.5 });
    });

    describe("malformed input", () => {
      it("treats unknown names, broken JSON and empty values as no effect", () => {
        for (const value of ["sparkle", "{not json", "", null, undefined]) {
          assert.deepEqual(parseEffectState(value).effects, {}, String(value));
        }
      });
    });
  });

  it("renders no box-shadow when there is no effect", () => {
    assert.equal(effectToBoxShadow("none"), "");
  });

  it("offers one picker option per preset", () => {
    assert.equal(EFFECT_OPTIONS.length, Object.keys(EFFECT_PRESETS).length);
  });

  describe("materialToGloss() / materialName()", () => {
    it("adds no gloss layer for a matte finish", () => {
      assert.equal(materialToGloss(0), null);
    });

    it("lights a top-lit gloss from the top down", () => {
      assert.match(materialToGloss(50, 90), /^linear-gradient\(180deg,/);
    });

    it("names finishes by band", () => {
      assert.deepEqual([0, 20, 40, 60, 80, 100].map(materialName), [
        "Matte", "Eggshell", "Satin", "Semi-gloss", "Gloss", "High-gloss",
      ]);
    });
  });
});

describe("utils · checkPermission", () => {
  const user = { role: { permissions: [{ name: "read_branding" }, { name: "update_form" }] } };

  it("grants a permission present on the user's role", () => {
    assert.equal(checkPermission(user, webPermissions.read_branding), true);
  });

  it("denies a permission the role lacks", () => {
    assert.equal(checkPermission(user, webPermissions.delete_form), false);
  });

  it("maps every permission constant to its own name and cannot be mutated", () => {
    for (const [key, value] of Object.entries(webPermissions)) assert.equal(key, value);
    assert.ok(Object.isFrozen(webPermissions));
  });

  describe("malformed input", () => {
    it("denies when the user, role or permission list is missing", () => {
      for (const u of [null, undefined, {}, { role: {} }]) assert.equal(checkPermission(u, "read_form"), false);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. page contracts
// ═════════════════════════════════════════════════════════════════════════════

/**
 * config (Vite env) + branding page defaults - QA 1.6, 1.7, 4.7 legal URLs and
 * 1.10 tab title. These live in `.env` and useState initialisers, neither of
 * which Node can execute.
 */
describe("config · branding defaults", () => {
  const env = read(".env");
  const brandingPage = readSrc(`${BRANDING}/GlobalBrandingPage.jsx`);
  const envValue = (key) => {
    const m = env.match(new RegExp(`^\\s*${key}\\s*=\\s*"?([^"\\n\\r]*)"?`, "m"));
    return m ? m[1].trim() : null;
  };

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
      const envHelper = readSrc("lib/env.js");
      assert.match(envHelper, /VITE_PRIVACY_POLICY_URL/);
      assert.match(envHelper, /VITE_TERMS_OF_SERVICE_URL/);
    });
  });

  describe("[QA 1.10] browser tab title default", () => {
    it('seeds the tab title with "Online-Application"', () => {
      assert.match(brandingPage, /const \[tabTitle, setTabTitle\] = useState\("Online-Application"\)/);
    });

    it(
      "keeps the default when editing a branding saved without a tab title",
      () => {
        assert.ok(!brandingPage.includes('setTabTitle(singleBranding.tabTitle || "");'));
      },
    );
  });
});

describe("branding · create and extract", () => {
  const brandingPage = readSrc(`${BRANDING}/GlobalBrandingPage.jsx`);

  it("[QA 1.2] opens Create Branding from the branding list", () => {
    assert.match(readSrc("App.jsx"), /<Route path="branding\/create" element=\{<CreateBranding \/>\} \/>/);
    assert.match(readSrc("page/admin/dashboard/brandings/Brandings.jsx"), /onClick=\{\(\) => navigate\("\/branding\/create"\)\}/);
  });

  it("[QA 1.3] extracts branding from a company name and website URL", () => {
    const source = readSrc(`${BRANDING}/BrandingSource.jsx`);
    assert.match(source, /label=\{"Enter Website URL"\}/);
    assert.match(source, /onClick=\{extractBranding\}/);
    assert.match(source, /label=\{"Extract"\}/);
    assert.match(brandingPage, /label=\{"Company Name"\}/);
  });

  describe("[QA 1.4 / 4.5] colour assignment after extraction", () => {
    it("matches the form header and footer to the website", () => {
      assert.match(brandingPage, /if \(data\?\.colors\?\.headerBackground\) setHeaderBackground\(data\.colors\.headerBackground\);/);
      assert.match(brandingPage, /if \(data\?\.colors\?\.headerText\) setHeaderText\(data\.colors\.headerText\);/);
      assert.match(brandingPage, /if \(data\?\.colors\?\.footerBackground\) setFooterBackground\(data\.colors\.footerBackground\);/);
      assert.match(brandingPage, /if \(data\?\.colors\?\.footerText\) setFooterText\(data\.colors\.footerText\);/);
    });

    it("matches the email header and footer to the form", () => {
      assert.match(brandingPage, /setEmailHeaderColor\(data\.colors\.headerBackground\)/);
      assert.match(brandingPage, /setEmailFooterColor\(data\.colors\.footerBackground\)/);
    });

    it("colours the AI launch button from the logo and the assistant header/banner from the form header", () => {
      assert.match(brandingPage, /if \(firstLogoColor\) setAiLaunchButtonColor\(firstLogoColor\);/);
      assert.match(brandingPage, /setAiHeaderColor\(data\.colors\.headerBackground\);/);
      assert.match(brandingPage, /setAiBannerColor\(data\.colors\.headerBackground\);/);
    });

    it("takes the primary colour from the extraction and auto-selects the favicon", () => {
      assert.match(brandingPage, /setPrimaryColor\(data\?\.colors\?\.primary\);/);
      assert.match(brandingPage, /if \(data\?\.favicon\) setFavicon\(data\.favicon\);/);
    });
  });

  it("[QA 1.5] previews the application and email with the current settings", () => {
    assert.match(brandingPage, /import Preview, \{ EmailTemplatePreview \} from "\.\/Preview";/);
  });

  it("[QA 1.7] labels the footer wildcard buttons as readable tokens, not HTML entities", () => {
    const source = readSrc(`${BRANDING}/BrandElementAssignment.jsx`);
    assert.match(source, /label=\{"\+ \{Year\}"\}/);
    assert.match(source, /label=\{"\+ \{Company\}"\}/);
    assert.ok(!source.includes("&#123;"), "button labels must not show escaped braces");
  });

  it("[QA 1.8] leaves sender and reply-to addresses optional", () => {
    for (const label of ['label={"Sender Email Address"}', 'label={"Reply-To Email Address"}']) {
      assert.ok(!/\brequired\b/.test(around(brandingPage, label, 0, 220)), `${label} must not be required`);
    }
  });

  describe("[QA 1.10] AI configuration defaults", () => {
    it("defaults the launch button to the accent colour when none is chosen", () => {
      assert.match(brandingPage, /formData\.append\("aiLaunchButtonColor", aiLaunchButtonColor \|\| accentColor\);/);
    });

    it(
      "defaults the assistant header and banner to the application header colour",
      () => {
        assert.match(brandingPage, /aiHeaderColor \|\| headerBackground/);
        assert.match(brandingPage, /aiBannerColor \|\| headerBackground/);
      },
    );
  });

  it("[QA 1.11] returns to Branding Management after saving", () => {
    assert.match(brandingPage, /if \(!skipNavigation\) navigate\("\/branding"\);/);
    assert.match(brandingPage, /label=\{brandingId \? "Update Branding" : "Create Branding"\}/);
  });

  it("[QA 4.6] sizes the application logo and the email logo from their own settings", () => {
    assert.match(readSrc(`${BRANDING}/Preview.jsx`), /maxWidth: appLogoMaxWidth \|\| 300,/);
    assert.match(brandingPage, /max-width: \{\{emailLogoMaxWidth\}\}px/);
  });

  describe("[QA 5.5] email header logo", () => {
    it("interpolates the logo unescaped so query params survive", () => {
      assert.match(brandingPage, /src="\{\{\{logo\}\}\}"/);
      assert.ok(!/src="\{\{logo\}\}"/.test(brandingPage), "escaped interpolation breaks Cloudinary URLs");
    });

    it("validates the URL before interpolating it raw", () => {
      assert.match(brandingPage, /logo: safeImageUrl\(/);
    });

    it("quotes the align attribute", () => {
      assert.match(brandingPage, /align="\{\{headerAlignment\}\}"/);
    });
  });
});

describe("branding · apply", () => {
  it("[QA 1.12 / 1.13] offers a For Website option in the Apply dialog", () => {
    assert.match(readSrc(`${BRANDING}/ApplyBranding.jsx`), /label="For Website"/);
  });

  it("[QA 1.14] shows the branding's header colour and logo on the form tile", () => {
    const tile = readSrc("components/admin/ApplicationsCard.jsx");
    assert.match(tile, /background: form\?\.branding\?\.colors\?\.headerBackground \|\| "#f3f4f6"/);
    assert.match(tile, /src=\{form\?\.branding\?\.selectedLogo \|\| logo\}/);
  });
});

describe("email templates page", () => {
  const source = readSrc("page/admin/dashboard/email/Email.jsx");

  it("[QA 1.15 / 1.16] opens a template for editing", () => {
    assert.match(source, /data-testid="email-edit-btn"/);
    assert.match(source, /onClick=\{\(\) => handleEdit\(item\)\}/);
  });

  it("[QA 1.17] covers the OTP, welcome and new beneficial owner templates", () => {
    for (const type of ["otp_email_template", "welcome_email_template", "new_beneficial_owners_email_template"]) {
      assert.match(source, new RegExp(`value: "${type}",`), type);
    }
  });

  it("[QA 1.18] attaches a template to forms", () => {
    assert.match(source, /data-testid="email-attach-btn"/);
    assert.match(source, /const ModalForAttachForms = React\.memo\(/);
  });
});

describe("strategies page", () => {
  it("[QA 1.19 / 3.1 / 5.25] edits a strategy and assigns forms to it", () => {
    assert.match(readSrc("components/admin/AllStrategies.jsx"), /title="Edit Strategy"/);
    assert.match(
      readSrc("components/admin/startegies/EditStrategies.jsx"),
      /renderFormField\("form", form\.form, handleChange, "multi-select", forms\)/,
    );
  });
});

describe("application forms page", () => {
  const source = readSrc("components/admin/ApplicationsCard.jsx");

  it("[QA 1.1] creates a form from an uploaded CSV", () => {
    assert.match(source, /const createFormWithCsvHandler = async \(\) =>/);
    assert.match(source, /accept="\.pdf,image\/\*,\.csv"/);
  });

  describe("[QA 1.20 / 5.1 / 5.26] Update Form dialog", () => {
    it("edits the redirect URL, header text and header text size", () => {
      assert.match(source, /title="Update Form"/);
      assert.match(source, /data: \{ redirectUrl, headerText, headerTextSize \}/);
      assert.match(source, /label="Redirect URL"/);
      assert.match(source, /label="Header Text"/);
    });

    it("[QA 3.2] builds a copyable form URL that contains the branding name", () => {
      assert.match(source, /value=\{`\$\{window\.location\.origin\}\/application-form\/\$\{form\?\.branding\?\.name\}\/\$\{form\?\._id\}`\}/);
      assert.match(source, /label=\{"Copy"\}/);
    });
  });
});

describe("sign-in, sign-out and password reset", () => {
  it("[QA 5.19 / 5.30 / 5.35 / 5.42] logging out returns to the login page", () => {
    const header = readSrc("page/admin/layout/AdminHeader.jsx");
    assert.match(header, /data-testid="logout-button"/);
    assert.match(header, /return navigate\("\/login"\);/);
  });

  describe("[QA 5.21 / 5.31] guest applicants land on Drafts and Submissions", () => {
    const app = readSrc("App.jsx");

    it("redirects a signed-in guest to the submissions page", () => {
      assert.match(app, /redirect=\{isGuest \? "\/submission" : "\/application-forms"\}/);
      assert.match(app, /<Route path="submission" element=\{<DraftSubmission \/>\} \/>/);
    });

    it("keeps guests out of the admin routes", () => {
      assert.match(app, /<ProtectedRoute user=\{!isGuest && user\} redirect=\{isGuest && user \? "\/submission" : "\/login"\} \/>/);
      assert.match(readSrc("components/ProtectedRoute.jsx"), /if \(!user\) return <Navigate to=\{redirect\} replace \/>;/);
    });
  });

  /** page/auth - QA 5.36 link wording; QA 5.37 button wording and error. */
  describe("page/auth · password reset wording", () => {
    const readAuth = (f) => readSrc(path.join("page/auth", f));
    /** Text a user can actually read: JSX labels, titles and bare text nodes. */
    const visibleStrings = (src) => [
      ...[...src.matchAll(/label="([^"]*)"/g)].map((m) => m[1]),
      ...[...src.matchAll(/label=\{"([^"]*)"\}/g)].map((m) => m[1]),
      ...[...src.matchAll(/^\s{6,}([A-Z][A-Za-z ']{3,40})\s*$/gm)].map((m) => m[1].trim()),
    ];

    it('[QA 5.36] no user-visible text says "Forget"', () => {
      for (const file of ["Login.jsx", "ForgetPassword.jsx", "ResetMailSent.jsx"]) {
        const bad = visibleStrings(readAuth(file)).filter((s) => /\bforget\b/i.test(s));
        assert.deepEqual(bad, [], `${file} still shows: ${bad.join(", ")}`);
      }
    });

    it('[QA 5.36] the login link reads "Forgot Password"', () => {
      assert.match(readAuth("Login.jsx"), /Forgot Password/);
    });

    it('[QA 5.37] the reset button reads "Submit"', () => {
      const src = readAuth("ForgetPassword.jsx");
      assert.match(src, /label="Submit"/);
      assert.ok(!/label="Forget Password"/.test(src), "old button label must not return");
    });

    it("[QA 5.37] shows the server's reason when a reset request fails", () => {
      assert.match(readAuth("ForgetPassword.jsx"), /error\?\.data\?\.message \|\| "Error while requesting password reset"/);
    });

    it("rejects mismatched new passwords before calling the server", () => {
      assert.match(readAuth("ResetPassword.jsx"), /New password and confirm password do not match/);
    });
  });
});

/**
 * components/admin/AllSubmissionDraft.jsx - QA 5.22: drafts and submissions were
 * split across tabs defaulting to "Draft", so an applicant whose only
 * application was submitted saw a blank page.
 */
describe("components/admin · AllSubmissionDraft", () => {
  const source = readSrc("components/admin/AllSubmissionDraft.jsx");

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

describe("applications page", () => {
  it("[QA 5.39 / 5.40] lists every draft and submitted application", () => {
    assert.match(readSrc("page/admin/dashboard/applications/Applications.jsx"), /useGetAllSubmitOrDraftFormsQuery\(\)/);
  });

  it("[QA 5.41] opens an application's PDF from its menu", () => {
    assert.match(readSrc("components/admin/ApplicantsTable.jsx"), /name: "View Pdf",/);
  });

  it("[QA 5.23 / 5.34] lets an applicant download their submitted application", () => {
    const card = readSrc("components/admin/Submission.jsx");
    assert.match(card, /label="Download PDF"/);
    assert.match(card, /generatePdfForm/);
  });
});
