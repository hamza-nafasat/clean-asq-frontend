import TextField from "@/components/shared/small/TextField";
import { additionalOwnersFields, FIELD_TYPES, formFieldsStaticKeys } from "@/data/constants";
import { STATE_SUGGESTIONS } from "@/constants/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { Autocomplete } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";
import Button from "../../shared/small/Button";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "./shared/DynamicFieldForPdf";
import { SimpleRadioInputType } from "@/components/shared/small/DynamicField";

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
  isMasked: false,
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

function CompanyOwnersPdf({ name, reduxData, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
  const { formData, isDisabledAllFields } = useSelector((state) => state?.form);
  const addressAutocompleteRefs = useRef({});

  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [suggestFor, setSuggestFor] = useState(null);
  const [rowIds, setRowIds] = useState([]);

  const ownersBlock = useMemo(
    () => fields?.find((f) => f.type === "block" && f.name === formFieldsStaticKeys.additional_owners_key),
    [fields],
  );
  const otherOwnersStateUniqueId = ownersBlock?.uniqueId || "";
  const otherOwnersStateName = ownersBlock?.name || "";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionForm = formInnerData?.[sectionKey] ?? {};

  const owners = useMemo(
    () => sectionForm?.[otherOwnersStateUniqueId]?.value || [],
    [otherOwnersStateUniqueId, sectionForm],
  );

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

  const idMissionData = formData?.idMission || formInnerData?.idMission;
  const idMissionRoleValue = idMissionData?.roleFillingForCompany?.value || idMissionData?.roleFillingForCompany;
  const isRollingOwner = sectionForm?.rolling_owner_is_also_owner?.value === "yes";

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

    // Submitted values still need to render if idMission is not in redux yet.
    const extras = [];
    if (sectionForm?.rolling_owner_ssn) extras.push(ssnField);
    if (sectionForm?.rolling_owner_is_also_owner) extras.push(areUAnOwnerField);
    if (isRollingOwner || sectionForm?.rolling_owner_percentage) extras.push(ownerPercentageField);
    return extras.length ? [...extras, ...base] : [...base];
  }, [fields, idMissionRoleValue, isRollingOwner, sectionForm]);

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

      setFormInnerData((prev) => {
        const updatedOwners = [...(prev?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners[index] = { ...updatedOwners[index], [fieldKey]: value };
        return {
          ...prev,
          [sectionKey]: {
            ...prev?.[sectionKey],
            [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
          },
        };
      });

      if (isFilter) {
        setFilteredOwners([]);
        setSuggestFor(null);
      }
    },
    [ownersFromLookup, otherOwnersStateUniqueId, otherOwnersStateName, sectionKey, setFormInnerData],
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

      setFormInnerData((prev) => {
        const updatedOwners = [...(prev?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || [])];
        updatedOwners.splice(index, 1);
        return {
          ...prev,
          [sectionKey]: {
            ...prev?.[sectionKey],
            [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
          },
        };
      });
      setRowIds((prev) => prev.filter((_, i) => i !== index));
      setFilteredOwners([]);
      setSuggestFor(null);
    },
    [rowIds, otherOwnersStateUniqueId, otherOwnersStateName, sectionKey, setFormInnerData],
  );

  const handleAddOwner = useCallback(() => {
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev?.[sectionKey],
        [otherOwnersStateUniqueId]: {
          name: otherOwnersStateName,
          value: [...(prev?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || []), makeBlankOwner()],
        },
      },
    }));
    setRowIds((prev) => [...prev, makeRowId()]);
  }, [otherOwnersStateUniqueId, otherOwnersStateName, sectionKey, setFormInnerData]);

  const onLoadAddress = (rowKey) => (autocomplete) => {
    addressAutocompleteRefs.current[rowKey] = autocomplete;
  };
  const onPlaceChangedAddress = (rowKey, index) => () => {
    const place = addressAutocompleteRefs.current[rowKey]?.getPlace();
    if (!place?.formatted_address) return;
    setOwnerVal("address", place.formatted_address, index);
  };

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");

      const oldSign = formInnerData?.[sectionKey]?.signature?.value;
      if (oldSign?.publicId) {
        const result = await deleteImageFromCloudinary(oldSign.publicId, oldSign.resourceType);
        if (!result) return toast.error("File Not Deleted Please Try Again");
      }
      const res = await uploadImageOnCloudinary(file);
      if (!res.publicId || !res.secureUrl || !res.resourceType) {
        return toast.error("File Not Uploaded Please Try Again");
      }
      setFormInnerData((prev) => ({
        ...prev,
        [sectionKey]: { ...prev?.[sectionKey], signature: { name: "signature", value: res } },
      }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

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

    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.value?.publicId)
        isSignatureExistingData.publicId = reduxData?.signature?.value?.publicId;
      if (reduxData?.signature?.value?.secureUrl)
        isSignatureExistingData.secureUrl = reduxData?.signature?.value?.secureUrl;
      if (reduxData?.signature?.value?.resourceType)
        isSignatureExistingData.resourceType = reduxData?.signature?.value?.resourceType;
      initialForm.signature = {
        name: "signature",
        value: isSignatureExistingData?.publicId
          ? isSignatureExistingData
          : { publicId: "", secureUrl: "", resourceType: "" },
      };
    }

    const sectionData = formInnerData?.[sectionKey] ?? {};
    const toAdd = Object.fromEntries(Object.entries(initialForm).filter(([key]) => !(key in sectionData)));
    if (Object.keys(toAdd).length === 0) return;
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev?.[sectionKey] ?? {}), ...toAdd },
    }));
  }, [formFields, formInnerData, isSignature, reduxData, sectionKey, setFormInnerData]);

  const showAdditionalOwners =
    sectionForm?.[
      Object.keys(sectionForm)?.find(
        (objKey) => sectionForm[objKey]?.name === "additional_owners_own_25_percent_or_more",
      )
    ]?.value === "yes";

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting || step?.displayText,
            }}
          />
        </div>
      )}
      <div className="mt-5">
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-xl border border-[#F0F0F0] p-4">
            {formFields?.map((field, index) => {
              if (field.name === "main_owner_own_25_percent_or_more" || field.type === "block") return null;

              const key = field.uniqueId || index;
              const common = {
                field,
                form: formInnerData?.[sectionKey],
                setForm: setFormInnerData,
                sectionKey,
                className: "",
              };

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
              if (field.type === FIELD_TYPES.RADIO)
                return (
                  <div key={key} className="mt-4">
                    <RadioInputType {...common} />
                  </div>
                );
              if (field.type === FIELD_TYPES.FILE)
                return (
                  <div key={key} className="mt-4">
                    <FileInputType {...common} />
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
                  const id_number = getOwnerVal(owner, "id_number") || getOwnerVal(owner, "driver_license_number");
                  const id_issuer =
                    getOwnerVal(owner, "id_issuer") || getOwnerVal(owner, "driver_license_issuer_state");

                  return (
                    <div
                      key={rowKey}
                      className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row"
                    >
                      <div className="wrap flex w-full min-w-100 flex-col gap-3">
                        <div className="relative flex w-full gap-4">
                          <TextField
                            disabled={isDisabledAllFields}
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
                            disabled={isDisabledAllFields}
                            label="Email Address"
                            type="email"
                            placeholder="e.g. john.doe@email.com"
                            value={email}
                            required
                            onChange={(e) => setOwnerVal("email", e.target.value, index)}
                          />
                          <TextField
                            name="phone"
                            disabled={isDisabledAllFields}
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
                            disabled={isDisabledAllFields}
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
                            disabled={isDisabledAllFields}
                            onChange={(e) => setOwnerVal("have_detail", e.target.value, index)}
                          />
                        </div>

                        {(role === "primary_operator" || role === "both") && (
                          <div className="flex w-full gap-4">
                            <TextField
                              name="job_title"
                              disabled={isDisabledAllFields}
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
                                disabled={isDisabledAllFields}
                                label="Social Security, Tax, or National ID Number"
                                placeholder="e.g. 123-45-6789"
                                value={ssn}
                                formatting="3,2,4"
                                isMasked={false}
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
                                  disabled={isDisabledAllFields}
                                  label="Address"
                                  value={address}
                                  onChange={(e) => setOwnerVal("address", e.target.value, index)}
                                  className={"w-full!"}
                                />
                              </Autocomplete>

                              <TextField
                                name="percentage"
                                disabled={isDisabledAllFields}
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
                                disabled={isDisabledAllFields}
                                label="Date of Birth"
                                value={date_of_birth}
                                onChange={(e) => setOwnerVal("date_of_birth", e.target.value, index)}
                                className={"w-full"}
                              />

                              <TextField
                                name="id_issuer"
                                disabled={isDisabledAllFields}
                                label="ID Issuer"
                                placeholder="State/Province or Country"
                                value={id_issuer}
                                onChange={(e) => setOwnerVal("id_issuer", e.target.value, index)}
                                suggestions={STATE_SUGGESTIONS}
                                className={"w-full"}
                              />

                              <TextField
                                name="id_number"
                                disabled={isDisabledAllFields}
                                label="ID Number"
                                placeholder="As it appears on your ID"
                                value={id_number}
                                onChange={(e) => setOwnerVal("id_number", e.target.value, index)}
                                className={"w-full"}
                              />
                            </div>
                          </div>
                        )}

                        {!isDisabledAllFields && (
                          <Button
                            onClick={() => handleRemoveOtherOwnersData(index)}
                            className="max-w-fit! self-end py-2.5!"
                            variant="secondary"
                            label="Remove"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {!isDisabledAllFields && (
                  <div className="flex w-full justify-end">
                    <Button
                      onClick={handleAddOwner}
                      icon={GoPlus}
                      className="text-textPrimary! rounded-lg! border! border-[#D5D8DD]! bg-[#F5F5F5]! font-medium! hover:bg-gray-200!"
                      label="Add additional owner or operator"
                    />
                  </div>
                )}
              </div>
            ) : null}

            <div>
              {isSignature && (
                <SignatureBox
                  onSave={signatureUploadHandler}
                  step={step}
                  isPdf={true}
                  oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyOwnersPdf;
