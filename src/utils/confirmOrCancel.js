// confirm an ai change first
const confirmOrCancel = async (askConfirm, details) => {
  const isConfirmed = await askConfirm?.(details);
  if (!isConfirmed) throw Object.assign(new Error("The user cancelled this change"), { isCancelled: true });
};

export default confirmOrCancel;
