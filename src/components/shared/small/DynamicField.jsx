import { useState } from 'react';
import { IoEyeOffSharp } from 'react-icons/io5';
import { RxEyeOpen } from 'react-icons/rx';
import Button from './Button';
import Modal from './Modal';
import { toast } from 'react-toastify';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';
import TextField from './TextField';

const DynamicField = ({ cn, field, className = '', form, placeholder, value, setForm, ...rest }) => {
  const { type, label, id, options, name, required } = field;

  const radioHandler = option => setForm({ ...form, [name]: option.value });
  const singleCheckBoxHandler = e => setForm({ ...form, [name]: e.target.checked });
  const multiCheckBoxHandler = e => {
    if (form[name]?.includes(e.target.value)) {
      setForm({ ...form, [name]: form[name].filter(item => item !== e.target.value) });
    } else {
      setForm({ ...form, [name]: [...form[name], e.target.value] });
    }
  };
  const selectHandler = e => setForm({ ...form, [name]: e.target.value });
  const onRangeChange = (e, minValue, maxValue) => {
    if (e.target.value > maxValue || e.target.value < minValue) return;
    setForm({ ...form, [name]: e.target.value });
  };

  if (type == 'radio') {
    return (
      <>
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
        <div className="border-b-2 py-6">
          <div className="grid grid-cols-2 gap-4 p-0">
            {options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2">
                <input
                  name={name}
                  type={type}
                  id={option.value}
                  value={option.value}
                  checked={form[name] === option.value}
                  className="text-textPrimary accent-primary size-5"
                  {...rest}
                  onChange={() => radioHandler(option)}
                />
                <label className="text-textPrimary text-base">{option?.label}</label>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  if (type == 'checkbox') {
    return (
      <div className={`flex items-center space-x-8 ${className}`}>
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? '*' : ''}
          </h4>
        )}
        <input
          id={id}
          type={type}
          value={value}
          className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
          {...rest}
          onChange={singleCheckBoxHandler}
        />
      </div>
    );
  }
  if (type == 'range') {
    return (
      <>
        <div className="flex w-full flex-col items-start">
          {label && (
            <h4 className="text-textPrimary text-base font-medium lg:text-lg">
              {label}:{required ? '*' : ''}
            </h4>
          )}
          <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
            <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{value ?? 25}</div>
            <input
              {...rest}
              type="range"
              className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
              defaultValue={0}
              onChange={e => onRangeChange(e, 0, 100)}
            />
            <input
              type="number"
              value={value ?? 0}
              className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
              onChange={e => onRangeChange(e, 0, 100)}
            />
          </div>
        </div>
      </>
    );
  }
  if (type == 'multi-checkbox') {
    return (
      <div className={`flex w-full justify-between gap-8 ${className}`}>
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
        <div className="flex w-full items-center gap-8">
          {options?.map((option, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <label htmlFor={option?.label} className="text-base text-gray-700 capitalize">
                {option?.label}
              </label>
              <input
                id={option?.label}
                type={'checkbox'}
                value={option?.value}
                checked={form[name]?.includes(option?.value)}
                className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
                {...rest}
                onChange={multiCheckBoxHandler}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type == 'select') {
    return (
      <>
        <div className="flex w-full flex-col items-start">
          {label && (
            <h4 className="text-textPrimary text-base font-medium lg:text-lg">
              {label}:{required ? '*' : ''}
            </h4>
          )}
          <select
            name={name}
            id={id}
            className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
            {...rest}
            onChange={selectHandler}
          >
            {options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex w-full flex-col items-start">
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? '*' : ''}
          </h4>
        )}
        <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
          <input
            {...rest}
            onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
            placeholder={placeholder}
            type={type}
            value={value}
            className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
          />
        </div>
      </div>
    </>
  );
};
export default DynamicField;

const SelectInputType = ({ field, className, form, setForm }) => {
  const { label, options, name, required, placeholder, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting } =
    field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const selectHandler = e => setForm({ ...form, [name]: e.target.value });
  return (
    <>
      <div className={`flex w-full flex-col items-start ${className}`}>
        {openAiHelpModal && (
          <Modal onClose={() => setOpenAiHelpModal(false)}>
            <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
          </Modal>
        )}
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? '*' : ''}
          </h4>
        )}
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col gap-4">
            <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
          </div>
        )}
        <div className="flex gap-2">
          <select
            name={name}
            required={required}
            className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
            onChange={selectHandler}
          >
            <option value="">{placeholder ?? 'Choose an option'}</option>
            {options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          {aiHelp && <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
        </div>
      </div>
    </>
  );
};

const MultiCheckboxInputType = ({ field, className, form, setForm }) => {
  const { label, options, name, required, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const multiCheckBoxHandler = e => {
    if (form[name]?.includes(e.target.value)) {
      setForm({ ...form, [name]: form[name].filter(item => item !== e.target.value) });
    } else {
      setForm({ ...form, [name]: [...form[name], e.target.value] });
    }
  };
  return (
    <div className={`flex w-full justify-between gap-8 ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      <h4 className="text-textPrimary text-base font-medium lg:text-lg">
        {label}:{required ? '*' : ''}
      </h4>
      {ai_formatting && isDisplayText && (
        <div className="gap-4p-4 flex h-full w-full flex-col">
          <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
        </div>
      )}
      <div className="flex w-full items-center gap-8">
        {options?.map((option, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <label htmlFor={option?.label} className="text-base text-gray-700 capitalize">
              {option?.label}
            </label>
            <input
              id={option?.label}
              type={'checkbox'}
              value={option?.value}
              checked={form[name]?.includes(option?.value)}
              className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              required={required}
              onChange={multiCheckBoxHandler}
            />
          </div>
        ))}
        {aiHelp && <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
      </div>
    </div>
  );
};

const RadioInputType = ({ field, className, form, setForm, onChange }) => {
  const { label, options, name, required, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const radioHandler = option => setForm({ ...form, [name]: option.value });
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 py-4">
          <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
        </div>
      )}
      <div className="flex">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
        {aiHelp && <Button label="AI Help" className="h-min text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
      </div>
      <div className="border-b-2 py-6">
        <div className="grid grid-cols-3 gap-4 p-0">
          {options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2">
              <input
                name={name}
                type={'radio'}
                id={option.value}
                value={option.value}
                checked={form[name] === option.value}
                className="text-textPrimary accent-primary size-5"
                required={required}
                onChange={onChange ? onChange : () => radioHandler(option)}
              />
              <label className="text-textPrimary text-base">{option?.label}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckboxInputType = ({ field, className, form, setForm }) => {
  const { label, name, required, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting, conditional_fields } =
    field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

  const singleCheckBoxHandler = e => setForm({ ...form, [name]: e.target.checked });
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex flex-col justify-between ${className}`}>
        {openAiHelpModal && (
          <Modal onClose={() => setOpenAiHelpModal(false)}>
            <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
          </Modal>
        )}
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col gap-4 p-4 pb-0">
            <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 p-4">
            <input
              type={'checkbox'}
              name={name}
              required={required}
              value={form[name]}
              checked={form[name]}
              className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              onChange={singleCheckBoxHandler}
            />
            {label && (
              <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                :{required ? '*' : ''}
                {label}
              </h4>
            )}
          </div>
          {aiHelp && <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
        </div>
      </div>
      <div className="flex w-full gap-2 px-6">
        {form?.[name] && conditional_fields?.length
          ? conditional_fields?.map((f, index) => {
              const fieldName = `${name}/${f?.name}`;
              return (
                <div className="flex w-full flex-col gap-2" key={index}>
                  <TextField
                    value={form?.[fieldName]}
                    type={f?.type}
                    label={f?.label}
                    name={fieldName}
                    required={f?.required}
                    onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                  />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

const RangeInputType = ({ field, className, form, setForm }) => {
  const {
    label,
    name,
    required,
    minValue = 0,
    maxValue = 100,
    aiHelp,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
  } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

  const onRangeChange = e => {
    const targetVAlue = String(e.target.value);
    if (targetVAlue > maxValue || targetVAlue < minValue) return;
    setForm({ ...form, [name]: targetVAlue });
  };
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      {label && (
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 p-4">
          <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
        </div>
      )}
      <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{Number(form[name]) || 0}</div>
        <input
          value={Number(form[name]) || 0}
          type="range"
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
          defaultValue={0}
          onChange={onRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            type="number"
            value={Number(form[name]) || 0}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
            onChange={onRangeChange}
          />
          {aiHelp && <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
        </div>
      </div>
    </div>
  );
};

const OtherInputType = ({ field, className, form, setForm }) => {
  const {
    type,
    label,
    name,
    required,
    placeholder,
    isMasked,
    aiHelp,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
  } = field;
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  return (
    <>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      <div className="flex w-full flex-col items-start gap-4">
        <article className="flex w-full flex-col items-start gap-2">
          {ai_formatting && isDisplayText && (
            <div className="gap-4p-4 flex h-full w-full flex-col">
              <div className="" dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
            </div>
          )}
          <section className="flex w-full gap-2">
            <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
              {label && (
                <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                  {label}:{required ? '*' : ''}
                </h4>
              )}
              <input
                onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
                placeholder={placeholder}
                type={showMasked ? 'password' : type}
                value={form[name]}
                className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
              />
              {isMasked && (
                <span
                  onClick={() => setShowMasked(!showMasked)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
                >
                  {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
                </span>
              )}
            </div>
            {aiHelp && <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />}
          </section>
        </article>
      </div>
    </>
  );
};

const AiHelpModal = ({ aiResponse }) => {
  const [updateAiPrompt, setUpdateAiPrompt] = useState('');
  const [updatedAiResponse, setUpdatedAiResponse] = useState('');
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();

  const getResponseFromAi = async () => {
    if (!updateAiPrompt) return toast.error('Please enter a prompt');

    try {
      const res = await formateTextInMarkDown({
        text:
          'you are an expert ai tell the accurate answer of this question is html format the prompt is ' +
          updateAiPrompt,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setUpdatedAiResponse(html);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 p-4">
          <div className="" dangerouslySetInnerHTML={{ __html: aiResponse ?? '' }} />
        </div>
        <input
          placeholder={'Enter Ai Prompt'}
          type={'text'}
          value={updateAiPrompt}
          onChange={e => setUpdateAiPrompt(e.target.value)}
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
        />
        <Button label="Get Response" className="text-nowrap" onClick={getResponseFromAi} loading={isLoading} />
      </div>
      {updatedAiResponse && (
        <div className="flex flex-col gap-2 bg-amber-100 p-4">
          <div className="" dangerouslySetInnerHTML={{ __html: updatedAiResponse ?? '' }} />
        </div>
      )}
    </div>
  );
};

export {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
  AiHelpModal,
};
