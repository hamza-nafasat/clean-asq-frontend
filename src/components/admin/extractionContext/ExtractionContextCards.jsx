import React, { useEffect, useRef } from 'react';
import { FiEdit } from 'react-icons/fi';

function ExtractionContextCards({ title, section, subtitle, prompt }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea on mount + whenever prompt changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // reset
      textarea.style.height = `${textarea.scrollHeight}px`; // set to content
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
        <button type="button" className="hover:bg-backgroundColor rounded-lg p-2 transition-colors">
          <FiEdit className="text-textPrimary cursor-pointer text-lg" />
        </button>
      </div>

      {/* Textarea */}
      <div className="bg-backgroundColor mt-6 rounded-xl p-3">
        <textarea
          ref={textareaRef}
          className="text-textPrimary border-frameColor max-h-56 min-h-[2rem] w-full resize-none overflow-y-auto rounded-lg border bg-transparent p-2 placeholder-gray-400 outline-none"
          defaultValue={prompt}
          readOnly
        />
      </div>
    </div>
  );
}

export default ExtractionContextCards;
