import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import { useDeleteSearchStrategyMutation, useGetAllSearchStrategiesQuery } from '@/redux/apis/formApis';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import React, { useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';
import Modal from '../shared/Modal';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';
import AddStrategies from './startegies/AddStrategies';

function AllFormsStrategies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const [selectedRow, setSelectedRow] = useState();
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const { data } = useGetAllSearchStrategiesQuery();
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

  // Table columns
  const columns = [
    {
      name: 'Search Object Key',
      selector: row => row?.searchObjectKey || '',
      sortable: true,
    },
    {
      name: 'Company Identification',
      cell: row =>
        Array.isArray(row.companyIdentification) ? (
          <span>{row.companyIdentification.join(', ')}</span> // ✅ just text instead of DropdownCheckbox
        ) : (
          <span>-</span>
        ),
    },
    {
      name: 'Search Terms',
      selector: row => row?.searchTerms || '',
      sortable: true,
    },
    {
      name: 'Extraction Prompt',
      sortable: true,
      width: '20%',
      cell: row => (
        <textarea
          value={row?.extractionPrompt || ''}
          readOnly // ✅ makes it read-only
          className="text-textPrimary border-frameColor w-full resize-none rounded-md border bg-[#FAFBFF] p-2 text-sm"
          rows={2} // adjust height if needed
        />
      ),
    },
    {
      name: 'Extract As',
      cell: row => <span>{row?.extractAs || '-'}</span>,
    },
    {
      name: 'Active',
      cell: row => <input type="checkbox" checked={!!row?.isActive} disabled className="cursor-not-allowed" />,
    },
    {
      name: 'Action',
      cell: row => {
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
            onClick: async () => {
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
              <MoreVertical size={18} />
            </button>
            {actionMenu === row._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-4">
        <button onClick={() => setIsModalOpen(true)} className="rounded bg-blue-500 px-4 py-2 text-white">
          Add New
        </button>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        noDataComponent="No data found"
      />

      {/* Add Modal */}
      {isModalOpen && (
        <Modal title="Add Strategy" onClose={() => setIsModalOpen(false)}>
          <AddStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            companyOptions={[
              { label: 'Legal company name', value: 'legal_company_name' },
              { label: 'Simple company name', value: 'simple_company_name' },
              { label: 'Website Url', value: 'website_url' },
              { label: 'None', value: 'none' },
            ]}
            extractAsOptions={[
              { label: 'Simple TExt', value: 'simple_text' },
              { label: 'JSON', value: 'json' },
              { label: 'Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Date', value: 'date' },
              { label: 'List', value: 'list' },
            ]}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <Modal title="Edit Strategy" saveButtonText="Save" onClose={() => setEditModalData(null)}>
          <AddStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            companyOptions={[
              { label: 'Legal company name', value: 'legal_company_name' },
              { label: 'Simple company name', value: 'simple_company_name' },
              { label: 'Website Url', value: 'website_url' },
            ]}
            extractAsOptions={[
              { label: 'Simple TExt', value: 'simple_text' },
              { label: 'JSON', value: 'json' },
              { label: 'Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Date', value: 'date' },
              { label: 'List', value: 'list' },
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
    </>
  );
}

export default AllFormsStrategies;
