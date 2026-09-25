import DataTable from "react-data-table-component";
import useBranding from "@/hooks/useBranding";
import { getTableStyles } from "@/utils/tableStyles";

// data table with the branding colors applied; branded={false} keeps the caller's own styles
const AppDataTable = ({ branded = true, customStyles, wrapperRadius, ...props }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const brandedStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const styles = branded ? brandedStyles : customStyles;
  const wrapperStyles = wrapperRadius
    ? { ...styles, responsiveWrapper: { style: { ...styles?.responsiveWrapper?.style, borderRadius: wrapperRadius } } }
    : styles;

  return <DataTable customStyles={wrapperStyles} {...props} />;
};

export default AppDataTable;
