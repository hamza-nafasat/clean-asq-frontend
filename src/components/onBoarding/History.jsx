import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import { useGetFormHistoryQuery } from '@/redux/apis/formApis';
import DataTable from 'react-data-table-component';


const columns = () => [
  {
    name: 'Date/Time',
    selector: row => new Date(row?.updatedAt || "").toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sortable: true,
    width: '200px',
  },
  {
    name: 'User',
    selector: row => `${row?.role} ${row?.email}`,
    sortable: true,
    width: '300px',
  },

  {
    name: 'Section',
    selector: row => row?.sectionKey,
    sortable: true,
    width: '200px',
  },
  {
    name: 'Action/Status',
    selector: (row) => row?.status,
    sortable: true,
    width: '200px',
  },
  {
    name: 'Comment/Details',
    selector: row => row?.comment,
    sortable: true,
    wrap: true,
  },



];

const History = ({ submittedFormId }) => {
  const { data: historyData } = useGetFormHistoryQuery({ formSubmittedId: submittedFormId }, { skip: !submittedFormId });
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  console.log(historyData);

  return (
    <div>
      <DataTable
        data={historyData?.data?.history || []}
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
