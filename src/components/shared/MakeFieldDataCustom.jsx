// import ConfirmationModal from '@/components/shared/ConfirmationModal';
// import Checkbox from '@/components/shared/small/Checkbox';
// import TextField from '@/components/shared/small/TextField';
// import { Button } from '@/components/ui/button';
// import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
// import { Rewind, TrashIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import Markdown from 'react-markdown';
// import { toast } from 'react-toastify';

// const MakeFieldDataCustom = ({ fieldsData, setFieldsData, index }) => {
//   const [field, setField] = useState([]);
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [formattingInstructionForAi, setFormattingInstructionForAi] = useState('');
//   const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();

//   const addNewOption = () => {
//     setFieldsData(prev =>
//       prev.map((fieldItem, idx) => {
//         if (idx !== index) return fieldItem;
//         return { ...fieldItem, options: [...(fieldItem.options || []), { label: '', value: '' }] };
//       })
//     );
//   };
//   const removeOption = optionIdx => {
//     setFieldsData(prev =>
//       prev.map((fieldItem, idx) => {
//         if (idx !== index) return fieldItem;
//         return { ...fieldItem, options: fieldItem.options.filter((_, i) => i !== optionIdx) };
//       })
//     );
//   };
//   const updateFieldDataField = (e, checkBox) => {
//     if (checkBox) {
//       setFieldsData(prev =>
//         prev.map((fieldItem, idx) => {
//           if (idx !== index) return fieldItem;
//           return { ...fieldItem, [e.target.name]: e.target.checked };
//         })
//       );
//       return;
//     } else {
//       setFieldsData(prev =>
//         prev.map((fieldItem, idx) => {
//           if (idx !== index) return fieldItem;
//           return { ...fieldItem, [e.target.name]: e.target.value };
//         })
//       );
//     }
//   };
//   const updateFieldDataFieldForOptions = (e, optionIndex) => {
//     setFieldsData(prev =>
//       prev.map((fieldItem, idx) => {
//         if (idx !== index) return fieldItem;
//         return {
//           ...fieldItem,
//           options: fieldItem.options.map((option, i) => {
//             if (i !== optionIndex) return option;
//             return { ...option, [e.target.name]: e.target.value };
//           }),
//         };
//       })
//     );
//   };
//   const handleDeleteField = () => {
//     const updatedFields = [...fieldsData];
//     updatedFields.splice(index, 1);
//     setFieldsData(updatedFields);
//     setConfirmDelete(false);
//   };

//   const formateTextWithAi = async () => {
//     const textForDisplay = field?.displayText ?? '';
//     if (!formattingInstructionForAi || !textForDisplay)
//       toast.error('Please enter formatting instruction and text to format');

//     try {
//       const res = await formateTextInMarkDown({
//         text: textForDisplay,
//         instructions: formattingInstructionForAi,
//       }).unwrap();
//       if (res.success) {
//         setFieldsData(prev =>
//           prev.map((fieldItem, idx) => {
//             if (idx !== index) return fieldItem;
//             return { ...fieldItem, ai_formatting: res.data };
//           })
//         );
//       }
//     } catch (error) {
//       console.error('Error creating user:', error);
//       toast.error(error?.data?.message || 'Failed to create user');
//     }
//   };

//   const simpleFieldType =
//     field.type === 'text' ||
//     field.type === 'number' ||
//     field.type === 'email' ||
//     field.type === 'password' ||
//     field.type === 'textarea';

//   const radioFieldType = field.type === 'radio';
//   const selectFieldType = field.type === 'select';
//   const rangeFieldType = field.type === 'range';
//   const multiCheckbox = field.type === 'multi-checkbox';

//   useEffect(() => {
//     if (fieldsData.length > 0) setField(fieldsData[index]);
//     return () => setField([]);
//   }, [fieldsData, index]);

//   return (
//     <div className="flex flex-col gap-4 p-2 pb-2">
//       <h2 className="text-Primary text-xl font-semibold">{String(field?.name)?.toUpperCase()}</h2>
//       <div className="flex flex-col gap-3">
//         {/* section field label  */}
//         <div className="flex items-center justify-between gap-2">
//           <TextField label="Change label" value={field?.label} name={'label'} onChange={e => updateFieldDataField(e)} />
//           <TextField
//             label="Change Field Name"
//             value={field?.name}
//             name={'name'}
//             onChange={e => updateFieldDataField(e)}
//           />
//         </div>
//         {/* section field type  */}
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex w-full flex-col items-start gap-2">
//             <p className="text-start text-sm lg:text-base">Field Type</p>
//             <div className="w-full rounded-lg border border-gray-300 p-1.5">
//               <select
//                 name="type"
//                 id="type"
//                 className="w-full p-2 outline-none"
//                 value={field?.type}
//                 onChange={e => updateFieldDataField(e)}
//               >
//                 <option value={'text'}>Text</option>
//                 <option value={'number'}>Number</option>
//                 <option value={'email'}>Email</option>
//                 <option value={'password'}>Password</option>
//                 <option value={'radio'}>Radio</option>
//                 <option value={'checkbox'}>Checkbox</option>
//                 <option value={'textarea'}>Textarea</option>
//                 <option value={'range'}>Range</option>
//                 <option value={'select'}>Select</option>
//                 <option value={'multi-checkbox'}>Multi Checkbox</option>
//               </select>
//             </div>
//           </div>
//           {simpleFieldType ||
//             (selectFieldType && (
//               <TextField
//                 label="Change Placeholder"
//                 value={field?.placeholder}
//                 name={'placeholder'}
//                 onChange={e => updateFieldDataField(e)}
//               />
//             ))}
//         </div>
//         {/* section range  min max */}
//         {rangeFieldType && (
//           <div className="flex w-full items-center gap-2">
//             <TextField
//               label="Min Value"
//               value={field?.minValue || 0}
//               name={'minValue'}
//               onChange={e => updateFieldDataField(e)}
//             />
//             <TextField
//               label="Max Value"
//               value={field?.maxValue || 0}
//               name={'maxValue'}
//               onChange={e => updateFieldDataField(e)}
//             />
//             <TextField
//               label="Default Value"
//               value={field?.defaultValue || 0}
//               name={'defaultValue'}
//               onChange={e => updateFieldDataField(e)}
//             />
//           </div>
//         )}
//         {/* section is required and is ai  */}
//         <div className="flex w-full items-center gap-2">
//           <Checkbox
//             label="Is Required"
//             checked={field?.required}
//             name={'required'}
//             type="checkbox"
//             onChange={e => updateFieldDataField(e, true)}
//           />
//           <Checkbox
//             label="is Ai Help Enabled"
//             checked={field?.aiHelp}
//             name={'aiHelp'}
//             type="checkbox"
//             onChange={e => updateFieldDataField(e, true)}
//           />
//           <Checkbox
//             label="Is Display Text"
//             name={'isDisplayText'}
//             type="checkbox"
//             checked={field?.isDisplayText}
//             onChange={e => updateFieldDataField(e, true)}
//           />
//         </div>
//         {/* section ai prompt and ai response  */}
//         {field?.aiHelp && (
//           <div className="flex w-full flex-col items-center gap-2">
//             <div className="flex w-full items-center gap-2">
//               <TextField
//                 label="Ai Prompt"
//                 value={field?.aiPrompt}
//                 name={'aiPrompt'}
//                 onChange={e => updateFieldDataField(e)}
//               />
//               <Button className={'bg-primary mt-8 h-full cursor-pointer text-white'}>Generate</Button>
//             </div>
//             {field?.aiResponse && (
//               <div className="w-ful flex flex-col py-4">
//                 <h6 className="text-textPrimary py-2 text-xl font-semibold">Ai Response</h6>
//                 {/* <div className="border-black-300 border"> */}
//                 <Markdown
//                   components={{
//                     h1: props => <h1 className="mb-6 text-2xl font-medium" {...props} />,
//                     h2: props => <h2 className="mb-6 text-xl font-medium" {...props} />,
//                     h3: props => <h3 className="mb-6 text-lg font-medium" {...props} />,
//                     h4: props => <h4 className="mb-6 text-base font-medium" {...props} />,
//                     p: props => <p className="mb-6 leading-relaxed" {...props} />,
//                     ul: props => <ul className="mb-6 list-inside list-disc" {...props} />,
//                     ol: props => <ol className="mb-6 list-inside list-decimal" {...props} />,
//                     li: props => <li className="mb-1" {...props} />,
//                     strong: props => <strong className="font-semibold" {...props} />,
//                     code: props => <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />,
//                     blockquote: props => <blockquote className="my-2 border-l-4 pl-4 italic" {...props} />,
//                   }}
//                 >
//                   {field?.aiResponse}
//                 </Markdown>
//                 {/* </div> */}
//               </div>
//             )}
//           </div>
//         )}
//         {/* section options  */}
//         {(radioFieldType || selectFieldType || multiCheckbox) && (
//           <div className="flex h-full flex-col gap-2">
//             <p className="text-textPrimary text-lg font-semibold">Options</p>
//             {field?.options?.map((option, index) => (
//               <div key={index} className="flex items-center gap-2">
//                 <TextField
//                   label={`Option ${index + 1} Label`}
//                   value={option.label}
//                   name={'label'}
//                   onChange={e => updateFieldDataFieldForOptions(e, index)}
//                 />
//                 <TextField
//                   name={'value'}
//                   label={`Option ${index + 1} Value1`}
//                   value={option.value}
//                   onChange={e => updateFieldDataFieldForOptions(e, index)}
//                 />
//                 <Button
//                   className={'mt-8 cursor-pointer bg-red-500 hover:bg-red-700'}
//                   onClick={() => removeOption(index)}
//                 >
//                   <TrashIcon className={'h-5 w-5 text-white'} />
//                 </Button>
//               </div>
//             ))}
//             <div className="flex items-center justify-end">
//               <Button className={'mt-4 cursor-pointer'} onClick={addNewOption}>
//                 Add Option
//               </Button>
//             </div>
//           </div>
//         )}
//         {/* section is Display Text  */}
//         <div className="flex w-full items-center gap-2">
//           {field?.isDisplayText && (
//             <div className="flex w-full flex-col">
//               <TextField
//                 label="Display Text"
//                 value={field?.displayText}
//                 name={'displayText'}
//                 onChange={e => updateFieldDataField(e)}
//               />
//               <div className="mt-3 flex flex-col items-start gap-2">
//                 <label htmlFor="formattingInstructionForAi">
//                   Enter formatting instruction for AI and click on generate
//                 </label>
//                 <textarea
//                   name="formattingInstructionForAi"
//                   id="formattingInstructionForAi"
//                   cols="10"
//                   rows="2"
//                   value={formattingInstructionForAi}
//                   onChange={e => setFormattingInstructionForAi(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 p-2 outline-none"
//                 ></textarea>
//                 <div className="flex w-full items-center justify-end">
//                   {' '}
//                   <Button disabled={isLoading} className={`mt-8 cursor-pointer`} onClick={formateTextWithAi}>
//                     Formate Text
//                   </Button>
//                 </div>
//               </div>

//               <div>
//                 {field?.ai_formatting && (
//                   <Markdown
//                     components={{
//                       h1: props => <h1 className="mb-6 text-2xl font-medium" {...props} />,
//                       h2: props => <h2 className="mb-6 text-xl font-medium" {...props} />,
//                       h3: props => <h3 className="mb-6 text-lg font-medium" {...props} />,
//                       h4: props => <h4 className="mb-6 text-base font-medium" {...props} />,
//                       p: props => <p className="mb-6 leading-relaxed" {...props} />,
//                       ul: props => <ul className="mb-6 list-inside list-disc" {...props} />,
//                       ol: props => <ol className="mb-6 list-inside list-decimal" {...props} />,
//                       li: props => <li className="mb-1" {...props} />,
//                       strong: props => <strong className="font-semibold" {...props} />,
//                       code: props => <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />,
//                       blockquote: props => <blockquote className="my-2 border-l-4 pl-4 italic" {...props} />,
//                     }}
//                   >
//                     {field.ai_formatting}
//                   </Markdown>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="flex w-full items-center justify-end">
//         <Button
//           className={'max-w-[200px] cursor-pointer bg-red-600 text-white hover:bg-red-700'}
//           onClick={() => setConfirmDelete(true)}
//         >
//           Delete Field
//         </Button>
//       </div>
//       <p className="border-black-300 border-[4px] border-b border-dashed"></p>
//       <ConfirmationModal
//         isOpen={!!confirmDelete}
//         onClose={() => setConfirmDelete(false)}
//         onConfirm={handleDeleteField}
//         title="Delete Field"
//         message={`Are you sure you want to delete this field?`}
//         confirmButtonText="Delete"
//         confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
//         cancelButtonText="Cancel"
//       />
//     </div>
//   );
// };

// export default MakeFieldDataCustom;

import React, { useState, useCallback } from 'react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import Checkbox from '@/components/shared/small/Checkbox';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import { Rewind, TrashIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'react-toastify';
import { FIELD_TYPES } from '@/data/constants';
import DOMPurify from 'dompurify';

const MakeFieldDataCustom = ({ fieldsData, setFieldsData, index }) => {
  const field = fieldsData[index] || {};
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formattingInstructionForAi, setFormattingInstructionForAi] = useState('');
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();

  const addNewOption = useCallback(() => {
    setFieldsData(prev =>
      prev.map((item, idx) =>
        idx !== index ? item : { ...item, options: [...(item.options || []), { label: '', value: '' }] }
      )
    );
  }, [setFieldsData, index]);

  const removeOption = useCallback(
    optionIdx => {
      setFieldsData(prev =>
        prev.map((item, idx) =>
          idx !== index ? item : { ...item, options: item.options.filter((_, i) => i !== optionIdx) }
        )
      );
    },
    [setFieldsData, index]
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

  const handleDeleteField = useCallback(() => {
    setFieldsData(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setConfirmDelete(false);
  }, [setFieldsData, index]);

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
      <h2 className="text-Primary text-xl font-semibold">{String(field.name).toUpperCase()}</h2>
      <div className="flex flex-col gap-3">
        {/* Label & Name */}
        <div className="flex items-center justify-between gap-2">
          <TextField label="Change label" value={field.label} name="label" onChange={updateFieldDataField} />
          <TextField label="Change Field Name" value={field.name} name="name" onChange={updateFieldDataField} />
        </div>
        {/* Field Type & Placeholder */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full flex-col items-start gap-2">
            <p className="text-start text-sm lg:text-base">Field Type</p>
            <div className="w-full rounded-lg border border-gray-300 p-1.5">
              <select
                name="type"
                value={field.type}
                onChange={updateFieldDataField}
                className="w-full p-2 outline-none"
              >
                {[
                  FIELD_TYPES.TEXT,
                  FIELD_TYPES.NUMBER,
                  FIELD_TYPES.EMAIL,
                  FIELD_TYPES.PASSWORD,
                  FIELD_TYPES.TEXTAREA,
                  FIELD_TYPES.RADIO,
                  FIELD_TYPES.SELECT,
                  FIELD_TYPES.RANGE,
                  FIELD_TYPES.MULTI_CHECKBOX,
                ].map(typeOpt => (
                  <option key={typeOpt} value={typeOpt}>
                    {typeOpt.charAt(0).toUpperCase() + typeOpt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            label="is Ai Help Enabled"
            checked={field.aiHelp}
            name="aiHelp"
            onChange={e => updateFieldDataField(e, true)}
          />
          <Checkbox
            label="Is Display Text"
            checked={field.isDisplayText}
            name="isDisplayText"
            onChange={e => updateFieldDataField(e, true)}
          />
        </div>
        {/* AI prompt & response */}
        {field?.aiHelp && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <TextField label="Ai Prompt" value={field.aiPrompt} name="aiPrompt" onChange={updateFieldDataField} />
              <Button onClick={formateTextWithAi} disabled={isLoading} className="bg-primary mt-8 text-white">
                Generate
              </Button>
            </div>
            {field?.aiResponse && (
              <div className="w-full flex-col py-4">
                <h6 className="text-textPrimary py-2 text-xl font-semibold">Ai Response</h6>
                <Markdown
                  components={{
                    h1: props => <h1 className="mb-6 text-2xl font-medium" {...props} />,
                    h2: props => <h2 className="mb-6 text-xl font-medium" {...props} />,
                    h3: props => <h3 className="mb-6 text-lg font-medium" {...props} />,
                    h4: props => <h4 className="mb-6 text-base font-medium" {...props} />,
                    p: props => <p className="mb-6 leading-relaxed" {...props} />,
                    ul: props => <ul className="mb-6 list-inside list-disc" {...props} />,
                    ol: props => <ol className="mb-6 list-inside list-decimal" {...props} />,
                    li: props => <li className="mb-1" {...props} />,
                    strong: props => <strong className="font-semibold" {...props} />,
                    code: props => <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />,
                    blockquote: props => <blockquote className="my-2 border-l-4 pl-4 italic" {...props} />,
                  }}
                >
                  {field.aiResponse}
                </Markdown>
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
                <TextField
                  label={`Option ${i + 1} Value`}
                  value={opt.value}
                  name="value"
                  onChange={e => updateFieldDataFieldForOptions(e, i)}
                />
                <Button onClick={() => removeOption(i)} className="mt-8 bg-red-500 hover:bg-red-700">
                  <TrashIcon className="h-5 w-5 text-white" />
                </Button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={addNewOption} className="mt-4">
                Add Option
              </Button>
            </div>
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
                Formate Text
              </Button>
            </div>
            {field.ai_formatting && (
              // <Markdown
              //   components={{
              //     h1: props => <h1 className="mb-6 text-2xl font-medium" {...props} />,
              //     h2: props => <h2 className="mb-6 text-xl font-medium" {...props} />,
              //     h3: props => <h3 className="mb-6 text-lg font-medium" {...props} />,
              //     h4: props => <h4 className="mb-6 text-base font-medium" {...props} />,
              //     p: props => <p className="mb-6 leading-relaxed" {...props} />,
              //     ul: props => <ul className="mb-6 list-inside list-disc" {...props} />,
              //     ol: props => <ol className="mb-6 list-inside list-decimal" {...props} />,
              //     li: props => <li className="mb-1" {...props} />,
              //     strong: props => <strong className="font-semibold" {...props} />,
              //     code: props => <code className="rounded bg-gray-100 px-1 py-0.5" {...props} />,
              //     blockquote: props => <blockquote className="my-2 border-l-4 pl-4 italic" {...props} />,
              //   }}
              // >
              //   {field.ai_formatting}
              // </Markdown>

              <div
                className="h-full bg-amber-100 p-4"
                dangerouslySetInnerHTML={{ __html: field?.ai_formatting ?? '' }}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex w-full justify-end">
        <Button onClick={() => setConfirmDelete(true)} className="max-w-[200px] bg-red-600 text-white hover:bg-red-700">
          Delete Field
        </Button>
      </div>
      <ConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteField}
        title="Delete Field"
        message="Are you sure you want to delete this field?"
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 hover:bg-red-600 text-white"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default React.memo(MakeFieldDataCustom);
