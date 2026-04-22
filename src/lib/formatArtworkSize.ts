/**
 * Display artwork dimensions with explicit inches units, e.g. `25*28` → `25 inches * 28 inches`.
 * Values stored with cm/mm are left unchanged.
 */
export function formatArtworkSizeDisplay(raw: string): string {
  const s = (raw || '').trim();
  if (!s) return '';

  if (/\b(cm|mm)\b/i.test(s)) {
    return s;
  }

  const normalized = s.replace(/\s+/g, ' ');

  const alreadyDual = normalized.match(
    /^(\d+(?:\.\d+)?)\s+inches\s*\*\s*(\d+(?:\.\d+)?)\s+inches$/i
  );
  if (alreadyDual) {
    return `${alreadyDual[1]} inches * ${alreadyDual[2]} inches`;
  }

  const pair = normalized.match(
    /^(\d+(?:\.\d+)?)\s*[\*xX×]\s*(\d+(?:\.\d+)?)(?:\s*(?:inches|incheses?|in))?$/i
  );
  if (pair) {
    return `${pair[1]} inches * ${pair[2]} inches`;
  }

  const nums = normalized.match(/\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    return `${nums[0]} inches * ${nums[1]} inches`;
  }
  if (nums && nums.length === 1) {
    return `${nums[0]} inches`;
  }

  return s;
}
