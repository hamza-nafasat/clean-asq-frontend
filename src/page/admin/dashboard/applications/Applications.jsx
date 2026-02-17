import ApplicantsTable from '@/components/admin/ApplicantsTable';
import Button from '@/components/shared/small/Button';
import CustomizableSelect from '@/components/shared/small/CustomizeableSelect';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import {
  useGetAllSubmitFormsQuery,
  useGetSingleFormQueryQuery,
  useGetSubmittedFormUsersQuery,
  useGiveSpecialAccessToUserMutation,
} from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ApplicationPdfViewCommonProps } from '../../userApplicationForms/ApplicationVerification/ApplicationPdfView';
// import Modal from '@/components/admin/shared/Modal';

function Applications() {
  const { data, isLoading: isLoadingForm } = useGetAllSubmitFormsQuery();


  const [applicants, setApplicants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSpecialAccess, setOpenSpecialAccess] = useState(false);
  const [selectedIdForSpecialAccessModal, setSelectedIdForSpecialAccessModal] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
  });
  const handleViewApplicant = useCallback(
    row => {
      setPdfData(row);
      setIsModalOpen(true);
    },
    []
  );
  const handleDeleteApplicant = useCallback(async id => {
    setIsLoading(true);
    try {
      setApplicants(prev => prev.filter(applicant => applicant.id !== id));
    } catch (error) {
      console.error('Error deleting applicant:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if (!isLoadingForm && data?.data) {
      setApplicants(data?.data);
    }
  }, [data, isLoadingForm]);

  return (
    <>
      {openSpecialAccess && (
        <Modal onClose={() => setOpenSpecialAccess(false)}>
          <SpecialAccessModal formId={selectedFormId} submittedFormId={selectedIdForSpecialAccessModal} setModal={setOpenSpecialAccess} />
        </Modal>
      )}

      <div className="bg-backgroundColor rounded-t-md p-4">
        <div className="mb-4">
          <h2 className="text-textPrimary mb-4 text-xl font-semibold">Applicants</h2>

          <ApplicantsTable
            setSelectedIdForSpecialAccessModal={setSelectedIdForSpecialAccessModal}
            setSelectedFormId={setSelectedFormId}
            setOpenSpecialAccess={setOpenSpecialAccess}
            applicants={applicants}
            isLoading={isLoading}
            onView={handleViewApplicant}
            onDelete={handleDeleteApplicant}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* View Applicant Modal */}
        {isModalOpen && (pdfData?.form?._id || pdfData?.form) && (
          <Modal
            width={'min-w-[80vw] max-w-2xl'}
            onClose={() => {
              setIsModalOpen(false);
              setPdfData(null);
            }}
            isLoading={isLoading}
          >
            <ApplicationPdfViewCommonProps userId={pdfData?.user?._id || pdfData?.user} pdfId={pdfData?.form?._id || pdfData?.form} className="rounded-lg!" isPdf={true} isDownloadAble={true} />
          </Modal>
        )}
      </div>
    </>
  );
}

export default Applications;

// - List of applicants, include filters (date range, filter by client, status), Table fields (Name, Application, Email, Date Created, Status, Action (view, delete)).

export const SpecialAccessModal = ({ formId, setModal, submittedFormId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: submittedFormUsers } = useGetSubmittedFormUsersQuery({ formId: formId });
  const [giveSpecialAccessToUser, { isLoading: isGivingSpecialAccess }] = useGiveSpecialAccessToUserMutation();
  const { data: formData } = useGetSingleFormQueryQuery({ _id: formId });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [specialSections, setSpecialSections] = useState([]);


  const [form, setForm] = useState({
    email: '',
    sectionKey: '',
  });

  const giveSpecialAccessToUserHandler = async () => {
    try {
      if (!form?.email || !form?.sectionKey) return toast.error('Please select a user and section');
      if (!submittedFormId) return toast.error('Form ID is required');
      const res = await giveSpecialAccessToUser({
        formId: formId,
        submittedFormId: submittedFormId,
        email: form?.email,
        sectionKey: form?.sectionKey,
      }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || 'Form forwarded successfully');
        setModal(false);
        setSelectedUsers([]);
        setSpecialSections([]);
        setForm({ userId: '', sectionKey: '' });
      }
    } catch (error) {
      console.error('Error forwarding a form to user:', error);
      toast.error(error?.data?.message || 'Failed to forward a form to user');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (formData?.data?.sections?.length > 0) {
      const specialSections = formData?.data?.sections?.filter(section => section?.isHidden && section?.key !== 'beneficial_owners');
      const formatedSpecialSections = specialSections?.map(section => ({
        option: section?.name,
        value: section?.key,
      }));
      setSpecialSections(formatedSpecialSections);
    }
    if (submittedFormUsers?.data?.length > 0) {
      const users = [];
      submittedFormUsers?.data?.forEach(submitForm => {
        users.push({
          option: `${submitForm?.user?.firstName} ${submitForm?.user?.middleName ? ' ' : ''} ${submitForm?.user?.lastName}`,
          value: submitForm?.user?.email,
        });
      });
      setSelectedUsers(users);
    }
    setIsLoading(false);
  }, [formData?.data?.sections, submittedFormUsers?.data]);





  if (isLoading) {
    return <CustomLoading />;
  }
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Forward a form </h3>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={selectedUsers}
            value={form?.email}
            onSelect={value => setForm(prev => ({ ...prev, email: value }))}
            label={'Select User'}
            defaultText="Select User"
          />
          <span className='text-sm text-gray-500'>or type email manually</span>
          <TextField
            name='email'
            placeholder='Enter email'
            value={form?.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={specialSections}
            onSelect={value => setForm(prev => ({ ...prev, sectionKey: value }))}
            label={'Select Section'}
            defaultText="Select Section"
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
