import DataTable from "react-data-table-component";
import useBranding from "@/hooks/useBranding";
import EmptyState from "./EmptyState";
import { getTableStyles } from "@/utils/tableStyles";

const DEFAULT_EMPTY_TITLE = "No data yet";

// data table with the branding colors applied; branded={false} keeps the caller's own styles
const AppDataTable = ({
  branded = true,
  customStyles,
  wrapperRadius,
  noDataComponent = DEFAULT_EMPTY_TITLE,
  emptyDescription = null,
  ...props
}) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const brandedStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const styles = branded ? brandedStyles : customStyles;
  const wrapperStyles = wrapperRadius
    ? { ...styles, responsiveWrapper: { style: { ...styles?.responsiveWrapper?.style, borderRadius: wrapperRadius } } }
    : styles;

  // text becomes the shared empty panel
  const emptyContent =
    typeof noDataComponent === "string" ? (
      <EmptyState variant="panel" title={noDataComponent} description={emptyDescription} className="m-4 border-0" />
    ) : (
      noDataComponent
    );

  return <DataTable customStyles={wrapperStyles} noDataComponent={emptyContent} {...props} />;
};

export default AppDataTable;
