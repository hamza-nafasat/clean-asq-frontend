import React, { useRef, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { Eye, MoreVertical, Pencil, Trash } from 'lucide-react';
import DropdownCheckbox from '../shared/DropdownCheckbox';
import { ThreeDotEditViewDelete } from '../shared/ThreeDotViewEditDelete';
import { getTableStyles } from '@/data/data';
import Modal from '../shared/Modal';
import ConfirmationModal from '../shared/ConfirmationModal';
import TextField from '../shared/small/TextField';
import AddStrategies from './startegies/AddStrategies';
import { useBranding } from '@/hooks/BrandingContext';

const companyOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Google', value: 'google' },
  { label: 'Microsoft', value: 'microsoft' },
  { label: 'none', value: 'none' },
];

const extractAsOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
];

const INITIAL_FORM = {
  id: '',
  searchObjectKey: '',
  companyIdentification: [],
  searchTerms: '',
  extractionPrompt: '',
  extractAs: '',
  active: true,
};

function AllFormsStrategies() {
  const [tableData, setTableData] = useState([
    {
      id: '1',
      searchObjectKey: 'invoice_123',
      companyIdentification: ['apple'],
      searchTerms: 'payment, due',
      extractionPrompt:
        'Extract invoice amount Extract invoice amount Extract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountExtract invoice amountvExtract invoice amountvExtract invoice amountExtract invoice amount',
      extractAs: 'number',
      active: true,
    },
    {
      id: '2',
      searchObjectKey: 'contract_456',
      companyIdentification: ['google'],
      searchTerms: 'expiry, renew',
      extractionPrompt: 'Extract contract end date',
      extractAs: 'date',
      active: false,
    },
  ]);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  // handle company & extract changes inline
  const handleCompanySelect = (id, values) => {
    setTableData(prev => prev.map(row => (row.id === id ? { ...row, companyIdentification: values } : row)));
  };

  const handleExtractAsChange = (id, value) => {
    setTableData(prev => prev.map(row => (row.id === id ? { ...row, extractAs: value } : row)));
  };

  // Form handling
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setTableData(prev => [...prev, { ...formData, id: String(Date.now()) }]);
    setFormData(INITIAL_FORM);
    setIsModalOpen(false);
  };

  const handleEdit = () => {
    setTableData(prev => prev.map(row => (row.id === editModalData.id ? editModalData : row)));
    setEditModalData(null);
  };

  const handleDelete = () => {
    setTableData(prev => prev.filter(row => row.id !== deleteConfirmation.id));
    setDeleteConfirmation(null);
  };

  // Render fields
  const renderFormField = useCallback((field, value, onChange, type = 'text', options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());

    if (type === 'select' && options) {
      return (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">{labelText}</label>
          <select name={field} value={value} onChange={onChange} className="w-full rounded border p-2 text-sm">
            <option value="">Select</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
          placeholder={`Enter ${field}`}
        />
      </div>
    );
  }, []);

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
      cell: row => <span>{extractAsOptions.find(opt => opt.value === row?.extractAs)?.label || '-'}</span>,
    },
    {
      name: 'Active',
      cell: row => (
        <input
          type="checkbox"
          checked={!!row?.active}
          disabled // ✅ makes it read-only
          className="cursor-not-allowed"
        />
      ),
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
            },
          },
          {
            name: 'delete',
            icon: <Trash size={16} className="mr-2" />,
            onClick: () => {
              setDeleteConfirmation(row);
              setActionMenu(null);
            },
          },
        ];

        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={() => setActionMenu(prev => (prev === row.id ? null : row.id))}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </button>
            {actionMenu === row.id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
          </div>
        );
      },
    },
  ];

  const handleSave = newRow => {
    setTableData(prev => [...prev, { id: Date.now(), ...newRow }]);
  };
  return (
    <>
      <div className="mb-4">
        <button onClick={() => setIsModalOpen(true)} className="rounded bg-blue-500 px-4 py-2 text-white">
          Add New
        </button>
      </div>

      <DataTable
        data={tableData}
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
            onSave={handleSave}
            companyOptions={[
              { label: 'Apple', value: 'apple' },
              { label: 'Google', value: 'google' },
              { label: 'Microsoft', value: 'microsoft' },
            ]}
            extractAsOptions={[
              { label: 'JSON', value: 'json' },
              { label: 'Text', value: 'text' },
            ]}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <Modal title="Edit Strategy" saveButtonText="Save" onClose={() => setEditModalData(null)} onSave={handleEdit}>
          <AddStrategies
            onSave={handleSave}
            companyOptions={[
              { label: 'Apple', value: 'apple' },
              { label: 'Google', value: 'google' },
              { label: 'Microsoft', value: 'microsoft' },
            ]}
            extractAsOptions={[
              { label: 'JSON', value: 'json' },
              { label: 'Text', value: 'text' },
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
