import AggrementBlock from "@/components/applicationVerification/AggrementBlock";
import BankInfo from "@/components/applicationVerification/BankInfo";
import CompanyInformation from "@/components/applicationVerification/CompanyInformation";
import CompanyOwners from "@/components/applicationVerification/CompanyOwners";
import CustomSection from "@/components/applicationVerification/CustomSection";
import Documents from "@/components/applicationVerification/Documents";
import ProcessingInfo from "@/components/applicationVerification/ProcessingInfo";
import CustomLoading from "@/components/shared/small/CustomLoading";
import Button from "@/components/shared/small/Button";
import useApplyBranding from "@/hooks/useApplyBranding";
import { usePageDownload } from "@/hooks/usePageDownload";
import {
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useSubmitFormMutation,
} from "@/redux/apis/formApis";
import { setIdMissionData } from "@/redux/slices/authSlice";
import {
  addSavedFormData,
  clearSavedFormData,
  updateFormHeaderAndFooter,
  updateFormState,
} from "@/redux/slices/formSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Stepper from "../../../../components/Stepper/Stepper";
import { uploadFilesAndReplace } from "@/lib/utils";
import { useApplicantScreenContext } from "@/hooks/useApplicantScreenContext";
import getEnv from "@/lib/env";

// Section titles that map to a renderable step component in the stepper below.
// Keep this in sync with the step.title branches in the effect.
const RENDERABLE_SECTION_TITLES = [
  "company_information_blk",
  "beneficial_blk",
  "bank_account_info_blk",
  "avg_transactions_blk",
  "incorporation_article_blk",
  "custom_section",
  "agreement_blk",
];

export default function ApplicationForm() {
  const stepContainerRef = useRef(null);
  const queryParams = new URLSearchParams(window.location.search);
  const step = queryParams.get("step");
  const draftId = queryParams.get("draftId");

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state?.form);

  const [currentStep, setCurrentStep] = useState(step ? parseInt(step) : 0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [renderedSections, setRenderedSections] = useState([]);
  const [isSavedApiRun, setIsSavedApiRun] = useState(false);

  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [formSubmit] = useSubmitFormMutation();
  const [getSavedFormData] = useGetSavedFormMutation();
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const { isApplied } = useApplyBranding({ formId });
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);
  const handleNext = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          // check if not createdAt and updatedAt fields in data then add them
          const oldData = formData?.[name];
          updatedData.updatedAt = new Date().toISOString();
          if (!updatedData.createdAt && !oldData?.createdAt) {
            updatedData.createdAt = new Date().toISOString();
          } else if (oldData?.createdAt) {
            updatedData.createdAt = oldData?.createdAt;
          } else {
            updatedData.createdAt = new Date().toISOString();
          }
          const updatedBy = {
            _id: user?._id,
            email: user?.email,
            name: user?.firstName + " " + user?.lastName,
            role: user?.role?.name,
          };
          updatedData.updatedBy = updatedBy;
          // Update Redux state
          const res = await saveFormInDraft({
            formId: form?.data?._id,
            draftId,
            formData: { ...formData, [name]: updatedData },
          }).unwrap();

          if (res.success) {
            const action = await dispatch(updateFormState({ data: updatedData, name }));
            unwrapResult(action);
          }
        }
      } catch (error) {
        console.log("error while handling next", error);
        toast.error(error?.data?.message || "Error while handling next");
      } finally {
        // Move to next step (cap at the number of actual rendered steps)
        if (currentStep < stepsComps.length - 1) setCurrentStep(currentStep + 1);
        setLoadingNext(false);
      }
    },
    [currentStep, dispatch, form?.data?._id, draftId, stepsComps.length, formData, saveFormInDraft, user],
  );

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
      // fields are discovered from the live DOM via formRef
    },
    actions: {
      scrollToField: ({ fieldId }) => {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      },
      goToNextStep: () => {
        if (currentStep < stepsComps.length - 1) setCurrentStep(currentStep + 1);
      },
      goToPrevStep: () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
      },
    },
    deps: [currentStep, stepsComps.length, sectionNames[currentStep], form?.data?._id],
  });
  const handleSubmit = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);

        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          // check if not createdAt and updatedAt fields in data then add them
          const oldData = formData?.[name];
          updatedData.updatedAt = new Date().toISOString();
          if (!updatedData.createdAt && !oldData?.createdAt) {
            updatedData.createdAt = new Date().toISOString();
          } else if (oldData?.createdAt) {
            updatedData.createdAt = oldData?.createdAt;
          } else {
            updatedData.createdAt = new Date().toISOString();
          }
          const updatedBy = {
            _id: user?._id,
            email: user?.email,
            name: user?.firstName + " " + user?.lastName,
            role: user?.role?.name,
          };
          updatedData.updatedBy = updatedBy;
          // Save form draft (non-file data only)
          const res = await formSubmit({
            formId: form?.data?._id,
            draftId,
            formData: { ...formData, [name]: updatedData },
          }).unwrap();
          if (res.success) {
            toast.success(res.message);
            // clear redux state
            dispatch(clearSavedFormData());
            navigate("/submited-successfully/" + form?.data?._id);
          }
        }
      } catch (error) {
        console.log("error submitting form", error);
        toast.error(error?.data?.message || "Error while submitting form");
      } finally {
        setLoadingNext(false);
      }
    },
    [
      dispatch,
      form?.data?._id,
      draftId,
      formData,
      formSubmit,
      navigate,
      user?._id,
      user?.email,
      user?.firstName,
      user?.lastName,
      user?.role?.name,
    ],
  );
  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          // Merge into existing section so partial saves (e.g. signature-only) don't wipe fields
          const oldData = formData?.[name] || {};
          const merged = { ...oldData, ...updatedData };
          merged.updatedAt = new Date().toISOString();
          if (!merged.createdAt && !oldData?.createdAt) {
            merged.createdAt = new Date().toISOString();
          } else if (oldData?.createdAt) {
            merged.createdAt = oldData.createdAt;
          } else if (updatedData.createdAt) {
            merged.createdAt = updatedData.createdAt;
          } else {
            merged.createdAt = new Date().toISOString();
          }
          const updatedBy = {
            _id: user?._id,
            email: user?.email,
            name: user?.firstName + " " + user?.lastName,
            role: user?.role?.name,
          };
          merged.updatedBy = updatedBy;
          const res = await saveFormInDraft({
            formId: form?.data?._id,
            draftId,
            formData: { ...formData, [name]: merged },
          }).unwrap();
          if (res.success) {
            // Keep Redux in sync so reopen / step remount hydrates filled fields
            const action = await dispatch(updateFormState({ data: merged, name }));
            unwrapResult(action);
            toast.success(res.message);
          }
        }
      } catch (error) {
        console.log("error while saving form in draft", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
      }
    },
    [dispatch, form?.data?._id, draftId, formData, saveFormInDraft, user],
  );

  useEffect(() => {
    // Resume only when Continue passed a draftId. A fresh start has no draft yet —
    // it is created later when company lookup saves.
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
    // add footer and header text in state
    if (form?.data?.footerText || form?.data?.headerText || form?.data?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: form?.data?.headerText || form?.data?.name || "",
          footerText: form?.data?.footerText || "All rights reserved",
          headerTextSize: form?.data?.headerTextSize || 24,
        }),
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ headerText: "", footerText: "All rights reserved" }));
    };
  }, [dispatch, form, draftId, getSavedFormData]);

  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0 && isSavedApiRun) {
      const companyInformationStep = form?.data?.sections.find((step) => step.key === "company_information");
      const data = [];
      const stepNames = [];
      const renderedSectionsArr = [];
      const isOwner = user?._id && user?._id === form?.data?.owner;
      // Only sections that map to a renderable step component count towards the stepper.
      // Sections with an unrecognized title are neither rendered nor counted, so
      // totalSteps stays in sync with the actual number of steps (fixes last-step
      // showing "Next" instead of "Submit").
      const visibleSections = (
        isOwner ? form?.data?.sections : form?.data?.sections?.filter((step) => !step?.isHidden)
      )?.filter((step) => RENDERABLE_SECTION_TITLES.includes(step?.title));
      visibleSections.forEach((step) => {
        renderedSectionsArr.push(step);
        const sectionDataFromRedux = formData?.[step?.key];
        const commonProps = {
          _id: step._id,
          sectionKey: step.key || "",
          name: step.name,
          title: step.title,
          fields: step?.fields ?? [],
          blocks: step?.blocks ?? [],
          isSignature: step?.isSignature,
          reduxData: sectionDataFromRedux,
          currentStep,
          totalSteps: visibleSections?.length,
          handleNext,
          handlePrevious,
          handleSubmit,
          formLoading,
          formRefetch,
          saveInProgress,
          step,
        };
        if (step.title === "company_information_blk") {
          data.push(<CompanyInformation {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === "beneficial_blk") {
          data.push(<CompanyOwners {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === "bank_account_info_blk") {
          data.push(<BankInfo {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === "avg_transactions_blk") {
          data.push(<ProcessingInfo {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === "incorporation_article_blk") {
          data.push(<Documents {...commonProps} companyInformationStep={companyInformationStep} />);
          stepNames.push(step.name);
        } else if (step.title === "custom_section") {
          data.push(<CustomSection {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === "agreement_blk") {
          data.push(<AggrementBlock {...commonProps} />);
          stepNames.push(step.name);
        }
      });

      setStepsComps(data);
      setSectionNames(stepNames);
      setRenderedSections(renderedSectionsArr);
    }
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
    getFieldRows: () => {
      if (!stepContainerRef.current) return [];
      const rows = [];
      stepContainerRef.current.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.type === "file" || el.type === "hidden") return;
        const value = el.value?.trim();
        if (!value) return;
        const label =
          document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
          el.getAttribute("data-ai-label") ||
          el.placeholder ||
          el.name ||
          "";
        if (label) rows.push({ label: label.replace(/[*:]+$/, "").trim(), value });
      });
      return rows;
    },
    // Read signature at download click time from the live page:
    // SignatureBox gets oldSignatureUrl={form?.signature?.value?.secureUrl} and exposes it as data-signature-url.
    // Fallback to Redux if the section was already saved.
    signatureUrl: () => {
      const fromPage = stepContainerRef.current
        ?.querySelector("[data-signature-url]")
        ?.getAttribute("data-signature-url");
      if (fromPage) return fromPage;
      const section = formData?.[currentSection?.key];
      return section?.signature?.value?.secureUrl || section?.signature?.secureUrl || null;
    },
  });
  if (!isApplied || !form?.data?._id)
    return (
      <>
        <div data-ai-loading="page" style={{ display: "none" }} />
        <CustomLoading />
      </>
    );
  if (!user?._id)
    return navigate(`/application-form/${form?.data?.branding?.name}/${formId}${draftId ? `?draftId=${draftId}` : ""}`);
  return (
    <div
      className="bg-backgroundColor h-full w-full overflow-hidden rounded-[10px] px-6 py-6"
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
}
