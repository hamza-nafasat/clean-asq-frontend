import {
  AI_ENDPOINTS,
  AI_RESPONSE_TYPES,
  BRANDING_PAGE_KEYS,
  CHAT_ROLES,
  PAGE_ROUTES,
} from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { STORAGE_KEYS, URL_PREFIXES } from "@/constants";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { getErrorDetail, postJson } from "@/components/shared/aiChat/logic/toolHelpers.js";
import { toHttpsUrl } from "@/utils/websiteUrl";

const getDomainBase = (url) => {
  const { hostname } = new URL(toHttpsUrl(url));
  const host = hostname.startsWith(URL_PREFIXES.WWW) ? hostname.slice(URL_PREFIXES.WWW.length) : hostname;
  return host.split(".")[0];
};

const nameFromDomain = (url) => {
  try {
    const base = getDomainBase(url);
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "";
  }
};

const displayNameFromDomain = (url) => {
  try {
    return getDomainBase(url);
  } catch {
    return url;
  }
};

// pasted content summary for ai
const buildPastedContentSummary = ({ colors, cssVars, logoUrls, colorCount }) => {
  const cssVarCount = Object.keys(cssVars).length;
  const parts = [
    colorCount > 0 ? `${colorCount} hex colors` : null,
    cssVarCount > 0 ? `${cssVarCount} CSS variables` : null,
    logoUrls.length > 0 ? `${logoUrls.length} image URLs` : null,
  ].filter(Boolean);

  const summary = parts.length
    ? `Extracted from pasted content: ${parts.join(", ")}.`
    : "No recognizable colors or URLs found in the pasted content.";

  return [
    summary,
    colors.length ? `Colors: ${colors.join(", ")}` : null,
    cssVarCount ? `CSS variables: ${JSON.stringify(cssVars)}` : null,
    logoUrls.length ? `Image URLs: ${logoUrls.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
};

const createBrandingTools = ({ bindings, helpers, getApplyToolCall }) => {
  const { wt, navigate, continueAfterToolCall, pushRevertable } = bindings;
  const { suppressNextScreenGreetingRef } = bindings;
  const { say, reportCouldnt, runActionAndSay } = helpers;

  return {
    [AI_TOOLS.FETCH_WEBSITE_BRANDING]: async (args, { ctx }) => {
      const { url, companyName: aiProvidedName } = args;
      if (!ctx.actions.fetchWebsiteBranding) {
        reportCouldnt("website extraction is only available on the branding pages");
        return;
      }
      say(`Fetching **${url}**… this may take a moment.`);

      // fetch branding data
      let brandingData, screenshotUrl;
      try {
        ({ brandingData, screenshotUrl } = await ctx.actions.fetchWebsiteBranding({ url }));
      } catch {
        say(`${wt("fetchFailed")} **${url}**. ${wt("tryAgain")}`);
        return;
      }

      // no editor: create page applies it
      if (!ctx.actions.applyExtractedBranding) {
        sessionStorage.setItem(
          STORAGE_KEYS.PENDING_BRANDING_DATA,
          JSON.stringify({ brandingData, screenshotUrl, url }),
        );
        suppressNextScreenGreetingRef.current = true;
        say(`Branding extracted from **${brandingData?.name || url}**. Opening **Create Branding** with it applied.`);
        navigate(PAGE_ROUTES[BRANDING_PAGE_KEYS.CREATE]);
        return;
      }
      ctx.actions.applyExtractedBranding(brandingData);
      if (screenshotUrl && ctx.actions.setWebsiteImage) ctx.actions.setWebsiteImage(screenshotUrl);

      // pick the company name
      if (ctx.actions.companyName) {
        const existingName = ctx.currentState?.companyName;
        if (aiProvidedName) {
          ctx.actions.companyName(aiProvidedName);
        } else if (!existingName) {
          const nameToUse = brandingData?.name || nameFromDomain(url);
          if (nameToUse) ctx.actions.companyName(nameToUse);
        }
      }

      if (!ctx.currentState?.websiteUrl && ctx.actions.websiteUrl) ctx.actions.websiteUrl(url);

      // fixed reply keeps extracted values
      const displayName = brandingData?.name || displayNameFromDomain(url);
      say(
        `Branding extracted from **${displayName}** and applied. You can review the colors and logos above, or ask me to make any adjustments.`,
      );
    },

    [AI_TOOLS.OPEN_MANUAL_EXTRACTION_FLOW]: async (args, { ctx }) => {
      const { url, explanation } = args;
      await say(explanation);
      const action = ctx?.actions?.openManualExtractionFlow;
      if (action) {
        action({ url });
      } else {
        say("Open the Extract Branding modal and switch to the Manual Extract tab to continue.");
      }
    },

    [AI_TOOLS.EXTRACT_BRANDING_FROM_PASTED_CONTENT]: async (args, { ctx, chatEndpoint, currentHistory }) => {
      const { content, explanation } = args;
      await say(explanation);
      try {
        const data = await postJson(AI_ENDPOINTS.EXTRACT_BRANDING_FROM_CONTENT, { content });
        if (!data.success) throw new Error("Failed to parse content");

        const followUpHistory = [
          ...currentHistory,
          { role: CHAT_ROLES.USER, content: buildPastedContentSummary(data.data) },
        ];
        const aiResponse = await postJson(chatEndpoint, {
          messages: followUpHistory,
          context: {
            screenId: ctx?.screenId,
            screenName: ctx?.screenName,
            description: ctx?.description,
            currentState: ctx?.currentState,
            logos: ctx?.logos,
            colorPalette: ctx?.colorPalette || undefined,
          },
        });
        if (!aiResponse.success) throw new Error(aiResponse.message || "AI request failed");
        const aiData = aiResponse.data;

        if (aiData.type === AI_RESPONSE_TYPES.TOOL_CALL) {
          await getApplyToolCall()(aiData.tool, aiData.args, followUpHistory);
        } else {
          say(aiData.content);
        }
      } catch {
        say("I couldn't parse the pasted content. Try pasting just the hex color codes or CSS variables directly.");
      }
    },

    [AI_TOOLS.APPLY_BRANDING_CHANGES]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { changes, explanation } = args;
      // snapshot current values before overwriting
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
      await say(explanation, { toolCall: { tool, changes } });
      // continue for chained tool calls only
      await continueAfterToolCall(
        tool,
        args,
        "Branding changes applied to the screen.",
        currentHistory,
        chatEndpoint,
        ctx,
        true,
      );
    },

    [AI_TOOLS.SUGGEST_COLORS]: async (args, { ctx }) => {
      const { colors, explanation } = args;
      if (ctx.actions.setSuggestedColors) ctx.actions.setSuggestedColors(colors);
      say(explanation, { toolCall: { tool: AI_TOOLS.SUGGEST_COLORS, colors } });
    },

    [AI_TOOLS.SAVE_BRANDING]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      try {
        if (ctx.actions.saveBranding) await ctx.actions.saveBranding();
        await say(args.explanation);
        // continue for chained tool calls only
        await continueAfterToolCall(tool, args, "Branding saved successfully.", currentHistory, chatEndpoint, ctx, true);
      } catch (err) {
        reportCouldnt(getErrorDetail(err));
      }
    },

    [AI_TOOLS.APPLY_BRANDING_TO_FORMS]: async (args, { ctx }) => {
      const { formIds, onHome, brandingId, explanation } = args;
      const targets = { formIds: formIds || [], onHome: !!onHome };
      try {
        if (ctx.actions.saveAndApplyBrandingToForms) {
          await ctx.actions.saveAndApplyBrandingToForms(targets);
        } else if (ctx.actions.applyBrandingToForms && brandingId) {
          await ctx.actions.applyBrandingToForms({ ...targets, brandingId });
        } else {
          throw new Error("applyBrandingToForms action not available on this screen");
        }
        say(explanation);
      } catch (err) {
        reportCouldnt(getErrorDetail(err));
      }
    },

    [AI_TOOLS.DELETE_BRANDINGS]: async (args, { ctx }) =>
      runActionAndSay(ctx, AI_TOOLS.DELETE_BRANDINGS, { brandingIds: args.brandingIds }, args.explanation),

    [AI_TOOLS.OPEN_EDIT_BRANDING]: async (args, { ctx }) => {
      if (ctx.actions.openEditBranding) ctx.actions.openEditBranding({ brandingId: args.brandingId });
      say(args.explanation);
    },

    [AI_TOOLS.OPEN_CREATE_BRANDING]: async (args, { ctx }) => {
      if (ctx.actions.openCreateBranding) ctx.actions.openCreateBranding();
      say(args.explanation);
    },
  };
};

export default createBrandingTools;
