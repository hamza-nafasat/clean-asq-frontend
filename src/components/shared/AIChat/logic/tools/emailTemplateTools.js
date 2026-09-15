import { AI_TOOLS } from "@/components/shared/AIChat/constants/aiToolNames.js";
import { getErrorDetail } from "@/components/shared/AIChat/logic/toolHelpers.js";

const TEMPLATE_VIEW_MODE = "view";

const createEmailTemplateTools = ({ bindings, helpers }) => {
  const { continueAfterToolCall, suppressNextScreenGreetingRef, pendingFollowUpRef } = bindings;
  const { say, reportCouldnt, runActionAndSay } = helpers;

  // template screens announce their own transition
  const runTemplateNavigation = async ({ run, explanation, followUp, errorDetail }) => {
    try {
      suppressNextScreenGreetingRef.current = true;
      if (followUp) pendingFollowUpRef.current = { content: followUp, silent: true };
      await run();
      say(explanation);
    } catch (err) {
      suppressNextScreenGreetingRef.current = false;
      if (followUp) pendingFollowUpRef.current = null;
      reportCouldnt(errorDetail(err));
    }
  };

  const plainDetail = (err) => err?.message || "";

  return {
    [AI_TOOLS.UPDATE_EMAIL_TEMPLATE]: async (args, { ctx }) => {
      const { subject, body, templateName, emailType, explanation } = args;
      // edit mode makes the changes visible and saveable
      if (ctx.actions.enableEdit) ctx.actions.enableEdit();
      if (subject !== undefined && ctx.actions.subject) ctx.actions.subject(subject);
      if (body !== undefined && ctx.actions.body) ctx.actions.body(body);
      if (templateName !== undefined && ctx.actions.templateName) ctx.actions.templateName(templateName);
      if (emailType !== undefined && ctx.actions.emailType) ctx.actions.emailType(emailType);
      say(explanation);
    },

    [AI_TOOLS.SAVE_EMAIL_TEMPLATE]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      try {
        if (ctx.actions.saveEmailTemplate) await ctx.actions.saveEmailTemplate();
        await continueAfterToolCall(tool, args, "Email template saved successfully.", currentHistory, chatEndpoint, ctx);
      } catch (err) {
        reportCouldnt(getErrorDetail(err));
      }
    },

    [AI_TOOLS.SAVE_AND_ATTACH_TO_FORMS]: async (args, { ctx }) =>
      runActionAndSay(ctx, AI_TOOLS.SAVE_AND_ATTACH_TO_FORMS, { formIds: args.formIds }, args.explanation),

    [AI_TOOLS.ATTACH_TEMPLATE_TO_FORMS]: async (args, { ctx }) =>
      runActionAndSay(ctx, "attachToForms", { formIds: args.formIds, templateId: args.templateId }, args.explanation),

    [AI_TOOLS.OPEN_TEMPLATE]: async (args, { ctx }) =>
      runTemplateNavigation({
        run: () => {
          if (ctx.actions.openTemplate)
            ctx.actions.openTemplate({ templateId: args.templateId, mode: args.mode || TEMPLATE_VIEW_MODE });
        },
        explanation: args.explanation,
        errorDetail: plainDetail,
      }),

    [AI_TOOLS.CREATE_TEMPLATE]: async (args, { ctx }) => {
      suppressNextScreenGreetingRef.current = true;
      if (ctx.actions.createTemplate) ctx.actions.createTemplate();
      say(args.explanation);
    },

    [AI_TOOLS.DELETE_TEMPLATE]: async (args, { ctx }) =>
      runTemplateNavigation({
        run: async () => {
          if (ctx.actions.deleteTemplate) await ctx.actions.deleteTemplate({ templateId: args.templateId });
        },
        explanation: args.explanation,
        errorDetail: getErrorDetail,
      }),

    [AI_TOOLS.CLOSE_TEMPLATE]: async (args, { ctx }) => {
      suppressNextScreenGreetingRef.current = true;
      if (ctx.actions.closeTemplate) ctx.actions.closeTemplate();
      say(args.explanation);
    },

    [AI_TOOLS.SWITCH_TEMPLATE]: async (args, { ctx }) =>
      runTemplateNavigation({
        run: () => {
          if (ctx.actions.switchTemplate)
            ctx.actions.switchTemplate({ templateId: args.templateId, mode: args.mode || TEMPLATE_VIEW_MODE });
        },
        explanation: args.explanation,
        followUp:
          "The template has been switched. Based on the conversation history, if the user asked you to apply specific changes to this template, apply them now. Otherwise just wait for their next instruction.",
        errorDetail: plainDetail,
      }),

    [AI_TOOLS.SAVE_AND_OPEN_TEMPLATE]: async (args, { ctx }) =>
      runTemplateNavigation({
        run: async () => {
          if (ctx.actions.saveAndOpenTemplate)
            await ctx.actions.saveAndOpenTemplate({ templateId: args.templateId, mode: args.mode || TEMPLATE_VIEW_MODE });
        },
        explanation: args.explanation,
        followUp:
          "The template has been saved and switched. Based on the conversation history, if the user asked you to apply specific changes to this new template, apply them now. Otherwise just wait for their next instruction.",
        errorDetail: getErrorDetail,
      }),
  };
};

export default createEmailTemplateTools;
