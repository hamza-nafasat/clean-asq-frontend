import { useBranding } from '@/components/admin/brandings/globalBranding/BrandingContext';
import { Button } from '@/components/ui/button';
import { getTableStyles } from '@/data/data';
import { MoreVertical } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';

const Brandings = () => {
  const navigate = useNavigate();
  const actionMenuRefs = useRef(new Map());
  const [isLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const columns = () => [
    {
      name: 'Name',
      selector: row => 'First Branding',
      sortable: true,
    },
    {
      name: 'Url',
      selector: row => 'https://firstbranding.com',
      sortable: true,
    },
    {
      name: 'logo',
      selector: row => 'default',
      sortable: true,
    },
    {
      name: 'Font family',
      selector: row => 'Inter',
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
              onClick={() => setActionMenu(row._id)}
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </button>
            {actionMenu === row._id && (
              <div className="fixed z-10 mt-2 w-40 rounded border bg-white shadow-lg">
                <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">Edit</button>
                <button className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100">Delete</button>
              </div>
            )}
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
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    if (actionMenu !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenu]);

  return (
    <div>
      <div className="flex justify-end">
        <Button className={'cursor-pointer'} onClick={() => navigate('/branding/create')}>
          Create Branding
        </Button>
      </div>
      <DataTable
        data={[{ _id: 1 }]}
        columns={columns()}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={isLoading}
        noDataComponent="No Brandings Found"
      />
    </div>
  );
};

export default Brandings;
