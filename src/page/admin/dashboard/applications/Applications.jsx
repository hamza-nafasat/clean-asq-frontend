import React, { useState, useCallback } from 'react';
import ApplicantsTable from '@/components/admin/ApplicantsTable';
import { CLIENT_TYPES } from '@/components/admin/ApplicantSearch';
import Modal from '@/components/shared/Modal';
import { APPLICANT_STATUS } from '@/data/constants';
// import Modal from '@/components/admin/shared/Modal';

// Initial mock data
const INITIAL_APPLICANTS = [
  {
    id: 1,
    name: 'John Doe',
    application: 'Software Developer',
    email: 'john@example.com',
    dateCreated: '2024-03-15',
    status: APPLICANT_STATUS.PENDING,
    clientType: CLIENT_TYPES.APPLICANT,
  },
  {
    id: 2,
    name: 'Jane Smith',
    application: 'Project Manager',
    email: 'jane@example.com',
    dateCreated: '2024-03-14',
    status: APPLICANT_STATUS.REVIEWING,
    clientType: CLIENT_TYPES.CLIENT,
  },
  {
    id: 3,
    name: 'Michael Johnson',
    application: 'UI/UX Designer',
    email: 'michael@example.com',
    dateCreated: '2024-03-13',
    status: APPLICANT_STATUS.APPROVED,
    clientType: CLIENT_TYPES.CLIENT_MEMBER,
  },
  {
    id: 4,
    name: 'Sarah Williams',
    application: 'Data Analyst',
    email: 'sarah@example.com',
    dateCreated: '2024-03-12',
    status: APPLICANT_STATUS.REJECTED,
    clientType: CLIENT_TYPES.TEAM_MEMBER,
  },
  {
    id: 5,
    name: 'David Brown',
    application: 'DevOps Engineer',
    email: 'david@example.com',
    dateCreated: '2024-03-11',
    status: APPLICANT_STATUS.PENDING,
    clientType: CLIENT_TYPES.SUPER_BANK,
  },
  {
    id: 6,
    name: 'Emily Davis',
    application: 'Product Manager',
    email: 'emily@example.com',
    dateCreated: '2024-03-10',
    status: APPLICANT_STATUS.REVIEWING,
    clientType: CLIENT_TYPES.APPLICANT,
  },
  {
    id: 7,
    name: 'Robert Wilson',
    application: 'Backend Developer',
    email: 'robert@example.com',
    dateCreated: '2024-03-09',
    status: APPLICANT_STATUS.APPROVED,
    clientType: CLIENT_TYPES.CLIENT,
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    application: 'Frontend Developer',
    email: 'lisa@example.com',
    dateCreated: '2024-03-08',
    status: APPLICANT_STATUS.REJECTED,
    clientType: CLIENT_TYPES.CLIENT_MEMBER,
  },
  {
    id: 9,
    name: 'James Taylor',
    application: 'Full Stack Developer',
    email: 'james@example.com',
    dateCreated: '2024-03-07',
    status: APPLICANT_STATUS.PENDING,
    clientType: CLIENT_TYPES.TEAM_MEMBER,
  },
  {
    id: 10,
    name: 'Emma Martinez',
    application: 'QA Engineer',
    email: 'emma@example.com',
    dateCreated: '2024-03-06',
    status: APPLICANT_STATUS.REVIEWING,
    clientType: CLIENT_TYPES.SUPER_BANK,
  },
];

function Applications() {
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
  });

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

  return (
    <div className="h-full bg-white p-4">
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
              <p className="mt-1">{selectedApplicant.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Application</label>
              <p className="mt-1">{selectedApplicant.application}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">{selectedApplicant.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Type</label>
              <p className="mt-1">{CLIENT_TYPES[selectedApplicant.clientType]}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Created</label>
              <p className="mt-1">{selectedApplicant.dateCreated}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">{selectedApplicant.status}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Applications;

// - List of applicants, include filters (date range, filter by client, status), Table fields (Name, Application, Email, Date Created, Status, Action (view, delete)).
