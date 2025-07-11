import React from 'react';

const DynamicField = ({ cn, field, className = '', form, setForm, ...rest }) => {
  const { type, label, id, options, name } = field;
  if (type == 'radio') {
    return (
      <>
        <h1 className="text-textPrimary text-lg font-medium">{label}</h1>
        <div className="border-b-2 py-6">
          <div className="grid grid-cols-2 gap-4 p-0">
            {options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2">
                <input
                  name={name}
                  type={type}
                  className="text-textPrimary accent-primary size-5"
                  {...rest}
                  onClick={() => setForm({ ...form, [name]: option.value })}
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
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          id={id}
          className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
          {...rest}
        />
        {label && (
          <label htmlFor={id} className="text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="flex w-full flex-col items-start">
        {label && <label className="text-textPrimary text-sm lg:text-base">{label}</label>}
        <div className={`relative w-full ${label ? 'mt-2' : ''}`}>
          <input
            {...rest}
            type={type}
            className={`${cn} border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className}`}
          />
        </div>
      </div>
    </>
  );
};

export default DynamicField;
