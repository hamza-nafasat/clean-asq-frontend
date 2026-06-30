import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import TextField from '../shared/small/TextField';

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
          placeholder="Search by Roles..."
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
    </div>
  );
};

ApplicantSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default ApplicantSearch;
