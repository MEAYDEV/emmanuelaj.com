import * as THREE from "three";

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function shade(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  if (amount >= 0) c.lerp(new THREE.Color("#ffffff"), amount);
  else c.lerp(new THREE.Color("#000000"), -amount);
  return `#${c.getHexString()}`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Front cover: colored background, framed title + author. */
export function makeCoverTexture(title: string, author: string, color: string) {
  const canvas = makeCanvas(256, 340);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 340);
  ctx.fillStyle = shade(color, -0.25);
  ctx.fillRect(0, 0, 14, 340);

  ctx.strokeStyle = shade(color, 0.55);
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 26, 204, 288);

  ctx.fillStyle = "#f7f3e8";
  ctx.textAlign = "center";
  ctx.font = "bold 30px Georgia, serif";
  const lines = wrapText(ctx, title, 180);
  const startY = 120 - (lines.length - 1) * 18;
  lines.forEach((l, i) => ctx.fillText(l, 130, startY + i * 36));

  ctx.font = "20px Georgia, serif";
  ctx.fillStyle = shade(color, 0.65);
  ctx.fillText(author, 130, 280);

  return toTexture(canvas);
}

/** Book spine: vertical title. */
export function makeSpineTexture(title: string, color: string) {
  const canvas = makeCanvas(64, 340);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 340);
  ctx.fillStyle = shade(color, 0.25);
  ctx.fillRect(0, 6, 64, 4);
  ctx.fillRect(0, 330, 64, 4);

  ctx.save();
  ctx.translate(34, 170);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f7f3e8";
  ctx.font = "bold 22px Georgia, serif";
  const text = title.length > 26 ? `${title.slice(0, 24)}…` : title;
  ctx.fillText(text, 0, 8);
  ctx.restore();

  return toTexture(canvas);
}

/** Vinyl sleeve: genre-colored square with a record peeking out. */
export function makeSleeveTexture(title: string, genre: string, color: string) {
  const canvas = makeCanvas(340, 340);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 340, 340);

  // half-tone stripes
  ctx.fillStyle = shade(color, -0.12);
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(0, i * 48, 340, 18);
  }

  // record disc
  ctx.beginPath();
  ctx.arc(170, 150, 96, 0, Math.PI * 2);
  ctx.fillStyle = "#101014";
  ctx.fill();
  ctx.strokeStyle = "#2c2c34";
  ctx.lineWidth = 2;
  for (const r of [82, 68, 54]) {
    ctx.beginPath();
    ctx.arc(170, 150, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(170, 150, 30, 0, Math.PI * 2);
  ctx.fillStyle = shade(color, 0.3);
  ctx.fill();

  // label bar
  ctx.fillStyle = "rgba(12,12,16,0.82)";
  ctx.fillRect(0, 262, 340, 78);
  ctx.fillStyle = "#f7f3e8";
  ctx.textAlign = "center";
  ctx.font = "bold 34px 'DM Sans', sans-serif";
  ctx.fillText(title, 170, 298);
  ctx.font = "20px 'DM Sans', sans-serif";
  ctx.fillStyle = shade(color, 0.55);
  ctx.fillText(genre.toUpperCase(), 170, 326);

  return toTexture(canvas);
}

export const GENRE_COLORS: Record<string, string> = {
  Afrobeats: "#c97b4a",
  Trap: "#4a6d8c",
  Amapiano: "#5f7d5a",
  Miscellaneous: "#8c5a7a",
};
