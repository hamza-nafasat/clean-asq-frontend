import React, { useState, useCallback } from 'react';
import TextField from '../shared/small/TextField';

export default function UserApplicationDetail({ form, onClose }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    e => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors]
  );

  const renderFormField = useCallback((field, value, onChange, type = 'text', error = null, options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());

    if (type === 'select' && options) {
      return (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
          <select
            name={field}
            value={value}
            onChange={onChange}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        {/* <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
        <input
          name={field}
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={`Enter ${labelText.toLowerCase()}`}
          className={`focus:border-primary focus:ring-primary/20 w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm transition focus:ring ${
            error ? 'border-red-500' : ''
          }`}
        /> */}
        <TextField
          label={'labelText'}
          name={field}
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={`Enter ${labelText.toLowerCase()}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    // Add your form validation logic here
    const newErrors = {};
    form?.fields?.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle form submission
    console.log('Form submitted:', formData);
    // Add your API call or form submission logic here
  };

  return (
    <div className="w-full rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-secondary text-2xl font-bold">{form?.name}</h2>
        <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-700">Required Fields</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {form?.fields?.map(field => (
              <div key={field}>{renderFormField(field, formData[field], handleChange, 'text', errors[field])}</div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-secondary hover:bg-light rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
