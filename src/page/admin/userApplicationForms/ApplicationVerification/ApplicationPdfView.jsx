import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';

// Components
import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import AggrementBlock from '@/components/applicationVerification/AggrementBlock';
import CustomLoading from '@/components/shared/small/CustomLoading';

// Hooks & Redux
import useApplyBranding from '@/hooks/useApplyBranding';
import {
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useSubmitFormMutation,
} from '@/redux/apis/formApis';
import { addSavedFormData, updateFormState } from '@/redux/slices/formSlice';
import { setIdMissionData } from '@/redux/slices/authSlice';
import CompanyInformationPdf from '@/components/applicationVerification/ApplicationPdfForm/CompanyInformationPdf';
import CompanyOwnersPdf from '@/components/applicationVerification/ApplicationPdfForm/CompanyOwnersPdf';
import BankInfoPdf from '@/components/applicationVerification/ApplicationPdfForm/BankInfoPdf';
import ProcessingInfoPdf from '@/components/applicationVerification/ApplicationPdfForm/ProcessingInfoPdf';
import DocumentsPdf from '@/components/applicationVerification/ApplicationPdfForm/DocumentsPdf';
import CustomSectionPdf from '@/components/applicationVerification/ApplicationPdfForm/CustomSectionPdf';
import AggrementBlockPdf from '@/components/applicationVerification/ApplicationPdfForm/AgreementBlockPdf';

const ApplicationPdfView = () => {
  const { user } = useSelector(state => state.auth);
  const { formData } = useSelector(state => state.form);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pdfId } = useParams();
  console.log('pdfId', pdfId);
  const formId = pdfId;
  const [isSavedApiRun, setIsSavedApiRun] = useState(false);

  // Queries & Mutations
  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });

  const [formSubmit] = useSubmitFormMutation();
  const [getSavedFormData] = useGetSavedFormMutation();
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const { isApplied } = useApplyBranding({ formId });

  // Save progress (draft)
  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        const formDataInRedux = { ...formData, [name]: data };
        const res = await saveFormInDraft({
          formId: form?.data?._id,
          formData: formDataInRedux,
        }).unwrap();
        if (res.success) toast.success(res.message);
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [form?.data?._id, formData, saveFormInDraft]
  );

  // Final form submit
  const handleSubmit = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        const res = await formSubmit({
          formId: form?.data?._id,
          formData: { ...formData, [name]: data },
        }).unwrap();
        if (res.success) {
          toast.success(res.message);
          navigate('/submited-successfully/' + form?.data?._id);
        }
      } catch (error) {
        console.log('error submitting form', error);
        toast.error(error?.data?.message || 'Error while submitting form');
      } finally {
        setLoadingNext(false);
      }
    },
    [form?.data?._id, formData, formSubmit, navigate]
  );

  // Auto-save while editing
  const handleAutoSave = useCallback(
    async ({ data, name }) => {
      try {
        const updatedData = { ...formData, [name]: data };
        const res = await saveFormInDraft({
          formId: form?.data?._id,
          formData: updatedData,
        }).unwrap();
        if (res.success) {
          const action = await dispatch(updateFormState({ data, name }));
          unwrapResult(action);
        }
      } catch (error) {
        console.log('Error auto-saving form', error);
      }
    },
    [dispatch, form?.data?._id, formData, saveFormInDraft]
  );

  // Load saved form data if exists
  useEffect(() => {
    if (form?.data?.sections?.length > 0) {
      getSavedFormData({ formId: form?.data?._id })
        .then(res => {
          const data = res?.data?.data?.savedData;
          dispatch(setIdMissionData(data?.idMission));
          if (data) dispatch(addSavedFormData(data));
        })
        .finally(() => setIsSavedApiRun(true));
    }
  }, [dispatch, form, getSavedFormData]);

  //   if (!isApplied || !form?.data?._id) return <CustomLoading />;
  if (!user?._id) return navigate(`/application-form/${formId}`);

  return (
    <div className="h-full w-full space-y-12 overflow-y-auto rounded-[10px] bg-white px-6 py-8">
      {form?.data?.sections?.map((section, index) => {
        const sectionDataFromRedux = formData?.[section?.title];
        const commonProps = {
          _id: section._id,
          name: section.name,
          title: section.title,
          fields: section?.fields ?? [],
          blocks: section?.blocks ?? [],
          isSignature: section?.isSignature,
          reduxData: sectionDataFromRedux,
          formLoading,
          formRefetch,
          saveInProgress,
          handleSubmit,
          step: section,
          handleAutoSave,
        };

        switch (section.title) {
          case 'company_information_blk':
            return <CompanyInformationPdf key={index} {...commonProps} />;
          case 'beneficial_blk':
            return <CompanyOwnersPdf key={index} {...commonProps} />;
          case 'bank_account_info_blk':
            return <BankInfoPdf key={index} {...commonProps} />;
          case 'avg_transactions_blk':
            return <ProcessingInfoPdf key={index} {...commonProps} />;
          case 'incorporation_article_blk':
            return <DocumentsPdf key={index} {...commonProps} />;
          case 'custom_section':
            return <CustomSectionPdf key={index} {...commonProps} />;
          case 'aggrement_blk':
            return <AggrementBlockPdf key={index} {...commonProps} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ApplicationPdfView;
