'use client';

import { useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param path - The path where the file should be stored.
 * @param file - The file to upload.
 * @returns A promise that resolves with the download URL of the uploaded file.
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  const storage = useStorage();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
