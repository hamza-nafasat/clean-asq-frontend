import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import { EMAIL_TEMPLATE_TYPES, HTTP_STATUSES } from "@/constants";
import { INITIAL_RULE, RECIPIENT_EMAIL_OPTIONS, RULE_CATEGORIES_FIELD, RULE_FIELDS } from "./applicationForms.constants";
import { validateRule } from "./applicationForms.validation.utils";

const RULE_KEYS = Object.keys(INITIAL_RULE);
const EDITABLE_RULE_KEYS = Object.values(RULE_FIELDS);
const EMAIL_RULE_KEYS = [RULE_FIELDS.IS_EMAIL_SENT_ON, RULE_FIELDS.RECIEVER_EMAIL, RULE_FIELDS.EMAIL_TEMPLATE_ID];

// keys that hold a value
const pickValues = (source, keys) =>
  Object.fromEntries(keys.filter((key) => source?.[key] != null).map((key) => [key, source[key]]));

const findRule = (rules, ruleId) => rules.find((rule) => rule._id === ruleId);

// same checks as the rule modal
const assertValidRule = (rule) => {
  const [firstError] = Object.values(validateRule(rule));
  if (firstError) throw new Error(firstError);
};

// email fields hidden without read_email
const assertCanEditEmail = (args, canReadEmail) => {
  if (canReadEmail || !EMAIL_RULE_KEYS.some((key) => args[key] != null)) return;
  throw Object.assign(new Error("Email templates are not viewable"), { status: HTTP_STATUSES.FORBIDDEN });
};

// same step as get rule from ai
const draftRuleLogic = async (getRuleFromAi, formId, { prompt, name, category }) => {
  const res = await getRuleFromAi({ formId, prompt, name, category }).unwrap();
  const { handler, formula, example, explanation, order } = res.data;
  return { handler, formula, example, explanation, order };
};

// body the rule modal saves
const toSaveData = (formId, rule) => ({ formId, ...rule, isEmailSentOn: Boolean(rule.isEmailSentOn) });

// field names per sample section
const toSampleSections = (sampleData) =>
  Object.entries(sampleData || {}).map(([section, fields]) => ({
    section,
    fields: Object.entries(fields || {}).map(([key, entry]) => entry?.name || key),
  }));

export const buildRuleScreenState = ({ formId, form, rules, emailTemplates, sampleData }) => ({
  form: { _id: formId, name: form?.name },
  rules: rules.map(
    ({ _id, name, category, prompt, isActive, order, formula, explanation, isEmailSentOn, recieverEmail, emailTemplateId }) => ({
      _id,
      name,
      category,
      prompt,
      isActive,
      order,
      formula,
      explanation,
      isEmailSentOn,
      recieverEmail,
      emailTemplateId,
    }),
  ),
  ruleCategories: RULE_CATEGORIES_FIELD.options,
  emailRecipients: RECIPIENT_EMAIL_OPTIONS,
  emailTemplates: emailTemplates
    ?.filter((template) => template.emailType === EMAIL_TEMPLATE_TYPES.RULE_TRIGGERED)
    .map(({ _id, templateName }) => ({ _id, templateName })),
  hasSampleSubmission: Boolean(sampleData),
  sampleSections: toSampleSections(sampleData),
});

export const buildRuleAssistantActions = ({ formId, rules, canReadEmail, askConfirm, mutations }) => {
  const { createRule, getRuleFromAi, updateRule, updateStatusRule, updateRulesOrder, deleteRule } = mutations;

  return {
    [AI_TOOLS.CREATE_FORM_RULE]: async (args) => {
      assertCanEditEmail(args, canReadEmail);
      const rule = { ...INITIAL_RULE, ...pickValues(args, EDITABLE_RULE_KEYS) };
      assertValidRule(rule);
      const logic = await draftRuleLogic(getRuleFromAi, formId, rule);
      await createRule(toSaveData(formId, { ...rule, ...logic })).unwrap();
    },
    [AI_TOOLS.UPDATE_FORM_RULE]: async ({ ruleId, ...edits }) => {
      const savedRule = findRule(rules, ruleId);
      if (!savedRule) throw new Error("Rule not found");
      assertCanEditEmail(edits, canReadEmail);
      const rule = { ...INITIAL_RULE, ...pickValues(savedRule, RULE_KEYS), ...pickValues(edits, EDITABLE_RULE_KEYS) };
      assertValidRule(rule);
      const isLogicChanged = rule.prompt !== savedRule.prompt || rule.category !== savedRule.category;
      await confirmOrCancel(askConfirm, {
        title: "Update Rule",
        message: `Save the changes to "${savedRule.name}"?${isLogicChanged ? " Its logic will be regenerated." : ""}`,
        confirmButtonText: "Update",
      });
      // keep the saved run order
      const logic = isLogicChanged ? { ...(await draftRuleLogic(getRuleFromAi, formId, rule)), order: rule.order } : {};
      await updateRule({ data: toSaveData(formId, { ...rule, ...logic }), ruleId }).unwrap();
    },
    [AI_TOOLS.SET_FORM_RULES_ACTIVE]: async ({ updates }) => {
      const changes = (updates || [])
        .map(({ ruleId, isActive }) => ({ rule: findRule(rules, ruleId), isActive }))
        .filter(({ rule }) => rule);
      if (!changes.length) throw new Error("Rule not found");
      await confirmOrCancel(askConfirm, {
        title: "Update Rule Status",
        message: `Turn ${changes.map(({ rule, isActive }) => `"${rule.name}" ${isActive ? "on" : "off"}`).join(", ")}?`,
        confirmButtonText: "Update",
      });
      for (const { rule, isActive } of changes) await updateStatusRule({ ruleId: rule._id, isActive }).unwrap();
    },
    [AI_TOOLS.REORDER_FORM_RULES]: async ({ ruleIds }) => {
      const listedRules = [...new Set(ruleIds)].map((ruleId) => findRule(rules, ruleId)).filter(Boolean);
      if (!listedRules.length) throw new Error("Rule not found");
      // unlisted rules keep their order after
      const orderedRules = [...listedRules, ...rules.filter((rule) => !listedRules.includes(rule))];
      await confirmOrCancel(askConfirm, {
        title: "Update Rules Order",
        message: `Save this rule order: ${orderedRules.map((rule, index) => `${index + 1}. ${rule.name}`).join(", ")}?`,
        confirmButtonText: "Save",
      });
      await updateRulesOrder(orderedRules.map((rule, index) => ({ ruleId: rule._id, order: index + 1 }))).unwrap();
    },
    [AI_TOOLS.DELETE_FORM_RULES]: async ({ ruleIds }) => {
      const selectedRules = rules.filter((rule) => ruleIds?.includes(rule._id));
      if (!selectedRules.length) throw new Error("Rule not found");
      await confirmOrCancel(askConfirm, {
        title: "Delete Rules",
        message: `Permanently delete ${selectedRules.map((rule) => `"${rule.name}"`).join(", ")}?`,
        confirmButtonText: "Delete",
      });
      for (const rule of selectedRules) await deleteRule({ ruleId: rule._id }).unwrap();
    },
  };
};
