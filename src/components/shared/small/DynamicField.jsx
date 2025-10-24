import { useRef, useState } from 'react';
import { IoEyeOffSharp } from 'react-icons/io5';
import { RxEyeOpen } from 'react-icons/rx';
import Button from './Button';
import Modal from './Modal';
import { toast } from 'react-toastify';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';
import TextField from './TextField';
import { FIELD_TYPES } from '@/data/constants';
import { useBranding } from '@/hooks/BrandingContext';

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
              value={value ?? 0}
              className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
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
        <div className="flex w-full gap-2">
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
          {aiHelp && (
            <div className="flex items-center">
              <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
            </div>
          )}
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
      <h4 className="text-textPrimary min-w-[200px]lg:text-lg text-base font-medium">
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
        {aiHelp && (
          <div className="ml-auto flex items-center">
            <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
          </div>
        )}
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
      <div className="flex w-full">
        <h4 className="text-textPrimary min-w-[200px] text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
        {aiHelp && (
          <div className="jsutify-end items-cente ml-auto flex">
            <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
          </div>
        )}
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
                {label} {required ? '*' : ''}
              </h4>
            )}
          </div>
          {aiHelp && (
            <div className="mt-8 flex items-center">
              <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
            </div>
          )}
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
          onChange={onRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            type="number"
            value={Number(form[name]) || 0}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
            onChange={onRangeChange}
          />
          {aiHelp && (
            <div className="flex items-center">
              <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// const OtherInputType = ({ field, className, form, setForm, isConfirmField }) => {
//   const isEmpty = value => {
//     if (value === undefined || value === null) return true;
//     if (typeof value === 'string') return value.trim() === '';
//     if (Array.isArray(value)) return value.length === 0;
//     return false;
//   };

//   const {
//     type,
//     label,
//     name,
//     required,
//     placeholder,
//     isMasked,
//     aiHelp,
//     aiPrompt,
//     aiResponse,
//     isDisplayText,
//     ai_formatting,
//   } = field;

//   const inputRef = useRef(null);
//   const [showMasked, setShowMasked] = useState(isMasked ? true : false);
//   const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

//   const formatDate = dateStr => {
//     if (!dateStr) return '';
//     const [year, month, day] = dateStr.split(/[-/]/);
//     return `${year}-${month}-${day}`;
//   };

//   const normalizeDate = dateStr => {
//     if (!dateStr) return '';
//     const [year, month, day] = dateStr.split(/[-\s/]/);
//     return `${year}-${month}-${day}`;
//   };

//   return (
//     <>
//       {openAiHelpModal && (
//         <Modal onClose={() => setOpenAiHelpModal(false)}>
//           <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
//         </Modal>
//       )}

//       <div className="flex w-full flex-col items-start gap-4">
//         <article className="flex w-full flex-col items-start gap-2">
//           {ai_formatting && isDisplayText && (
//             <div className="gap-4p-4 flex h-full w-full flex-col">
//               <div dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
//             </div>
//           )}

//           <section className="flex w-full gap-2">
//             <div className={`w-full ${label ? 'mt-2' : ''}`}>
//               {label && (
//                 <h4 className="text-textPrimary text-base font-medium lg:text-lg">
//                   {label}:{required ? '*' : ''}
//                 </h4>
//               )}

//               {type == 'textarea' ? (
//                 <div className="relative">
//                   <textarea
//                     ref={inputRef}
//                     name={name}
//                     placeholder={showMasked ? '*******' : placeholder}
//                     type={showMasked ? 'password' : type}
//                     value={form[name]}
//                     onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
//                     autoComplete="off"
//                     className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
//                       required && isEmpty(form[name]) ? 'border-accent border-2' : 'border-frameColor border'
//                     }`}
//                     {...(isConfirmField
//                       ? {
//                           onPaste: e => e.preventDefault(),
//                           onCopy: e => e.preventDefault(),
//                           onCut: e => e.preventDefault(),
//                         }
//                       : {})}
//                   />
//                 </div>
//               ) : (
//                 <div className="relative">
//                   <input
//                     ref={inputRef}
//                     name={name}
//                     placeholder={showMasked ? '*******' : placeholder}
//                     type={showMasked ? 'password' : type}
//                     value={type === 'date' ? formatDate(form[name]) : form[name]}
//                     onChange={e =>
//                       setForm(prev => ({
//                         ...prev,
//                         [name]: type === 'date' ? normalizeDate(e.target.value) : e.target.value,
//                       }))
//                     }
//                     autoComplete="off"
//                     className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
//                       required && isEmpty(form[name]) ? 'border-accent border-2' : 'border-frameColor border'
//                     }`}
//                     {...(isConfirmField
//                       ? {
//                           onPaste: e => e.preventDefault(),
//                           onCopy: e => e.preventDefault(),
//                           onCut: e => e.preventDefault(),
//                         }
//                       : {})}
//                   />

//                   {isMasked && (
//                     <span
//                       onClick={() => setShowMasked(!showMasked)}
//                       className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
//                     >
//                       {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>

//             {aiHelp && (
//               <div className="mt-8 flex items-center">
//                 <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
//               </div>
//             )}
//           </section>
//         </article>
//       </div>
//     </>
//   );
// };

const OtherInputType = ({ field, className, form, setForm, isConfirmField }) => {
  const isEmpty = value => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

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

  const inputRef = useRef(null);
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split(/[-/]/);
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = dateStr => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split(/[-\s/]/);
    return `${year}-${month}-${day}`;
  };

  // derived display value (masked only for UI)
  const getDisplayValue = (type, value) => {
    console.log('value is value', value);
    if (!value) return '';
    if (showMasked && isMasked) return '*'.repeat(value.toString().length);
    if (type === 'date') return formatDate(value);
    return value;
  };

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
              <div dangerouslySetInnerHTML={{ __html: ai_formatting ?? '' }} />
            </div>
          )}

          <section className="flex w-full gap-2">
            <div className={`w-full ${label ? 'mt-2' : ''}`}>
              {label && (
                <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                  {label}:{required ? '*' : ''}
                </h4>
              )}

              {type === 'textarea' ? (
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    name={name}
                    placeholder={placeholder}
                    value={getDisplayValue(type, form[name])}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    onFocus={() => setShowMasked(false)}
                    onBlur={() => setShowMasked(true)}
                    readOnly={showMasked}
                    autoComplete="off"
                    className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
                      required && isEmpty(form[name]) ? 'border-accent border-2' : 'border-frameColor border'
                    }`}
                    {...(isConfirmField
                      ? {
                          onPaste: e => e.preventDefault(),
                          onCopy: e => e.preventDefault(),
                          onCut: e => e.preventDefault(),
                        }
                      : {})}
                  />
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={inputRef}
                    name={name}
                    placeholder={placeholder}
                    type={type}
                    value={getDisplayValue(type, form[name])}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        [name]: type === 'date' ? normalizeDate(e.target.value) : e.target.value,
                      }))
                    }
                    onFocus={() => setShowMasked(false)}
                    onBlur={() => setShowMasked(true)}
                    readOnly={showMasked}
                    autoComplete="off"
                    className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
                      required && isEmpty(form[name]) ? 'border-accent border-2' : 'border-frameColor border'
                    }`}
                    {...(isConfirmField
                      ? {
                          onPaste: e => e.preventDefault(),
                          onCopy: e => e.preventDefault(),
                          onCut: e => e.preventDefault(),
                        }
                      : {})}
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
              )}
            </div>

            {aiHelp && (
              <div className="mt-8 flex items-center">
                <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
              </div>
            )}
          </section>
        </article>
      </div>
    </>
  );
};

const AiHelpModal = ({ aiResponse }) => {
  const [updateAiPrompt, setUpdateAiPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();
  const { logo } = useBranding();

  const getResponseFromAi = async () => {
    if (!updateAiPrompt.trim()) return toast.error('Please enter a prompt');

    // Add user message
    setChatHistory(prev => [...prev, { role: 'user', content: updateAiPrompt }]);

    try {
      const res = await formateTextInMarkDown({
        text: 'You are an expert AI. Give an accurate HTML formatted answer to this prompt: ' + updateAiPrompt,
      }).unwrap();

      if (res.success) {
        const html = DOMPurify.sanitize(res.data);
        setChatHistory(prev => [...prev, { role: 'ai', content: html }]);
        setUpdateAiPrompt('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to get AI response');
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-center">
        <img src={logo} alt="Logo" className="h-20 w-20" />
      </div>
      <div className="flex flex-col items-start gap-2 border-2 p-4">
        <div className="" dangerouslySetInnerHTML={{ __html: aiResponse ?? '' }} />
      </div>
      {chatHistory?.length > 0 ? (
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg border bg-[#FAFBFF] p-4">
          {chatHistory?.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${
                msg.role === 'user' ? 'self-end bg-blue-100 text-gray-800' : 'self-start bg-gray-100 text-gray-700'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.content }} className="prose prose-sm max-w-none" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          placeholder="ask additional question(s)"
          type="text"
          value={updateAiPrompt}
          onChange={e => setUpdateAiPrompt(e.target.value)}
          className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
        />
        <Button className="text-nowrap" label="Get Response" onClick={getResponseFromAi} loading={isLoading} />
      </div>
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
