import { useEffect, useRef, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";
import { PiFileArrowUpFill } from "react-icons/pi";
import { toast } from "react-toastify";

import Button from "@/components/shared/Button";
import AiFormattedText from "@/components/shared/AiFormattedText";
import { checkFieldFile, FIELD_FILE_ACCEPT, getFileNameFromUrl, isImageUpload } from "@/utils/fieldFile";
import { isEmptyFileValue } from "@/utils/fieldFormatting";

const ACTIVATE_KEYS = ["Enter", " "];
const UPLOADER_VARIANT = "uploader";
const UPLOADER_IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|gif|webp)$/i;
const CLOUDINARY_IMAGE_PATH = "/image/";
const CSV_EXTENSION = ".csv";
const DROPZONE_CLASSES =
  "relative mt-2 flex h-70.75 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50";
const SELECT_BUTTON_CLASSES = "text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500!";

// pdf, image or csv only
const checkUploaderFile = (file) => {
  const fileType = file.type;
  const isCSV = file.name.toLowerCase().endsWith(CSV_EXTENSION);
  if (!fileType.includes("image") && !fileType.includes("pdf") && !isCSV) {
    return { error: "Only PDF, image, or CSV files are allowed." };
  }
  return { isImage: fileType.includes("image") };
};

const FieldFileUpload = ({
  field = {},
  value,
  className = "",
  isDisabled = false,
  onFileSelect,
  children,
  variant = "field",
  accept = FIELD_FILE_ACCEPT,
  existingUrl = "",
  ...rest
}) => {
  const { label, name, required, isDisplayText, ai_formatting } = field;
  const isUploader = variant === UPLOADER_VARIANT;
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  // restore a previously uploaded file
  useEffect(() => {
    if (isUploader) {
      if (!existingUrl || fileName) return;
      setFileName(getFileNameFromUrl(existingUrl));
      if (UPLOADER_IMAGE_URL_PATTERN.test(existingUrl) || existingUrl.includes(CLOUDINARY_IMAGE_PATH)) {
        setPreviewUrl(existingUrl);
      }
      return;
    }
    const url = value?.secureUrl;
    if (!url || fileName) return;
    setFileName(getFileNameFromUrl(url));
    if (isImageUpload(value)) setPreviewUrl(url);
  }, [isUploader, existingUrl, value, fileName]);

  const handleFile = (file) => {
    if (!file) return;
    const { error, isImage } = isUploader ? checkUploaderFile(file) : checkFieldFile(file);
    if (error) {
      if (isUploader) {
        alert(error);
        return;
      }
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

  const dropzoneBody = (
    <>
      <PiFileArrowUpFill className="text-textPrimary text-8xl" />
      <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
      <h5 className="text-textPrimary">
        {isUploader ? ".pdf, .doc, .docx, .jpg, .png, .csv up to 10MB" : "pdf, jpg, png, csv, txt, rtf up to 10MB"}
      </h5>
      <Button
        label="Select file"
        className={isUploader ? SELECT_BUTTON_CLASSES : `${SELECT_BUTTON_CLASSES} ${disabledClasses}`}
        rightIcon={CgSoftwareUpload}
        disabled={isDisabled}
      />
      <input
        ref={inputRef}
        type="file"
        name={name}
        disabled={isDisabled}
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </>
  );

  const fileNameElement = fileName && (
    <div className="mt-2 text-sm text-gray-700">
      {isUploader && existingUrl && !previewUrl ? (
        <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Selected: {fileName}
        </a>
      ) : (
        <>Selected: {fileName}</>
      )}
    </div>
  );

  const previewElement = previewUrl && (
    <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />
  );

  if (isUploader) {
    return (
      <div className="w-full">
        <label className="mb-2 block text-sm text-[#666666] lg:text-base">{label}</label>
        <div
          className={DROPZONE_CLASSES}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
        >
          {dropzoneBody}
        </div>
        {fileNameElement}
        {previewElement}
      </div>
    );
  }

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
            className={`${DROPZONE_CLASSES} ${
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
            {dropzoneBody}
          </div>

          {fileNameElement}

          {previewElement}

          {children}
        </div>
      </div>
    </div>
  );
};

export default FieldFileUpload;
