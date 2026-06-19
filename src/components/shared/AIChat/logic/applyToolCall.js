import { AI_CHAT_MODE, PAGE_LABELS, PAGE_ROUTES, SERVER_URL } from "../constants/aiChatConstants.js";
import { resolveNavigationHandoff } from "../utils/resolveNavigationHandoff.js";
import {
  APPLY_BRANDING_MODAL_DECLINE_MESSAGE,
  getMistakenBrandingApplyDeclineMessage,
  shouldBlockMistakenBrandingApply,
} from "./brandingApplyIntent.js";
import {
  FORWARD_FORM_DECLINE_MESSAGE,
  getMistakenViewApplicationMessage,
  isUnderwritingIntent,
  shouldBlockMistakenViewApplication,
} from "./applicationListIntent.js";

const getLastUserMessageText = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const content = history[i]?.content;
    if (history[i]?.role === "user" && typeof content === "string") return content;
  }
  return "";
};

const isBrandingSaveIntent = (text) =>
  /\b(save(\s+the)?\s+branding|create(\s+the)?\s+branding|click.*create.*branding|create branding|submit.*branding|now create)\b/i.test(
    text,
  );

const isBrandingRefetchIntent = (text) =>
  /\b(re-?fetch|fetch again|scrape again|update (the )?palette from|pull (colors )?from (the )?website)\b/i.test(text);

/**
 * Creates the tool-call handler with bindings from the chat widget/controller.
 * Body is extracted verbatim from AIChatWidget to keep behavior identical.
 */
export function createApplyToolCall(bindings) {
  const {
    getScreenContext,
    assistantMode,
    addMessage,
    isVoiceModeRef,
    speak,
    wt,
    aiCustomPrompt,
    continueAfterToolCall,
    pushRevertable,
    popRevertable,
    navigate,
    setIsLoading,
    setAdePanel,
    adePanelCallbackRef,
    confirmedValuesRef,
    signalContinuationPending,
    pendingFormContinuationRef,
    appendApiHistory,
    dodgeForField,
    scrollToBottom,
    setPreFillModal,
    preFillShownRef,
    setFieldErrorModal,
    confirmedErrorsRef,
    pendingFieldErrorRef,
    blockedClickTargetRef,
    navTimeoutRef,
    pendingFollowUpRef,
    pendingHandoffModeRef,
    pendingHandoffUserMessageRef,
    formLanguageRef,
    setIsOpen,
    getApiHistory,
    activatedFieldIdRef,
    inputRef,
    panelRef,
    homePositionRef,
    setIntroButtonsDismissed,
    introButtonsDismissed,
    pendingAnalysisRef,
    setOverlayContext,
    triggerAutoMessage,
  } = bindings;

  function handleNavigateToPage(args) {
    const { page, reason, followUpTask, handoffMode } = args;
    const route = PAGE_ROUTES[page];
    const label = PAGE_LABELS[page] || page;
    if (!route) return;

    const currentPath = window.location.pathname;
    const alreadyThere = currentPath === route || (route !== "/" && currentPath.startsWith(`${route}/`));

    if (alreadyThere) {
      pendingFollowUpRef.current = null;
      pendingHandoffModeRef.current = null;
      pendingHandoffUserMessageRef.current = null;
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }
      return;
    }

    addMessage({
      role: "assistant",
      content: `Navigating you to **${label}**. ${reason}`,
    });

    pendingHandoffModeRef.current = handoffMode === "greeting" ? "greeting" : "task";
    const lastUser = [...getApiHistory()].reverse().find((m) => m.role === "user")?.content;
    pendingHandoffUserMessageRef.current = typeof lastUser === "string" ? lastUser : "";
    if (followUpTask) {
      pendingFollowUpRef.current = followUpTask;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        pendingFollowUpRef.current = null;
        pendingHandoffModeRef.current = null;
        pendingHandoffUserMessageRef.current = null;
      }, 30000);
    } else if (handoffMode === "greeting") {
      pendingFollowUpRef.current = null;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        pendingHandoffModeRef.current = null;
        pendingHandoffUserMessageRef.current = null;
      }, 30000);
    }

    setTimeout(() => {
      navigate(route);
    }, 300);
  }

  async function applyToolCall(tool, args, currentHistory) {
    console.log(`%c[TOOL] applyToolCall: ${tool}`, "color:#c0f; font-weight:bold", args);
    const ctx = getScreenContext();

    // Cross-page navigation does not require page-specific actions — only bindings.
    if (tool === "navigateToPage") {
      handleNavigateToPage(args);
      return;
    }

    if (!ctx?.actions) {
      return;
    }
    const defaultEndpoint =
      assistantMode === "applicant" ? `${SERVER_URL}/api/ai/applicant-chat` : `${SERVER_URL}/api/ai/branding-chat`;
    const chatEndpoint = ctx.aiEndpoint || defaultEndpoint;

    if (tool === "revertLastAction") {
      const { explanation } = args;
      const entry = popRevertable();
      if (!entry) {
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
        return;
      }
      try {
        const freshCtx = getScreenContext();
        await entry.revertFn(freshCtx);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("revertFailed")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "fetchWebsiteBranding") {
      const { url, intent, companyName: aiProvidedName } = args;
      const lastUserText = getLastUserMessageText(currentHistory);
      const paletteExists = (ctx?.colorPalette?.length ?? 0) > 0;

      // Misrouted save/create — user asked to save or click Create, not re-scrape the site.
      if (isBrandingSaveIntent(lastUserText)) {
        try {
          if (ctx.actions.saveBranding) await ctx.actions.saveBranding();
          const msg = "Branding saved successfully.";
          addMessage({ role: "assistant", content: msg });
          if (isVoiceModeRef.current) speak(msg);
        } catch (err) {
          const detail = err?.data?.message || err?.message || "";
          addMessage({
            role: "assistant",
            content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
          });
        }
        return;
      }

      // Palette already loaded — skip redundant fetch unless user explicitly asked to re-fetch.
      if (paletteExists && !isBrandingRefetchIntent(lastUserText)) {
        const domainInMessage = (() => {
          try {
            const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
            return lastUserText.toLowerCase().includes(host.split(".")[0]);
          } catch {
            return false;
          }
        })();
        if (!domainInMessage) {
          addMessage({
            role: "assistant",
            content:
              "The website palette is already loaded. I'll use those colors — tell me if you want to **save** the branding or **tweak** any colors.",
          });
          return;
        }
      }

      addMessage({ role: "assistant", content: `Fetching **${url}**… this may take a moment.` });
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/fetch-website-branding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed");

        const { brandingData, screenshotUrl } = data;

        if (ctx.actions.applyExtractedBranding) {
          ctx.actions.applyExtractedBranding(brandingData);
        }
        if (screenshotUrl && ctx.actions.setWebsiteImage) {
          ctx.actions.setWebsiteImage(screenshotUrl);
        }

        // Auto-fill company name if blank
        if (!ctx.currentState?.companyName && ctx.actions.companyName) {
          const nameFromExtracted = brandingData?.name;
          const nameFromDomain = (() => {
            try {
              const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
              const base = hostname.replace(/^www\./, "").split(".")[0];
              return base.charAt(0).toUpperCase() + base.slice(1);
            } catch {
              return "";
            }
          })();
          const nameToUse = aiProvidedName || nameFromExtracted || nameFromDomain;
          if (nameToUse) ctx.actions.companyName(nameToUse);
        }

        // Auto-fill website URL if blank
        if (!ctx.currentState?.websiteUrl && ctx.actions.websiteUrl) {
          ctx.actions.websiteUrl(url);
        }

        const imageUrl = screenshotUrl || null;
        const visionContent = [
          ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : []),
          {
            type: "text",
            text: `Here is the full-page screenshot and extracted branding data for ${url}:\n\n${JSON.stringify(brandingData, null, 2)}\n\nUser intent: ${intent || "analyze this branding for inspiration"}.\n\nPlease analyze the site's visual design and branding, then respond helpfully to the user's original request.`,
          },
        ];

        const followUpHistory = [...currentHistory, { role: "user", content: visionContent }];

        const aiRes = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: followUpHistory,
            context: {
              screenId: ctx?.screenId,
              screenName: ctx?.screenName,
              description: ctx?.description,
              currentState: ctx?.currentState,
              logos: ctx?.logos,
              // Use freshly extracted palette so logo colors are in the system prompt context
              // before React state has had a chance to propagate applyExtractedBranding
              colorPalette: brandingData?.color_palette || ctx?.colorPalette || undefined,
              customPrompt: aiCustomPrompt || undefined,
            },
          }),
        });
        const aiData = await aiRes.json();
        if (!aiData.success) throw new Error(aiData.message || "AI request failed");

        if (aiData.type === "tool_call") {
          await applyToolCall(aiData.tool, aiData.args, followUpHistory);
        } else {
          addMessage({ role: "assistant", content: aiData.content });
          if (isVoiceModeRef.current) speak(aiData.content);
        }
      } catch {
        addMessage({ role: "assistant", content: `${wt("fetchFailed")} **${url}**. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "openManualExtractionFlow") {
      const { url, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      const action = ctx?.actions?.openManualExtractionFlow;
      if (action) {
        action({ url });
      } else {
        // Screen context doesn't support this tool — inform the user
        addMessage({
          role: "assistant",
          content: "Open the Extract Branding modal and switch to the Manual Extract tab to continue.",
        });
      }
      return;
    }

    if (tool === "extractBrandingFromPastedContent") {
      const { content, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/extract-branding-from-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (!data.success) throw new Error("Failed to parse content");

        const { colors, cssVars, logoUrls, colorCount } = data;
        const parts = [
          colorCount > 0 ? `${colorCount} hex colors` : null,
          Object.keys(cssVars).length > 0 ? `${Object.keys(cssVars).length} CSS variables` : null,
          logoUrls.length > 0 ? `${logoUrls.length} image URLs` : null,
        ].filter(Boolean);

        const summary = parts.length
          ? `Extracted from pasted content: ${parts.join(", ")}.`
          : "No recognizable colors or URLs found in the pasted content.";

        const resultText = [
          summary,
          colors.length ? `Colors: ${colors.join(", ")}` : null,
          Object.keys(cssVars).length ? `CSS variables: ${JSON.stringify(cssVars)}` : null,
          logoUrls.length ? `Image URLs: ${logoUrls.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        const followUpHistory = [...currentHistory, { role: "user", content: resultText }];

        const aiRes = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            messages: followUpHistory,
            context: {
              screenId: ctx?.screenId,
              screenName: ctx?.screenName,
              description: ctx?.description,
              currentState: ctx?.currentState,
              logos: ctx?.logos,
              colorPalette: ctx?.colorPalette || undefined,
            },
          }),
        });
        const aiData = await aiRes.json();
        if (!aiData.success) throw new Error(aiData.message || "AI request failed");

        if (aiData.type === "tool_call") {
          await applyToolCall(aiData.tool, aiData.args, followUpHistory);
        } else {
          addMessage({ role: "assistant", content: aiData.content });
          if (isVoiceModeRef.current) speak(aiData.content);
        }
      } catch {
        addMessage({
          role: "assistant",
          content:
            "I couldn't parse the pasted content. Try pasting just the hex color codes or CSS variables directly.",
        });
      }
      return;
    }

    if (tool === "applyBrandingChanges") {
      const { changes, explanation } = args;
      // Snapshot current values before overwriting
      const snapshot = {};
      Object.keys(changes).forEach((key) => {
        snapshot[key] = ctx.currentState?.[key];
      });
      pushRevertable({
        description: `Applied branding changes (${Object.keys(changes).join(", ")})`,
        revertFn: (freshCtx) => {
          Object.entries(snapshot).forEach(([key, val]) => {
            if (val !== undefined && freshCtx?.actions?.[key]) freshCtx.actions[key](val);
          });
        },
      });
      Object.entries(changes).forEach(([key, value]) => {
        const setter = ctx.actions[key];
        if (setter) setter(value);
      });
      addMessage({ role: "assistant", content: explanation, toolCall: { tool, changes } });
      if (isVoiceModeRef.current) speak(explanation);
      // Continue so the AI can chain the next step of a compound command (e.g. save, assign to form)
      await continueAfterToolCall(
        tool,
        args,
        "Branding changes applied to the screen.",
        currentHistory,
        chatEndpoint,
        ctx,
      );
      return;
    }

    if (tool === "suggestColors") {
      const { colors, explanation } = args;
      // Populate the Custom Color Palette swatches
      if (ctx.actions.setSuggestedColors) ctx.actions.setSuggestedColors(colors);

      // Auto-apply colors that name a targetProperty (system prompt expects suggest + apply in one step).
      const changes = {};
      for (const c of colors || []) {
        if (c?.targetProperty && c?.hex) changes[c.targetProperty] = c.hex;
      }
      if (Object.keys(changes).length > 0) {
        const snapshot = {};
        Object.keys(changes).forEach((key) => {
          snapshot[key] = ctx.currentState?.[key];
        });
        pushRevertable({
          description: `Applied suggested colors (${Object.keys(changes).join(", ")})`,
          revertFn: (freshCtx) => {
            Object.entries(snapshot).forEach(([key, val]) => {
              if (val !== undefined && freshCtx?.actions?.[key]) freshCtx.actions[key](val);
            });
          },
        });
        Object.entries(changes).forEach(([key, value]) => {
          const setter = ctx.actions[key];
          if (setter) setter(value);
        });
      }

      // Show in-chat preview with color swatches
      addMessage({ role: "assistant", content: explanation, toolCall: { tool: "suggestColors", colors } });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "editLogo") {
      const { logoUrl, instructions, explanation } = args;
      addMessage({ role: "assistant", content: `${explanation} — this may take up to 30 seconds…` });
      setIsLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/logo-edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logoUrl, instructions }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Logo edit failed");
        const freshCtx = getScreenContext();
        if (freshCtx?.actions?.addLogo) freshCtx.actions.addLogo(data.url);
        addMessage({
          role: "assistant",
          content:
            "Done! The modified logo has been added to your available logos — you can now select it from the logo panel.",
        });
        if (isVoiceModeRef.current) speak("Done! The modified logo has been added to your available logos.");
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Sorry, I couldn't edit the logo: ${err.message || "please try again."}`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (
      [
        "resizeLogo",
        "cropLogo",
        "roundLogoCorners",
        "flattenLogo",
        "flipLogo",
        "rotateLogo",
        "grayscaleLogo",
        "addLogoPadding",
        "trimLogo",
        "removeBackgroundFromLogo",
      ].includes(tool)
    ) {
      const { logoUrl, explanation, ...params } = args;
      const ENDPOINT_MAP = {
        resizeLogo: "logo-resize",
        cropLogo: "logo-crop",
        roundLogoCorners: "logo-round-corners",
        flattenLogo: "logo-flatten",
        flipLogo: "logo-flip",
        rotateLogo: "logo-rotate",
        grayscaleLogo: "logo-grayscale",
        addLogoPadding: "logo-padding",
        trimLogo: "logo-trim",
        removeBackgroundFromLogo: "logo-remove-background",
      };
      const endpoint = ENDPOINT_MAP[tool];
      addMessage({ role: "assistant", content: explanation });
      setIsLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logoUrl, ...params }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Logo processing failed");
        const freshCtx = getScreenContext();
        if (freshCtx?.actions?.addLogo) freshCtx.actions.addLogo(data.url);
        addMessage({ role: "assistant", content: "Done! The modified logo has been added to your available logos." });
        if (isVoiceModeRef.current) speak("Done! The modified logo has been added to your available logos.");
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Sorry, I couldn't process the logo: ${err.message || "please try again."}`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === "saveBranding") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveBranding) await ctx.actions.saveBranding();
        // Chain a follow-up so the AI can issue a second action (e.g. navigation)
        await continueAfterToolCall(tool, args, "Branding saved successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateEmailTemplate") {
      const { subject, body, templateName, emailType, explanation } = args;
      // Switch to edit mode so changes are visible and saveable
      if (ctx.actions.enableEdit) ctx.actions.enableEdit();
      if (subject !== undefined && ctx.actions.subject) ctx.actions.subject(subject);
      if (body !== undefined && ctx.actions.body) ctx.actions.body(body);
      if (templateName !== undefined && ctx.actions.templateName) ctx.actions.templateName(templateName);
      if (emailType !== undefined && ctx.actions.emailType) ctx.actions.emailType(emailType);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "saveEmailTemplate") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveEmailTemplate) await ctx.actions.saveEmailTemplate();
        await continueAfterToolCall(
          tool,
          args,
          "Email template saved successfully.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createStrategy") {
      const { explanation, ...strategyArgs } = args;
      try {
        if (ctx.actions.createStrategy) await ctx.actions.createStrategy(strategyArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "linkStrategyToForm") {
      const { explanation, ...linkArgs } = args;
      try {
        if (ctx.actions.linkStrategyToForm) await ctx.actions.linkStrategyToForm(linkArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "moveFormToStrategy") {
      const { explanation, ...moveArgs } = args;
      try {
        if (ctx.actions.moveFormToStrategy) await ctx.actions.moveFormToStrategy(moveArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createStrategyAndMoveForm") {
      const { explanation, ...createMoveArgs } = args;
      try {
        if (ctx.actions.createStrategyAndMoveForm) await ctx.actions.createStrategyAndMoveForm(createMoveArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.createUser) await ctx.actions.createUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.updateUser) await ctx.actions.updateUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "changePassword") {
      const { explanation, ...pwArgs } = args;
      try {
        if (ctx.actions.changePassword) await ctx.actions.changePassword(pwArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "changePasswords") {
      const { explanation, ...pwArgs } = args;
      try {
        if (ctx.actions.changePasswords) await ctx.actions.changePasswords(pwArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteUser") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.deleteUser) await ctx.actions.deleteUser(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteUsers") {
      const { explanation, ...userArgs } = args;
      try {
        if (ctx.actions.deleteUsers) await ctx.actions.deleteUsers(userArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "createRole") {
      const { explanation, ...roleArgs } = args;
      try {
        if (ctx.actions.createRole) await ctx.actions.createRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateRole") {
      const { explanation, ...roleArgs } = args;
      // Snapshot old role state before updating
      const roles = ctx.currentState?.roles || [];
      const oldRole = roles.find((r) => r._id === roleArgs.roleId);
      if (oldRole) {
        pushRevertable({
          description: `Updated role "${oldRole.name}"`,
          revertFn: async (freshCtx) => {
            if (freshCtx?.actions?.updateRole) {
              await freshCtx.actions.updateRole({
                roleId: oldRole._id,
                name: oldRole.name,
                permissionNames: oldRole.permissions,
              });
            }
          },
        });
      }
      try {
        if (ctx.actions.updateRole) await ctx.actions.updateRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteRole") {
      const { explanation, ...roleArgs } = args;
      try {
        if (ctx.actions.deleteRole) await ctx.actions.deleteRole(roleArgs);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "setLookupActive") {
      const { updates, explanation } = args;
      // Snapshot old isActive per affected lookup
      const lookups = ctx.currentState?.lookups || [];
      const snapshot = updates.map(({ searchObjectKey }) => {
        const lookup = lookups.find((l) => l.searchObjectKey === searchObjectKey);
        return { searchObjectKey, wasActive: lookup?.isActive ?? false };
      });
      pushRevertable({
        description: `Changed active status on ${updates.length} lookup(s)`,
        revertFn: async (freshCtx) => {
          if (freshCtx?.actions?.setLookupActive) {
            for (const { searchObjectKey, wasActive } of snapshot) {
              await freshCtx.actions.setLookupActive({ searchObjectKey, isActive: wasActive });
            }
          }
        },
      });
      if (ctx.actions.setLookupActive) {
        for (const update of updates) {
          await ctx.actions.setLookupActive(update);
        }
      }
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "draftNewLookup") {
      const { explanation, ...draftData } = args;
      if (ctx.actions.openCreateModal) ctx.actions.openCreateModal(draftData);
      addMessage({
        role: "assistant",
        content: `I've drafted a new lookup and opened it in the editor for your review.\n\n${explanation}`,
      });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "createLookup") {
      const { explanation, ...lookupData } = args;
      try {
        if (ctx.actions.createLookup) await ctx.actions.createLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup created successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "updateLookup") {
      const { explanation, ...lookupData } = args;
      try {
        if (ctx.actions.updateLookup) await ctx.actions.updateLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup updated successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteBrandings") {
      const { explanation, brandingIds } = args;
      try {
        if (ctx.actions.deleteBrandings) await ctx.actions.deleteBrandings({ brandingIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "viewApplication") {
      const { explanation, applicationId } = args;
      const lastUser =
        getLastUserMessageText(currentHistory) ||
        getLastUserMessageText(getApiHistory?.() || []);

      if (shouldBlockMistakenViewApplication(lastUser)) {
        if (isUnderwritingIntent(lastUser) && ctx.actions.openUnderwriting) {
          ctx.actions.openUnderwriting({ applicationId });
          const msg =
            explanation ||
            "Opening underwriting for this application.";
          addMessage({ role: "assistant", content: msg });
          if (isVoiceModeRef.current) speak(msg);
          return;
        }
        const declineMessage =
          getMistakenViewApplicationMessage(lastUser) || FORWARD_FORM_DECLINE_MESSAGE;
        addMessage({ role: "assistant", content: declineMessage });
        if (isVoiceModeRef.current) speak(declineMessage);
        return;
      }

      if (ctx.actions.viewApplication) ctx.actions.viewApplication({ applicationId });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "openUnderwriting") {
      const { explanation, applicationId } = args;
      if (ctx.actions.openUnderwriting) ctx.actions.openUnderwriting({ applicationId });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "deleteApplications") {
      const { explanation, applicationIds } = args;
      try {
        if (ctx.actions.deleteApplications) await ctx.actions.deleteApplications({ applicationIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "openEditBranding") {
      const { explanation, brandingId } = args;
      if (ctx.actions.openEditBranding) ctx.actions.openEditBranding({ brandingId });
      else if (brandingId) navigate(`/branding/single/${brandingId}`);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "openCreateBranding") {
      const { explanation, fetchUrl } = args;
      if (fetchUrl) {
        addMessage({ role: "assistant", content: `Fetching branding from **${fetchUrl}**… this may take a moment.` });
        try {
          const res = await fetch(`${SERVER_URL}/api/ai/fetch-website-branding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ url: fetchUrl }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || "Failed to fetch branding");
          const pending = {
            brandingData: data.brandingData,
            screenshotUrl: data.screenshotUrl || null,
            url: fetchUrl,
          };
          sessionStorage.setItem("pendingBrandingData", JSON.stringify(pending));
          pendingAnalysisRef.current = pending;
        } catch (err) {
          addMessage({ role: "assistant", content: `${wt("fetchFailed")} **${fetchUrl}**: ${err.message}.` });
        }
      }
      if (ctx.actions.openCreateBranding) ctx.actions.openCreateBranding();
      else navigate("/branding/create");
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "selectFormForEditing") {
      const { explanation, formId } = args;

      // Guard against stale IDs (e.g. form was renamed/deleted since the last list refresh)
      const knownForms = ctx.currentState?.forms || [];
      if (formId && !knownForms.some((f) => String(f._id) === String(formId))) {
        const formList = knownForms
          .map(
            (f) =>
              `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`,
          )
          .join(", ");
        await continueAfterToolCall(
          tool,
          args,
          `Error: Form ID "${formId}" is not in the current forms list — it may have been deleted or recreated with a new ID. Current forms: ${formList || "none"}. Please use a valid ID from this list.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      addMessage({ role: "assistant", content: explanation || "Loading form details…" });
      if (isVoiceModeRef.current) speak(explanation || "Loading form details.");
      // Reset the form ID tracker so formDataSignal fires even if this form was
      // already loaded — this guarantees fresh data on every readiness check.
      signalContinuationPending();
      pendingFormContinuationRef.current = { toolArgs: args, history: currentHistory };
      if (ctx.actions.selectFormForEditing) ctx.actions.selectFormForEditing({ formId });
      return;
    }

    if (tool === "cloneFormSettings") {
      const { sourceFormId, targetFormId, sectionUpdates, fieldUpdates, explanation } = args;
      const cloneFailures = [];

      const targetSections = ctx.currentState?.detailedForm?.sections || [];
      const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
      const forms = ctx.currentState?.forms || [];
      const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
      const targetForm = forms.find((f) => String(f._id) === String(targetFormId));

      // Branding — independent step
      try {
        const sourceBrandingId = sourceForm?.branding?._id ? String(sourceForm.branding._id) : null;
        const sourceBrandingName = sourceForm?.branding?.name || sourceBrandingId;
        const targetBrandingId = targetForm?.branding?._id ? String(targetForm.branding._id) : null;
        if (!sourceBrandingId) {
          cloneFailures.push("**Branding:** source has no branding — skipped");
        } else if (sourceBrandingId === targetBrandingId) {
          cloneFailures.push(`**Branding:** already set to "${sourceBrandingName}" — skipped`);
        } else if (ctx.actions.setFormsBranding) {
          await ctx.actions.setFormsBranding({
            updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }],
          });
          cloneFailures.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
        }
      } catch (err) {
        cloneFailures.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Email templates — independent step
      try {
        const sourceTemplates = sourceForm?.emailTemplates || [];
        const targetTemplateIds = new Set((targetForm?.emailTemplates || []).map((t) => String(t._id)));
        const missingTemplates = sourceTemplates.filter((t) => !targetTemplateIds.has(String(t._id)));
        if (!sourceTemplates.length) {
          cloneFailures.push("**Email templates:** source has none — skipped");
        } else if (!missingTemplates.length) {
          cloneFailures.push(`**Email templates:** all ${sourceTemplates.length} already attached — skipped`);
        } else if (ctx.actions.attachEmailTemplate) {
          await ctx.actions.attachEmailTemplate({
            formId: String(targetFormId),
            templateIds: missingTemplates.map((t) => String(t._id)),
          });
          cloneFailures.push(
            `**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`,
          );
        }
      } catch (err) {
        cloneFailures.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Section updates — filter to valid target IDs and changed values, independent step
      try {
        const validSectionUpdates = (sectionUpdates || []).filter((u) => {
          const existing = targetSectionMap.get(String(u.sectionId));
          if (!existing) return false;
          const isEmpty = (v) => !v || v === "(not set)";
          if (u.displayText !== undefined && !isEmpty(u.displayText) && u.displayText !== existing.displayText)
            return true;
          if (
            u.signDisplayText !== undefined &&
            !isEmpty(u.signDisplayText) &&
            u.signDisplayText !== (existing.signDisplayText || existing.signFormatedDisplayText)
          )
            return true;
          if (
            u.aiCustomizablePrompt !== undefined &&
            !isEmpty(u.aiCustomizablePrompt) &&
            u.aiCustomizablePrompt !== existing.aiCustomizablePrompt
          )
            return true;
          if (u.aiFormatting !== undefined && !isEmpty(u.aiFormatting) && u.aiFormatting !== existing.ai_formatting)
            return true;
          if (u.isSignAiHelp !== undefined && u.isSignAiHelp !== existing.isSignAiHelp) return true;
          if (u.signAiPrompt !== undefined && !isEmpty(u.signAiPrompt) && u.signAiPrompt !== existing.signAiPrompt)
            return true;
          if (u.ownerSuggestions?.length) return true;
          return false;
        });
        if (validSectionUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validSectionUpdates });
          cloneFailures.push(`**Section settings:** updated ${validSectionUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Section settings:** all already matched — skipped");
        }
      } catch (err) {
        cloneFailures.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Field updates — independent step
      try {
        const validFieldUpdates = (fieldUpdates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validFieldUpdates.length && ctx.actions.updateFieldSettings) {
          await ctx.actions.updateFieldSettings({ updates: validFieldUpdates });
          cloneFailures.push(`**Field settings:** updated fields in ${validFieldUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Field settings:** all already matched — skipped");
        }
      } catch (err) {
        cloneFailures.push(`**Field settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Underwriting rules — independent step (always reported)
      try {
        if (ctx.actions.cloneRules) {
          const result = await ctx.actions.cloneRules({
            sourceFormId: String(sourceFormId),
            targetFormId: String(targetFormId),
          });
          if (result.cloned > 0) {
            cloneFailures.push(
              `**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`,
            );
          } else if (result.skipped > 0) {
            cloneFailures.push(
              `**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`,
            );
          } else {
            cloneFailures.push(
              `**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`,
            );
          }
        }
      } catch (err) {
        cloneFailures.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`);
      }

      const finalMessage = `Settings clone complete:\n\n${cloneFailures.join("\n")}`;
      addMessage({ role: "assistant", content: finalMessage });
      if (isVoiceModeRef.current) speak(finalMessage);
      return;
    }

    if (tool === "updateSectionSettings") {
      const { updates, sourceFormId } = args;
      const cloneResults = [];

      // Each step runs independently — a failure in one never prevents the others.
      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        const forms = ctx.currentState?.forms || [];
        const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
        const targetForm = forms.find((f) => String(f._id) === String(targetFormId));

        // Branding
        try {
          const sourceBrandingId = sourceForm?.branding?._id ? String(sourceForm.branding._id) : null;
          const sourceBrandingName = sourceForm?.branding?.name || sourceBrandingId;
          const targetBrandingId = targetForm?.branding?._id ? String(targetForm.branding._id) : null;
          if (!sourceBrandingId) {
            cloneResults.push("**Branding:** source has no branding — skipped");
          } else if (sourceBrandingId === targetBrandingId) {
            cloneResults.push(`**Branding:** already set to "${sourceBrandingName}" — skipped`);
          } else if (ctx.actions.setFormsBranding) {
            await ctx.actions.setFormsBranding({
              updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }],
            });
            cloneResults.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
          }
        } catch (err) {
          cloneResults.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`);
        }

        // Email templates
        try {
          const sourceTemplates = sourceForm?.emailTemplates || [];
          const targetTemplateIds = new Set((targetForm?.emailTemplates || []).map((t) => String(t._id)));
          const missingTemplates = sourceTemplates.filter((t) => !targetTemplateIds.has(String(t._id)));
          if (!sourceTemplates.length) {
            cloneResults.push("**Email templates:** source has none — skipped");
          } else if (!missingTemplates.length) {
            cloneResults.push(`**Email templates:** all ${sourceTemplates.length} already attached — skipped`);
          } else if (ctx.actions.attachEmailTemplate) {
            await ctx.actions.attachEmailTemplate({
              formId: String(targetFormId),
              templateIds: missingTemplates.map((t) => String(t._id)),
            });
            cloneResults.push(
              `**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`,
            );
          }
        } catch (err) {
          cloneResults.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`);
        }
      }

      // Section updates — filter to only valid sections in the current detailed form
      try {
        const targetSections = ctx.currentState?.detailedForm?.sections || [];
        const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
        const validUpdates = (updates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validUpdates });
          const skipped = (updates || []).length - validUpdates.length;
          cloneResults.push(
            `**Section settings:** applied ${validUpdates.length} update(s)${skipped ? ` (${skipped} skipped — invalid section ID)` : ""} ✓`,
          );
        } else if ((updates || []).length && !validUpdates.length) {
          cloneResults.push(`**Section settings:** skipped — no updates matched valid sections in the current form ✗`);
        }
      } catch (err) {
        cloneResults.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`);
      }

      // Underwriting rules — independent step
      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        try {
          if (targetFormId && ctx.actions.cloneRules) {
            const result = await ctx.actions.cloneRules({
              sourceFormId: String(sourceFormId),
              targetFormId: String(targetFormId),
            });
            if (result.cloned > 0) {
              cloneResults.push(
                `**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`,
              );
            } else if (result.skipped > 0) {
              cloneResults.push(
                `**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`,
              );
            } else {
              cloneResults.push(
                `**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`,
              );
            }
          }
        } catch (err) {
          cloneResults.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`);
        }
      }

      // Pass results to AI continuation so it can incorporate them into its final summary
      const resultSummary = cloneResults.length
        ? `Completed form-level settings. Results:\n${cloneResults.join("\n")}\n\nNow continue with field updates if any, then produce a final summary that incorporates these results verbatim.`
        : "Section settings applied to preview. Continue with field updates if any, then summarise.";
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "updateFieldSettings") {
      const { updates } = args;
      try {
        if (ctx.actions.updateFieldSettings) await ctx.actions.updateFieldSettings({ updates });
        await continueAfterToolCall(
          tool,
          args,
          "Field settings applied to preview.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "reorderSections") {
      const { sectionOrder, explanation } = args;
      try {
        if (ctx.actions.reorderSections) ctx.actions.reorderSections({ sectionOrder });
        await continueAfterToolCall(tool, args, "Sections reordered in preview.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteSection") {
      const { sectionId, explanation } = args;
      try {
        if (ctx.actions.deleteSection) ctx.actions.deleteSection({ sectionId });
        await continueAfterToolCall(
          tool,
          args,
          "Section marked for deletion in preview.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "saveFormEdits") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveFormEdits) await ctx.actions.saveFormEdits();
        addMessage({ role: "assistant", content: explanation || "All changes have been saved to the form." });
        if (isVoiceModeRef.current) speak(explanation || "All changes have been saved.");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `Save failed${detail ? `: ${detail}` : ""}. Some changes may not have been applied.`,
        });
      }
      return;
    }

    if (tool === "discardFormEdits") {
      const { explanation } = args;
      if (ctx.actions.discardFormEdits) ctx.actions.discardFormEdits();
      addMessage({ role: "assistant", content: explanation || "All pending changes have been discarded." });
      if (isVoiceModeRef.current) speak(explanation || "Pending changes discarded.");
      return;
    }

    if (tool === "updateForms") {
      const { explanation, updates } = args;
      try {
        if (ctx.actions.updateForms) await ctx.actions.updateForms({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "openApplyBrandingModal") {
      addMessage({ role: "assistant", content: APPLY_BRANDING_MODAL_DECLINE_MESSAGE });
      if (isVoiceModeRef.current) speak(APPLY_BRANDING_MODAL_DECLINE_MESSAGE);
      return;
    }

    if (tool === "setFormsBranding") {
      const { explanation, updates } = args;
      const lastUser =
        getLastUserMessageText(currentHistory) ||
        getLastUserMessageText(getApiHistory?.() || []);

      if (shouldBlockMistakenBrandingApply(lastUser)) {
        const declineMessage = getMistakenBrandingApplyDeclineMessage(lastUser);
        addMessage({ role: "assistant", content: declineMessage });
        if (isVoiceModeRef.current) speak(declineMessage);
        return;
      }
      const forms = ctx.forms || ctx.currentState?.forms || ctx.currentState?.availableForms || [];
      const oldHomeBrandingId = ctx.homeBranding?._id ?? ctx.currentState?.homeBranding?._id ?? null;
      let appliedHome = false;

      const snapshot = updates.map(({ formId, brandingId, applyToHome }) => {
        if (applyToHome) appliedHome = true;
        const form = formId ? forms.find((f) => f._id === formId) : null;
        return {
          formId,
          brandingId,
          applyToHome: !!applyToHome,
          oldBrandingId: form?.branding?._id ?? null,
        };
      });

      const formCount = snapshot.filter((s) => s.formId).length;
      const targetDesc = [
        formCount ? `${formCount} form(s)` : null,
        appliedHome ? "home/website" : null,
      ]
        .filter(Boolean)
        .join(" and ");

      pushRevertable({
        description: `Applied branding to ${targetDesc || "selected target(s)"}`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot
            .filter((s) => s.formId && s.oldBrandingId !== null)
            .map((s) => ({ formId: s.formId, brandingId: s.oldBrandingId }));
          const skipped = snapshot.filter((s) => s.formId && s.oldBrandingId === null).length;
          if (revertUpdates.length > 0 && freshCtx?.actions?.setFormsBranding) {
            await freshCtx.actions.setFormsBranding({ updates: revertUpdates });
          }
          if (appliedHome && oldHomeBrandingId && freshCtx?.actions?.setFormsBranding) {
            await freshCtx.actions.setFormsBranding({
              updates: [{ brandingId: oldHomeBrandingId, applyToHome: true }],
            });
          } else if (appliedHome && !oldHomeBrandingId) {
            addMessage({
              role: "assistant",
              content: "Note: home/website had no prior branding and cannot be automatically cleared.",
            });
          }
          if (skipped > 0) {
            addMessage({
              role: "assistant",
              content: `Note: ${skipped} form(s) had no branding set before this change and cannot be automatically reverted to "no branding".`,
            });
          }
        },
      });
      try {
        if (ctx.actions.setFormsBranding) await ctx.actions.setFormsBranding({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "setFormsLocation") {
      const { explanation, updates } = args;
      // Snapshot old locationStatus per affected form
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldLocationStatus: form?.locationStatus ?? "disabled" };
      });
      pushRevertable({
        description: `Changed location setting on ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot.map((s) => ({ formId: s.formId, locationStatus: s.oldLocationStatus }));
          if (freshCtx?.actions?.setFormsLocation) {
            await freshCtx.actions.setFormsLocation({ updates: revertUpdates });
          }
        },
      });
      try {
        if (ctx.actions.setFormsLocation) await ctx.actions.setFormsLocation({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "deleteForms") {
      const { explanation, formIds } = args;
      try {
        if (ctx.actions.deleteForms) await ctx.actions.deleteForms({ formIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "cloneForm") {
      const { explanation, sourceFormId, newName } = args;
      try {
        if (ctx.actions.cloneForm) {
          const result = await ctx.actions.cloneForm({ sourceFormId, newName });
          const rulesCloned = result?.rulesCloned ?? 0;
          const rulesNote =
            rulesCloned > 0
              ? `${rulesCloned} underwriting rule(s) cloned ✓`
              : "No rules were copied — no underwriting rules were found in the source form";
          await continueAfterToolCall(
            tool,
            args,
            `Form cloned successfully. New form: "${result?.name}" [${result?._id}]. All settings were copied from the source including branding, email templates, strategy linkage, section display text, owner suggestions, and field settings. **Rules:** ${rulesNote}. To verify owner suggestions and section-level settings, use selectFormForEditing on the new form.`,
            currentHistory,
            chatEndpoint,
            ctx,
          );
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "attachEmailTemplate") {
      const { formId, templateIds } = args;
      try {
        if (ctx.actions.attachEmailTemplate) await ctx.actions.attachEmailTemplate({ formId, templateIds });
        await continueAfterToolCall(
          tool,
          args,
          "Email templates attached successfully.",
          currentHistory,
          chatEndpoint,
          ctx,
        );
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "detachEmailTemplate") {
      const { explanation, formId, templateIds } = args;
      try {
        if (ctx.actions.detachEmailTemplate) await ctx.actions.detachEmailTemplate({ formId, templateIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "attachTemplateToForms") {
      const { explanation, formIds } = args;
      try {
        if (ctx.actions.attachToForms) await ctx.actions.attachToForms({ formIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "openCreateFormModal") {
      const { explanation } = args;
      if (ctx.actions.openCreateFormModal) ctx.actions.openCreateFormModal();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "previewFormStructure") {
      const { formName, sections, explanation } = args;
      addMessage({ role: "assistant", content: explanation, formPreview: { formName, sections } });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "readCsvFromPath") {
      const { filePath, explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      try {
        const res = await fetch(`${SERVER_URL}/api/form/csv-from-path`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath }),
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.message || "Could not read file");
        // Use the same phrasing as openCsvFilePicker so the formChat AI follows
        // the same CSV design workflow it uses after a manual file selection.
        const csvMessage = `Here is the CSV I selected as a starting point:\n\n**File:** ${d.filename}\n\`\`\`\n${d.content}\n\`\`\``;
        // Defer the send so applyToolCall can return first, the finally block can clear
        // isLoading, and React can re-render sendMessageRef with the updated loading state.
        // sendMessage guards with `if (isLoading) return` so calling it synchronously here
        // (while still inside applyToolCall) silently no-ops.
        setTimeout(() => {
          if (sendMessageRef.current) sendMessageRef.current(csvMessage);
        }, 100);
      } catch (err) {
        addMessage({ role: "assistant", content: `Could not read the file: ${err.message}` });
      }
      return;
    }

    if (tool === "openCsvFilePicker") {
      const { explanation } = args;
      addMessage({ role: "assistant", content: explanation });
      setTimeout(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,text/csv";
        input.style.display = "none";
        document.body.appendChild(input);
        const cleanup = () => {
          if (document.body.contains(input)) document.body.removeChild(input);
        };
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          cleanup();
          if (!file) return;
          try {
            const text = await file.text();
            if (sendMessageRef.current) {
              await sendMessageRef.current(
                `Here is the CSV I selected as a starting point:\n\n**File:** ${file.name}\n\`\`\`\n${text}\n\`\`\``,
              );
            }
          } catch {
            addMessage({ role: "assistant", content: `${wt("errorCouldnt")}. ${wt("tryAgain")}` });
          }
        };
        input.addEventListener("cancel", cleanup);
        input.click();
      }, 100);
      return;
    }

    if (tool === "generateFormCsv") {
      const { csvContent, filename, explanation } = args;
      // Attach the CSV to the message as a download action — the Save button in
      // ChatMessage triggers showSaveFilePicker from a real user click, which is
      // required by the browser's File System Access API security policy.
      addMessage({
        role: "assistant",
        content: explanation,
        csvDownload: { csvContent, filename },
      });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    // ── Applicant assistant tools ──────────────────────────────────────────────

    if (tool === "fillField") {
      const { fieldId } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      let value = args.value;

      // Normalise date values to YYYY-MM-DD so <input type="date"> accepts them
      if (fieldMeta?.type === "date" && value) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth() + 1).padStart(2, "0");
          const d = String(parsed.getDate()).padStart(2, "0");
          value = `${y}-${m}-${d}`;
        }
      }

      // Normalise phone numbers to E.164 format (+[country][number], digits only)
      if (
        fieldMeta?.type === "tel" ||
        fieldMeta?.type === "phone" ||
        /phone|mobile|cell/i.test(fieldId) ||
        /phone|mobile|cell/i.test(fieldMeta?.label || "")
      ) {
        if (value) {
          // Strip everything except digits and a leading +
          let digits = value.replace(/[^\d+]/g, "");
          // If no country code present, infer from already-filled address fields
          if (!digits.startsWith("+") && !digits.startsWith("00")) {
            const fields = ctx.currentState?.fields || [];
            const countryField = fields.find((f) => /country/i.test(f.label) || /country/i.test(f.id));
            const stateField = fields.find((f) => /\bstate\b/i.test(f.label) || /\bstate\b/i.test(f.id));
            const countryVal = (countryField?.value || "").toLowerCase();
            const stateVal = (stateField?.value || "").toLowerCase();
            const isUS =
              /^(us|usa|united states)$/.test(countryVal) ||
              /^(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)$/.test(
                stateVal,
              );
            digits = (isUS || (!countryVal && !stateVal) ? "+1" : "+") + digits;
          } else if (digits.startsWith("00")) {
            digits = "+" + digits.slice(2);
          }
          value = digits;
        }
      }
      console.log(
        `%c[TOOL:fillField] about to fill — fieldId="${fieldId}" value="${value}" (raw args.value="${args.value}")`,
        "color:#e05; font-weight:bold",
      );
      try {
        if (ctx.actions.fillField) {
          // Dodge panel so user can see the field being filled
          const fillEl = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
          activatedFieldIdRef.current = fieldId;
          dodgeForField(fillEl);
          await ctx.actions.fillField({ fieldId, value });
          // Record every confirmed fill so goToNextStep can emit a session-wide lookup block.
          if (value) confirmedValuesRef.current[fieldId] = value;
          // Patch the context so the AI sees this field as filled — React won't have
          // re-rendered yet, so the ref still carries the stale pre-fill state.
          const patchedCtx = {
            ...ctx,
            currentState: {
              ...ctx.currentState,
              fields:
                ctx.currentState?.fields?.map((f) => (f.id === fieldId ? { ...f, value, filled: true } : f)) ?? [],
            },
          };
          // Build continuation result — tell the AI to advance to the next field in list order.
          let fillResultMsg = `Field "${fieldId}" filled with "${value}" successfully.`;
          if (assistantMode === "applicant") {
            fillResultMsg =
              `[FILL_CONFIRMED] Field "${fieldId}" filled with "${value}". ` +
              `Do NOT apply Rule 3 (pre-filled confirmation) to this field. ` +
              `Call openFieldPanel for the next empty field after "${fieldId}" in list order immediately — pure tool call only, zero chat text.`;
          }
          // Send the function result back so the AI confirms the fill and immediately
          // asks for the next required field without waiting for user input.
          await continueAfterToolCall(tool, args, fillResultMsg, currentHistory, chatEndpoint, patchedCtx);
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}`,
        });
      }
      return;
    }

    if (tool === "fillSignature") {
      const { fieldId, name, explanation } = args;
      // Dispatch a custom event to the SignatureBox — it handles rendering + saving.
      const sigEl = fieldId
        ? document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`)
        : document.querySelector('[data-ai-type="sign"]');
      if (sigEl) {
        sigEl.dispatchEvent(new CustomEvent("ai:fill-signature", { detail: { name }, bubbles: false }));
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
        // Wait for the signature save to complete before telling the AI to continue.
        // SignatureBox.onSave is async (API upload); it sets data-ai-value="signed" on the
        // wrapper only after the parent updates oldSignatureUrl. A MutationObserver on that
        // attribute is the minimal reactive wait — zero polling, zero side effects elsewhere.
        if (sigEl.getAttribute("data-ai-value") !== "signed") {
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 12000); // 12s hard cap
            const observer = new MutationObserver(() => {
              if (sigEl.getAttribute("data-ai-value") === "signed") {
                clearTimeout(timeout);
                observer.disconnect();
                resolve();
              }
            });
            observer.observe(sigEl, { attributes: true, attributeFilter: ["data-ai-value"] });
          });
        }
        // Build continuation result — tell the AI to advance to the next field in list order.
        let sigResultMsg = `Typed signature "${name}" recorded on the signature field.`;
        if (assistantMode === "applicant") {
          sigResultMsg =
            `[FILL_CONFIRMED] You just recorded signature "${name}" in this exchange — the applicant provided this name moments ago. ` +
            `Do NOT apply Rule 3 (pre-filled confirmation) to the signature field. ` +
            `Move immediately to the next field after the signature in the list order. Do not go back to any previous field.`;
        }
        // Patch context so the AI sees the signature field as filled — same pattern as fillField.
        const patchedCtx = {
          ...ctx,
          currentState: {
            ...ctx.currentState,
            fields:
              ctx.currentState?.fields?.map((f) =>
                f.isSignature || f.id === fieldId ? { ...f, value: "signed", filled: true } : f,
              ) ?? [],
          },
        };
        await continueAfterToolCall(tool, args, sigResultMsg, currentHistory, chatEndpoint, patchedCtx);
      } else {
        addMessage({ role: "assistant", content: wt("errorCouldnt") + ". " + wt("tryAgain") });
      }
      return;
    }

    if (tool === "openFieldPanel") {
      const { fieldId, explanation } = args;
      const fieldMeta = ctx.currentState?.fields?.find((f) => f.id === fieldId);
      const fieldLabel = fieldMeta?.label || fieldId;
      const fieldMode = fieldMeta?.fieldMode || "direct";

      // Guard: openFieldPanel must never be called for radio or select fields.
      // If the AI does it anyway, send an error back so it corrects itself.
      if (fieldMeta?.type === "radio" || fieldMeta?.type === "select") {
        const optionsList =
          Array.isArray(fieldMeta.options) && fieldMeta.options.length
            ? fieldMeta.options
                .map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label} [value: ${o.value}]`)
                .join(", ")
            : "(no options available)";
        await continueAfterToolCall(
          tool,
          args,
          `ERROR: openFieldPanel cannot be used for "${fieldLabel}" because it is a ${fieldMeta.type} field. ` +
            `You MUST output a chat message listing options instead and wait for the applicant's choice, then call fillField. ` +
            `Field options: ${optionsList}. Do NOT call openFieldPanel again for this field.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      // Show the AI's explanation as a chat message first
      if (explanation) {
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      }

      // Store history + ctx for use in the completion callback
      adePanelCallbackRef.current = { args, history: currentHistory, ctx };

      // Scroll the chat panel so the ADE panel is visible
      setTimeout(() => scrollToBottom(), 100);

      // Dodge toward the target field so the panel doesn't cover it
      const targetEl =
        document.getElementById(fieldId) ||
        document.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
        document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
      if (targetEl) setTimeout(() => dodgeForField(targetEl), 200);

      setAdePanel({ fieldId, fieldLabel, fieldMode, required: fieldMeta?.required ?? true });
      return;
    }

    if (tool === "scrollToField") {
      const { fieldId } = args;
      // Always silent — scrollToField never produces a chat message or spoken output.
      if (ctx.actions.scrollToField) {
        ctx.actions.scrollToField({ fieldId });
      } else {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Keep focus in the chat input, not on the scrolled-to field.
      if (assistantMode === "applicant") {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      // Send result back so the AI can continue to the next action (e.g. openFieldPanel).
      await continueAfterToolCall(
        tool,
        args,
        `Scrolled to field "${fieldId}". Now call openFieldPanel for this field — Data Collection rules apply. Do NOT use activateField or output chat text.`,
        currentHistory,
        chatEndpoint,
        ctx,
      );
      return;
    }

    if (tool === "activateField") {
      const { fieldId, explanation } = args;
      const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      activatedFieldIdRef.current = fieldId;
      // Always suppress the post-response chat auto-focus, even if the element
      // isn't found yet — we don't want the chat input stealing focus.
      suppressChatFocusRef.current = true;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // After scroll settles: re-snap to ensure field is in viewport, then
        // dodge the panel if it overlaps, then focus.
        setTimeout(() => {
          // Re-look up in case React recreated the element during the wait
          const target =
            document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`) || el;
          if (!target) {
            suppressChatFocusRef.current = false;
            return;
          }
          target.scrollIntoView({ behavior: "instant", block: "center" });

          // Only move focus if the user hasn't already navigated to a different form field.
          // If they clicked/tabbed somewhere else while waiting for the AI response, respect that.
          // Also skip if the user is already on this exact field (don't disrupt mid-typing with select()).
          const active = document.activeElement;
          const alreadyOnTarget = active === target;
          const userMovedElsewhere =
            !alreadyOnTarget &&
            active &&
            active !== inputRef.current &&
            ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName);
          if (!alreadyOnTarget && !userMovedElsewhere) {
            target.focus();
            try {
              target.select();
            } catch (_) {}
          }

          dodgeForField(target);
          // Release the chat-focus suppression shortly after so normal state can resume.
          setTimeout(() => {
            suppressChatFocusRef.current = false;
          }, 400);
        }, 400);
      }
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "submitOtpCode") {
      const { otp, email } = args;
      console.log(
        "%c[AI:submitOtpCode] tool fired — email=%s otp=%s screenId=%s",
        "color:#ea580c; font-weight:bold",
        email,
        otp,
        ctx?.screenId,
      );
      console.log(
        "%c[AI:submitOtpCode] context fields=%o  actions=%o",
        "color:#ea580c",
        ctx?.currentState?.fields?.map((f) => ({ id: f.id, value: f.value, filled: f.filled })),
        Object.keys(ctx?.actions || {}),
      );
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: "otp-field", value: otp });
      let resultSummary;
      try {
        if (ctx.actions.verifyOtpCode) await ctx.actions.verifyOtpCode({ otp, email });
        resultSummary = "OTP verification succeeded. The applicant's email is now verified.";
        // Record the verified email so Step 1 on any later page can match it purely by
        // value — the synthetic key "_otp_email" is unambiguous (not a real field ID).
        if (email) confirmedValuesRef.current["_otp_email"] = email;
        console.log("%c[AI:submitOtpCode] ✓ verification succeeded", "color:#16a34a; font-weight:bold");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        resultSummary = `OTP verification failed${detail ? `: ${detail}` : ""}. Ask the applicant whether they entered the code correctly and invite them to try again.`;
        console.error(
          "%c[AI:submitOtpCode] ✗ verification failed — detail=%s",
          "color:#dc2626; font-weight:bold",
          detail,
        );
      }
      console.log("%c[AI:submitOtpCode] resultSummary → %s", "color:#ea580c", resultSummary);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "submitEmailForOtp") {
      const { email } = args;
      console.log(
        "%c[AI:submitEmailForOtp] tool fired — email=%s screenId=%s",
        "color:#ea580c; font-weight:bold",
        email,
        ctx?.screenId,
      );
      console.log(
        "%c[AI:submitEmailForOtp] context fields=%o  actions=%o",
        "color:#ea580c",
        ctx?.currentState?.fields?.map((f) => ({ id: f.id, value: f.value, filled: f.filled })),
        Object.keys(ctx?.actions || {}),
      );
      if (ctx.actions.fillField) ctx.actions.fillField({ fieldId: "email-field", value: email });
      let resultSummary;
      try {
        if (ctx.actions.sendOtpForEmail) await ctx.actions.sendOtpForEmail({ email });
        resultSummary = `OTP email sent successfully to ${email}. Tell the applicant to check their inbox and spam folder, then come back and provide the code.`;
        console.log("%c[AI:submitEmailForOtp] ✓ OTP sent", "color:#16a34a; font-weight:bold");
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        resultSummary = `Failed to send OTP email to ${email}${detail ? `: ${detail}` : ""}. Let the applicant know and ask them to check the email address or try again.`;
        console.error("%c[AI:submitEmailForOtp] ✗ send failed — detail=%s", "color:#dc2626; font-weight:bold", detail);
      }
      console.log("%c[AI:submitEmailForOtp] resultSummary → %s", "color:#ea580c", resultSummary);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "goToNextStep") {
      if (ctx.actions.goToNextStep) await ctx.actions.goToNextStep();
      // Wait for React to re-render with the new step's fields (or for navigation to complete)
      await new Promise((r) => setTimeout(r, 150));
      const freshCtx = getScreenContext();
      // If the page navigated away (context null or different screenId), the screen-change
      // effect and autoGuide handle the transition — nothing more needed here.
      if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
      // Build a compact confirmed-values block so the AI can do Step 1 matching on the
      // next page without relying on scanning conversation history.
      const confirmedEntries = Object.entries(confirmedValuesRef.current);
      const confirmedBlock =
        confirmedEntries.length > 0
          ? ` [CONFIRMED THIS SESSION: ${confirmedEntries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
          : "";
      await continueAfterToolCall(
        tool,
        args,
        `Moved to the next step successfully.${confirmedBlock}`,
        currentHistory,
        chatEndpoint,
        freshCtx,
      );
      return;
    }

    if (tool === "enterTranslationMode") {
      const { language, languageName, explanation } = args;
      const mode = { lang: language, langName: languageName };
      translationModeRef.current = mode;
      setTranslationMode(mode);
      tooltipCacheRef.current = {}; // clear cached translations from any previous language
      addMessage({ role: "assistant", content: explanation || "" });
      return;
    }

    if (tool === "goToPrevStep") {
      if (ctx.actions.goToPrevStep) await ctx.actions.goToPrevStep();
      await new Promise((r) => setTimeout(r, 150));
      const freshCtx = getScreenContext();
      if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
      await continueAfterToolCall(
        tool,
        args,
        "Moved to the previous step successfully.",
        currentHistory,
        chatEndpoint,
        freshCtx,
      );
      return;
    }

    // ── Testing Assistant tools ────────────────────────────────────────────────

    if (tool === "createTestCase") {
      const { explanation, ...fields } = args;
      try {
        if (ctx.actions.createTestCase) await ctx.actions.createTestCase({ explanation, ...fields });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't create the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "updateTestCase") {
      const { explanation, ...fields } = args;
      try {
        if (ctx.actions.updateTestCase) await ctx.actions.updateTestCase({ explanation, ...fields });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't update the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "deleteTestCases") {
      const { testCaseIds, explanation } = args;
      try {
        if (ctx.actions.deleteTestCases) await ctx.actions.deleteTestCases({ testCaseIds, explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't delete the test case(s)${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "duplicateTestCase") {
      const { explanation, testCaseId, newName } = args;
      try {
        if (ctx.actions.duplicateTestCase) await ctx.actions.duplicateTestCase({ testCaseId, newName, explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't duplicate the test case${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "openEditor") {
      const { testCaseId, explanation } = args;
      if (ctx.actions.openEditor) ctx.actions.openEditor({ testCaseId, explanation });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "setFilterArea") {
      const { area, explanation } = args;
      if (ctx.actions.setFilterArea) ctx.actions.setFilterArea({ area, explanation });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "seedFromStatic") {
      const { explanation } = args;
      try {
        if (ctx.actions.seedFromStatic) await ctx.actions.seedFromStatic({ explanation });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't seed from static files${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    // ── Demo Builder tools ─────────────────────────────────────────────────────

    if (tool === "updateBuilderSteps") {
      const { message, ...stepsData } = args;
      if (ctx.actions.updateBuilderSteps) ctx.actions.updateBuilderSteps(stepsData);
      addMessage({
        role: "assistant",
        content: null,
        function_call: { name: "updateBuilderSteps", arguments: JSON.stringify(args) },
      });
      addMessage({
        role: "function",
        name: "updateBuilderSteps",
        content: `Steps replaced. New step count: ${stepsData.steps?.length ?? 0}.`,
      });
      addMessage({ role: "assistant", content: message });
      if (isVoiceModeRef.current) speak(message);
      return;
    }

    if (tool === "addStepToBuilder") {
      const { message, ...stepData } = args;
      if (ctx.actions.addStepToBuilder) ctx.actions.addStepToBuilder(stepData);
      const stepDesc = `${stepData.step?.action || ""}${stepData.step?.selector ? ` ${stepData.step.selector}` : ""}${stepData.step?.value ? ` "${stepData.step.value}"` : ""}`;
      addMessage({
        role: "assistant",
        content: null,
        function_call: { name: "addStepToBuilder", arguments: JSON.stringify(args) },
      });
      addMessage({
        role: "function",
        name: "addStepToBuilder",
        content: `Step confirmed and added: ${stepDesc}. Do NOT add this step again.`,
      });
      addMessage({ role: "assistant", content: message });
      if (isVoiceModeRef.current) speak(message);
      return;
    }

    if (tool === "buildDemoAction") {
      const { explanation, ...actionData } = args;
      if (ctx.actions.buildDemoAction) ctx.actions.buildDemoAction(actionData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "saveDemoAction") {
      const { explanation, ...saveData } = args;
      try {
        if (ctx.actions.saveDemoAction) await ctx.actions.saveDemoAction(saveData);
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.message || "";
        addMessage({
          role: "assistant",
          content: `Couldn't save the demo action${detail ? `: ${detail}` : ""}. Please try again.`,
        });
      }
      return;
    }

    if (tool === "selectFeatures") {
      const { explanation, ...selectData } = args;
      if (ctx.actions.selectFeatures) ctx.actions.selectFeatures(selectData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "setNarrationInstructions") {
      const { explanation, ...instrData } = args;
      if (ctx.actions.setNarrationInstructions) ctx.actions.setNarrationInstructions(instrData);
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }
  }

  return applyToolCall;
}
