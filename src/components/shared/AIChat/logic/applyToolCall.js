import { PAGE_LABELS, PAGE_ROUTES, SERVER_URL } from "../constants/aiChatConstants.js";
import { toPreviewSection } from "./formPreviewUtils.js";

/**
 * Creates the tool-call handler with bindings from the chat widget/controller.
 * Body is transplanted verbatim from the stagging AIChatWidget's applyToolCall
 * to keep behavior identical, adapted only to read closure state from `bindings`.
 */
export function createApplyToolCall(bindings) {
  const {
    getScreenContext,
    assistantMode,
    addMessage,
    isVoiceModeRef,
    speak,
    wt,
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
    dodgeForField,
    scrollToBottom,
    activatedFieldIdRef,
    inputRef,
    suppressChatFocusRef,
    suppressNextScreenGreetingRef,
    pendingFollowUpRef,
    navTimeoutRef,
    translationModeRef,
    setTranslationMode,
    tooltipCacheRef,
    sendMessageRef,
    addBrandingToFormGlobal,
  } = bindings;

  const applyToolCall = async (tool, args, currentHistory) => {
    console.log(`%c[TOOL] applyToolCall: ${tool}`, "color:#c0f; font-weight:bold", args);
    const ctx = getScreenContext();
    if (!ctx?.actions) return;
    const defaultEndpoint = assistantMode === "applicant"
      ? `${SERVER_URL}/api/ai/applicant-chat`
      : `${SERVER_URL}/api/ai/branding-chat`;
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
        addMessage({ role: "assistant", content: `${wt("revertFailed")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "fetchWebsiteBranding") {
      const { url, companyName: aiProvidedName } = args;
      addMessage({ role: "assistant", content: `Fetching **${url}**… this may take a moment.` });

      // ── Step 1: fetch branding data ──────────────────────────────────────────
      let brandingData, screenshotUrl;
      try {
        const res = await fetch(`${SERVER_URL}/api/ai/fetch-website-branding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed");
        brandingData = data.brandingData;
        screenshotUrl = data.screenshotUrl;
      } catch {
        addMessage({ role: "assistant", content: `${wt("fetchFailed")} **${url}**. ${wt("tryAgain")}` });
        return;
      }

      // ── Step 2: apply extracted branding to the UI ───────────────────────────
      if (ctx.actions.applyExtractedBranding) {
        ctx.actions.applyExtractedBranding(brandingData);
      }
      if (screenshotUrl && ctx.actions.setWebsiteImage) {
        ctx.actions.setWebsiteImage(screenshotUrl);
      }

      // Company name resolution (in priority order):
      // 1. AI was explicitly given a name by the user → always use it
      // 2. User pre-filled the field before asking AI → preserve it (don't extract)
      // 3. Field is blank → fill from extraction result, then domain as fallback
      if (ctx.actions.companyName) {
        const existingName = ctx.currentState?.companyName;
        if (aiProvidedName) {
          ctx.actions.companyName(aiProvidedName);
        } else if (!existingName) {
          const nameFromDomain = (() => {
            try {
              const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
              const base = hostname.replace(/^www\./, "").split(".")[0];
              return base.charAt(0).toUpperCase() + base.slice(1);
            } catch { return ""; }
          })();
          const nameToUse = brandingData?.name || nameFromDomain;
          if (nameToUse) ctx.actions.companyName(nameToUse);
        }
        // else: user pre-filled and AI has no name to offer — leave as-is
      }

      // Auto-fill website URL if blank
      if (!ctx.currentState?.websiteUrl && ctx.actions.websiteUrl) {
        ctx.actions.websiteUrl(url);
      }

      // ── Step 3: Inject a hardcoded confirmation — no AI call ─────────────────
      // Branding fields are already applied by applyExtractedBranding above.
      // We do not involve AI here to prevent it from overwriting extracted values.
      const displayName = brandingData?.name || (() => {
        try {
          const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
          return hostname.replace(/^www\./, "").split(".")[0];
        } catch { return url; }
      })();
      addMessage({ role: "assistant", content: `Branding extracted from **${displayName}** and applied. You can review the colors and logos above, or ask me to make any adjustments.` });
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
        addMessage({ role: "assistant", content: "Open the Extract Branding modal and switch to the Manual Extract tab to continue." });
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
        ].filter(Boolean).join("\n");

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
        addMessage({ role: "assistant", content: "I couldn't parse the pasted content. Try pasting just the hex color codes or CSS variables directly." });
      }
      return;
    }

    if (tool === "applyBrandingChanges") {
      const { changes, explanation } = args;
      // Snapshot current values before overwriting
      const snapshot = {};
      Object.keys(changes).forEach((key) => { snapshot[key] = ctx.currentState?.[key]; });
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
      // Continue so the AI can chain the next step of a compound command (e.g. save, assign to form).
      // Suppress plain text response — explanation was already shown above; only tool calls should proceed.
      await continueAfterToolCall(tool, args, "Branding changes applied to the screen.", currentHistory, chatEndpoint, ctx, true);
      return;
    }

    if (tool === "suggestColors") {
      const { colors, explanation } = args;
      // Populate the Custom Color Palette swatches
      if (ctx.actions.setSuggestedColors) ctx.actions.setSuggestedColors(colors);
      // Show in-chat preview with color swatches
      addMessage({ role: "assistant", content: explanation, toolCall: { tool: "suggestColors", colors } });
      if (isVoiceModeRef.current) speak(explanation);
      // suggestColors is end-of-turn — show colors and wait for user confirmation before applying
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
        addMessage({ role: "assistant", content: "Done! The modified logo has been added to your available logos — you can now select it from the logo panel." });
        if (isVoiceModeRef.current) speak("Done! The modified logo has been added to your available logos.");
      } catch (err) {
        addMessage({ role: "assistant", content: `Sorry, I couldn't edit the logo: ${err.message || "please try again."}` });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (["resizeLogo", "cropLogo", "roundLogoCorners", "flattenLogo",
         "flipLogo", "rotateLogo", "grayscaleLogo", "addLogoPadding", "trimLogo",
         "removeBackgroundFromLogo"].includes(tool)) {
      const { logoUrl, explanation, ...params } = args;
      const ENDPOINT_MAP = {
        resizeLogo:               "logo-resize",
        cropLogo:                 "logo-crop",
        roundLogoCorners:         "logo-round-corners",
        flattenLogo:              "logo-flatten",
        flipLogo:                 "logo-flip",
        rotateLogo:               "logo-rotate",
        grayscaleLogo:            "logo-grayscale",
        addLogoPadding:           "logo-padding",
        trimLogo:                 "logo-trim",
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
        addMessage({ role: "assistant", content: `Sorry, I couldn't process the logo: ${err.message || "please try again."}` });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === "saveBranding") {
      const { explanation } = args;
      try {
        if (ctx.actions.saveBranding) await ctx.actions.saveBranding();
        // Show the save confirmation immediately — do NOT let the follow-up generate
        // a plain-text response, which could falsely claim the branding was also applied.
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
        // Chain a follow-up for tool-based actions (e.g. navigation) but suppress text.
        await continueAfterToolCall(tool, args, "Branding saved successfully.", currentHistory, chatEndpoint, ctx, true);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "applyBrandingToForms") {
      const { formIds, onHome, brandingId: argBrandingId, explanation } = args;
      try {
        if (ctx.actions.saveAndApplyBrandingToForms) {
          // On the branding page: save (if needed) + apply + navigate in one atomic operation
          await ctx.actions.saveAndApplyBrandingToForms({ formIds: formIds || [], onHome: !!onHome });
        } else if (argBrandingId && ((formIds || []).length > 0 || onHome)) {
          // Fallback: branding already saved, apply directly via global mutation
          const errors = [];
          if (onHome) {
            try {
              await addBrandingToFormGlobal({ brandingId: argBrandingId, onHome: "yes" }).unwrap();
            } catch {
              errors.push("website");
            }
          }
          for (const formId of (formIds || [])) {
            try {
              await addBrandingToFormGlobal({ brandingId: argBrandingId, formId, onHome: "no" }).unwrap();
            } catch {
              errors.push(formId);
            }
          }
          if (errors.length) throw new Error(`Failed to set branding on ${errors.length} target(s)`);
          if (onHome) {
            window.location.href = "/branding";
          } else {
            navigate("/branding");
          }
        } else {
          throw new Error("applyBrandingToForms action not available on this screen");
        }
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
      try {
        if (ctx.actions.saveEmailTemplate) await ctx.actions.saveEmailTemplate();
        await continueAfterToolCall(tool, args, "Email template saved successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "saveAndAttachToForms") {
      const { explanation, formIds } = args;
      try {
        if (ctx.actions.saveAndAttachToForms) await ctx.actions.saveAndAttachToForms({ formIds });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
      const { explanation: _explanation, ...lookupData } = args;
      try {
        if (ctx.actions.createLookup) await ctx.actions.createLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup created successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "updateLookup") {
      const { explanation: _explanation, ...lookupData } = args;
      try {
        if (ctx.actions.updateLookup) await ctx.actions.updateLookup(lookupData);
        await continueAfterToolCall(tool, args, "Lookup updated successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "openEditBranding") {
      const { explanation, brandingId } = args;
      if (ctx.actions.openEditBranding) ctx.actions.openEditBranding({ brandingId });
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "openCreateBranding") {
      const { explanation } = args;
      if (ctx.actions.openCreateBranding) ctx.actions.openCreateBranding();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "selectFormForEditing") {
      const { explanation, formId } = args;

      // Guard against stale IDs (e.g. form was renamed/deleted since the last list refresh)
      const knownForms = ctx.currentState?.forms || [];
      if (formId && !knownForms.some((f) => String(f._id) === String(formId))) {
        const formList = knownForms.map((f) =>
          `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`
        ).join(", ");
        await continueAfterToolCall(
          tool, args,
          `Error: Form ID "${formId}" is not in the current forms list — it may have been deleted or recreated with a new ID. Current forms: ${formList || "none"}. Please use a valid ID from this list.`,
          currentHistory, chatEndpoint, ctx,
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
      const { sourceFormId, targetFormId, sectionUpdates, fieldUpdates } = args;
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
          await ctx.actions.setFormsBranding({ updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }] });
          cloneFailures.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
        }
      } catch (err) { cloneFailures.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`); }

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
          await ctx.actions.attachEmailTemplate({ formId: String(targetFormId), templateIds: missingTemplates.map((t) => String(t._id)) });
          cloneFailures.push(`**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`);
        }
      } catch (err) { cloneFailures.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`); }

      // Section updates — filter to valid target IDs and changed values, independent step
      try {
        const validSectionUpdates = (sectionUpdates || []).filter((u) => {
          const existing = targetSectionMap.get(String(u.sectionId));
          if (!existing) return false;
          const isEmpty = (v) => !v || v === "(not set)";
          if (u.displayText !== undefined && !isEmpty(u.displayText) && u.displayText !== existing.displayText) return true;
          if (u.signDisplayText !== undefined && !isEmpty(u.signDisplayText) && u.signDisplayText !== (existing.signDisplayText || existing.signDisplayFormattedText)) return true;
          if (u.aiCustomizablePrompt !== undefined && !isEmpty(u.aiCustomizablePrompt) && u.aiCustomizablePrompt !== existing.aiCustomizablePrompt) return true;
          if (u.aiFormatting !== undefined && !isEmpty(u.aiFormatting) && u.aiFormatting !== existing.ai_formatting) return true;
          if (u.isSignAiHelp !== undefined && u.isSignAiHelp !== existing.isSignAiHelp) return true;
          if (u.signAiPrompt !== undefined && !isEmpty(u.signAiPrompt) && u.signAiPrompt !== existing.signAiPrompt) return true;
          if (u.ownerSuggestions?.length) return true;
          return false;
        });
        if (validSectionUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validSectionUpdates });
          cloneFailures.push(`**Section settings:** updated ${validSectionUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Section settings:** all already matched — skipped");
        }
      } catch (err) { cloneFailures.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`); }

      // Field updates — independent step
      try {
        const validFieldUpdates = (fieldUpdates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validFieldUpdates.length && ctx.actions.updateFieldSettings) {
          await ctx.actions.updateFieldSettings({ updates: validFieldUpdates });
          cloneFailures.push(`**Field settings:** updated fields in ${validFieldUpdates.length} section(s) ✓`);
        } else {
          cloneFailures.push("**Field settings:** all already matched — skipped");
        }
      } catch (err) { cloneFailures.push(`**Field settings:** failed — ${err?.message || "unknown error"} ✗`); }

      // Underwriting rules — independent step (always reported)
      try {
        if (ctx.actions.cloneRules) {
          const result = await ctx.actions.cloneRules({ sourceFormId: String(sourceFormId), targetFormId: String(targetFormId) });
          if (result.cloned > 0) {
            cloneFailures.push(`**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`);
          } else if (result.skipped > 0) {
            cloneFailures.push(`**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`);
          } else {
            cloneFailures.push(`**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`);
          }
        }
      } catch (err) { cloneFailures.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`); }

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
            await ctx.actions.setFormsBranding({ updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }] });
            cloneResults.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
          }
        } catch (err) { cloneResults.push(`**Branding:** failed — ${err?.message || "unknown error"} ✗`); }

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
            await ctx.actions.attachEmailTemplate({ formId: String(targetFormId), templateIds: missingTemplates.map((t) => String(t._id)) });
            cloneResults.push(`**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`);
          }
        } catch (err) { cloneResults.push(`**Email templates:** failed — ${err?.message || "unknown error"} ✗`); }
      }

      // Section updates — filter to only valid sections in the current detailed form.
      // Use getScreenContext() fresh here (not the stale ctx captured at applyToolCall start)
      // so we always see the loaded form even when called from a selectFormForEditing continuation.
      let validUpdates = [];
      try {
        const liveCtx = getScreenContext() ?? ctx;
        const targetSections = liveCtx.currentState?.detailedForm?.sections || [];
        const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
        validUpdates = (updates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        console.log("[updateSectionSettings handler] updates:", updates, "targetSections count:", targetSections.length, "validUpdates:", validUpdates, "liveCtx.actions exists?", !!liveCtx.actions?.updateSectionSettings);
        if (validUpdates.length && liveCtx.actions?.updateSectionSettings) {
          await liveCtx.actions.updateSectionSettings({ updates: validUpdates });
          const skipped = (updates || []).length - validUpdates.length;
          cloneResults.push(`**Section settings:** applied ${validUpdates.length} update(s)${skipped ? ` (${skipped} skipped — invalid section ID)` : ""} ✓`);
        } else if ((updates || []).length && !validUpdates.length) {
          cloneResults.push(`**Section settings:** skipped — no updates matched valid sections in the current form ✗`);
        }
      } catch (err) { cloneResults.push(`**Section settings:** failed — ${err?.message || "unknown error"} ✗`); }

      // Underwriting rules — independent step
      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        try {
          if (targetFormId && ctx.actions.cloneRules) {
            const result = await ctx.actions.cloneRules({ sourceFormId: String(sourceFormId), targetFormId: String(targetFormId) });
            if (result.cloned > 0) {
              cloneResults.push(`**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`);
            } else if (result.skipped > 0) {
              cloneResults.push(`**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`);
            } else {
              cloneResults.push(`**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`);
            }
          }
        } catch (err) { cloneResults.push(`**Underwriting rules:** failed — ${err?.message || "unknown error"} ✗`); }
      }

      // Pass results to AI continuation so it can incorporate them into its final summary
      const resultSummary = cloneResults.length
        ? `Completed form-level settings. Results:\n${cloneResults.join("\n")}\n\nNow continue with field updates if any, then produce a final summary that incorporates these results verbatim. End with: "Say **save** to apply these changes to the live form, or **discard** to cancel."`
        : "Section settings applied to preview. Continue with field updates if any, then summarise what changed. End your response with: \"Say **save** to apply these changes to the live form, or **discard** to cancel.\"";
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      // Auto-inject form preview built locally from ctx (which has previous pending edits applied)
      // plus the new validUpdates — avoids a React render-timing race on hasPendingEdits.
      if (validUpdates.length > 0) {
        const nowCtx = getScreenContext();
        const baseForm = (nowCtx?.screenId === ctx.screenId ? nowCtx : ctx).currentState?.detailedForm;
        if (baseForm) {
          const previewSections = (baseForm.sections || []).map((s) => {
            const u = validUpdates.find((vu) => String(vu.sectionId) === String(s._id));
            return toPreviewSection(s, u ? { displayText: u.displayText ?? s.displayText ?? "", signDisplayText: u.signDisplayText ?? s.signDisplayText ?? "", isHidden: u.isHidden ?? s.isHidden ?? false } : {});
          });
          addMessage({ role: "assistant", content: "", formPreview: { formName: baseForm.name || baseForm.headerText, sections: previewSections } });
        }
      }
      return;
    }

    if (tool === "updateFieldSettings") {
      const { updates } = args;
      try {
        if (ctx.actions.updateFieldSettings) await ctx.actions.updateFieldSettings({ updates });
        await continueAfterToolCall(tool, args, "Field settings applied to preview. Summarise what changed, then end with: \"Say **save** to apply these changes to the live form, or **discard** to cancel.\"", currentHistory, chatEndpoint, ctx);
        if (updates?.length) {
          const nowCtx = getScreenContext();
          const baseForm = (nowCtx?.screenId === ctx.screenId ? nowCtx : ctx).currentState?.detailedForm;
          if (baseForm) {
            const previewSections = (baseForm.sections || []).map((s) => {
              const su = updates.find((u) => String(u.sectionId) === String(s._id));
              if (!su) return toPreviewSection(s);
              const mergedFields = (s.fields || []).map((f) => { const fu = (su.fields || []).find((ff) => String(ff.fieldId) === String(f._id)); return fu ? { ...f, ...fu } : f; });
              return toPreviewSection({ ...s, fields: mergedFields });
            });
            addMessage({ role: "assistant", content: "", formPreview: { formName: baseForm.name || baseForm.headerText, sections: previewSections } });
          }
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "reorderSections") {
      const { sectionOrder } = args;
      try {
        console.log("[reorderSections handler] sectionOrder:", sectionOrder, "action exists?", !!ctx.actions?.reorderSections);
        if (ctx.actions.reorderSections) ctx.actions.reorderSections({ sectionOrder });
        console.log("[reorderSections handler] after action call, will continueAfterToolCall");
        await continueAfterToolCall(tool, args, "Sections reordered in preview. Summarise what changed, then end with: \"Say **save** to apply these changes to the live form, or **discard** to cancel.\"", currentHistory, chatEndpoint, ctx);
        if (sectionOrder?.length) {
          const nowCtx = getScreenContext();
          const baseForm = (nowCtx?.screenId === ctx.screenId ? nowCtx : ctx).currentState?.detailedForm;
          if (baseForm) {
            const orderMap = {}; (sectionOrder || []).forEach((id, i) => { orderMap[String(id)] = i; });
            const previewSections = [...(baseForm.sections || [])]
              .sort((a, b) => (orderMap[String(a._id)] ?? 9999) - (orderMap[String(b._id)] ?? 9999))
              .map((s) => toPreviewSection(s));
            addMessage({ role: "assistant", content: "", formPreview: { formName: baseForm.name || baseForm.headerText, sections: previewSections } });
          }
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "deleteSection") {
      const { sectionId } = args;
      try {
        const liveCtx = getScreenContext() ?? ctx;
        if (liveCtx.actions?.deleteSection) liveCtx.actions.deleteSection({ sectionId });
        await continueAfterToolCall(tool, args, "Section marked for deletion in preview. Summarise what changed, then end with: \"Say **save** to apply these changes to the live form, or **discard** to cancel.\"", currentHistory, chatEndpoint, ctx);
        if (sectionId) {
          const nowCtx = getScreenContext();
          const baseForm = (nowCtx?.screenId === ctx.screenId ? nowCtx : ctx).currentState?.detailedForm;
          if (baseForm) {
            const previewSections = (baseForm.sections || [])
              .filter((s) => String(s._id) !== String(sectionId))
              .map((s) => toPreviewSection(s));
            addMessage({ role: "assistant", content: "", formPreview: { formName: baseForm.name || baseForm.headerText, sections: previewSections } });
          }
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "saveFormEdits") {
      const { explanation } = args;
      try {
        console.log("[saveFormEdits handler] ctx.actions.saveFormEdits exists?", !!ctx.actions?.saveFormEdits, "ctx.screenId:", ctx?.screenId);
        const result = ctx.actions.saveFormEdits ? await ctx.actions.saveFormEdits() : null;
        console.log("[saveFormEdits handler] result:", result);
        if (result?.saved === false) {
          addMessage({ role: "assistant", content: "There are no pending changes to save — your edits may have been lost. Please re-apply the changes and try again." });
        } else if (result === null) {
          addMessage({ role: "assistant", content: "Save could not run — the form editor context was not available. Please try again." });
        } else {
          addMessage({ role: "assistant", content: explanation || "All changes have been saved to the form." });
          if (isVoiceModeRef.current) speak(explanation || "All changes have been saved.");
        }
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `Save failed${detail ? `: ${detail}` : ""}. Some changes may not have been applied.` });
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

    if (tool === "addSection") {
      try {
        if (ctx.actions.addSection) await ctx.actions.addSection(args);
        await continueAfterToolCall(tool, args, "Section created successfully. The form has been reloaded with the new section.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "addField") {
      try {
        if (ctx.actions.addField) await ctx.actions.addField(args);
        await continueAfterToolCall(tool, args, "Field created successfully. The form has been reloaded with the new field.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "setFormsBranding") {
      const { explanation, updates: rawUpdates } = args;
      const updates = rawUpdates || [];
      // Snapshot old branding per affected form before overwriting
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldBrandingId: form?.branding?._id ?? null };
      });
      pushRevertable({
        description: `Applied branding to ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot.filter((s) => s.oldBrandingId !== null)
            .map((s) => ({ formId: s.formId, brandingId: s.oldBrandingId }));
          const skipped = snapshot.filter((s) => s.oldBrandingId === null).length;
          if (revertUpdates.length > 0 && freshCtx?.actions?.setFormsBranding) {
            await freshCtx.actions.setFormsBranding({ updates: revertUpdates });
          }
          if (skipped > 0) {
            addMessage({ role: "assistant", content: `Note: ${skipped} form(s) had no branding set before this change and cannot be automatically reverted to "no branding".` });
          }
        },
      });
      try {
        if (ctx.actions.setFormsBranding) await ctx.actions.setFormsBranding({ updates });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "setFormsLocation") {
      const { explanation, updates: rawUpdates } = args;
      const updates = rawUpdates || [];
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "cloneForm") {
      const { sourceFormId, newName } = args;
      try {
        if (ctx.actions.cloneForm) {
          const result = await ctx.actions.cloneForm({ sourceFormId, newName });
          const rulesCloned = result?.rulesCloned ?? 0;
          const rulesNote = rulesCloned > 0
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "attachEmailTemplate") {
      const { formId, templateIds } = args;
      try {
        if (ctx.actions.attachEmailTemplate) await ctx.actions.attachEmailTemplate({ formId, templateIds });
        await continueAfterToolCall(tool, args, "Email templates attached successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "attachTemplateToForms") {
      const { explanation, formIds, templateId } = args;
      try {
        if (ctx.actions.attachToForms) await ctx.actions.attachToForms({ formIds, templateId });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "openTemplate") {
      const { templateId, mode, explanation } = args;
      try {
        suppressNextScreenGreetingRef.current = true;
        if (ctx.actions.openTemplate) ctx.actions.openTemplate({ templateId, mode: mode || "view" });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        suppressNextScreenGreetingRef.current = false;
        const detail = err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "createTemplate") {
      const { explanation } = args;
      suppressNextScreenGreetingRef.current = true;
      if (ctx.actions.createTemplate) ctx.actions.createTemplate();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "deleteTemplate") {
      const { templateId, explanation } = args;
      try {
        suppressNextScreenGreetingRef.current = true;
        if (ctx.actions.deleteTemplate) await ctx.actions.deleteTemplate({ templateId });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        suppressNextScreenGreetingRef.current = false;
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "closeTemplate") {
      const { explanation } = args;
      suppressNextScreenGreetingRef.current = true;
      if (ctx.actions.closeTemplate) ctx.actions.closeTemplate();
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "switchTemplate") {
      const { templateId, mode, explanation } = args;
      try {
        suppressNextScreenGreetingRef.current = true;
        pendingFollowUpRef.current = { content: "The template has been switched. Based on the conversation history, if the user asked you to apply specific changes to this template, apply them now. Otherwise just wait for their next instruction.", silent: true };
        if (ctx.actions.switchTemplate) ctx.actions.switchTemplate({ templateId, mode: mode || "view" });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        suppressNextScreenGreetingRef.current = false;
        pendingFollowUpRef.current = null;
        const detail = err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
      }
      return;
    }

    if (tool === "saveAndOpenTemplate") {
      const { templateId, mode, explanation } = args;
      try {
        suppressNextScreenGreetingRef.current = true;
        pendingFollowUpRef.current = { content: "The template has been saved and switched. Based on the conversation history, if the user asked you to apply specific changes to this new template, apply them now. Otherwise just wait for their next instruction.", silent: true };
        if (ctx.actions.saveAndOpenTemplate) await ctx.actions.saveAndOpenTemplate({ templateId, mode: mode || "view" });
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      } catch (err) {
        suppressNextScreenGreetingRef.current = false;
        pendingFollowUpRef.current = null;
        const detail = err?.data?.message || err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
        setTimeout(() => { if (sendMessageRef.current) sendMessageRef.current(csvMessage); }, 100);
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
                `Here is the CSV I selected as a starting point:\n\n**File:** ${file.name}\n\`\`\`\n${text}\n\`\`\``
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

    if (tool === "navigateToPage") {
      const { page, reason, followUpTask } = args;
      const route = PAGE_ROUTES[page];
      const label = PAGE_LABELS[page] || page;
      if (!route) return;

      addMessage({
        role: "assistant",
        content: `Navigating you to **${label}**. ${reason}`,
      });

      // Store follow-up so the screen-change effect can auto-send it
      pendingFollowUpRef.current = followUpTask;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      // Safety: clear the follow-up after 15 s if the destination page never loads
      navTimeoutRef.current = setTimeout(() => { pendingFollowUpRef.current = null; }, 15000);

      setTimeout(() => navigate(route), 300);
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
      if (fieldMeta?.type === "tel" || fieldMeta?.type === "phone" ||
          /phone|mobile|cell/i.test(fieldId) || /phone|mobile|cell/i.test(fieldMeta?.label || "")) {
        if (value) {
          // Strip everything except digits and a leading +
          let digits = value.replace(/[^\d+]/g, "");
          // If no country code present, infer from already-filled address fields
          if (!digits.startsWith("+") && !digits.startsWith("00")) {
            const fields = ctx.currentState?.fields || [];
            const countryField = fields.find((f) => /country/i.test(f.label) || /country/i.test(f.id));
            const stateField  = fields.find((f) => /\bstate\b/i.test(f.label)  || /\bstate\b/i.test(f.id));
            const countryVal  = (countryField?.value || "").toLowerCase();
            const stateVal    = (stateField?.value  || "").toLowerCase();
            const isUS = /^(us|usa|united states)$/.test(countryVal) ||
              /^(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)$/.test(stateVal);
            digits = (isUS || (!countryVal && !stateVal) ? "+1" : "+") + digits;
          } else if (digits.startsWith("00")) {
            digits = "+" + digits.slice(2);
          }
          value = digits;
        }
      }
      console.log(`%c[TOOL:fillField] about to fill — fieldId="${fieldId}" value="${value}" (raw args.value="${args.value}")`, "color:#e05; font-weight:bold");
      try {
        if (ctx.actions.fillField) {
          // Dodge panel so user can see the field being filled
          const fillEl =
            document.getElementById(fieldId) ||
            document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
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
              fields: ctx.currentState?.fields?.map((f) =>
                f.id === fieldId ? { ...f, value, filled: true } : f
              ) ?? [],
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
          await continueAfterToolCall(
            tool, args,
            fillResultMsg,
            currentHistory, chatEndpoint, patchedCtx
          );
        }
      } catch (err) {
        const detail = err?.message || "";
        addMessage({ role: "assistant", content: `${wt("errorCouldnt")}${detail ? `: ${detail}` : ""}. ${wt("tryAgain")}` });
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
            fields: ctx.currentState?.fields?.map((f) =>
              f.isSignature || f.id === fieldId ? { ...f, value: "signed", filled: true } : f
            ) ?? [],
          },
        };
        await continueAfterToolCall(
          tool, args,
          sigResultMsg,
          currentHistory, chatEndpoint, patchedCtx
        );
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
        const optionsList = Array.isArray(fieldMeta.options) && fieldMeta.options.length
          ? fieldMeta.options.map((o, i) => `${String.fromCharCode(97 + i)}) ${o.label} [value: ${o.value}]`).join(", ")
          : "(no options available)";
        await continueAfterToolCall(
          tool, args,
          `ERROR: openFieldPanel cannot be used for "${fieldLabel}" because it is a ${fieldMeta.type} field. ` +
          `You MUST output a chat message listing options instead and wait for the applicant's choice, then call fillField. ` +
          `Field options: ${optionsList}. Do NOT call openFieldPanel again for this field.`,
          currentHistory, chatEndpoint, ctx
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
      const { fieldId, explanation } = args;
      // Scroll into view
      if (ctx.actions?.scrollToField) {
        ctx.actions.scrollToField({ fieldId });
      } else {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Focus the field after the scroll settles so the applicant can start typing immediately.
      setTimeout(() => {
        const el =
          document.getElementById(fieldId) ||
          document.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
          document.querySelector(`[data-ai-id="${CSS.escape(fieldId)}"]`);
        if (!el || el.getAttribute("data-ai-type") === "sign" || el.type === "hidden") return;
        if (el.type === "radio") {
          // Focus first radio in the group
          const first = document.querySelector(`input[type="radio"][name="${CSS.escape(el.getAttribute("name") || "")}"]`);
          if (first) first.focus();
        } else {
          el.focus();
        }
      }, 400);
      // Show explanation if provided (missing-field walkthrough)
      if (explanation) {
        addMessage({ role: "assistant", content: explanation });
        if (isVoiceModeRef.current) speak(explanation);
      }
      return;
    }

    if (tool === "activateField") {
      const { fieldId, explanation } = args;
      const el =
        document.getElementById(fieldId) ||
        document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
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
            document.getElementById(fieldId) ||
            document.querySelector(`[name="${CSS.escape(fieldId)}"]`) ||
            el;
          if (!target) { suppressChatFocusRef.current = false; return; }
          target.scrollIntoView({ behavior: "instant", block: "center" });

          // Only move focus if the user hasn't already navigated to a different form field.
          // If they clicked/tabbed somewhere else while waiting for the AI response, respect that.
          // Also skip if the user is already on this exact field (don't disrupt mid-typing with select()).
          const active = document.activeElement;
          const alreadyOnTarget = active === target;
          const userMovedElsewhere =
            !alreadyOnTarget && active && active !== inputRef.current &&
            ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName);
          if (!alreadyOnTarget && !userMovedElsewhere) {
            target.focus();
            try { target.select(); } catch { /* ignore */ }
          }

          dodgeForField(target);
          // Release the chat-focus suppression shortly after so normal state can resume.
          setTimeout(() => { suppressChatFocusRef.current = false; }, 400);
        }, 400);
      }
      addMessage({ role: "assistant", content: explanation });
      if (isVoiceModeRef.current) speak(explanation);
      return;
    }

    if (tool === "submitOtpCode") {
      const { otp, email } = args;
      console.log("%c[AI:submitOtpCode] tool fired — email=%s otp=%s screenId=%s", "color:#ea580c; font-weight:bold", email, otp, ctx?.screenId);
      console.log("%c[AI:submitOtpCode] context fields=%o  actions=%o", "color:#ea580c",
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
        console.error("%c[AI:submitOtpCode] ✗ verification failed — detail=%s", "color:#dc2626; font-weight:bold", detail);
      }
      console.log("%c[AI:submitOtpCode] resultSummary → %s", "color:#ea580c", resultSummary);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      return;
    }

    if (tool === "submitEmailForOtp") {
      const { email } = args;
      console.log("%c[AI:submitEmailForOtp] tool fired — email=%s screenId=%s", "color:#ea580c; font-weight:bold", email, ctx?.screenId);
      console.log("%c[AI:submitEmailForOtp] context fields=%o  actions=%o", "color:#ea580c",
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
      // effect handles the transition — nothing more needed here.
      if (!freshCtx || freshCtx.screenId !== ctx.screenId) return;
      // Build a compact confirmed-values block so the AI can do Step 1 matching on the
      // next page without relying on scanning conversation history.
      const confirmedEntries = Object.entries(confirmedValuesRef.current);
      const confirmedBlock = confirmedEntries.length > 0
        ? ` [CONFIRMED THIS SESSION: ${confirmedEntries.map(([k, v]) => `${k}="${v}"`).join(", ")}]`
        : "";
      await continueAfterToolCall(
        tool, args,
        `Moved to the next step successfully.${confirmedBlock}`,
        currentHistory, chatEndpoint, freshCtx
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
        tool, args,
        "Moved to the previous step successfully.",
        currentHistory, chatEndpoint, freshCtx
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
        addMessage({ role: "assistant", content: `Couldn't create the test case${detail ? `: ${detail}` : ""}. Please try again.` });
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
        addMessage({ role: "assistant", content: `Couldn't update the test case${detail ? `: ${detail}` : ""}. Please try again.` });
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
        addMessage({ role: "assistant", content: `Couldn't delete the test case(s)${detail ? `: ${detail}` : ""}. Please try again.` });
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
        addMessage({ role: "assistant", content: `Couldn't duplicate the test case${detail ? `: ${detail}` : ""}. Please try again.` });
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
        addMessage({ role: "assistant", content: `Couldn't seed from static files${detail ? `: ${detail}` : ""}. Please try again.` });
      }
      return;
    }

    // ── Demo Builder tools ─────────────────────────────────────────────────────

    if (tool === "updateBuilderSteps") {
      const { message, ...stepsData } = args;
      if (ctx.actions.updateBuilderSteps) ctx.actions.updateBuilderSteps(stepsData);
      addMessage({ role: "assistant", content: null, function_call: { name: "updateBuilderSteps", arguments: JSON.stringify(args) } });
      addMessage({ role: "function", name: "updateBuilderSteps", content: `Steps replaced. New step count: ${stepsData.steps?.length ?? 0}.` });
      addMessage({ role: "assistant", content: message });
      if (isVoiceModeRef.current) speak(message);
      return;
    }

    if (tool === "addStepToBuilder") {
      const { message, ...stepData } = args;
      if (ctx.actions.addStepToBuilder) ctx.actions.addStepToBuilder(stepData);
      const stepDesc = `${stepData.step?.action || ""}${stepData.step?.selector ? ` ${stepData.step.selector}` : ""}${stepData.step?.value ? ` "${stepData.step.value}"` : ""}`;
      addMessage({ role: "assistant", content: null, function_call: { name: "addStepToBuilder", arguments: JSON.stringify(args) } });
      addMessage({ role: "function", name: "addStepToBuilder", content: `Step confirmed and added: ${stepDesc}. Do NOT add this step again.` });
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
        addMessage({ role: "assistant", content: `Couldn't save the demo action${detail ? `: ${detail}` : ""}. Please try again.` });
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

    if (tool === "downloadDocument") {
      const { explanation } = args;
      addMessage({ role: "assistant", content: explanation || "Creating your download…" });
      if (isVoiceModeRef.current) speak(explanation || "Creating your download.");
      if (ctx.actions.downloadDocument) await ctx.actions.downloadDocument();
      addMessage({
        role: "assistant",
        content:
          "Your copy of this agreement has been downloaded. " +
          "If you'd like a combined download that also includes the information you entered on this page, " +
          "use the **Download** button on the form below.",
      });
      return;
    }
  };

  return applyToolCall;
}
