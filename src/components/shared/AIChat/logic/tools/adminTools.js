import { AI_TOOLS } from "@/components/shared/AIChat/constants/aiToolNames.js";
import { CHAT_ROLES } from "@/components/shared/AIChat/constants/aiChatConstants.js";
import { getErrorDetail } from "@/components/shared/AIChat/logic/toolHelpers.js";

// tools whose screen action has the same name and takes the remaining args
const PASS_THROUGH_TOOLS = [
  AI_TOOLS.CREATE_STRATEGY,
  AI_TOOLS.LINK_STRATEGY_TO_FORM,
  AI_TOOLS.MOVE_FORM_TO_STRATEGY,
  AI_TOOLS.CREATE_STRATEGY_AND_MOVE_FORM,
  AI_TOOLS.CREATE_USER,
  AI_TOOLS.UPDATE_USER,
  AI_TOOLS.SEND_PASSWORD_RESET_LINKS,
  AI_TOOLS.DELETE_USER,
  AI_TOOLS.DELETE_USERS,
  AI_TOOLS.CREATE_ROLE,
  AI_TOOLS.DELETE_ROLE,
];

const createAdminTools = ({ bindings, helpers }) => {
  const { addMessage, continueAfterToolCall, pushRevertable } = bindings;
  const { say, reportCouldnt, runActionAndSay } = helpers;

  const passThrough = (tool) => async (args, { ctx }) => {
    const { explanation, ...actionArgs } = args;
    await runActionAndSay(ctx, tool, actionArgs, explanation);
  };

  // save a lookup, then let the AI continue
  const saveLookup = (resultSummary) => async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
    const { explanation: _explanation, ...lookupData } = args;
    try {
      if (ctx.actions[tool]) await ctx.actions[tool](lookupData);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
    } catch (err) {
      reportCouldnt(getErrorDetail(err));
    }
  };

  return {
    ...Object.fromEntries(PASS_THROUGH_TOOLS.map((tool) => [tool, passThrough(tool)])),

    [AI_TOOLS.UPDATE_ROLE]: async (args, { ctx }) => {
      const { explanation, ...roleArgs } = args;
      // snapshot the old role so it can be reverted
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
      await runActionAndSay(ctx, AI_TOOLS.UPDATE_ROLE, roleArgs, explanation);
    },

    [AI_TOOLS.SET_LOOKUP_ACTIVE]: async (args, { ctx }) => {
      const { updates, explanation } = args;
      // snapshot each lookup's active flag
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
      say(explanation);
    },

    [AI_TOOLS.DRAFT_NEW_LOOKUP]: async (args, { ctx }) => {
      const { explanation, ...draftData } = args;
      if (ctx.actions.openCreateModal) ctx.actions.openCreateModal(draftData);
      addMessage({
        role: CHAT_ROLES.ASSISTANT,
        content: `I've drafted a new lookup and opened it in the editor for your review.\n\n${explanation}`,
      });
      if (bindings.isVoiceModeRef.current) bindings.speak(explanation);
    },

    [AI_TOOLS.CREATE_LOOKUP]: saveLookup("Lookup created successfully."),
    [AI_TOOLS.UPDATE_LOOKUP]: saveLookup("Lookup updated successfully."),
  };
};

export default createAdminTools;
