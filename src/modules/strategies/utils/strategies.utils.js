import { matchesText } from "@/utils/listFilter";
import { INITIAL_STRATEGY_FORM, STRATEGY_FILTER_KEYS, STRATEGY_FORM_FIELDS } from "./strategies.constants";

export const toFormOptions = (forms) => forms?.map((item) => ({ label: item?.name, value: item?._id })) || [];

export const toLookupOptions = (lookups) =>
  lookups?.map((item) => ({
    label: item?.searchObjectKey,
    value: item?._id,
  })) || [];

// forms free of other strategies
export const getAvailableFormOptions = (strategies, forms, currentStrategyId = null) => {
  const takenFormIds = new Set(
    (strategies || [])
      .filter((strategy) => strategy?._id !== currentStrategyId)
      .flatMap((strategy) => (strategy?.forms || []).map((form) => form?._id)),
  );
  return toFormOptions(forms).filter((option) => !takenFormIds.has(option.value));
};

export const getInitialStrategyForm = (strategy) =>
  strategy
    ? {
        name: strategy.name || "",
        form: strategy.forms?.map((f) => f?._id) || [],
        searchStrategies: strategy.searchStrategies?.map((s) => s?._id) || [],
      }
    : INITIAL_STRATEGY_FORM;

export const getLookupIds = (strategy) => (strategy.searchStrategies || []).map((s) => s._id);

// one message per invalid field
export const validateStrategyForm = (form) => ({
  [STRATEGY_FORM_FIELDS.NAME]: form.name?.trim() ? "" : "Enter a strategy name",
  [STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES]: form.searchStrategies?.length ? "" : "Choose at least one lookup key",
});

// linked forms found in the strategies
export const getStrategyFilterFormOptions = (strategies) => {
  const formsById = new Map(
    (strategies || []).flatMap((strategy) =>
      (strategy?.forms || []).filter((form) => form?._id).map((form) => [String(form._id), form]),
    ),
  );
  return [...formsById.values()].map((form) => ({ value: String(form._id), label: form.name || form.headerText }));
};

export const filterStrategies = (strategies, filters) => {
  const form = filters[STRATEGY_FILTER_KEYS.FORM];
  return strategies.filter(
    (strategy) =>
      matchesText([strategy?.name], filters[STRATEGY_FILTER_KEYS.SEARCH]) &&
      (!form || (strategy?.forms || []).some((item) => String(item?._id) === form)),
  );
};
