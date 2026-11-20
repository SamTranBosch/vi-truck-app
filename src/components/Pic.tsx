import { useMemo } from 'react';

/**
 * Pictures are Google Noto emoji (Apache-2.0, see NOTICE) bundled as SVG files, so every phone shows
 * the same cartoon style and nothing is fetched at run time. A picture is looked up by its emoji;
 * if a file is missing the plain emoji character is shown instead.
 */
const FILES = import.meta.glob('../assets/noto/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const BY_KEY = new Map<string, string>();
for (const [path, url] of Object.entries(FILES)) {
  const key = path.slice(path.lastIndexOf('/') + 1, -4);
  BY_KEY.set(key, url);
}

const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

/** Splits "🐰💨" into ["🐰", "💨"]. */
export function emojiParts(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment).filter((s) => s.trim());
  return Array.from(text);
}

export function emojiKey(emoji: string): string {
  return Array.from(emoji)
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-');
}

export function picUrl(emoji: string): string | undefined {
  return BY_KEY.get(emojiKey(emoji));
}

interface Props {
  emoji: string;
  className?: string;
}

/** One or more pictures side by side (stories use pairs such as 🐰💨). Decorative: the word next to it carries the meaning. */
export function Pic({ emoji, className = '' }: Props) {
  const parts = useMemo(() => emojiParts(emoji), [emoji]);
  return (
    <span className={`pic pic-n${parts.length} ${className}`} aria-hidden="true">
      {parts.map((p, i) => {
        const url = picUrl(p);
        return url ? <img key={i} src={url} alt="" draggable={false} /> : <span key={i} className="pic-text">{p}</span>;
      })}
    </span>
  );
}

/** Text that may be a picture: lesson labels are either letters ("a c") or an emoji ("📖"). */
export function Glyph({ text, className = '' }: { text: string; className?: string }) {
  const parts = emojiParts(text);
  const allPics = parts.length > 0 && parts.every((p) => picUrl(p));
  return allPics ? <Pic emoji={text} className={className} /> : <span className={className}>{text}</span>;
}

/** A picture drawn inside an SVG scene (the truck and its mud tiles). x is the picture's centre. */
export function SvgPic({ emoji, x, y, size, className, opacity }: { emoji: string; x: number; y: number; size: number; className?: string; opacity?: number }) {
  const parts = emojiParts(emoji);
  const left = x - (size * parts.length) / 2;
  return (
    <g className={className} opacity={opacity}>
      {parts.map((p, i) => {
        const url = picUrl(p);
        const px = left + i * size;
        return url ? <image key={i} href={url} x={px} y={y} width={size} height={size} /> : <text key={i} x={px + size / 2} y={y + size * 0.8} textAnchor="middle" fontSize={size * 0.8}>{p}</text>;
      })}
    </g>
  );
}
