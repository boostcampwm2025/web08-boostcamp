// Hex 색상의 밝기를 조절하는 헬퍼 함수
export function adjustColor(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (percent > 0) {
    // 밝게 (Tint)
    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));
  } else {
    // 어둡게 (Shade)
    const p = Math.abs(percent) / 100;
    r = Math.round(r * (1 - p));
    g = Math.round(g * (1 - p));
    b = Math.round(b * (1 - p));
  }

  const rr = Math.min(255, Math.max(0, r)).toString(16).padStart(2, '0');
  const gg = Math.min(255, Math.max(0, g)).toString(16).padStart(2, '0');
  const bb = Math.min(255, Math.max(0, b)).toString(16).padStart(2, '0');

  return `#${rr}${gg}${bb}`;
}
