export const getTableStyles = ({ textColor, secondaryColor }) => ({
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: 700,
      color: textColor || "#171717",
      backgroundColor: "#ffffff",
    },
  },
  rows: {
    style: {
      background: "transparent",
      padding: "10px 0",
      margin: "0",
      borderBottom: "1px dashed #ccc",
    },
  },
  cells: {
    style: {
      color: textColor || "#7E7E7E",
      fontSize: "14px",
    },
  },
  pagination: {
    style: {
      color: textColor || "#171717",
      backgroundColor: "#ffffff",
    },
    pageButtonsStyle: {
      color: textColor || "#066969",
      fill: `${textColor || "#066969"} !important`,
      "& svg": {
        fill: `${textColor || "#066969"} !important`,
      },
      "&:hover": {
        backgroundColor: secondaryColor,
      },
      "&:disabled": {
        color: "#ccc",
        fill: "#ccc !important",
      },
    },
  },
});

export const TABLE_WRAPPER_RADII = {
  MD: "calc(var(--radius) - 2px)",
  TOP_XL: "calc(var(--radius) + 4px) calc(var(--radius) + 4px) 0 0",
};
