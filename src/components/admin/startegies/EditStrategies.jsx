import DropdownCheckbox from '@/components/shared/DropdownCheckbox';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useEffect, useState } from 'react';

const renderFormField = (field, value, onChange, type = 'text', options = null, error = null) => {
  const labelText = field
    .split(/(?=[A-Z])/) // split camelCase into words
    .join(' ')
    .replace(/^\w/, c => c.toUpperCase());

  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
        <select
          name={field}
          value={value}
          onChange={e => onChange(field, e.target.value)}
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
            error ? 'border-red-500' : 'border-frameColor'
          }`}
        >
          <option value="">Select</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="mb-4 flex items-center space-x-2">
        <input type="checkbox" checked={value} onChange={() => onChange(field, !value)} />
        <label className="text-sm font-medium">{labelText}</label>
      </div>
    );
  }

  if (type === 'multi-select' && options) {
    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">{labelText}</label>
        <DropdownCheckbox
          options={options}
          selected={value}
          defaultText={`Select ${labelText}`}
          onSelect={vals => onChange(field, vals)}
        />
      </div>
    );
  }

  // ✅ Default input using your TextField component
  return (
    <div className="mb-4">
      <TextField
        label={labelText}
        name={field}
        type={type}
        value={value}
        onChange={e => onChange(field, e.target.value)} // ensure handler works
        placeholder={`Enter ${labelText}`}
        className="w-full rounded border p-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// function EditStrategies({ setIsModalOpen, selectedRow, setEditModalData, forms = [], formKeys = [] }) {
//   const [form, setForm] = useState({
//     name: '',
//     form: '',
//     formKey: '',
//   });

//   const handleChange = (field, value) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   };
//   const handleSubmit = async e => {
//     e.preventDefault(); // prevent page refresh
//     console.log('Form values:', form);
//   };
//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {renderFormField('name', form.name, handleChange, 'text')}
//       {renderFormField('form', form.form, handleChange, 'select', forms)}
//       {renderFormField('strategies Key', form.formKey, handleChange, 'multi-select', formKeys)}
//       <div className="flex w-full justify-end">
//         <Button type="submit" label={'Save'} />
//       </div>
//     </form>
//   );
// }
function EditStrategies({ setIsModalOpen, selectedRow, setEditModalData, forms = [], formKeys = [] }) {
  const [form, setForm] = useState({
    name: '',
    form: '',
    formKey: [],
  });
  console.log('selectedRow', selectedRow);

  // ✅ Load values into form when editing
  useEffect(() => {
    if (selectedRow) {
      setForm({
        name: selectedRow.name || '',
        form: selectedRow.form || '',
        formKey: selectedRow.strategiesKey || [], // must match your DB field
      });
    }
  }, [selectedRow]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Updated form:', form);

    // pass updated data back to parent
    setEditModalData(form);
    setIsModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormField('name', form.name, handleChange, 'text')}
      {renderFormField('form', form.form, handleChange, 'select', forms)}
      {renderFormField('Strategie-Key', form.formKey, handleChange, 'multi-select', formKeys)}
      <div className="flex w-full justify-end">
        <Button type="submit" label="Save" />
      </div>
    </form>
  );
}

export default EditStrategies;
