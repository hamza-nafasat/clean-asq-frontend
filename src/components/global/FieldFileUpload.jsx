import { useEffect, useRef, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";
import { PiFileArrowUpFill } from "react-icons/pi";
import { toast } from "react-toastify";

import Button from "@/components/shared/Button";
import AiFormattedText from "@/components/shared/AiFormattedText";
import { checkFieldFile, FIELD_FILE_ACCEPT, getFileNameFromUrl, isImageUpload } from "@/utils/fieldFile";
import { isEmptyFileValue } from "@/utils/fieldFormatting";

const ACTIVATE_KEYS = ["Enter", " "];

const FieldFileUpload = ({
  field = {},
  value,
  className = "",
  isDisabled = false,
  onFileSelect,
  children,
  ...rest
}) => {
  const { label, name, required, isDisplayText, ai_formatting } = field;
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  // restore a previously uploaded file from the draft
  useEffect(() => {
    const url = value?.secureUrl;
    if (!url || fileName) return;
    setFileName(getFileNameFromUrl(url));
    if (isImageUpload(value)) setPreviewUrl(url);
  }, [value, fileName]);

  const handleFile = (file) => {
    if (!file) return;
    const { error, isImage } = checkFieldFile(file);
    if (error) {
      toast.error(error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    onFileSelect?.(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleKeyDown = (e) => {
    if (isDisabled) return;
    if (ACTIVATE_KEYS.includes(e.key)) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const disabledClasses = isDisabled ? "opacity-70 cursor-not-allowed!" : "";

  return (
    <div className={`flex w-full flex-col items-start ${className}`} {...rest}>
      {label && (
        <label className="mb-2 block text-sm text-[#666666] lg:text-base">
          {label}:{required ? "*" : ""}
        </label>
      )}
      {ai_formatting && isDisplayText && (
        <AiFormattedText html={ai_formatting} className="flex h-full w-full flex-col gap-4 mb-2" />
      )}
      <div className="flex w-full gap-2 mt-2">
        <div className="w-full">
          <div
            className={`relative mt-2 flex h-70.75 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50 ${
              required && isEmptyFileValue(value) ? "border-accent bg-highlighting" : "border-gray-300"
            } ${disabledClasses}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={isDisabled ? undefined : () => inputRef.current?.click()}
            onKeyDown={handleKeyDown}
            tabIndex={isDisabled ? -1 : 0}
            role="button"
            aria-label="Upload file"
          >
            <PiFileArrowUpFill className="text-textPrimary text-8xl" />
            <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
            <h5 className="text-textPrimary">pdf, jpg, png, csv, txt, rtf up to 10MB</h5>
            <Button
              label="Select file"
              className={`text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500! ${disabledClasses}`}
              rightIcon={CgSoftwareUpload}
              disabled={isDisabled}
            />
            <input
              ref={inputRef}
              type="file"
              name={name}
              disabled={isDisabled}
              accept={FIELD_FILE_ACCEPT}
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
          </div>

          {fileName && <div className="mt-2 text-sm text-gray-700">Selected: {fileName}</div>}

          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />}

          {children}
        </div>
      </div>
    </div>
  );
};

export default FieldFileUpload;
