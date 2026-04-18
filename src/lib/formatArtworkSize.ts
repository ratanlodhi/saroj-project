/**
 * Display artwork dimensions with explicit inch units, e.g. `25*28` → `25 inch * 28 inch`.
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
    /^(\d+(?:\.\d+)?)\s+inch\s*\*\s*(\d+(?:\.\d+)?)\s+inch$/i
  );
  if (alreadyDual) {
    return `${alreadyDual[1]} inch * ${alreadyDual[2]} inch`;
  }

  const pair = normalized.match(
    /^(\d+(?:\.\d+)?)\s*[\*xX×]\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches?|in))?$/i
  );
  if (pair) {
    return `${pair[1]} inch * ${pair[2]} inch`;
  }

  const nums = normalized.match(/\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    return `${nums[0]} inch * ${nums[1]} inch`;
  }
  if (nums && nums.length === 1) {
    return `${nums[0]} inch`;
  }

  return s;
}
