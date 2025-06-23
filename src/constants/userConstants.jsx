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
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  password: '',
};

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};
