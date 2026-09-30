import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetSavedFormMutation, useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import { addSavedFormData, updateFormHeaderAndFooter } from "@/redux/slices/form.slice";
import useApplyBranding from "@/hooks/useApplyBranding";
import ErrorBoundary from "@/components/global/ErrorBoundary";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import Stepper from "@/components/stepper/Stepper";
import useApplicantPageDownload from "./hooks/useApplicantPageDownload";
import useApplicantScreenContext from "./hooks/useApplicantScreenContext";
import useApplicantStepSubmission from "./hooks/useApplicantStepSubmission";
import ApplicantAgreementBlock from "./components/ApplicantAgreementBlock";
import ApplicantBankInfo from "./components/ApplicantBankInfo";
import ApplicantCompanyInformation from "./components/ApplicantCompanyInformation";
import ApplicantCompanyOwners from "./components/ApplicantCompanyOwners";
import ApplicantCustomSection from "./components/ApplicantCustomSection";
import ApplicantDocuments from "./components/ApplicantDocuments";
import ApplicantProcessingInfo from "./components/ApplicantProcessingInfo";
import { SECTION_TITLES, STEPPER_PARAMS } from "@/constants";
import {
  DEFAULT_HEADER_FOOTER,
  DEFAULT_HEADER_TEXT_SIZE,
  RENDERABLE_SECTION_TITLES,
  SECTION_KEYS,
} from "./utils/applicant.constants";
import { collectStepFieldRows } from "./utils/applicant.page.utils";
import { buildPageFaqs } from "@/utils/aiHelpContext";
import { buildApplicationFormPath } from "@/utils/applicationPaths";
import { findAiFieldEl } from "@/utils/discoverFormFields";
import getEnv from "@/utils/env";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { formData, currentDraftId } = useSelector((state) => state.form);
  const draftId = searchParams.get(STEPPER_PARAMS.DRAFT_ID) || currentDraftId;
  const [currentStep, setCurrentStep] = useState(() => Number(searchParams.get(STEPPER_PARAMS.STEP)) || 0);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { isApplied } = useApplyBranding({ formId });
  const formDocument = form?.data;
  const formDocumentId = formDocument?._id;
  const hasSections = formDocument?.sections?.length > 0;

  // only sections with a step component count towards the stepper
  const visibleSections = useMemo(() => {
    if (!hasSections || !isDraftLoaded) return [];
    const isOwner = Boolean(user?._id) && user._id === formDocument.owner;
    return formDocument.sections
      .filter((section) => isOwner || !section.isHidden)
      .filter((section) => RENDERABLE_SECTION_TITLES.includes(section.title));
  }, [formDocument, hasSections, isDraftLoaded, user?._id]);
  const sectionNames = visibleSections.map((section) => section.name);
  const currentSection = visibleSections[currentStep];
  const companyInformationStep = formDocument?.sections?.find(
    (section) => section.key === SECTION_KEYS.COMPANY_INFORMATION,
  );

  const { handleNext, handlePrevious, handleSubmit, saveInProgress } = useApplicantStepSubmission({
    formDocumentId,
    draftId,
    formData,
    user,
    currentStep,
    stepsCount: visibleSections.length,
    setCurrentStep,
  });

  useApplicantScreenContext({
    screenId: `application-form-stepper-${currentStep}`,
    screenName: sectionNames[currentStep] || "Application Form",
    description: `Multi-step application form. Applicant is on step ${currentStep + 1} of ${visibleSections.length}.`,
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
    formId: formDocumentId,
    formRef: stepContainerRef,
    currentState: {
      currentStep,
      totalSteps: visibleSections.length,
      canGoNext: currentStep < visibleSections.length - 1,
      canGoPrev: currentStep > 0,
      pageFaqs: buildPageFaqs(currentSection),
    },
    actions: {
      scrollToField: ({ fieldId }) => {
        const el = findAiFieldEl(stepContainerRef.current, fieldId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    },
  });

  // resume only when a draft id was passed
  useEffect(() => {
    if (!hasSections) return;
    if (!draftId) {
      setIsDraftLoaded(true);
      return;
    }
    getSavedFormData({ formId: formDocumentId, draftId })
      .then((res) => {
        const data = res?.data?.data?.savedData;
        if (data) dispatch(addSavedFormData(data));
      })
      .finally(() => setIsDraftLoaded(true));
  }, [dispatch, draftId, formDocumentId, getSavedFormData, hasSections]);

  // header and footer text for the layout
  useEffect(() => {
    if (formDocument?.footerText || formDocument?.headerText || formDocument?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: formDocument?.headerText || formDocument?.name || "",
          footerText: formDocument?.footerText || DEFAULT_HEADER_FOOTER.footerText,
          headerTextSize: formDocument?.headerTextSize || DEFAULT_HEADER_TEXT_SIZE,
        }),
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER }));
    };
  }, [dispatch, formDocument]);

  const {
    buttonLabel: downloadLabel,
    handleDownload,
    isDownloading,
  } = useApplicantPageDownload({
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
  const mustVerifyFirst = isApplied && !!formDocumentId && !user?._id;
  useEffect(() => {
    if (!mustVerifyFirst) return;
    navigate(buildApplicationFormPath({ formId, brandingName: formDocument?.branding?.name, draftId }), {
      replace: true,
    });
  }, [mustVerifyFirst, navigate, formDocument?.branding?.name, formId, draftId]);

  if (!isApplied || !formDocumentId || mustVerifyFirst)
    return (
      <>
        <div data-ai-loading="page" className="hidden" />
        <CustomLoading />
      </>
    );

  const StepComponent = SECTION_COMPONENTS[currentSection?.title];

  return (
    <article
      className="bg-backgroundColor w-full rounded-[10px] px-6 py-6"
      data-testid="application-form"
      data-ai-loading={!isDraftLoaded ? "page" : undefined}
    >
      <ErrorBoundary name="ApplicationStepper">
        <Stepper
          steps={sectionNames}
          currentStep={currentStep}
          visibleSteps={0}
          emptyRequiredFields={[]}
          headerActions={
            <Button variant="secondary" onClick={handleDownload} label={downloadLabel} disabled={isDownloading} />
          }
        >
          <div ref={stepContainerRef}>
            {StepComponent && (
              <StepComponent
                key={currentSection._id}
                _id={currentSection._id}
                sectionKey={currentSection.key || ""}
                name={currentSection.name}
                title={currentSection.title}
                fields={currentSection.fields ?? []}
                isSignature={currentSection.isSignature}
                reduxData={formData?.[currentSection.key]}
                currentStep={currentStep}
                totalSteps={visibleSections.length}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                handleSubmit={handleSubmit}
                formLoading={formLoading}
                formRefetch={formRefetch}
                saveInProgress={saveInProgress}
                step={currentSection}
                companyInformationStep={companyInformationStep}
              />
            )}
          </div>
        </Stepper>
      </ErrorBoundary>
    </article>
  );
};

export default ApplicationForm;
