import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GoPlus } from "react-icons/go";
import { useEnterToNextField } from "../hooks/useEnterToNextField";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import ApplicantAdditionalOwnerRow from "./ApplicantAdditionalOwnerRow";
import CustomizationFieldsModal from "./ApplicantCustomizeFieldsModal";
import DisplayText from "./ApplicantDisplayText";
import ApplicantOwnerSuggestionsModal from "./ApplicantOwnerSuggestionsModal";
import ApplicantSectionField from "./ApplicantSectionField";
import { EditSectionDisplayTextFromatingModal } from "./ApplicantSectionTextModal";
import { DEFAULT_OWNER_SUGGESTION_KEYS, FIELD_BLOCK_TYPE, FIELD_NAMES, YES_NO } from "../utils/applicant.constants";
import { findFieldKeyByName } from "../utils/applicant.utils3";
import { requiresOtherOperators, resolveOtherOperatorsAnswer } from "../utils/applicant.utils4";
import { collectLookupSuggestions } from "../utils/applicant.utils7";
import {
  buildOwnerFormFields,
  buildOwnersInitialForm,
  getOwnersValidation,
  isAdditionalOwnersBlock,
  makeBlankOwner,
  makeRowId,
  mergeFormShape,
} from "../utils/applicant.utils11";
import { uploadSignatureReplacing } from "../utils/applicant.utils12";
import { isNotGuestRoleValue } from "@/utils/permissions";

const CompanyOwners = ({
  sectionKey,
  _id,
  formRefetch,
  name,
  handleNext,
  handlePrevious,
  currentStep = 0,
  totalSteps = 0,
  handleSubmit,
  formLoading = false,
  reduxData,
  fields = [],
  blocks = [],
  saveInProgress,
  step = {},
  isSignature = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state?.form);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const addressAutocompleteRefs = useRef({});
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [ownerSuggesstionsModal, setOwnerSuggesstionsModal] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [form, setForm] = useState({});
  // one stable id per owner row, kept outside the data
  const [rowIds, setRowIds] = useState([]);

  const isCreator = user?._id && user?._id === step?.owner && isNotGuestRoleValue(user);
  const ownersBlock = useMemo(() => fields?.find(isAdditionalOwnersBlock), [fields]);
  const otherOwnersStateUniqueId = ownersBlock?.uniqueId || "";
  const otherOwnersStateName = ownersBlock?.name || "";
  const owners = useMemo(() => form?.[otherOwnersStateUniqueId]?.value || [], [form, otherOwnersStateUniqueId]);
  const ownersFromLookup = useMemo(
    () =>
      formData
        ? collectLookupSuggestions(formData?.company_lookup_data, step?.ownerSuggesstions || DEFAULT_OWNER_SUGGESTION_KEYS)
        : [],
    [formData, step?.ownerSuggesstions],
  );

  const idMissionRoleValue =
    formData?.idMission?.roleFillingForCompany?.value || formData?.idMission?.roleFillingForCompany;
  const isRollingOwner = form?.[FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER]?.value === YES_NO.YES;
  const mustHaveOtherOperators = requiresOtherOperators(idMissionRoleValue);
  const formFields = useMemo(
    () => buildOwnerFormFields(fields, idMissionRoleValue, isRollingOwner, mustHaveOtherOperators),
    [fields, idMissionRoleValue, isRollingOwner, mustHaveOtherOperators],
  );
  const requiredNames = useMemo(
    () => formFields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [formFields],
  );
  const { isValid: isAllRequiredFieldsFilled, message: submitButtonText } = isCreator
    ? { isValid: true, message: "" }
    : getOwnersValidation({ form, owners, requiredNames, isSignature, idMissionRoleValue });
  const showAdditionalOwners =
    form?.[findFieldKeyByName(form, FIELD_NAMES.ADDITIONAL_OWNERS_25_PERCENT)]?.value === YES_NO.YES;

  const setOwnerVal = useCallback(
    (fieldKey, value, index) => {
      setForm((prev) => {
        const updatedOwners = [...(prev[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners[index] = { ...updatedOwners[index], [fieldKey]: value };
        return { ...prev, [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners } };
      });
    },
    [otherOwnersStateUniqueId, otherOwnersStateName],
  );

  const handleRemoveOwner = useCallback(
    (index) => {
      const removedKey = rowIds[index];
      if (removedKey) delete addressAutocompleteRefs.current[removedKey];
      setForm((prev) => {
        const updatedOwners = [...(prev[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners.splice(index, 1);
        return { ...prev, [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners } };
      });
      setRowIds((prev) => prev.filter((_, i) => i !== index));
    },
    [rowIds, otherOwnersStateUniqueId, otherOwnersStateName],
  );

  const handleAddOwner = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      [otherOwnersStateUniqueId]: {
        name: otherOwnersStateName,
        value: [...(prev[otherOwnersStateUniqueId]?.value || []), makeBlankOwner()],
      },
    }));
    setRowIds((prev) => [...prev, makeRowId()]);
  }, [otherOwnersStateUniqueId, otherOwnersStateName]);

  const onNext = () => handleNext({ data: form, name: sectionKey, setLoadingNext });
  const onSubmit = () => handleSubmit({ data: form, name: sectionKey, setLoadingNext });
  const onSaveProgress = () => saveInProgress({ data: form, name: sectionKey });

  const handlePlaceChanged = (rowKey, index) => () => {
    const place = addressAutocompleteRefs.current[rowKey]?.getPlace();
    if (!place?.formatted_address) return;
    setOwnerVal("address", place.formatted_address, index);
  };

  const handleSignatureUpload = async (file, setIsSaving, stamp) => {
    try {
      if (!file) return toast.error("Please select a file");
      const { res, errorMessage } = await uploadSignatureReplacing(file, form?.signature?.value, stamp);
      if (errorMessage) return toast.error(errorMessage);
      setForm((prev) => ({ ...prev, signature: { name: FIELD_NAMES.SIGNATURE, value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
      toast.error("Something went wrong while uploading the signature");
    } finally {
      setIsSaving?.(false);
    }
  };

  useEffect(() => {
    setRowIds((prev) => {
      if (prev.length === owners.length) return prev;
      if (prev.length < owners.length) {
        return [...prev, ...Array.from({ length: owners.length - prev.length }, makeRowId)];
      }
      return prev.slice(0, owners.length);
    });
  }, [owners.length]);

  useEffect(() => {
    if (!formFields?.length) return;
    const initialForm = buildOwnersInitialForm(formFields, reduxData, isSignature);
    setForm((prev) => mergeFormShape(prev, initialForm));
  }, [formFields, isSignature, reduxData]);

  // a primary contact must have other operators
  useEffect(() => {
    if (!mustHaveOtherOperators) return;
    const key = findFieldKeyByName(form, FIELD_NAMES.ADDITIONAL_OWNERS_25_PERCENT);
    if (!key) return;
    const current = form[key]?.value;
    const resolved = resolveOtherOperatorsAnswer(current, mustHaveOtherOperators);
    if (resolved === current) return;
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], value: resolved } }));
  }, [mustHaveOtherOperators, form]);

  submitFromEnterRef.current = () => {
    if (!isAllRequiredFieldsFilled || loadingNext) return;
    if (currentStep < totalSteps - 1) onNext();
    else onSubmit();
  };
  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  const isSubmitDisabled = formLoading || loadingNext || !isAllRequiredFieldsFilled;

  return (
    <div ref={formContainerRef} className="h-full w-full">
      {updateSectionFromatingModal && (
        <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal setModal={setUpdateSectionFromatingModal} step={step} />
        </Modal>
      )}
      {ownerSuggesstionsModal && (
        <Modal title="Owner's Suggestions" onClose={() => setOwnerSuggesstionsModal(false)}>
          <ApplicantOwnerSuggestionsModal
            selectedSuggesstions={step?.ownerSuggesstions}
            sectionId={step?._id}
            onClose={() => setOwnerSuggesstionsModal(false)}
          />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </h3>
        <div className="flex gap-2">
          <Button onClick={onSaveProgress} label="Save my progress" />
          {isCreator && (
            <>
              <Button onClick={() => setCustomizeModal(true)} label="Customize" />
              <Button onClick={() => setOwnerSuggesstionsModal(true)} label="Owner's Suggestions" />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <DisplayText data-ai-display-text html={step?.ai_formatting || step?.displayText} />
        </div>
      )}

      <div className="mt-5">
        <div className="pb-3">
          <div className="rounded-xl border border-[#F0F0F0] p-4">
            {formFields?.map((field, index) =>
              field.name === FIELD_NAMES.MAIN_OWNER_25_PERCENT || field.type === FIELD_BLOCK_TYPE ? null : (
                <ApplicantSectionField key={field.uniqueId || index} field={field} form={form} setForm={setForm} />
              ),
            )}

            {showAdditionalOwners ? (
              <div className="flex flex-col gap-3">
                {owners.map((owner, index) => {
                  const rowKey = rowIds[index] ?? `idx_${index}`;
                  return (
                    <ApplicantAdditionalOwnerRow
                      key={rowKey}
                      owner={owner}
                      index={index}
                      rowKey={rowKey}
                      suggestions={ownersFromLookup}
                      onChange={setOwnerVal}
                      onPlaceLoad={(autocomplete) => {
                        addressAutocompleteRefs.current[rowKey] = autocomplete;
                      }}
                      onPlaceChanged={handlePlaceChanged(rowKey, index)}
                      onSave={onSaveProgress}
                      onRemove={handleRemoveOwner}
                    />
                  );
                })}
                <div className="flex w-full justify-end">
                  <Button
                    onClick={handleAddOwner}
                    icon={GoPlus}
                    className="text-textPrimary! rounded-lg! border! border-[#D5D8DD]! bg-[#F5F5F5]! font-medium! hover:bg-gray-200!"
                    label="Add additional owner or operator"
                  />
                </div>
              </div>
            ) : null}

            <div>
              {isSignature && (
                <SignatureBox
                  onSave={handleSignatureUpload}
                  step={step}
                  signature={form?.signature}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && (
            <Button variant="secondary" label="Previous" onClick={handlePrevious} data-testid="form-back-btn" />
          )}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={onNext}
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && "pointer-events-none cursor-not-allowed opacity-50"}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled ? "Next" : submitButtonText}
              data-testid="form-next-btn"
            />
          ) : (
            <Button
              disabled={isSubmitDisabled}
              className={isSubmitDisabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""}
              label="Submit"
              onClick={onSubmit}
            />
          )}
        </div>
      </div>

      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            variant="owner"
            sectionId={_id}
            fields={fields?.filter((f) => f.type !== FIELD_BLOCK_TYPE)}
            blocks={blocks}
            formRefetch={formRefetch}
            section={step}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CompanyOwners;
