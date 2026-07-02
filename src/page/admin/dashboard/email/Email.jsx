import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FiMoreVertical } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  useCreateEmailTemplateMutation,
  useUpdateSingleEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useAttachTemplateToFormMutation,
  useUnAttachedFormsListQuery,
} from "@/redux/apis/emailTemplateApis";
import { useGetMyAllFormsQuery } from "@/redux/apis/formApis";
import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import CustomLoading from "@/components/shared/small/CustomLoading";
import Checkbox from "@/components/shared/small/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/authApis";
import { userExist } from "@/redux/slices/authSlice";
import getEnv from "@/lib/env";
import { useScreenContext } from "@/hooks/useScreenContext";

const SERVER_URL = getEnv("SERVER_URL");
const emailTypes = [
  {
    label: "Otp Email Template",
    value: "otp_email_template",
  },
  {
    label: "Old Beneficial Owners Email Template",
    value: "old_beneficial_owners_email_template",
  },
  {
    label: "New Beneficial Owners Email Template",
    value: "new_beneficial_owners_email_template",
  },
  {
    label: "Form Forwarded Email Template",
    value: "form_forwarded_email_template",
  },
  {
    label: "Welcome Email Template",
    value: "welcome_email_template",
  },
  {
    label: "Rule Triggered Email Template",
    value: "rule_triggered_email_template",
  },
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "script",
  "indent",
  "direction",
  "color",
  "background",
  "align",
  "link",
  "image",
  "data",
];

const sedationKeywords = ["link", "otp", "email", "password", "frontEndUrl", "recipientName", "brandCompanyName"];
const Email = () => {
  const menuRef = useRef(null);
  const [viewModalData, setViewModalData] = useState(null);

  const { data: applicationForms } = useGetMyAllFormsQuery();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState({
    templateName: "",
    subject: "",
    emailType: "",
    body: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [createEmailTemplate] = useCreateEmailTemplateMutation();
  const [updateEmailTemplate] = useUpdateSingleEmailTemplateMutation();
  const [deleteEmailTemplate] = useDeleteSingleEmailTemplateMutation();
  const { data: emailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery();
  const [isAttachFormModalOpen, setIsAttachFormModalOpen] = useState(false);
  const [attachEmailTemplate] = useAttachTemplateToFormMutation();

  const templates = emailTemplates?.data;

  <ReactQuill
    className={`h-50 border ${!editData.body ? "border-accent" : "border-frameColor"}`}
    value={editData.body}
    onChange={(value) => handleChange("body", value)}
    modules={quillModules}
    formats={quillFormats}
    theme="snow"
    readOnly={isReadOnly}
  />;

  <div className="mt-2 flex flex-wrap gap-2 text-sm">
    {sedationKeywords?.map((keyword, idx) => (
      <span
        key={idx}
        className={`cursor-pointer rounded-md border px-2 py-1 ${
          editData.body.toLowerCase().includes(keyword.toLowerCase())
            ? "border-green-400 bg-green-100"
            : "border-gray-300 bg-gray-100"
        }`}
      >
        {keyword}
      </span>
    ))}
  </div>;

  // Register screen context so the AI chat widget knows what screen this is
  // and can draft/proofread/enhance the currently open template
  useScreenContext({
    screenId: viewModalData?._id
      ? `email-template-${viewModalData._id}`
      : viewModalData
        ? "email-template-new"
        : "email-template-list",
    screenName: viewModalData?._id
      ? `Email Template — ${editData.templateName || "Untitled"}`
      : viewModalData
        ? "Email Template (New)"
        : "Email Templates",
    assistantName: "Email Composition Assistant",
    description:
      "The Email Templates screen lets admins create and edit transactional email templates used throughout the onboarding platform. Templates support placeholder variables for personalisation.",
    aiEndpoint: `${SERVER_URL}/api/ai/email-chat`,
    greeting: viewModalData
      ? `Hi! I can see you have **${editData.templateName || "a template"}** open.\n\nI can help you:\n- **Draft** or rewrite the subject line and body\n- **Proofread and enhance** the existing content\n- **Reformat** for clarity and professionalism\n- **Insert variables** like {{recipientName}} or {{link}} where appropriate\n\nWhat would you like me to do?`
      : `Hi! I'm your email template assistant.\n\nI can help you:\n- **Draft** new email templates from scratch\n- **Proofread and enhance** existing content\n- **Reformat** templates for clarity and professionalism\n\nTo get started, please **open or create an email template** using the list below — I'll be ready to help once you do!`,
    currentState: {
      templateName: editData.templateName,
      emailType: editData.emailType,
      subject: editData.subject,
      body: editData.body,
      isReadOnly,
      availableVariables: sedationKeywords.map((k) => `{{${k}}}`).join(", "),
      // Derive attached forms from the live query rather than viewModalData so it auto-updates after attach/detach
      attachedForms: viewModalData?._id
        ? (templates?.find((t) => t._id === viewModalData._id)?.forms || []).map((f) => ({ _id: f._id, name: f.name }))
        : [],
      availableForms: (applicationForms?.data || []).map((f) => ({ _id: f._id, name: f.name })),
    },
    actions: {
      subject: (val) => handleChange("subject", val),
      body: (val) => handleChange("body", val),
      templateName: (val) => handleChange("templateName", val),
      emailType: (val) => handleChange("emailType", val),
      enableEdit: () => {
        setIsReadOnly(false);
        if (viewModalData?._id) setIsEdit(true);
      },
      saveEmailTemplate: () => handleSave(),
      attachToForms: async ({ formIds }) => {
        if (!viewModalData?._id) throw new Error("No template is currently open");
        await attachEmailTemplate({
          emailTemplateId: viewModalData._id,
          formIds,
        }).unwrap();
      },
    },
    deps: {
      viewModalOpen: !!viewModalData,
      viewModalDataId: viewModalData?._id,
      subject: editData.subject,
      body: editData.body,
      templateName: editData.templateName,
      attachedFormCount: viewModalData?._id
        ? (templates?.find((t) => t._id === viewModalData._id)?.forms || []).length
        : 0,
    },
  });

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log("Saved Data:", editData);

    try {
      const res = isEdit
        ? await updateEmailTemplate({
            id: viewModalData?._id,
            ...editData,
          }).unwrap()
        : await createEmailTemplate(editData).unwrap();

      if (res?.success) {
        toast.success(res.message);
      }

      setIsEdit(false);
      setViewModalData(null);
      setEditData({ templateName: "", subject: "", emailType: "", body: "" });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save template");
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setIsReadOnly(false);
    setViewModalData(item);
    setEditData(item);
    setMenuOpenId(null);
  };

  const handleAttachForms = (item) => {
    setIsAttachFormModalOpen(true);
    setSelectedTemplate(item);
    setMenuOpenId(null);
  };

  const handleView = (item) => {
    setIsReadOnly(true);
    setViewModalData(item);
    setEditData(item);
  };

  const handleCreate = () => {
    setIsReadOnly(false);
    setEditData({ templateName: "", subject: "", emailType: "", body: "" });
    setViewModalData({});
  };

  const handleDelete = async (item) => {
    try {
      const res = await deleteEmailTemplate({ emailTemplateId: item?._id }).unwrap();
      toast.success(res?.message || "Deleted successfully");
      setMenuOpenId(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete template");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div data-testid="email-page">
      {isAttachFormModalOpen && (
        <ModalForAttachForms
          refetchTemplates={refetchEmailTemplates}
          setIsAttachFormModalOpen={setIsAttachFormModalOpen}
          forms={applicationForms?.data}
          selectedTemplate={selectedTemplate}
        />
      )}
      {viewModalData && (
        <Modal
          onSave={!isReadOnly ? handleSave : () => setViewModalData(null)}
          saveButtonText={!isReadOnly ? "Save" : "Close"}
          title={isReadOnly ? "Template Details" : viewModalData._id ? "Edit Template" : "Create Template"}
          onClose={() => {
            (setViewModalData(null), setIsEdit(false));
          }}
        >
          <div className="mt-4 space-y-4 overflow-auto">
            <TextField
              label="Template Name"
              value={editData.templateName}
              onChange={(e) => handleChange("templateName", e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? "cursor-not-allowed" : ""}
              data-testid="email-name-input"
            />

            <div className="mb-4">
              <label className="text-textPrimary mb-1 block text-sm font-medium">Email Type</label>
              <select
                name={"emailType"}
                value={editData.emailType}
                onChange={(e) => handleChange("emailType", e.target.value)}
                data-testid="email-type-select"
                className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base`}
              >
                <option value="">Choose an option</option>
                {emailTypes?.map((opt) => (
                  <option key={opt?.value} value={opt?.value}>
                    {opt?.label}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Subject"
              value={editData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? "cursor-not-allowed" : ""}
              data-testid="email-subject-input"
            />

            <div className="custom-quill-wrapper" data-testid="email-body-editor">
              <ReactQuill
                className="custom-quill h-50"
                value={editData.body}
                onChange={(value) => handleChange("body", value)}
                modules={quillModules}
                formats={quillFormats}
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
                  {sedationKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      onClick={() => setEditData((prev) => ({ ...prev, body: `${prev.body} {{${keyword}}}` }))}
                      className={`cursor-pointer rounded-md border px-2 py-1 ${
                        editData.body.toLowerCase().includes(keyword.toLowerCase())
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
      )}

      <div className="flex items-center justify-between">
        <h1 className="mb-6 text-2xl font-semibold">Email Templates</h1>
        <Button label="Create Email Template" onClick={handleCreate} data-testid="email-create-btn" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map((item) => (
          <div
            key={item?._id}
            data-testid="email-card"
            className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="absolute top-4 right-4">
              <FiMoreVertical
                data-testid="email-card-menu-btn"
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setMenuOpenId(menuOpenId === item._id ? null : item._id)}
              />
              {menuOpenId === item._id && (
                <div
                  ref={menuRef}
                  className="absolute top-6 right-0 z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <button
                    data-testid="email-edit-btn"
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    data-testid="email-attach-btn"
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => handleAttachForms(item)}
                  >
                    Attach
                  </button>
                  <button
                    data-testid="email-delete-btn"
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-800">{item.templateName}</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-700">Subject</p>
                <p>{item.subject}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Application</p>
                <p>{item.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email Type</p>
                <p>{item.emailType}</p>
              </div>
            </div>
            <button
              data-testid="email-view-btn"
              onClick={() => handleView(item)}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Email;

const ModalForAttachForms = React.memo(({ setIsAttachFormModalOpen, selectedTemplate }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: unAttachedForms, isLoading: isLoadingUnAttachedForms } = useUnAttachedFormsListQuery(
    { emailTemplateId: selectedTemplate?._id },
    { skip: !selectedTemplate?._id },
  );
  const [getUserProfile, { isLoading: isLoadingUserProfile }] = useGetMyProfileFirstTimeMutation();
  const [selectedForms, setSelectedForms] = useState(selectedTemplate?.forms?.map((form) => form._id) || []);
  const [attachEmailToForms, { isLoading }] = useAttachTemplateToFormMutation();
  const [attachToMe, setAttachToMe] = useState(user?.welcomeMail === selectedTemplate?._id);

  const onSaveHandler = async () => {
    if (!selectedTemplate?._id) return toast.error("Please select template and forms");
    try {
      const res = await attachEmailToForms({
        emailTemplateId: selectedTemplate?._id,
        formIds: selectedForms?.length ? selectedForms : [],
        attachToMe: attachToMe,
      }).unwrap();
      if (res.success) {
        const userData = await getUserProfile().unwrap();
        if (userData?.success) {
          dispatch(userExist(userData?.data));
        }
        toast.success("Template attached to forms successfully");
        setIsAttachFormModalOpen(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to attach template to forms");
      console.log(error);
    }
  };

  return (
    <Modal
      isLoading={isLoading || isLoadingUserProfile}
      onSave={onSaveHandler}
      onClose={() => setIsAttachFormModalOpen(false)}
    >
      {isLoadingUnAttachedForms ? (
        <CustomLoading />
      ) : (
        <div className="p-4 min-h-[30vh]">
          <h2 className="mb-4 text-lg font-semibold">Attach To Forms</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Select Forms</label>
            <DropdownCheckbox
              options={unAttachedForms?.data?.map((item) => ({ label: item?.name, value: item?._id }))}
              selected={selectedForms}
              defaultText={`Select Forms`}
              onSelect={(vals) => setSelectedForms(vals)}
            />
          </div>
          {selectedTemplate.emailType === "welcome_email_template" && (
            <div className="flex justify-end">
              <Checkbox
                id="attachToMe"
                name="attachToMe"
                label="Attach to Me"
                onChange={(e) => setAttachToMe(e.target.checked)}
                value={attachToMe}
                checked={attachToMe}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
});
