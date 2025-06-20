import { INITIAL_USER_FORM, USER_STATUS, USER_TABLE_COLUMNS, USER_TYPES } from '@/constants/userConstants';
import { MoreVertical } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { IoMdPersonAdd } from 'react-icons/io';
import ConfirmationModal from '../shared/ConfirmationModal';
import Modal from '../shared/Modal';
import Button from '../shared/small/Button';
import { useBranding } from './brandings/globalBranding/BrandingContext';
import { getTableStyles } from '@/data/data';
import TextField from '../shared/small/TextField';

// user data for get and send
// // fron to back
//     {
//       name: 'Aice Johnson',
//       role: 'role id',
//       businessName: 'dfdffd',
//       email: 'alice@example.com',
//       password: 'alicepass',
//     },
//     // back to front
//     {
//       _id: '32332',
//       name: 'Alice Johnson',
//       role: 'admin',
//       businessName: 'dsdsds',
//       email: 'alice@example.com',
//       createAt: '2023-01-01',
//       updatedAt: '2023-01-01',
//     },

export const userTypeOptions = [
  {
    _id: 'r1',
    roleName: 'Admin',
    status: 'ACTIVE',
    permissions: [
      {
        _id: 'p1',
        name: 'Manage Users',
        createAt: '2024-01-01T10:00:00',
        updatedAt: '2024-02-01T12:00:00',
      },
      {
        _id: 'p2',
        name: 'View Reports',
        createAt: '2024-01-01T10:00:00',
        updatedAt: '2024-02-01T12:00:00',
      },
    ],
    createAt: '2024-01-01T10:00:00',
    updatedAt: '2024-02-01T12:00:00',
  },
  {
    _id: 'r2',
    roleName: 'Owner',
    status: 'ACTIVE',
    permissions: [
      {
        _id: 'p3',
        name: 'Manage Properties',
        createAt: '2024-01-05T09:00:00',
        updatedAt: '2024-02-01T14:00:00',
      },
    ],
    createAt: '2024-01-05T09:00:00',
    updatedAt: '2024-02-01T14:00:00',
  },
  {
    _id: 'r3',
    roleName: 'Tenant',
    status: 'INACTIVE',
    permissions: [
      {
        _id: 'p4',
        name: 'View Rent Info',
        createAt: '2024-01-10T11:00:00',
        updatedAt: '2024-02-01T15:00:00',
      },
    ],
    createAt: '2024-01-10T11:00:00',
    updatedAt: '2024-02-01T15:00:00',
  },
  {
    _id: 'r4',
    roleName: 'Agent',
    status: 'ACTIVE',
    permissions: [
      {
        _id: 'p5',
        name: 'List Properties',
        createAt: '2024-01-15T13:00:00',
        updatedAt: '2024-02-01T16:00:00',
      },
      {
        _id: 'p6',
        name: 'Contact Tenants',
        createAt: '2024-01-15T13:00:00',
        updatedAt: '2024-02-01T16:00:00',
      },
    ],
    createAt: '2024-01-15T13:00:00',
    updatedAt: '2024-02-01T16:00:00',
  },
  {
    _id: 'r5',
    roleName: 'Inspection',
    status: 'ACTIVE',
    permissions: [
      {
        _id: 'p7',
        name: 'Inspect Properties',
        createAt: '2024-01-20T08:30:00',
        updatedAt: '2024-02-01T17:00:00',
      },
    ],
    createAt: '2024-01-20T08:30:00',
    updatedAt: '2024-02-01T17:00:00',
  },
];

const UserTable = () => {
  const [users] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      type: USER_TYPES.ADMIN,
      businessName: '',
      email: 'alice@example.com',
      password: 'alicepass',
      createDate: '2023-01-01',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [passwordModalData, setPasswordModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_USER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading] = useState(false);
  const actionMenuRefs = useRef(new Map());
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  console.log('all user ', formData);

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

  const handleInputChange = useCallback(
    e => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        ...(name === 'type' && !['client', 'client-mbr', 'super-bank'].includes(value) ? { businessName: '' } : {}),
      }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    [formErrors]
  );

  const handleEditInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setEditModalData(prev => {
      if (!prev) return prev;
      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      } else {
        return { ...prev, [name]: value };
      }
    });
  }, []);

  const handlePasswordInputChange = useCallback(e => {
    const { value } = e.target;
    setPasswordModalData(prev => ({ ...prev, password: value }));
  }, []);

  const handleAddUser = useCallback(() => {
    setIsModalOpen(false);
    setFormData(INITIAL_USER_FORM);
    setFormErrors({});
  }, []);

  const handleEditUser = useCallback(() => {
    setEditModalData(null);
    setFormErrors({});
  }, []);

  const handleChangePassword = useCallback(() => {
    setPasswordModalData(null);
    setFormErrors({});
  }, []);

  const handleDeleteUser = useCallback(() => {
    setDeleteConfirmation(null);
    setActionMenu(null);
  }, []);

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
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${
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

    if (type === 'checkbox') {
      return (
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            name={field}
            checked={value}
            onChange={onChange}
            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
          />
          <label className="text-sm text-gray-700">{labelText}</label>
          {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <TextField
          label={labelText}
          name={field}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${labelText}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

  const userTypeDropdownOptions = useMemo(
    () => userTypeOptions.map(option => ({ value: option._id, label: option.roleName })),
    []
  );

  const columns = useMemo(
    () => [
      ...USER_TABLE_COLUMNS,
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
                      setEditModalData({ ...row });
                      setActionMenu(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setPasswordModalData({ id: row.id, password: '' });
                      setActionMenu(null);
                    }}
                  >
                    Change Password
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
    [actionMenu, handleDeleteUser]
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#323332]">User Table</h2>
        <div className="flex gap-2">
          <Button icon={IoMdPersonAdd} label="Add User" onClick={() => setIsModalOpen(true)} disabled={isLoading} />
        </div>
      </div>

      <DataTable
        customStyles={tableStyles}
        columns={columns}
        data={users}
        pagination
        highlightOnHover
        progressPending={isLoading}
        noDataComponent="No users found"
      />

      {isModalOpen && (
        <Modal
          saveButtonText="Create User"
          title="Add User"
          onClose={() => {
            setIsModalOpen(false);
            setFormData(INITIAL_USER_FORM);
            setFormErrors({});
          }}
          onSave={handleAddUser}
          isLoading={isLoading}
        >
          {renderFormField('name', formData.name, handleInputChange, 'text', formErrors.name)}
          {renderFormField(
            'role',
            formData.role,
            handleInputChange,
            'select',
            formErrors.role,
            userTypeDropdownOptions
          )}
          {['r2', 'r3', 'r4', 'r5'].includes(formData.role) &&
            renderFormField('businessName', formData.businessName, handleInputChange, 'text', formErrors.businessName)}
          {renderFormField('email', formData.email, handleInputChange, 'email', formErrors.email)}
          {renderFormField('password', formData.password, handleInputChange, 'password', formErrors.password)}
        </Modal>
      )}

      {editModalData && (
        <Modal
          saveButtonText="Edit"
          title="Edit User"
          onClose={() => {
            setEditModalData(null);
            setFormErrors({});
          }}
          onSave={handleEditUser}
          isLoading={isLoading}
        >
          {renderFormField('name', editModalData.name, handleEditInputChange, 'text', formErrors.name)}
          {renderFormField(
            'role',
            editModalData.role,
            handleEditInputChange,
            'select',
            formErrors.role,
            userTypeDropdownOptions
          )}
          {['r2', 'r3', 'r4', 'r5'].includes(editModalData.role) &&
            renderFormField(
              'businessName',
              editModalData.businessName,
              handleEditInputChange,
              'text',
              formErrors.businessName
            )}
          {renderFormField('email', editModalData.email, handleEditInputChange, 'email', formErrors.email)}
          {renderFormField('status', editModalData.status, handleEditInputChange, 'select', formErrors.status, [
            { value: USER_STATUS.ACTIVE, label: 'Active' },
            { value: USER_STATUS.INACTIVE, label: 'Inactive' },
          ])}
        </Modal>
      )}

      {passwordModalData && (
        <Modal
          title="Change Password"
          onClose={() => {
            setPasswordModalData(null);
            setFormErrors({});
          }}
          onSave={handleChangePassword}
          isLoading={isLoading}
        >
          {renderFormField(
            'password',
            passwordModalData.password,
            handlePasswordInputChange,
            'password',
            formErrors.password
          )}
        </Modal>
      )}

      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete the user "${deleteConfirmation?.name}"? This action cannot be undone.`}
        isLoading={isLoading}
        confirmButtonText="Delete User"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep User"
      />
    </div>
  );
};

UserTable.propTypes = {
  // Add any props if needed
};

export default UserTable;
