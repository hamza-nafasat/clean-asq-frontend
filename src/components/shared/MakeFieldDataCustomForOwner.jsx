import Checkbox from '@/components/shared/small/Checkbox';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import { FIELD_TYPES } from '@/data/constants';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';
import React, { useCallback, useState } from 'react';
import { MdOutlineRestore } from 'react-icons/md';
import { toast } from 'react-toastify';

const MakeFieldDataCustomForOwner = ({ originalFieldData, fieldsData, setFieldsData, index }) => {
  const field = fieldsData[index] || {};
  const [formattingInstructionForAi, setFormattingInstructionForAi] = useState('');
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();

  const revertBackToOriginalData = useCallback(
    name => {
      const originalData = originalFieldData?.[index]?.[name];
      setFieldsData(prev =>
        prev.map((item, idx) =>
          idx !== index
            ? item
            : {
                ...item,
                [name]: originalData,
              }
        )
      );
    },
    [setFieldsData, index, originalFieldData]
  );
  const updateFieldDataField = useCallback(
    (e, isCheckbox) => {
      const { name, value, checked } = e.target;
      setFieldsData(prev =>
        prev.map((item, idx) =>
          idx !== index
            ? item
            : {
                ...item,
                [name]: isCheckbox ? checked : value,
              }
        )
      );
    },
    [setFieldsData, index]
  );

  const updateFieldDataFieldForOptions = useCallback(
    (e, optionIndex) => {
      const { name, value } = e.target;
      setFieldsData(prev =>
        prev.map((item, idx) =>
          idx !== index
            ? item
            : {
                ...item,
                options: item.options.map((opt, i) => (i !== optionIndex ? opt : { ...opt, [name]: value })),
              }
        )
      );
    },
    [setFieldsData, index]
  );

  const formateTextWithAi = useCallback(async () => {
    const textForDisplay = field.displayText || '';
    if (!formattingInstructionForAi || !textForDisplay) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: textForDisplay,
        instructions: formattingInstructionForAi,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setFieldsData(prev => prev.map((item, idx) => (idx !== index ? item : { ...item, ai_formatting: html })));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [formattingInstructionForAi, field.displayText, formateTextInMarkDown, index, setFieldsData]);
  const getResponseFromAi = useCallback(async () => {
    const aiPrompt = field.aiPrompt || '';
    if (!aiPrompt) {
      return toast.error('Please enter formatting instruction and text to format');
    }
    try {
      const res = await formateTextInMarkDown({
        text: aiPrompt,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        //  update ai_response
        setFieldsData(prev => prev.map((item, idx) => (idx !== index ? item : { ...item, aiResponse: html })));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [field.aiPrompt, formateTextInMarkDown, index, setFieldsData]);

  const simpleFieldType = [
    FIELD_TYPES.TEXT,
    FIELD_TYPES.NUMBER,
    FIELD_TYPES.EMAIL,
    FIELD_TYPES.PASSWORD,
    FIELD_TYPES.TEXTAREA,
  ].includes(field.type);
  const radioFieldType = field.type === FIELD_TYPES.RADIO;
  const selectFieldType = field.type === FIELD_TYPES.SELECT;
  const rangeFieldType = field.type === FIELD_TYPES.RANGE;
  const multiCheckbox = field.type === FIELD_TYPES.MULTI_CHECKBOX;

  return (
    <div className="flex flex-col gap-4 p-2 pb-2">
      <h2 className="text-Primary text-lg font-semibold">{String(field.label).toUpperCase()}</h2>
      <div className="flex flex-col gap-3">
        {/* Label & Name */}
        <div className="flex items-center justify-between gap-2">
          <TextField label="Change label" value={field.label} name="label" onChange={updateFieldDataField} />
          <TextField
            label="Change Field Name"
            value={field.name}
            name="name"
            onChange={updateFieldDataField}
            rightIcon={originalFieldData?.[index]?.name ? <MdOutlineRestore /> : null}
            cnRight="cursor-pointer! text-red-500! hover:text-red-600! font-bold!"
            onClickRightIcon={originalFieldData?.[index]?.name ? () => revertBackToOriginalData('name') : null}
          />
        </div>
        {/* Field Type & Placeholder */}
        <div className="flex items-center justify-between gap-2">
          {(simpleFieldType || selectFieldType) && (
            <TextField
              label="Change Placeholder"
              value={field.placeholder || ''}
              name="placeholder"
              onChange={updateFieldDataField}
            />
          )}
        </div>
        {/* Range settings */}
        {rangeFieldType && (
          <div className="flex w-full items-center gap-2">
            {['minValue', 'maxValue', 'defaultValue'].map(key => (
              <TextField
                key={key}
                label={key === 'minValue' ? 'Min Value' : key === 'maxValue' ? 'Max Value' : 'Default Value'}
                value={field[key] || 0}
                name={key}
                onChange={updateFieldDataField}
              />
            ))}
          </div>
        )}
        {/* Required & AI help toggles */}
        <div className="flex w-full items-center gap-2">
          <Checkbox
            label="Is Required"
            checked={field.required}
            name="required"
            onChange={e => updateFieldDataField(e, true)}
          />
          <Checkbox
            label="Enable AI Help"
            checked={field.aiHelp}
            name="aiHelp"
            onChange={e => updateFieldDataField(e, true)}
          />
          <Checkbox
            label="Enable Display Text"
            checked={field.isDisplayText}
            name="isDisplayText"
            onChange={e => updateFieldDataField(e, true)}
          />
        </div>
        {/* AI prompt & response */}
        {field?.aiHelp && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <TextField label="AI Prompt" value={field.aiPrompt} name="aiPrompt" onChange={updateFieldDataField} />
              <Button onClick={getResponseFromAi} disabled={isLoading} className="bg-primary mt-8 text-white">
                Generate
              </Button>
            </div>
            {field?.aiResponse && (
              <div className="w-full flex-col py-4">
                <h6 className="text-textPrimary py-2 text-xl font-semibold">AI Response</h6>
                <div
                  className="h-full bg-amber-100 p-4"
                  dangerouslySetInnerHTML={{ __html: field?.aiResponse ?? '' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Options for radio/select/multi-checkbox */}
        {(radioFieldType || selectFieldType || multiCheckbox) && (
          <div className="flex flex-col gap-2">
            <p className="text-textPrimary text-lg font-semibold">Options</p>
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextField
                  label={`Option ${i + 1} Label`}
                  value={opt.label}
                  name="label"
                  onChange={e => updateFieldDataFieldForOptions(e, i)}
                />
                <TextField label={`Option ${i + 1} Value`} value={opt.value} name="value" />
              </div>
            ))}
          </div>
        )}
        {/* Display text & AI formatting */}
        {field.isDisplayText && (
          <div className="flex w-full flex-col gap-2">
            <TextField
              label="Display Text"
              value={field.displayText}
              name="displayText"
              onChange={updateFieldDataField}
            />
            <label htmlFor="formattingInstructionForAi">
              Enter formatting instruction for AI and click on generate
            </label>
            <textarea
              id="formattingInstructionForAi"
              rows={2}
              value={formattingInstructionForAi}
              onChange={e => setFormattingInstructionForAi(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 outline-none"
            />
            <div className="flex justify-end">
              <Button onClick={formateTextWithAi} disabled={isLoading} className="mt-8">
                Format Text
              </Button>
            </div>
            {field.ai_formatting && (
              <div
                className="h-full bg-amber-100 p-4"
                dangerouslySetInnerHTML={{ __html: field?.ai_formatting ?? '' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MakeFieldDataCustomForOwner);
