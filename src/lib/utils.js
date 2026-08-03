import { uploadImageOnCloudinary } from "@/utils/cloudinary";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uploadFilesAndReplace = async (data) => {
  let updatedData = { ...data };
  const uploadPromises = Object.entries(data)
    // Support both nested { value: { file } } and accidental { file } shapes
    .filter(([, value]) => value?.file instanceof File || value?.value?.file instanceof File)
    .map(async ([key, value]) => {
      const file = value?.value?.file instanceof File ? value.value.file : value.file;
      const fieldName = value?.name || key;
      const result = await uploadImageOnCloudinary(file);
      return { key, fieldName, result };
    });
  const uploads = await Promise.all(uploadPromises);
  // Keep canonical { name, value } so hydrate can read .value.secureUrl on reopen
  uploads.forEach(({ key, fieldName, result }) => {
    updatedData[key] = { name: fieldName, value: result };
  });

  return updatedData;
};


