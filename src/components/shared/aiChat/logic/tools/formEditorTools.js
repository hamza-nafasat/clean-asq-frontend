import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import {
  cloneBrandingStep,
  cloneEmailTemplatesStep,
  cloneRulesStep,
  pushStepFailure,
} from "@/components/shared/aiChat/logic/cloneFormSteps.js";
import { formatFormList } from "@/components/shared/aiChat/logic/formContextUtils.js";
import { toPreviewSection } from "@/components/shared/aiChat/logic/formPreviewUtils.js";
import { getBlockedMessageKey, getErrorDetail } from "@/components/shared/aiChat/logic/toolHelpers.js";

const UNKNOWN_SECTION_ORDER = 9999;

const createFormEditorTools = ({ bindings, helpers }) => {
  const { getScreenContext, continueAfterToolCall } = bindings;
  const { signalContinuationPending, pendingFormContinuationRef } = bindings;
  const { say, reportActionError, addFormPreview } = helpers;

  // apply edit, summarise, show preview
  const previewEdit =
    ({ apply, resultSummary, shouldPreview, mapSections }) =>
    async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      try {
        await apply(args, ctx);
        await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
        if (shouldPreview(args)) addFormPreview(ctx, (sections) => mapSections(sections, args));
      } catch (err) {
        reportActionError(err);
      }
    };

  // create section or field, continue
  const createAndContinue = (resultSummary) => async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
    try {
      if (ctx.actions[tool]) await ctx.actions[tool](args);
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
    } catch (err) {
      reportActionError(err);
    }
  };

  return {
    [AI_TOOLS.SELECT_FORM_FOR_EDITING]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { explanation, formId } = args;

      // guard against stale form ids
      const knownForms = ctx.currentState?.forms || [];
      if (formId && !knownForms.some((f) => String(f._id) === String(formId))) {
        await continueAfterToolCall(
          tool,
          args,
          `Error: Form ID "${formId}" is not in the current forms list — it may have been deleted or recreated with a new ID. Current forms: ${formatFormList(knownForms) || "none"}. Please use a valid ID from this list.`,
          currentHistory,
          chatEndpoint,
          ctx,
        );
        return;
      }

      say(explanation || "Loading form details…");
      // next load counts as fresh
      signalContinuationPending();
      pendingFormContinuationRef.current = { toolArgs: args, history: currentHistory };
      if (ctx.actions.selectFormForEditing) ctx.actions.selectFormForEditing({ formId });
    },

    [AI_TOOLS.UPDATE_SECTION_SETTINGS]: async (args, { tool, ctx, chatEndpoint, currentHistory }) => {
      const { updates, sourceFormId } = args;
      const results = [];

      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        const forms = ctx.currentState?.forms || [];
        const sourceForm = forms.find((f) => String(f._id) === String(sourceFormId));
        const targetForm = forms.find((f) => String(f._id) === String(targetFormId));
        await cloneBrandingStep({ ctx, sourceForm, targetForm, targetFormId, results });
        await cloneEmailTemplatesStep({ ctx, sourceForm, targetForm, targetFormId, results });
      }

      // use the freshly loaded form
      let validUpdates = [];
      try {
        const liveCtx = getScreenContext() ?? ctx;
        const targetSections = liveCtx.currentState?.detailedForm?.sections || [];
        const targetSectionMap = new Map(targetSections.map((s) => [String(s._id), s]));
        validUpdates = (updates || []).filter((u) => targetSectionMap.has(String(u.sectionId)));
        if (validUpdates.length && liveCtx.actions?.updateSectionSettings) {
          await liveCtx.actions.updateSectionSettings({ updates: validUpdates });
          const skipped = (updates || []).length - validUpdates.length;
          results.push(
            `**Section settings:** applied ${validUpdates.length} update(s)${skipped ? ` (${skipped} skipped — invalid section ID)` : ""} ✓`,
          );
        } else if ((updates || []).length && !validUpdates.length) {
          results.push(`**Section settings:** skipped — no updates matched valid sections in the current form ✗`);
        }
      } catch (err) {
        pushStepFailure(results, "Section settings", err);
      }

      if (sourceFormId) {
        const targetFormId = ctx.currentState?.detailedForm?._id;
        if (targetFormId && ctx.actions.cloneRules) await cloneRulesStep({ ctx, sourceFormId, targetFormId, results });
      }

      const resultSummary = results.length
        ? `Completed form-level settings. Results:\n${results.join("\n")}\n\nNow continue with field updates if any, then produce a final summary that incorporates these results verbatim. End with: "Say **save** to apply these changes to the live form, or **discard** to cancel."`
        : 'Section settings applied to preview. Continue with field updates if any, then summarise what changed. End your response with: "Say **save** to apply these changes to the live form, or **discard** to cancel."';
      await continueAfterToolCall(tool, args, resultSummary, currentHistory, chatEndpoint, ctx);
      if (validUpdates.length === 0) return;
      addFormPreview(ctx, (sections) =>
        sections.map((s) => {
          const u = validUpdates.find((vu) => String(vu.sectionId) === String(s._id));
          return toPreviewSection(
            s,
            u
              ? {
                  displayText: u.displayText ?? s.displayText ?? "",
                  signDisplayText: u.signDisplayText ?? s.signDisplayText ?? "",
                  isHidden: u.isHidden ?? s.isHidden ?? false,
                }
              : {},
          );
        }),
      );
    },

    [AI_TOOLS.UPDATE_FIELD_SETTINGS]: previewEdit({
      apply: ({ updates }, ctx) => {
        if (ctx.actions.updateFieldSettings) return ctx.actions.updateFieldSettings({ updates });
      },
      resultSummary:
        'Field settings applied to preview. Summarise what changed, then end with: "Say **save** to apply these changes to the live form, or **discard** to cancel."',
      shouldPreview: ({ updates }) => updates?.length,
      mapSections: (sections, { updates }) =>
        sections.map((s) => {
          const su = updates.find((u) => String(u.sectionId) === String(s._id));
          if (!su) return toPreviewSection(s);
          const mergedFields = (s.fields || []).map((f) => {
            const fu = (su.fields || []).find((ff) => String(ff.fieldId) === String(f._id));
            return fu ? { ...f, ...fu } : f;
          });
          return toPreviewSection({ ...s, fields: mergedFields });
        }),
    }),

    [AI_TOOLS.REORDER_SECTIONS]: previewEdit({
      apply: ({ sectionOrder }, ctx) => {
        if (ctx.actions.reorderSections) ctx.actions.reorderSections({ sectionOrder });
      },
      resultSummary:
        'Sections reordered in preview. Summarise what changed, then end with: "Say **save** to apply these changes to the live form, or **discard** to cancel."',
      shouldPreview: ({ sectionOrder }) => sectionOrder?.length,
      mapSections: (sections, { sectionOrder }) => {
        const orderMap = {};
        (sectionOrder || []).forEach((id, i) => {
          orderMap[String(id)] = i;
        });
        return [...sections]
          .sort(
            (a, b) => (orderMap[String(a._id)] ?? UNKNOWN_SECTION_ORDER) - (orderMap[String(b._id)] ?? UNKNOWN_SECTION_ORDER),
          )
          .map((s) => toPreviewSection(s));
      },
    }),

    [AI_TOOLS.DELETE_SECTION]: previewEdit({
      apply: ({ sectionId }, ctx) => {
        const liveCtx = getScreenContext() ?? ctx;
        if (liveCtx.actions?.deleteSection) liveCtx.actions.deleteSection({ sectionId });
      },
      resultSummary:
        'Section marked for deletion in preview. Summarise what changed, then end with: "Say **save** to apply these changes to the live form, or **discard** to cancel."',
      shouldPreview: ({ sectionId }) => sectionId,
      mapSections: (sections, { sectionId }) =>
        sections.filter((s) => String(s._id) !== String(sectionId)).map((s) => toPreviewSection(s)),
    }),

    [AI_TOOLS.DELETE_FIELD]: previewEdit({
      apply: ({ sectionId, fieldId }, ctx) => {
        const liveCtx = getScreenContext() ?? ctx;
        if (liveCtx.actions?.deleteField) liveCtx.actions.deleteField({ sectionId, fieldId });
      },
      resultSummary:
        'Field marked for deletion in preview. Summarise what changed, then end with: "Say **save** to apply these changes to the live form, or **discard** to cancel."',
      shouldPreview: ({ fieldId }) => fieldId,
      mapSections: (sections, { sectionId, fieldId }) =>
        sections.map((s) =>
          String(s._id) === String(sectionId)
            ? toPreviewSection({ ...s, fields: (s.fields || []).filter((f) => String(f._id) !== String(fieldId)) })
            : toPreviewSection(s),
        ),
    }),

    [AI_TOOLS.SAVE_FORM_EDITS]: async (args, { ctx }) => {
      const { explanation } = args;
      try {
        const result = ctx.actions.saveFormEdits ? await ctx.actions.saveFormEdits() : null;
        if (result?.saved === false) {
          say("There are no pending changes to save — your edits may have been lost. Please re-apply the changes and try again.");
        } else if (result === null) {
          say("Save could not run — the form editor context was not available. Please try again.");
        } else {
          say(explanation || "All changes have been saved to the form.");
        }
      } catch (err) {
        if (err?.isCancelled) return say("Save cancelled — your pending changes are still in the preview.");
        if (getBlockedMessageKey(err)) return reportActionError(err);
        const detail = getErrorDetail(err);
        say(`Save failed${detail ? `: ${detail}` : ""}. Some changes may not have been applied.`);
      }
    },

    [AI_TOOLS.DISCARD_FORM_EDITS]: async (args, { ctx }) => {
      const { explanation } = args;
      if (ctx.actions.discardFormEdits) ctx.actions.discardFormEdits();
      say(explanation || "All pending changes have been discarded.");
    },

    [AI_TOOLS.ADD_SECTION]: createAndContinue(
      "Section created successfully. The form has been reloaded with the new section.",
    ),
    [AI_TOOLS.ADD_FIELD]: createAndContinue("Field created successfully. The form has been reloaded with the new field."),
  };
};

export default createFormEditorTools;
