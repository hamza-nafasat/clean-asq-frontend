import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMail, FiSearch } from "react-icons/fi";
import {
  useAttachTemplateToFormMutation,
  useCreateEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useUpdateSingleEmailTemplateMutation,
} from "@/redux/apis/email.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import useListFilter from "@/hooks/useListFilter";
import usePermission from "@/hooks/usePermission";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import ListFilter from "@/components/global/ListFilter";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import useEmailAttachToMe from "./hooks/useEmailAttachToMe";
import useEmailScreenContext from "./hooks/useEmailScreenContext";
import EmailAttachFormsModal from "./components/EmailAttachFormsModal";
import EmailHeading from "./components/EmailHeading";
import EmailTemplateCard from "./components/EmailTemplateCard";
import EmailTemplateModal from "./components/EmailTemplateModal";
import {
  EMAIL_FILTER_KEYS,
  EMAIL_FILTER_FIELDS,
  INITIAL_EDIT_DATA,
  INITIAL_EMAIL_FILTERS,
  TEMPLATE_MODAL_MODES,
  TEMPLATE_OPEN_MODES,
} from "./utils/email.constants";
import { buildFormFilterOptions, filterTemplates, pickTemplateFields, validateTemplate } from "./utils/email.utils";
import confirmOrCancel from "@/utils/confirmOrCancel";
import { PERMISSIONS } from "@/utils/permissions";

const Email = () => {
  const { user } = useSelector((state) => state.auth);
  const [modalMode, setModalMode] = useState(null);
  const [openTemplate, setOpenTemplate] = useState(null);
  const [values, setValues] = useState(INITIAL_EDIT_DATA);
  const [errors, setErrors] = useState({});
  const [templateToAttach, setTemplateToAttach] = useState(null);

  const canCreateEmail = usePermission(PERMISSIONS.CREATE_EMAIL);
  const canUpdateEmail = usePermission(PERMISSIONS.UPDATE_EMAIL);
  const canDeleteEmail = usePermission(PERMISSIONS.DELETE_EMAIL);
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);
  const { data: applicationForms } = useGetMyAllFormsQuery(undefined, { skip: !canReadForm });
  const { data: emailTemplates, isLoading, isError, refetch } = useGetAllEmailTemplatesQuery();
  const [createEmailTemplate, { isLoading: isCreating }] = useCreateEmailTemplateMutation();
  const [updateEmailTemplate, { isLoading: isUpdating }] = useUpdateSingleEmailTemplateMutation();
  const [deleteEmailTemplate] = useDeleteSingleEmailTemplateMutation();
  const [attachEmailTemplate] = useAttachTemplateToFormMutation();
  const { openRowId, toggleMenu, setOpenRowId, getRowRef } = useRowActionMenu({ closeOnOutsideClick: true });
  const confirm = useConfirm();

  const templates = emailTemplates?.data ?? [];
  const {
    filters,
    handleChange: handleFilterChange,
    clearFilters,
    hasActiveFilters,
  } = useListFilter(INITIAL_EMAIL_FILTERS);
  const filteredTemplates = filterTemplates(templates, filters);
  const formFilterOptions = buildFormFilterOptions(templates);
  const filterFields = EMAIL_FILTER_FIELDS.map((field) =>
    field.name === EMAIL_FILTER_KEYS.FORM ? { ...field, options: formFilterOptions } : field,
  );
  const attachTemplateToMe = useEmailAttachToMe({ templates, askConfirm: confirm.ask });

  // latest state for ai actions
  const latestRef = useRef({ values, modalMode, openTemplate });
  latestRef.current = { values, modalMode, openTemplate };

  const findTemplate = (templateId) => {
    const template = templates.find((item) => String(item._id) === String(templateId));
    if (!template) throw new Error("Template not found");
    return template;
  };

  const showTemplate = (template, mode) => {
    setOpenTemplate(template);
    setValues(pickTemplateFields(template));
    setErrors({});
    setModalMode(mode);
    setOpenRowId(null);
  };

  const handleView = (template) => showTemplate(template, TEMPLATE_MODAL_MODES.VIEW);
  const handleEdit = (template) => showTemplate(template, TEMPLATE_MODAL_MODES.EDIT);
  const openByMode = (template, mode) => (mode === TEMPLATE_OPEN_MODES.EDIT ? handleEdit : handleView)(template);

  const handleCreate = () => {
    setOpenTemplate(null);
    setValues(INITIAL_EDIT_DATA);
    setErrors({});
    setModalMode(TEMPLATE_MODAL_MODES.CREATE);
  };

  const handleClose = () => {
    setModalMode(null);
    setOpenTemplate(null);
  };

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleInsertKeyword = (keyword) => {
    setValues((prev) => ({ ...prev, body: `${prev.body} {{${keyword}}}` }));
  };

  // true once saved; edits ask first
  const saveTemplate = async () => {
    const { values: data, modalMode: mode, openTemplate: template } = latestRef.current;
    const nextErrors = validateTemplate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return false;
    const isEdit = mode === TEMPLATE_MODAL_MODES.EDIT && template?._id;
    if (isEdit) {
      const isConfirmed = await confirm.ask({
        title: "Save Template",
        message: `Save the changes to "${data.templateName}"?`,
        confirmButtonText: "Save",
      });
      if (!isConfirmed) return false;
    }
    try {
      const res = isEdit
        ? await updateEmailTemplate({ id: template._id, ...pickTemplateFields(data) }).unwrap()
        : await createEmailTemplate(pickTemplateFields(data)).unwrap();
      toast.success(res.message);
      handleClose();
      setValues(INITIAL_EDIT_DATA);
      return true;
    } catch (error) {
      console.error("Save template error:", error);
      toast.error(error?.data?.message || "Failed to save template");
      return false;
    }
  };

  const deleteTemplate = async (template) => {
    const res = await deleteEmailTemplate({ emailTemplateId: template._id }).unwrap();
    toast.success(res.message);
  };

  const buildDeleteConfirm = (template) => ({
    title: "Delete Template",
    message: `Delete "${template.templateName}"? This can't be undone.`,
    confirmButtonText: "Delete",
  });

  // every delete asks first
  const handleDelete = async (template) => {
    setOpenRowId(null);
    if (!(await confirm.ask(buildDeleteConfirm(template)))) return;
    try {
      await deleteTemplate(template);
    } catch (error) {
      console.error("Delete template error:", error);
      toast.error(error?.data?.message || "Failed to delete template");
    }
  };

  const handleAttach = (template) => {
    setTemplateToAttach(template);
    setOpenRowId(null);
  };

  // keep the owner's welcome mail setting
  const attachForms = (templateId, formIds) =>
    attachEmailTemplate({
      emailTemplateId: templateId,
      formIds,
      attachToMe: user?.welcomeMail === templateId,
    }).unwrap();

  const saveOrThrow = async () => {
    if (!(await saveTemplate())) throw new Error("The template was not saved");
  };

  useEmailScreenContext({
    user,
    templates,
    forms: applicationForms?.data ?? [],
    openTemplate,
    modalMode,
    values,
    actions: {
      subject: (value) => handleChange("subject", value),
      body: (value) => handleChange("body", value),
      templateName: (value) => handleChange("templateName", value),
      emailType: (value) => handleChange("emailType", value),
      enableEdit: () => setModalMode(openTemplate?._id ? TEMPLATE_MODAL_MODES.EDIT : TEMPLATE_MODAL_MODES.CREATE),
      saveEmailTemplate: saveOrThrow,
      saveAndAttachToForms: async ({ formIds }) => {
        const templateId = latestRef.current.openTemplate?._id;
        if (!templateId) throw new Error("No template is currently open");
        await saveOrThrow();
        await attachForms(templateId, formIds);
      },
      attachToForms: async ({ attachments = [] }) => {
        const failedTemplates = [];
        // sequential so earlier detaches free forms
        for (const { templateId, formIds = [] } of attachments) {
          const id = templateId || openTemplate?._id;
          try {
            if (!id) throw new Error("No template specified");
            await attachForms(id, formIds);
          } catch (error) {
            console.error("Attach template error:", error);
            failedTemplates.push(
              templates.find((item) => String(item._id) === String(id))?.templateName || id || "a template",
            );
          }
        }
        if (failedTemplates.length) throw new Error(`Could not update ${failedTemplates.join(", ")}`);
      },
      [AI_TOOLS.ATTACH_TEMPLATE_TO_ME]: attachTemplateToMe,
      openTemplate: ({ templateId, mode }) => openByMode(findTemplate(templateId), mode),
      createTemplate: handleCreate,
      closeTemplate: handleClose,
      saveAndOpenTemplate: async ({ templateId, mode }) => {
        await saveOrThrow();
        openByMode(findTemplate(templateId), mode);
      },
      switchTemplate: ({ templateId, mode }) => openByMode(findTemplate(templateId), mode),
      deleteTemplate: async ({ templateId }) => {
        const template = findTemplate(templateId);
        await confirmOrCancel(confirm.ask, buildDeleteConfirm(template));
        await deleteTemplate(template);
      },
    },
  });

  const renderTemplates = () => {
    if (isLoading) return <LoadingState title="Loading email templates" />;
    if (isError)
      return (
        <EmptyState variant="panel" icon={<FiMail size={28} />} title="Could not load email templates">
          <Button label="Try again" onClick={refetch} />
        </EmptyState>
      );
    if (!templates.length)
      return (
        <EmptyState
          variant="panel"
          icon={<FiMail size={28} />}
          title="No email templates yet"
          description="Create a template to send branded emails."
        />
      );
    return (
      <>
        <ListFilter
          className="mb-5"
          fields={filterFields}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onChange={handleFilterChange}
          onClear={clearFilters}
        />
        {filteredTemplates.length ? (
          renderGrid()
        ) : (
          <EmptyState
            variant="panel"
            icon={<FiSearch size={28} />}
            title="No templates match your filters"
            description="Try a different search or clear the filters."
          />
        )}
      </>
    );
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredTemplates.map((template) => (
        <EmailTemplateCard
          key={template._id}
          item={template}
          isMenuOpen={openRowId === template._id}
          menuRef={getRowRef(template._id)}
          onToggleMenu={() => toggleMenu(template._id)}
          onEdit={canUpdateEmail ? handleEdit : null}
          onAttach={canUpdateEmail && canReadForm ? handleAttach : null}
          onDelete={canDeleteEmail ? handleDelete : null}
          onView={handleView}
        />
      ))}
    </div>
  );

  return (
    <article data-testid="email-page">
      <EmailAttachFormsModal
        key={templateToAttach?._id}
        isOpen={Boolean(templateToAttach)}
        template={templateToAttach}
        onClose={() => setTemplateToAttach(null)}
      />
      <EmailTemplateModal
        isOpen={Boolean(modalMode)}
        mode={modalMode ?? TEMPLATE_MODAL_MODES.VIEW}
        values={values}
        errors={errors}
        onChange={handleChange}
        onClose={handleClose}
        onSubmit={saveTemplate}
        onInsertKeyword={handleInsertKeyword}
        isLoading={isCreating || isUpdating}
      />
      <ConfirmationModal
        isOpen={confirm.isOpen}
        title={confirm.pending?.title}
        message={confirm.pending?.message}
        confirmButtonText={confirm.pending?.confirmButtonText}
        onConfirm={confirm.resolveAsked}
        onClose={confirm.close}
      />

      <EmailHeading canCreate={canCreateEmail} onCreate={handleCreate} />
      {renderTemplates()}
    </article>
  );
};

export default Email;
