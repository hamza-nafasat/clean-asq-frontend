import React from 'react';

const Checkbox = ({ id, name, label, checked = false, onChange, disabled = false, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
      />
      {label && (
        <label htmlFor={id} className="text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
