import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';


const columns = () => [
  {
    name: 'User',
    selector: row => row?.updatedBy?.name,
    sortable: true,
  },

  {
    name: 'Action',
    selector: row => row?.originalSectionKey,
    sortable: true,
  },

  {
    name: 'Created At',
    selector: row => new Date(row?.createdAt || "").toLocaleDateString(),
    sortable: true,
  },
  {
    name: 'Updated At',
    selector: row => new Date(row?.createdAt || '').toLocaleDateString(),
    sortable: true,
  },


];

const History = ({ data }) => {
  const [submitData, setSubmitData] = useState([]);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });


  useEffect(() => {
    if (data?.submitData) {
      setSubmitData(Object.entries(data?.submitData).map(([key, value]) => {
        console.log('value is in history ', key);
        const updatedValue = {
          ...value, originalSectionKey: key,
        }
        return updatedValue;
      }));
    }
  }, [data]);

  return (
    <div>
      <DataTable
        data={submitData || []}
        columns={columns()}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        progressPending={false}
        noDataComponent="No History found"
        className="rounded-t-xl!"
      />
    </div>
  )
}

export { History };