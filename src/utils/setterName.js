// "primaryColor" to "setPrimaryColor"
export const toSetterName = (key) => `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
