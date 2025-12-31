import { useBranding } from '@/hooks/BrandingContext';
import { FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/small/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addSavedFormData, updateEmailVerified } from '@/redux/slices/formSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useGeneratePdfFormMutation, useGetSavedFormMutation } from '@/redux/apis/formApis';
import { CgSpinner } from 'react-icons/cg';

function Submission({ forms }) {
  const dispatch = useDispatch();
  const { emailVerified } = useSelector(state => state.form);
  const navigate = useNavigate();
  const { logo } = useBranding();
  const { user } = useSelector(state => state.auth);
  const [getSavedFormData] = useGetSavedFormMutation();
  const [generatePdfForm, { isLoading }] = useGeneratePdfFormMutation();

  const handleDownload = async (formId, userId) => {
    try {
      const blob = await generatePdfForm({ _id: formId, userId }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${formId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log('PDF download failed', err);
    }
  };

  const getSavedData = async (formId, brandingName) => {
    try {
      if (!emailVerified) dispatch(updateEmailVerified(true));
      const res = await getSavedFormData({ formId: formId }).unwrap();
      if (res.success) {
        const savedData = res?.data?.savedData || [];
        const action = await dispatch(addSavedFormData(savedData || []));
        unwrapResult(action);
        if (!savedData?.company_lookup_data) {
          console.log('saved data is ,', savedData);
          return navigate(`/verification?formid=${formId}`);
        } else {
          return navigate(`/application-form/${brandingName}/${formId}`);
        }
      } else {
        return navigate(`/verification?formid=${formId}`);
      }
    } catch (error) {
      console.log('error while getting saved data', error);
      return navigate(`/verification?formid=${formId}`);
    }
  };
  return (
    <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {forms?.length > 0 ? (
        forms?.map((form, index) => {
          const colors = form?.branding?.colors;
          return (
            <div
              key={index}
              className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
            >
              <img
                src={form?.branding?.selectedLogo || logo}
                width={100}
                height={100}
                alt="logo"
                referrerPolicy="no-referrer"
              />

              {/* Menu icon */}
              <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
              <div className="flex items-start gap-2 md:gap-4">
                {/* <CardIcon /> */}
                {/* <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base leading-tight font-bold break-words text-gray-700 sm:text-lg md:text-2xl">
                      {form?.name}
                    </h2>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div>
                </div> */}
              </div>
              {/* <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>{form?.sections?.length} form sections</span>
                </div>{' '}
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>AI-assisted completion available</span>
                </div>
              </div> */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-gray-500">Applicants: {form?.sections?.length}</span>
                <span className="text-gray-500">
                  Created:{' '}
                  {new Date(form?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="mt-3 flex h-full w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
                <Button
                  label="Start Application"
                  onClick={() => getSavedData(form?._id, form?.branding?.name)}
                  className="self-end"
                  style={{
                    backgroundColor: colors?.primary,
                    borderColor: colors?.primary,
                    color: colors?.buttonTextPrimary,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                  }}
                />
                <Button
                  label="Download PDF"
                  icon={isLoading && CgSpinner}
                  cnLeft={`animate-spin h-5 w-5`}
                  disabled={isLoading}
                  onClick={() => handleDownload(form?._id, user?._id)}
                  className={`${isLoading ? 'cursor-not-allowed opacity-30' : ''}`}
                  style={{
                    backgroundColor: colors?.primary,
                    borderColor: colors?.primary,
                    color: colors?.buttonTextPrimary,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                  }}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full flex items-center justify-center">No submissions found</div>
      )}
    </div>
  );
}

export default Submission;
