import { default as getEnv } from '@/lib/env';
import { toast } from 'react-toastify';

const uploadImageOnCloudinary = async file => {
  try {
    console.log('file', file);
    if (!file) return toast.error('Please select a file');
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const resourceType = isCSV ? 'raw' : 'image';
    const formData = new FormData();
    // 1. Get signature + timestamp from backend
    const url = `${getEnv('SERVER_URL')}/api/form/get-cloudinary-signature`;
    const result = await fetch(url, { method: 'GET', credentials: 'include' });
    const response = await result.json();
    if (response.success) {
      const { timestamp, signature, folder } = response.data;
      if (!timestamp || !signature || !folder) return toast.error('Something went wrong while uploading image');
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
    }
    // 2. Prepare form data
    formData.append('file', file);
    formData.append('api_key', getEnv('CLOUDINARY_CLIENT_KEY'));
    // 3. Upload to Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${getEnv('CLOUDINARY_CLIENT_NAME')}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!data?.secure_url || !data?.public_id || !data?.resource_type)
      return toast.error('Something went wrong while uploading image');
    console.log('data', data);
    return { secureUrl: data?.secure_url, publicId: data?.public_id, resourceType: data?.resource_type };
  } catch (error) {
    console.log('error while uploading image', error);
    return toast.error('Something went wrong while uploading image');
  }
};

const deleteImageFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return toast.error('Something went wrong while deleting image');
    const url = `${getEnv('SERVER_URL')}/api/form/delete-cloudinary-image`;
    const result = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ publicId, resourceType }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await result.json();
    if (response.success) {
      // toast.success('Image deleted successfully');
    }
    return true;
  } catch (error) {
    console.log('error while uploading image', error);
    toast.error('Something went wrong while deleting image');
    return false;
  }
};

export { uploadImageOnCloudinary, deleteImageFromCloudinary };
