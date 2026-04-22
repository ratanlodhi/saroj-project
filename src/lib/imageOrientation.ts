export type Orientation = 'horizontal' | 'square' | 'vertical';

/**
 * Infer landscape / square / portrait from pixel dimensions.
 * This is used for artwork metadata and image layout purposes.
 */
export function detectOrientationFromUrl(imageUrl: string): Promise<Orientation> {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve('horizontal');
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.1) resolve('horizontal');
      else if (ratio < 0.9) resolve('vertical');
      else resolve('square');
    };
    img.onerror = () => resolve('horizontal');
    img.src = imageUrl;
  });
}
