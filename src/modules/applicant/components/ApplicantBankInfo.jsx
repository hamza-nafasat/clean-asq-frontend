import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useGetBankLookupMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";
import { useEnterToNextField } from "../hooks/useEnterToNextField";
import { OtherInputType } from "@/components/global/DynamicField";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import BankLookupModal from "@/components/modals/BankLookupModal";
import CustomizationFieldsModal from "./ApplicantCustomizeFieldsModal";
import DisplayText from "./ApplicantDisplayText";
import ApplicantOwnerSuggestionsModal from "./ApplicantOwnerSuggestionsModal";
import ApplicantSectionField from "./ApplicantSectionField";
import { EditSectionDisplayTextFromatingModal } from "./ApplicantSectionTextModal";
import {
  BANK_FIELD_KINDS,
  BANK_LOOKUP_ERROR_MESSAGE,
  DEFAULT_OWNER_SUGGESTION_KEYS,
  FIELD_NAMES,
  KEYBOARD_KEYS,
} from "../utils/applicant.constants";
import { collectLookupSuggestions } from "../utils/applicant.utils7";
import { isRequiredValueFilled } from "../utils/applicant.utils8";
import { uploadSignatureReplacing } from "../utils/applicant.utils12";
import { isNotGuestRoleValue } from "@/utils/permissions";
import { getSignatureUrl, isSignatureComplete, normalizeSignature } from "@/utils/signatureShape";

const BankInfo = ({
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
  const { formData } = useSelector((state) => state?.form);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const onSpecialEnterRef = useRef(null);
  const lookupTriggerRef = useRef(null);
  const bankModalRef = useRef(null);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [ownerSuggesstionsModal, setOwnerSuggesstionsModal] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [bankModal, setBankModal] = useState(null);
  const [getBankLookup, { isLoading }] = useGetBankLookupMutation();
  bankModalRef.current = bankModal;

  const isCreator = user?._id && user?._id === step?.owner && isNotGuestRoleValue(user);
  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [fields],
  );
  const ownersFromLookup = useMemo(
    () =>
      formData
        ? collectLookupSuggestions(formData?.company_lookup_data, step?.ownerSuggesstions || DEFAULT_OWNER_SUGGESTION_KEYS)
        : [],
    [formData, step?.ownerSuggesstions],
  );
  const accountNumberId = fields.find((field) => field.name === FIELD_NAMES.BANK_ACCOUNT_NUMBER)?.uniqueId;
  const confirmAccountNumberId = fields.find((field) => field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER)?.uniqueId;
  const accMatch =
    form[accountNumberId]?.value &&
    form[confirmAccountNumberId]?.value &&
    form[accountNumberId]?.value === form[confirmAccountNumberId]?.value;
  const isAllRequiredFieldsFilled =
    isCreator ||
    (requiredNames.every(({ uniqueId }) => isRequiredValueFilled(form[uniqueId]?.value)) &&
      (!isSignature || isSignatureComplete(form?.signature)));
  const isNextBlocked = !isAllRequiredFieldsFilled || loadingNext || (!accMatch && !isCreator);

  const handleSignatureUpload = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      const { res, errorMessage } = await uploadSignatureReplacing(file, normalizeSignature(form?.signature).value);
      if (errorMessage) return toast.error(errorMessage);
      setForm((prev) => ({ ...prev, signature: { name: FIELD_NAMES.SIGNATURE, value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
    } finally {
      setIsSaving?.(false);
    }
  };

  const handleRoutingLookup = async (routing) => {
    try {
      const res = await getBankLookup(routing).unwrap();
      if (res.success && Array.isArray(res?.data?.bankDetailsList) && res?.data?.bankDetailsList?.length > 0) {
        setBankModal(res?.data?.bankDetailsList?.[0]);
      } else {
        setBankModal(null);
        toast.error(BANK_LOOKUP_ERROR_MESSAGE);
      }
    } catch (error) {
      console.error("Bank lookup error:", error);
      setBankModal(null);
      toast.error(BANK_LOOKUP_ERROR_MESSAGE);
    }
  };

  // put the looked up bank name into the bank name field
  const confirmBankLookup = useCallback(() => {
    const modal = bankModalRef.current;
    if (!modal?.bankName) {
      setBankModal(null);
      return;
    }
    setForm((prev) => {
      const bankNameId = Object.keys(prev).find((key) => prev[key]?.name === FIELD_NAMES.BANK_NAME);
      if (!bankNameId) return prev;
      return { ...prev, [bankNameId]: { name: FIELD_NAMES.BANK_NAME, value: modal.bankName } };
    });
    setBankModal(null);
  }, []);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach((field) => {
        initialForm[field?.uniqueId] = reduxData
          ? reduxData[field?.uniqueId] || { name: field?.name, value: "" }
          : { name: field?.name, value: "" };
      });
      setForm(initialForm);
    }
    // flat or nested draft signatures are stored nested
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, name, reduxData]);

  // enter answers the open bank modal
  useEffect(() => {
    if (!bankModal) return;
    const handleKeyDown = (e) => {
      if (e.key !== KEYBOARD_KEYS.ENTER || e.repeat) return;
      e.preventDefault();
      e.stopPropagation();
      if (bankModal.bankName) confirmBankLookup();
      else setBankModal(null);
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [bankModal, confirmBankLookup]);

  lookupTriggerRef.current = () => {
    const routingFieldDef = fields.find((f) => f.name === FIELD_NAMES.BANK_ROUTING_NUMBER);
    if (routingFieldDef && form[routingFieldDef.uniqueId]?.value) {
      handleRoutingLookup(form[routingFieldDef.uniqueId].value);
    }
  };

  submitFromEnterRef.current = () => {
    if (isNextBlocked) return;
    if (currentStep < totalSteps - 1) handleNext({ data: form, name: sectionKey, setLoadingNext });
    else handleSubmit({ data: form, name: sectionKey, setLoadingNext });
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
      lookupTriggerRef.current?.();
      return true;
    }
    return false;
  };

  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef, onSpecialEnterRef });

  const renderField = (field, index) => {
    if (field.name === FIELD_NAMES.BANK_ROUTING_NUMBER) {
      return (
        <div key={index} data-bank-field={BANK_FIELD_KINDS.ROUTING}>
          <div className="mt-4 flex items-center gap-2">
            <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="flex-1" />
            <Button
              label={isLoading ? "Looking Up..." : "Look Up"}
              className="mt-8"
              onClick={() => {
                if (form[field?.uniqueId]) handleRoutingLookup(form?.[field?.uniqueId]?.value);
              }}
            />
          </div>
        </div>
      );
    }
    if (field.name === FIELD_NAMES.BANK_ACCOUNT_NUMBER) {
      return (
        <div key={index} className="mt-4" data-bank-field={BANK_FIELD_KINDS.ACCOUNT}>
          <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
        </div>
      );
    }
    if (field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER) {
      return (
        <div key={index} className="relative mt-4">
          <OtherInputType
            field={field}
            placeholder={field.placeholder}
            form={form}
            setForm={setForm}
            className="w-full pr-10"
            isConfirmField
          />
          <div className="mt-2 flex items-center gap-2">
            {form[field?.uniqueId]?.value && (
              <span className="">
                {accMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </span>
            )}
            <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
          </div>
        </div>
      );
    }
    if (field.name === FIELD_NAMES.BANK_ACCOUNT_HOLDER_NAME) {
      return (
        <div key={index} className="relative mt-4">
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
    return <ApplicantSectionField key={index} field={field} form={form} setForm={setForm} />;
  };

  return (
    <>
      {ownerSuggesstionsModal && (
        <Modal title="Owner's Suggestions" onClose={() => setOwnerSuggesstionsModal(false)}>
          <ApplicantOwnerSuggestionsModal
            selectedSuggesstions={step?.ownerSuggesstions}
            sectionId={step?._id}
            onClose={() => setOwnerSuggesstionsModal(false)}
          />
        </Modal>
      )}
      <div ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
        <div className="mb-10 flex items-center justify-between">
          <h3 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
            {name}
          </h3>
          <div className="flex gap-2">
            <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
            {isCreator && (
              <>
                <Button variant="secondary" onClick={() => setCustomizeModal(true)} label="Customize" />
                <Button onClick={() => setOwnerSuggesstionsModal(true)} label="Owner's Suggestions" />
                <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
              </>
            )}
          </div>
        </div>
        {updateSectionFromatingModal && (
          <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
            <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
          </Modal>
        )}
        {(step?.ai_formatting || step?.displayText) && (
          <div className="mb-4 flex w-full items-end justify-between gap-3">
            <DisplayText data-ai-display-text html={step?.ai_formatting || step?.displayText} />
          </div>
        )}

        {fields?.length > 0 && fields.map(renderField)}

        <div className="mt-4">
          {isSignature && (
            <SignatureBox step={step} onSave={handleSignatureUpload} oldSignatureUrl={getSignatureUrl(form?.signature)} />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-4">
          <div className="mt-8 flex justify-end gap-5">
            {currentStep > 0 && (
              <Button variant="secondary" label="Previous" onClick={handlePrevious} data-testid="form-back-btn" />
            )}
            {currentStep < totalSteps - 1 ? (
              <Button
                onClick={() => handleNext({ data: form, name: sectionKey, setLoadingNext })}
                className={`${isNextBlocked && "pointer-events-none cursor-not-allowed opacity-20"}`}
                disabled={isNextBlocked}
                label={!isAllRequiredFieldsFilled || (!accMatch && !isCreator) ? "Some Required Fields are Missing" : "Next"}
                data-testid="form-next-btn"
              />
            ) : (
              <Button
                disabled={formLoading || !loadingNext}
                className={`${(formLoading || !loadingNext) && "pinter-events-none cursor-not-allowed opacity-20"}`}
                label="Submit"
                onClick={() => handleSubmit({ data: form, name: sectionKey, setLoadingNext })}
              />
            )}
          </div>
        </div>
        {customizeModal && (
          <Modal onClose={() => setCustomizeModal(false)}>
            <CustomizationFieldsModal
              sectionId={_id}
              fields={fields}
              section={step}
              formRefetch={formRefetch}
              onClose={() => setCustomizeModal(false)}
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
      </div>
    </>
  );
};

export default BankInfo;
