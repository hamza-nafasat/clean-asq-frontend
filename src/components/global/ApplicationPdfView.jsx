import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";

import {
  useGeneratePdfFormMutation,
  useGetSavedFormByUserIdMutation,
  useGetSingleFormQueryQuery,
  useUpdateSubmittedFormMutation,
} from "@/redux/apis/form.apis";
import { addSavedFormData, updateIsDisabledAllFields } from "@/redux/slices/form.slice";
import useApplyBranding from "@/hooks/useApplyBranding";
import useBranding from "@/hooks/useBranding";
import { uploadFilesAndReplace } from "@/lib/utils";
import AggrementBlockPdf from "@/components/global/ApplicationPdfAgreementBlock";
import BankInfoPdf from "@/components/global/ApplicationPdfBankInfo";
import CompanyInformationPdf from "@/components/global/ApplicationPdfCompanyInformation";
import CompanyOwnersPdf from "@/components/global/ApplicationPdfCompanyOwners";
import CustomSectionPdf from "@/components/global/ApplicationPdfCustomSection";
import DocumentsPdf from "@/components/global/ApplicationPdfDocuments";
import IdMissionDataPdf from "@/components/global/ApplicationPdfIdMission";
import ProcessingInfoPdf from "@/components/global/ApplicationPdfProcessingInfo";
import BrandLogo from "@/components/shared/BrandLogo";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import { SECTION_TITLES } from "@/constants";
import { sectionsForPdf } from "@/utils/sectionCompletion";

const ID_MISSION_SECTION_KEY = "idMission";

const SECTION_COMPONENTS = {
  [SECTION_TITLES.COMPANY_INFORMATION]: CompanyInformationPdf,
  [SECTION_TITLES.BENEFICIAL]: CompanyOwnersPdf,
  [SECTION_TITLES.BANK_ACCOUNT_INFO]: BankInfoPdf,
  [SECTION_TITLES.AVG_TRANSACTIONS]: ProcessingInfoPdf,
  [SECTION_TITLES.INCORPORATION_ARTICLE]: DocumentsPdf,
  [SECTION_TITLES.CUSTOM_SECTION]: CustomSectionPdf,
  [SECTION_TITLES.AGREEMENT]: AggrementBlockPdf,
};

const HEADER_DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

export const ApplicationPdfViewCommonProps = ({
  userId,
  pdfId,
  pdfToken = null,
  isPdf = false,
  className = "",
  isEditAble = false,
  isDownloadAble = false,
  initialSubmitData = null,
  submittedFormId: submittedFormIdProp = null,
}) => {
  const dispatch = useDispatch();
  const { logo, appLogoMaxWidth, appLogoMaxHeight } = useBranding();
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const usesPrefilledData = initialSubmitData != null && typeof initialSubmitData === "object";
  const [submittedFormId, setSubmittedFormId] = useState(submittedFormIdProp);
  const [formInnerData, setFormInnerData] = useState(() => (usesPrefilledData ? initialSubmitData : {}));
  const [dataLoaded, setDataLoaded] = useState(usesPrefilledData);
  const [isUpdatingSubmittedForm, setIsUpdatingSubmittedForm] = useState(false);
  const [updateSubmittedForm] = useUpdateSubmittedFormMutation();
  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery(
    { _id: pdfId },
    { skip: !pdfId },
  );
  const [getSavedFormData, { isLoading: getSavedFormDataLoading }] = useGetSavedFormByUserIdMutation();
  const [generatePdfForm, { isLoading: isGeneratingPdf }] = useGeneratePdfFormMutation();

  const handleUpdateSubmittedForm = async () => {
    setIsUpdatingSubmittedForm(true);
    try {
      const updatedFormData = {};
      for (const key of Object.keys(formInnerData)) {
        updatedFormData[key] = await uploadFilesAndReplace(formInnerData[key]);
      }
      const res = await updateSubmittedForm({ submittedFormId: submittedFormId, formData: updatedFormData }).unwrap();
      if (res.success) {
        dispatch(updateIsDisabledAllFields(true));
        dispatch(addSavedFormData(updatedFormData));
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Update submitted form error:", error);
      toast.error(error?.data?.message || "Failed to save the application");
    } finally {
      setIsUpdatingSubmittedForm(false);
    }
  };

  const handleDownload = async (formId, applicantId) => {
    try {
      const blob = await generatePdfForm({ _id: formId, userId: applicantId }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download PDF error:", error);
    }
  };

  // version history seeds from an immutable snapshot, no fetch
  useEffect(() => {
    if (!usesPrefilledData) return;
    setFormInnerData(initialSubmitData);
    if (submittedFormIdProp) setSubmittedFormId(submittedFormIdProp);
    setDataLoaded(true);
  }, [initialSubmitData, submittedFormIdProp, usesPrefilledData]);

  // fetch the latest submit data by applicant user id
  useEffect(() => {
    if (usesPrefilledData || !userId || !pdfId) return;

    const fetchSavedFormData = async () => {
      try {
        const res = await getSavedFormData({ formId: pdfId, userId, pdfToken }).unwrap();
        if (res.success) {
          const submitData = res?.data?.submitData ?? {};
          setFormInnerData(submitData);
          dispatch(addSavedFormData(submitData));
          setSubmittedFormId(res?.data?._id);
        }
      } catch (error) {
        console.error("Fetch saved form error:", error);
      } finally {
        setDataLoaded(true);
      }
    };
    setDataLoaded(false);
    fetchSavedFormData();
  }, [dispatch, getSavedFormData, pdfId, pdfToken, userId, usesPrefilledData]);

  useEffect(() => {
    return () => {
      dispatch(updateIsDisabledAllFields(true));
    };
  }, [dispatch]);

  const isLoading = !form || formLoading || (!dataLoaded && getSavedFormDataLoading);
  if (isLoading) return <CustomLoading />;

  return (
    <>
      {isPdf && (
        <div className="flex min-h-16 items-center justify-between rounded-md border-b bg-white px-6 shadow">
          <div className="my-4 flex items-center gap-8">
            <BrandLogo logo={logo} maxWidth={appLogoMaxWidth} maxHeight={appLogoMaxHeight} />
            <h1 className="text-2xl font-semibold text-gray-800">{form?.data?.name}</h1>
          </div>
          <div className="my-4 flex items-center gap-8">
            <h3 className="text-sm text-gray-800">{new Date().toLocaleString("en-US", HEADER_DATE_OPTIONS)}</h3>
          </div>
        </div>
      )}

      <div className={`h-full w-full space-y-12 overflow-visible bg-white px-6 py-8 ${className}`}>
        {isEditAble && isDisabledAllFields && (
          <div className="flex justify-end">
            <Button label="Edit" variant="secondary" onClick={() => dispatch(updateIsDisabledAllFields(false))} />
          </div>
        )}
        {isEditAble && !isDisabledAllFields && (
          <div className="flex justify-end">
            <Button
              disabled={isUpdatingSubmittedForm}
              rightIcon={isUpdatingSubmittedForm && CgSpinner}
              cnRight={isUpdatingSubmittedForm ? "animate-spin h-5 w-5" : ""}
              label="Save"
              onClick={handleUpdateSubmittedForm}
            />
          </div>
        )}
        {isDownloadAble && (
          <div className="flex justify-end">
            <Button
              label="Download Pdf"
              variant="secondary"
              onClick={() => handleDownload(pdfId, userId)}
              disabled={isGeneratingPdf}
              rightIcon={isGeneratingPdf && CgSpinner}
              cnRight={isGeneratingPdf ? "animate-spin h-5 w-5" : ""}
            />
          </div>
        )}
        <IdMissionDataPdf
          formId={pdfId}
          sectionKey={ID_MISSION_SECTION_KEY}
          formInnerData={formInnerData}
          setFormInnerData={setFormInnerData}
        />
        {sectionsForPdf(form?.data?.sections, formInnerData).map((section, index) => {
          const SectionComponent = SECTION_COMPONENTS[section.title];
          if (!SectionComponent) return null;
          return (
            <SectionComponent
              key={index}
              _id={section._id}
              name={section.name}
              sectionKey={section?.key}
              formInnerData={formInnerData}
              setFormInnerData={setFormInnerData}
              title={section.title}
              fields={section?.fields ?? []}
              blocks={section?.blocks ?? []}
              isSignature={section?.isSignature}
              reduxData={formInnerData?.[section?.key]}
              formLoading={formLoading}
              formRefetch={formRefetch}
              step={section}
            />
          );
        })}
      </div>
    </>
  );
};

const ApplicationPdfView = () => {
  const { pdfId, userId } = useParams();
  const [searchParams] = useSearchParams();
  useApplyBranding({ formId: pdfId });
  return (
    <ApplicationPdfViewCommonProps userId={userId} pdfId={pdfId} pdfToken={searchParams.get("pdfToken")} isPdf={true} />
  );
};

export default ApplicationPdfView;
