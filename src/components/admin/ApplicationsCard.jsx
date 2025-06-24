import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { GoChevronDown } from 'react-icons/go';
import { bankForms } from '../../data/data';
import UserApplicationDetail from './UserApplicationDetail';
import Button from '../shared/small/Button';
import TextField from '../shared/small/TextField';
import { FaCheck } from 'react-icons/fa6';
import Modal from '../shared/small/Modal';
import FileUploader from '../applicationVerification/Documents/FileUploader';

const statusOptions = ['All', 'Active', 'Draft', 'Inactive'];

export default function ApplicationsCard() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchMode, setSearchMode] = useState('client');

  const handleCardClick = form => {
    setSelectedForm(form);
  };

  const handleCloseDetail = () => {
    setSelectedForm(null);
  };

  // Filtering logic
  const filteredForms = bankForms.filter(form => {
    // Search by client or name (for demo, match in formType)
    const clientMatch =
      searchMode === 'client'
        ? clientQuery === '' || form.formType.toLowerCase().includes(clientQuery.toLowerCase())
        : true;
    const nameMatch =
      searchMode === 'name' ? nameQuery === '' || form.formType.toLowerCase().includes(nameQuery.toLowerCase()) : true;
    // Status filter
    const statusMatch = statusFilter === 'All' || form.status === statusFilter;
    // Date range filter
    const created = new Date(form.createdAt);
    const fromMatch = !dateFrom || created >= new Date(dateFrom);
    const toMatch = !dateTo || created <= new Date(dateTo);
    return clientMatch && nameMatch && statusMatch && fromMatch && toMatch;
  });

  if (selectedForm) {
    return <UserApplicationDetail form={selectedForm} onClose={handleCloseDetail} />;
  }
  const [creteFormModal, setCreateFormModal] = useState(false);
  const openFormModalHandle = () => {
    setCreateFormModal(true);
  };
  const closeFormModalHandle = () => {
    setCreateFormModal(false);
  };
  return (
    <div className="rounded-md bg-white p-5 shadow">
      {/* Header Section */}
      {creteFormModal && (
        <Modal onClose={closeFormModalHandle} title="">
          <FileUploader
            label="Upload Image / PDF / CSV"
            accept=".pdf,image/*,.csv"
            onFileSelect={file => console.log('Selected file:', file)}
          />
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-textPrimary text-[22px] font-medium">Financial Services Application Platform</h1>
          <p className="text-textPrimary text-[14px] font-normal">
            Dynamic application forms with AI-assisted completion and automated data lookup
          </p>
        </div>
        <div className="flex gap-6">
          <Button label={'Help'} variant="secondary" />
          <Button label={'Create Form'} onClick={openFormModalHandle} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 grid w-full grid-cols-1 items-end gap-[8px] md:grid-cols-12">
        {/* Search Input with Toggle */}

        <div className="w-full rounded-[4px] md:col-span-5">
          <TextField
            label={'Advance search'}
            type="text"
            className="border-none bg-white px-2 py-2 text-sm outline-none"
            placeholder={searchMode === 'client' ? 'Search From' : 'Search Name'}
            value={searchMode === 'client' ? clientQuery : nameQuery}
            onChange={e => (searchMode === 'client' ? setClientQuery(e.target.value) : setNameQuery(e.target.value))}
            leftIcon={<CiSearch />}
            rightIcon={
              <div>
                <Button
                  className={`!border-none ${searchMode === 'client' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSearchMode('client')}
                  label={'BY CLIENT#'}
                />

                <Button
                  className={`!border-none ${searchMode === 'name' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSearchMode('name')}
                  label={'BY NAME#'}
                />
              </div>
            }
          />
        </div>
        {/* Date Pickers */}
        <div className="col-span-3 w-full">
          <TextField label={'From'} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="col-span-3 w-full">
          <TextField label={'To'} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        {/* Search Button */}
        <div className="col-span-1 flex w-full items-center">
          <Button icon={CiSearch} label={'Search'} />
        </div>
      </div>

      {/* Cards */}
      <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form, index) => (
          <div
            key={index}
            className="relative flex min-w-0 flex-col rounded-[8px] border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
          >
            {/* Menu icon */}
            <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
            <div className="flex items-start gap-2 md:gap-4">
              {/* <CardIcon /> */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base leading-tight font-bold break-words text-gray-700 sm:text-lg md:text-2xl">
                    {form.formType}
                  </h2>
                  <span
                    className={`rounded-[8px] px-4 py-2 text-xs font-semibold md:text-sm ${form.status === 'Active' ? 'bg-green-100 text-green-700' : form.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {form.status}
                  </span>
                </div>
                <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheck className="text-primary" />
                <span>{form.fields.length} form sections</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheck className="text-primary" />
                <span>AI-assisted completion available</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">Applicants: {form.totalApplicants}</span>
              <span className="text-gray-500">Created: {new Date(form.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex w-full flex-col items-center justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
              <Button label={'Start Application'} onClick={() => handleCardClick(form)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
