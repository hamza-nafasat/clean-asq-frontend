import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import {
  useCreateSearchStrategyDefaultMutation,
  useDeleteSearchStrategyMutation,
  useGetAllSearchStrategiesQuery,
} from '@/redux/apis/formApis';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import React, { useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';
import Modal from '../shared/Modal';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';
import AddStrategiesKey from './startegies/AddStrategiesKey';
import Button from '../shared/small/Button';
import AddStrategies from './startegies/AddStrategies';
import EditStrategies from './startegies/EditStrategies';

function AllStrategies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const [selectedRow, setSelectedRow] = useState();
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const { data } = useGetAllSearchStrategiesQuery();
  const [createDefaultStrategies, { isLoading: isLoadingCreateDefaultStrategies }] =
    useCreateSearchStrategyDefaultMutation();
  const [deleteSearchStrategy] = useDeleteSearchStrategyMutation();

  const handleDelete = async () => {
    if (!selectedRow) return toast.error('Please select a row');
    try {
      const res = await deleteSearchStrategy({ SearchStrategyId: selectedRow._id }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteConfirmation(null);
    }
  };
  const handleCreateDefaultStrategies = async () => {
    try {
      const res = await createDefaultStrategies().unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error?.data?.message || 'Failed to delete user');
    }
  };

  // Table columns

  const dummyData = [
    {
      id: 1,
      name: 'Bilal',
      form: 'Legal company name, Registration ID, Website Url',
      strategiesKey: ['growth_strategy', 'market_entry'],
      createdAt: '2025-09-01T10:15:00Z',
      updatedAt: 'Financial Report',
    },
    {
      id: 2,
      name: 'Ali',
      form: 'Simple company name, Contact Email',
      strategiesKey: ['digital_marketing', 'seo', 'content'],
      createdAt: '2025-08-28T14:30:00Z',
      updatedAt: 'Marketing Plan',
    },
    {
      id: 3,
      name: 'Sara',
      form: 'Phone Number, None',
      strategiesKey: ['ai_integration', 'automation'],
      createdAt: '2025-07-20T08:00:00Z',
      updatedAt: 'Tech Proposal',
    },
    {
      id: 4,
      name: 'Hamza',
      form: 'Legal company name, Registration ID',
      strategiesKey: ['manufacturing', 'quality_control'],
      createdAt: '2025-06-15T09:45:00Z',
      updatedAt: 'Operations Report',
    },
    {
      id: 5,
      name: 'Zara',
      form: 'Website Url',
      strategiesKey: ['expansion', 'partnerships'],
      createdAt: '2025-05-01T12:20:00Z',
      updatedAt: 'Business Strategy',
    },
  ];

  const columns = [
    {
      name: 'Name',
      selector: row => row?.name || '',
      sortable: true,
    },
    {
      name: 'Form',
      cell: row => <span>{row?.form || '-'}</span>,
    },
    {
      name: 'Strategies Key',
      cell: row => (Array.isArray(row?.strategiesKey) ? row.strategiesKey.join(', ') : '-'),
      sortable: true,
    },
    {
      name: 'Created At',
      sortable: true,
      width: '20%',
      cell: row => row?.createdAt || '',
    },
    {
      name: 'Updated At',
      cell: row => <span>{row?.updatedAt || '-'}</span>,
    },
    {
      name: 'Action',
      cell: row => {
        // ✅ Ensure ref exists for this row
        if (!actionMenuRefs.current.has(row.id)) {
          actionMenuRefs.current.set(row.id, React.createRef());
        }
        const rowRef = actionMenuRefs.current.get(row.id);

        const buttons = [
          {
            name: 'edit',
            icon: <Pencil size={16} className="mr-2" />,
            onClick: () => {
              setEditModalData(row);
              setActionMenu(null);
              setSelectedRow(row);
            },
          },
          {
            name: 'delete',
            icon: <Trash size={16} className="mr-2" />,
            onClick: () => {
              setDeleteConfirmation(row);
              setActionMenu(null);
              setSelectedRow(row);
            },
          },
        ];

        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={
                () => setActionMenu(prev => (prev === row.id ? null : row.id)) // ✅ use row.id
              }
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical className="cursor-pointer" size={18} />
            </button>

            {actionMenu === row.id && ( // ✅ check row.id instead of row._id
              <ThreeDotEditViewDelete buttons={buttons} row={row} />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-4 flex w-full justify-end gap-3">
        <Button onClick={() => setIsModalOpen(true)} label={'Add new'} />
        <Button
          onClick={handleCreateDefaultStrategies}
          disabled={isLoadingCreateDefaultStrategies}
          label={'Create Default'}
        />
      </div>

      <DataTable
        data={dummyData || []}
        columns={columns}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        noDataComponent="No data found"
      />

      {/* Add Modal */}
      {isModalOpen && (
        <Modal hideSaveButton={true} hideCancelButton={true} title="Add Strategy" onClose={() => setIsModalOpen(false)}>
          <AddStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            forms={[
              { label: 'Legal company name', value: '266981239813912391' },
              { label: 'Simple company name', value: '923847192837491283' },
              { label: 'Website URL', value: '192837465564738291' },
            ]}
            formKeys={[
              { label: 'Contact Email', value: '837462938471928374' },
              { label: 'Phone Number', value: '564738291837465920' },
              { label: 'Registration ID', value: '847362918374659201' },
              { label: 'None', value: 'none' },
            ]}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <Modal
          hideSaveButton={true}
          hideCancelButton={true}
          title="Edit Strategy"
          saveButtonText="Save"
          onClose={() => setEditModalData(null)}
        >
          <EditStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            forms={[
              { label: 'Legal company name', value: '266981239813912391' },
              { label: 'Simple company name', value: '923847192837491283' },
              { label: 'Website URL', value: '192837465564738291' },
            ]}
            formKeys={[
              { label: 'Contact Email', value: '837462938471928374' },
              { label: 'Phone Number', value: '564738291837465920' },
              { label: 'Registration ID', value: '847362918374659201' },
            ]}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${deleteConfirmation?.searchObjectKey}"?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
    </div>
  );
}

export default AllStrategies;
