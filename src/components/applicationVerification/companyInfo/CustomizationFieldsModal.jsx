import MakeFieldDataCustom from '@/components/shared/MakeFieldDataCustom';
import Checkbox from '@/components/shared/small/Checkbox';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import {
  useFormateTextInMarkDownMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormSectionMutation,
} from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

function CustomizationFieldsModal({ onClose, fields, sectionId, formRefetch, suggestions, isArticleForm, section }) {
  const [fieldsData, setFieldsData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [signatureData, setSignatureData] = useState({
    isSignature: section?.isSignature || false,
    isSignDisplayText: section?.isSignDisplayText || false,
    isSignAiHelp: section?.isSignAiHelp || false,
    signFormatedDisplayText: section?.signDisplayText || '',
    signDisplayText: '',
    signAiPrompt: section?.signAiPrompt || '',
    signAiResponse: section?.signAiResponse || '',
    formatingAiInstruction: '',
  });
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [signatureEnabling, setSignatureEnabling] = useState(false);

  const handleUpdateSectionForSignature = async () => {
    setSignatureEnabling(true);
    try {
      const res = await updateSection({
        _id: sectionId,
        data: {
          isSignature: signatureData.isSignature,
          isSignDisplayText: signatureData.isSignDisplayText,
          isSignAiHelp: signatureData.isSignAiHelp,
          signDisplayText: signatureData.signFormatedDisplayText,
          signAiPrompt: signatureData.signAiPrompt,
          signAiResponse: signatureData.signAiResponse,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error while updating signature', error);
    } finally {
      setSignatureEnabling(false);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signDisplayText || !signatureData?.formatingAiInstruction) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signDisplayText,
        instructions: signatureData?.formatingAiInstruction,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setSignatureData(prev => ({ ...prev, signFormatedDisplayText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [formateTextInMarkDown, signatureData?.formatingAiInstruction, signatureData.signDisplayText]);

  const getResponseFromAi = useCallback(async () => {
    if (!signatureData?.signAiPrompt) {
      return toast.error('Please enter formatting instruction and text to format');
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData?.signAiPrompt,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        //  update ai_response
        setSignatureData(prev => ({ ...prev, signAiResponse: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [formateTextInMarkDown, signatureData?.signAiPrompt]);

  const addNewFieldHandler = () => setFieldsData(prev => [...prev, { label: '', name: '', type: 'text' }]);

  const saveFormHandler = async fieldsData => {
    try {
      const res = await customizeForm({ sectionId, fieldsData }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        onClose();
      }
    } catch (error) {
      console.log('Error while updating form fields', error);
    }
  };

  useEffect(() => {
    if (fields?.length > 0) {
      setFieldsData(fields);
    }
  }, [fields]);

  return (
    <>
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustom
              isArticleForm={isArticleForm}
              field={field}
              fieldsData={fieldsData}
              setFieldsData={setFieldsData}
              index={index}
              suggestions={suggestions}
            />
          </div>
        ))}
      {/* signature Data  */}
      <div className="flex flex-col gap-2 border-2 p-2 pb-4">
        <div className="flex gap-2 pb-4">
          <Checkbox
            id="signature"
            label="Enable Signature for this section"
            checked={signatureData?.isSignature}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? 'pointer-events-none opacity-30' : ''}`}
            onChange={e => setSignatureData(prev => ({ ...prev, isSignature: e.target.checked }))}
          />
          <Checkbox
            id="displayText"
            label="Is Dispaly Text"
            checked={signatureData?.isSignDisplayText}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? 'pointer-events-none opacity-30' : ''}`}
            onChange={e => setSignatureData(prev => ({ ...prev, isSignDisplayText: e.target.checked }))}
          />
          <Checkbox
            id="aiHelp"
            label="Enable AI Help"
            checked={signatureData?.isSignAiHelp}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? 'pointer-events-none opacity-30' : ''}`}
            onChange={e => setSignatureData(prev => ({ ...prev, isSignAiHelp: e.target.checked }))}
          />
        </div>
        {/* display text  */}
        {signatureData?.isSignDisplayText && (
          <div className="flex w-full flex-col gap-2 pb-4">
            <TextField
              label="Display Text"
              value={signatureData?.signDisplayText}
              name="displayText"
              onChange={e => setSignatureData(prev => ({ ...prev, signDisplayText: e.target.value }))}
            />
            <label htmlFor="formattingInstructionForAi">
              Enter formatting instruction for AI and click on generate
            </label>
            <textarea
              id="formattingInstructionForAi"
              rows={2}
              value={signatureData?.formatingAiInstruction}
              onChange={e => setSignatureData(prev => ({ ...prev, formatingAiInstruction: e.target.value }))}
              className="w-full rounded-md border border-gray-300 p-2 outline-none"
            />
            <div className="flex justify-end">
              <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8">
                Format Text
              </Button>
            </div>
            {signatureData?.signFormatedDisplayText && (
              <div
                className="h-full bg-amber-100 p-4"
                dangerouslySetInnerHTML={{ __html: signatureData?.signFormatedDisplayText ?? '' }}
              />
            )}
          </div>
        )}
        {/* aiHelp  */}
        {signatureData?.isSignAiHelp && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <TextField
                label="AI Prompt"
                value={signatureData?.signAiPrompt}
                name="aiPrompt"
                onChange={e => setSignatureData(prev => ({ ...prev, signAiPrompt: e.target.value }))}
              />
              <Button onClick={getResponseFromAi} disabled={isFormating} className="bg-primary mt-8 text-white">
                Generate
              </Button>
            </div>
            {signatureData?.signAiResponse && (
              <div className="w-full flex-col py-4">
                <h6 className="text-textPrimary py-2 text-xl font-semibold">AI Response</h6>
                <div
                  className="h-full bg-amber-100 p-4"
                  dangerouslySetInnerHTML={{ __html: signatureData?.signAiResponse ?? '' }}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex w-full">
          <Button
            onClick={handleUpdateSectionForSignature}
            disabled={isUpdatingSection}
            className="bg-primary mt-8 w-full text-white"
          >
            Update Signature Data
          </Button>
        </div>
      </div>
      <div className="mt-6 flex w-full items-center justify-between gap-2">
        {!isArticleForm && (
          <Button className="bg-primary w-[45%] cursor-pointer text-white" onClick={addNewFieldHandler}>
            Add New Field
          </Button>
        )}
        <Button
          onClick={() => saveFormHandler(fieldsData)}
          disabled={isLoading}
          className={`bg-primary cursor-pointer text-white ${isArticleForm ? 'w-full' : 'w-[45%]'}`}
        >
          Save Form
        </Button>
      </div>
    </>
  );
}

export default CustomizationFieldsModal;
