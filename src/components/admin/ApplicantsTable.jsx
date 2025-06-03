import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from 'react-data-table-component';
import { MoreVertical } from 'lucide-react';
import { tableStyles } from '@/data/data';
import ApplicantSearch, { CLIENT_TYPES, CLIENT_LABELS } from './ApplicantSearch';
import Modal from '../shared/Modal';

// Constants for applicant status
export const APPLICANT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Table columns configuration
const APPLICANT_TABLE_COLUMNS = [
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Application',
    selector: row => row.application,
    sortable: true,
  },
  {
    name: 'Email',
    selector: row => row.email,
    sortable: true,
  },
  {
    name: 'Client Type',
    selector: row => row.clientType,
    sortable: true,
    cell: row => (
      <span className="w-[130px] rounded-sm bg-gray-100 px-[10px] py-[3px] text-center text-xs font-bold text-gray-700 capitalize">
        {CLIENT_LABELS[row.clientType] || row.clientType}
      </span>
    ),
  },
  {
    name: 'Date Created',
    selector: row => row.dateCreated,
    sortable: true,
  },
  {
    name: 'Status',
    selector: row => row.status,
    sortable: true,
    cell: row => (
      <span
        className={`w-[100px] rounded-sm px-[10px] py-[3px] text-center font-bold capitalize ${
          row.status === APPLICANT_STATUS.APPROVED ? 'bg-[#34C7591A] text-[#34C759]' : ''
        } ${row.status === APPLICANT_STATUS.REJECTED ? 'bg-[#FF3B301A] text-[#FF3B30]' : ''} ${
          row.status === APPLICANT_STATUS.PENDING ? 'bg-yellow-100 text-yellow-800' : ''
        } ${row.status === APPLICANT_STATUS.REVIEWING ? 'bg-blue-100 text-blue-500' : ''}`}
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
  },
];

const ApplicantsTable = ({ applicants, isLoading, onView, onDelete, filters, onFilterChange }) => {
  const [actionMenu, setActionMenu] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editModalData, setEditModalData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const actionMenuRefs = useRef(new Map());

  // Get unique clients for quick filters
  const uniqueClients = useMemo(() => {
    return [...new Set(applicants.map(applicant => applicant.clientType))];
  }, [applicants]);

  // Handle search
  const handleSearch = useCallback(value => {
    setSearchTerm(value);
  }, []);

  // Handle click outside for action menu
  useEffect(() => {
    const handleClickOutside = event => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        ref => !ref.current?.contains(event.target)
      );

      if (clickedOutsideAllMenus) {
        setActionMenu(null);
      }
    };

    if (actionMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenu]);

  const handleDeleteApplicant = useCallback(
    id => {
      if (!window.confirm('Are you sure you want to delete this applicant?')) {
        return;
      }
      onDelete(id);
      setActionMenu(null);
    },
    [onDelete]
  );

  const handleEditApplicant = useCallback(async () => {
    // Basic validation
    const errors = {};
    if (!editModalData.name.trim()) errors.name = 'Name is required';
    if (!editModalData.email.trim()) errors.email = 'Email is required';
    if (!editModalData.application.trim()) errors.application = 'Application is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Here you would typically make an API call to update the applicant
    // For now, we'll just close the modal
    setEditModalData(null);
    setFormErrors({});
  }, [editModalData]);

  const renderFormField = useCallback((field, value, onChange, type = 'text', error = null, options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());

    if (type === 'select' && options) {
      return (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
          <select
            name={field}
            value={value}
            onChange={onChange}
            className={`focus:border-secondary focus:ring-secondary /20 w-full rounded-md border px-4 py-2 text-sm shadow-sm transition focus:ring ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select {labelText}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
        <input
          name={field}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${labelText}`}
          className={`focus:border-secondary focus:ring-secondary /20 w-full rounded-md border px-4 py-2 text-sm shadow-sm transition focus:ring ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesDateRange =
        (!filters.dateRange.start || applicant.dateCreated >= filters.dateRange.start) &&
        (!filters.dateRange.end || applicant.dateCreated <= filters.dateRange.end);
      const matchesStatus = !filters.status || applicant.status === filters.status;
      const matchesSearch = !searchTerm || applicant.clientType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesName = !filters.name || applicant.name.toLowerCase().includes(filters.name.toLowerCase());

      return matchesDateRange && matchesStatus && matchesSearch && matchesName;
    });
  }, [applicants, filters, searchTerm]);

  const columns = useMemo(
    () => [
      ...APPLICANT_TABLE_COLUMNS,
      {
        name: 'Action',
        cell: row => {
          if (!actionMenuRefs.current.has(row.id)) {
            actionMenuRefs.current.set(row.id, React.createRef());
          }
          const rowRef = actionMenuRefs.current.get(row.id);

          return (
            <div className="relative" ref={rowRef}>
              <button
                onClick={() => setActionMenu(row.id)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>
              {actionMenu === row.id && (
                <div className="fixed z-10 mt-2 w-40 rounded border bg-white shadow-lg">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      onView(row.id);
                      setActionMenu(null);
                    }}
                  >
                    View
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setEditModalData({ ...row });
                      setActionMenu(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                    onClick={() => handleDeleteApplicant(row.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [actionMenu, handleDeleteApplicant, onView]
  );

  return (
    <div>
      <ApplicantSearch onSearch={handleSearch} clients={uniqueClients} />

      <div className="mb-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Search by Name</label>
          <input
            type="text"
            value={filters.name || ''}
            onChange={e => onFilterChange('name', e.target.value)}
            placeholder="Enter name to search..."
            className="focus:border-secondary focus:ring-secondary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={e => onFilterChange('status', e.target.value)}
            className="focus:border-secondary focus:ring-secondary focus:outline-secondary w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {Object.values(APPLICANT_STATUS).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={e => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="focus:border-secondary focus:ring-secondary focus:outline-secondary rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={e => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="focus:border-secondary focus:ring-secondary focus:outline-secondary rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <DataTable
          className="w-[1000px]"
          customStyles={tableStyles}
          columns={columns}
          data={filteredApplicants}
          // pagination
          highlightOnHover
          progressPending={isLoading}
          noDataComponent="No applicants found"
        />
      </div>
      {/* Edit Modal */}
      {editModalData && (
        <Modal
          title="Edit Applicant"
          onClose={() => {
            setEditModalData(null);
            setFormErrors({});
          }}
          onSave={handleEditApplicant}
          isLoading={isLoading}
        >
          {renderFormField(
            'name',
            editModalData.name,
            e => setEditModalData(prev => ({ ...prev, name: e.target.value })),
            'text',
            formErrors.name
          )}
          {renderFormField(
            'email',
            editModalData.email,
            e => setEditModalData(prev => ({ ...prev, email: e.target.value })),
            'email',
            formErrors.email
          )}
          {renderFormField(
            'application',
            editModalData.application,
            e => setEditModalData(prev => ({ ...prev, application: e.target.value })),
            'text',
            formErrors.application
          )}
          {renderFormField(
            'status',
            editModalData.status,
            e => setEditModalData(prev => ({ ...prev, status: e.target.value })),
            'select',
            formErrors.status,
            Object.values(APPLICANT_STATUS).map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1),
            }))
          )}
          {renderFormField(
            'clientType',
            editModalData.clientType,
            e => setEditModalData(prev => ({ ...prev, clientType: e.target.value })),
            'select',
            formErrors.clientType,
            Object.entries(CLIENT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))
          )}
        </Modal>
      )}
    </div>
  );
};

ApplicantsTable.propTypes = {
  applicants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      application: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      dateCreated: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      clientType: PropTypes.oneOf(Object.values(CLIENT_TYPES)).isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
    status: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default ApplicantsTable;
