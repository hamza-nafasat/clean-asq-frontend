import { useEffect, useState } from "react";
import { useGetAllPromptsQuery, useGetAllSearchStrategiesQuery, useUpdatePromptMutation } from "@/redux/apis/form.apis";
import { FaRegEye } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import LookupManagementExtractionCards from "./LookupManagementExtractionCards";
import {
  EXTRACTION_SECTION_CARDS,
  EXTRACTION_TABS,
  OUTPUT_FORMAT_SECTION_ID,
  PROMPT_NAMES,
} from "@/modules/lookupManagement/utils/lookupManagement.constants";
import { buildFullPrompt, generateExtractionDetails } from "@/modules/lookupManagement/utils/lookupManagement.utils";

const initialPrompts = Object.values(PROMPT_NAMES).reduce((acc, name) => ({ ...acc, [name]: "" }), {});

const closeEdit = (_name, _prompt, _id, setIsEdit) => setIsEdit(false);

const LookupManagementExtractionContext = () => {
  const [activeTab, setActiveTab] = useState(EXTRACTION_TABS.EDIT);
  const { data: promptsData, isLoading, refetch } = useGetAllPromptsQuery();
  const { data: searchStrategyData } = useGetAllSearchStrategiesQuery();
  const [extractionPrompt, setExtractionPrompt] = useState("");
  const [fullPrompt, setFullPrompt] = useState("");
  const [updatePrompt] = useUpdatePromptMutation();
  const [prompts, setPrompts] = useState(initialPrompts);

  const updatePrompts = async (name, prompt, id, setIsEdit) => {
    if (!name || !prompt) return toast.error("Please enter a name and prompt");
    try {
      const res = await updatePrompt({ name, prompt, section: id }).unwrap();
      if (res.success) toast.success(res.message);
      await refetch();
    } catch (error) {
      console.error("Update prompt error:", error);
      toast.error(error?.data?.message || "Error while updating prompt");
    } finally {
      setIsEdit?.(false);
    }
  };

  // generation toasts on missing data, so it stays in an effect
  useEffect(() => {
    if (promptsData?.data && !isLoading) {
      promptsData?.data?.forEach((prompt) => {
        setPrompts((prevState) => ({
          ...prevState,
          [prompt.name]: prompt.prompt,
        }));
      });
      if (searchStrategyData?.data) {
        setExtractionPrompt(generateExtractionDetails(searchStrategyData?.data));
        setFullPrompt(buildFullPrompt([...promptsData.data], [...searchStrategyData.data]));
      }
    }
  }, [isLoading, promptsData, searchStrategyData?.data]);

  if (isLoading) return <CustomLoading />;

  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-textPrimary text-3xl font-bold">Manage Extraction Context</h2>
          <p className="text-textPrimary text-base">
            Configure the Perplexity AI prompt sections for intelligent data extraction
          </p>
          <p className="text-textPrimary text-base">Last updated: 8/11/2025, 8:06:04 AM</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Button icon={FiEdit} label="Edit Sections" onClick={() => setActiveTab(EXTRACTION_TABS.EDIT)} />
          </div>
          <div>
            <Button icon={FaRegEye} label="Preview Full Prompt" onClick={() => setActiveTab(EXTRACTION_TABS.PREVIEW)} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === EXTRACTION_TABS.EDIT && (
        <div className="mt-8 flex flex-col gap-8">
          {EXTRACTION_SECTION_CARDS.map(({ id, title, label, subtitle }) =>
            id === OUTPUT_FORMAT_SECTION_ID ? (
              <LookupManagementExtractionCards
                key={id}
                title={title}
                section={`Section ${id}`}
                id={id}
                subtitle={subtitle}
                prompt={extractionPrompt}
                handler={closeEdit}
              />
            ) : (
              <LookupManagementExtractionCards
                key={id}
                title={title}
                section={`Section ${id}`}
                id={id}
                label={label}
                subtitle={subtitle}
                prompt={prompts?.[label]}
                handler={updatePrompts}
                setPrompts={setPrompts}
              />
            ),
          )}
        </div>
      )}

      {activeTab === EXTRACTION_TABS.PREVIEW && (
        <div className="mt-8 flex flex-col gap-8">
          <LookupManagementExtractionCards
            title="Complete Extraction Prompt"
            section=""
            subtitle="This is the complete prompt that will be sent to OpenAI for data extraction (all sections with dynamic content resolved)"
            prompt={fullPrompt}
            handler={closeEdit}
            isPreview={true}
          />
        </div>
      )}
    </div>
  );
};

export default LookupManagementExtractionContext;
