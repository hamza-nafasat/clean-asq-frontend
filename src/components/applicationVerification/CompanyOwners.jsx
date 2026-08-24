import DisplayText from "@/components/shared/DisplayText";
import TextField from "@/components/shared/small/TextField";
import { additionalOwnersFields, FIELD_TYPES, formFieldsStaticKeys } from "@/data/constants";
import { useEnterToNextField } from "@/hooks/useEnterToNextField";
import { useGetAllSearchStrategiesQuery, useUpdateFormSectionMutation } from "@/redux/apis/formApis";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { getSignatureUrl, isSignatureComplete, normalizeSignature } from "@/utils/signatureShape";
import { X } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../shared/SignatureBox";
import Button from "../shared/small/Button";
import CustomLoading from "../shared/small/CustomLoading";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
  SimpleRadioInputType,
} from "../shared/small/DynamicField";
import { EditSectionDisplayTextFromatingModal } from "../shared/small/EditSectionDisplayTextFromatingModal";
import Modal from "../shared/small/Modal";
import CustomizationOwnerFieldsModal from "./companyInfo/CustomizationOwnerFieldsModal";
import { STATE_SUGGESTIONS } from "@/constants/constants";

const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row_${Math.random().toString(36).slice(2)}${Date.now()}`;

const makeBlankOwner = () =>
  Object.keys(additionalOwnersFields).reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

const ssnField = {
  label: "What is your Social Security, Tax, or National ID Number?",
  name: "rolling_owner_ssn",
  uniqueId: "rolling_owner_ssn",
  required: true,
  aiHelp: false,
  formatting: "3,2,4",
  isMasked: true,
  type: "text",
};
const areUAnOwnerField = {
  label: "Are you a company owner holding 25% or more of the company?",
  name: "rolling_owner_is_also_owner",
  uniqueId: "rolling_owner_is_also_owner",
  required: true,
  aiHelp: false,
  type: "radio",
  options: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
};
const ownerPercentageField = {
  label: "What is you percentage of ownership?",
  name: "rolling_owner_percentage",
  uniqueId: "rolling_owner_percentage",
  required: true,
  aiHelp: false,
  type: "range",
};

function CompanyOwners({
  sectionKey,
  _id,
  formRefetch,
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  formLoading,
  reduxData,
  fields,
  blocks,
  saveInProgress,
  step,
  isSignature,
}) {
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state?.form);

  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const addressAutocompleteRefs = useRef({});

  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [ownerSuggesstionsModal, setOwnerSuggesstionsModal] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);

  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [suggestFor, setSuggestFor] = useState(null);

  const [loadingNext, setLoadingNext] = useState(false);
  const [form, setForm] = useState({});
  const [rowIds, setRowIds] = useState([]); // parallel to owners — never stored in form
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState("Some Required Fields are Missing");

  const isCreator = user?._id && user?._id === step?.owner && user?.role !== "guest";

  // ── derive the additional-owners block instead of storing it in state ──────
  const ownersBlock = useMemo(
    () => fields?.find((f) => f.type === "block" && f.name === formFieldsStaticKeys.additional_owners_key),
    [fields],
  );
  const otherOwnersStateUniqueId = ownersBlock?.uniqueId || "";
  const otherOwnersStateName = ownersBlock?.name || "";

  const owners = useMemo(() => form?.[otherOwnersStateUniqueId]?.value || [], [form, otherOwnersStateUniqueId]);

  // keep one stable id per row, outside the data
  useEffect(() => {
    setRowIds((prev) => {
      if (prev.length === owners.length) return prev;
      if (prev.length < owners.length) {
        return [...prev, ...Array.from({ length: owners.length - prev.length }, makeRowId)];
      }
      return prev.slice(0, owners.length);
    });
  }, [owners.length]);

  const rowKeyAt = (index) => rowIds[index] ?? `idx_${index}`;

  // ── formFields is derived, not state ──────────────────────────────────────
  const idMissionRoleValue =
    formData?.idMission?.roleFillingForCompany?.value || formData?.idMission?.roleFillingForCompany;
  const isRollingOwner = form?.rolling_owner_is_also_owner?.value === "yes";

  const formFields = useMemo(() => {
    const base = Array.isArray(fields) ? fields : [];
    if (idMissionRoleValue === "primaryOperatorAndController" || idMissionRoleValue === "both") {
      return isRollingOwner
        ? [ssnField, areUAnOwnerField, ownerPercentageField, ...base]
        : [ssnField, areUAnOwnerField, ...base];
    }
    if (idMissionRoleValue === "primaryContact") {
      return isRollingOwner ? [areUAnOwnerField, ssnField, ownerPercentageField, ...base] : [areUAnOwnerField, ...base];
    }
    return [...base];
  }, [fields, idMissionRoleValue, isRollingOwner]);

  const requiredNames = useMemo(
    () => formFields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [formFields],
  );

  // ── owner read / write ────────────────────────────────────────────────────
  const getOwnerVal = useCallback((owner, key) => owner?.[key] ?? "", []);

  const handleChangeOnOtherOwnersData = useCallback(
    (e, index, isFilter = false) => {
      const fieldKey = e.target.name;
      const value = e.target.value;

      if (fieldKey === "name") {
        setFilteredOwners(
          value ? ownersFromLookup.filter((o) => String(o).toLowerCase().includes(value.toLowerCase())) : [],
        );
        setSuggestFor(value ? index : null);
      }

      setForm((prev) => {
        const updatedOwners = [...(prev[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners[index] = { ...updatedOwners[index], [fieldKey]: value };
        return {
          ...prev,
          [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
        };
      });

      if (isFilter) {
        setFilteredOwners([]);
        setSuggestFor(null);
      }
    },
    [ownersFromLookup, otherOwnersStateUniqueId, otherOwnersStateName],
  );

  const setOwnerVal = useCallback(
    (key, value, index, isFilter = false) =>
      handleChangeOnOtherOwnersData({ target: { name: key, value } }, index, isFilter),
    [handleChangeOnOtherOwnersData],
  );

  const handleRemoveOtherOwnersData = useCallback(
    (index) => {
      const removedKey = rowIds[index];
      if (removedKey) delete addressAutocompleteRefs.current[removedKey];

      setForm((prev) => {
        const updatedOwners = [...(prev[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners.splice(index, 1);
        return {
          ...prev,
          [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
        };
      });
      setRowIds((prev) => prev.filter((_, i) => i !== index));
      setFilteredOwners([]);
      setSuggestFor(null);
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

  // ── google places ─────────────────────────────────────────────────────────
  const onLoadAddress = (rowKey) => (autocomplete) => {
    addressAutocompleteRefs.current[rowKey] = autocomplete;
  };
  const onPlaceChangedAddress = (rowKey, index) => () => {
    const place = addressAutocompleteRefs.current[rowKey]?.getPlace();
    if (!place?.formatted_address) return;
    setOwnerVal("address", place.formatted_address, index);
  };

  // ── signature upload ──────────────────────────────────────────────────────
  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");

      const oldSign = form?.signature?.value;
      if (oldSign?.publicId) {
        const result = await deleteImageFromCloudinary(oldSign.publicId, oldSign.resourceType);
        if (!result) return toast.error("File Not Deleted Please Try Again");
      }
      const res = await uploadImageOnCloudinary(file);
      if (!res.publicId || !res.secureUrl || !res.resourceType) {
        return toast.error("File Not Uploaded Please Try Again");
      }
      setForm((prev) => ({ ...prev, signature: { name: "signature", value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("error while uploading signature", error);
      toast.error("Something went wrong while uploading the signature");
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  // ── owner name suggestions from lookup data ───────────────────────────────
  useEffect(() => {
    if (!formData) return;
    const lookupData = formData?.company_lookup_data;
    const searchField = step?.ownerSuggesstions || ["founders"];
    const founders = [];
    searchField.forEach((field) => {
      const data = lookupData?.find((item) => item?.name === field)?.result;
      if (Array.isArray(data)) founders.push(...data);
      else if (typeof data === "string" || typeof data === "number") founders.push(data);
    });
    setOwnersFromLookup(founders.length ? [...new Set(founders)] : []);
  }, [formData, step?.ownerSuggesstions]);

  // ── hydrate / reconcile form shape ────────────────────────────────────────
  useEffect(() => {
    if (!formFields?.length) return;

    const initialForm = {};
    formFields.forEach((field) => {
      if (field.type === "block" && field.name === formFieldsStaticKeys.additional_owners_key) {
        const saved = reduxData?.[field?.uniqueId]?.value;
        initialForm[field.uniqueId] = {
          name: field.name,
          value: Array.isArray(saved) && saved.length ? saved : [makeBlankOwner()],
        };
      } else {
        initialForm[field.uniqueId] = {
          name: field.name,
          value: reduxData?.[field?.uniqueId]?.value || "",
        };
      }
    });
    if (isSignature) initialForm.signature = normalizeSignature(reduxData?.signature);

    // First mount: take the full redux hydrate (draft restore).
    // After that: only add/remove keys — never overwrite local edits.
    setForm((prev) => {
      if (!prev || Object.keys(prev).length === 0) return initialForm;

      const toAdd = Object.fromEntries(Object.entries(initialForm).filter(([key]) => !(key in prev)));
      const toRemoveKeys = Object.keys(prev).filter((key) => !(key in initialForm));
      if (Object.keys(toAdd).length === 0 && toRemoveKeys.length === 0) return prev;

      const cleaned = Object.fromEntries(Object.entries(prev).filter(([key]) => !toRemoveKeys.includes(key)));
      return { ...cleaned, ...toAdd };
    });
  }, [formFields, isSignature, reduxData]);

  // ── required-field / operator validation ──────────────────────────────────
  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      setSubmitButtonText("Next");
      return;
    }

    const get25Key = Object.keys(form).find((key) => key?.includes("additional_owners_own_25_percent_or_more"));
    const additionOwnersGet25OrMore = get25Key ? form?.[get25Key]?.value === "yes" : false;

    const rollingOwnerKey = Object.keys(form).find((key) => key?.includes("rolling_owner_is_also_owner"));
    const applicantIsAlsoPrimaryOperator = rollingOwnerKey ? form?.[rollingOwnerKey]?.value === "yes" : false;

    const allFilled = requiredNames.every(({ uniqueId }) => {
      const val = form[uniqueId]?.value;
      if (val == null) return false;
      if (typeof val === "string") return val.trim() !== "";
      return true;
    });

    const isSignatureDone = !isSignature || isSignatureComplete(form?.signature);

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValidated =
      !additionOwnersGet25OrMore ||
      !owners.length ||
      owners.every((o) => emailRe.test(String(getOwnerVal(o, "email")).toLowerCase()));

    let isOperatorExist = false;
    if ((additionOwnersGet25OrMore && owners.length > 0) || applicantIsAlsoPrimaryOperator) {
      isOperatorExist = true;
    }
    if (idMissionRoleValue === "primaryOperatorAndController" || idMissionRoleValue === "both") {
      isOperatorExist = true;
    }

    if (!allFilled || !isSignatureDone) setSubmitButtonText("Some Required Fields are Missing");
    else if (!isEmailValidated) setSubmitButtonText("A valid email is required for every owner");
    else if (!isOperatorExist) setSubmitButtonText("At least one primary operator required");

    setIsAllRequiredFieldsFilled(allFilled && isOperatorExist && isEmailValidated && isSignatureDone);
  }, [form, owners, idMissionRoleValue, isCreator, isSignature, requiredNames, getOwnerVal]);

  submitFromEnterRef.current = () => {
    if (!isAllRequiredFieldsFilled || loadingNext) return;
    if (currentStep < totalSteps - 1) onNext();
    else onSubmit();
  };

  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  const showAdditionalOwners =
    form?.[Object.keys(form)?.find((objKey) => form[objKey]?.name === "additional_owners_own_25_percent_or_more")]
      ?.value === "yes";

  return (
    <div ref={formContainerRef} className="h-full w-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}
      {ownerSuggesstionsModal && (
        <Modal title="Owners Suggesstions" onClose={() => setOwnerSuggesstionsModal(false)}>
          <OwnerSuggesstionsModal
            selectedSuggesstions={step?.ownerSuggesstions}
            sectionId={step?._id}
            ownerSuggesstionsModal={ownerSuggesstionsModal}
            setOwnerSuggesstionsModal={setOwnerSuggesstionsModal}
          />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </h3>
        <div className="flex gap-2">
          <Button onClick={onSaveProgress} label={"Save my progress"} />
          {isCreator && (
            <>
              <Button onClick={() => setCustomizeModal(true)} label={"Customize"} />
              <Button onClick={() => setOwnerSuggesstionsModal(true)} label={"Owners Suggesstions"} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={"Update Display Text"} />
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
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-xl border border-[#F0F0F0] p-4">
            {formFields?.map((field, index) => {
              if (field.name === "main_owner_own_25_percent_or_more" || field.type === "block") return null;

              const key = field.uniqueId || index;
              const common = { field, form, setForm, className: "" };

              if (field.type === FIELD_TYPES.SELECT)
                return (
                  <div key={key} className="mt-4">
                    <SelectInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.MULTI_CHECKBOX)
                return (
                  <div key={key} className="mt-4">
                    <MultiCheckboxInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.FILE)
                return (
                  <div key={key} className="mt-4">
                    <FileInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.RADIO)
                return (
                  <div key={key} className="mt-4">
                    <RadioInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.RANGE)
                return (
                  <div key={key} className="mt-4">
                    <RangeInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.CHECKBOX)
                return (
                  <div key={key} className="mt-4">
                    <CheckboxInputType {...common} placeholder={field.placeholder} />
                  </div>
                );

              return (
                <div key={key} className="mt-4">
                  <OtherInputType {...common} placeholder={field.placeholder} />
                </div>
              );
            })}

            {showAdditionalOwners ? (
              <div className="flex flex-col gap-3">
                {owners.map((owner, index) => {
                  const rowKey = rowKeyAt(index);

                  const ownerName = getOwnerVal(owner, "name");
                  const email = getOwnerVal(owner, "email");
                  const ssn = getOwnerVal(owner, "ssn");
                  const role = getOwnerVal(owner, "role");
                  const job_title = getOwnerVal(owner, "job_title");
                  const have_detail = getOwnerVal(owner, "have_detail");
                  const address = getOwnerVal(owner, "address");
                  const phone = getOwnerVal(owner, "phone");
                  const percentage = String(getOwnerVal(owner, "percentage"));
                  const date_of_birth = getOwnerVal(owner, "date_of_birth");
                  const id_number = getOwnerVal(owner, "id_number");
                  const id_issuer = getOwnerVal(owner, "id_issuer");

                  return (
                    <div
                      key={rowKey}
                      className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row"
                    >
                      <div className="wrap flex w-full min-w-100 flex-col gap-3">
                        <div className="relative flex w-full gap-4">
                          <TextField
                            label="Owner or primary operator name"
                            name="name"
                            placeholder="First name, middle name (optional), last name"
                            value={ownerName}
                            onChange={(e) => setOwnerVal("name", e.target.value, index)}
                          />
                          {suggestFor === index && filteredOwners?.length > 0 && (
                            <ul className="absolute top-20 z-40 mt-1 w-full max-w-100 rounded border bg-white shadow">
                              {filteredOwners.map((suggestion, i) => (
                                <li
                                  key={i}
                                  onClick={() => setOwnerVal("name", suggestion, index, true)}
                                  className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                                >
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          )}
                          <TextField
                            name="email"
                            label="Email Address"
                            type="email"
                            placeholder="e.g. john.doe@email.com"
                            value={email}
                            required
                            onChange={(e) => setOwnerVal("email", e.target.value, index)}
                          />
                          <TextField
                            name="phone"
                            label="Phone Number"
                            formatting={"3,3,4"}
                            type="text"
                            placeholder="e.g. 555-867-5309"
                            value={phone}
                            onChange={(e) => setOwnerVal("phone", e.target.value, index)}
                            className={"max-w-[30%] min-w-100"}
                          />
                        </div>

                        <div className="flex w-full gap-4">
                          <SimpleRadioInputType
                            field={{
                              label: "Role",
                              name: "role",
                              options: [
                                { label: "Primary Operator", value: "primary_operator" },
                                { label: "Beneficial Owner", value: "beneficial_owner" },
                                { label: "Both", value: "both" },
                              ],
                              required: true,
                            }}
                            groupName={`role_${rowKey}`}
                            form={{ role }}
                            onChange={(e) => setOwnerVal("role", e.target.value, index)}
                          />
                          <SimpleRadioInputType
                            field={{
                              label: (
                                <span className="inline-flex items-center gap-1">
                                  Do you have full information for this person?
                                  <span className="group relative inline-flex items-center">
                                    <span className="cursor-help text-sm text-gray-400">ⓘ</span>
                                    <span className="invisible absolute left-5 top-0 z-50 w-72 rounded bg-gray-800 p-2 text-xs font-normal text-white shadow-lg group-hover:visible">
                                      "Full information" includes: Social Security, Tax, or National ID number · Home
                                      address · Date of birth · Ownership percentage · Government-issued ID number and
                                      issuer
                                    </span>
                                  </span>
                                </span>
                              ),
                              name: "have_detail",
                              options: [
                                { label: "No", value: "no" },
                                { label: "Yes", value: "yes" },
                              ],
                              required: true,
                            }}
                            groupName={`have_detail_${rowKey}`}
                            form={{ have_detail }}
                            onChange={(e) => setOwnerVal("have_detail", e.target.value, index)}
                          />
                        </div>

                        {(role === "primary_operator" || role === "both") && (
                          <div className="flex w-full gap-4">
                            <TextField
                              name="job_title"
                              label="Job Title"
                              value={job_title}
                              onChange={(e) => setOwnerVal("job_title", e.target.value, index)}
                            />
                          </div>
                        )}

                        {have_detail === "yes" && (
                          <div className="flex w-full flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                              <TextField
                                name="ssn"
                                label="Social Security, Tax, or National ID Number"
                                placeholder="e.g. 123-45-6789"
                                value={ssn}
                                formatting="3,2,4"
                                isMasked={true}
                                onChange={(e) => setOwnerVal("ssn", e.target.value, index)}
                                className={"w-full"}
                              />

                              <Autocomplete
                                onLoad={onLoadAddress(rowKey)}
                                onPlaceChanged={onPlaceChangedAddress(rowKey, index)}
                                options={{ types: ["address"], fields: ["formatted_address"] }}
                                className="w-full"
                              >
                                <TextField
                                  name="address"
                                  label="Address"
                                  value={address}
                                  onChange={(e) => setOwnerVal("address", e.target.value, index)}
                                  className={"w-full!"}
                                />
                              </Autocomplete>

                              <TextField
                                name="percentage"
                                label="Ownership Percentage"
                                placeholder="e.g. 25"
                                value={percentage.replace(/%$/, "")}
                                rightIcon={<span className="select-none font-medium text-gray-600">%</span>}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                                  if (raw === "" || raw === ".") {
                                    setOwnerVal("percentage", raw, index);
                                    return;
                                  }
                                  const num = Math.min(100, Math.max(0, parseFloat(raw) || 0));
                                  setOwnerVal("percentage", raw.endsWith(".") ? `${num}.` : `${num}%`, index);
                                }}
                                className={"w-full"}
                              />

                              <TextField
                                name="date_of_birth"
                                type="date"
                                label="Date of Birth"
                                value={date_of_birth}
                                onChange={(e) => setOwnerVal("date_of_birth", e.target.value, index)}
                                className={"w-full"}
                              />

                              <TextField
                                name="id_issuer"
                                label="ID Issuer"
                                placeholder="State/Province or Country"
                                value={id_issuer}
                                onChange={(e) => setOwnerVal("id_issuer", e.target.value, index)}
                                suggestions={STATE_SUGGESTIONS}
                                className={"w-full"}
                              />

                              <TextField
                                name="id_number"
                                label="ID Number"
                                placeholder="As it appears on your ID"
                                value={id_number}
                                onChange={(e) => setOwnerVal("id_number", e.target.value, index)}
                                className={"w-full"}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => handleRemoveOtherOwnersData(index)}
                          className="max-w-fit! self-end py-2.5!"
                          variant="secondary"
                          label="Remove"
                        />
                      </div>
                    </div>
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
                  onSave={signatureUploadHandler}
                  step={step}
                  oldSignatureUrl={getSignatureUrl(form?.signature)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label="Previous" onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={onNext}
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && "pointer-events-none cursor-not-allowed opacity-50"}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled ? "Next" : submitButtonText}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext || !isAllRequiredFieldsFilled}
              className={
                formLoading || loadingNext || !isAllRequiredFieldsFilled
                  ? "pointer-events-none cursor-not-allowed opacity-50"
                  : ""
              }
              label="Submit"
              onClick={onSubmit}
            />
          )}
        </div>
      </div>

      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationOwnerFieldsModal
            sectionId={_id}
            fields={fields?.filter((f) => f.type !== "block")}
            blocks={blocks}
            formRefetch={formRefetch}
            section={step}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default CompanyOwners;

export const OwnerSuggesstionsModal = ({ selectedSuggesstions, setOwnerSuggesstionsModal, sectionId }) => {
  const [selectedOwners, setSelectedOwners] = useState(Array.isArray(selectedSuggesstions) ? selectedSuggesstions : []);
  const { data, isLoading } = useGetAllSearchStrategiesQuery();
  const [suggesstions, setSuggesstions] = useState([]);
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const updateFormSectionHandler = async () => {
    try {
      const res = await updateFormSection({
        _id: sectionId,
        data: { ownerSuggesstions: selectedOwners },
      }).unwrap();
      if (res.success) {
        toast.success("Section Updated Successfully");
        setOwnerSuggesstionsModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to update section");
    }
  };

  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedOwners.includes(value)) {
      setSelectedOwners((prev) => [...prev, value]);
      setSuggesstions((prev) => prev.filter((o) => o !== value));
    }
  };

  const removeOwner = (owner) => {
    setSelectedOwners((prev) => prev.filter((o) => o !== owner));
    setSuggesstions((prev) => [...prev, owner]);
  };

  useEffect(() => {
    if (data?.data && !suggesstions?.length) {
      setSuggesstions(data?.data?.map((item) => item?.searchObjectKey) || []);
    }
  }, [data, suggesstions?.length]);

  return isLoading ? (
    <CustomLoading />
  ) : (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <label htmlFor="owners" className="block text-sm font-medium text-gray-700">
          Select Owners
        </label>
        <select
          id="owners"
          onChange={handleSelect}
          className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose Owner Keys to Suggest</option>
          {suggesstions.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedOwners.map((owner) => (
          <div key={owner} className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700">
            <span>{owner}</span>
            <button
              type="button"
              onClick={() => removeOwner(owner)}
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={() => setOwnerSuggesstionsModal(false)} label={"Cancel"} />
        <Button
          label={isUpdating ? "Saving..." : "Save"}
          onClick={updateFormSectionHandler}
          disabled={selectedOwners.length === 0}
        />
      </div>
    </div>
  );
};
