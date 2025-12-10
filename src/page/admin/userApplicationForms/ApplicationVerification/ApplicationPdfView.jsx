import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Components

// Hooks & Redux
import AggrementBlockPdf from '@/components/applicationVerification/ApplicationPdfForm/AgreementBlockPdf';
import BankInfoPdf from '@/components/applicationVerification/ApplicationPdfForm/BankInfoPdf';
import CompanyInformationPdf from '@/components/applicationVerification/ApplicationPdfForm/CompanyInformationPdf';
import CompanyOwnersPdf from '@/components/applicationVerification/ApplicationPdfForm/CompanyOwnersPdf';
import CustomSectionPdf from '@/components/applicationVerification/ApplicationPdfForm/CustomSectionPdf';
import DocumentsPdf from '@/components/applicationVerification/ApplicationPdfForm/DocumentsPdf';
import ProcessingInfoPdf from '@/components/applicationVerification/ApplicationPdfForm/ProcessingInfoPdf';
import useApplyBranding from '@/hooks/useApplyBranding';
import { useGetSavedFormByUserIdMutation, useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { addSavedFormData } from '@/redux/slices/formSlice';
import IdMissionDataPdf from './IdMissionDataPdf';
import { useBranding } from '@/hooks/BrandingContext';
import logoApply from '../../../../assets/images/logo.png';

const ApplicationPdfView = () => {
  const { pdfId, userId } = useParams();
  useApplyBranding({ formId: pdfId });
  const { logo } = useBranding();
  const { formData } = useSelector(state => state.form);
  const dispatch = useDispatch();
  // Queries & Mutations
  const {
    data: form,
    isLoading: formLoading,
    refetch: formRefetch,
  } = useGetSingleFormQueryQuery({ _id: pdfId }, { skip: !pdfId });
  const [getSavedFormData, { isLoading: getSavedFormDataLoading }] = useGetSavedFormByUserIdMutation();

  useEffect(() => {
    if (userId) {
      const fetchSavedFormData = async () => {
        try {
          if (!pdfId || !userId) return;
          const res = await getSavedFormData({ formId: pdfId, userId: userId }).unwrap();
          if (res.success) {
            dispatch(addSavedFormData(res?.data?.submitData));
          }
        } catch (error) {
          console.log('Error fetching saved form data', error);
        }
      };
      fetchSavedFormData();
    }
  }, [dispatch, pdfId, getSavedFormData, userId]);

  if (!form || getSavedFormDataLoading || formLoading) return;
  return (
    <>
      <div className="flex h-16 items-center justify-between rounded-md border-b bg-white px-6 shadow">
        {/* Hamburger Icon (mobile only) */}
        <div className="my-4 flex items-center gap-8">
          <img
            src={logo || logoApply}
            alt="Logo"
            className={`object-contain ${'h-[60px] w-[60px]'} }`}
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-semibold text-gray-800">{form?.data?.name}</h1>
        </div>
        <div className="my-4 flex items-center gap-8">
          {/* current time and date in good formate  */}
          <h3 className="text-sm text-gray-800">
            {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </h3>
        </div>
      </div>
      <div className="h-full w-full space-y-12 overflow-visible bg-white px-6 py-8">
        <IdMissionDataPdf formId={pdfId} />
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
            step: section,
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
            case 'agreement_blk':
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
