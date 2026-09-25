import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";

// tools passing args straight through
const PASS_THROUGH_TOOLS = [
  AI_TOOLS.CREATE_STRATEGY,
  AI_TOOLS.LINK_STRATEGY_TO_FORM,
  AI_TOOLS.MOVE_FORM_TO_STRATEGY,
  AI_TOOLS.CREATE_STRATEGY_AND_MOVE_FORM,
  AI_TOOLS.UPDATE_STRATEGY,
  AI_TOOLS.DELETE_STRATEGIES,
  AI_TOOLS.DELETE_LOOKUPS,
  AI_TOOLS.CREATE_DEFAULT_LOOKUPS,
  AI_TOOLS.UPDATE_EXTRACTION_PROMPT,
  AI_TOOLS.CREATE_USER,
  AI_TOOLS.UPDATE_USER,
  AI_TOOLS.SEND_PASSWORD_RESET_LINKS,
  AI_TOOLS.DELETE_USER,
  AI_TOOLS.DELETE_USERS,
  AI_TOOLS.CREATE_ROLE,
  AI_TOOLS.DELETE_ROLE,
];

const createAdminTools = ({ bindings, helpers }) => {
  const { continueAfterToolCall, pushRevertable } = bindings;
  const { say, reportActionError, runActionAndSay } = helpers;

  const passThrough = (tool) => async (args, { ctx }) => {
    const { explanation, ...actionArgs } = args;
    await runActionAndSay(ctx, tool, actionArgs, explanation);
  };

  // save lookup then continue chat
  const saveLookup = (resultSummary) => async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
    const { explanation: _explanation, ...lookupData } = args;
    try {
      if (ctx.actions[tool]) await ctx.actions[tool](lookupData);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
    } catch (err) {
      reportActionError(err);
    }
  };

  return {
    ...Object.fromEntries(PASS_THROUGH_TOOLS.map((tool) => [tool, passThrough(tool)])),

    [AI_TOOLS.UPDATE_ROLE]: async (args, { ctx }) => {
      const { explanation, ...roleArgs } = args;
      // snapshot old role for revert
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
      const lookups = ctx.currentState?.lookups || [];
      const revertUpdates = updates.map(({ searchObjectKey }) => ({
        searchObjectKey,
        isActive: lookups.find((l) => l.searchObjectKey === searchObjectKey)?.isActive ?? false,
      }));
      try {
        await ctx.actions[AI_TOOLS.SET_LOOKUP_ACTIVE]({ updates });
      } catch (err) {
        return reportActionError(err);
      }
      pushRevertable({
        description: `Changed active status on ${updates.length} lookup(s)`,
        revertFn: async (freshCtx) => {
          await freshCtx?.actions?.[AI_TOOLS.SET_LOOKUP_ACTIVE]?.({ updates: revertUpdates });
        },
      });
      say(explanation);
    },

    [AI_TOOLS.DRAFT_NEW_LOOKUP]: async (args, { ctx }) => {
      const { explanation, ...draftData } = args;
      ctx.actions[AI_TOOLS.DRAFT_NEW_LOOKUP]?.(draftData);
      say(`I've drafted a new lookup and opened it in the editor for your review.\n\n${explanation}`);
    },

    [AI_TOOLS.CREATE_LOOKUP]: saveLookup("Lookup created successfully."),
    [AI_TOOLS.UPDATE_LOOKUP]: saveLookup("Lookup updated successfully."),
  };
};

export default createAdminTools;
