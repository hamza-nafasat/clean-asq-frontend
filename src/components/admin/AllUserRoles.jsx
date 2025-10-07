import React, { useState, useCallback, useRef, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { MoreVertical, Eye, Pencil, Trash } from 'lucide-react';
import { getTableStyles } from '@/data/data';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';
import Button from '../shared/small/Button';
import { FaUserShield } from 'react-icons/fa';
import { useBranding } from '../../hooks/BrandingContext';
import TextField from '../shared/small/TextField';
import {
  useCreateRoleMutation,
  useDeleteSingleRoleMutation,
  useGetAllPermissionsQuery,
  useGetAllRolesQuery,
  useUpdateSingleRoleMutation,
} from '@/redux/apis/roleApis';
import Checkbox from '../shared/small/Checkbox';
import { toast } from 'react-toastify';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';

// Define role status
const ROLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const INITIAL_ROLE_FORM = {
  roleName: '',
  permissions: [],
  status: ROLE_STATUS.ACTIVE,
};

function AllUserRoles() {
  const { data: permissionsData } = useGetAllPermissionsQuery();
  const { data: roles } = useGetAllRolesQuery();
  const [deleteRole] = useDeleteSingleRoleMutation();
  const [editRole] = useUpdateSingleRoleMutation();

  const [createRole] = useCreateRoleMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ROLE_FORM);
  const [isLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [rowForDelete, setRowForDelete] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const ButtonsForThreeDot = [
    {
      name: 'view',
      icon: <Eye size={16} className="mr-2" />,
      onClick: row => {
        setViewModalData(row);
        setActionMenu(null);
      },
    },
    {
      name: 'edit',
      icon: <Pencil size={16} className="mr-2" />,
      onClick: row => {
        setEditModalData({ ...row, roleName: row.name });
        setActionMenu(null);
      },
    },
    {
      name: 'delete',
      icon: <Trash size={16} className="mr-2" />,
      onClick: row => {
        setDeleteConfirmation(row);
        setActionMenu(null);
        setRowForDelete(row?._id);
      },
    },
  ];

  // Only update local state for form fields, do not persist
  const handleInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const permissionId = name;
      setFormData(prev => {
        const newPermissions = checked
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(id => id !== permissionId);
        return { ...prev, permissions: newPermissions };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // For edit modal
  const handleEditInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setEditModalData(prev => {
      if (!prev) return prev;
      if (type === 'checkbox') {
        const permissionId = name;
        const newPermissions = checked
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(id => id !== permissionId);
        return { ...prev, permissions: newPermissions };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  }, []);

  // For edit modal
  const handleEditInputChangeForPermissions = useCallback((e, value) => {
    const { name, checked } = e.target;
    setEditModalData(prev => {
      let permissions = prev?.permissions || [];
      if (checked) {
        if (!permissions.some(p => p._id === name)) {
          permissions = [...permissions, value];
        }
      } else {
        permissions = permissions.filter(p => p._id !== name);
      }
      return { ...prev, permissions };
    });
  }, []);

  // No-op for add, edit, delete
  const handleAddRole = async () => {
    try {
      const res = await createRole({ name: formData.roleName, permissions: formData.permissions }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setFormData(INITIAL_ROLE_FORM);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error?.data?.message || 'Failed to create role');
    }
  };

  const handleEditRole = async () => {
    try {
      const res = await editRole({
        _id: editModalData?._id,
        name: editModalData.roleName,
        permissions: editModalData.permissions?.map(permission => permission?._id),
      }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setEditModalData(null);
      } else {
        toast.error(res?.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    try {
      const res = await deleteRole({ _id: rowForDelete }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setDeleteConfirmation(null);
        setActionMenu(null);
        setRowForDelete(null);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error?.data?.message || 'Failed to delete role');
    }
  };

  const columns = () => [
    {
      name: 'Role Name',
      selector: row => row.name,
      sortable: true,
    },

    {
      name: '_id',
      selector: row => row._id,
      sortable: true,
    },

    {
      name: 'Created At',
      selector: row => row.createdAt?.split('T')?.[0],
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => {
        if (!actionMenuRefs.current.has(row._id)) {
          actionMenuRefs.current.set(row._id, React.createRef());
        }
        const rowRef = actionMenuRefs.current.get(row._id);

        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={() => setActionMenu(prevActionMenu => (prevActionMenu === row._id ? null : row._id))}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </button>
            {actionMenu === row._id && <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />}
          </div>
        );
      },
    },
  ];

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

  const renderPermissionsGrid = (permissions, onChange) => {
    return (
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Access Permissions</h3>
        <div className="grid grid-cols-2 gap-2">
          {permissionsData?.data?.map(permission => {
            const isViewMode = !onChange;
            const isChecked = isViewMode
              ? permissions.some(p => p._id === permission._id)
              : permissions.some(p => p._id === permission._id);
            return (
              <Checkbox
                key={permission._id}
                id={permission._id}
                value={permission}
                name={permission._id}
                label={permission.name}
                checked={isChecked}
                onChange={isViewMode ? null : e => onChange(e, permission)}
                disabled={isViewMode}
              />
            );
          })}
        </div>
      </div>
    );
  };

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
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base${error ? 'border-red-500' : 'border-frameColor'
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
    <div className="mt-5 w-full">
      <div className="mb-5 flex items-center justify-between ">
        <h2 className="text-textPrimary text-xl font-semibold">Role Management</h2>
        <div>
          <Button icon={FaUserShield} label="Add Role" onClick={() => setIsModalOpen(true)} disabled={isLoading} />
        </div>
      </div>

      <DataTable
        data={roles?.data || []}
        columns={columns()}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={isLoading}
        noDataComponent="No roles found"
        className="!rounded-t-xl"
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
          {renderFormField('roleName', editModalData.roleName, handleEditInputChange, 'text')}
          {renderFormField('status', editModalData.status, handleEditInputChange, 'select', null, [
            { value: ROLE_STATUS.ACTIVE, label: 'Active' },
            { value: ROLE_STATUS.INACTIVE, label: 'Inactive' },
          ])}
          {renderPermissionsGrid(editModalData.permissions, handleEditInputChangeForPermissions)}
        </Modal>
      )}
      {/* View Role Modal */}
      {viewModalData && (
        <Modal title="View Role" onClose={() => setViewModalData(null)} hideSaveButton>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Role Name</label>
            <div className="border-frameColor flex h-[45px] w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base">
              {viewModalData.name}
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
              {viewModalData?.createdAt?.split('T')?.[0]}
            </div>
          </div>
          {renderPermissionsGrid(viewModalData?.permissions)}
        </Modal>
      )}

      {/* Add Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirmation?.name}"? This action cannot be undone.`}
        isLoading={isLoading}
        confirmButtonText="Delete Role"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Keep Role"
      />
    </div>
  );
}

export default AllUserRoles;
