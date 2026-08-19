/** Inline SVG placeholder image so mock mode never needs network access. */
export function mockImage(emoji: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="400" height="300" fill="hsl(${hue} 70% 55%)" />
    <text x="50%" y="50%" font-size="110" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
