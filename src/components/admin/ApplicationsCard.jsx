import React, { useState } from 'react';
import UserApplicationDetail from './UserApplicationDetail';
import { GoChevronDown } from 'react-icons/go';
import { CiSearch } from 'react-icons/ci';
import { bankForms } from '../../data/data';
import MenuIcon from './../../assets/svgs/MenuIcon';
import { CiMenuKebab } from 'react-icons/ci';

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

  return (
    <div className="rounded-md bg-white p-5 shadow">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-[#1A1A1A]">Financial Services Application Platform</h1>
          <p className="text-[14px] font-normal text-[#A7A7A7]">
            Dynamic application forms with AI-assisted completion and automated data lookup
          </p>
        </div>
        <div className="flex gap-6">
          <button className="rounded-[4px] bg-[#A7A7A7] px-5 py-3.5 text-[16px] font-normal text-white">Help</button>
          <button className="flex items-center rounded-[4px] bg-teal-600 px-5 py-3.5 text-[16px] font-normal text-white">
            Create Form <GoChevronDown size={16} className="ml-[6px]" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 grid w-full grid-cols-1 items-end gap-[8px] md:grid-cols-12">
        {/* Search Input with Toggle */}

        <div className="w-full rounded-[4px] md:col-span-5">
          <p className="text-[12px] font-medium text-[#A7A7A7]">ADVANCED SEARCH</p>
          <div className="flex items-center justify-between rounded border border-[#F2F2F2] bg-white px-1 py-1">
            <div className="flex items-center">
              <CiSearch />
              <input
                type="text"
                className="border-none bg-white px-2 py-2 text-sm outline-none"
                placeholder={searchMode === 'client' ? 'Search From' : 'Search Name'}
                value={searchMode === 'client' ? clientQuery : nameQuery}
                onChange={e =>
                  searchMode === 'client' ? setClientQuery(e.target.value) : setNameQuery(e.target.value)
                }
              />
            </div>
            <div>
              <button
                className={`ml-2 rounded px-3 py-2 text-xs font-semibold ${searchMode === 'client' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => setSearchMode('client')}
              >
                BY CLIENT#
              </button>
              <button
                className={`ml-1 rounded px-3 py-2 text-xs font-semibold ${searchMode === 'name' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                onClick={() => setSearchMode('name')}
              >
                BY NAME#
              </button>
            </div>
          </div>
        </div>
        {/* Date Pickers */}
        <div className="col-span-3 w-full">
          <label className="mb-1 text-[12px] font-medium text-[#A7A7A7]">FROM</label>
          <input
            type="date"
            className="w-full rounded border border-[#F2F2F2] px-2 py-3 text-sm text-[#969696]"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div className="col-span-3 w-full">
          <label className="mb-1 text-[12px] font-medium text-[#A7A7A7]">TO</label>
          <input
            type="date"
            className="w-full rounded border border-[#F2F2F2] px-2 py-3 text-sm text-[#969696]"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        {/* Search Button */}
        <div className="col-span-1 w-full">
          <button className="flex w-full items-center rounded bg-teal-600 px-3 py-[11px] text-white md:w-auto">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
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
                <svg
                  className="h-4 w-4 text-[#21ccb0] md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{form.fields.length} form sections</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <svg
                  className="h-4 w-4 text-[#21ccb0] md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-assisted completion available</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">Applicants: {form.totalApplicants}</span>
              <span className="text-gray-500">Created: {new Date(form.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-3 flex w-full flex-col items-center justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
              <button
                className="hover:bg-secondary w-full rounded bg-[#15A090] px-5 py-2 font-semibold text-white shadow focus:outline-none md:w-auto"
                onClick={() => handleCardClick(form)}
              >
                Start Application
              </button>
              {/* <button className="border-secondary text-secondary w-full rounded border bg-white px-5 py-2 font-semibold hover:bg-gray-50 focus:outline-none md:w-auto">
                Edit Structure
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
