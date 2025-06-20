export const USER_TYPES = {
  ADMIN: 'admin',
  TEAM_MEMBER: 'team-mbr',
  CLIENT: 'client',
  CLIENT_MEMBER: 'client-mbr',
  SUPER_BANK: 'super-bank',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const INITIAL_USER_FORM = {
  name: '',

  businessName: '',
  email: '',
  password: '',
};

export const USER_TABLE_COLUMNS = [
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Account Type',
    selector: row => row.type,
    sortable: true,
    format: row => row.type.charAt(0).toUpperCase() + row.type.slice(1).replace('-', ' '),
  },
  {
    name: 'Business Name',
    selector: row => row.businessName || 'N/A',
    sortable: true,
    hide: row => !['client', 'client-mbr', 'super-bank'].includes(row.type),
  },
  {
    name: 'Email',
    selector: row => row.email,
    sortable: true,
  },
  // {
  //   name: 'Status',
  //   cell: row => {
  //     const status = row.status.toLowerCase();
  //     return (
  //       <div className="flex items-center gap-2">
  //         <span
  //           className={`${
  //             status === 'active'
  //               ? 'bg-[#34C7591A] text-[#34C759]'
  //               : status === 'inactive'
  //                 ? 'bg-[#FF3B301A] text-[#FF3B30]'
  //                 : ''
  //           } w-[85px] rounded-sm px-[10px] py-[3px] text-center font-bold capitalize`}
  //         >
  //           {row.status}
  //         </span>
  //       </div>
  //     );
  //   },
  //   sortable: true,
  //   format: row => row.status.charAt(0).toUpperCase() + row.status.slice(1),
  // },
  {
    name: 'Create Date',
    selector: row => row.createDate,
    sortable: true,
    format: row => new Date(row.createDate).toLocaleDateString(),
  },
];

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};
