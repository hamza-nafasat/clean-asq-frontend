import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetSavedFormMutation, useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import { setIdMissionData } from "@/redux/slices/auth.slice";
import { addSavedFormData, updateFormHeaderAndFooter } from "@/redux/slices/form.slice";
import { useApplicantScreenContext } from "./hooks/useApplicantScreenContext";
import useApplicantStepSubmission from "./hooks/useApplicantStepSubmission";
import useApplyBranding from "@/hooks/useApplyBranding";
import { usePageDownload } from "./hooks/usePageDownload";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import Stepper from "@/components/stepper/Stepper";
import ApplicantAgreementBlock from "./components/ApplicantAgreementBlock";
import ApplicantBankInfo from "./components/ApplicantBankInfo";
import ApplicantCompanyInformation from "./components/ApplicantCompanyInformation";
import ApplicantCompanyOwners from "./components/ApplicantCompanyOwners";
import ApplicantCustomSection from "./components/ApplicantCustomSection";
import ApplicantDocuments from "./components/ApplicantDocuments";
import ApplicantProcessingInfo from "./components/ApplicantProcessingInfo";
import {
  DEFAULT_HEADER_FOOTER,
  RENDERABLE_SECTION_TITLES,
  SECTION_KEYS,
  SECTION_TITLES,
} from "./utils/applicant.constants";
import { buildApplicationFormPath, collectStepFieldRows } from "./utils/applicant.utils6";
import getEnv from "@/utils/env";
import { findAiFieldEl } from "@/utils/discoverFormFields";
import { buildPageFaqs } from "@/utils/aiHelpContext";

const SECTION_COMPONENTS = {
  [SECTION_TITLES.COMPANY_INFORMATION]: ApplicantCompanyInformation,
  [SECTION_TITLES.BENEFICIAL]: ApplicantCompanyOwners,
  [SECTION_TITLES.BANK_ACCOUNT_INFO]: ApplicantBankInfo,
  [SECTION_TITLES.AVG_TRANSACTIONS]: ApplicantProcessingInfo,
  [SECTION_TITLES.INCORPORATION_ARTICLE]: ApplicantDocuments,
  [SECTION_TITLES.CUSTOM_SECTION]: ApplicantCustomSection,
  [SECTION_TITLES.AGREEMENT]: ApplicantAgreementBlock,
};

const ApplicationForm = () => {
  const stepContainerRef = useRef(null);
  const queryParams = new URLSearchParams(window.location.search);
  const step = queryParams.get("step");
  const urlDraftId = queryParams.get("draftId");
  const navigate = useNavigate();
  const { formId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { formData, currentDraftId } = useSelector((state) => state?.form);
  const draftId = urlDraftId || currentDraftId;

  const [currentStep, setCurrentStep] = useState(step ? parseInt(step) : 0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [renderedSections, setRenderedSections] = useState([]);
  const [isSavedApiRun, setIsSavedApiRun] = useState(false);

  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { isApplied } = useApplyBranding({ formId });
  const { handleNext, handlePrevious, handleSubmit, saveInProgress } = useApplicantStepSubmission({
    formDocumentId: form?.data?._id,
    draftId,
    formData,
    user,
    currentStep,
    stepsCount: stepsComps.length,
    setCurrentStep,
  });

  useApplicantScreenContext({
    screenId: `application-form-stepper-${currentStep}`,
    screenName: sectionNames[currentStep] || "Application Form",
    description: `Multi-step application form. Applicant is on step ${currentStep + 1} of ${stepsComps.length}.`,
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
    formRef: stepContainerRef,
    currentState: {
      currentStep,
      totalSteps: stepsComps.length,
      canGoNext: currentStep < stepsComps.length - 1,
      canGoPrev: currentStep > 0,
      pageFaqs: buildPageFaqs(renderedSections[currentStep]),
    },
    actions: {
      scrollToField: ({ fieldId }) => {
        const el = findAiFieldEl(stepContainerRef.current, fieldId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    },
    deps: [currentStep, stepsComps.length, sectionNames[currentStep], form?.data?._id],
  });

  // resume only when a draft id was passed
  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0) {
      if (!draftId) {
        setIsSavedApiRun(true);
      } else {
        getSavedFormData({ formId: form?.data?._id, draftId })
          .then((res) => {
            const data = res?.data?.data?.savedData;
            dispatch(setIdMissionData(data?.idMission));
            if (data) dispatch(addSavedFormData(data));
          })
          .finally(() => setIsSavedApiRun(true));
      }
    }
    if (form?.data?.footerText || form?.data?.headerText || form?.data?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: form?.data?.headerText || form?.data?.name || "",
          footerText: form?.data?.footerText || DEFAULT_HEADER_FOOTER.footerText,
          headerTextSize: form?.data?.headerTextSize || 24,
        }),
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER }));
    };
  }, [dispatch, form, draftId, getSavedFormData]);

  // only sections with a step component count towards the stepper
  useEffect(() => {
    if (!(form?.data?.sections && form?.data?.sections?.length > 0 && isSavedApiRun)) return;
    const companyInformationStep = form?.data?.sections.find((item) => item.key === SECTION_KEYS.COMPANY_INFORMATION);
    const isOwner = user?._id && user?._id === form?.data?.owner;
    const visibleSections = (
      isOwner ? form?.data?.sections : form?.data?.sections?.filter((item) => !item?.isHidden)
    )?.filter((item) => RENDERABLE_SECTION_TITLES.includes(item?.title));
    const steps = visibleSections.map((item) => {
      const StepComponent = SECTION_COMPONENTS[item.title];
      const commonProps = {
        _id: item._id,
        sectionKey: item.key || "",
        name: item.name,
        title: item.title,
        fields: item?.fields ?? [],
        blocks: item?.blocks ?? [],
        isSignature: item?.isSignature,
        reduxData: formData?.[item?.key],
        currentStep,
        totalSteps: visibleSections?.length,
        handleNext,
        handlePrevious,
        handleSubmit,
        formLoading,
        formRefetch,
        saveInProgress,
        step: item,
      };
      return item.title === SECTION_TITLES.INCORPORATION_ARTICLE ? (
        <StepComponent {...commonProps} companyInformationStep={companyInformationStep} />
      ) : (
        <StepComponent {...commonProps} />
      );
    });
    setStepsComps(steps);
    setSectionNames(visibleSections.map((item) => item.name));
    setRenderedSections(visibleSections);
  }, [
    currentStep,
    form?.data?.owner,
    form?.data?.sections,
    formData,
    formLoading,
    formRefetch,
    handleNext,
    handlePrevious,
    handleSubmit,
    isSavedApiRun,
    saveInProgress,
    user?._id,
  ]);

  const currentSection = renderedSections[currentStep];
  const { buttonLabel: downloadLabel, handleDownload, isDownloading } = usePageDownload({
    pageName: sectionNames[currentStep] || currentSection?.name || "Page",
    displayHtml: currentSection?.ai_formatting || currentSection?.displayText || "",
    userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
    userEmail: user?.email || null,
    signDisplayHtml: currentSection?.signDisplayFormattedText || null,
    getFieldRows: () => collectStepFieldRows(stepContainerRef.current),
    // live page signature first, then the saved section
    signatureUrl: () => {
      const fromPage = stepContainerRef.current
        ?.querySelector("[data-signature-url]")
        ?.getAttribute("data-signature-url");
      if (fromPage) return fromPage;
      const savedSection = formData?.[currentSection?.key];
      return savedSection?.signature?.value?.secureUrl || savedSection?.signature?.secureUrl || null;
    },
  });

  // redirect from an effect, never during render
  const mustVerifyFirst = isApplied && !!form?.data?._id && !user?._id;
  useEffect(() => {
    if (!mustVerifyFirst) return;
    navigate(buildApplicationFormPath(form?.data?.branding?.name, formId, draftId), { replace: true });
  }, [mustVerifyFirst, navigate, form?.data?.branding?.name, formId, draftId]);

  if (!isApplied || !form?.data?._id || mustVerifyFirst)
    return (
      <>
        <div data-ai-loading="page" className="hidden" />
        <CustomLoading />
      </>
    );

  return (
    <div
      className="bg-backgroundColor w-full rounded-[10px] px-6 py-6"
      data-testid="application-form"
      data-ai-loading={!isSavedApiRun ? "page" : undefined}
    >
      <Stepper
        steps={sectionNames}
        currentStep={currentStep}
        visibleSteps={0}
        emptyRequiredFields={[]}
        headerActions={
          <Button variant="secondary" onClick={handleDownload} label={downloadLabel} disabled={isDownloading} />
        }
      >
        <div ref={stepContainerRef}>{stepsComps[currentStep]}</div>
      </Stepper>
    </div>
  );
};

export default ApplicationForm;
