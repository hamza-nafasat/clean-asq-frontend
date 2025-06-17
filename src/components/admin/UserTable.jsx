import { INITIAL_USER_FORM, USER_STATUS, USER_TABLE_COLUMNS, USER_TYPES } from '@/constants/userConstants';
import { validatePassword, validateUserForm } from '@/utils/userUtils';
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

const UserTable = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      type: USER_TYPES.ADMIN,
      businessName: '',
      email: 'alice@example.com',
      password: 'alicepass',
      createDate: '2023-01-01',
      status: USER_STATUS.ACTIVE,
      allowAdminAccess: true,
    },
    {
      id: 2,
      name: 'Bob Smith',
      type: USER_TYPES.TEAM_MEMBER,
      businessName: '',
      email: 'bob@example.com',
      password: 'bobpass123',
      createDate: '2023-01-05',
      status: USER_STATUS.ACTIVE,
      allowAdminAccess: false,
    },
    {
      id: 3,
      name: 'Acme Corp',
      type: USER_TYPES.CLIENT,
      businessName: 'Acme Corporation',
      email: 'contact@acme.com',
      password: 'acmepass123',
      createDate: '2023-01-10',
      status: USER_STATUS.ACTIVE,
      allowAdminAccess: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [passwordModalData, setPasswordModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_USER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const actionMenuRefs = useRef(new Map());
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleData, setRoleData] = useState({
    roleName: '',
    permissions: {},
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const { primaryColor, textColor, backgroundColor, secondaryColor, accentColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  useEffect(() => {
    const handleClickOutside = event => {
      // Check if click is outside all open menus
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
        // Clear business name if type doesn't require it
        ...(name === 'type' && !['client', 'client-mbr', 'super-bank'].includes(value) ? { businessName: '' } : {}),
      }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    [formErrors]
  );

  const handleAddUser = useCallback(async () => {
    const errors = validateUserForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      setUsers(prev => [
        ...prev,
        {
          ...formData,
          id: prev.length + 1,
          createDate: date,
          status: USER_STATUS.ACTIVE,
          allowAdminAccess: formData.type === USER_TYPES.TEAM_MEMBER ? formData.allowAdminAccess : false,
        },
      ]);
      setFormData(INITIAL_USER_FORM);
      setIsModalOpen(false);
      setFormErrors({});
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleEditUser = useCallback(async () => {
    const errors = validateUserForm(editModalData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      setUsers(prev =>
        prev.map(user =>
          user.id === editModalData.id
            ? {
                ...editModalData,
                allowAdminAccess:
                  editModalData.type === USER_TYPES.TEAM_MEMBER ? editModalData.allowAdminAccess : false,
              }
            : user
        )
      );
      setEditModalData(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error editing user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editModalData]);

  const handleChangePassword = useCallback(async () => {
    if (!passwordModalData?.password) {
      setFormErrors({ password: ['Password is required'] });
      return;
    }

    const passwordErrors = validatePassword(passwordModalData.password);
    if (passwordErrors.length > 0) {
      setFormErrors({ password: passwordErrors });
      return;
    }

    setIsLoading(true);
    try {
      setUsers(prev =>
        prev.map(user => (user.id === passwordModalData.id ? { ...user, password: passwordModalData.password } : user))
      );
      setPasswordModalData(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  }, [passwordModalData]);

  const handleDeleteUser = useCallback(async () => {
    if (!deleteConfirmation) return;

    setIsLoading(true);
    try {
      setUsers(prev => prev.filter(user => user.id !== deleteConfirmation.id));
      setActionMenu(null);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deleteConfirmation]);

  const handleRoleInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRoleData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked,
        },
      }));
      console.log('Permission changed:', name, checked);
    } else {
      setRoleData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const userTypeOptions = useMemo(
    () => [
      { value: USER_TYPES.ADMIN, label: 'Admin' },
      { value: USER_TYPES.TEAM_MEMBER, label: 'Team Member' },
      { value: USER_TYPES.CLIENT, label: 'Client' },
      { value: USER_TYPES.CLIENT_MEMBER, label: 'Client Member' },
      { value: USER_TYPES.SUPER_BANK, label: 'Super Bank' },
    ],
    []
  );

  const columns = useMemo(
    () => [
      ...USER_TABLE_COLUMNS,
      {
        name: 'Action',
        cell: row => {
          // Get or create ref for this row
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

      {/* Add User Modal */}
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
          {renderFormField('type', formData.type, handleInputChange, 'select', formErrors.type, userTypeOptions)}
          {['client', 'client-mbr', 'super-bank'].includes(formData.type) &&
            renderFormField('businessName', formData.businessName, handleInputChange, 'text', formErrors.businessName)}
          {renderFormField('email', formData.email, handleInputChange, 'email', formErrors.email)}
          {renderFormField('password', formData.password, handleInputChange, 'password', formErrors.password)}
          {formData.type === USER_TYPES.TEAM_MEMBER &&
            renderFormField(
              'allowAdminAccess',
              formData.allowAdminAccess,
              handleInputChange,
              'checkbox',
              formErrors.allowAdminAccess
            )}
        </Modal>
      )}

      {/* Edit Modal */}
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
          {renderFormField(
            'name',
            editModalData.name,
            e => setEditModalData(prev => ({ ...prev, name: e.target.value })),
            'text',
            formErrors.name
          )}
          {renderFormField(
            'type',
            editModalData.type,
            e => setEditModalData(prev => ({ ...prev, type: e.target.value })),
            'select',
            formErrors.type,
            userTypeOptions
          )}
          {['client', 'client-mbr', 'super-bank'].includes(editModalData.type) &&
            renderFormField(
              'businessName',
              editModalData.businessName,
              e => setEditModalData(prev => ({ ...prev, businessName: e.target.value })),
              'text',
              formErrors.businessName
            )}
          {renderFormField(
            'email',
            editModalData.email,
            e => setEditModalData(prev => ({ ...prev, email: e.target.value })),
            'email',
            formErrors.email
          )}
          {renderFormField(
            'status',
            editModalData.status,
            e => setEditModalData(prev => ({ ...prev, status: e.target.value })),
            'select',
            formErrors.status,
            [
              { value: USER_STATUS.ACTIVE, label: 'Active' },
              { value: USER_STATUS.INACTIVE, label: 'Inactive' },
            ]
          )}
          {editModalData.type === USER_TYPES.TEAM_MEMBER &&
            renderFormField(
              'allowAdminAccess',
              editModalData.allowAdminAccess,
              e => setEditModalData(prev => ({ ...prev, allowAdminAccess: e.target.checked })),
              'checkbox',
              formErrors.allowAdminAccess
            )}
        </Modal>
      )}

      {/* Change Password Modal */}
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
            e => setPasswordModalData(prev => ({ ...prev, password: e.target.value })),
            'password',
            formErrors.password
          )}
        </Modal>
      )}

      {/* Add Delete Confirmation Modal */}
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
