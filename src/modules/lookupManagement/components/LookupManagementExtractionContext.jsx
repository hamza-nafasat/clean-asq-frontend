import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useGetAllPromptsQuery, useGetAllSearchStrategiesQuery, useUpdatePromptMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import LookupManagementExtractionCards from "./LookupManagementExtractionCards";
import LookupManagementExtractionHeading from "./LookupManagementExtractionHeading";
import { PERMISSIONS } from "@/utils/permissions";
import { EXTRACTION_SECTION_CARDS, EXTRACTION_SECTION_IDS, EXTRACTION_TABS } from "../utils/lookupManagement.constants";
import { buildFullPrompt, generateExtractionDetails } from "../utils/lookupManagement.prompt.utils";

// latest updatedAt across the prompts
const getLastUpdated = (prompts) => {
  const times = (prompts || []).map((p) => new Date(p?.updatedAt).getTime()).filter(Boolean);
  return times.length ? new Date(Math.max(...times)).toLocaleString() : "";
};

const LookupManagementExtractionContext = () => {
  const [activeTab, setActiveTab] = useState(EXTRACTION_TABS.EDIT);
  const [prompts, setPrompts] = useState({});
  const canUpdateLookup = usePermission(PERMISSIONS.UPDATE_LOOKUP);
  const updateConfirm = useConfirm();
  const promptsQuery = useGetAllPromptsQuery();
  const strategiesQuery = useGetAllSearchStrategiesQuery();
  const [updatePrompt, { isLoading: isUpdating }] = useUpdatePromptMutation();

  const savedPrompts = promptsQuery.data?.data;
  const lookups = strategiesQuery.data?.data;
  const extractionPrompt = lookups ? generateExtractionDetails(lookups) : "";
  const fullPrompt = buildFullPrompt(savedPrompts, lookups);
  const getPrompt = (name) => prompts[name] ?? savedPrompts?.find((p) => p.name === name)?.prompt ?? "";

  const discardDraft = (name) =>
    setPrompts((prev) => {
      const { [name]: _discarded, ...rest } = prev;
      return rest;
    });

  // true once the prompt is saved
  const updatePrompts = async (name, prompt, id) => {
    if (!prompt) {
      toast.error("Enter a prompt before saving");
      return false;
    }
    const isConfirmed = await updateConfirm.ask({
      title: "Update Prompt",
      message: "Save changes to this section?",
    });
    if (!isConfirmed) return false;
    try {
      const res = await updatePrompt({ name, prompt, section: id }).unwrap();
      if (res.success) toast.success(res.message);
      return true;
    } catch (error) {
      console.error("Update prompt error:", error);
      toast.error(error?.data?.message || "Failed to update prompt");
      return false;
    }
  };

  const handleRetry = () => {
    promptsQuery.refetch();
    strategiesQuery.refetch();
  };

  if (promptsQuery.isLoading || strategiesQuery.isLoading) return <LoadingState title="Loading extraction context" />;
  if (promptsQuery.isError || strategiesQuery.isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load extraction context">
        <Button type="button" label="Try again" onClick={handleRetry} />
      </EmptyState>
    );

  return (
    <>
      <LookupManagementExtractionHeading
        lastUpdated={getLastUpdated(savedPrompts)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-col gap-8">
        {activeTab === EXTRACTION_TABS.PREVIEW ? (
          <LookupManagementExtractionCards
            title="Complete Extraction Prompt"
            subtitle="This is the complete prompt that will be sent to Perplexity AI for data extraction (all sections with dynamic content resolved)"
            prompt={fullPrompt}
            isPreview
          />
        ) : (
          EXTRACTION_SECTION_CARDS.map(({ id, title, label, subtitle }) =>
            id === EXTRACTION_SECTION_IDS.OUTPUT_FORMAT ? (
              <LookupManagementExtractionCards
                key={id}
                title={title}
                section={`Section ${id}`}
                id={id}
                subtitle={subtitle}
                prompt={extractionPrompt}
                isPreview
              />
            ) : (
              <LookupManagementExtractionCards
                key={id}
                title={title}
                section={`Section ${id}`}
                id={id}
                label={label}
                subtitle={subtitle}
                prompt={getPrompt(label)}
                onUpdate={updatePrompts}
                onCancel={discardDraft}
                setPrompts={setPrompts}
                isPreview={!canUpdateLookup}
                isUpdating={isUpdating}
              />
            ),
          )
        )}
      </div>

      <ConfirmationModal
        isOpen={updateConfirm.isOpen}
        title={updateConfirm.pending?.title}
        message={updateConfirm.pending?.message}
        confirmButtonText="Update"
        onConfirm={updateConfirm.resolveAsked}
        onClose={updateConfirm.close}
      />
    </>
  );
};

export default LookupManagementExtractionContext;
