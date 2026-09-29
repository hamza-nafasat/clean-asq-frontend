export const buildUpdatedBy = (user) => ({
  _id: user?._id,
  email: user?.email,
  name: user?.firstName + " " + user?.lastName,
  role: user?.role?.name,
});

// keep the first createdAt of a section; keepOwn also trusts the incoming value
export const resolveCreatedAt = (ownCreatedAt, oldCreatedAt, { keepOwn = false } = {}) => {
  if (!ownCreatedAt && !oldCreatedAt) return new Date().toISOString();
  if (oldCreatedAt) return oldCreatedAt;
  if (keepOwn && ownCreatedAt) return ownCreatedAt;
  return new Date().toISOString();
};
