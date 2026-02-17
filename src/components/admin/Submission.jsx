import { useBranding } from '@/hooks/BrandingContext';
import { useApplicantGiveSpecialAccessToBeneficialOwnerMutation, useGeneratePdfFormMutation, useGetSavedFormMutation } from '@/redux/apis/formApis';
import { addSavedFormData, updateEmailVerified } from '@/redux/slices/formSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { CiMenuKebab } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../shared/small/Button';
import CustomizableSelect from '../shared/small/CustomizeableSelect';
import Modal from '../shared/small/Modal';
import TextField from '../shared/small/TextField';

function Submission({ forms }) {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openSpecialAccessModal, setOpenSpecialAccessModal] = useState(false);
  const [allBeneficials, setAllBeneficials] = useState([]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);
  return (
    <>
      {openSpecialAccessModal && (
        <Modal title="Forward Beneficial" onClose={() => setOpenSpecialAccessModal(false)}>
          <SpecialAccessModal allBeneficials={allBeneficials} formId={selectedForm} setModal={setOpenSpecialAccessModal} />
        </Modal>
      )}
      <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {forms?.length > 0 ? (
          forms?.map((form, index) => {
            const colors = form?.branding?.colors;
            const totalBeneficialOwners = form?.submitData?.beneficial_information?.additional_owner?.filter((item) => item?.email);
            const filledBeneficialOwners = totalBeneficialOwners?.filter((item) => item?.IsCompleted);
            return (
              <div
                key={index}
                className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
              >
                {/* add three dot in right corner  */}
                <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4 menu-container" onClick={() => {
                  setIsMenuOpen(!isMenuOpen)
                  setSelectedForm(form?._id)
                }}>{<CiMenuKebab />}</div>

                {isMenuOpen && selectedForm === form?._id && (
                  <div className="absolute top-10 right-0 w-50 rounded border space-y-2 bg-white shadow-lg p-2">

                    <Button label="Forward Beneficial" variant='icon' className='text-sm w-full p-2' onClick={() => {
                      setOpenSpecialAccessModal(true)
                      const beneficialMailsAndNames = totalBeneficialOwners?.map((item) => ({ value: item?.email, option: `${item?.name}` }));
                      setAllBeneficials(beneficialMailsAndNames);
                    }} />
                  </div>
                )}

                <img
                  src={form?.branding?.selectedLogo || logo}
                  width={100}
                  height={100}
                  alt="logo"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">Application Name: {form?.name}</span>
                  <span className="text-gray-500">Sections: {form?.sections?.length}</span>
                  <span className="text-gray-500">
                    Created:{' '}
                    {new Date(form?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">Total Beneficial owners: {totalBeneficialOwners?.length}</span>
                  <span className="text-gray-500">
                    Filled Beneficial owners:{' '}
                    {filledBeneficialOwners?.length}
                  </span>
                </div>
                <div className="mt-3 flex h-full w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
                  <Button
                    label="Update Submission"
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
      </div></>
  );
}

export default Submission;



const SpecialAccessModal = ({ allBeneficials, formId, setModal }) => {
  const [giveSpecialAccessToUser, { isLoading: isGivingSpecialAccess }] = useApplicantGiveSpecialAccessToBeneficialOwnerMutation();
  const [form, setForm] = useState({
    email: '',
  });

  const giveSpecialAccessToUserHandler = async () => {
    try {
      if (!form?.email) return toast.error('selection or email is required');
      if (!formId) return toast.error('Form ID is required');
      const res = await giveSpecialAccessToUser({
        formId: formId,
        email: form?.email,
      }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || 'Special access sent successfully');
        setForm({ email: '' });
        setModal(false);
      }
    } catch (error) {
      console.error('Error giving special access to user:', error);
      toast.error(error?.data?.message || 'Failed to forwarding a form to user');
    }
  };




  return (
    <div className="flex items-center justify-center p-4 ">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Forward a form to Beneficial Owners</h3>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={allBeneficials}
            onSelect={value => setForm(prev => ({ ...prev, email: value }))}
            label={'Select User'}
            defaultText="Select Beneficial Owner"
          />
        </div>


        <div className="flex flex-col gap-2">
          <span className='text-sm text-gray-500'>or type email manually</span>
          <TextField
            name='email'
            placeholder='Enter email'
            value={form?.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>


        {/* Action Buttons */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button
            disabled={isGivingSpecialAccess}
            label="Send Access"
            variant="primary"
            className={`${isGivingSpecialAccess ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={giveSpecialAccessToUserHandler}
          />
        </div>
      </div>
    </div>
  );
};