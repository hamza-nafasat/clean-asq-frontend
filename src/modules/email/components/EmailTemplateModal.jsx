import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import SaveCancelModal from "@/components/modals/SaveCancelModal";
import TextField from "@/components/shared/TextField";
import { EMAIL_TEMPLATE_TYPES } from "@/constants";
import {
  EMAIL_TYPES,
  QUILL_FORMATS,
  QUILL_MODULES,
  RULE_TEMPLATE_KEYWORDS,
  TEMPLATE_FIELDS,
  TEMPLATE_KEYWORDS,
  TEMPLATE_MODAL_MODES,
} from "../utils/email.constants";

const MODAL_TITLES = {
  [TEMPLATE_MODAL_MODES.VIEW]: "Template Details",
  [TEMPLATE_MODAL_MODES.CREATE]: "Create Template",
  [TEMPLATE_MODAL_MODES.EDIT]: "Edit Template",
};

const TYPE_SELECT_ID = "email-template-type";
const BODY_ERROR_ID = "email-template-body-error";
const TYPE_ERROR_ID = "email-template-type-error";

const EmailTemplateModal = ({
  isOpen = false,
  mode = TEMPLATE_MODAL_MODES.VIEW,
  values = {},
  errors = {},
  onChange,
  onClose,
  onSubmit,
  onInsertKeyword,
}) => {
  if (!isOpen) return null;

  const isReadOnly = mode === TEMPLATE_MODAL_MODES.VIEW;
  const body = values[TEMPLATE_FIELDS.BODY] ?? "";
  const keywords =
    values[TEMPLATE_FIELDS.TYPE] === EMAIL_TEMPLATE_TYPES.RULE_TRIGGERED ? RULE_TEMPLATE_KEYWORDS : TEMPLATE_KEYWORDS;

  return (
    <SaveCancelModal
      onSave={isReadOnly ? onClose : onSubmit}
      saveButtonText={isReadOnly ? "Close" : "Save"}
      title={MODAL_TITLES[mode]}
      onClose={onClose}
    >
      <div className="mt-4 space-y-4 overflow-auto">
        <TextField
          label="Template Name"
          name={TEMPLATE_FIELDS.NAME}
          value={values[TEMPLATE_FIELDS.NAME]}
          onChange={(e) => onChange?.(TEMPLATE_FIELDS.NAME, e.target.value)}
          readOnly={isReadOnly}
          cn={isReadOnly ? "cursor-not-allowed" : ""}
          error={errors[TEMPLATE_FIELDS.NAME]}
          data-testid="email-name-input"
        />

        <div className="mb-4">
          <label htmlFor={TYPE_SELECT_ID} className="text-textPrimary mb-1 block text-sm font-medium">
            Email Type
          </label>
          <select
            id={TYPE_SELECT_ID}
            name={TEMPLATE_FIELDS.TYPE}
            value={values[TEMPLATE_FIELDS.TYPE]}
            onChange={(e) => onChange?.(TEMPLATE_FIELDS.TYPE, e.target.value)}
            disabled={isReadOnly}
            aria-invalid={Boolean(errors[TEMPLATE_FIELDS.TYPE])}
            aria-describedby={errors[TEMPLATE_FIELDS.TYPE] ? TYPE_ERROR_ID : undefined}
            data-testid="email-type-select"
            className="border-frameColor bg-fieldBackground h-11.25 w-full rounded-lg border px-4 text-sm text-gray-600 outline-none disabled:cursor-not-allowed md:h-12.5 md:text-base"
          >
            <option value="">Choose an option</option>
            {EMAIL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[TEMPLATE_FIELDS.TYPE] && (
            <p id={TYPE_ERROR_ID} className="mt-1 text-sm text-red-600">
              {errors[TEMPLATE_FIELDS.TYPE]}
            </p>
          )}
        </div>
        <TextField
          label="Subject"
          name={TEMPLATE_FIELDS.SUBJECT}
          value={values[TEMPLATE_FIELDS.SUBJECT]}
          onChange={(e) => onChange?.(TEMPLATE_FIELDS.SUBJECT, e.target.value)}
          readOnly={isReadOnly}
          cn={isReadOnly ? "cursor-not-allowed" : ""}
          error={errors[TEMPLATE_FIELDS.SUBJECT]}
          data-testid="email-subject-input"
        />

        <div className="custom-quill-wrapper" data-testid="email-body-editor">
          <ReactQuill
            className="custom-quill h-50"
            value={body}
            onChange={(value) => onChange?.(TEMPLATE_FIELDS.BODY, value)}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            theme="snow"
            readOnly={isReadOnly}
            style={{ "--border-color": body ? "var(--frameColor)" : "var(--accent)" }}
          />
        </div>

        <div className="mt-20">
          {errors[TEMPLATE_FIELDS.BODY] && (
            <p id={BODY_ERROR_ID} className="mb-2 text-sm text-red-600">
              {errors[TEMPLATE_FIELDS.BODY]}
            </p>
          )}
          {!isReadOnly && (
            <div className="mt-2 mb-4 flex flex-wrap gap-2 text-sm">
              {keywords.map((keyword) => (
                <button
                  type="button"
                  key={keyword}
                  onClick={() => onInsertKeyword?.(keyword)}
                  className={`cursor-pointer rounded-md border px-2 py-1 ${
                    body.toLowerCase().includes(keyword.toLowerCase())
                      ? "border-green-400 bg-green-100"
                      : "border-gray-300 bg-gray-100"
                  } hover:border-blue-400 hover:bg-blue-400 hover:text-white`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </SaveCancelModal>
  );
};

export default EmailTemplateModal;
