import { useEffect, useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Button from "@/components/shared/Button";

const LookupManagementExtractionCards = ({
  title = "",
  section = "",
  label = "",
  id,
  subtitle = "",
  prompt = "",
  onUpdate,
  onCancel,
  setPrompts,
  isPreview = false,
  isUpdating = false,
}) => {
  const textareaRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);

  // grow textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleUpdate = async () => {
    const isSaved = await onUpdate?.(label, prompt, id);
    if (isSaved) setIsEdit(false);
  };

  const handleCancel = () => {
    onCancel?.(label);
    setIsEdit(false);
  };

  return (
    <article className="bg-backgroundColor border-frameColor rounded-xl border p-4">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-textPrimary text-lg font-semibold">{title}</h3>
            {section && (
              <span className="text-textPrimary border-frameColor flex h-6 shrink-0 items-center rounded-full border px-3 text-xs font-medium">
                {section}
              </span>
            )}
          </div>
          <p className="text-textPrimary text-sm opacity-80">{subtitle}</p>
        </div>

        {!isPreview &&
          (!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              type="button"
              aria-label={`Edit ${title}`}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <FiEdit size={18} className="text-textPrimary" />
            </button>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" label="Cancel" onClick={handleCancel} disabled={isUpdating} />
              <Button label="Update" onClick={handleUpdate} loading={isUpdating} />
            </div>
          ))}
      </header>

      <textarea
        ref={textareaRef}
        aria-label={title}
        className="text-textPrimary border-frameColor mt-4 max-h-56 min-h-8 w-full resize-none overflow-y-auto rounded-lg border bg-transparent p-2 placeholder-gray-400 outline-none"
        value={prompt}
        readOnly={!isEdit || !label}
        onChange={(e) => setPrompts?.((prev) => ({ ...prev, [label]: e.target.value }))}
      />
    </article>
  );
};

export default LookupManagementExtractionCards;
