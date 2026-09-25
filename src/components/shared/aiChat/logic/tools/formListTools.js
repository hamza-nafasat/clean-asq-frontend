import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import {
  cloneBrandingStep,
  cloneEmailTemplatesStep,
  cloneRulesStep,
  hasSectionChanges,
  pushStepFailure,
} from "@/components/shared/aiChat/logic/cloneFormSteps.js";
import { LOCATION_STATUSES } from "@/constants";

const createFormListTools = ({ bindings, helpers }) => {
  const { continueAfterToolCall, pushRevertable } = bindings;
  const { say, reportActionError, runActionAndSay } = helpers;

  return {
    [AI_TOOLS.UPDATE_FORMS]: async (args, { ctx }) =>
      runActionAndSay(ctx, AI_TOOLS.UPDATE_FORMS, { updates: args.updates }, args.explanation),

    [AI_TOOLS.SET_FORMS_BRANDING]: async (args, { ctx }) => {
      const updates = args.updates || [];
      // snapshot each form's branding before overwriting
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldBrandingId: form?.branding?._id ?? null };
      });
      const isApplied = await runActionAndSay(ctx, AI_TOOLS.SET_FORMS_BRANDING, { updates }, args.explanation);
      if (!isApplied) return;
      pushRevertable({
        description: `Applied branding to ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot
            .filter((s) => s.oldBrandingId !== null)
            .map((s) => ({ formId: s.formId, brandingId: s.oldBrandingId }));
          const skipped = snapshot.filter((s) => s.oldBrandingId === null).length;
          if (revertUpdates.length > 0 && freshCtx?.actions?.setFormsBranding) {
            await freshCtx.actions.setFormsBranding({ updates: revertUpdates });
          }
          if (skipped > 0) {
            say(
              `Note: ${skipped} form(s) had no branding set before this change and cannot be automatically reverted to "no branding".`,
            );
          }
        },
      });
    },

    [AI_TOOLS.SET_FORMS_LOCATION]: async (args, { ctx }) => {
      const updates = args.updates || [];
      // snapshot each form's location setting
      const forms = ctx.currentState?.forms || [];
      const snapshot = updates.map(({ formId }) => {
        const form = forms.find((f) => f._id === formId);
        return { formId, oldLocationStatus: form?.locationStatus ?? LOCATION_STATUSES.DISABLED };
      });
      const isApplied = await runActionAndSay(ctx, AI_TOOLS.SET_FORMS_LOCATION, { updates }, args.explanation);
      if (!isApplied) return;
      pushRevertable({
        description: `Changed location setting on ${updates.length} form(s)`,
        revertFn: async (freshCtx) => {
          const revertUpdates = snapshot.map((s) => ({ formId: s.formId, locationStatus: s.oldLocationStatus }));
          if (freshCtx?.actions?.setFormsLocation) {
            await freshCtx.actions.setFormsLocation({ updates: revertUpdates });
          }
        },
      });
    },

    [AI_TOOLS.DELETE_FORMS]: async (args, { ctx }) =>
      runActionAndSay(ctx, AI_TOOLS.DELETE_FORMS, { formIds: args.formIds }, args.explanation),

    [AI_TOOLS.CLONE_FORM]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { sourceFormId, newName } = args;
      try {
        if (!ctx.actions.cloneForm) return;
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
      } catch (err) {
        reportActionError(err);
      }
    },

    [AI_TOOLS.CLONE_FORM_SETTINGS]: async (args, { ctx }) => {
      const { sourceFormId, targetFormId, sectionUpdates, fieldUpdates } = args;
      const results = [];

      const targetSections = ctx.currentState?.detailedForm?.sections || [];
      const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
      const forms = ctx.currentState?.forms || [];
      const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
      const targetForm = forms.find((f) => String(f._id) === String(targetFormId));

      // every step runs despite failures
      await cloneBrandingStep({ ctx, sourceForm, targetForm, targetFormId, results });
      await cloneEmailTemplatesStep({ ctx, sourceForm, targetForm, targetFormId, results });

      try {
        const validSectionUpdates = (sectionUpdates || []).filter((u) =>
          hasSectionChanges(u, targetSectionMap.get(String(u.sectionId))),
        );
        if (validSectionUpdates.length && ctx.actions.updateSectionSettings) {
          await ctx.actions.updateSectionSettings({ updates: validSectionUpdates });
          results.push(`**Section settings:** updated ${validSectionUpdates.length} section(s) ✓`);
        } else {
          results.push("**Section settings:** all already matched — skipped");
        }
      } catch (err) {
        pushStepFailure(results, "Section settings", err);
      }

      try {
        const validFieldUpdates = (fieldUpdates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validFieldUpdates.length && ctx.actions.updateFieldSettings) {
          await ctx.actions.updateFieldSettings({ updates: validFieldUpdates });
          results.push(`**Field settings:** updated fields in ${validFieldUpdates.length} section(s) ✓`);
        } else {
          results.push("**Field settings:** all already matched — skipped");
        }
      } catch (err) {
        pushStepFailure(results, "Field settings", err);
      }

      if (ctx.actions.cloneRules) await cloneRulesStep({ ctx, sourceFormId, targetFormId, results });

      say(`Settings clone complete:\n\n${results.join("\n")}`);
    },

    [AI_TOOLS.ATTACH_EMAIL_TEMPLATE]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
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
        reportActionError(err);
      }
    },

    [AI_TOOLS.DETACH_EMAIL_TEMPLATE]: async (args, { ctx }) =>
      runActionAndSay(
        ctx,
        AI_TOOLS.DETACH_EMAIL_TEMPLATE,
        { formId: args.formId, templateIds: args.templateIds },
        args.explanation,
      ),

    [AI_TOOLS.OPEN_CREATE_FORM_MODAL]: async (args, { ctx }) => {
      if (ctx.actions.openCreateFormModal) ctx.actions.openCreateFormModal();
      say(args.explanation);
    },
  };
};

export default createFormListTools;
