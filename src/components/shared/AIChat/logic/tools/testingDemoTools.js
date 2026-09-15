import { CHAT_ROLES } from "@/components/shared/AIChat/constants/aiChatConstants.js";
import { AI_TOOLS } from "@/components/shared/AIChat/constants/aiToolNames.js";

const createTestingDemoTools = ({ bindings, helpers }) => {
  const { addMessage, isVoiceModeRef, speak } = bindings;
  const { say } = helpers;

  // awaited screen action with a tool-specific failure message
  const runOrReport = async (run, explanation, failureText) => {
    try {
      await run();
      say(explanation);
    } catch (err) {
      const detail = err?.message || "";
      addMessage({ role: CHAT_ROLES.ASSISTANT, content: `${failureText}${detail ? `: ${detail}` : ""}. Please try again.` });
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
    addMessage({ role: CHAT_ROLES.ASSISTANT, content: message });
    if (isVoiceModeRef.current) speak(message);
  };

  return {
    // testing assistant
    [AI_TOOLS.CREATE_TEST_CASE]: async (args, { ctx }) => {
      const { explanation, ...fields } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.createTestCase) await ctx.actions.createTestCase({ explanation, ...fields });
        },
        explanation,
        "Couldn't create the test case",
      );
    },

    [AI_TOOLS.UPDATE_TEST_CASE]: async (args, { ctx }) => {
      const { explanation, ...fields } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.updateTestCase) await ctx.actions.updateTestCase({ explanation, ...fields });
        },
        explanation,
        "Couldn't update the test case",
      );
    },

    [AI_TOOLS.DELETE_TEST_CASES]: async (args, { ctx }) => {
      const { testCaseIds, explanation } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.deleteTestCases) await ctx.actions.deleteTestCases({ testCaseIds, explanation });
        },
        explanation,
        "Couldn't delete the test case(s)",
      );
    },

    [AI_TOOLS.DUPLICATE_TEST_CASE]: async (args, { ctx }) => {
      const { explanation, testCaseId, newName } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.duplicateTestCase) await ctx.actions.duplicateTestCase({ testCaseId, newName, explanation });
        },
        explanation,
        "Couldn't duplicate the test case",
      );
    },

    [AI_TOOLS.OPEN_EDITOR]: async (args, { ctx }) => {
      const { testCaseId, explanation } = args;
      if (ctx.actions.openEditor) ctx.actions.openEditor({ testCaseId, explanation });
      say(explanation);
    },

    [AI_TOOLS.SET_FILTER_AREA]: async (args, { ctx }) => {
      const { area, explanation } = args;
      if (ctx.actions.setFilterArea) ctx.actions.setFilterArea({ area, explanation });
      say(explanation);
    },

    [AI_TOOLS.SEED_FROM_STATIC]: async (args, { ctx }) => {
      const { explanation } = args;
      await runOrReport(
        async () => {
          if (ctx.actions.seedFromStatic) await ctx.actions.seedFromStatic({ explanation });
        },
        explanation,
        "Couldn't seed from static files",
      );
    },

    // demo builder
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

export default createTestingDemoTools;
