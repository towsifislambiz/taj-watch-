/**
 * TAJ WATCH - Ultra-Fast Client-Side WebP Converter & Image Compressor
 * Converts any image (JPEG, PNG, HEIC, BMP) to highly optimized WebP format
 * ensuring the storefront loads with blazing speed and never slows down.
 */

export function convertFileToWebP(file, maxWidth = 1000, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Measure original size
    const originalSizeBytes = file.size;
    const originalSizeKB = Math.round(originalSizeBytes / 1024);

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        // Calculate aspect-ratio-preserving dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Create high-performance offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          return reject(new Error('Canvas context could not be created'));
        }

        // Draw image with smooth bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP format
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          
          // Estimate WebP size in KB
          const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(',') + 1);
          const webpSizeBytes = Math.round((base64Length * 3) / 4);
          const webpSizeKB = Math.round(webpSizeBytes / 1024);

          const savedPercent = originalSizeKB > 0
            ? Math.max(0, Math.round(((originalSizeKB - webpSizeKB) / originalSizeKB) * 100))
            : 0;

          resolve({
            success: true,
            webpDataUrl,
            width,
            height,
            originalSizeKB,
            webpSizeKB,
            savedPercent,
            format: 'image/webp',
          });
        } catch (canvasErr) {
          // Fallback if browser doesn't support WebP export (e.g. very old Safari)
          const fallbackDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            success: true,
            webpDataUrl: fallbackDataUrl,
            width,
            height,
            originalSizeKB,
            webpSizeKB: originalSizeKB,
            savedPercent: 0,
            format: 'image/jpeg',
          });
        }
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image file into Image element'));
      };

      img.src = readerEvent.target.result;
    };

    reader.onerror = (err) => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
