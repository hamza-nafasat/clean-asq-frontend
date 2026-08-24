import TextField from "@/components/shared/small/TextField";
import { FIELD_TYPES, formFieldsStaticKeys } from "@/data/constants";
import { STATE_SUGGESTIONS } from "@/constants/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { Autocomplete } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
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
  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [otherOwnersStateName, setOtherOwnersStateName] = useState("");
  const [otherOwnersStateUniqueId, setOtherOwnersStateUniqueId] = useState("");
  const [formFields, setFormFields] = useState([]);
  const addressAutocompleteRefs = useRef({});

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");

      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.["signature"]?.value;
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
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
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const onLoadAddress = (index) => (autocomplete) => {
    addressAutocompleteRefs.current[index] = autocomplete;
  };
  const onPlaceChangedAddress = (index) => () => {
    const place = addressAutocompleteRefs.current[index]?.getPlace();
    if (!place?.formatted_address) return;
    handleChangeOnOtherOwnersData({ target: { name: "address", value: place.formatted_address } }, index);
  };

  const handleChangeOnOtherOwnersData = (e, index, isFilter = false) => {
    if (e.target.name == "name") {
      if (e.target.value) {
        setFilteredOwners(
          ownersFromLookup.filter((owner) => owner.toLowerCase().includes(e.target.value.toLowerCase())),
        );
      } else {
        setFilteredOwners([]);
      }
    }
    const updatedOwners = [...(formInnerData?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || [])];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [e.target.name]: e.target.value,
    };
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev?.[sectionKey],
        [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
      },
    }));
    if (isFilter) setFilteredOwners([]);
  };

  const handleRemoveOtherOwnersData = (index) => {
    const updatedOwners = [...(formInnerData?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || [])];
    updatedOwners.splice(index, 1);
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev?.[sectionKey],
        [otherOwnersStateUniqueId]: { name: otherOwnersStateName, value: updatedOwners },
      },
    }));
  };

  const handleAddOwner = () => {
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev?.[sectionKey],
        [otherOwnersStateUniqueId]: {
          name: otherOwnersStateName,
          value: [
            ...(prev?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || []),
            { name: "", email: "", ssn: "", percentage: "" },
          ],
        },
      },
    }));
  };

  useEffect(() => {
    const idMissionData = formData?.idMission || formInnerData?.idMission;
    const idMissionField = idMissionData?.roleFillingForCompany?.value || idMissionData?.roleFillingForCompany;
    const submittedSection = formInnerData?.[sectionKey] || {};
    const isAlsoOwner = submittedSection?.rolling_owner_is_also_owner?.value;
    const schemaFields = Array.isArray(fields) ? [...fields] : [];
    let baseFields = schemaFields;

    if (idMissionField == "primaryOperatorAndController" || idMissionField == "both") {
      baseFields =
        isAlsoOwner == "yes"
          ? [ssnField, areUAnOwnerField, ownerPercentageField, ...schemaFields]
          : [ssnField, areUAnOwnerField, ...schemaFields];
    } else if (idMissionField == "primaryContact") {
      baseFields =
        isAlsoOwner == "yes"
          ? [areUAnOwnerField, ssnField, ownerPercentageField, ...schemaFields]
          : [areUAnOwnerField, ...schemaFields];
    } else {
      // Submitted values still need to render if idMission is not in redux yet.
      const extras = [];
      if (submittedSection?.rolling_owner_ssn) extras.push(ssnField);
      if (submittedSection?.rolling_owner_is_also_owner) extras.push(areUAnOwnerField);
      if (isAlsoOwner == "yes" || submittedSection?.rolling_owner_percentage) extras.push(ownerPercentageField);
      if (extras.length) baseFields = [...extras, ...schemaFields];
    }

    setFormFields(baseFields);
  }, [fields, formInnerData, formData?.idMission, sectionKey]);

  // add owners for suggestions
  useEffect(() => {
    if (formData) {
      const lookupData = formData?.company_lookup_data;
      const searchField = step?.ownerSuggesstions || ["founders"];
      const founders = [];
      searchField.forEach((field) => {
        let data = lookupData?.find((item) => item?.name == field)?.result;
        if (Array.isArray(data) && typeof data === "object") {
          founders.push(...data);
        } else if (typeof data === "string") {
          founders.push(data);
        } else if (typeof data === "number") {
          founders.push(data);
        }
      });
      if (founders?.length) {
        const uniqueFounders = founders.filter((item, index) => founders.indexOf(item) === index);
        setOwnersFromLookup(uniqueFounders);
      } else {
        setOwnersFromLookup([]);
      }
    }
  }, [formData, step?.ownerSuggesstions]);

  // making form states according changing fields
  useEffect(() => {
    if (!formFields?.length) return;
    const initialForm = {};
    formFields.forEach((field) => {
      if (field.type === "block" && field.name === formFieldsStaticKeys.additional_owners_key) {
        if (!otherOwnersStateUniqueId) setOtherOwnersStateUniqueId(field?.uniqueId);
        if (!otherOwnersStateName) setOtherOwnersStateName(field?.name);
        const initialState = {
          name: "",
          email: "",
          role: "",
          job_title: "",
          have_detail: "",
          phone: "",
          ssn: "",
          address: "",
          percentage: "",
          date_of_birth: "",
          driver_license_issuer: "",
          driver_license_issuer_state: "",
          driver_license_number: "",
          isCompleted: false,
        };
        initialForm[field.uniqueId] = {
          name: field.name,
          value: reduxData?.[field?.uniqueId]?.value || [initialState],
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
  }, [
    formFields,
    formInnerData,
    isSignature,
    otherOwnersStateName,
    otherOwnersStateUniqueId,
    reduxData,
    sectionKey,
    setFormInnerData,
  ]);

  const sectionForm = formInnerData?.[sectionKey] || {};
  const additionalOwnersYes =
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
              if (field.type === FIELD_TYPES.SELECT) {
                return (
                  <div key={index} className="mt-4">
                    <SelectInputType
                      field={field}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
                return (
                  <div key={index} className="mt-4">
                    <MultiCheckboxInputType
                      field={field}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.RADIO) {
                return (
                  <div key={index} className="mt-4">
                    <RadioInputType
                      field={field}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.FILE) {
                return (
                  <div key={index} className="mt-4">
                    <FileInputType
                      field={field}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.RANGE) {
                return (
                  <div key={index} className="mt-4">
                    <RangeInputType
                      field={field}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              if (field.type === FIELD_TYPES.CHECKBOX) {
                return (
                  <div key={index} className="mt-4">
                    <CheckboxInputType
                      field={field}
                      placeholder={field.placeholder}
                      form={formInnerData?.[sectionKey]}
                      setForm={setFormInnerData}
                      sectionKey={sectionKey}
                      className={""}
                    />
                  </div>
                );
              }
              return (
                <div key={index} className="mt-4">
                  <OtherInputType
                    field={field}
                    placeholder={field.placeholder}
                    form={formInnerData?.[sectionKey]}
                    setForm={setFormInnerData}
                    sectionKey={sectionKey}
                    className={""}
                  />
                </div>
              );
            })}

            {additionalOwnersYes ? (
              <div className="flex flex-col gap-3">
                {formInnerData?.[sectionKey]?.[otherOwnersStateUniqueId]?.value?.map(
                  (
                    {
                      name,
                      email,
                      ssn,
                      role,
                      job_title,
                      have_detail,
                      address,
                      phone,
                      percentage,
                      date_of_birth,
                      driver_license_issuer_state,
                      driver_license_number,
                    },
                    index,
                  ) => {
                    return (
                      <div
                        key={index}
                        className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row"
                      >
                        <div className="wrap flex w-full min-w-100 flex-col gap-3">
                          <div className="relative flex w-full gap-4">
                            <TextField
                              disabled={isDisabledAllFields}
                              label="Owner or primary operator name"
                              name="name"
                              placeholder="First name, middle name (optional), last name"
                              value={name}
                              onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                            />
                            {filteredOwners?.length > 0 && (
                              <ul className="absolute top-20 mt-1 w-full max-w-100 rounded border bg-white shadow">
                                {filteredOwners.map((ownerName, i) => (
                                  <li
                                    key={i}
                                    onClick={() =>
                                      handleChangeOnOtherOwnersData(
                                        { target: { name: "name", value: ownerName } },
                                        index,
                                        true,
                                      )
                                    }
                                    className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                                  >
                                    {ownerName}
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
                              onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                            />
                            <TextField
                              name="phone"
                              disabled={isDisabledAllFields}
                              label="Phone Number"
                              formatting={"3,3,4"}
                              type="text"
                              placeholder="e.g. 555-867-5309"
                              value={phone}
                              onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
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
                              groupName={`role_${index}`}
                              form={{ role }}
                              disabled={isDisabledAllFields}
                              onChange={(e) =>
                                handleChangeOnOtherOwnersData(
                                  { target: { name: "role", value: e.target.value } },
                                  index,
                                )
                              }
                            />
                            <SimpleRadioInputType
                              field={{
                                label: (
                                  <span className="inline-flex items-center gap-1">
                                    Do you have full information for this person?
                                    <span className="group relative inline-flex items-center">
                                      <span className="cursor-help text-gray-400 text-sm">ⓘ</span>
                                      <span className="invisible group-hover:visible absolute left-5 top-0 z-50 w-72 rounded bg-gray-800 p-2 text-xs font-normal text-white shadow-lg">
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
                              groupName={`have_detail_${index}`}
                              form={{ have_detail }}
                              disabled={isDisabledAllFields}
                              onChange={(e) =>
                                handleChangeOnOtherOwnersData(
                                  { target: { name: "have_detail", value: e.target.value } },
                                  index,
                                )
                              }
                            />
                          </div>

                          {(role === "primary_operator" || role === "both") && (
                            <div className="flex w-full gap-4">
                              <TextField
                                name="job_title"
                                disabled={isDisabledAllFields}
                                label="Job Title"
                                value={job_title}
                                onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                              />
                            </div>
                          )}

                          {have_detail == "yes" && (
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
                                  onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                                  className={"w-full"}
                                />
                                <Autocomplete
                                  onLoad={onLoadAddress(index)}
                                  onPlaceChanged={onPlaceChangedAddress(index)}
                                  options={{
                                    types: ["address"],
                                    fields: ["formatted_address"],
                                  }}
                                  className="w-full"
                                >
                                  <TextField
                                    name="address"
                                    disabled={isDisabledAllFields}
                                    label="Address"
                                    value={address}
                                    onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                                    className={"w-full!"}
                                  />
                                </Autocomplete>
                                <TextField
                                  name="percentage"
                                  disabled={isDisabledAllFields}
                                  label="Ownership Percentage"
                                  placeholder="e.g. 25"
                                  value={(percentage || "").replace(/%$/, "")}
                                  rightIcon={<span className="select-none font-medium text-gray-600">%</span>}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                                    if (raw === "" || raw === ".") {
                                      handleChangeOnOtherOwnersData(
                                        { target: { name: "percentage", value: raw } },
                                        index,
                                      );
                                      return;
                                    }
                                    const num = Math.min(100, Math.max(0, parseFloat(raw) || 0));
                                    const formatted = raw.endsWith(".") ? `${num}.` : `${num}%`;
                                    handleChangeOnOtherOwnersData(
                                      { target: { name: "percentage", value: formatted } },
                                      index,
                                    );
                                  }}
                                  className={"w-full"}
                                />
                                <TextField
                                  name="date_of_birth"
                                  type="date"
                                  disabled={isDisabledAllFields}
                                  label="Date of Birth"
                                  value={date_of_birth}
                                  onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                                  className={"w-full"}
                                />
                                <TextField
                                  name="driver_license_issuer_state"
                                  disabled={isDisabledAllFields}
                                  label="ID Issuer"
                                  placeholder="State/Province or Country"
                                  value={driver_license_issuer_state}
                                  onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
                                  suggestions={STATE_SUGGESTIONS}
                                  className={"w-full"}
                                />
                                <TextField
                                  name="driver_license_number"
                                  disabled={isDisabledAllFields}
                                  label="ID Number"
                                  placeholder="As it appears on your ID"
                                  value={driver_license_number}
                                  onChange={(e) => handleChangeOnOtherOwnersData(e, index)}
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
                  },
                )}
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
            <div className="">
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
