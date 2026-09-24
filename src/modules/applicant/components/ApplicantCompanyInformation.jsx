import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useEnterToNextField } from "../hooks/useEnterToNextField";
import { OtherInputType } from "@/components/global/DynamicField";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import NaicsMatchModal from "@/components/modals/NaicsMatchModal";
import CustomizationFieldsModal from "./ApplicantCustomizeFieldsModal";
import DisplayText from "./ApplicantDisplayText";
import ApplicantNaicsInput from "./ApplicantNaicsInput";
import ApplicantSectionField from "./ApplicantSectionField";
import { EditSectionDisplayTextFromatingModal } from "./ApplicantSectionTextModal";
import { NAICS_FIELD, STATE_SUGGESTIONS } from "@/constants";
import { FIELD_NAMES, NAICS_INPUT_ID, SECTION_FIELD_INPUT_TYPES } from "../utils/applicant.constants";
import { formatNaicsBestMatch } from "../utils/applicant.utils8";
import {
  buildCompanyInformationForm,
  isCompanyInformationComplete,
  uploadSignatureReplacing,
} from "../utils/applicant.utils12";
import { isNotGuestRoleValue } from "@/utils/permissions";
import { normalizeSignature } from "@/utils/signatureShape";

const CompanyInformation = ({
  sectionKey,
  formRefetch,
  _id,
  name,
  handleNext,
  handlePrevious,
  currentStep = 0,
  totalSteps = 0,
  handleSubmit,
  reduxData,
  formLoading = false,
  fields = [],
  saveInProgress,
  step = {},
  isSignature = false,
}) => {
  const prevRef = useRef(null);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state?.form);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [naicsToMccDetails, setNaicsToMccDetails] = useState({
    NAICS: reduxData?.naics?.NAICS || "",
    NAICS_Description: reduxData?.naics?.NAICS_Description || "",
    MCC: reduxData?.naics?.MCC || "",
  });
  const [showNaicsToMccDetails, setShowNaicsToMccDetails] = useState(true);
  const [naicsApiData, setNaicsApiData] = useState({ bestMatch: {}, otherMatches: [] });
  const [naicsLoading, setNaicsLoading] = useState(false);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();

  const strategyKeys = strategyKeysData?.data?.map((item) => item?.searchObjectKey) ?? [];
  const companyHasNoWebsite = formData?.company_has_no_website === true;
  const effectiveFields = useMemo(
    () =>
      (fields || []).map((f) =>
        companyHasNoWebsite && f?.name === FIELD_NAMES.WEBSITE_URL ? { ...f, required: false } : f,
      ),
    [fields, companyHasNoWebsite],
  );
  const requiredNames = useMemo(
    () => effectiveFields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [effectiveFields],
  );
  const isCreator = user?._id && user?._id === step?.owner && isNotGuestRoleValue(user);
  const isAllRequiredFieldsFilled =
    isCreator || isCompanyInformationComplete({ form, requiredNames, naics: naicsToMccDetails.NAICS, isSignature });
  const hasDescriptionField = effectiveFields?.some((f) => f.name === FIELD_NAMES.COMPANY_DESCRIPTION);
  const sectionData = { ...form, naics: naicsToMccDetails };

  const handleSignatureUpload = async (file, setIsSaving, stamp) => {
    try {
      if (!file) return toast.error("Please select a file");
      const { res, errorMessage } = await uploadSignatureReplacing(file, form?.signature?.value || {}, stamp);
      if (errorMessage) return toast.error(errorMessage);
      setForm((prev) => ({ ...prev, signature: { name: FIELD_NAMES.SIGNATURE, value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
    } finally {
      setIsSaving?.(false);
    }
  };

  const handleFindNaics = async () => {
    const description = Object.values(form).find((v) => v?.name === FIELD_NAMES.COMPANY_DESCRIPTION)?.value;
    if (!description) return toast.error("Please enter a description first");
    try {
      setNaicsLoading(true);
      const res = await findNaicsToMccDetails({ description }).unwrap();
      if (res.success) {
        setNaicsApiData(res?.data);
        setShowNaicsToMccDetails(true);
      }
    } catch (error) {
      console.error("Find NAICS error:", error);
      toast.error(error?.data?.message || "Failed to find NAICS code");
    } finally {
      setNaicsLoading(false);
    }
  };

  // best NAICS match from the lookup description, once per lookup change
  useEffect(() => {
    const curr = formData?.company_lookup_data;
    if (JSON.stringify(prevRef.current) === JSON.stringify(curr)) return;
    prevRef.current = curr;
    if (!curr) return;
    (async () => {
      const description = curr.find((i) => i?.name === FIELD_NAMES.COMPANY_DESCRIPTION)?.result;
      if (naicsToMccDetails?.NAICS || !description) return;
      try {
        setNaicsLoading(true);
        const res = await findNaicsToMccDetails({ description }).unwrap();
        if (res.success) setNaicsToMccDetails(formatNaicsBestMatch(res.data.bestMatch));
      } catch (error) {
        console.error("Find NAICS error:", error);
        toast.error(error?.data?.message || "Failed to find NAICS code");
      } finally {
        setNaicsLoading(false);
      }
    })();
  }, [findNaicsToMccDetails, formData?.company_lookup_data, naicsToMccDetails?.NAICS]);

  useEffect(() => {
    if (fields && fields.length > 0) {
      setForm(buildCompanyInformationForm(fields, formData?.company_lookup_data, reduxData));
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, formData?.company_lookup_data, isSignature, reduxData]);

  // keep NAICS in sync when the draft loads after mount
  useEffect(() => {
    if (!reduxData?.naics) return;
    setNaicsToMccDetails((prev) => {
      if (prev?.NAICS) return prev;
      return {
        NAICS: reduxData.naics.NAICS || "",
        NAICS_Description: reduxData.naics.NAICS_Description || "",
        MCC: reduxData.naics.MCC || "",
      };
    });
  }, [reduxData?.naics]);

  // focus the first input after the initial effects settle
  useEffect(() => {
    let frame2;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = formContainerRef.current;
        if (!container) return;
        const inputs = Array.from(
          container.querySelectorAll(
            `input:not([disabled]):not([readonly]):not(#${NAICS_INPUT_ID}), textarea:not([disabled]):not([readonly])`,
          ),
        ).filter((el) => el.offsetParent !== null);
        if (inputs.length > 0) inputs[0].focus();
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  submitFromEnterRef.current = () => {
    if (!isAllRequiredFieldsFilled || loadingNext) return;
    if (currentStep < totalSteps - 1) handleNext({ data: sectionData, name: sectionKey, setLoadingNext });
    else handleSubmit({ data: sectionData, name: sectionKey, setLoadingNext });
  };
  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef, excludeIds: [NAICS_INPUT_ID] });

  const findNaicsButton = (
    <div className="mt-2 flex w-full flex-col items-end">
      <Button
        label="Find NAICS"
        className={`text-nowrap ${naicsLoading && "pointer-events-none opacity-30"}`}
        disabled={naicsLoading}
        onClick={handleFindNaics}
        icon={naicsLoading && CgSpinner}
        cnLeft="animate-spin h-5 w-5"
      />
    </div>
  );

  return (
    <div ref={formContainerRef} className="mt-14 h-full">
      {updateSectionFromatingModal && (
        <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => saveInProgress({ data: sectionData, name: sectionKey })} label="Save my progress" />
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label="Customize" />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end gap-3">
          <DisplayText className="w-full" data-ai-display-text html={step?.ai_formatting || step?.displayText} />
        </div>
      )}

      {effectiveFields?.length > 0 &&
        effectiveFields.map((field, index) => {
          if (SECTION_FIELD_INPUT_TYPES.includes(field.type)) {
            return (
              <ApplicantSectionField
                key={index}
                field={field}
                form={form}
                setForm={setForm}
                radioClassName="mt-4 flex flex-col gap-2"
              />
            );
          }
          if (field.name?.toLowerCase().includes(FIELD_NAMES.INCORPORATION_PART)) {
            return (
              <div key={index} className="mt-4">
                {field.label && (
                  <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                    {field.label}:{field.required ? "*" : ""}
                  </h4>
                )}
                <TextField
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.uniqueId]?.value || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field.uniqueId]: { name: field.name, value: e.target.value } }))
                  }
                  required={field.required}
                  suggestions={STATE_SUGGESTIONS}
                  className="mt-2"
                />
              </div>
            );
          }
          const isDescription = field.name === FIELD_NAMES.COMPANY_DESCRIPTION;
          return (
            <div
              key={index}
              className="mt-4"
              data-ai-loading={isDescription && !formData?.company_lookup_data ? "true" : undefined}
            >
              <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
              {isDescription && findNaicsButton}
            </div>
          );
        })}
      <NaicsMatchModal
        isOpen={Boolean(naicsApiData?.bestMatch?.naics && showNaicsToMccDetails)}
        naicsApiData={naicsApiData}
        onMatchesChange={setNaicsApiData}
        onSave={(bestMatch) => {
          if (bestMatch?.naics) setNaicsToMccDetails(formatNaicsBestMatch(bestMatch));
          else toast.error("Please select a best match");
        }}
        onClose={() => setShowNaicsToMccDetails(false)}
      />
      {!hasDescriptionField && findNaicsButton}
      <div className="mt-6 flex w-full flex-col items-start">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">{NAICS_FIELD.label}</h4>
        <div className="mt-2 flex w-full flex-col gap-4">
          <ApplicantNaicsInput
            value={naicsToMccDetails.NAICS}
            isLoading={naicsLoading}
            setNaicsToMccDetails={setNaicsToMccDetails}
          />
          <div className="">
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

      {/* Actions */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && (
            <Button variant="secondary" label="Previous" onClick={handlePrevious} data-testid="form-back-btn" />
          )}
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && "pointer-events-none cursor-not-allowed opacity-50"}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled || loadingNext ? "Next" : "Some Required Fields are Missing"}
              data-testid="form-next-btn"
              onClick={() => handleNext({ data: sectionData, name: sectionKey, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${(formLoading || loadingNext) && "pinter-events-none cursor-not-allowed opacity-50"}`}
              label="Submit"
              data-testid="form-submit-btn"
              onClick={() => handleSubmit({ data: sectionData, name: sectionKey, setLoadingNext })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            suggestions={strategyKeys}
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            isSignature={isSignature}
            section={step}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CompanyInformation;
