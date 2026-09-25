import { toast } from "react-toastify";
import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/constants/aiToolNames.js";
import { EXTRACTION_SECTION_CARDS } from "./lookupManagement.constants";

const UPDATE_CONFIRM_TEXT = "Update";
const DELETE_CONFIRM_TEXT = "Delete";

// section number the prompt card saves with
const findSectionId = (name) => EXTRACTION_SECTION_CARDS.find((card) => card.label === name)?.id;

export const buildLookupScreenState = (lookups, prompts) => ({
  extractionPrompts: (prompts || []).map(({ name, prompt }) => ({ name, prompt })),
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

const toLookupPayload = (lookup, changes = {}) => ({
  searchObjectKey: changes.searchObjectKey ?? lookup.searchObjectKey,
  searchTerms: changes.searchTerms ?? lookup.searchTerms,
  extractionPrompt: changes.extractionPrompt ?? lookup.extractionPrompt,
  extractAs: changes.extractAs ?? lookup.extractAs,
  companyIdentification: changes.companyIdentification ?? lookup.companyIdentification,
  active: changes.isActive ?? lookup.isActive,
  _id: lookup._id,
});

export const buildLookupAssistantActions = ({
  lookups,
  createSearchStrategy,
  updateSearchStrategy,
  deleteSearchStrategy,
  createDefaultLookups,
  updatePrompt,
  onOpenCreateModal,
  askConfirm,
}) => ({
  [AI_TOOLS.DELETE_LOOKUPS]: async ({ searchObjectKeys = [] }) => {
    const toDelete = searchObjectKeys.map((key) => {
      const lookup = lookups?.find((l) => l.searchObjectKey === key);
      if (!lookup) throw new Error(`Lookup key "${key}" not found`);
      return lookup;
    });
    await confirmOrCancel(askConfirm, {
      title: "Delete Lookup Keys",
      message: `Permanently delete ${toDelete.map((l) => l.searchObjectKey).join(", ")}? They will also be removed from every strategy.`,
      confirmButtonText: DELETE_CONFIRM_TEXT,
    });
    for (const lookup of toDelete) {
      try {
        await deleteSearchStrategy({ SearchStrategyId: lookup._id }).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || `Failed to delete ${lookup.searchObjectKey}`);
        throw err;
      }
    }
  },
  [AI_TOOLS.CREATE_DEFAULT_LOOKUPS]: async () => {
    try {
      await createDefaultLookups().unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create default lookup keys");
      throw err;
    }
  },
  [AI_TOOLS.UPDATE_EXTRACTION_PROMPT]: async ({ name, prompt }) => {
    const section = findSectionId(name);
    if (!section) throw new Error(`Prompt section "${name}" not found`);
    await confirmOrCancel(askConfirm, {
      title: "Update Prompt",
      message: `Save the suggested changes to the ${name} section?`,
      confirmButtonText: UPDATE_CONFIRM_TEXT,
    });
    try {
      await updatePrompt({ name, prompt, section }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update prompt");
      throw err;
    }
  },
  [AI_TOOLS.SET_LOOKUP_ACTIVE]: async ({ updates = [] }) => {
    const changes = updates.map(({ searchObjectKey, isActive }) => {
      const lookup = lookups?.find((l) => l.searchObjectKey === searchObjectKey);
      if (!lookup) throw new Error(`Lookup key "${searchObjectKey}" not found`);
      return { lookup, isActive };
    });
    await confirmOrCancel(askConfirm, {
      title: "Update Lookup Keys",
      message: changes
        .map(({ lookup, isActive }) => `${isActive ? "Activate" : "Deactivate"} ${lookup.searchObjectKey}`)
        .join(", "),
      confirmButtonText: UPDATE_CONFIRM_TEXT,
    });
    try {
      for (const { lookup, isActive } of changes) {
        await updateSearchStrategy({
          SearchStrategyId: lookup._id,
          data: toLookupPayload(lookup, { isActive }),
        }).unwrap();
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update lookup key");
      throw err;
    }
  },
  [AI_TOOLS.DRAFT_NEW_LOOKUP]: (draftData) => onOpenCreateModal?.(draftData),
  [AI_TOOLS.CREATE_LOOKUP]: async ({
    searchObjectKey,
    searchTerms,
    extractionPrompt,
    extractAs,
    companyIdentification,
    isActive,
  }) => {
    try {
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
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create lookup key");
      throw err;
    }
  },
  [AI_TOOLS.UPDATE_LOOKUP]: async ({ lookupId, ...changes }) => {
    const lookup = lookups?.find((l) => l._id === lookupId);
    if (!lookup) throw new Error("Lookup key not found");
    await confirmOrCancel(askConfirm, {
      title: "Update Lookup Key",
      message: `Save the suggested changes to ${lookup.searchObjectKey}?`,
      confirmButtonText: UPDATE_CONFIRM_TEXT,
    });
    try {
      await updateSearchStrategy({
        SearchStrategyId: lookupId,
        data: toLookupPayload(lookup, changes),
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update lookup key");
      throw err;
    }
  },
});
