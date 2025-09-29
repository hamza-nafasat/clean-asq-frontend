import { useFormateTextInMarkDownMutation, useUpdateFormSectionMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import TextField from './TextField';
import Button from './Button';

const EditSectionDisplayTextFromatingModal = ({ step }) => {
  const [displayText, setDisplayText] = useState(step.displayText || '');
  const [formattingInstructionForAi, setFormattingInstructionForAi] = useState('');
  const [aiFormatting, setAiFormatting] = useState(step.ai_formatting || '');
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const formateTextWithAi = useCallback(async () => {
    if (!formattingInstructionForAi || !displayText) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayText,
        instructions: formattingInstructionForAi,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setAiFormatting(html);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [formattingInstructionForAi, displayText, formateTextInMarkDown]);

  const updateFormSectionHandler = async () => {
    try {
      if (!displayText || !aiFormatting) return toast.error('Please enter display text and AI formatting');
      const res = await updateFormSection({
        _id: step._id,
        data: { displayText, aiFormatting: aiFormatting },
      }).unwrap();
      if (res.success) {
        toast.success('Section Updated Successfully');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update section');
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <TextField
        type="text"
        label="Display Text"
        value={displayText}
        placeholder="Enter display text"
        name="displayText"
        onChange={e => setDisplayText(e.target.value)}
        autoComplete="off"
      />
      <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
      <textarea
        id="formattingInstructionForAi"
        rows={2}
        placeholder="Enter formatting instruction for AI"
        value={formattingInstructionForAi}
        onChange={e => setFormattingInstructionForAi(e.target.value)}
        className="w-full rounded-md border border-gray-300 p-2 outline-none"
      />
      <div className="flex justify-end">
        <Button onClick={formateTextWithAi} disabled={isLoading} className="mt-8" label="Formate Text" />
      </div>
      {aiFormatting && <div className="h-full p-4" dangerouslySetInnerHTML={{ __html: aiFormatting ?? '' }} />}
      <Button onClick={updateFormSectionHandler} disabled={isUpdating} className="mt-8" label="Save" />
    </div>
  );
};

export { EditSectionDisplayTextFromatingModal };
