import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Modal from "@/components/modals/SaveCancelModal";
import TextField from "@/components/shared/TextField";
import { EMAIL_TYPES, QUILL_FORMATS, QUILL_MODULES, TEMPLATE_KEYWORDS } from "@/modules/email/utils/email.constants";

const EmailTemplateModal = ({
  template = {},
  editData = {},
  isReadOnly = true,
  onSave,
  onClose,
  onChange,
  onInsertKeyword,
}) => {
  const body = editData?.body ?? "";

  return (
    <Modal
      onSave={onSave}
      saveButtonText={!isReadOnly ? "Save" : "Close"}
      title={isReadOnly ? "Template Details" : template?._id ? "Edit Template" : "Create Template"}
      onClose={onClose}
    >
      <div className="mt-4 space-y-4 overflow-auto">
        <TextField
          label="Template Name"
          value={editData.templateName}
          onChange={(e) => onChange?.("templateName", e.target.value)}
          readOnly={isReadOnly}
          cn={isReadOnly ? "cursor-not-allowed" : ""}
          data-testid="email-name-input"
        />

        <div className="mb-4">
          <label className="text-textPrimary mb-1 block text-sm font-medium">Email Type</label>
          <select
            name="emailType"
            value={editData.emailType}
            onChange={(e) => onChange?.("emailType", e.target.value)}
            data-testid="email-type-select"
            className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base`}
          >
            <option value="">Choose an option</option>
            {EMAIL_TYPES.map((opt) => (
              <option key={opt?.value} value={opt?.value}>
                {opt?.label}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Subject"
          value={editData.subject}
          onChange={(e) => onChange?.("subject", e.target.value)}
          readOnly={isReadOnly}
          cn={isReadOnly ? "cursor-not-allowed" : ""}
          data-testid="email-subject-input"
        />

        <div className="custom-quill-wrapper" data-testid="email-body-editor">
          <ReactQuill
            className="custom-quill h-50"
            value={editData.body}
            onChange={(value) => onChange?.("body", value)}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            theme="snow"
            readOnly={isReadOnly}
            style={{
              "--border-color": editData.body ? "var(--frameColor)" : "var(--accent)",
            }}
          />
        </div>

        <div className="mt-20">
          {!isReadOnly && (
            <div className="mt-2 mb-4 flex flex-wrap gap-2 text-sm">
              {TEMPLATE_KEYWORDS.map((keyword, idx) => (
                <span
                  key={idx}
                  onClick={() => onInsertKeyword?.(keyword)}
                  className={`cursor-pointer rounded-md border px-2 py-1 ${
                    body.toLowerCase().includes(keyword.toLowerCase())
                      ? "border-green-400 bg-green-100"
                      : "border-gray-300 bg-gray-100"
                  } hover:border-blue-400 hover:bg-blue-400 hover:text-white`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EmailTemplateModal;
