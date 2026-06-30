import ExtractionContextCards from '@/components/admin/extractionContext/ExtractionContextCards';
import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { useGetAllPromptsQuery, useGetAllSearchStrategiesQuery, useUpdatePromptMutation } from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

function ExtractionContext() {
  const [activeTab, setActiveTab] = useState('edit');
  const { data: promptsData, isLoading, refetch } = useGetAllPromptsQuery();
  const { data: searchStrategyData } = useGetAllSearchStrategiesQuery();
  const [extractionPrompt, setExtractionPrompt] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [updatePrompt] = useUpdatePromptMutation();
  const [prompts, setPrompts] = useState({
    system_context: '',
    extraction_task: '',
    output_format: '',
    extraction_guidelines: '',
    search_results_header: '',
    closing_instruction: '',
  });

  const updatePrompts = async (name, prompt, id, setIsEdit) => {
    if (!name || !prompt) return toast.error('Please enter a name and prompt');
    try {
      const res = await updatePrompt({ name, prompt, section: id }).unwrap();
      if (res.success) toast.success(res.message);
      await refetch();
      console.log('res update', res);
    } catch (error) {
      console.log('error while updating prompt', error);
      toast.error(error?.data?.message || 'Error while updating prompt');
    } finally {
      if (setIsEdit) setIsEdit(false);
    }
  };

  // function for create extraction details
  const generateExtractionDetails = strategiesData => {
    if (!strategiesData) return toast.error('No search strategies found. Please configure search strategies first.');

    // Filter active strategies with extraction prompts
    const activeStrategiesWithPrompts = strategiesData
      ?.filter(
        strategy =>
          strategy?.isActive &&
          strategy?.extractionPrompt &&
          strategy?.extractionPrompt.trim() !== '' &&
          strategy.extractAs !== 'No output'
      )
      .sort((a, b) => a.order - b.order);

    if (activeStrategiesWithPrompts.length === 0) {
      return toast.error(
        'No active search strategies with extraction prompts found. Please configure search strategies first.'
      );
    }

    // Build extraction instructions
    const instructions = activeStrategiesWithPrompts
      .map((strategy, index) => {
        const extractType = strategy?.extractAs || 'Simple text';
        return `${index + 1}. **${strategy?.searchObjectKey}** (Extract as: ${extractType})
   ${strategy?.extractionPrompt}`;
      })
      .join('\n\n');

    // Build required JSON format with both value and source fields
    const jsonFields = activeStrategiesWithPrompts.reduce((acc, strategy) => {
      const fieldName = strategy?.searchObjectKey;
      const extractType = strategy?.extractAs || 'Simple text';

      let fieldType = 'string';
      let exampleValue = 'example text';

      switch (extractType) {
        case 'Number':
          fieldType = 'number';
          exampleValue = '123';
          break;
        case 'List':
          fieldType = 'array of strings';
          exampleValue = '["item1", "item2", "item3"]';
          break;
        case 'Address':
          fieldType = 'string (formatted address)';
          exampleValue = '123 Main St, City, State 12345';
          break;
        case 'Date':
          fieldType = 'string (ISO date format)';
          exampleValue = '2025-01-07';
          break;
        default:
          fieldType = 'string';
          exampleValue = 'example text';
      }

      // Add both value and source fields
      acc[fieldName] = exampleValue;
      acc[`${fieldName}_source`] =
        "Copy the exact 'Title Source Attribution' or 'Snippet Source Attribution' text from the search evidence where you found this information";

      return acc;
    }, {});

    const jsonFormat = JSON.stringify(jsonFields, null, 2);

    return `**EXTRACTION INSTRUCTIONS:**

${instructions}

**REQUIRED JSON OUTPUT FORMAT:**

You MUST return a JSON object using the EXACT field names specified below. Do not rename or modify field names:

\`\`\`json
${jsonFormat}
\`\`\`

**CRITICAL FORMATTING REQUIREMENTS:**
- YOU MUST use the EXACT field names shown in the JSON structure above
- For each data field (e.g., "legalname"), provide both the value and source:
  * Main field: Contains the actual extracted value (e.g., "legalname": "Company Inc.")
  * Source field: Copy the EXACT "Title Source Attribution" or "Snippet Source Attribution" text from the search evidence
- Source attribution examples:
  * From title: "Google search, company legal name, result 1 (https://example.com), title"
  * From snippet: "Google search, employee count, result 3 (https://example.com), snippet"
  * From website: "Website, contact-us page"
  * If not found: "Not found"
- DO NOT modify or create your own source attribution format - copy exactly from the search evidence
- For missing information, use "unknown" for value and "Not found" for source
- For List/Array fields, always return an array even if only one item is found
- For Number fields, return actual numbers, not strings
- For Date fields, use ISO format (YYYY-MM-DD) when possible
- Ensure all JSON is properly formatted and valid
- FIELD NAMES MUST BE EXACTLY AS SPECIFIED - NO VARIATIONS ALLOWED

**EXTRACTION COUNT:** ${activeStrategiesWithPrompts?.length} fields to extract from search results.`;
  };

  const buildFullPrompt = useCallback((promptData, strategiesData) => {
    if (!promptData || !strategiesData) return toast.error('promptData or strategiesData is empty');

    return promptData
      ?.sort((a, b) => Number(a?.section) - Number(b?.section))
      .map(doc => {
        let content = doc.prompt;
        // Replace dynamic placeholders with actual content
        content = content.replace('{companyName}', 'Test Company');
        // For output_format section, generate the actual extraction details
        if (doc.name === 'output_format') {
          content = generateExtractionDetails(strategiesData);
        }
        // Replace dynamic extraction details in other sections
        content = content.replace('{dynamicExtractionDetails}', generateExtractionDetails(strategiesData));
        return content;
      })
      .join('\n\n');
  }, []);

  useEffect(() => {
    if (promptsData?.data && !isLoading) {
      promptsData?.data?.forEach(prompt => {
        setPrompts(prevState => ({
          ...prevState,
          [prompt.name]: prompt.prompt,
        }));
      });
      if (searchStrategyData?.data) {
        const res = generateExtractionDetails(searchStrategyData?.data);
        setExtractionPrompt(res);
      }

      if (promptsData?.data && !isLoading && searchStrategyData?.data) {
        const fullPrompt = buildFullPrompt([...promptsData.data], [...searchStrategyData.data]);
        setFullPrompt(fullPrompt);
      }
    }
  }, [buildFullPrompt, isLoading, promptsData, searchStrategyData?.data]);

  return isLoading ? (
    <CustomLoading />
  ) : (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-textPrimary text-3xl font-bold">Manage Extraction Context</div>
          <div className="text-textPrimary text-base">
            Configure the Perplexity AI prompt sections for intelligent data extraction
          </div>
          <div className="text-textPrimary text-base">Last updated: 8/11/2025, 8:06:04 AM</div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Button icon={FiEdit} label={'Edit Sections'} onClick={() => setActiveTab('edit')} />
          </div>
          <div>
            <Button icon={FaRegEye} label={'Preview Full Prompt'} onClick={() => setActiveTab('preview')} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === 'edit' && (
        <div className="mt-8 flex flex-col gap-8">
          <ExtractionContextCards
            title={'System Context'}
            section={'Section 1'}
            id="1"
            label={'system_context'}
            subtitle={'Sets the role and expertise for Perplexity AI'}
            prompt={prompts?.system_context}
            handler={updatePrompts}
            setPrompts={setPrompts}
          />
          <ExtractionContextCards
            title={'Extraction Task'}
            section={'Section 2'}
            id="2"
            label={'extraction_task'}
            subtitle={'Main instruction and company context'}
            prompt={prompts?.extraction_task}
            handler={updatePrompts}
            setPrompts={setPrompts}
          />
          <ExtractionContextCards
            title={'Output Format'}
            section={'Section 3'}
            id="3"
            subtitle={'JSON structure and field specifications'}
            prompt={extractionPrompt}
            handler={(one, two, id, setIsEdit) => {
              setIsEdit(false);
            }}
          />
          <ExtractionContextCards
            title={'Extraction Guidelines'}
            section={'Section 4'}
            id="4"
            subtitle={'Rules and standards for data extraction'}
            prompt={prompts?.extraction_guidelines}
            label={'extraction_guidelines'}
            handler={updatePrompts}
            setPrompts={setPrompts}
          />
          <ExtractionContextCards
            title={'Search Results Header'}
            section={'Section 5'}
            id="5"
            subtitle={'Introduction to the search evidence section'}
            prompt={prompts?.search_results_header}
            label={'search_results_header'}
            handler={updatePrompts}
            setPrompts={setPrompts}
          />
          <ExtractionContextCards
            title={'Closing Instruction'}
            section={'Section 6'}
            id="6"
            subtitle={'Final directive for JSON output'}
            prompt={prompts?.closing_instruction}
            label={'closing_instruction'}
            handler={updatePrompts}
            setPrompts={setPrompts}
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="mt-8 flex flex-col gap-8">
          <ExtractionContextCards
            title={'Complete Extraction Prompt'}
            section={''}
            subtitle={
              'This is the complete prompt that will be sent to OpenAI for data extraction (all sections with dynamic content resolved)'
            }
            prompt={fullPrompt}
            handler={(one, two, id, setIsEdit) => {
              setIsEdit(false);
            }}
            isPreview={true}
          />
        </div>
      )}
    </div>
  );
}

export default ExtractionContext;
