import { PASSWORD_REQUIREMENTS, USER_TYPES } from '../constants/constants';

export const validatePassword = password => {
  const errors = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUserForm = formData => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.type) {
    errors.type = 'Account type is required';
  } else if (!Object.values(USER_TYPES).includes(formData.type)) {
    errors.type = 'Invalid account type';
  }

  // Validate business name for specific user types
  if (['client', 'client-mbr', 'super-bank'].includes(formData.type) && !formData.businessName?.trim()) {
    errors.businessName = 'Business name is required for this account type';
  }

  // Validate password for new users
  if (!formData.id && !formData.password) {
    errors.password = 'Password is required for new users';
  } else if (formData.password) {
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors;
    }
  }

  // Validate admin access for team members
  if (formData.type === USER_TYPES.TEAM_MEMBER && typeof formData.allowAdminAccess !== 'boolean') {
    errors.allowAdminAccess = 'Invalid admin access setting';
  }

  return errors;
};

export const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
