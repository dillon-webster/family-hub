/**
 * The steaming bowl. Original glyph in the design system's 2px line language —
 * the one piece of brand art in the product.
 */
export function BrandMark({ size = 24, color = '#FFF8F2' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z" />
      <path d="M9 6c0-1 1-1.4 1-2.4" />
      <path d="M13 6c0-1 1-1.4 1-2.4" />
    </svg>
  );
}
