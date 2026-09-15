import DataTable from "react-data-table-component";
import useBranding from "@/hooks/useBranding";
import { getTableStyles } from "@/utils/tableStyles";

// data table with the branding colours applied; branded={false} keeps the caller's own styles
const AppDataTable = ({ branded = true, customStyles, ...props }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const brandedStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  return <DataTable customStyles={branded ? brandedStyles : customStyles} {...props} />;
};

export default AppDataTable;
