import { default as getEnv } from '@/lib/env';
import { toast } from 'react-toastify';

const uploadImageOnCloudinary = async (file) => {
  try {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const fileName = file.name.toLowerCase();
    const mimeType = file.type;

    // ---- ALLOW LIST ----
    const imageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    const textExtensions = ['.csv', '.txt', '.rtf'];
    const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
    const isImage = imageMimeTypes.includes(mimeType);
    const isText =
      mimeType.startsWith('text/') ||
      textExtensions.some(ext => fileName.endsWith(ext));

    // ---- HARD REJECT ----
    const forbiddenExtensions = ['.doc', '.docx', '.xls', '.xlsx'];
    if (forbiddenExtensions.some(ext => fileName.endsWith(ext))) {
      toast.error('DOC and Excel files are not allowed');
      return;
    }

    if (!isImage && !isPdf && !isText) {
      toast.error('Unsupported file type');
      return;
    }

    // ---- CLOUDINARY RESOURCE TYPE ----
    const resourceType = isImage ? 'image' : 'raw';

    const formData = new FormData();

    // 1. Get signature
    const url = `${getEnv('SERVER_URL')}/api/form/get-cloudinary-signature`;
    const result = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const response = await result.json();
    if (!response?.success) {
      toast.error('Failed to get upload signature');
      return;
    }

    const { timestamp, signature, folder } = response.data;
    if (!timestamp || !signature || !folder) {
      toast.error('Invalid upload signature');
      return;
    }

    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('file', file);
    formData.append('api_key', getEnv('CLOUDINARY_CLIENT_KEY'));

    // 2. Upload
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${getEnv('CLOUDINARY_CLIENT_NAME')}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (!data?.secure_url || !data?.public_id) {
      toast.error('Upload failed');
      return;
    }

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    toast.error('Something went wrong while uploading');
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
