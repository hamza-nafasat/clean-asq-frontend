import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

// Components

// Hooks & Redux
import AggrementBlockPdf from "@/components/applicationVerification/ApplicationPdfForm/AgreementBlockPdf";
import BankInfoPdf from "@/components/applicationVerification/ApplicationPdfForm/BankInfoPdf";
import CompanyInformationPdf from "@/components/applicationVerification/ApplicationPdfForm/CompanyInformationPdf";
import CompanyOwnersPdf from "@/components/applicationVerification/ApplicationPdfForm/CompanyOwnersPdf";
import CustomSectionPdf from "@/components/applicationVerification/ApplicationPdfForm/CustomSectionPdf";
import DocumentsPdf from "@/components/applicationVerification/ApplicationPdfForm/DocumentsPdf";
import ProcessingInfoPdf from "@/components/applicationVerification/ApplicationPdfForm/ProcessingInfoPdf";
import Button from "@/components/shared/small/Button";
import { useBranding } from "@/hooks/BrandingContext";
import useApplyBranding from "@/hooks/useApplyBranding";
import {
  useGeneratePdfFormMutation,
  useGetSavedFormByUserIdMutation,
  useGetSingleFormQueryQuery,
  useUpdateSubmittedFormMutation,
} from "@/redux/apis/formApis";
import { addSavedFormData, updateIsDisabledAllFields } from "@/redux/slices/formSlice";
import IdMissionDataPdf from "./IdMissionDataPdf";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { uploadFilesAndReplace } from "@/lib/utils";
import CustomLoading from "@/components/shared/small/CustomLoading";

const ApplicationPdfView = () => {
  const { pdfId, userId } = useParams();
  useApplyBranding({ formId: pdfId });
  return <ApplicationPdfViewCommonProps userId={userId} pdfId={pdfId} isPdf={true} />;
};

export const ApplicationPdfViewCommonProps = ({
  userId,
  pdfId,
  isPdf = false,
  className = "",
  isEditAble = false,
  isDownloadAble = false,
  initialSubmitData = null,
  submittedFormId: submittedFormIdProp = null,
}) => {
  const dispatch = useDispatch();
  const { logo } = useBranding();
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const usesPrefilledData = initialSubmitData != null && typeof initialSubmitData === "object";
  const [submittedFormId, setSubmittedFormId] = useState(submittedFormIdProp);
  const [formInnerData, setFormInnerData] = useState(() => (usesPrefilledData ? initialSubmitData : {}));
  const [dataLoaded, setDataLoaded] = useState(usesPrefilledData);
  const [updateSubmittedForm] = useUpdateSubmittedFormMutation();
  const {
    data: form,
    isLoading: formLoading,
    refetch: formRefetch,
  } = useGetSingleFormQueryQuery({ _id: pdfId }, { skip: !pdfId });
  const [getSavedFormData, { isLoading: getSavedFormDataLoading }] = useGetSavedFormByUserIdMutation();
  const [generatePdfForm, { isLoading: isGeneratingPdf }] = useGeneratePdfFormMutation();
  const [isUpdatingSubmittedForm, setIsUpdatingSubmittedForm] = useState(false);

  const updateSubmittedFormData = async () => {
    setIsUpdatingSubmittedForm(true);
    try {
      const formInnerDataKeys = Object.keys(formInnerData);
      const updatedFormData = {};
      for (const key of formInnerDataKeys) {
        updatedFormData[key] = await uploadFilesAndReplace(formInnerData[key]);
      }
      const res = await updateSubmittedForm({ submittedFormId: submittedFormId, formData: updatedFormData }).unwrap();
      if (res.success) {
        dispatch(updateIsDisabledAllFields(true));
        dispatch(addSavedFormData(updatedFormData));
        toast.success(res.message);
      }
    } catch (error) {
      console.log("Error updating submitted form data", error);
    } finally {
      setIsUpdatingSubmittedForm(false);
    }
  };

  const handleDownload = async (formId, userId) => {
    try {
      const blob = await generatePdfForm({ _id: formId, userId }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("PDF download failed", err);
    }
  };

  // Version-history modal: seed from immutable snapshot — no API fetch.
  useEffect(() => {
    if (!usesPrefilledData) return;
    setFormInnerData(initialSubmitData);
    if (submittedFormIdProp) setSubmittedFormId(submittedFormIdProp);
    setDataLoaded(true);
  }, [initialSubmitData, submittedFormIdProp, usesPrefilledData]);

  // Applications / App Viewer: fetch latest submit data by applicant userId.
  useEffect(() => {
    if (usesPrefilledData || !userId || !pdfId) return;

    const fetchSavedFormData = async () => {
      try {
        const res = await getSavedFormData({ formId: pdfId, userId }).unwrap();
        if (res.success) {
          const submitData = res?.data?.submitData ?? {};
          setFormInnerData(submitData);
          dispatch(addSavedFormData(submitData));
          setSubmittedFormId(res?.data?._id);
        }
      } catch (error) {
        console.log("Error fetching saved form data", error);
      } finally {
        setDataLoaded(true);
      }
    };
    setDataLoaded(false);
    fetchSavedFormData();
  }, [dispatch, getSavedFormData, pdfId, userId, usesPrefilledData]);

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
        <div className="flex h-16 items-center justify-between rounded-md border-b bg-white px-6 shadow">
          {/* Hamburger Icon (mobile only) */}
          <div className="my-4 flex items-center gap-8">
            <img
              src={logo || ""}
              alt="Logo"
              className={`object-contain ${"h-15 w-15"} }`}
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-semibold text-gray-800">{form?.data?.name}</h1>
          </div>
          <div className="my-4 flex items-center gap-8">
            {/* current time and date in good formate  */}
            <h3 className="text-sm text-gray-800">
              {new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </h3>
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
              onClick={updateSubmittedFormData}
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
          sectionKey="idMission"
          formInnerData={formInnerData}
          setFormInnerData={setFormInnerData}
        />
        {form?.data?.sections?.map((section, index) => {
          const sectionData = formInnerData?.[section?.key];

          const commonProps = {
            _id: section._id,
            name: section.name,
            sectionKey: section?.key,
            formInnerData: formInnerData,
            setFormInnerData: setFormInnerData,
            title: section.title,
            fields: section?.fields ?? [],
            blocks: section?.blocks ?? [],
            isSignature: section?.isSignature,
            reduxData: sectionData,
            formLoading,
            formRefetch,
            step: section,
          };

          switch (section.title) {
            case "company_information_blk":
              return <CompanyInformationPdf key={index} {...commonProps} />;
            case "beneficial_blk":
              return <CompanyOwnersPdf key={index} {...commonProps} />;
            case "bank_account_info_blk":
              return <BankInfoPdf key={index} {...commonProps} />;
            case "avg_transactions_blk":
              return <ProcessingInfoPdf key={index} {...commonProps} />;
            case "incorporation_article_blk":
              return <DocumentsPdf key={index} {...commonProps} />;
            case "custom_section":
              return <CustomSectionPdf key={index} {...commonProps} />;
            case "agreement_blk":
              return <AggrementBlockPdf key={index} {...commonProps} />;
            default:
              return null;
          }
        })}
      </div>
    </>
  );
};

export default ApplicationPdfView;
