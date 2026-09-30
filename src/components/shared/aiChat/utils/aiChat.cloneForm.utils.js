import { WIDGET_STRINGS } from "@/components/shared/aiChat/utils/aiChat.widgetStrings.data.js";
import { getBlockedMessageKey } from "@/components/shared/aiChat/utils/aiChat.toolHelpers.utils.js";

const NOT_SET = "(not set)";

const failureLine = (label, err) => {
  if (err?.isCancelled) return `**${label}:** skipped (cancelled)`;
  const blockedKey = getBlockedMessageKey(err);
  if (blockedKey) return `**${label}:** failed — ${WIDGET_STRINGS[blockedKey]} ✗`;
  return `**${label}:** failed — ${err?.message || "unknown error"} ✗`;
};

const isEmptySetting = (value) => !value || value === NOT_SET;

// section update changes the target
export const hasSectionChanges = (update, existing) => {
  if (!existing) return false;
  if (
    update.displayText !== undefined &&
    !isEmptySetting(update.displayText) &&
    update.displayText !== existing.displayText
  )
    return true;
  if (
    update.signDisplayText !== undefined &&
    !isEmptySetting(update.signDisplayText) &&
    update.signDisplayText !== (existing.signDisplayText || existing.signDisplayFormattedText)
  )
    return true;
  if (
    update.aiCustomizablePrompt !== undefined &&
    !isEmptySetting(update.aiCustomizablePrompt) &&
    update.aiCustomizablePrompt !== existing.aiCustomizablePrompt
  )
    return true;
  if (
    update.aiFormatting !== undefined &&
    !isEmptySetting(update.aiFormatting) &&
    update.aiFormatting !== existing.ai_formatting
  )
    return true;
  if (update.isSignAiHelp !== undefined && update.isSignAiHelp !== existing.isSignAiHelp) return true;
  if (
    update.signAiPrompt !== undefined &&
    !isEmptySetting(update.signAiPrompt) &&
    update.signAiPrompt !== existing.signAiPrompt
  )
    return true;
  return Boolean(update.ownerSuggestions?.length);
};

export const cloneBrandingStep = async ({ ctx, sourceForm, targetForm, targetFormId, results }) => {
  try {
    const sourceBrandingId = sourceForm?.branding?._id ? String(sourceForm.branding._id) : null;
    const sourceBrandingName = sourceForm?.branding?.name || sourceBrandingId;
    const targetBrandingId = targetForm?.branding?._id ? String(targetForm.branding._id) : null;
    if (!sourceBrandingId) {
      results.push("**Branding:** source has no branding — skipped");
    } else if (sourceBrandingId === targetBrandingId) {
      results.push(`**Branding:** already set to "${sourceBrandingName}" — skipped`);
    } else if (ctx.actions.setFormsBranding) {
      await ctx.actions.setFormsBranding({
        updates: [{ formId: String(targetFormId), brandingId: sourceBrandingId }],
      });
      results.push(`**Branding:** applied "${sourceBrandingName}" ✓`);
    }
  } catch (err) {
    results.push(failureLine("Branding", err));
  }
};

export const cloneEmailTemplatesStep = async ({ ctx, sourceForm, targetForm, targetFormId, results }) => {
  try {
    const sourceTemplates = sourceForm?.emailTemplates || [];
    const targetTemplateIds = new Set((targetForm?.emailTemplates || []).map((t) => String(t._id)));
    const missingTemplates = sourceTemplates.filter((t) => !targetTemplateIds.has(String(t._id)));
    if (!sourceTemplates.length) {
      results.push("**Email templates:** source has none — skipped");
    } else if (!missingTemplates.length) {
      results.push(`**Email templates:** all ${sourceTemplates.length} already attached — skipped`);
    } else if (ctx.actions.attachEmailTemplate) {
      await ctx.actions.attachEmailTemplate({
        formId: String(targetFormId),
        templateIds: missingTemplates.map((t) => String(t._id)),
      });
      results.push(`**Email templates:** attached ${missingTemplates.map((t) => `"${t.name}"`).join(", ")} ✓`);
    }
  } catch (err) {
    results.push(failureLine("Email templates", err));
  }
};

export const cloneRulesStep = async ({ ctx, sourceFormId, targetFormId, results }) => {
  try {
    const result = await ctx.actions.cloneRules({
      sourceFormId: String(sourceFormId),
      targetFormId: String(targetFormId),
    });
    if (result.cloned > 0) {
      results.push(
        `**Underwriting rules:** cloned ${result.cloned} rule(s)${result.skipped ? ` (${result.skipped} already present — skipped)` : ""} ✓`,
      );
    } else if (result.skipped > 0) {
      results.push(`**Underwriting rules:** all ${result.skipped} rule(s) already present on target — skipped ✓`);
    } else {
      results.push(
        `**Underwriting rules:** no rules were copied — no underwriting rules were found in the source form`,
      );
    }
  } catch (err) {
    results.push(failureLine("Underwriting rules", err));
  }
};

export const pushStepFailure = (results, label, err) => results.push(failureLine(label, err));
