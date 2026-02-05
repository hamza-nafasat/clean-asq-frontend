import { useBranding } from '@/hooks/BrandingContext';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';
import { useCallback, useRef, useState } from 'react';
import { IoEyeOffSharp } from 'react-icons/io5';
import { RxEyeOpen } from 'react-icons/rx';
import { PiFileArrowUpFill } from 'react-icons/pi';
import { CgSoftwareUpload } from 'react-icons/cg';
import { toast } from 'react-toastify';
import Button from './Button';
import Modal from './Modal';
import TextField from './TextField';
import { Autocomplete } from '@react-google-maps/api';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',];
const ALLOWED_TEXT_EXTENSIONS = ['.csv', '.txt', '.rtf'];
const FORBIDDEN_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx'];

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

const SelectInputType = ({ field, className, form, setForm }) => {
  const { label, options, name, required, placeholder, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting } =
    field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const selectHandler = e => setForm({ ...form, [name]: e.target.value });

  // Determine current value to display
  let displayValue = form?.[name] ?? '';
  // If the value matches an option label, convert to its value
  const isValueInOptions = options?.some(option => option.value === displayValue);
  if (!isValueInOptions) {
    const matchedOptionByLabel = options?.find(
      option => String(option.label).toLowerCase() === String(displayValue).toLowerCase()
    );
    if (matchedOptionByLabel) displayValue = matchedOptionByLabel.value;
  }
  // Check if the display value exists in options

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
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                  if (match.includes('target=')) return match; // avoid duplicates
                  return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}
        <div className="flex w-full gap-2">
          <select
            name={name}
            value={displayValue}
            required={required}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${!displayValue && required ? 'bg-highlighting' : ''}`}
            onChange={selectHandler}
          >
            {/* Show placeholder if value is not in options */}
            <option value="">{placeholder ?? 'Choose an option'}</option>
            {!isValueInOptions && displayValue && form[name] && (
              <option className="hidden" value={form[name]}>
                {form[name]}
              </option>
            )}
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
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
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

const RadioInputType = ({ field, className, form, setForm, onChange, disabled = false }) => {
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
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
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
            <div key={index} className="flex items-center gap-2 p-2 text-start">
              <input
                disabled={disabled}
                name={name}
                type={'radio'}
                id={option.value + index + name}
                value={option.value}
                checked={form[name] === option.value}
                className={`text-textPrimary accent-primary size-5 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                required={required}
                onChange={onChange ? onChange : () => radioHandler(option)}
              />
              <label htmlFor={option.value + index + name} className="text-textPrimary text-base">
                {option?.label}
              </label>
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
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                  if (match.includes('target=')) return match; // avoid duplicates
                  return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
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

  const isEmpty = value => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

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
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">{Number(form[name]) || 0} %</div>
        <input
          value={Number(form[name]) || 0}
          type="range"
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} `}
          onChange={onRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            type="number"
            value={Number(form[name]) || 0}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${(required && isEmpty(form[name])) || form[name] === 0
              ? 'border-accent bg-highlighting border-2'
              : 'border-frameColor border'
              }`}
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

const OtherInputType = ({ field, className, form, setForm, isConfirmField, suggestions = [] }) => {
  const isEmpty = value => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  let {
    type,
    label,
    name,
    required,
    formatting,
    placeholder,
    isMasked,
    aiHelp,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
    suggestions: fieldSuggestions,
    isGooglePlaces = false,
  } = field;

  if (fieldSuggestions) fieldSuggestions = fieldSuggestions.split(',');

  // Auto formatting overrides
  if (name.includes('ssn')) formatting = '3,2,4';
  const isPhone = name.toLowerCase().includes('phone');
  if (isPhone) formatting = '3,3,4';

  const inputRef = useRef(null);
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const limitByFormat = (value, format) => {
    const maxDigits = format
      .split(',')
      .map(n => parseInt(n.trim(), 10))
      .reduce((a, b) => a + b, 0);

    const digits = value.replace(/\D/g, '');
    return digits.slice(0, maxDigits);
  };

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

  // ==========================
  //      DISPLAY VALUE FIX
  // ==========================
  const getDisplayValue = (type, value) => {
    if (!value) return isPhone ? '+1 ' : '';

    if (showMasked && isMasked) return '*'.repeat(value.toString().length);

    if (type === 'date') return formatDate(value);

    const format = formatting?.split(',');

    // --------------------------
    //        PHONE FORMAT
    // --------------------------
    if (isPhone) {
      let clean = String(value).replace(/\D/g, ''); // raw digits only

      if (format && Array.isArray(format) && format.length > 0) {
        let formatted = '';
        let start = 0;

        for (let i = 0; i < format.length; i++) {
          const len = parseInt(format[i], 10);
          if (start >= clean.length) break;

          const part = clean.substr(start, len);
          formatted += part;
          start += len;

          if (i < format.length - 1 && start < clean.length) {
            formatted += '-';
          }
        }

        if (start < clean.length) formatted += '-' + clean.substr(start);

        return '+1 ' + formatted;
      }

      return '+1 ' + clean;
    }

    // --------------------------
    //      NORMAL FORMATTING
    // --------------------------
    if (format && Array.isArray(format) && format.length > 0) {
      const digits = value.toString().replace(/\D/g, '');
      let formatted = '';
      let start = 0;

      for (let i = 0; i < format.length; i++) {
        const len = parseInt(format[i], 10);
        if (start >= digits.length) break;

        const part = digits.substr(start, len);
        formatted += part;
        start += len;

        if (i < format.length - 1 && start < digits.length) {
          formatted += '-';
        }
      }

      if (start < digits.length) formatted += '-' + digits.substr(start);
      return formatted;
    }

    return value;
  };

  // Google Places
  const onLoad = useCallback(autoC => {
    autoC.setFields(['address_components', 'formatted_address', 'geometry', 'place_id']);
    setAutocomplete(autoC);
  }, []);

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();
    setForm(prev => ({ ...prev, [name]: place.formatted_address }));
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
              <div
                dangerouslySetInnerHTML={{
                  __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                    if (match.includes('target=')) return match;
                    return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                  }),
                }}
              />
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
                    value={getDisplayValue(type, form?.[name])}
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
                    className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${required && isEmpty(form[name])
                      ? 'border-accent bg-highlighting border-2'
                      : 'border-frameColor border'
                      } `}
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
                  {isGooglePlaces && type === 'text' ? (
                    <Autocomplete
                      onLoad={onLoad}
                      className="w-full"
                      onPlaceChanged={onPlaceChanged}
                      options={{ fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] }}
                    >
                      <input
                        ref={inputRef}
                        name={name}
                        placeholder={placeholder}
                        type={type}
                        value={form?.[name] || ''}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            [name]: type === 'date' ? normalizeDate(e.target.value) : e.target.value,
                          }))
                        }
                        className={`relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${required && isEmpty(form[name])
                          ? 'border-accent bg-highlighting border-2'
                          : 'border-frameColor border'
                          } `}
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      ref={inputRef}
                      name={name}
                      placeholder={placeholder}
                      type={isMasked && type !== 'date' ? 'text' : type}
                      value={getDisplayValue(type, form?.[name])}
                      onChange={e => {
                        let val = e.target.value;

                        // ==========================
                        //      PHONE RAW DIGITS
                        // ==========================
                        if (isPhone) {
                          let digits = e.target.value.replace(/\D/g, '');

                          if (digits.startsWith('1')) digits = digits.slice(1);

                          digits = limitByFormat(digits, '3,3,4'); // 10 digits total

                          val = digits;
                        }

                        // ==========================
                        //      SSN RAW DIGITS
                        // ==========================
                        else if (name.includes('ssn')) {
                          let digits = e.target.value.replace(/\D/g, '');
                          digits = limitByFormat(digits, '3,2,4'); // 9 digits total
                          val = digits;
                        }

                        setForm(prev => ({
                          ...prev,
                          [name]: type === 'date' ? normalizeDate(val) : val,
                        }));
                      }}
                      onFocus={() => {
                        setShowMasked(false);
                        if (suggestions?.length || fieldSuggestions?.length) setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        setShowMasked(true);
                        if (suggestions?.length || fieldSuggestions?.length)
                          setTimeout(() => setShowSuggestions(false), 100);
                      }}
                      readOnly={showMasked}
                      autoComplete="off"
                      className={`relative h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${required && isEmpty(form[name])
                        ? 'border-accent bg-highlighting border-2'
                        : 'border-frameColor border'
                        } `}
                      {...(isConfirmField
                        ? {
                          onPaste: e => e.preventDefault(),
                          onCopy: e => e.preventDefault(),
                          onCut: e => e.preventDefault(),
                        }
                        : {})}
                    />
                  )}

                  {showSuggestions && type === 'text' && fieldSuggestions?.length > 0 && (
                    <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                      {fieldSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                          onMouseDown={() => {
                            setForm(prev => ({ ...prev, [name]: suggestion }));
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}

                  {showSuggestions && suggestions?.length > 0 && (!fieldSuggestions || !fieldSuggestions.length) && (
                    <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                          onMouseDown={() => {
                            setForm(prev => ({ ...prev, [name]: suggestion }));
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}

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

const FileInputType = ({ field, className, form, setForm }) => {
  const {
    label,
    name,
    required,
    aiHelp,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
  } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const isEmpty = value => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const fileHandler = file => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const mimeType = file.type;

    // ---- hard reject forbidden formats ----
    if (FORBIDDEN_EXTENSIONS.some(ext => fileNameLower.endsWith(ext))) {
      toast.error('DOC and Excel files are not allowed');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf =
      mimeType === 'application/pdf' || fileNameLower.endsWith('.pdf');
    const isText =
      mimeType.startsWith('text/') ||
      ALLOWED_TEXT_EXTENSIONS.some(ext => fileNameLower.endsWith(ext));

    if (!isImage && !isPdf && !isText) {
      toast.error('Unsupported file type');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setForm(prev => ({
      ...prev,
      [name]: { file },
    }));

    // Set preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) fileHandler(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) fileHandler(file);
  };

  const handleDragOver = e => e.preventDefault();

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal
            aiPrompt={aiPrompt}
            aiResponse={aiResponse}
            setOpenAiHelpModal={setOpenAiHelpModal}
          />
        </Modal>
      )}
      {label && (
        <label className="mb-2 block text-sm text-[#666666] lg:text-base">
          {label}:{required ? '*' : ''}
        </label>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 mb-2">
          <div
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match;
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full gap-2 mt-2">
        <div className="w-full">
          <div
            className={`relative mt-2 flex h-[283px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50 ${required && isEmpty(form[name])
              ? 'border-accent bg-highlighting'
              : 'border-gray-300'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
          >
            <PiFileArrowUpFill className="text-textPrimary text-8xl" />
            <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
            <h5 className="text-textPrimary">pdf, jpg, png, csv, txt, rtf up to 10MB</h5>
            <Button
              label={'Select file'}
              className="text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500!"
              rightIcon={CgSoftwareUpload}
            />
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept="image/*,application/pdf,text/csv,text/plain,application/rtf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {fileName && (
            <div className="mt-2 text-sm text-gray-700">Selected: {fileName}</div>
          )}

          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />
          )}
        </div>
        {aiHelp && (
          <div className="flex items-center">
            <Button
              label="Help"
              className="max-h-fit! text-nowrap"
              onClick={() => setOpenAiHelpModal(true)}
            />
          </div>
        )}
      </div>
    </div>
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
        <div
          className=""
          dangerouslySetInnerHTML={{
            __html: String(aiResponse || '').replace(/<a(\s+.*?)?>/g, match => {
              if (match.includes('target=')) return match; // avoid duplicates
              return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
            }),
          }}
        />
      </div>
      {chatHistory?.length > 0 ? (
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg border bg-[#FAFBFF] p-4">
          {chatHistory?.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${msg.role === 'user' ? 'self-end bg-blue-100 text-gray-800' : 'self-start bg-gray-100 text-gray-700'
                }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: String(msg.content || '').replace(/<a(\s+.*?)?>/g, match => {
                    if (match.includes('target=')) return match; // avoid duplicates
                    return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                  }),
                }}
                className="prose prose-sm max-w-none"
              />
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
  AiHelpModal,
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
  FileInputType,
};
export default DynamicField;
