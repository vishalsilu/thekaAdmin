import imageCompression from 'browser-image-compression';

/**
 * Compresses an array of image files concurrently using Web Workers.
 * 
 * @param {File[]} files - Array of File objects collected from an <input type="file" multiple />
 * @param {Object} [customOptions] - Optional configurations to override defaults
 * @returns {Promise<Blob[]>} A promise resolving to an array of compressed Blob objects
 */
export async function compressImagesBatch(files, customOptions = {}) {
  if (!files || files.length === 0) return [];

  // Default optimal configurations for fast, modern web compression
  const defaultOptions = {
    maxSizeMB: 1,            // Target file size (e.g., 1MB)
    maxWidthOrHeight: 1920,  // Max dimension bounds (scales proportionally)
    useWebWorker: true,      // Crucial: offloads processing to separate CPU threads
    fileType: 'image/jpeg',  // Forces JPEG output for best compression ratio
    ...customOptions
  };

  // Map each file to a concurrent execution thread
  const compressionPromises = files.map(async (file) => {
    try {
      // Skips processing if the file is already smaller than our threshold target
      if (file.size <= defaultOptions.maxSizeMB * 1024 * 1024) {
        return file; 
      }
      
      return await imageCompression(file, defaultOptions);
    } catch (error) {
      // Logs the specific failure but doesn't halt the entire batch execution
      console.error(`Failed to compress file: ${file.name}`, error);
      return null;
    }
  });

  // Execute all workers concurrently
  const results = await Promise.all(compressionPromises);

  // Preserve the original input order and fall back to the original file on failure
  return results.map((result, index) => result === null ? files[index] : result);
}