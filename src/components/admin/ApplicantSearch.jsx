import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import TextField from '../shared/small/TextField';

// Define client types
export const CLIENT_TYPES = {
  APPLICANT: 'applicant',
  CLIENT: 'client',
  CLIENT_MEMBER: 'client_mbr',
  TEAM_MEMBER: 'team_mbr',
  SUPER_BANK: 'super_bank',
};

// Export client labels
export const CLIENT_LABELS = {
  [CLIENT_TYPES.APPLICANT]: 'Applicant',
  [CLIENT_TYPES.CLIENT]: 'Client',
  [CLIENT_TYPES.CLIENT_MEMBER]: 'Client Member',
  [CLIENT_TYPES.TEAM_MEMBER]: 'Team Member',
  [CLIENT_TYPES.SUPER_BANK]: 'Super Bank',
};

const ApplicantSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleSearch = useCallback(
    e => {
      const value = e.target.value;
      setSearchTerm(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSelectedType('');
    onSearch('');
  }, [onSearch]);

  const handleTypeSelect = useCallback(
    type => {
      setSelectedType(type);
      setSearchTerm(type);
      onSearch(type);
    },
    [onSearch]
  );

  return (
    <div className="mb-4">
      {/* Search Input */}
      <div className="relative mb-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <TextField
          leftIcon={<Search />}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by client type..."
        />
        {(searchTerm || selectedType) && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <span className="text-sm">×</span>
          </button>
        )}
      </div>

      {/* Client Type Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.values(CLIENT_TYPES).map(value => (
          <button
            key={value}
            onClick={() => handleTypeSelect(value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${selectedType === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {CLIENT_LABELS[value]}
          </button>
        ))}
      </div>
    </div>
  );
};

ApplicantSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default ApplicantSearch;
