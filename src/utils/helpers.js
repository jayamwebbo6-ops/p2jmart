import { useRef, useState, useEffect } from 'react';

/**
 * Compresses an image file, checks its size, and converts it to WebP format.
 * @param {File} file - The file object from file input.
 * @param {number} maxSizeBytes - Maximum allowed size in bytes (defaults to 1MB).
 * @returns {Promise<string>} - Resolves to base64 WebP string.
 */
export const compressAndConvertToWebP = (file, maxSizeBytes = 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    // Check initial file size
    if (file.size > maxSizeBytes) {
      return reject(new Error('Image size cannot exceed 1MB'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set dimensions to original image dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Convert to webp with 0.85 quality compression
        const webpBase64 = canvas.toDataURL('image/webp', 0.85);
        resolve(webpBase64);
      };
      img.onerror = () => {
        reject(new Error('Failed to parse selected image. Please try another image file.'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read selected image file.'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Custom hook that defers rendering of a section until it's near the viewport.
 * Uses IntersectionObserver to detect when the placeholder scrolls into view.
 * Once visible, it stays rendered permanently (one-time trigger).
 * 
 * @param {string} rootMargin - How far before the viewport to start rendering (default '200px').
 * @returns {[React.RefObject, boolean]} - [ref to attach to wrapper, whether section is visible]
 */

export const useLazySection = (rootMargin = '200px') => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing after first intersection
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isVisible];
};
