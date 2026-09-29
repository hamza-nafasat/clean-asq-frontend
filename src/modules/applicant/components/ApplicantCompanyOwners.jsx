import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { GoPlus } from "react-icons/go";
import usePermission from "@/hooks/usePermission";
import SignatureBox from "@/components/global/SignatureBox";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantAdditionalOwnerRow from "./ApplicantAdditionalOwnerRow";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantOwnerSuggestionsModal from "./ApplicantOwnerSuggestionsModal";
import ApplicantSectionField from "./ApplicantSectionField";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { FIELD_NAMES, FORM_BLOCK_TYPE, YES_NO_VALUES } from "@/constants";
import { CUSTOMIZE_VARIANTS, MAX_BENEFICIAL_OWNERS } from "../utils/applicant.constants";
import {
  buildOwnerFormFields,
  buildOwnersInitialForm,
  findFieldKeyByName,
  getOwnersValidation,
  isAdditionalOwnersBlock,
  makeBlankOwner,
  makeRowId,
  mergeFormShape,
  requiresOtherOperators,
  resolveOtherOperatorsAnswer,
} from "../utils/applicant.owners.utils";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { collectLookupOwners } from "@/utils/lookupOwners";
import { PERMISSIONS } from "@/utils/permissions";

const ApplicantCompanyOwners = ({
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
  saveInProgress,
  step = {},
  isSignature = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const addressAutocompleteRefs = useRef({});
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isOwnerSuggestionsModalOpen, setIsOwnerSuggestionsModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [ownerIndexToRemove, setOwnerIndexToRemove] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [form, setForm] = useState({});
  // one stable id per owner row, kept outside the data
  const [rowIds, setRowIds] = useState([]);

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const canInviteOwner = usePermission(PERMISSIONS.INVITE_OWNER);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const ownersBlock = useMemo(() => fields.find(isAdditionalOwnersBlock), [fields]);
  const ownersFieldId = ownersBlock?.uniqueId || "";
  const ownersFieldName = ownersBlock?.name || "";
  const owners = useMemo(() => form?.[ownersFieldId]?.value || [], [form, ownersFieldId]);
  const ownersFromLookup = useMemo(
    () => collectLookupOwners(formData, step?.ownerSuggesstions),
    [formData, step?.ownerSuggesstions],
  );

  const idMissionRoleValue =
    formData?.idMission?.roleFillingForCompany?.value || formData?.idMission?.roleFillingForCompany;
  const isRollingOwner = form?.[FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER]?.value === YES_NO_VALUES.YES;
  const mustHaveOtherOperators = requiresOtherOperators(idMissionRoleValue);
  const formFields = useMemo(
    () => buildOwnerFormFields(fields, idMissionRoleValue, isRollingOwner, mustHaveOtherOperators),
    [fields, idMissionRoleValue, isRollingOwner, mustHaveOtherOperators],
  );
  const requiredNames = formFields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId }));
  const { isValid: isComplete, message: incompleteLabel } = isOwner
    ? { isValid: true, message: "" }
    : getOwnersValidation({ form, owners, requiredNames, isSignature, idMissionRoleValue });
  const isOwnerLimitReached = owners.length >= MAX_BENEFICIAL_OWNERS;
  const showAdditionalOwners =
    form?.[findFieldKeyByName(form, FIELD_NAMES.ADDITIONAL_OWNERS_OWN_25_PERCENT)]?.value === YES_NO_VALUES.YES;
  const stepAction = { data: form, name: sectionKey, setLoadingNext };

  const updateOwners = useCallback(
    (update) =>
      setForm((prev) => ({
        ...prev,
        [ownersFieldId]: { name: ownersFieldName, value: update([...(prev[ownersFieldId]?.value || [])]) },
      })),
    [ownersFieldId, ownersFieldName],
  );

  const setOwnerVal = useCallback(
    (fieldKey, value, index) =>
      updateOwners((list) => {
        list[index] = { ...list[index], [fieldKey]: value };
        return list;
      }),
    [updateOwners],
  );

  const handleConfirmRemoveOwner = () => {
    const index = ownerIndexToRemove;
    const removedKey = rowIds[index];
    if (removedKey) delete addressAutocompleteRefs.current[removedKey];
    updateOwners((list) => list.filter((_, i) => i !== index));
    setRowIds((prev) => prev.filter((_, i) => i !== index));
    setOwnerIndexToRemove(null);
  };

  const handleAddOwner = () => {
    updateOwners((list) => [...list, makeBlankOwner()]);
    setRowIds((prev) => [...prev, makeRowId()]);
  };

  const handleSaveProgress = () => saveInProgress({ data: form, name: sectionKey });

  const handlePlaceChanged = (rowKey, index) => () => {
    const place = addressAutocompleteRefs.current[rowKey]?.getPlace();
    if (place?.formatted_address) setOwnerVal("address", place.formatted_address, index);
  };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

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
    if (!formFields.length) return;
    const initialForm = buildOwnersInitialForm(formFields, reduxData, isSignature, canInviteOwner);
    setForm((prev) => mergeFormShape(prev, initialForm));
  }, [canInviteOwner, formFields, isSignature, reduxData]);

  // a primary contact must have other operators
  useEffect(() => {
    if (!mustHaveOtherOperators) return;
    const key = findFieldKeyByName(form, FIELD_NAMES.ADDITIONAL_OWNERS_OWN_25_PERCENT);
    if (!key) return;
    const current = form[key]?.value;
    const resolved = resolveOtherOperatorsAnswer(current, mustHaveOtherOperators);
    if (resolved === current) return;
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], value: resolved } }));
  }, [mustHaveOtherOperators, form]);

  submitFromEnterRef.current = () => {
    if (!isComplete || loadingNext) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <section ref={formContainerRef} className="h-full w-full">
      {isSectionTextModalOpen && (
        <Modal onClose={() => setIsSectionTextModalOpen(false)}>
          <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
        </Modal>
      )}
      {isOwnerSuggestionsModalOpen && (
        <Modal title="Owner's Suggestions" onClose={() => setIsOwnerSuggestionsModalOpen(false)}>
          <ApplicantOwnerSuggestionsModal
            selectedSuggestions={step?.ownerSuggesstions}
            sectionId={step?._id}
            onClose={() => setIsOwnerSuggestionsModalOpen(false)}
          />
        </Modal>
      )}
      <ConfirmationModal
        isOpen={ownerIndexToRemove !== null}
        title="Remove owner"
        message="Remove this owner from the application?"
        confirmButtonText="Remove"
        onClose={() => setOwnerIndexToRemove(null)}
        onConfirm={handleConfirmRemoveOwner}
      />

      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </h2>
        <div className="flex gap-2">
          <Button onClick={handleSaveProgress} label="Save my progress" />
          {canCustomize && (
            <>
              <Button onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
              <Button onClick={() => setIsOwnerSuggestionsModalOpen(true)} label="Owner's Suggestions" />
              <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </header>

      {(step?.ai_formatting || step?.displayText) && (
        <ApplicantDisplayText className="mb-4" data-ai-display-text html={step?.ai_formatting || step?.displayText} />
      )}

      <div className="mt-5 pb-3">
        <div className="rounded-xl border border-[#F0F0F0] p-4">
          {formFields.map((field, index) =>
            field.name === FIELD_NAMES.MAIN_OWNER_OWN_25_PERCENT || field.type === FORM_BLOCK_TYPE ? null : (
              <ApplicantSectionField key={field.uniqueId || index} field={field} form={form} setForm={setForm} />
            ),
          )}

          {showAdditionalOwners && (
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
                    onSave={handleSaveProgress}
                    onRemove={setOwnerIndexToRemove}
                  />
                );
              })}
              {canInviteOwner && (
                <div className="flex w-full flex-col items-end gap-1">
                  <Button
                    onClick={handleAddOwner}
                    icon={GoPlus}
                    disabled={isOwnerLimitReached}
                    className="text-textPrimary! rounded-lg! border! border-[#D5D8DD]! bg-[#F5F5F5]! font-medium! hover:bg-gray-200!"
                    label="Add additional owner or operator"
                  />
                  {isOwnerLimitReached && (
                    <p className="text-xs text-gray-500">You can add up to {MAX_BENEFICIAL_OWNERS} owners.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {isSignature && <SignatureBox onSave={handleSignatureUpload} step={step} signature={form?.signature} />}
        </div>
      </div>

      <ApplicantStepActions
        currentStep={currentStep}
        totalSteps={totalSteps}
        isComplete={isComplete}
        isBusy={loadingNext || formLoading}
        incompleteLabel={incompleteLabel}
        onPrevious={handlePrevious}
        onNext={() => handleNext(stepAction)}
        onSubmit={() => handleSubmit(stepAction)}
      />

      {isCustomizeModalOpen && (
        <Modal onClose={() => setIsCustomizeModalOpen(false)}>
          <ApplicantCustomizeFieldsModal
            variant={CUSTOMIZE_VARIANTS.OWNER}
            sectionId={_id}
            fields={fields.filter((f) => f.type !== FORM_BLOCK_TYPE)}
            formRefetch={formRefetch}
            section={step}
            onClose={() => setIsCustomizeModalOpen(false)}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantCompanyOwners;
