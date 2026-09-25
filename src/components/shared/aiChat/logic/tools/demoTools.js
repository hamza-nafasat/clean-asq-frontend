import { CHAT_ROLES } from "@/components/shared/aiChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";

const createDemoTools = ({ bindings, helpers }) => {
  const { addMessage } = bindings;
  const { say } = helpers;

  // awaited screen action with a tool-specific failure message
  const runOrReport = async (run, explanation, failureText) => {
    try {
      await run();
      await say(explanation);
    } catch (err) {
      const detail = err?.message || "";
      await say(`${failureText}${detail ? `: ${detail}` : ""}. Please try again.`);
    }
  };

  // record the builder call in the transcript, then show the reply
  const recordBuilderCall = (toolName, args, resultText, message) => {
    addMessage({
      role: CHAT_ROLES.ASSISTANT,
      content: null,
      function_call: { name: toolName, arguments: JSON.stringify(args) },
    });
    addMessage({ role: CHAT_ROLES.FUNCTION, name: toolName, content: resultText });
    say(message);
  };

  return {
    [AI_TOOLS.UPDATE_BUILDER_STEPS]: async (args, { ctx }) => {
      const { message, ...stepsData } = args;
      if (ctx.actions.updateBuilderSteps) ctx.actions.updateBuilderSteps(stepsData);
      recordBuilderCall(
        AI_TOOLS.UPDATE_BUILDER_STEPS,
        args,
        `Steps replaced. New step count: ${stepsData.steps?.length ?? 0}.`,
        message,
      );
    },

    [AI_TOOLS.ADD_STEP_TO_BUILDER]: async (args, { ctx }) => {
      const { message, ...stepData } = args;
      if (ctx.actions.addStepToBuilder) ctx.actions.addStepToBuilder(stepData);
      const stepDesc = `${stepData.step?.action || ""}${stepData.step?.selector ? ` ${stepData.step.selector}` : ""}${stepData.step?.value ? ` "${stepData.step.value}"` : ""}`;
      recordBuilderCall(
        AI_TOOLS.ADD_STEP_TO_BUILDER,
        args,
        `Step confirmed and added: ${stepDesc}. Do NOT add this step again.`,
        message,
      );
    },

    [AI_TOOLS.BUILD_DEMO_ACTION]: async (args, { ctx }) => {
      const { explanation, ...actionData } = args;
      if (ctx.actions.buildDemoAction) ctx.actions.buildDemoAction(actionData);
      say(explanation);
    },

    [AI_TOOLS.SAVE_DEMO_ACTION]: async (args, { ctx }) => {
      const { explanation, ...saveData } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.saveDemoAction) await ctx.actions.saveDemoAction(saveData);
        },
        explanation,
        "Couldn't save the demo action",
      );
    },

    [AI_TOOLS.SELECT_FEATURES]: async (args, { ctx }) => {
      const { explanation, ...selectData } = args;
      if (ctx.actions.selectFeatures) ctx.actions.selectFeatures(selectData);
      say(explanation);
    },

    [AI_TOOLS.SET_NARRATION_INSTRUCTIONS]: async (args, { ctx }) => {
      const { explanation, ...instrData } = args;
      if (ctx.actions.setNarrationInstructions) ctx.actions.setNarrationInstructions(instrData);
      say(explanation);
    },
  };
};

export default createDemoTools;
