import Button from '@/components/shared/small/Button';
import React, { useEffect, useRef, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

function ExtractionContextCards({
  title,
  section,
  label,
  id,
  subtitle,
  prompt,
  handler,
  setPrompts,
  isPreview = false,
}) {
  const textareaRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  return (
    <div className="bg-backgroundColor border-frameColor rounded-xl border p-4 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-textPrimary text-2xl font-semibold">{title}</h2>

            {/* ✅ Show only if section is passed */}
            {section && (
              <span className="bg-backgroundColor text-textPrimary border-frameColor flex h-6 items-center rounded-full border px-3 text-xs font-medium">
                {section}
              </span>
            )}
          </div>
          <p className="text-textPrimary text-sm opacity-80">{subtitle}</p>
        </div>

        {/* Edit Icon */}
        {!isPreview &&
          (!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              type="button"
              className="hover:bg-backgroundColor rounded-lg p-2 transition-colors"
            >
              <FiEdit className="text-textPrimary cursor-pointer text-lg" />
            </button>
          ) : (
            <div className="flex gap-4">
              <Button
                label="Update"
                onClick={() => handler(label, prompt, id, setIsEdit)}
                type="button"
                className="hover:bg-backgroundColor rounded-lg p-2 transition-colors"
              />

              <Button
                onClick={() => setIsEdit(false)}
                type="button"
                label={'Cancel'}
                className="hover:bg-backgroundColor rounded-lg p-2 transition-colors"
              />
            </div>
          ))}
      </div>

      {/* Textarea */}
      <div className="bg-backgroundColor mt-6 rounded-xl p-3">
        <textarea
          ref={textareaRef}
          className="text-textPrimary border-frameColor max-h-56 min-h-[2rem] w-full resize-none overflow-y-auto rounded-lg border bg-transparent p-2 placeholder-gray-400 outline-none"
          defaultValue={prompt}
          readOnly={!isEdit || !label}
          onChange={label ? e => setPrompts({ ...prompt, [label]: e.target.value }) : null}
        />
      </div>
    </div>
  );
}

export default ExtractionContextCards;
