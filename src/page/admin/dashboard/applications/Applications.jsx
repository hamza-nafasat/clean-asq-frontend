import ApplicantsTable from '@/components/admin/ApplicantsTable';
import Modal from '@/components/shared/Modal';
import { useGetAllSubmitFormsQuery } from '@/redux/apis/formApis';
import { useCallback, useEffect, useState } from 'react';
// import Modal from '@/components/admin/shared/Modal';

function Applications() {
  const [applicants, setApplicants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
  });

  const { data, isLoading: isLoadingForm } = useGetAllSubmitFormsQuery();

  console.log('data is ', data);

  const handleViewApplicant = useCallback(
    id => {
      const applicant = applicants.find(app => app.id === id);
      setSelectedApplicant(applicant);
      setIsModalOpen(true);
    },
    [applicants]
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
    <div className="rounded-t-md bg-white p-4">
      <div className="mb-4">
        <h2 className="text-textPrimary mb-4 text-xl font-semibold">Applicants</h2>

        <ApplicantsTable
          applicants={applicants}
          isLoading={isLoading}
          onView={handleViewApplicant}
          onDelete={handleDeleteApplicant}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* View Applicant Modal */}
      {isModalOpen && selectedApplicant && (
        <Modal
          title="Applicant Details"
          onClose={() => {
            setIsModalOpen(false);
            setSelectedApplicant(null);
          }}
          onSave={() => setIsModalOpen(false)}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1">{selectedApplicant?.user?.firstName + ' ' + selectedApplicant?.user?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Application</label>
              <p className="mt-1">{selectedApplicant?.form?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">{selectedApplicant?.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Type</label>
              <p className="mt-1">{selectedApplicant?.user?.role?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Created</label>
              <p className="mt-1">{new Date(selectedApplicant?.createdAt)?.toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">{selectedApplicant?.status}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Applications;

// - List of applicants, include filters (date range, filter by client, status), Table fields (Name, Application, Email, Date Created, Status, Action (view, delete)).
