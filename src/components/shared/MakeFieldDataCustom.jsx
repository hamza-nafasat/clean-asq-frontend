import ConfirmationModal from '@/components/shared/ConfirmationModal';
import Checkbox from '@/components/shared/small/Checkbox';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

const MakeFieldDataCustom = ({ fieldsData, setFieldsData, index }) => {
  const [field, setField] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const addNewOption = () => {
    setFieldsData(prev =>
      prev.map((fieldItem, idx) => {
        if (idx !== index) return fieldItem;
        return { ...fieldItem, options: [...(fieldItem.options || []), { label: '', value: '' }] };
      })
    );
  };
  const removeOption = optionIdx => {
    setFieldsData(prev =>
      prev.map((fieldItem, idx) => {
        if (idx !== index) return fieldItem;
        return { ...fieldItem, options: fieldItem.options.filter((_, i) => i !== optionIdx) };
      })
    );
  };
  const updateFieldDataField = (e, checkBox) => {
    if (checkBox) {
      setFieldsData(prev =>
        prev.map((fieldItem, idx) => {
          if (idx !== index) return fieldItem;
          return { ...fieldItem, [e.target.name]: e.target.checked };
        })
      );
      return;
    } else {
      setFieldsData(prev =>
        prev.map((fieldItem, idx) => {
          if (idx !== index) return fieldItem;
          return { ...fieldItem, [e.target.name]: e.target.value };
        })
      );
    }
  };
  const updateFieldDataFieldForOptions = (e, optionIndex) => {
    setFieldsData(prev =>
      prev.map((fieldItem, idx) => {
        if (idx !== index) return fieldItem;
        return {
          ...fieldItem,
          options: fieldItem.options.map((option, i) => {
            if (i !== optionIndex) return option;
            return { ...option, [e.target.name]: e.target.value };
          }),
        };
      })
    );
  };

  const handleDeleteField = () => {
    const updatedFields = [...fieldsData];
    updatedFields.splice(index, 1);
    setFieldsData(updatedFields);
    setConfirmDelete(false);
  };

  const simpleFieldType =
    field.type === 'text' ||
    field.type === 'number' ||
    field.type === 'email' ||
    field.type === 'password' ||
    field.type === 'textarea';

  const radioFieldType = field.type === 'radio';
  const selectFieldType = field.type === 'select';
  const rangeFieldType = field.type === 'range';

  useEffect(() => {
    if (fieldsData.length > 0) setField(fieldsData[index]);
  }, [fieldsData, index]);

  return (
    <div className="flex flex-col gap-4 p-2 pb-2">
      <h2 className="text-Primary text-xl font-semibold">{String(field?.name)?.toUpperCase()}</h2>
      <div className="flex flex-col gap-3">
        {/* section field label  */}
        <div className="flex items-center justify-between gap-2">
          <TextField label="Change label" value={field?.label} name={'label'} onChange={e => updateFieldDataField(e)} />
          <TextField
            label="Change Field Name"
            value={field?.name}
            name={'name'}
            onChange={e => updateFieldDataField(e)}
          />
        </div>
        {/* section field type  */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full flex-col items-start gap-2">
            <p className="text-start text-sm lg:text-base">Field Type</p>
            <div className="w-full rounded-lg border border-gray-300 p-1.5">
              <select
                name="type"
                id="type"
                className="w-full p-2 outline-none"
                value={field?.type}
                onChange={e => updateFieldDataField(e)}
              >
                <option value={'text'}>Text</option>
                <option value={'number'}>Number</option>
                <option value={'email'}>Email</option>
                <option value={'password'}>Password</option>
                <option value={'radio'}>Radio</option>
                <option value={'checkbox'}>Checkbox</option>
                <option value={'textarea'}>Textarea</option>
                <option value={'range'}>Range</option>
                <option value={'select'}>Select</option>
              </select>
            </div>
          </div>
          {simpleFieldType && (
            <TextField
              label="Change Placeholder"
              value={field?.placeholder}
              name={'placeholder'}
              onChange={e => updateFieldDataField(e)}
            />
          )}
        </div>
        {/* section range  min max */}
        {rangeFieldType && (
          <div className="flex w-full items-center gap-2">
            <TextField
              label="Min Value"
              value={field?.minValue || 0}
              name={'minValue'}
              onChange={e => updateFieldDataField(e)}
            />
            <TextField
              label="Max Value"
              value={field?.maxValue || 0}
              name={'maxValue'}
              onChange={e => updateFieldDataField(e)}
            />
            <TextField
              label="Default Value"
              value={field?.defaultValue || 0}
              name={'defaultValue'}
              onChange={e => updateFieldDataField(e)}
            />
          </div>
        )}
        {/* section is required and is ai  */}
        <div className="flex w-full items-center gap-2">
          <Checkbox
            label="Is Required"
            checked={field?.required}
            name={'required'}
            onChange={e => updateFieldDataField(e, true)}
          />
          <Checkbox
            label="is Ai Help Enabled"
            checked={field?.aiHelp}
            name={'aiHelp'}
            onChange={e => updateFieldDataField(e, true)}
          />
        </div>
        {/* section ai prompt and ai response  */}
        {field?.aiHelp && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <TextField
                label="Ai Prompt"
                value={field?.aiPrompt}
                name={'aiPrompt'}
                onChange={e => updateFieldDataField(e)}
              />
              <Button className={'bg-primary mt-8 h-full cursor-pointer text-white'}>Generate</Button>
            </div>
            {field?.aiResponse && (
              <div className="w-ful flex flex-col py-4">
                <h6 className="text-textPrimary py-2 text-xl font-semibold">Ai Response</h6>
                <div className="border-black-300 border">
                  <Markdown>{field?.aiResponse}</Markdown>
                </div>
              </div>
            )}
          </div>
        )}
        {/* section options  */}
        {(radioFieldType || selectFieldType) && (
          <div className="flex h-full flex-col gap-2">
            <p className="text-textPrimary text-lg font-semibold">Options</p>
            {field?.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextField
                  label={`Option ${index + 1} Label`}
                  value={option.label}
                  name={'label'}
                  onChange={e => updateFieldDataFieldForOptions(e, index)}
                />
                <TextField
                  name={'value'}
                  label={`Option ${index + 1} Value1`}
                  value={option.value}
                  onChange={e => updateFieldDataFieldForOptions(e, index)}
                />
                <Button
                  className={'mt-8 cursor-pointer bg-red-500 hover:bg-red-700'}
                  onClick={() => removeOption(index)}
                >
                  <TrashIcon className={'h-5 w-5 text-white'} />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-end">
              <Button className={'mt-4 cursor-pointer'} onClick={addNewOption}>
                Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full items-center justify-end">
        <Button
          className={'max-w-[200px] cursor-pointer bg-red-600 text-white hover:bg-red-700'}
          onClick={() => setConfirmDelete(true)}
        >
          Delete Field
        </Button>
      </div>
      <p className="border-black-300 border-[4px] border-b border-dashed"></p>
      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteField}
        title="Delete Field"
        message={`Are you sure you want to delete this field?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default MakeFieldDataCustom;

// const MakeFieldDataCustom = ({ field, fieldsData, setFieldsData, index }) => {
//   const [placeholder, setPlaceholder] = useState('');
//   const [label, setLabel] = useState('');
//   const [name, setName] = useState('');
//   const [isRequired, setIsRequired] = useState(false);
//   const [fieldType, setFieldType] = useState('text');
//   const [aiHelp, setAiHelp] = useState(false);
//   const [aiPrompt, setAiPrompt] = useState('');
//   const [options, setOptions] = useState([{ label: '', value: '' }]);
//   const [aiResponse, setAiResponse] = useState('');
//   const [minValue, setMinValue] = useState(0);
//   const [maxValue, setMaxValue] = useState(0);
//   const [defaultValue, setDefaultValue] = useState(0);
//   const [confirmDelete, setConfirmDelete] = useState(false);

//   const removeOption = index => {
//     const updatedOptions = [...options];
//     updatedOptions.splice(index, 1);
//     setOptions(updatedOptions);
//   };

//   useEffect(() => {
//     if (field && Object.keys(field).length > 0) {
//       setPlaceholder(field?.placeholder || '');
//       setName(field?.name || '');
//       setLabel(field?.label || '');
//       setIsRequired(field?.required || false);
//       setFieldType(field?.type || 'text');
//       setAiHelp(field?.aiHelp || false);
//       setAiPrompt(field?.aiPrompt || '');
//       setOptions(field?.options || []);
//       setAiResponse(field?.aiResponse || '');
//     }
//   }, [field]);

//   const simpleFieldType =
//     fieldType === 'text' ||
//     fieldType === 'number' ||
//     fieldType === 'email' ||
//     fieldType === 'password' ||
//     fieldType === 'textarea';

//   const radioFieldType = fieldType === 'radio';
//   const selectFieldType = fieldType === 'select';
//   const rangeFieldType = fieldType === 'range';

//   const handleDeleteField = () => {
//     const updatedFields = [...fieldsData];
//     updatedFields.splice(index, 1);
//     setFieldsData(updatedFields);
//     setConfirmDelete(false);
//   };

//   return (
//     <div className="flex flex-col gap-4 p-2 pb-2">
//       <h2 className="text-Primary text-xl font-semibold">{String(field?.name)?.toUpperCase()}</h2>
//       <div className="flex flex-col gap-3">
//         {/* section field label  */}
//         <div className="flex items-center justify-between gap-2">
//           <TextField label="Change label" value={label} onChange={e => setLabel(e.target.value)} />
//           <TextField label="Change Field Name" value={name} onChange={e => setName(e.target.value)} />
//         </div>
//         {/* section field type  */}
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex w-full flex-col items-start">
//             <p className="text-start text-sm lg:text-base">Field Type</p>
//             <div className="w-full rounded-lg border border-gray-300 p-2">
//               <select
//                 name="fieldType"
//                 id="fieldType"
//                 className="w-full p-2 outline-none"
//                 value={fieldType}
//                 onChange={e => setFieldType(e.target.value)}
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
//               </select>
//             </div>
//           </div>
//           {simpleFieldType && (
//             <TextField label="Change Placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} />
//           )}
//         </div>
//         {/* section range  min max */}
//         {rangeFieldType && (
//           <div className="flex w-full items-center gap-2">
//             <TextField label="Min Value" value={minValue} onChange={e => setMinValue(e.target.value)} />
//             <TextField label="Max Value" value={maxValue} onChange={e => setMaxValue(e.target.value)} />
//             <TextField label="Default Value" value={defaultValue} onChange={e => setDefaultValue(e.target.value)} />
//           </div>
//         )}
//         {/* section is required and is ai  */}
//         <div className="flex w-full items-center gap-2">
//           <Checkbox label="Is Required" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
//           <Checkbox label="is Ai Help Enabled" checked={aiHelp} onChange={e => setAiHelp(e.target.checked)} />
//         </div>
//         {/* section ai prompt and ai response  */}
//         {aiHelp && (
//           <div className="flex w-full flex-col items-center gap-2">
//             <div className="flex w-full items-center gap-2">
//               <TextField label="Ai Prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
//               <Button className={'bg-primary mt-8 h-full cursor-pointer text-white'}>Generate</Button>
//             </div>
//             {aiResponse && (
//               <div className="w-ful flex flex-col py-4">
//                 <h6 className="text-textPrimary py-2 text-xl font-semibold">Ai Response</h6>
//                 <div className="border-black-300 border">
//                   <Markdown>{aiResponse}</Markdown>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//         {/* section options  */}
//         {(radioFieldType || selectFieldType) && (
//           <div className="flex h-full flex-col gap-2">
//             <p className="text-textPrimary text-lg font-semibold">Options</p>
//             {options?.map((option, index) => (
//               <div key={index} className="flex items-center gap-2">
//                 <TextField
//                   label={`Option ${index + 1} Label`}
//                   value={option.label}
//                   onChange={e => {
//                     const newOptions = [...options];
//                     newOptions[index].label = e.target.value;
//                     setOptions(newOptions);
//                   }}
//                 />
//                 <TextField
//                   label={`Option ${index + 1} Value1`}
//                   value={option.value}
//                   onChange={e => {
//                     const newOptions = [...options];
//                     newOptions[index].value = e.target.value;
//                     setOptions(newOptions);
//                   }}
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
//               <Button
//                 className={'mt-4 cursor-pointer'}
//                 onClick={() => setOptions([...options, { label: '', value: '' }])}
//               >
//                 Add Option
//               </Button>
//             </div>
//           </div>
//         )}
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
