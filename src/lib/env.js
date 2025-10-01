const config = Object.freeze({
  SERVER_URL: import.meta.env.VITE_SERVER_URL,
  CLOUDINARY_CLIENT_KEY: import.meta.env.VITE_CLOUDINARY_CLIENT_KEY,
  CLOUDINARY_CLIENT_NAME: import.meta.env.VITE_CLOUDINARY_CLIENT_NAME,
});

const getEnv = key => {
  const value = config[key];
  if (!value) throw new Error(`Config ${key} not found`);
  return value;
};

export default getEnv;
