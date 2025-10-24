import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import {
  useDeleteFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
} from '@/redux/apis/formApis';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import React, { useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';
import Modal from '../shared/Modal';
import Button from '../shared/small/Button';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';
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

  const { data: formData } = useGetMyAllFormsQuery();
  const [deleteFormStrategy] = useDeleteFormStrategyMutation();
  const { data: allStrategies } = useGetAllSearchStrategiesQuery();
  const { data: allFormStrategies } = useGetAllFormStrategiesQuery();

  const handleDelete = async () => {
    if (!selectedRow) return toast.error('Please select a row');
    try {
      const res = await deleteFormStrategy({ FormStrategyId: selectedRow?._id }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.error('Error deleting form strategy:', error);
      toast.error(error?.data?.message || 'Failed to delete form strategy');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const getAllFormDontAlreadyAdded = (stratigies, forms) => {
    const allFormsAddedInStrategies = stratigies
      ?.map(item => item?.forms)
      ?.flat()
      ?.map(item => item?._id);
    const allForms =
      forms
        ?.map(item => ({ label: item?.name, value: item?._id }))
        ?.filter(item => !allFormsAddedInStrategies?.includes(item?.value)) || [];
    return allForms;
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row?.name || '',
      sortable: true,
    },
    {
      name: 'Form',
      cell: row => <span>{row?.forms?.map(item => item?.name).join(', ') || ''}</span>,
    },
    {
      name: 'Strategies Key',
      cell: row =>
        Array.isArray(row?.searchStrategies)
          ? row?.searchStrategies?.map(item => item?.searchObjectKey).join(', ')
          : '-',
      grow: 2,
      sortable: true,
    },
    {
      name: 'Created At',
      sortable: true,

      cell: row => new Date(row?.createdAt)?.toLocaleDateString('en-US') || '',
    },
    {
      name: 'Updated At',
      cell: row => new Date(row?.updatedAt)?.toLocaleDateString('en-US') || '',
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
              onClick={() => setActionMenu(prev => (prev === row._id ? null : row._id))}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical className="cursor-pointer" size={18} />
            </button>

            {actionMenu === row._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mt-5 mb-4 flex w-full justify-end gap-3">
        <Button onClick={() => setIsModalOpen(true)} label={'Add new'} />
      </div>
      <DataTable
        data={allFormStrategies?.data || []}
        columns={columns}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        noDataComponent="No data found"
        className="!rounded-lg"
      />

      {/* Add Modal */}
      {isModalOpen && (
        <Modal hideSaveButton={true} hideCancelButton={true} title="Add Strategy" onClose={() => setIsModalOpen(false)}>
          <AddStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            forms={getAllFormDontAlreadyAdded(allFormStrategies?.data, formData?.data)}
            formKeys={allStrategies?.data?.map(item => ({ label: item?.searchObjectKey, value: item?._id })) || []}
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
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            forms={formData?.data?.map(item => ({ label: item?.name, value: item?._id })) || []}
            formKeys={allStrategies?.data?.map(item => ({ label: item?.searchObjectKey, value: item?._id })) || []}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete ${deleteConfirmation?.searchObjectKey}?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
    </div>
  );
}

export default AllStrategies;
