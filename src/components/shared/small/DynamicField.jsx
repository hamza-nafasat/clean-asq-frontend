import Ai from '@/assets/svgs/Ai';
import { Eye, EyeClosed, EyeClosedIcon } from 'lucide-react';
import React, { useState } from 'react';
import { BsFillEyeSlashFill } from 'react-icons/bs';
import { IoEyeOffSharp } from 'react-icons/io5';
import { RxEyeClosed, RxEyeOpen } from 'react-icons/rx';

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
  const { label, options, name, required, placeholder } = field;
  const selectHandler = e => setForm({ ...form, [name]: e.target.value });
  return (
    <>
      <div className={`flex w-full flex-col items-start ${className}`}>
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? '*' : ''}
          </h4>
        )}
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
      </div>
    </>
  );
};

const MultiCheckboxInputType = ({ field, className, form, setForm }) => {
  const { label, options, name, required } = field;
  const multiCheckBoxHandler = e => {
    if (form[name]?.includes(e.target.value)) {
      setForm({ ...form, [name]: form[name].filter(item => item !== e.target.value) });
    } else {
      setForm({ ...form, [name]: [...form[name], e.target.value] });
    }
  };
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
              required={required}
              onChange={multiCheckBoxHandler}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RadioInputType = ({ field, className, form, setForm }) => {
  const { label, options, name, required } = field;
  const radioHandler = option => setForm({ ...form, [name]: option.value });
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      <h4 className="text-textPrimary text-base font-medium lg:text-lg">
        {label}:{required ? '*' : ''}
      </h4>
      <div className="border-b-2 py-6">
        <div className="grid grid-cols-2 gap-4 p-0">
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
                onChange={() => radioHandler(option)}
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
  const { label, name, required } = field;

  const singleCheckBoxHandler = e => setForm({ ...form, [name]: e.target.checked });
  return (
    <div className={`flex items-center space-x-8 ${className}`}>
      {label && (
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
      )}
      <input
        type={'checkbox'}
        name={name}
        required={required}
        value={form[name]}
        className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
        onChange={singleCheckBoxHandler}
      />
    </div>
  );
};

const RangeInputType = ({ field, className, form, setForm }) => {
  const { label, name, required, minValue = 0, maxValue = 100 } = field;

  const onRangeChange = e => {
    const targetVAlue = String(e.target.value);
    if (targetVAlue > maxValue || targetVAlue < minValue) return;
    setForm({ ...form, [name]: targetVAlue });
  };
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {label && (
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? '*' : ''}
        </h4>
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
        <input
          type="number"
          value={Number(form[name]) || 0}
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
          onChange={onRangeChange}
        />
      </div>
    </div>
  );
};

const OtherInputType = ({ field, className, form, setForm }) => {
  const { type, label, name, required, placeholder, isMasked } = field;
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
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
      </div>
    </>
  );
};

export { SelectInputType, CheckboxInputType, RangeInputType, OtherInputType, RadioInputType, MultiCheckboxInputType };
