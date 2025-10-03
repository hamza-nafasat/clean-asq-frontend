import MakeFieldDataCustomForOwner from '@/components/shared/MakeFieldDataCustomForOwner';
import Checkbox from '@/components/shared/small/Checkbox';
import { Button } from '@/components/ui/button';
import {
  useFormateTextInMarkDownMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormSectionMutation,
} from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import TextField from '@/components/shared/small/TextField';

function CustomizationOwnerFieldsModal({ onClose, fields, blocks, sectionId, formRefetch, section }) {
  const [fieldsData, setFieldsData] = useState([]);
  const [blockFieldsData, setBlockFieldsData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [signatureEnabling, setSignatureEnabling] = useState(false);
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
        setSignatureData(prev => ({ ...prev, signAiResponse: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [formateTextInMarkDown, signatureData?.signAiPrompt]);

  const saveFormHandler = async () => {
    try {
      const res = await customizeForm({ sectionId, ownerFieldsData: [...fieldsData, ...blockFieldsData] }).unwrap();
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
    if (blocks?.length > 0) {
      const allFieldsData = [];
      blocks?.forEach(block => {
        block?.fields?.forEach(field => {
          allFieldsData.push(field);
        });
      });
      setBlockFieldsData(allFieldsData);
    }
  }, [blocks, fields]);

  let fieldIndex = 0;

  return (
    <>
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustomForOwner fieldsData={fieldsData} setFieldsData={setFieldsData} index={index} />
          </div>
        ))}
      {blocks?.length > 0 && (
        <div className="my-6 bg-[#E0E0E0] p-4">
          <h3 className="bg-primary py-2 text-center text-2xl font-medium text-white">Update Fields For Blocks</h3>
          <div className="flex flex-col gap-8">
            {blocks?.map((block, index) => {
              return (
                <div key={index} className="my-5 bg-yellow-50 py-2">
                  <p className="text-textPrimary text-center text-2xl font-medium capitalize">
                    {block?.name?.replaceAll('_', ' ')}
                  </p>
                  <p className="text-center text-base font-normal">{block?.description}</p>
                  {block?.fields?.map((f, i) => {
                    if (i !== index) fieldIndex++;
                    return (
                      <div key={i} className="mt-6 flex flex-col gap-4">
                        <MakeFieldDataCustomForOwner
                          fieldsData={blockFieldsData}
                          setFieldsData={setBlockFieldsData}
                          index={fieldIndex}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            label="Enable Ai Help"
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
                label="Ai Prompt"
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
                <h6 className="text-textPrimary py-2 text-xl font-semibold">Ai Response</h6>
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
      <div className="mt-6 flex w-full justify-between gap-2">
        <Button
          onClick={() => saveFormHandler([...fieldsData])}
          disabled={isLoading}
          className={`bg-primary w-full cursor-pointer text-white`}
        >
          Save Form
        </Button>
      </div>
    </>
  );
}

export default CustomizationOwnerFieldsModal;
