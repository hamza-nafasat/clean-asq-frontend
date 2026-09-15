import { toast } from "react-toastify";

export const toFormOptions = (forms) => forms?.map((item) => ({ label: item?.name, value: item?._id })) || [];

export const toLookupOptions = (lookups) =>
  lookups?.map((item) => ({ label: item?.searchObjectKey, value: item?._id })) || [];

// forms not linked to any strategy yet
export const getUnassignedFormOptions = (strategies, forms) => {
  const allFormsAddedInStrategies = strategies
    ?.map((item) => item?.forms)
    ?.flat()
    ?.map((item) => item?._id);
  return (
    forms
      ?.map((item) => ({ label: item?.name, value: item?._id }))
      ?.filter((item) => !allFormsAddedInStrategies?.includes(item?.value)) || []
  );
};

export const getInitialEditForm = (selectedRow) =>
  selectedRow
    ? {
        name: selectedRow.name || "",
        form: selectedRow.forms?.map((f) => f?._id) || "",
        searchStrategies: selectedRow?.searchStrategies?.map((s) => s?._id) || [],
      }
    : { name: "", form: "", searchStrategies: [] };

const getLookupIds = (strategy) => (strategy.searchStrategies || []).map((s) => s._id);

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
  availableForms: (forms || []).map((f) => ({ _id: f._id, name: f.name || f.headerText })),
});

export const buildStrategyAssistantActions = ({ formStrategies, createFormStrategy, updateFormStrategy }) => ({
  createStrategy: async ({ name, searchStrategyIds, formIds }) => {
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
  createStrategyAndMoveForm: async ({ name, searchStrategyIds, freeFormIds, formsToMove }) => {
    try {
      // create with free forms first
      const createRes = await createFormStrategy({
        name,
        searchStrategies: searchStrategyIds,
        form: freeFormIds || [],
      }).unwrap();
      const newStrategyId = createRes?.data?._id;
      if (!newStrategyId) throw new Error("Could not retrieve new strategy ID");

      // move each conflicted form to the new strategy
      for (const { formId, fromStrategyId } of formsToMove || []) {
        const fromStrategy = formStrategies?.find((s) => s._id === fromStrategyId);
        if (!fromStrategy) continue;
        const remainingForms = (fromStrategy.forms || []).map((f) => f._id).filter((id) => id !== formId);
        await updateFormStrategy({
          FormStrategyId: fromStrategyId,
          data: { name: fromStrategy.name, form: remainingForms, searchStrategies: getLookupIds(fromStrategy) },
        }).unwrap();
        await updateFormStrategy({
          FormStrategyId: newStrategyId,
          data: { name, form: [...(freeFormIds || []), formId], searchStrategies: searchStrategyIds },
        }).unwrap();
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to create strategy");
      throw err;
    }
  },
  moveFormToStrategy: async ({ formIds, fromStrategyId, toStrategyId }) => {
    const fromStrategy = formStrategies?.find((s) => s._id === fromStrategyId);
    const toStrategy = formStrategies?.find((s) => s._id === toStrategyId);
    if (!fromStrategy) throw new Error("Source strategy not found");
    if (!toStrategy) throw new Error("Destination strategy not found");
    try {
      // remove forms from source
      const remainingForms = (fromStrategy.forms || []).map((f) => f._id).filter((id) => !formIds.includes(id));
      await updateFormStrategy({
        FormStrategyId: fromStrategyId,
        data: { name: fromStrategy.name, form: remainingForms, searchStrategies: getLookupIds(fromStrategy) },
      }).unwrap();
      // add forms to destination
      const newForms = [...(toStrategy.forms || []).map((f) => f._id), ...formIds];
      await updateFormStrategy({
        FormStrategyId: toStrategyId,
        data: { name: toStrategy.name, form: newForms, searchStrategies: getLookupIds(toStrategy) },
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to move form");
      throw err;
    }
  },
});
