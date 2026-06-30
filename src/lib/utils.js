import { uploadImageOnCloudinary } from "@/utils/cloudinary";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uploadFilesAndReplace = async (data) => {
  let updatedData = { ...data };
  const uploadPromises = Object.entries(data)
    .filter(([, value]) => value?.file instanceof File)
    .map(async ([key, value]) => {
      const result = await uploadImageOnCloudinary(value?.file);
      return { key, result };
    });
  const uploads = await Promise.all(uploadPromises);
  uploads.forEach(({ key, result }) => {
    updatedData[key] = result;
  });

  return updatedData;
};


