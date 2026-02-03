import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';


const columns = () => [
  // {
  //   name: 'User',
  //   selector: row => row?.updatedBy?.name,
  //   sortable: true,
  // },
  {
    name: 'Date/Time',
    selector: row => new Date(row?.updatedAt || "").toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sortable: true,
  },
  {
    name: 'User',
    selector: row => `${row?.updatedBy?.role} ${row?.updatedBy?.email}`,
    sortable: true,
  },

  {
    name: 'Section',
    selector: row => row?.originalSectionKey,
    sortable: true,
  },
  {
    name: 'Action/Status',
    selector: () => "Completed",
    sortable: true,
  },
  {
    name: 'Comment/Details',
    selector: () => "",
    sortable: true,
  },



];

const History = ({ data }) => {
  const [submitData, setSubmitData] = useState([]);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });


  useEffect(() => {
    if (data?.submitData) {
      const gatedSubmitData = Object.entries(data?.submitData).map(([key, value]) => {
        if (key === 'company_lookup_data') return null;
        const updatedValue = {
          ...value, originalSectionKey: key,
        }
        return updatedValue;
      });

      setSubmitData(gatedSubmitData?.filter(item => item !== null));
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