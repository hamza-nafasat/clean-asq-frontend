import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { GoPlus } from "react-icons/go";

import ApplicationPdfField from "@/components/global/ApplicationPdfField";
import ApplicationPdfOwnerCard from "@/components/global/ApplicationPdfOwnerCard";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import { FIELD_NAMES, FORM_BLOCK_TYPE, SIGNATURE_KEY, YES_NO_VALUES } from "@/constants";
import {
  buildInitialOwnersForm,
  buildOwnerFormFields,
  isOwnersBlock,
  makeBlankOwner,
  makeRowId,
} from "@/utils/companyOwners";
import { collectLookupOwners } from "@/utils/lookupOwners";
import { uploadSectionSignature } from "@/utils/sectionSignature";
import HtmlContent from "@/components/shared/HtmlContent";

const CompanyOwnersPdf = ({ name, reduxData, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => {
  const { formData, isDisabledAllFields } = useSelector((state) => state?.form);
  const addressAutocompleteRefs = useRef({});

  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [suggestFor, setSuggestFor] = useState(null);
  const [rowIds, setRowIds] = useState([]);

  const ownersBlock = useMemo(() => fields?.find((field) => isOwnersBlock(field)), [fields]);
  const otherOwnersStateUniqueId = ownersBlock?.uniqueId || "";
  const otherOwnersStateName = ownersBlock?.name || "";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionForm = formInnerData?.[sectionKey] ?? {};

  const owners = useMemo(
    () => sectionForm?.[otherOwnersStateUniqueId]?.value || [],
    [otherOwnersStateUniqueId, sectionForm],
  );

  const idMissionData = formData?.idMission || formInnerData?.idMission;
  const idMissionRoleValue = idMissionData?.roleFillingForCompany?.value || idMissionData?.roleFillingForCompany;
  const isRollingOwner = sectionForm?.[FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER]?.value === YES_NO_VALUES.YES;

  const formFields = useMemo(
    () => buildOwnerFormFields({ fields, idMissionRoleValue, isRollingOwner, sectionForm }),
    [fields, idMissionRoleValue, isRollingOwner, sectionForm],
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

  const updateOwners = useCallback(
    (updateList) =>
      setFormInnerData((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev?.[sectionKey],
          [otherOwnersStateUniqueId]: {
            name: otherOwnersStateName,
            value: updateList([...(prev?.[sectionKey]?.[otherOwnersStateUniqueId]?.value || [])]),
          },
        },
      })),
    [otherOwnersStateUniqueId, otherOwnersStateName, sectionKey, setFormInnerData],
  );

  const handleOwnerValueChange = useCallback(
    (fieldKey, value, index, isFilter = false) => {
      if (fieldKey === "name") {
        setFilteredOwners(
          value ? ownersFromLookup.filter((o) => String(o).toLowerCase().includes(value.toLowerCase())) : [],
        );
        setSuggestFor(value ? index : null);
      }

      updateOwners((list) => {
        list[index] = { ...list[index], [fieldKey]: value };
        return list;
      });

      if (isFilter) {
        setFilteredOwners([]);
        setSuggestFor(null);
      }
    },
    [ownersFromLookup, updateOwners],
  );

  const handleRemoveOwner = useCallback(
    (index) => {
      const removedKey = rowIds[index];
      if (removedKey) delete addressAutocompleteRefs.current[removedKey];
      updateOwners((list) => {
        list.splice(index, 1);
        return list;
      });
      setRowIds((prev) => prev.filter((_, i) => i !== index));
      setFilteredOwners([]);
      setSuggestFor(null);
    },
    [rowIds, updateOwners],
  );

  const handleAddOwner = useCallback(() => {
    updateOwners((list) => [...list, makeBlankOwner()]);
    setRowIds((prev) => [...prev, makeRowId()]);
  }, [updateOwners]);

  const handleAddressLoad = (rowKey) => (autocomplete) => {
    addressAutocompleteRefs.current[rowKey] = autocomplete;
  };

  const handleAddressPlaceChanged = (rowKey, index) => () => {
    const place = addressAutocompleteRefs.current[rowKey]?.getPlace();
    if (!place?.formatted_address) return;
    handleOwnerValueChange("address", place.formatted_address, index);
  };

  useEffect(() => {
    if (!formData) return;
    setOwnersFromLookup(collectLookupOwners(formData, step?.ownerSuggesstions));
  }, [formData, step?.ownerSuggesstions]);

  useEffect(() => {
    if (!formFields?.length) return;
    const initialForm = buildInitialOwnersForm({ formFields, reduxData, isSignature });
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
        (objKey) => sectionForm[objKey]?.name === FIELD_NAMES.ADDITIONAL_OWNERS_OWN_25_PERCENT,
      )
    ]?.value === YES_NO_VALUES.YES;

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <HtmlContent html={step?.ai_formatting || step?.displayText} linkMode="none" />
        </div>
      )}
      <div className="mt-5">
        <div className="h-full overflow-auto pb-3">
          <div className="rounded-xl border border-[#F0F0F0] p-4">
            {formFields?.map((field, index) => {
              if (field.name === FIELD_NAMES.MAIN_OWNER_OWN_25_PERCENT || field.type === FORM_BLOCK_TYPE) return null;
              return (
                <ApplicationPdfField
                  key={field.uniqueId || index}
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                />
              );
            })}

            {showAdditionalOwners ? (
              <div className="flex flex-col gap-3">
                {owners.map((owner, index) => {
                  const rowKey = rowIds[index] ?? `idx_${index}`;
                  return (
                    <ApplicationPdfOwnerCard
                      key={rowKey}
                      owner={owner}
                      index={index}
                      rowKey={rowKey}
                      isDisabled={isDisabledAllFields}
                      nameSuggestions={suggestFor === index ? filteredOwners : []}
                      onValueChange={handleOwnerValueChange}
                      onRemove={handleRemoveOwner}
                      onAddressLoad={handleAddressLoad}
                      onAddressPlaceChanged={handleAddressPlaceChanged}
                    />
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
                  onSave={(file, setIsSaving) =>
                    uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
                  }
                  step={step}
                  isPdf={true}
                  oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOwnersPdf;
