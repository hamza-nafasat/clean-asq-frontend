import { toast } from "react-toastify";

export const buildLookupScreenState = (lookups) => ({
  lookups: (lookups || []).map((l) => ({
    _id: l._id,
    searchObjectKey: l.searchObjectKey,
    searchTerms: l.searchTerms,
    extractionPrompt: l.extractionPrompt,
    extractAs: l.extractAs,
    companyIdentification: l.companyIdentification,
    isActive: l.isActive,
  })),
});

export const buildLookupAssistantActions = ({
  lookups,
  createSearchStrategy,
  updateSearchStrategy,
  onOpenCreateModal,
}) => ({
  setLookupActive: async ({ searchObjectKey, isActive }) => {
    const lookup = lookups?.find((l) => l.searchObjectKey === searchObjectKey);
    if (!lookup) return;
    try {
      await updateSearchStrategy({
        SearchStrategyId: lookup._id,
        data: {
          searchObjectKey: lookup.searchObjectKey,
          searchTerms: lookup.searchTerms,
          extractionPrompt: lookup.extractionPrompt,
          extractAs: lookup.extractAs,
          companyIdentification: lookup.companyIdentification,
          active: isActive,
          _id: lookup._id,
        },
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update lookup");
    }
  },
  openCreateModal: (draftData) => onOpenCreateModal?.(draftData),
  createLookup: async ({ searchObjectKey, searchTerms, extractionPrompt, extractAs, companyIdentification, isActive }) => {
    await createSearchStrategy({
      data: {
        searchObjectKey,
        searchTerms,
        extractionPrompt,
        extractAs,
        companyIdentification,
        active: isActive ?? true,
      },
    }).unwrap();
  },
  updateLookup: async ({
    lookupId,
    searchObjectKey,
    searchTerms,
    extractionPrompt,
    extractAs,
    companyIdentification,
    isActive,
  }) => {
    const lookup = lookups?.find((l) => l._id === lookupId);
    if (!lookup) throw new Error("Lookup not found");
    await updateSearchStrategy({
      SearchStrategyId: lookupId,
      data: {
        searchObjectKey: searchObjectKey ?? lookup.searchObjectKey,
        searchTerms: searchTerms ?? lookup.searchTerms,
        extractionPrompt: extractionPrompt ?? lookup.extractionPrompt,
        extractAs: extractAs ?? lookup.extractAs,
        companyIdentification: companyIdentification ?? lookup.companyIdentification,
        active: isActive ?? lookup.isActive,
        _id: lookupId,
      },
    }).unwrap();
  },
});
