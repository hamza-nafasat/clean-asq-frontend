import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { MoreVertical, Eye } from 'lucide-react';
import { getTableStyles } from '@/data/data';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';
import Button from '../shared/small/Button';
import { FaUserShield } from 'react-icons/fa';
import { useBranding } from './brandings/globalBranding/BrandingContext';
import TextField from '../shared/small/TextField';

// Define role status
const ROLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Define role access permissions (same as in UserTable)
const ROLE_PERMISSIONS = [
  { id: 'create_user', label: 'Create User' },
  { id: 'edit_user', label: 'Edit User' },
  { id: 'delete_user', label: 'Delete User' },
  { id: 'view_transactions', label: 'View Transactions' },
  { id: 'approve_transactions', label: 'Approve Transactions' },
  { id: 'manage_accounts', label: 'Manage Accounts' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'view_audit_logs', label: 'View Audit Logs' },
  { id: 'manage_settings', label: 'Manage Settings' },
];

const INITIAL_ROLE_FORM = {
  roleName: '',
  permissions: {},
  status: ROLE_STATUS.ACTIVE,
};

function AllUserRoles() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      roleName: 'Admin',
      createDate: '2024-01-01',
      status: ROLE_STATUS.ACTIVE,
      permissions: {
        create_user: true,
        edit_user: true,
        delete_user: true,
        view_transactions: true,
        approve_transactions: true,
        manage_accounts: true,
        view_reports: true,
        manage_roles: true,
        view_audit_logs: true,
        manage_settings: true,
      },
    },
    {
      id: 2,
      roleName: 'Manager',
      createDate: '2024-01-15',
      status: ROLE_STATUS.ACTIVE,
      permissions: {
        create_user: true,
        edit_user: true,
        delete_user: false,
        view_transactions: true,
        approve_transactions: true,
        manage_accounts: true,
        view_reports: true,
        manage_roles: false,
        view_audit_logs: true,
        manage_settings: false,
      },
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ROLE_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const { primaryColor, textColor, backgroundColor, secondaryColor, accentColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
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

  const handleInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleAddRole = useCallback(async () => {
    if (!formData.roleName.trim()) {
      alert('Role name is required');
      return;
    }

    setIsLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      setRoles(prev => [
        ...prev,
        {
          ...formData,
          id: prev.length + 1,
          createDate: date,
        },
      ]);
      setFormData(INITIAL_ROLE_FORM);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding role:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleEditRole = useCallback(async () => {
    if (!editModalData.roleName.trim()) {
      alert('Role name is required');
      return;
    }

    setIsLoading(true);
    try {
      setRoles(prev => prev.map(role => (role.id === editModalData.id ? editModalData : role)));
      setEditModalData(null);
    } catch (error) {
      console.error('Error editing role:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editModalData]);

  const handleDeleteRole = useCallback(async () => {
    if (!deleteConfirmation) return;

    setIsLoading(true);
    try {
      setRoles(prev => prev.filter(role => role.id !== deleteConfirmation.id));
      setActionMenu(null);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmation]);

  const columns = useMemo(
    () => [
      {
        name: 'Role Name',
        selector: row => row.roleName,
        sortable: true,
      },

      {
        name: 'Created Date',
        selector: row => row.createDate,
        sortable: true,
      },
      {
        name: 'Status',
        selector: row => row.status,
        sortable: true,
        cell: row => (
          <span
            className={`${
              row.status === ROLE_STATUS.ACTIVE ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#FF3B301A] text-[#FF3B30]'
            } w-[85px] rounded-sm px-[10px] py-[3px] text-center font-bold capitalize`}
          >
            {row.status === ROLE_STATUS.ACTIVE ? 'Active' : 'Inactive'}
          </span>
        ),
      },
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
                    className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setViewModalData(row);
                      setActionMenu(null);
                    }}
                  >
                    <Eye size={16} className="mr-2" />
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
                    onClick={() => {
                      setDeleteConfirmation(row);
                      setActionMenu(null);
                    }}
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
    [actionMenu, handleDeleteRole]
  );

  const renderPermissionsGrid = (permissions, onChange) => (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-medium text-gray-700">Access Permissions</h3>
      <div className="grid grid-cols-2 gap-2">
        {ROLE_PERMISSIONS.map(permission => (
          <div key={permission.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={permission.id}
              name={permission.id}
              checked={permissions[permission.id] || false}
              onChange={onChange}
              className="text-primary focus:ring-primary border-frameColor h-4 w-4 rounded"
              disabled={!onChange} // Disable if no onChange handler (view mode)
            />
            <label htmlFor={permission.id} className="text-sm text-gray-700">
              {permission.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormField = useCallback((field, value, onChange, type = 'text', error = null, options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());

    if (type === 'select' && options) {
      return (
        <div className="mb-4">
          <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label>
          <select
            name={field}
            value={value}
            onChange={onChange}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base${
              error ? 'border-red-500' : 'border-frameColor'
            }`}
          >
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
        {/* <label className="text-textPrimary mb-1 block text-sm font-medium">{labelText}</label> */}
        <TextField
          label={labelText}
          name={field}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${field}`}
        />

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-textPrimary text-xl font-semibold">Role Management</h2>
        <div>
          <Button icon={FaUserShield} label="Add Role" onClick={() => setIsModalOpen(true)} disabled={isLoading} />
        </div>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={isLoading}
        noDataComponent="No roles found"
      />

      {/* Add Role Modal */}
      {isModalOpen && (
        <Modal
          title="Add Role"
          onClose={() => {
            setIsModalOpen(false);
            setFormData(INITIAL_ROLE_FORM);
          }}
          onSave={handleAddRole}
          isLoading={isLoading}
        >
          {renderFormField('roleName', formData.roleName, handleInputChange, 'text')}
          {renderFormField('status', formData.status, handleInputChange, 'select', null, [
            { value: ROLE_STATUS.ACTIVE, label: 'Active' },
            { value: ROLE_STATUS.INACTIVE, label: 'Inactive' },
          ])}
          {renderPermissionsGrid(formData.permissions, handleInputChange)}
        </Modal>
      )}

      {/* Edit Role Modal */}
      {editModalData && (
        <Modal
          saveButtonText="Edit"
          title="Edit Role"
          onClose={() => setEditModalData(null)}
          onSave={handleEditRole}
          isLoading={isLoading}
        >
          {renderFormField(
            'roleName',
            editModalData.roleName,
            e => setEditModalData(prev => ({ ...prev, roleName: e.target.value })),
            'text'
          )}
          {renderFormField(
            'status',
            editModalData.status,
            e => setEditModalData(prev => ({ ...prev, status: e.target.value })),
            'select',
            null,
            [
              { value: ROLE_STATUS.ACTIVE, label: 'Active' },
              { value: ROLE_STATUS.INACTIVE, label: 'Inactive' },
            ]
          )}
          {renderPermissionsGrid(editModalData.permissions, e =>
            setEditModalData(prev => ({
              ...prev,
              permissions: {
                ...prev.permissions,
                [e.target.name]: e.target.checked,
              },
            }))
          )}
        </Modal>
      )}

      {/* View Role Modal */}
      {viewModalData && (
        <Modal title="View Role" onClose={() => setViewModalData(null)} hideSaveButton>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Role Name</label>
            <div className="border-frameColor flex h-[45px] w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base">
              {viewModalData.roleName}
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <div className="border-frameColor flex h-[45px] w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base">
              <span className={`text-textPrimary inline-flex rounded-full px-2 py-1 text-xs font-semibold`}>
                {viewModalData.status === ROLE_STATUS.ACTIVE ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Created Date</label>
            <div className="border-frameColor flex h-[45px] w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base">
              {viewModalData.createDate}
            </div>
          </div>
          {renderPermissionsGrid(viewModalData.permissions)}
        </Modal>
      )}

      {/* Add Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirmation?.roleName}"? This action cannot be undone.`}
        isLoading={isLoading}
        confirmButtonText="Delete Role"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep Role"
      />
    </div>
  );
}

export default AllUserRoles;
