import React, { useEffect, useState } from 'react';
import TextField from '../shared/small/TextField';
import { FiEye } from 'react-icons/fi';

function CustomSection({ fields, name }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    const formFields = {};
    if (fields?.length) {
      fields?.forEach(field => {
        formFields[field?.label] = '';
      });
      setForm(formFields);
    }
  }, [fields]);
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">{name}</h1>
      <div className="mt-6 flex flex-col gap-4">
        {fields?.map((field, index) => (
          <TextField
            key={index}
            label={field?.label}
            value={form[field?.label]}
            onChange={e => setForm({ ...form, [field?.label]: e.target.value })}
            type={field?.type}
          />
        ))}
      </div>
    </div>
  );
}

export default CustomSection;
