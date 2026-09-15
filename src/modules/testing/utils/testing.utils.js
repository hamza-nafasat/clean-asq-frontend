export const getVerificationTableStyles = ({ textColor, secondaryColor, backgroundColor }) => ({
  table: {
    style: {
      border: '1px solid #ccc', // outer border
      borderRadius: '0.375rem', // rounded-md (6px)
      overflow: 'hidden', // ensure children respect border radius
    },
  },
  headCells: {
    style: {
      fontSize: '14px',
      fontWeight: 700,
      color: textColor || '#171717',
      backgroundColor: backgroundColor || 'transparent',
      borderBottom: '1px solid #ccc',
    },
  },
  rows: {
    style: {
      background: 'transparent',
      padding: '10px 0',
      margin: '0',
      borderBottom: '1px dashed #ccc',
    },
  },
  cells: {
    style: {
      color: textColor || '#7E7E7E',
      fontSize: '14px',
    },
  },
  pagination: {
    style: {
      color: textColor || '#171717',
      backgroundColor: backgroundColor || 'transparent',
      borderTop: '1px solid #ccc',
    },
    pageButtonsStyle: {
      color: textColor || '#066969',
      fill: `${textColor || '#066969'} !important`,
      '& svg': {
        fill: `${textColor || '#066969'} !important`,
      },
      '&:hover': {
        backgroundColor: secondaryColor,
      },
      '&:disabled': {
        color: '#ccc',
        fill: '#ccc !important',
      },
    },
  },
});
