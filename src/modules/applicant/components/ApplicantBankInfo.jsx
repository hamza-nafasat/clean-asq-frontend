import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useGetBankLookupMutation } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { OtherInputType } from "@/components/global/DynamicField";
import SignatureBox from "@/components/global/SignatureBox";
import BankLookupModal from "@/components/modals/BankLookupModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantOwnerSuggestionsModal from "./ApplicantOwnerSuggestionsModal";
import ApplicantSectionField from "./ApplicantSectionField";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { FIELD_NAMES, KEYBOARD_KEYS } from "@/constants";
import { BANK_FIELD_KINDS, BANK_LOOKUP_ERROR_MESSAGE } from "../utils/applicant.constants";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { isRequiredValueFilled } from "../utils/applicant.validation.utils";
import { collectLookupOwners } from "@/utils/lookupOwners";
import { PERMISSIONS } from "@/utils/permissions";
import { isSignatureComplete, normalizeSignature } from "@/utils/signatureShape";

const ApplicantBankInfo = ({
  sectionKey,
  name,
  handleNext,
  handlePrevious,
  currentStep = 0,
  totalSteps = 0,
  handleSubmit,
  formLoading = false,
  fields = [],
  reduxData,
  formRefetch,
  _id,
  saveInProgress,
  step = {},
  isSignature = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const onSpecialEnterRef = useRef(null);
  const bankModalRef = useRef(null);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isOwnerSuggestionsModalOpen, setIsOwnerSuggestionsModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [bankModal, setBankModal] = useState(null);
  const [getBankLookup, { isLoading }] = useGetBankLookupMutation();
  bankModalRef.current = bankModal;

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [fields],
  );
  const ownersFromLookup = useMemo(
    () => collectLookupOwners(formData, step?.ownerSuggesstions),
    [formData, step?.ownerSuggesstions],
  );
  const routingFieldId = fields.find((field) => field.name === FIELD_NAMES.BANK_ROUTING_NUMBER)?.uniqueId;
  const accountNumberId = fields.find((field) => field.name === FIELD_NAMES.BANK_ACCOUNT_NUMBER)?.uniqueId;
  const confirmAccountNumberId = fields.find(
    (field) => field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER,
  )?.uniqueId;
  const accMatch =
    form[accountNumberId]?.value &&
    form[confirmAccountNumberId]?.value &&
    form[accountNumberId]?.value === form[confirmAccountNumberId]?.value;
  const isAllRequiredFieldsFilled =
    isOwner ||
    (requiredNames.every(({ uniqueId }) => isRequiredValueFilled(form[uniqueId]?.value)) &&
      (!isSignature || isSignatureComplete(form?.signature)));
  const isComplete = isAllRequiredFieldsFilled && (Boolean(accMatch) || isOwner);
  const isBusy = loadingNext || formLoading;
  const stepAction = { data: form, name: sectionKey, setLoadingNext };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

  const handleRoutingLookup = async (routing) => {
    try {
      const res = await getBankLookup(routing).unwrap();
      const bankDetails = res?.data?.bankDetailsList?.[0];
      setBankModal(res.success && bankDetails ? bankDetails : null);
      if (!res.success || !bankDetails) toast.error(BANK_LOOKUP_ERROR_MESSAGE);
    } catch (error) {
      console.error("Bank lookup error:", error);
      setBankModal(null);
      toast.error(BANK_LOOKUP_ERROR_MESSAGE);
    }
  };

  // put the looked up bank name into the bank name field
  const confirmBankLookup = useCallback(() => {
    const modal = bankModalRef.current;
    if (modal?.bankName) {
      setForm((prev) => {
        const bankNameId = Object.keys(prev).find((key) => prev[key]?.name === FIELD_NAMES.BANK_NAME);
        if (!bankNameId) return prev;
        return { ...prev, [bankNameId]: { name: FIELD_NAMES.BANK_NAME, value: modal.bankName } };
      });
    }
    setBankModal(null);
  }, []);

  const runRoutingLookup = () => {
    const routing = form[routingFieldId]?.value;
    if (routing) handleRoutingLookup(routing);
  };

  useEffect(() => {
    if (fields.length > 0) {
      const initialForm = {};
      fields.forEach((field) => {
        initialForm[field.uniqueId] = reduxData?.[field.uniqueId] || { name: field.name, value: "" };
      });
      setForm(initialForm);
    }
    // flat or nested draft signatures are stored nested
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, reduxData]);

  // enter answers the open bank modal
  useEffect(() => {
    if (!bankModal) return;
    const handleKeyDown = (e) => {
      if (e.key !== KEYBOARD_KEYS.ENTER || e.repeat) return;
      e.preventDefault();
      e.stopPropagation();
      confirmBankLookup();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [bankModal, confirmBankLookup]);

  submitFromEnterRef.current = () => {
    if (!isComplete || isBusy) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };

  // enter on routing runs the lookup; with the modal open it means yes
  onSpecialEnterRef.current = (active, e) => {
    if (bankModalRef.current) {
      e.preventDefault();
      confirmBankLookup();
      return true;
    }
    if (active.closest("[data-bank-field]")?.dataset?.bankField === BANK_FIELD_KINDS.ROUTING) {
      e.preventDefault();
      runRoutingLookup();
      return true;
    }
    return false;
  };

  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef, onSpecialEnterRef });

  const renderField = (field) => {
    if (field.name === FIELD_NAMES.BANK_ROUTING_NUMBER) {
      return (
        <div key={field.uniqueId} data-bank-field={BANK_FIELD_KINDS.ROUTING} className="mt-4 flex items-center gap-2">
          <OtherInputType
            field={field}
            placeholder={field.placeholder}
            form={form}
            setForm={setForm}
            className="flex-1"
          />
          <Button label={isLoading ? "Looking Up..." : "Look Up"} className="mt-8" onClick={runRoutingLookup} />
        </div>
      );
    }
    if (field.name === FIELD_NAMES.BANK_ACCOUNT_NUMBER) {
      return (
        <div key={field.uniqueId} className="mt-4" data-bank-field={BANK_FIELD_KINDS.ACCOUNT}>
          <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
        </div>
      );
    }
    if (field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER) {
      return (
        <div key={field.uniqueId} className="relative mt-4">
          <OtherInputType
            field={field}
            placeholder={field.placeholder}
            form={form}
            setForm={setForm}
            className="w-full pr-10"
            isConfirmField
          />
          <div className="mt-2 flex items-center gap-2">
            {form[field.uniqueId]?.value &&
              (accMatch ? (
                <FiCheckCircle size={20} className="shrink-0 text-green-500" aria-label="Account numbers match" />
              ) : (
                <FiXCircle size={20} className="shrink-0 text-red-500" aria-label="Account numbers do not match" />
              ))}
            <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
          </div>
        </div>
      );
    }
    if (field.name === FIELD_NAMES.BANK_ACCOUNT_HOLDER_NAME) {
      return (
        <div key={field.uniqueId} className="relative mt-4">
          <OtherInputType
            field={field}
            suggestions={ownersFromLookup}
            placeholder={field.placeholder}
            form={form}
            setForm={setForm}
            className="w-full"
          />
        </div>
      );
    }
    return <ApplicantSectionField key={field.uniqueId} field={field} form={form} setForm={setForm} />;
  };

  return (
    <>
      {isOwnerSuggestionsModalOpen && (
        <Modal title="Owner's Suggestions" onClose={() => setIsOwnerSuggestionsModalOpen(false)}>
          <ApplicantOwnerSuggestionsModal
            selectedSuggestions={step?.ownerSuggesstions}
            sectionId={step?._id}
            onClose={() => setIsOwnerSuggestionsModalOpen(false)}
          />
        </Modal>
      )}
      <section ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
        <header className="mb-10 flex items-center justify-between">
          <h2 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
            {name}
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
            {canCustomize && (
              <>
                <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
                <Button onClick={() => setIsOwnerSuggestionsModalOpen(true)} label="Owner's Suggestions" />
                <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
              </>
            )}
          </div>
        </header>
        {isSectionTextModalOpen && (
          <Modal onClose={() => setIsSectionTextModalOpen(false)}>
            <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
          </Modal>
        )}
        {(step?.ai_formatting || step?.displayText) && (
          <ApplicantDisplayText
            className="mb-4 w-full"
            data-ai-display-text
            html={step?.ai_formatting || step?.displayText}
          />
        )}

        {fields.map(renderField)}

        {isSignature && (
          <div className="mt-4">
            <SignatureBox step={step} onSave={handleSignatureUpload} signature={form?.signature} />
          </div>
        )}

        <ApplicantStepActions
          currentStep={currentStep}
          totalSteps={totalSteps}
          isComplete={isComplete}
          isBusy={isBusy}
          incompleteLabel="Some Required Fields are Missing"
          onPrevious={handlePrevious}
          onNext={() => handleNext(stepAction)}
          onSubmit={() => handleSubmit(stepAction)}
        />
        {isCustomizeModalOpen && (
          <Modal onClose={() => setIsCustomizeModalOpen(false)}>
            <ApplicantCustomizeFieldsModal
              sectionId={_id}
              fields={fields}
              section={step}
              formRefetch={formRefetch}
              onClose={() => setIsCustomizeModalOpen(false)}
            />
          </Modal>
        )}
        <BankLookupModal
          isOpen={!!bankModal}
          bankName={bankModal?.bankName}
          yesTestId="bank-lookup-yes-btn"
          onClose={() => setBankModal(null)}
          onConfirm={confirmBankLookup}
        />
      </section>
    </>
  );
};

export default ApplicantBankInfo;
