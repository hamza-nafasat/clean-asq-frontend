import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useAttachTemplateToFormMutation,
  useCreateEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useUpdateSingleEmailTemplateMutation,
} from "@/redux/apis/email.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import { FiMail } from "react-icons/fi";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import EmailAttachFormsModal from "@/modules/email/components/EmailAttachFormsModal";
import EmailTemplateCard from "@/modules/email/components/EmailTemplateCard";
import EmailTemplateModal from "@/modules/email/components/EmailTemplateModal";
import { INITIAL_EDIT_DATA, TEMPLATE_KEYWORDS, TEMPLATE_OPEN_MODES } from "@/modules/email/utils/email.constants";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";

const SERVER_URL = getEnv("SERVER_URL");

const Email = () => {
  const menuRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [viewModalData, setViewModalData] = useState(null);

  const canCreateEmail = usePermission(PERMISSIONS.CREATE_EMAIL);
  const canUpdateEmail = usePermission(PERMISSIONS.UPDATE_EMAIL);
  const canDeleteEmail = usePermission(PERMISSIONS.DELETE_EMAIL);
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);
  const { data: applicationForms } = useGetMyAllFormsQuery(undefined, { skip: !canReadForm });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState(INITIAL_EDIT_DATA);
  const [isEdit, setIsEdit] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  // latest state for screen context actions
  const latestRef = useRef({ editData, isEdit, viewModalData });
  latestRef.current = { editData, isEdit, viewModalData };

  const [createEmailTemplate] = useCreateEmailTemplateMutation();
  const [updateEmailTemplate] = useUpdateSingleEmailTemplateMutation();
  const [deleteEmailTemplate] = useDeleteSingleEmailTemplateMutation();
  const { data: emailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery();
  const [isAttachFormModalOpen, setIsAttachFormModalOpen] = useState(false);
  const [attachEmailTemplate] = useAttachTemplateToFormMutation();

  const templates = emailTemplates?.data;

  const findTemplate = (templateId) => {
    const template = (templates || []).find((t) => String(t._id) === String(templateId));
    if (!template) throw new Error(`Template not found`);
    return template;
  };

  const openTemplate = (template, mode) => {
    if (mode === TEMPLATE_OPEN_MODES.EDIT) {
      handleEdit(template);
    } else {
      handleView(template);
    }
  };

  // register screen context for the ai chat widget
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
      screenState: viewModalData?._id ? "edit" : viewModalData ? "create" : "list",
      templateName: editData.templateName,
      emailType: editData.emailType,
      subject: editData.subject,
      body: editData.body,
      isReadOnly,
      availableVariables: TEMPLATE_KEYWORDS.map((k) => `{{${k}}}`).join(", "),
      templates: (templates || []).map((t) => ({
        _id: t._id,
        templateName: t.templateName,
        emailType: t.emailType,
        subject: t.subject,
        attachedForms: (t.forms || []).map((f) => ({ _id: f._id, name: f.name })),
      })),
      // derived from the live query so it updates after attach
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
      saveAndAttachToForms: async ({ formIds }) => {
        const id = latestRef.current.viewModalData?._id;
        if (!id) throw new Error("No template is currently open");
        await handleSave();
        await attachEmailTemplate({ emailTemplateId: id, formIds, attachToMe: user?.welcomeMail === id }).unwrap();
      },
      attachToForms: async ({ attachments = [] }) => {
        const failedTemplates = [];
        // sequential so earlier detaches free forms
        for (const { templateId, formIds = [] } of attachments) {
          const id = templateId || viewModalData?._id;
          try {
            if (!id) throw new Error("No template specified");
            // keep the owner's welcome mail setting
            await attachEmailTemplate({ emailTemplateId: id, formIds, attachToMe: user?.welcomeMail === id }).unwrap();
          } catch (error) {
            console.error("Attach template error:", error);
            failedTemplates.push(
              templates?.find((t) => String(t._id) === String(id))?.templateName || id || "a template",
            );
          }
        }
        if (failedTemplates.length) throw new Error(`Could not update ${failedTemplates.join(", ")}`);
      },
      openTemplate: ({ templateId, mode }) => {
        openTemplate(findTemplate(templateId), mode);
      },
      createTemplate: () => handleCreate(),
      closeTemplate: () => {
        setViewModalData(null);
        setIsEdit(false);
      },
      saveAndOpenTemplate: async ({ templateId, mode }) => {
        await handleSave();
        openTemplate(findTemplate(templateId), mode);
      },
      switchTemplate: ({ templateId, mode }) => {
        const template = findTemplate(templateId);
        setViewModalData(null);
        setIsEdit(false);
        openTemplate(template, mode);
      },
      deleteTemplate: async ({ templateId }) => {
        findTemplate(templateId);
        await deleteEmailTemplate({ emailTemplateId: templateId }).unwrap();
      },
    },
    deps: {
      viewModalOpen: !!viewModalData,
      viewModalDataId: viewModalData?._id,
      subject: editData.subject,
      body: editData.body,
      templateName: editData.templateName,
      templatesCount: templates?.length,
      attachedFormCount: viewModalData?._id
        ? (templates?.find((t) => t._id === viewModalData._id)?.forms || []).length
        : 0,
    },
  });

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsertKeyword = (keyword) => {
    setEditData((prev) => ({ ...prev, body: `${prev.body} {{${keyword}}}` }));
  };

  const handleSave = async () => {
    // read latest state from the ref
    const { editData: data, isEdit: edit, viewModalData: vmd } = latestRef.current;

    try {
      const res = edit
        ? await updateEmailTemplate({
            id: vmd?._id,
            ...data,
          }).unwrap()
        : await createEmailTemplate(data).unwrap();

      if (res?.success) {
        toast.success(res.message);
      }

      setIsEdit(false);
      setViewModalData(null);
      setEditData(INITIAL_EDIT_DATA);
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
    setEditData(INITIAL_EDIT_DATA);
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

  const handleCloseTemplate = () => {
    setViewModalData(null);
    setIsEdit(false);
  };

  const handleToggleMenu = (item) => {
    setMenuOpenId(menuOpenId === item._id ? null : item._id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div data-testid="email-page">
      {isAttachFormModalOpen && (
        <EmailAttachFormsModal
          refetchTemplates={refetchEmailTemplates}
          setIsAttachFormModalOpen={setIsAttachFormModalOpen}
          forms={applicationForms?.data}
          selectedTemplate={selectedTemplate}
        />
      )}
      {viewModalData && (
        <EmailTemplateModal
          template={viewModalData}
          editData={editData}
          isReadOnly={isReadOnly}
          onSave={!isReadOnly ? handleSave : () => setViewModalData(null)}
          onClose={handleCloseTemplate}
          onChange={handleChange}
          onInsertKeyword={handleInsertKeyword}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="mb-6 text-2xl font-semibold">Email Templates</h1>
        {canCreateEmail && (
          <Button label="Create Email Template" onClick={handleCreate} data-testid="email-create-btn" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map((item) => (
          <EmailTemplateCard
            key={item?._id}
            item={item}
            isMenuOpen={menuOpenId === item._id}
            menuRef={menuRef}
            onToggleMenu={handleToggleMenu}
            onEdit={canUpdateEmail ? handleEdit : null}
            onAttach={canUpdateEmail && canReadForm ? handleAttachForms : null}
            onDelete={canDeleteEmail ? handleDelete : null}
            onView={handleView}
          />
        ))}
        {templates && !templates.length && (
          <EmptyState
            variant="panel"
            className="col-span-full"
            icon={<FiMail size={28} />}
            title="No email templates yet"
            description="Create a template to send branded emails."
          />
        )}
      </div>
    </div>
  );
};

export default Email;
