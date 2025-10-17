export const getTableStyles = ({ primaryColor, textColor, secondaryColor, backgroundColor }) => ({
  headCells: {
    style: {
      fontSize: '14px',
      fontWeight: 700,
      color: textColor || '#171717',
      backgroundColor: backgroundColor || 'transparent',
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
    },
    pageButtonsStyle: {
      color: textColor || '#066969',
      fill: `${textColor || '#066969'} !important`, // Force fill for SVG
      '& svg': {
        fill: `${textColor || '#066969'} !important`, // Target the arrow SVG specifically
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
export const getVerificationTableStyles = ({ primaryColor, textColor, secondaryColor, backgroundColor }) => ({
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

export const bankForms = [
  {
    formType: 'Account Opening Form',
    fields: [
      'Full Name',
      'Date of Birth',
      'Gender',
      'Nationality',
      'Marital Status',
      'Permanent Address',
      'Current Address',
      'Mobile Number',
      'Email ID',
      'PAN Card Number',
      'Aadhaar Number',
      'Passport/Driving License Number',
      'Account Type',
      'Mode of Operation',
      'Initial Deposit Amount',
      'Nominee Details',
      'Occupation',
      'Employer Name',
      'Annual Income',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Loan Application Form',
    fields: [
      'Full Name',
      'DOB',
      'Contact Details',
      'Residential Address',
      'PAN/Aadhaar',
      'Loan Type',
      'Loan Amount',
      'Loan Tenure',
      'Loan Purpose',
      'Occupation',
      'Employer/Business',
      'Monthly Income',
      'Existing Loans',
      'Collateral Details',
      'Consent to Credit Check',
    ],
    status: 'Draft',
    createdAt: '2024-05-20T14:30:00Z',
    totalApplicants: 17,
  },

  {
    formType: 'Cheque Book Request ',
    fields: [
      'Account Holder Name',
      'Account Number',
      'Branch Name',
      'Number of Cheque Books',
      'Leaves per Book',
      'Signature',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'KYC Update Form',
    fields: [
      'Full Name',
      'Account Number',
      'PAN Number',
      'Aadhaar Number',
      'New Address',
      'New Phone',
      'New Email',
      'Address Proof',
      'Identity Proof',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Fixed Deposit Opening ',
    fields: [
      'Full Name',
      'Linked Account Number',
      'PAN Number',
      'Contact Details',
      'Deposit Amount',
      'Tenure',
      'Interest Payout Option',
      'Payment Mode',
      'Maturity Instructions',
      'Nominee Name',
      'Nominee Relationship',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Recurring Deposit ',
    fields: [
      'Full Name',
      'Account Number',
      'Contact Details',
      'Monthly Installment',
      'Tenure',
      'Debit Account',
      'Nominee Name',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'ATM Card Block Request ',
    fields: [
      'Account Holder Name',
      'Account Number',
      'Mobile Number',
      'ATM Card Number',
      'Reason for Blocking',
      'Block Instruction',
      'Signature',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Change of Address Form',
    fields: [
      'Account Holder Name',
      'Account Number',
      'Old Address',
      'New Address',
      'Proof of New Address',
      'Document Number',
      'Signature',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Standing Instruction Form',
    fields: [
      'Full Name',
      'Account Number',
      'Start Date',
      'Frequency',
      'Amount',
      'Payee Account Details',
      'Purpose',
      'End Date or Ongoing',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Internet Banking Application Form',
    fields: [
      'Full Name',
      'Account Number',
      'Mobile Number',
      'Email ID',
      'Access Type',
      'Linked Accounts',
      'Agreement to Terms',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Mobile Banking Application Form',
    fields: ['Account Number', 'Full Name', 'Mobile Number', 'Device Type', 'App Permissions', 'Agreement to Terms'],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
  {
    formType: 'Bank Guarantee / Letter of Credit Application',
    fields: [
      'Company Name',
      'Contact Person',
      'Address',
      'PAN/GSTIN',
      'Beneficiary Name',
      'Guarantee Amount',
      'Validity',
      'Guarantee Type',
      'Collateral Type',
      'Declaration Agreement',
    ],
    status: 'Active',
    createdAt: '2024-06-01T10:00:00Z',
    totalApplicants: 42,
  },
];

export const SystemContext = {
  title: 'System Context',
  section: 'Section 1',
  subtitle: 'Sets the role and expertise for Perplexity AI',
  textarea:
    'This section provides detailed guidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const ExtractionTask = {
  title: 'Extraction Task',
  section: 'Section 2',
  subtitle: 'Main instruction and company context',
  textarea:
    'This section provides detailed guidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const OutputFormat = {
  title: 'Output Format',
  section: 'Section 3',
  subtitle: 'JSON structure and field specifications',
  textarea:
    'This section provides detailed guidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const ExtractionGuidelines = {
  title: 'Extraction Guidelines',
  section: 'Section 4',
  subtitle: 'Rules and standards for data extraction',
  textarea:
    'This section provides detailed section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profiguidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const SearchResultsHeader = {
  title: 'Search Results Header',
  section: 'Section 5',
  subtitle: 'Introduction to the search evidence section',
  textarea:
    'This section provides detailed guidance on handling section provides detailed guidance on handling user accounts. Administrators can add new users, update theirsection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profi profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profi user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const ClosingInstruction = {
  title: 'Closing Instruction',
  section: 'Section 1',
  subtitle: 'Final directive for JSON output',
  textarea:
    'This section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};
export const CompleteExtractionPrompt = {
  title: 'Complete Extraction Prompt',
  // section: 'Section 1',
  subtitle:
    'This is the complete prompt that will be sent to OpenAI for data extraction (all sections with dynamic content resolved)',
  textarea:
    'This section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. AdministratorsThis section provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profisection provides detailed guidance on handling user accounts. Administrators can add new users, update their profile information, and assign specific roles. It also includes advanced permission settings that define what each role is allowed to do, ensuring the platform remains secure and well-structured. Additionally, it supports bulk actions for importing and exporting user data, making it easier to manage larger teams without repetitive manual input.',
};

export const draftData = [
  {
    _id: 'form_1',
    name: 'Employee Application Form',
    branding: {
      // selectedLogo: 'https://example.com/logo1.png',
      colors: {
        primary: '#1E90FF',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Personal Details' },
      { id: 'sec2', title: 'Experience' },
    ],
    locationTitle: 'Office Location',
    locationSubtitle: 'HQ - Building 1',
    locationStatus: 'Active',
    locationMessage: 'This form is for main office applicants only.',
    formatedLocationMessage: '<p>Main office applicants only</p>',
    formateTextInstructions: 'Use <b>HTML</b> tags for formatting',
    createdAt: '2025-10-17T08:30:00Z',
  },
  {
    _id: 'form_2',
    name: 'Customer Feedback Form',
    branding: {
      // selectedLogo: 'https://example.com/logo2.png',
      colors: {
        primary: '#00B894',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Feedback Questions' },
      { id: 'sec2', title: 'Ratings' },
      { id: 'sec3', title: 'Suggestions' },
    ],
    locationTitle: 'Branch Office',
    locationSubtitle: 'Lahore',
    locationStatus: 'Inactive',
    locationMessage: 'This form is temporarily disabled.',
    formatedLocationMessage: '<p>Form disabled temporarily.</p>',
    formateTextInstructions: 'Use simple HTML tags only.',
    createdAt: '2025-09-20T10:15:00Z',
  },
  {
    _id: 'form_3',
    name: 'Partner Registration Form',
    branding: {
      // selectedLogo: 'https://example.com/logo3.png',
      colors: {
        primary: '#E17055',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [{ id: 'sec1', title: 'Company Info' }],
    locationTitle: 'Remote',
    locationSubtitle: 'Online Only',
    locationStatus: 'Active',
    locationMessage: 'Available for online registration.',
    formatedLocationMessage: '<p>Online registration only.</p>',
    formateTextInstructions: 'Use paragraph tags only.',
    createdAt: '2025-10-01T15:45:00Z',
  },
];
export const submissionData = [
  {
    _id: 'form_1',
    name: 'Employee Application Form',
    branding: {
      // selectedLogo: 'https://example.com/logo1.png',
      colors: {
        primary: '#1E90FF',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Personal Details' },
      { id: 'sec2', title: 'Experience' },
    ],
    locationTitle: 'Office Location',
    locationSubtitle: 'HQ - Building 1',
    locationStatus: 'Active',
    locationMessage: 'This form is for main office applicants only.',
    formatedLocationMessage: '<p>Main office applicants only</p>',
    formateTextInstructions: 'Use <b>HTML</b> tags for formatting',
    createdAt: '2025-10-17T08:30:00Z',
  },
  {
    _id: 'form_1',
    name: 'Employee Application Form',
    branding: {
      // selectedLogo: 'https://example.com/logo1.png',
      colors: {
        primary: '#1E90FF',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Personal Details' },
      { id: 'sec2', title: 'Experience' },
    ],
    locationTitle: 'Office Location',
    locationSubtitle: 'HQ - Building 1',
    locationStatus: 'Active',
    locationMessage: 'This form is for main office applicants only.',
    formatedLocationMessage: '<p>Main office applicants only</p>',
    formateTextInstructions: 'Use <b>HTML</b> tags for formatting',
    createdAt: '2025-10-17T08:30:00Z',
  },
  {
    _id: 'form_1',
    name: 'Employee Application Form',
    branding: {
      // selectedLogo: 'https://example.com/logo1.png',
      colors: {
        primary: '#1E90FF',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Personal Details' },
      { id: 'sec2', title: 'Experience' },
    ],
    locationTitle: 'Office Location',
    locationSubtitle: 'HQ - Building 1',
    locationStatus: 'Active',
    locationMessage: 'This form is for main office applicants only.',
    formatedLocationMessage: '<p>Main office applicants only</p>',
    formateTextInstructions: 'Use <b>HTML</b> tags for formatting',
    createdAt: '2025-10-17T08:30:00Z',
  },
  {
    _id: 'form_2',
    name: 'Customer Feedback Form',
    branding: {
      // selectedLogo: 'https://example.com/logo2.png',
      colors: {
        primary: '#00B894',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [
      { id: 'sec1', title: 'Feedback Questions' },
      { id: 'sec2', title: 'Ratings' },
      { id: 'sec3', title: 'Suggestions' },
    ],
    locationTitle: 'Branch Office',
    locationSubtitle: 'Lahore',
    locationStatus: 'Inactive',
    locationMessage: 'This form is temporarily disabled.',
    formatedLocationMessage: '<p>Form disabled temporarily.</p>',
    formateTextInstructions: 'Use simple HTML tags only.',
    createdAt: '2025-09-20T10:15:00Z',
  },
  {
    _id: 'form_3',
    name: 'Partner Registration Form',
    branding: {
      // selectedLogo: 'https://example.com/logo3.png',
      colors: {
        primary: '#E17055',
        buttonTextPrimary: '#FFFFFF',
      },
    },
    sections: [{ id: 'sec1', title: 'Company Info' }],
    locationTitle: 'Remote',
    locationSubtitle: 'Online Only',
    locationStatus: 'Active',
    locationMessage: 'Available for online registration.',
    formatedLocationMessage: '<p>Online registration only.</p>',
    formateTextInstructions: 'Use paragraph tags only.',
    createdAt: '2025-10-01T15:45:00Z',
  },
];
