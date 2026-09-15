import { useState } from "react";
import { useCreateSearchStrategyMutation, useUpdateSearchStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import LookupManagementFormField from "./LookupManagementFormField";
import { FIELD_TYPES } from "@/constants";
import { LOOKUP_FORM_FIELDS } from "@/modules/lookup-management/utils/lookup-management.constants";

const LookupManagementAddModal = ({
  selectedRow = null,
  companyOptions = [],
  extractAsOptions = [],
  setEditModalData,
  setIsModalOpen,
}) => {
  const [createSearchStrategy] = useCreateSearchStrategyMutation();
  const [updateSearchStrategy] = useUpdateSearchStrategyMutation();
  const [form, setForm] = useState({
    searchObjectKey: selectedRow?.searchObjectKey || "",
    companyIdentification: selectedRow?.companyIdentification || [],
    extractAs: selectedRow?.extractAs || "",
    searchTerms: selectedRow?.searchTerms || "",
    extractionPrompt: selectedRow?.extractionPrompt || "",
    active: selectedRow?.isActive || false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { active, companyIdentification, extractAs, extractionPrompt, searchObjectKey, searchTerms } = form;

      if (!searchObjectKey || !searchTerms || !extractionPrompt || !extractAs || !companyIdentification.length) {
        return toast.error("Please fill all required fields");
      }
      const data = { searchObjectKey, searchTerms, extractionPrompt, extractAs, companyIdentification, active };
      if (!selectedRow?._id) {
        const res = await createSearchStrategy({ data }).unwrap();
        if (res?.success) toast.success("Search strategy created successfully");
      } else {
        const res = await updateSearchStrategy({
          SearchStrategyId: selectedRow?._id,
          data: { ...data, _id: selectedRow?._id },
        }).unwrap();
        if (res?.success) toast.success("Search strategy updated successfully");
      }
    } catch (error) {
      console.error("Save search strategy error:", error);
      toast.error(error?.data?.message || "Failed to create search strategy");
    } finally {
      if (selectedRow?._id) setEditModalData?.(null);
      else setIsModalOpen?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LookupManagementFormField
        field={LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY}
        value={form?.searchObjectKey}
        onChange={handleChange}
      />
      <LookupManagementFormField
        field={LOOKUP_FORM_FIELDS.COMPANY_IDENTIFICATION}
        value={form.companyIdentification}
        onChange={handleChange}
        type={FIELD_TYPES.MULTI_SELECT}
        options={companyOptions}
      />
      <LookupManagementFormField
        field={LOOKUP_FORM_FIELDS.EXTRACT_AS}
        value={form.extractAs}
        onChange={handleChange}
        type={FIELD_TYPES.SELECT}
        options={extractAsOptions}
      />
      <LookupManagementFormField field={LOOKUP_FORM_FIELDS.SEARCH_TERMS} value={form.searchTerms} onChange={handleChange} />
      <LookupManagementFormField
        field={LOOKUP_FORM_FIELDS.EXTRACTION_PROMPT}
        value={form.extractionPrompt}
        onChange={handleChange}
        type={FIELD_TYPES.TEXTAREA}
      />
      <LookupManagementFormField
        field={LOOKUP_FORM_FIELDS.ACTIVE}
        value={form.active}
        onChange={handleChange}
        type={FIELD_TYPES.CHECKBOX}
      />
      <div className="flex w-full justify-end">
        <Button type="submit" label="Save" />
      </div>
    </form>
  );
};

export default LookupManagementAddModal;
