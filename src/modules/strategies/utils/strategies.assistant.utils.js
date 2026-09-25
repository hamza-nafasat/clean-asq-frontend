import { toast } from "react-toastify";
import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { getLookupIds } from "./strategies.utils";

const UPDATE_CONFIRM_TEXT = "Update";

const findStrategy = (formStrategies, strategyId) => formStrategies?.find((s) => s._id === strategyId);

export const buildStrategiesScreenState = ({ formStrategies, lookups, forms }) => ({
  strategies: (formStrategies || []).map((s) => {
    const activeFormIds = new Set((forms || []).map((f) => String(f._id)));
    return {
      _id: s._id,
      name: s.name,
      isActive: s.isActive,
      lookups: (s.searchStrategies || []).map((l) => ({
        _id: l._id,
        searchObjectKey: l.searchObjectKey,
        searchTerms: l.searchTerms,
        extractAs: l.extractAs,
      })),
      forms: (s.forms || []).map((f) => ({
        _id: f._id,
        name: f.name || f.headerText,
        isStale: !f._id || !activeFormIds.has(String(f._id)),
      })),
    };
  }),
  availableLookups: (lookups || []).map((l) => ({
    _id: l._id,
    searchObjectKey: l.searchObjectKey,
    searchTerms: l.searchTerms,
    extractAs: l.extractAs,
    isActive: l.isActive,
  })),
  availableForms: (forms || []).map((f) => ({
    _id: f._id,
    name: f.name || f.headerText,
  })),
});

// group moving forms by source
const groupFormsBySource = (formsToMove) =>
  (formsToMove || []).reduce((acc, { formId, fromStrategyId }) => {
    acc[fromStrategyId] = [...(acc[fromStrategyId] || []), formId];
    return acc;
  }, {});

export const buildStrategyAssistantActions = ({
  formStrategies,
  createFormStrategy,
  updateFormStrategy,
  askConfirm,
}) => {
  const removeForms = (strategy, formIds) =>
    updateFormStrategy({
      FormStrategyId: strategy._id,
      data: {
        name: strategy.name,
        form: (strategy.forms || []).map((f) => f._id).filter((id) => !formIds.includes(id)),
        searchStrategies: getLookupIds(strategy),
      },
    }).unwrap();

  return {
    [AI_TOOLS.CREATE_STRATEGY]: async ({ name, searchStrategyIds, formIds }) => {
      try {
        const res = await createFormStrategy({
          name,
          searchStrategies: searchStrategyIds,
          form: formIds || [],
        }).unwrap();
        if (!res.success) throw new Error(res.message);
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Failed to create strategy");
        throw err;
      }
    },
    [AI_TOOLS.CREATE_STRATEGY_AND_MOVE_FORM]: async ({ name, searchStrategyIds, freeFormIds, formsToMove }) => {
      await confirmOrCancel(askConfirm, {
        title: "Move Forms",
        message: `Create "${name}" and move ${formsToMove?.length || 0} form(s) out of their current strategies?`,
        confirmButtonText: UPDATE_CONFIRM_TEXT,
      });
      let newStrategyId;
      try {
        const createRes = await createFormStrategy({
          name,
          searchStrategies: searchStrategyIds,
          form: freeFormIds || [],
        }).unwrap();
        newStrategyId = createRes.data._id;
      } catch (err) {
        toast.error(err?.data?.message || "Failed to create strategy");
        throw err;
      }

      // one update per source strategy
      const movedFormIds = [];
      for (const [fromStrategyId, formIds] of Object.entries(groupFormsBySource(formsToMove))) {
        const fromStrategy = findStrategy(formStrategies, fromStrategyId);
        if (!fromStrategy) continue;
        try {
          await removeForms(fromStrategy, formIds);
        } catch (err) {
          toast.error(`Strategy "${name}" created, but moving forms out of "${fromStrategy.name}" failed`);
          throw err;
        }
        movedFormIds.push(...formIds);
      }
      if (!movedFormIds.length) return;
      try {
        await updateFormStrategy({
          FormStrategyId: newStrategyId,
          data: {
            name,
            form: [...(freeFormIds || []), ...movedFormIds],
            searchStrategies: searchStrategyIds,
          },
        }).unwrap();
      } catch (err) {
        toast.error(`Strategy "${name}" created, but adding the moved forms to it failed`);
        throw err;
      }
    },
    [AI_TOOLS.MOVE_FORM_TO_STRATEGY]: async ({ formIds, fromStrategyId, toStrategyId }) => {
      const fromStrategy = findStrategy(formStrategies, fromStrategyId);
      const toStrategy = findStrategy(formStrategies, toStrategyId);
      if (!fromStrategy) throw new Error("Source strategy not found");
      if (!toStrategy) throw new Error("Destination strategy not found");
      await confirmOrCancel(askConfirm, {
        title: "Move Forms",
        message: `Move ${formIds.length} form(s) from "${fromStrategy.name}" to "${toStrategy.name}"?`,
        confirmButtonText: UPDATE_CONFIRM_TEXT,
      });
      try {
        await removeForms(fromStrategy, formIds);
        await updateFormStrategy({
          FormStrategyId: toStrategyId,
          data: {
            name: toStrategy.name,
            form: [...(toStrategy.forms || []).map((f) => f._id), ...formIds],
            searchStrategies: getLookupIds(toStrategy),
          },
        }).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Failed to move form");
        throw err;
      }
    },
    [AI_TOOLS.LINK_STRATEGY_TO_FORM]: async ({ strategyId, formIds }) => {
      const strategy = findStrategy(formStrategies, strategyId);
      if (!strategy) throw new Error("Strategy not found");
      await confirmOrCancel(askConfirm, {
        title: "Update Strategy",
        message: `Link ${formIds?.length || 0} form(s) to "${strategy.name}"?`,
        confirmButtonText: UPDATE_CONFIRM_TEXT,
      });
      try {
        const res = await updateFormStrategy({
          FormStrategyId: strategyId,
          data: {
            name: strategy.name,
            form: formIds,
            searchStrategies: getLookupIds(strategy),
          },
        }).unwrap();
        if (!res.success) throw new Error(res.message);
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Failed to link strategy");
        throw err;
      }
    },
  };
};
