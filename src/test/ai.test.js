/**
 * Category: AI assistant (frontend)
 * Covers:   every QA script item in Parts 1-5 whose behaviour belongs to the AI
 *           assistant widget or an AI-mode admin flow - screen awareness (3.9),
 *           field-error monitor (3.22), translation (3.14, 3.15, 3.18, 3.31),
 *           walkthrough scrolling (3.17, 3.25), document chat (3.41, 3.42),
 *           AI-mode form / branding / email / strategy flows (4.1-4.15,
 *           4.17-4.18, 4.21-4.26) and Manage Rules AI context (2.43).
 *
 * Sections:
 *   1. pure widget logic   runtime tests (Node can import these modules)
 *   2. widget wiring       source-text contracts for logic that lives in JSX or
 *                          in modules that resolve the Vite "@/" alias
 *
 * Runner is node:test with no DOM, so JSX behaviour is asserted against source
 * text: narrower than a rendered test, but each assertion fails loudly if the
 * fix it guards is reverted.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { checkFieldForErrors } from "../lib/checkFieldForErrors.js";
import { buildChatPayload } from "../components/shared/AIChat/utils/buildChatPayload.js";
import { WIDGET_STRINGS } from "../components/shared/AIChat/constants/widgetStrings.js";
import { LANGUAGES } from "../components/shared/AIChat/constants/languages.js";
import { toPreviewSection } from "../components/shared/AIChat/logic/formPreviewUtils.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => readFileSync(path.join(root, "src", p), "utf8");

/**
 * Brace-balanced source text starting at `marker`. A marker ending in "{" opens
 * on that brace (object literals); otherwise the block opens at the first
 * arrow-function body, so destructured parameters like `{ silent }` are skipped.
 */
const blockOf = (source, marker) => {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `marker not found: ${marker}`);
  const open = marker.trimEnd().endsWith("{")
    ? start + marker.trimEnd().length - 1
    : source.indexOf("=> {", start) + 3;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`could not delimit ${marker}`);
};

/** ISO date (YYYY-MM-DD) `years` from today; negative is in the past. */
const isoYearsFromNow = (years) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. pure widget logic
// ═════════════════════════════════════════════════════════════════════════════

describe("lib · checkFieldForErrors · checkFieldForErrors()", () => {
  const check = (id, label, type, value) => checkFieldForErrors(id, label, type, value);

  describe("[QA 3.22] date fields", () => {
    it("flags a birth date in the future", () => {
      assert.match(check("idMissionDateOfBirth", "Date of Birth", "date", isoYearsFromNow(2)).description, /future/);
    });

    it("flags a birth date that makes the applicant a minor", () => {
      assert.match(check("idMissionDateOfBirth", "Date of Birth", "date", isoYearsFromNow(-10)).description, /under 18/);
    });

    it("flags an implausibly old birth date", () => {
      assert.match(check("idMissionDateOfBirth", "Date of Birth", "date", isoYearsFromNow(-130)).description, /over 120/);
    });

    it("flags an expiration date in the past", () => {
      assert.match(check("idMissionIdExpiryDate", "ID Expiry Date", "date", isoYearsFromNow(-1)).description, /past/);
    });

    it("flags an ID issue date in the future", () => {
      assert.match(check("idMissionIssueDate", "ID Issue Date", "date", isoYearsFromNow(1)).description, /future/);
    });

    it("accepts valid dates", () => {
      assert.equal(check("idMissionDateOfBirth", "Date of Birth", "date", isoYearsFromNow(-30)), null);
      assert.equal(check("idMissionIdExpiryDate", "ID Expiry Date", "date", isoYearsFromNow(2)), null);
    });

    it("flags words typed into a date field", () => {
      assert.match(check("idMissionDateOfBirth", "Date of Birth", "date", "Texas").description, /text rather than a date/);
    });
  });

  describe("email fields", () => {
    it("flags a missing @", () => {
      assert.match(check("email", "Email", "email", "hamza.gmail.com").description, /@/);
    });

    it("flags a missing domain", () => {
      assert.match(check("email", "Email", "email", "hamza@localhost").description, /domain/);
    });

    it("suggests the provider for a one-letter domain typo", () => {
      assert.equal(check("email", "Email", "email", "hamza@gmil.com").suggestion, "hamza@gmail.com");
    });

    it("suggests .com for a transposed TLD", () => {
      assert.equal(check("email", "Email", "email", "hamza@gmail.cmo").suggestion, "hamza@gmail.com");
    });

    it("accepts a normal business address", () => {
      assert.equal(check("email", "Email", "email", "hamza@fintainium.com"), null);
    });
  });

  describe("phone fields", () => {
    it("ignores the country-code selector value", () => {
      assert.equal(check("phone", "Phone Number", "tel", "US"), null);
    });

    it("flags a phone field with no digits", () => {
      assert.match(check("phone", "Phone Number", "tel", "call me").description, /digits/);
    });

    it("flags a number that is too short or too long", () => {
      assert.match(check("phone", "Phone Number", "tel", "+1 234 56").description, /too short/);
      assert.match(check("phone", "Phone Number", "tel", "1234567890123456").description, /too long/);
    });

    it("accepts a formatted US number", () => {
      assert.equal(check("phone", "Phone Number", "tel", "+1 (555) 123-4567"), null);
    });
  });

  describe("website fields", () => {
    it("flags a URL with no domain extension", () => {
      assert.match(check("websiteUrl", "Website URL", "url", "fintippy").description, /domain extension/);
    });

    it("suggests .com for a TLD typo", () => {
      assert.equal(check("websiteUrl", "Website URL", "url", "fintainium.cmo").suggestion, "fintainium.com");
    });

    it("[QA 5.6] never treats the 'company has no website' checkbox as a URL field", () => {
      assert.equal(check("noWebsite", "This company has no website", "checkbox", "true"), null);
    });

    it("accepts a full URL", () => {
      assert.equal(check("websiteUrl", "Website URL", "url", "https://www.fintainium.com"), null);
    });
  });

  describe("wrong-field entries", () => {
    it("[QA 2.19] flags letters in a tax ID and a tax ID with the wrong digit count", () => {
      assert.match(check("company_tax_id", "Company Tax ID", "text", "unknown").description, /text rather than numbers/);
      assert.match(check("company_tax_id", "Company Tax ID", "text", "12345").description, /digits/);
      assert.equal(check("company_tax_id", "Company Tax ID", "text", "12-3456789"), null);
    });

    it("flags a ZIP code made only of letters", () => {
      assert.match(check("zip", "ZIP Code", "text", "Texas").description, /only letters/);
    });

    it("[QA 3.23] flags digits typed into ID Type", () => {
      assert.match(check("idMissionIdType", "ID Type", "text", "123456").description, /all numbers/);
    });

    it("flags an email typed into an address field", () => {
      assert.match(check("city", "City", "text", "hamza@fintainium.com").description, /email address/);
    });
  });

  describe("name fields", () => {
    it("flags digits and email addresses in a name", () => {
      assert.match(check("firstName", "First Name", "text", "12345").description, /all numbers/);
      assert.match(check("firstName", "First Name", "text", "hamza@x.com").description, /email address/);
    });

    it("suggests capitalising an all-lowercase name", () => {
      assert.equal(check("fullName", "Full Name", "text", "hamza nafasat").suggestion, "Hamza Nafasat");
    });
  });

  it("never validates one-time codes (they are transient)", () => {
    assert.equal(check("otp-field", "OTP Code", "text", "abc"), null);
    assert.equal(check("code", "Verification Code", "text", "not-a-date"), null);
  });

  describe("malformed input", () => {
    it("returns null for empty, blank and non-string values", () => {
      for (const value of ["", "   ", null, undefined, 42, {}]) {
        assert.equal(check("email", "Email", "email", value), null, JSON.stringify(value));
      }
    });

    it("tolerates missing id, label and type", () => {
      assert.equal(checkFieldForErrors(undefined, undefined, undefined, "hello"), null);
    });
  });
});

describe("components/shared/AIChat · buildChatPayload · buildChatPayload()", () => {
  const ctx = {
    screenId: "company-verification",
    screenName: "Company Information",
    description: "Enter legal name and website.",
    currentState: { fields: [{ id: "legalCompanyName" }] },
    logos: ["https://x/logo.png"],
    colorPalette: ["#000"],
    forms: [{ _id: "f1" }],
    brandingId: "b1",
    actions: { fillField: () => {} },
    formRef: { current: null },
  };

  it("[QA 3.9] sends the live screen identity on every request", () => {
    const { context } = buildChatPayload({ messages: [], ctx, assistantMode: "applicant" });
    assert.equal(context.screenId, "company-verification");
    assert.equal(context.screenName, "Company Information");
    assert.equal(context.description, "Enter legal name and website.");
  });

  it("enables max-help mode only for the applicant assistant", () => {
    assert.equal(buildChatPayload({ messages: [], ctx, assistantMode: "applicant" }).context.maxHelpMode, true);
    assert.equal(buildChatPayload({ messages: [], ctx, assistantMode: "service-provider" }).context.maxHelpMode, false);
  });

  it("prefers the DOM-discovered currentState over the registered one", () => {
    const live = { fields: [{ id: "websiteUrl", filled: true }] };
    const { context } = buildChatPayload({ messages: [], ctx, assistantMode: "applicant", currentState: live });
    assert.equal(context.currentState, live);
  });

  it("falls back to the registered currentState when none is passed", () => {
    assert.equal(buildChatPayload({ messages: [], ctx }).context.currentState, ctx.currentState);
  });

  it("[QA 3.27] sends formLanguage only for a non-English form", () => {
    assert.ok(!("formLanguage" in buildChatPayload({ messages: [], ctx, formLanguage: "English" }).context));
    assert.equal(buildChatPayload({ messages: [], ctx, formLanguage: "Spanish" }).context.formLanguage, "Spanish");
  });

  it("never serialises page callbacks or DOM refs", () => {
    const { context } = buildChatPayload({ messages: [], ctx });
    assert.ok(!("actions" in context));
    assert.ok(!("formRef" in context));
  });

  it("passes the conversation history through untouched", () => {
    const messages = [{ role: "user", content: "hi" }];
    assert.equal(buildChatPayload({ messages, ctx }).messages, messages);
  });

  describe("malformed input", () => {
    it("builds a payload when no screen is registered", () => {
      const { context } = buildChatPayload({ messages: [], ctx: null, assistantMode: "applicant" });
      assert.equal(context.screenId, undefined);
      assert.equal(context.maxHelpMode, true);
    });
  });
});

describe("components/shared/AIChat · widgetStrings · WIDGET_STRINGS", () => {
  const english = WIDGET_STRINGS.en;

  it("[QA 3.14] translates every English string into every supported language", () => {
    for (const [lang, strings] of Object.entries(WIDGET_STRINGS)) {
      const missing = Object.keys(english).filter((k) => !(k in strings));
      assert.deepEqual(missing, [], `${lang} is missing: ${missing.join(", ")}`);
    }
  });

  it("keeps templated strings as functions that interpolate their argument", () => {
    for (const [lang, strings] of Object.entries(WIDGET_STRINGS)) {
      for (const [key, value] of Object.entries(english)) {
        if (typeof value !== "function") continue;
        assert.equal(typeof strings[key], "function", `${lang}.${key} must be a function`);
        assert.match(strings[key]("acme.com"), /acme\.com/, `${lang}.${key} dropped its argument`);
      }
    }
  });

  it("never leaves a translation empty", () => {
    for (const [lang, strings] of Object.entries(WIDGET_STRINGS)) {
      for (const [key, value] of Object.entries(strings)) {
        if (typeof value === "string") assert.ok(value.trim(), `${lang}.${key} is empty`);
      }
    }
  });
});

describe("components/shared/AIChat · languages · LANGUAGES", () => {
  it("starts the rotating banner in English", () => {
    assert.equal(LANGUAGES[0].code, "en");
  });

  it("gives every language a unique code and a non-empty banner", () => {
    const codes = LANGUAGES.map((l) => l.code);
    assert.equal(new Set(codes).size, codes.length, "duplicate language code");
    for (const l of LANGUAGES) assert.ok(l.banner?.trim() && l.native?.trim(), `${l.code} is incomplete`);
  });
});

describe("components/shared/AIChat · formPreviewUtils · toPreviewSection()", () => {
  const dbSection = {
    key: "business_activities",
    name: "Business activities",
    isHidden: true,
    displayText: "Select any that apply",
    fields: [{ label: "Money services", type: "checkbox", required: true }],
  };

  it("[QA 4.3] maps a stored section to the preview shape", () => {
    const out = toPreviewSection(dbSection);
    assert.equal(out.sectionTitle, "business_activities");
    assert.equal(out.sectionName, "Business activities");
    assert.equal(out.displayText, "Select any that apply");
  });

  it("[QA 4.23 / 4.25] keeps the hidden flag so a moved section previews after the agreement block correctly", () => {
    assert.equal(toPreviewSection(dbSection).isHidden, true);
    assert.equal(toPreviewSection({ ...dbSection, isHidden: undefined }).isHidden, false);
  });

  it("titles an unkeyed signature section as the agreement block", () => {
    assert.equal(toPreviewSection({ isSignature: true }).sectionTitle, "agreement_blk");
  });

  it("fills field defaults so the preview never renders undefined", () => {
    assert.deepEqual(toPreviewSection({ fields: [{}] }).fields[0], {
      label: "", type: "text", required: false, placeholder: "", options: [], displayText: "", isDisplayText: false,
    });
  });

  it("lets overrides win over mapped values", () => {
    assert.equal(toPreviewSection(dbSection, { sectionName: "Renamed" }).sectionName, "Renamed");
  });

  describe("malformed input", () => {
    it("maps a section with no fields, name or key", () => {
      const out = toPreviewSection({});
      assert.deepEqual(out.fields, []);
      assert.equal(out.sectionName, "");
      assert.equal(out.sectionTitle, "");
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. widget wiring (source-text contracts)
// ═════════════════════════════════════════════════════════════════════════════

describe("components/shared/AIChat · AIChatWidget · [QA 3.9] screen awareness while closed", () => {
  const widget = read("components/shared/AIChat/AIChatWidget.jsx");
  const context = read("context/AiChatContext.jsx");
  const applicantHook = read("hooks/useApplicantScreenContext.js");

  describe("the live screen is tracked whether or not the panel is open", () => {
    it("registerScreenContext stores the context without consulting isOpen", () => {
      const register = blockOf(context, "const registerScreenContext = useCallback(");
      assert.match(register, /screenContextRef\.current = context;/);
      assert.ok(!/\bisOpen\b/.test(register), "registration must never be gated on the panel being open");
    });

    it("applicant pages re-register on every deps change, not only while open", () => {
      assert.match(applicantHook, /registerScreenContext\(context\);\s*\n\s*return \(\) => unregisterScreenContext\(\);/);
      assert.ok(!/isOpen/.test(applicantHook.slice(applicantHook.indexOf("registerScreenContext(context)") - 80)));
    });
  });

  describe("the transcript catches up with the live screen", () => {
    it("remembers which screen the conversation last announced", () => {
      assert.match(widget, /const lastAnnouncedScreenIdRef = useRef\(null\);/);
    });

    it("anchors the first greeting to the screen it greeted", () => {
      assert.match(widget, /lastAnnouncedScreenIdRef\.current = ctx\?\.screenId \?\? null;/);
    });

    it("syncs the transcript when the panel is reopened", () => {
      assert.match(widget, /useEffect\(\(\) => \{\s*\n\s*if \(isOpen\) syncConversationWithScreen\(\);\s*\n\s*\}, \[isOpen\]\);/);
    });

    it("runs the reopen sync after the greeting effect, so a first open is never announced twice", () => {
      const greeting = widget.indexOf("initialGreetingShownRef.current = true;");
      const reopenSync = widget.indexOf("if (isOpen) syncConversationWithScreen();");
      assert.ok(greeting !== -1 && reopenSync !== -1 && greeting < reopenSync);
    });

    it("syncs before every send and includes the announcement in the history it sends", () => {
      const send = blockOf(widget, "const sendMessage = async (");
      assert.match(send, /const syncMsg = syncConversationWithScreen\(\);/);
      assert.match(send, /\[\.\.\.messages, \.\.\.\(syncMsg \? \[syncMsg\] : \[\]\), userMsg\]/);
      assert.ok(
        send.indexOf("syncConversationWithScreen()") < send.indexOf("addMessage(userMsg)"),
        "the announcement must land before the user's message",
      );
    });

    it("only announces when the live screen differs from the last announced one", () => {
      const sync = blockOf(widget, "const syncConversationWithScreen = () =>");
      assert.match(sync, /if \(lastAnnouncedScreenIdRef\.current === screenId\) return null;/);
      assert.match(sync, /lastAnnouncedScreenIdRef\.current = screenId;/);
    });

    it("waits for the next registration instead of announcing an empty screen mid-navigation", () => {
      assert.match(blockOf(widget, "const syncConversationWithScreen = () =>"), /if \(!screenId\) return null;/);
    });

    it("forgets the anchor when a new application session starts", () => {
      const reset = widget.slice(widget.indexOf("if (!widgetResetSignal) return;"), widget.indexOf("}, [widgetResetSignal]);"));
      assert.match(reset, /lastAnnouncedScreenIdRef\.current = null;/);
    });
  });

  describe("screen changes while open", () => {
    const screenChange = widget.slice(
      widget.indexOf("// When the active screen changes"),
      widget.indexOf("}, [currentScreenId]);"),
    );

    it("reads the live open state inside the delayed announcement, not the stale closure", () => {
      assert.match(screenChange, /if \(!isOpenRef\.current\) return;/);
      assert.match(widget, /isOpenRef\.current = isOpen;/);
    });

    it("skips the delayed announcement when a send or reopen already made it", () => {
      assert.match(screenChange, /if \(lastAnnouncedScreenIdRef\.current === guardedScreenId\) return;/);
    });

    it("leaves the anchor stale while closed so the reopen sync announces the move", () => {
      assert.match(screenChange, /if \(!isOpen\) return;/);
    });
  });

  it(
    "[QA 3.9] writes an announcement for a screen change that happened while the panel was closed",
    { todo: "open: buildScreenAnnouncement's `resumed` branch is still TODO(human)" },
    () => {
      const builder = blockOf(widget, "const buildScreenAnnouncement = (");
      const resumedBranch = builder.slice(builder.indexOf("if (!resumed) {"));
      assert.ok(!builder.includes("TODO(human)"), "resumed branch not implemented yet");
      assert.match(resumedBranch.slice(resumedBranch.indexOf("}") + 1), /return\s/);
    },
  );

  it("[QA 3.9] shows the live screen name in the panel header", () => {
    assert.match(read("components/shared/AIChat/components/ChatPanel.jsx"), /\{getScreenContext\(\)\?\.screenName \|\| "AI"\}/);
  });
});

describe("components/shared/AIChat · aiChatConstants · navigation contract", () => {
  const constants = read("components/shared/AIChat/constants/aiChatConstants.js");
  const objectKeys = (name) => {
    const body = blockOf(constants, `export const ${name} = {`);
    return [...body.matchAll(/^\s*"?([a-z-]+)"?:/gm)].map((m) => m[1]);
  };
  const backendNavigation = path.resolve(root, "../backend/src/global/utils/navigationTool.js");

  it("labels every route it can navigate to", () => {
    assert.deepEqual(objectKeys("PAGE_LABELS").sort(), objectKeys("PAGE_ROUTES").sort());
  });

  it(
    "[QA 4.4 / 4.13] has a route for every page the backend navigateToPage tool offers",
    { skip: !existsSync(backendNavigation) && "backend checkout not present" },
    () => {
      const backendIds = [...readFileSync(backendNavigation, "utf8").matchAll(/^\s{4}id: "([a-z-]+)"/gm)].map((m) => m[1]);
      assert.ok(backendIds.length > 0, "no NAVIGABLE_PAGES ids found in the backend");
      const routes = objectKeys("PAGE_ROUTES");
      assert.deepEqual(backendIds.filter((id) => !routes.includes(id)), [], "backend can navigate to a page the widget cannot route");
    },
  );

  it(
    "[QA 4.4 / 4.13] routes every navigation destination to a real page",
    { todo: 'open: PAGE_ROUTES sends "testing" to /testing, which App.jsx never routes' },
    () => {
      const app = read("App.jsx");
      const paths = [...blockOf(constants, "export const PAGE_ROUTES = {").matchAll(/: "\/([^"]+)"/g)].map((m) => m[1]);
      assert.deepEqual(paths.filter((p) => !app.includes(`path="${p}"`)), []);
    },
  );
});

describe("components/shared/AIChat · translation mode", () => {
  const widget = read("components/shared/AIChat/AIChatWidget.jsx");
  const tools = read("components/shared/AIChat/logic/applyToolCall.js");

  it("[QA 3.14 / 3.15] enterTranslationMode switches the widget into the applicant's language", () => {
    const branch = blockOf(tools, 'if (tool === "enterTranslationMode") {');
    assert.match(branch, /translationModeRef\.current = mode;/);
    assert.match(branch, /setTranslationMode\(mode\);/);
    assert.match(branch, /tooltipCacheRef\.current = \{\};/, "a new language must not reuse cached translations");
  });

  it("[QA 3.18 / 3.31] leaves translation mode when the applicant returns to the form language", () => {
    assert.match(
      blockOf(widget, "const applyDetectedLanguage = ("),
      /if \(detectedLanguage === formLangCode\) \{\s*if \(translationModeRef\.current\) \{\s*translationModeRef\.current = null;\s*setTranslationMode\(null\);/,
    );
  });

  it("[QA 3.18 / 3.31] applies the detected language on every AI reply path", () => {
    assert.ok((widget.match(/applyDetectedLanguage\(data\.detectedLanguage\);/g) || []).length >= 2);
  });

  describe("[QA 3.15 / 3.18] hover translations", () => {
    const effect = widget.slice(widget.indexOf("// ── Hover-translation tooltip"), widget.indexOf("}, [translationMode]);"));

    it("translates hovered screen text through the translate endpoint", () => {
      assert.match(effect, /\$\{SERVER_URL\}\/api\/ai\/translate/);
    });

    it("clears the tooltip as soon as translation mode ends", () => {
      assert.match(effect, /if \(!translationMode\) \{\s*setTranslationTooltip\(null\);/);
    });

    it("stops listening for hovers when translation mode ends", () => {
      assert.match(effect, /document\.removeEventListener\("mouseover", handleMouseOver\);/);
      assert.match(effect, /document\.removeEventListener\("mouseout", handleMouseOut\);/);
    });
  });

  it(
    "[QA 3.13] tells the assistant about manual ID entry on the QR screen",
    { todo: "open: the idmission-qr screen description says the applicant 'must use the QR code or web link'" },
    () => {
      const sa = read("page/admin/userApplicationForms/ApplicationVerification/SingleApplication.jsx");
      const qrDescription = sa.slice(sa.indexOf('? "The applicant scans a QR code'), sa.indexOf('aiStage === "idmission-loading"', sa.indexOf('? "The applicant scans a QR code')));
      assert.match(qrDescription, /manual/i);
    },
  );
});

describe("components/shared/AIChat · field guidance", () => {
  const widget = read("components/shared/AIChat/AIChatWidget.jsx");
  const tools = read("components/shared/AIChat/logic/applyToolCall.js");

  describe("[QA 3.17 / 3.25] scrollToField", () => {
    const branch = blockOf(tools, 'if (tool === "scrollToField") {');

    it("really scrolls, through the screen's action or the DOM", () => {
      assert.match(branch, /ctx\.actions\.scrollToField\(\{ fieldId \}\)/);
      assert.match(branch, /findAiFieldEl\(document, fieldId\)/);
    });

    it("shows the walkthrough explanation alongside the scroll", () => {
      assert.match(branch, /if \(explanation\) \{/);
    });

    it("the stepper registers a scrollToField action scoped to the current step", () => {
      assert.match(
        read("page/admin/userApplicationForms/ApplicationVerification/ApplicationForm.jsx"),
        /scrollToField: \(\{ fieldId \}\) => \{\s*const el = findAiFieldEl\(stepContainerRef\.current, fieldId\);/,
      );
    });
  });

  describe("[QA 2.10 / 2.16 / 5.8] pre-filled fields dialog", () => {
    it("opens only when at least three fields were pre-filled", () => {
      assert.match(widget, /if \(allPreFilled\.length < 3\) \{/);
      assert.match(widget, /setPreFillModal\(\{ preFilled: allPreFilled, remaining \}\)/);
    });

    it("shows each screen's dialog at most once per session", () => {
      assert.match(widget, /if \(preFillShownRef\.current\.has\(currentScreenId\)\) return;/);
    });

    it("explains which fields were pre-filled", () => {
      assert.match(read("components/shared/AIChat/PreFillModal.jsx"), /Some fields have been pre-filled/);
    });
  });

  describe("[QA 3.22] field error monitor", () => {
    it("checks a field when the applicant leaves it", () => {
      assert.match(widget, /document\.addEventListener\("focusout", onFocusOut, true\);/);
      assert.match(widget, /checkFieldForErrors\(fieldId, fieldLabel, fieldType, rawValue\)/);
    });

    it("renders the error and pre-fill dialogs", () => {
      const overlays = read("components/shared/AIChat/components/ChatOverlays.jsx");
      assert.match(overlays, /<FieldErrorModal/);
      assert.match(overlays, /<PreFillModal/);
    });
  });
});

describe("components/shared · DocumentModal · [QA 3.41 / 3.42] document assistant", () => {
  const modal = read("components/shared/DocumentModal.jsx");

  it("opens the AI chat when a document opens, even if the applicant closed it earlier", () => {
    assert.match(modal, /sessionStorage\.removeItem\("ai-widget-user-closed"\);\s*\n\s*setIsOpen\(true\);/);
  });

  it("points the chat at the public applicant document endpoint for applicants", () => {
    assert.match(modal, /\/api\/ai\/applicant-document-chat/);
  });

  it("overlays the document context and restores the page context on close", () => {
    assert.match(modal, /setOverlayContext\(\{/);
    assert.match(modal, /return \(\) => clearOverlayContext\(\);/);
  });

  it("gives the overlay priority over the page while it is open", () => {
    assert.match(read("context/AiChatContext.jsx"), /overlayContextRef\.current \?\? screenContextRef\.current/);
  });
});

describe("components/shared/AIChat · applyToolCall · AI-mode admin flows", () => {
  const tools = read("components/shared/AIChat/logic/applyToolCall.js");
  const formsPage = read("components/admin/ApplicationsCard.jsx");
  const brandingPage = read("components/admin/brandings/globalBranding/GlobalBrandingPage.jsx");
  const emailPage = read("page/admin/dashboard/email/Email.jsx");
  const handles = (tool) => tools.includes(`if (tool === "${tool}") {`) || new RegExp(`"${tool}",?\\s`).test(tools);

  it(
    "handles every tool any backend assistant can call",
    { skip: !existsSync(path.resolve(root, "../backend/src/modules/ai/controllers")) && "backend checkout not present" },
    () => {
      const dir = path.resolve(root, "../backend/src/modules/ai/controllers");
      const controllers = ["applicantChat", "brandingChat", "brandingListChat", "emailChat", "formChat", "strategyChat", "userChat", "roleChat", "lookupChat"];
      const unhandled = controllers.flatMap((c) =>
        [...readFileSync(path.join(dir, `${c}.controller.js`), "utf8").matchAll(/^\s*name: "([A-Za-z]+)",/gm)]
          .map((m) => m[1])
          .filter((tool) => !handles(tool))
          .map((tool) => `${c}: ${tool}`));
      assert.deepEqual(unhandled, []);
    },
  );

  it("[QA 4.1] opens a CSV file picker", () => {
    assert.match(blockOf(tools, 'if (tool === "openCsvFilePicker") {'), /input\.accept = "\.csv,text\/csv";/);
  });

  it("[QA 4.2] asks for a unique name when the form name already exists", () => {
    assert.match(formsPage, /error\?\.status === 409/);
    assert.match(formsPage, /title="Form Name Already Exists"/);
  });

  it("[QA 4.3] renders the form preview inside the chat", () => {
    assert.match(blockOf(tools, 'if (tool === "previewFormStructure") {'), /formPreview: \{ formName, sections \}/);
    assert.match(read("components/shared/AIChat/ChatMessage.jsx"), /<FormPreview formName=\{message\.formPreview\.formName\}/);
  });

  describe("[QA 4.4 / 4.13] navigation to another admin page", () => {
    const branch = blockOf(tools, 'if (tool === "navigateToPage") {');

    it("routes through PAGE_ROUTES and queues the follow-up task", () => {
      assert.match(branch, /const route = PAGE_ROUTES\[page\];/);
      assert.match(branch, /pendingFollowUpRef\.current = followUpTask;/);
    });

    it("auto-sends the follow-up once the destination registers", () => {
      assert.match(read("components/shared/AIChat/AIChatWidget.jsx"), /if \(pendingFollowUpRef\.current\) \{/);
    });

    it(
      "[QA 4.4] hands extracted branding to the create page it navigates to",
      { todo: 'open: GlobalBrandingPage reads sessionStorage "pendingBrandingData" but nothing writes it' },
      () => {
        const writers = [tools, brandingPage, read("page/admin/dashboard/brandings/Brandings.jsx")];
        assert.ok(writers.some((s) => /sessionStorage\.setItem\("pendingBrandingData"/.test(s)));
      },
    );
  });

  it("[QA 4.5] shows the suggested palette and passes it to the branding page", () => {
    assert.match(blockOf(tools, 'if (tool === "suggestColors") {'), /ctx\.actions\.setSuggestedColors\(colors\)/);
  });

  it("[QA 4.8] tells the branding assistant which logo is selected", () => {
    assert.match(brandingPage, /selectedLogo: selectedLogo \|\| null,/);
  });

  it("[QA 4.9] lets the assistant set tab title, favicon and AI launch colour", () => {
    for (const setter of ["tabTitle: setTabTitle,", "favicon: setFavicon,", "aiLaunchButtonColor: setAiLaunchButtonColor,"]) {
      assert.ok(brandingPage.includes(setter), setter);
    }
  });

  describe("[QA 4.10 / 4.11] save and apply branding", () => {
    it("saves by updating an existing branding or creating a new one", () => {
      assert.match(brandingPage, /saveBranding: \(\) => \(brandingId \? updateBrandingHandler\(brandingId\) : createBrandingHandler\(\)\)/);
    });

    it("applies to the chosen forms and, optionally, the home page", () => {
      assert.match(tools, /ctx\.actions\.saveAndApplyBrandingToForms\(\{ formIds: formIds \|\| \[\], onHome: !!onHome \}\)/);
    });

    it("[QA 4.11] reloads so the home page shows the new branding", () => {
      assert.match(brandingPage, /window\.location\.href = "\/branding";/);
    });
  });

  it("[QA 4.13] opens an email template for editing", () => {
    assert.match(tools, /ctx\.actions\.openTemplate\(\{ templateId, mode: mode \|\| "view" \}\)/);
    assert.match(emailPage, /openTemplate: \(\{ templateId, mode \}\) =>/);
  });

  it("[QA 4.14] attaches templates to forms from either page", () => {
    assert.match(emailPage, /attachToForms: async \(\{ formIds, templateId \}\) =>/);
    assert.match(formsPage, /attachEmailTemplate: async \(\{ formId, templateIds \}\) =>/);
  });

  it("[QA 4.15] links a lookup strategy to a form", () => {
    assert.match(read("components/admin/AllStrategies.jsx"), /linkStrategyToForm: async \(\{ strategyId, formIds \}\) =>/);
  });

  it("[QA 4.21 / 4.26] gives the readiness check the form detail and rule count", () => {
    assert.match(formsPage, /ruleCount: \(formRulesData\?\.data \|\| \[\]\)\.length,/);
  });

  it("[QA 4.22] clones a form through the clone endpoint", () => {
    assert.match(formsPage, /cloneFormMutation\(\{ sourceFormId, name: newName \}\)/);
    assert.match(read("redux/apis/formApis.js"), /url: `\/clone\/\$\{sourceFormId\}`/);
  });

  it("[QA 4.23] previews a reorder and asks before saving", () => {
    assert.match(blockOf(tools, 'if (tool === "reorderSections") {'), /Say \*\*save\*\* to apply these changes to the live form/);
    assert.match(formsPage, /reorderSections: \(\{ sectionOrder \}\) =>/);
  });

  it("[QA 4.24] names the cause when a reorder save fails", () => {
    assert.match(formsPage, /import \{ apiErrorMessage \} from "@\/lib\/apiError";/);
    assert.match(formsPage, /errors\.push\(`Reorder: \$\{apiErrorMessage\(err\)\}`\)/);
  });

  describe("[QA 4.17 / 4.18] AI Help on a customised field", () => {
    const customField = read("components/shared/MakeFieldDataCustom.jsx");

    it("enables AI Help per field and generates the help text", () => {
      assert.match(customField, /label="Enable AI Help"/);
      assert.match(customField, /onClick=\{getResponseFromAi\}/);
    });

    it("generates through the display-text formatting endpoint", () => {
      assert.match(customField, /formateTextInMarkDown\(\{/);
      assert.match(read("redux/apis/formApis.js"), /url: "\/formate-display-text"/);
    });
  });

  it(
    "[QA 2.43] offers Preview AI Context when creating a rule",
    { todo: "open: ManageRules has no Preview AI Context action" },
    () => {
      assert.match(read("components/admin/ManageRules.jsx"), /Preview AI Context/i);
    },
  );
});

const { apiErrorMessage } = await import("../lib/apiError.js");

/**
 * lib/apiError.js - QA 4.24: the save error rendered as
 * "Save failed. Reorder: undefined", which named no cause.
 */
describe("lib · apiError · apiErrorMessage()", () => {
  describe("[QA 4.24] never renders the string 'undefined'", () => {
    it("names the cause for a 404 on an unrouted path", () => {
      // The exact shape RTK Query rejects with when the endpoint does not exist.
      const msg = apiErrorMessage({ status: 404, data: undefined });
      assert.ok(!msg.includes("undefined"), `got: ${msg}`);
      assert.match(msg, /404/);
    });

    it("never returns 'undefined' for any empty-ish rejection", () => {
      const shapes = [
        undefined, null, {}, { status: 500 }, { data: {} }, { data: null },
        { status: "FETCH_ERROR" }, { message: "" }, { data: { message: "   " } },
      ];
      for (const err of shapes) {
        const msg = apiErrorMessage(err);
        assert.ok(msg && !msg.includes("undefined"), `${JSON.stringify(err)} -> ${msg}`);
      }
    });
  });

  describe("prefers the most specific message available", () => {
    it("uses the server's message first", () => {
      assert.equal(
        apiErrorMessage({ status: 400, data: { message: "Please Provide A Valid Form Id" } }),
        "Please Provide A Valid Form Id",
      );
    });

    it("uses a plain-string body when there is no message field", () => {
      assert.equal(apiErrorMessage({ status: 500, data: "Internal Server Error" }), "Internal Server Error");
    });

    it("falls back to a thrown Error's message", () => {
      assert.equal(apiErrorMessage(new Error("Network down")), "Network down");
    });

    it("accepts a bare string", () => {
      assert.equal(apiErrorMessage("boom"), "boom");
    });
  });

  describe("describes the transport when nothing else is available", () => {
    it("reports auth failures by status", () => {
      assert.match(apiErrorMessage({ status: 401 }), /401/);
      assert.match(apiErrorMessage({ status: 403 }), /403/);
    });

    it("reports a non-numeric RTK status such as FETCH_ERROR", () => {
      assert.match(apiErrorMessage({ status: "FETCH_ERROR" }), /FETCH_ERROR/);
    });

    it("prefers originalStatus when present", () => {
      assert.match(apiErrorMessage({ status: "PARSING_ERROR", originalStatus: 404 }), /404/);
    });
  });
});

describe("redux/apis · formApis · [QA 4.24] reorder endpoint contract", () => {
  const source = read("redux/apis/formApis.js");

  it("calls the path the backend now serves", () => {
    const block = blockOf(source, "reorderFormSections: builder.mutation({");
    assert.match(block, /url:\s*"\/reorder-form-sections"/);
    assert.match(block, /method:\s*"PUT"/);
  });

  it("invalidates the Form tag so the reordered form refetches", () => {
    assert.match(blockOf(source, "reorderFormSections: builder.mutation({"), /invalidatesTags:\s*\[[^\]]*"Form"/);
  });
});
