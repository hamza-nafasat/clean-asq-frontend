import Checkbox from '@/components/shared/small/Checkbox';
import DynamicField from '@/components/shared/small/DynamicField';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

function Modal6({ fields }) {
  const [fieldsData, setFieldsData] = useState([]);
  useEffect(() => {
    if (fields?.length > 0) {
      setFieldsData(fields);
    }
  }, [fields]);
  return (
    <>
      <p className="text-textPrimary text-center text-2xl font-medium">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <FieldDataChange field={field} />
          </div>
        ))}
      <div className="mt-6 flex justify-end gap-2">
        <Button
          className="bg-primary cursor-pointer text-white"
          onClick={() =>
            setFieldsData(prev => [
              ...prev,
              {
                label: '',
                name: '',
                placeholder: '',
                required: false,
                type: 'text',
                aiHelp: false,
                aiPrompt: '',
                options: [],
              },
            ])
          }
        >
          Add Field
        </Button>
      </div>
    </>
  );
}

export default Modal6;

const FieldDataChange = ({ field }) => {
  const [placeholder, setPlaceholder] = useState('');
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [fieldType, setFieldType] = useState('text');
  const [aiHelp, setAiHelp] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [options, setOptions] = useState([{ label: '', value: '' }]);
  const [aiResponse, setAiResponse] = useState('');

  const removeOption = index => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  useEffect(() => {
    if (field && Object.keys(field).length > 0) {
      setPlaceholder(field?.placeholder || '');
      setName(field?.name || '');
      setLabel(field?.label || '');
      setIsRequired(field?.required || false);
      setFieldType(field?.type || 'text');
      setAiHelp(field?.aiHelp || false);
      setAiPrompt(field?.aiPrompt || '');
      setOptions(field?.options || []);
      setAiResponse(field?.aiResponse || '');
    }
  }, [field]);

  if (fieldType == 'text' || fieldType == 'number' || fieldType == 'email' || fieldType == 'password') {
    return (
      <div className="flex flex-col gap-4 p-2 pb-2">
        <h2 className="text-textPrimary text-xl font-semibold">{field.name}</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <TextField label="Change label" value={label} onChange={e => setLabel(e.target.value)} />
            <TextField label="Change Field Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex w-full flex-col items-start">
              <p className="text-start text-sm lg:text-base">Field Type</p>
              <div className="w-full rounded-lg border border-gray-300 p-2">
                <select
                  name="fieldType"
                  id="fieldType"
                  className="w-full p-2 outline-none"
                  value={fieldType}
                  onChange={e => setFieldType(e.target.value)}
                >
                  <option value={'text'}>Text</option>
                  <option value={'number'}>Number</option>
                  <option value={'email'}>Email</option>
                  <option value={'password'}>Password</option>
                  <option value={'radio'}>Radio</option>
                  <option value={'checkbox'}>Checkbox</option>
                  <option value={'textarea'}>Textarea</option>
                  <option value={'range'}>Textarea</option>
                </select>
              </div>
            </div>
            <TextField label="Change Placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} />
          </div>
          <div className="flex w-full items-center gap-2">
            <Checkbox label="Is Required" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
            <Checkbox label="is Ai Help Enabled" checked={aiHelp} onChange={e => setAiHelp(e.target.checked)} />
          </div>
          {aiHelp && (
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center gap-2">
                <TextField label="Ai Prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                <Button className={'bg-primary mt-8 h-full cursor-pointer text-white'}>Generate</Button>
              </div>
              <Markdown>{aiResponse}</Markdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (fieldType == 'radio') {
    return (
      <div className="flex flex-col gap-4 p-2 pb-2">
        <h2 className="text-Primary text-xl font-semibold">{field.name}</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <TextField label="Change label" value={label} onChange={e => setLabel(e.target.value)} />
            <TextField label="Change Field Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex w-full flex-col items-start">
              <p className="text-start text-sm lg:text-base">Field Type</p>
              <div className="w-full rounded-lg border border-gray-300 p-2">
                <select
                  name="fieldType"
                  id="fieldType"
                  className="w-full p-2 outline-none"
                  value={fieldType}
                  onChange={e => setFieldType(e.target.value)}
                >
                  <option value={'text'}>Text</option>
                  <option value={'number'}>Number</option>
                  <option value={'email'}>Email</option>
                  <option value={'password'}>Password</option>
                  <option value={'radio'}>Radio</option>
                  <option value={'checkbox'}>Checkbox</option>
                  <option value={'textarea'}>Textarea</option>
                  <option value={'range'}>Textarea</option>
                </select>
              </div>
            </div>
            <div className="flex w-full items-center gap-2">
              <Checkbox label="Is Required" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
              <Checkbox label="is Ai Help Enabled" checked={aiHelp} onChange={e => setAiHelp(e.target.checked)} />
            </div>
          </div>
          {aiHelp && (
            <div className="flex w-full items-center gap-2">
              <TextField label="Ai Prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
            </div>
          )}
          <div>
            <div className="flex h-full flex-col gap-2">
              <p className="text-textPrimary text-lg font-semibold">Options</p>
              {options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TextField
                    label={`Option ${index + 1} Label`}
                    value={option.label}
                    onChange={e => {
                      const newOptions = [...options];
                      newOptions[index].label = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                  <TextField
                    label={`Option ${index + 1} Value1`}
                    value={option.value}
                    onChange={e => {
                      const newOptions = [...options];
                      newOptions[index].value = e.target.value;
                      setOptions(newOptions);
                    }}
                  />
                  <Button
                    className={'mt-8 cursor-pointer bg-red-500 hover:bg-red-600'}
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                className={'mt-4 cursor-pointer'}
                onClick={() => setOptions([...options, { label: '', value: '' }])}
              >
                Add Option
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <div className="text-textPrimary text-lg font-semibold">{field.name}</div>;
};
