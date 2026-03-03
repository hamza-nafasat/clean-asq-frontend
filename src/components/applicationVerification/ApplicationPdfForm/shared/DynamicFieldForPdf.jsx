import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useBranding } from "@/hooks/BrandingContext";
import { useFormateTextInMarkDownMutation } from "@/redux/apis/formApis";
import DOMPurify from "dompurify";
import { useRef, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";
import { IoEyeOffSharp } from "react-icons/io5";
import { PiFileArrowUpFill } from "react-icons/pi";
import { RxEyeOpen } from "react-icons/rx";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_TEXT_EXTENSIONS = [".csv", ".txt", ".rtf"];
const FORBIDDEN_EXTENSIONS = [".doc", ".docx", ".xls", ".xlsx"];

const SelectInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, options, name, uniqueId, required, placeholder, aiPrompt, aiResponse, isDisplayText, ai_formatting } =
    field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const selectHandler = (e) =>
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: e.target.value } },
    }));
  return (
    <>
      <div className={`flex w-full flex-col items-start ${className}`}>
        {openAiHelpModal && (
          <Modal onClose={() => setOpenAiHelpModal(false)}>
            <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
          </Modal>
        )}
        {label && (
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {label}:{required ? "*" : ""}
          </h4>
        )}
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col gap-4">
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                  if (match.includes("target=")) return match; // avoid duplicates
                  return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}
        <div className="flex w-full gap-2">
          <select
            name={name}
            disabled={isDisabledAllFields}
            required={required}
            value={form?.[uniqueId]?.value}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
            onChange={selectHandler}
          >
            <option value="">{placeholder ?? "Choose an option"}</option>
            {options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const MultiCheckboxInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, options, name, uniqueId, required, aiPrompt, aiResponse, isDisplayText, ai_formatting } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const multiCheckBoxHandler = (e) => {
    if (form?.[uniqueId]?.value?.includes(e.target.value)) {
      setForm((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [uniqueId]: { name: name, value: form?.[uniqueId]?.value?.filter((item) => item !== e.target.value) },
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [uniqueId]: { name: name, value: [...form[uniqueId].value, e.target.value] },
        },
      }));
    }
  };
  return (
    <div className={`flex w-full justify-between gap-8 ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      <h4 className="text-textPrimary min-w-[200px]lg:text-lg text-base font-medium">
        {label}:{required ? "*" : ""}
      </h4>
      {ai_formatting && isDisplayText && (
        <div className="gap-4p-4 flex h-full w-full flex-col">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full items-center gap-8">
        {options?.map((option, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <label htmlFor={option?.label} className="text-base text-gray-700 capitalize">
              {option?.label}
            </label>
            <input
              disabled={isDisabledAllFields}
              id={option?.label}
              type={"checkbox"}
              value={option?.value}
              checked={form?.[uniqueId]?.value?.includes(option?.value)}
              className={`text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
              required={required}
              onChange={multiCheckBoxHandler}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RadioInputType = ({ field, className, form, setForm, onChange, sectionKey }) => {
  const { label, options, name, uniqueId, required, aiPrompt, aiResponse, isDisplayText, ai_formatting } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const radioHandler = (option) =>
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: option.value } },
    }));
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 py-4">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full">
        <h4 className="text-textPrimary min-w-[200px] text-base font-medium lg:text-lg">
          {label}:{required ? "*" : ""}
        </h4>
      </div>
      <div className="border-b-2 py-6">
        <div className="grid grid-cols-3 gap-4 p-0">
          {options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2 p-2 text-start">
              <input
                disabled={isDisabledAllFields}
                aria-disabled={true}
                name={name}
                type={"radio"}
                id={option.value + index + name}
                value={option.value}
                checked={form?.[uniqueId]?.value === option.value}
                className={`text-textPrimary accent-primary size-5 ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                required={required}
                onChange={onChange ? onChange : () => radioHandler(option)}
              />
              <label htmlFor={option.value + index + name} className="text-textPrimary text-base">
                {option?.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckboxInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, aiPrompt, aiResponse, isDisplayText, ai_formatting, conditional_fields } =
    field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const singleCheckBoxHandler = (e) =>
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: e.target.checked } },
    }));
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex flex-col justify-between ${className}`}>
        {openAiHelpModal && (
          <Modal onClose={() => setOpenAiHelpModal(false)}>
            <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
          </Modal>
        )}
        {ai_formatting && isDisplayText && (
          <div className="flex h-full w-full flex-col gap-4 p-4 pb-0">
            <div
              className=""
              dangerouslySetInnerHTML={{
                __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                  if (match.includes("target=")) return match; // avoid duplicates
                  return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                }),
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 p-4">
            <input
              disabled={isDisabledAllFields}
              aria-disabled={isDisabledAllFields}
              type={"checkbox"}
              name={name}
              required={required}
              value={form?.[uniqueId]?.value}
              checked={form?.[uniqueId]?.value}
              className={`text-primary accent-primary focus:ring-primary border-frameColor h-4 w-4 rounded ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
              onChange={singleCheckBoxHandler}
            />
            {label && (
              <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                {label} {required ? "*" : ""}
              </h4>
            )}
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2 px-6">
        {form?.[uniqueId]?.value && conditional_fields?.length
          ? conditional_fields?.map((f, index) => {
              const fieldName = `${uniqueId}/${f?.name}`;
              return (
                <div className="flex w-full flex-col gap-2" key={index}>
                  <TextField
                    disabled={isDisabledAllFields}
                    value={form?.[fieldName]?.value}
                    type={f?.type}
                    label={f?.label}
                    name={fieldName}
                    required={f?.required}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          [e.target.name]: { name: e.target.name, value: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

const RangeInputType = ({ field, className, form, setForm, sectionKey }) => {
  const {
    label,
    name,
    uniqueId,
    required,
    minValue = 0,
    maxValue = 100,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
  } = field;
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const onRangeChange = (e) => {
    const targetVAlue = String(e.target.value);
    if (targetVAlue > maxValue || targetVAlue < minValue) return;
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: targetVAlue } },
    }));
  };
  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      {label && (
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">
          {label}:{required ? "*" : ""}
        </h4>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 p-4">
          <div
            className=""
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className={`relative w-full ${label ? "mt-2" : ""}`}>
        <div className="mb-2 w-full text-center text-sm font-semibold text-gray-700">
          {Number(form?.[uniqueId]?.value) || 0} %
        </div>
        <input
          disabled={isDisabledAllFields}
          aria-disabled={isDisabledAllFields}
          value={Number(form?.[uniqueId]?.value) || 0}
          type="range"
          className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
          onChange={onRangeChange}
        />
        <div className="flex w-full gap-2">
          <input
            disabled={isDisabledAllFields}
            aria-disabled={isDisabledAllFields}
            type="number"
            value={Number(form?.[uniqueId]?.value) || 0}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
            onChange={onRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

const FileInputType = ({ field, className, form, setForm, sectionKey }) => {
  const { label, name, uniqueId, required, aiHelp, aiPrompt, aiResponse, isDisplayText, ai_formatting } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const fileHandler = (file) => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const mimeType = file.type;

    // ---- hard reject forbidden formats ----
    if (FORBIDDEN_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext))) {
      toast.error("DOC and Excel files are not allowed");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf = mimeType === "application/pdf" || fileNameLower.endsWith(".pdf");
    const isText = mimeType.startsWith("text/") || ALLOWED_TEXT_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));

    if (!isImage && !isPdf && !isText) {
      toast.error("Unsupported file type");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: { file } } },
    }));

    // Set preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) fileHandler(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) fileHandler(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className={`flex w-full flex-col items-start ${className}`}>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}
      {label && (
        <label className="mb-2 block text-sm text-[#666666] lg:text-base">
          {label}:{required ? "*" : ""}
        </label>
      )}
      {ai_formatting && isDisplayText && (
        <div className="flex h-full w-full flex-col gap-4 mb-2">
          <div
            dangerouslySetInnerHTML={{
              __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      <div className="flex w-full gap-2 mt-2">
        <div className="w-full">
          <div
            className={`relative mt-2 flex h-[283px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50 ${isDisabledAllFields ? "opacity-70 cursor-not-allowed!" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={isDisabledAllFields ? undefined : () => inputRef.current?.click()}
          >
            <PiFileArrowUpFill className="text-textPrimary text-8xl" />
            <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
            <h5 className="text-textPrimary">pdf, jpg, png, csv, txt, rtf up to 10MB</h5>
            <Button
              label={"Select file"}
              className={`text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500! ${isDisabledAllFields ? "opacity-70 cursor-not-allowed!" : ""}`}
              rightIcon={CgSoftwareUpload}
              disabled={isDisabledAllFields}
            />
            <input
              ref={inputRef}
              type="file"
              name={name}
              disabled={isDisabledAllFields}
              accept="image/*,application/pdf,text/csv,text/plain,application/rtf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {fileName && <div className="mt-2 text-sm text-gray-700">Selected: {fileName}</div>}

          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />}
          {form?.[uniqueId]?.value?.secureUrl && form?.[uniqueId]?.value?.resourceType == "raw" && (
            <Button
              label="Download"
              variant="secondary"
              onClick={() => window.open(form?.[uniqueId]?.value?.secureUrl, "_blank")}
            />
          )}
          {form?.[uniqueId]?.value?.secureUrl && form?.[uniqueId]?.value?.resourceType !== "raw" && (
            <img src={form?.[uniqueId]?.value?.secureUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />
          )}
        </div>
        {aiHelp && (
          <div className="flex items-center">
            <Button label="Help" className="max-h-fit! text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

const OtherInputType = ({ field, className, form, setForm, isConfirmField, sectionKey }) => {
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  let {
    type,
    label,
    name,
    uniqueId,
    required,
    formatting,
    placeholder,
    isMasked,
    aiPrompt,
    aiResponse,
    isDisplayText,
    ai_formatting,
  } = field;

  if (name.includes("ssn")) formatting = "3,2,4";
  if (name.includes("phone")) formatting = "3,3,4";

  const inputRef = useRef(null);
  const [showMasked, setShowMasked] = useState(isMasked ? true : false);
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(/[-/]/);
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(/[-\s/]/);
    return `${year}-${month}-${day}`;
  };

  const getDisplayValue = (type, value) => {
    if (!value) return "";
    // Masked logic
    if (showMasked && isMasked) return "*".repeat(value.toString().length);
    // Date formatting
    if (type === "date") return formatDate(value);
    // Dynamic formatting logic
    const format = formatting?.split(",");
    if (format && Array.isArray(format) && format.length > 0) {
      const digits = value.toString().replace(/\D/g, "");
      let formatted = "";
      let start = 0;
      for (let i = 0; i < format.length; i++) {
        const len = parseInt(format[i], 10);
        if (start >= digits.length) break;
        const part = digits.substr(start, len);
        formatted += part;
        start += len;
        // Add a dash if not the last group and still have remaining digits
        if (i < format.length - 1 && start < digits.length) {
          formatted += "-";
        }
      }
      // If there are still digits left after pattern ends, append them
      if (start < digits.length) {
        formatted += "-" + digits.substr(start);
      }

      return formatted;
    }
    return value;
  };

  return (
    <>
      {openAiHelpModal && (
        <Modal onClose={() => setOpenAiHelpModal(false)}>
          <AiHelpModal aiPrompt={aiPrompt} aiResponse={aiResponse} setOpenAiHelpModal={setOpenAiHelpModal} />
        </Modal>
      )}

      <div className="flex w-full flex-col items-start gap-4">
        <article className="flex w-full flex-col items-start gap-2">
          {ai_formatting && isDisplayText && (
            <div className="gap-4p-4 flex h-full w-full flex-col">
              <div
                dangerouslySetInnerHTML={{
                  __html: String(ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                    if (match.includes("target=")) return match; // avoid duplicates
                    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                  }),
                }}
              />
            </div>
          )}

          <section className="flex w-full gap-2">
            <div className={`w-full ${label ? "mt-2" : ""}`}>
              {label && (
                <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                  {label}:{required ? "*" : ""}
                </h4>
              )}

              {type === "textarea" ? (
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    disabled={isDisabledAllFields}
                    name={uniqueId}
                    placeholder={placeholder}
                    value={getDisplayValue(type, form?.[uniqueId]?.value)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [sectionKey]: { ...prev[sectionKey], [uniqueId]: { name: name, value: e.target.value } },
                      }))
                    }
                    onFocus={() => setShowMasked(false)}
                    onBlur={() => setShowMasked(true)}
                    readOnly={showMasked}
                    autoComplete="off"
                    className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
                      required && isEmpty(form?.[uniqueId]?.value)
                        ? "border-accent border-2"
                        : "border-frameColor border"
                    } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                    {...(isConfirmField
                      ? {
                          onPaste: (e) => e.preventDefault(),
                          onCopy: (e) => e.preventDefault(),
                          onCut: (e) => e.preventDefault(),
                        }
                      : {})}
                  />
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={inputRef}
                    name={name}
                    disabled={isDisabledAllFields}
                    aria-disabled={isDisabledAllFields}
                    placeholder={placeholder}
                    type={isMasked && type !== "date" ? "text" : type}
                    value={getDisplayValue(type, form?.[uniqueId]?.value)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          [uniqueId]: {
                            name: name,
                            value: type === "date" ? normalizeDate(e.target.value) : e.target.value,
                          },
                        },
                      }))
                    }
                    onFocus={() => {
                      setShowMasked(false);
                    }}
                    onBlur={() => {
                      setShowMasked(true);
                    }}
                    readOnly={showMasked}
                    autoComplete="off"
                    className={`h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${className} ${
                      required && isEmpty(form?.[uniqueId]?.value)
                        ? "border-accent border-2"
                        : "border-frameColor border"
                    } ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                    {...(isConfirmField
                      ? {
                          onPaste: (e) => e.preventDefault(),
                          onCopy: (e) => e.preventDefault(),
                          onCut: (e) => e.preventDefault(),
                        }
                      : {})}
                  />

                  {isMasked && (
                    <span
                      onClick={() => setShowMasked(!showMasked)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
                    >
                      {!showMasked ? <RxEyeOpen className="h-5 w-5" /> : <IoEyeOffSharp className="h-5 w-5" />}
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        </article>
      </div>
    </>
  );
};

const AiHelpModal = ({ aiResponse }) => {
  const [updateAiPrompt, setUpdateAiPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [formateTextInMarkDown, { isLoading }] = useFormateTextInMarkDownMutation();
  const { logo } = useBranding();

  const getResponseFromAi = async () => {
    if (!updateAiPrompt.trim()) return toast.error("Please enter a prompt");

    // Add user message
    setChatHistory((prev) => [...prev, { role: "user", content: updateAiPrompt }]);

    try {
      const res = await formateTextInMarkDown({
        text: "You are an expert AI. Give an accurate HTML formatted answer to this prompt: " + updateAiPrompt,
      }).unwrap();

      if (res.success) {
        const html = DOMPurify.sanitize(res.data);
        setChatHistory((prev) => [...prev, { role: "ai", content: html }]);
        setUpdateAiPrompt("");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to get AI response");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-center">
        <img src={logo} alt="Logo" className="h-20 w-20" />
      </div>
      <div className="flex flex-col items-start gap-2 border-2 p-4">
        <div
          className=""
          dangerouslySetInnerHTML={{
            __html: String(aiResponse || "").replace(/<a(\s+.*?)?>/g, (match) => {
              if (match.includes("target=")) return match; // avoid duplicates
              return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
            }),
          }}
        />
      </div>
      {chatHistory?.length > 0 ? (
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg border bg-[#FAFBFF] p-4">
          {chatHistory?.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${
                msg.role === "user" ? "self-end bg-blue-100 text-gray-800" : "self-start bg-gray-100 text-gray-700"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: String(msg.content || "").replace(/<a(\s+.*?)?>/g, (match) => {
                    if (match.includes("target=")) return match; // avoid duplicates
                    return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                  }),
                }}
                className="prose prose-sm max-w-none"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          placeholder="ask additional question(s)"
          type="text"
          value={updateAiPrompt}
          onChange={(e) => setUpdateAiPrompt(e.target.value)}
          className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
        />
        <Button className="text-nowrap" label="Get Response" onClick={getResponseFromAi} loading={isLoading} />
      </div>
    </div>
  );
};

export {
  AiHelpModal,
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
};
