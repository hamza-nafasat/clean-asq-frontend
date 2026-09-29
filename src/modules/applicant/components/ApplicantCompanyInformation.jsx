import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { OtherInputType } from "@/components/global/DynamicField";
import SignatureBox from "@/components/global/SignatureBox";
import NaicsMatchModal from "@/components/modals/NaicsMatchModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantNaicsInput from "./ApplicantNaicsInput";
import ApplicantSectionField from "./ApplicantSectionField";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { FIELD_NAME_MATCHERS, FIELD_NAMES, formKeys, NAICS_FIELD, STATE_SUGGESTIONS } from "@/constants";
import { NAICS_INPUT_ID, SECTION_FIELD_INPUT_TYPES, SECTION_KEYS } from "../utils/applicant.constants";
import { buildCompanyInformationForm } from "../utils/applicant.companyInformation.utils";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { isCompanyInformationComplete } from "../utils/applicant.validation.utils";
import { buildNaicsFromMatch } from "@/utils/naicsLookup";
import { PERMISSIONS } from "@/utils/permissions";
import { normalizeSignature } from "@/utils/signatureShape";

// keep typed answers, fill only empty fields
const keepTypedValues = (prev, built) =>
  Object.fromEntries(Object.entries(built).map(([key, entry]) => [key, prev[key]?.value ? prev[key] : entry]));

const ApplicantCompanyInformation = ({
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
  const prevLookupRef = useRef(null);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
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
  const canReadLookup = usePermission(PERMISSIONS.READ_LOOKUP);
  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery(undefined, { skip: !canReadLookup });

  // older drafts may hold a broken lookup list
  const lookupData = Array.isArray(formData?.[formKeys.company_lookup_data])
    ? formData[formKeys.company_lookup_data]
    : undefined;
  const strategyKeys = strategyKeysData?.data?.map((item) => item?.searchObjectKey) ?? [];
  const companyHasNoWebsite = formData?.[SECTION_KEYS.COMPANY_HAS_NO_WEBSITE] === true;
  const effectiveFields = useMemo(
    () =>
      fields.map((f) => (companyHasNoWebsite && f?.name === FIELD_NAMES.WEBSITE_URL ? { ...f, required: false } : f)),
    [fields, companyHasNoWebsite],
  );
  const requiredNames = effectiveFields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId }));
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const isComplete =
    isOwner || isCompanyInformationComplete({ form, requiredNames, naics: naicsToMccDetails.NAICS, isSignature });
  const isBusy = loadingNext || formLoading;
  const hasDescriptionField = effectiveFields.some((f) => f.name === FIELD_NAMES.COMPANY_DESCRIPTION);
  const sectionData = { ...form, naics: naicsToMccDetails };
  const stepAction = { data: sectionData, name: sectionKey, setLoadingNext };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

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
    if (JSON.stringify(prevLookupRef.current) === JSON.stringify(lookupData)) return;
    prevLookupRef.current = lookupData;
    if (!lookupData) return;
    (async () => {
      const description = lookupData.find((i) => i?.name === FIELD_NAMES.COMPANY_DESCRIPTION)?.result;
      if (naicsToMccDetails?.NAICS || !description) return;
      try {
        setNaicsLoading(true);
        const res = await findNaicsToMccDetails({ description }).unwrap();
        if (res.success) setNaicsToMccDetails(buildNaicsFromMatch(res.data.bestMatch));
      } catch (error) {
        console.error("Find NAICS error:", error);
        toast.error(error?.data?.message || "Failed to find NAICS code");
      } finally {
        setNaicsLoading(false);
      }
    })();
  }, [findNaicsToMccDetails, lookupData, naicsToMccDetails?.NAICS]);

  useEffect(() => {
    if (fields.length > 0)
      setForm((prev) => keepTypedValues(prev, buildCompanyInformationForm(fields, lookupData, reduxData)));
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, lookupData, isSignature, reduxData]);

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
    if (!isComplete || isBusy) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef, excludeIds: [NAICS_INPUT_ID] });

  const findNaicsButton = (
    <div className="mt-2 flex w-full flex-col items-end">
      <Button
        label="Find NAICS"
        className={`text-nowrap ${naicsLoading ? "pointer-events-none opacity-30" : ""}`}
        disabled={naicsLoading}
        onClick={handleFindNaics}
        icon={naicsLoading ? CgSpinner : undefined}
        cnLeft="animate-spin h-5 w-5"
      />
    </div>
  );

  const renderField = (field) => {
    if (SECTION_FIELD_INPUT_TYPES.includes(field.type)) {
      return (
        <ApplicantSectionField
          key={field.uniqueId}
          field={field}
          form={form}
          setForm={setForm}
          radioClassName="mt-4 flex flex-col gap-2"
        />
      );
    }
    if (field.name?.toLowerCase().includes(FIELD_NAME_MATCHERS.INCORPORATION)) {
      return (
        <div key={field.uniqueId} className="mt-4">
          {field.label && (
            <h3 className="text-textPrimary text-base font-medium lg:text-lg">
              {field.label}:{field.required ? "*" : ""}
            </h3>
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
      <div key={field.uniqueId} className="mt-4" data-ai-loading={isDescription && !lookupData ? "true" : undefined}>
        <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
        {isDescription && findNaicsButton}
      </div>
    );
  };

  return (
    <section ref={formContainerRef} className="mt-14 h-full">
      {isSectionTextModalOpen && (
        <Modal onClose={() => setIsSectionTextModalOpen(false)}>
          <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
        </Modal>
      )}

      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => saveInProgress({ data: sectionData, name: sectionKey })} label="Save my progress" />
          {canCustomize && (
            <>
              <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
              <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </header>

      {(step?.ai_formatting || step?.displayText) && (
        <ApplicantDisplayText
          className="mb-4 w-full"
          data-ai-display-text
          html={step?.ai_formatting || step?.displayText}
        />
      )}

      {effectiveFields.map(renderField)}
      <NaicsMatchModal
        isOpen={Boolean(naicsApiData?.bestMatch?.naics && showNaicsToMccDetails)}
        naicsApiData={naicsApiData}
        onMatchesChange={setNaicsApiData}
        onSave={(bestMatch) => {
          if (bestMatch?.naics) setNaicsToMccDetails(buildNaicsFromMatch(bestMatch));
          else toast.error("Please select a best match");
        }}
        onClose={() => setShowNaicsToMccDetails(false)}
      />
      {!hasDescriptionField && findNaicsButton}
      <div className="mt-6 flex w-full flex-col items-start">
        <h3 className="text-textPrimary text-base font-medium lg:text-lg">{NAICS_FIELD.label}</h3>
        <div className="mt-2 flex w-full flex-col gap-4">
          <ApplicantNaicsInput
            value={naicsToMccDetails.NAICS}
            isLoading={naicsLoading}
            setNaicsToMccDetails={setNaicsToMccDetails}
          />
          {isSignature && <SignatureBox onSave={handleSignatureUpload} step={step} signature={form?.signature} />}
        </div>
      </div>

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
            suggestions={strategyKeys}
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            isSignature={isSignature}
            section={step}
            onClose={() => setIsCustomizeModalOpen(false)}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantCompanyInformation;
