import { SvgPic } from './Pic';
/**
 * The picture hidden under the mud: a Vietnamese fire truck (xe cứu hỏa) with its ladder raised
 * to a burning building. Original artwork, drawn as flat shapes with ink outlines.
 * ViewBox is 360 x 480. The tiles in TruckScene cover it in a 4 x 4 grid of 90 x 120 cells.
 */

import type { ReactElement } from 'react';

const INK = '#1F2B47';
const RED = '#D9382B';
const RED_DARK = '#A82419';
const SUN = '#FFC83D';

function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C-12 -8 -8 -20 -2 -30 C0 -22 8 -20 8 -10 C8 -4 4 0 0 0 Z" fill="#FF7A1A" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M0 -2 C-5 -6 -3 -13 0 -17 C2 -12 5 -11 5 -7 C5 -4 3 -2 0 -2 Z" fill={SUN} />
    </g>
  );
}

function Window({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={32} rx={4} fill="#9AD3EA" stroke={INK} strokeWidth={2.5} />
      <path d={`M${x + 13} ${y} V${y + 32} M${x} ${y + 16} H${x + 26}`} stroke={INK} strokeWidth={1.8} />
    </g>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={364} r={22} fill={INK} />
      <circle cx={cx} cy={364} r={10} fill="#DADDE6" stroke={INK} strokeWidth={2.5} />
      <circle cx={cx} cy={364} r={3} fill={INK} />
    </g>
  );
}

export function TruckArt() {
  const windows: ReactElement[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) windows.push(<Window key={`${r}${c}`} x={236 + c * 38} y={100 + r * 46} />);

  return (
    <g id="truck-art" strokeLinejoin="round" strokeLinecap="round">
      {/* sky */}
      <rect x={0} y={0} width={360} height={340} fill="url(#sky)" />
      <circle cx={62} cy={58} r={36} fill="#FFE59A" opacity={0.6} />
      <circle cx={62} cy={58} r={26} fill={SUN} stroke={INK} strokeWidth={3} />
      <g fill="#fff" stroke={INK} strokeWidth={2.5}>
        <path d="M118 62 q-14 0 -14 -12 q0 -12 14 -12 q4 -12 18 -8 q12 -4 18 8 q14 0 14 12 q0 12 -14 12 z" />
        <path d="M268 40 q-10 0 -10 -9 q0 -9 10 -9 q3 -9 13 -6 q9 -3 13 6 q10 0 10 9 q0 9 -10 9 z" />
      </g>

      {/* far hills and tree */}
      <path d="M0 300 Q60 262 130 296 T260 290 T360 300 L360 345 L0 345 Z" fill="#8CCB9B" stroke={INK} strokeWidth={3} />
      <g>
        <rect x={32} y={282} width={9} height={40} fill="#8A5A36" stroke={INK} strokeWidth={2.5} />
        <circle cx={36} cy={268} r={22} fill="#4DA469" stroke={INK} strokeWidth={3} />
        <circle cx={20} cy={282} r={15} fill="#4DA469" stroke={INK} strokeWidth={3} />
        <circle cx={54} cy={284} r={15} fill="#5DB87A" stroke={INK} strokeWidth={3} />
      </g>

      {/* burning building */}
      <g>
        <rect x={222} y={84} width={124} height={256} rx={4} fill="#F4D58D" stroke={INK} strokeWidth={3} />
        <path d="M214 84 L284 48 L354 84 Z" fill="#C65B43" stroke={INK} strokeWidth={3} />
        {windows}
        <rect x={272} y={298} width={30} height={42} rx={4} fill="#8A5A36" stroke={INK} strokeWidth={2.5} />
        <circle cx={296} cy={320} r={2.5} fill={SUN} />
        <Flame x={287} y={132} s={1.15} />
        <Flame x={325} y={178} s={1.05} />
        <Flame x={328} y={86} s={1.2} />
        <g fill="#C9CED8" stroke={INK} strokeWidth={2.5}>
          <circle cx={318} cy={36} r={9} />
          <circle cx={330} cy={22} r={12} />
          <circle cx={346} cy={10} r={15} />
        </g>
      </g>

      {/* street */}
      <rect x={0} y={338} width={360} height={14} fill="#D9D3C7" stroke={INK} strokeWidth={3} />
      <rect x={0} y={352} width={360} height={140} fill="#4A5568" />
      <g fill={SUN}>
        {[10, 70, 130, 190, 250, 310].map((x) => (
          <rect key={x} x={x} y={452} width={34} height={7} rx={3} />
        ))}
      </g>
      {/* hydrant */}
      <g stroke={INK} strokeWidth={2.5}>
        <rect x={318} y={322} width={18} height={28} rx={4} fill={RED} />
        <rect x={314} y={316} width={26} height={10} rx={5} fill={RED_DARK} />
        <rect x={310} y={332} width={8} height={8} rx={2} fill={SUN} />
        <rect x={336} y={332} width={8} height={8} rx={2} fill={SUN} />
      </g>

      {/* ladder (behind the body, drawn first) */}
      <g transform="translate(66 296) rotate(-49.3)">
        <rect x={0} y={-8} width={262} height={4} fill={SUN} stroke={INK} strokeWidth={2} />
        <rect x={0} y={4} width={262} height={4} fill={SUN} stroke={INK} strokeWidth={2} />
        {Array.from({ length: 14 }, (_, k) => (
          <line key={k} x1={14 + k * 18} y1={-6} x2={14 + k * 18} y2={6} stroke={INK} strokeWidth={3} />
        ))}
      </g>

      {/* truck body */}
      <rect x={24} y={290} width={196} height={68} rx={8} fill={RED} stroke={INK} strokeWidth={3} />
      <rect x={24} y={322} width={196} height={9} fill="#fff" stroke={INK} strokeWidth={2} />
      <g fill={RED_DARK} stroke={INK} strokeWidth={2.5}>
        <rect x={38} y={297} width={50} height={20} rx={4} />
        <rect x={96} y={297} width={50} height={20} rx={4} />
        <rect x={154} y={297} width={50} height={20} rx={4} />
      </g>
      <g stroke={INK} strokeWidth={2.5}>
        <line x1={52} y1={307} x2={74} y2={307} />
        <line x1={110} y1={307} x2={132} y2={307} />
        <line x1={168} y1={307} x2={190} y2={307} />
      </g>
      <text x={186} y={349} textAnchor="middle" fontFamily="'Baloo 2', system-ui, sans-serif" fontWeight={800} fontSize={20} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">
        114
      </text>
      <rect x={50} y={282} width={30} height={10} rx={3} fill="#7A8499" stroke={INK} strokeWidth={2.5} />

      {/* cab */}
      <rect x={222} y={276} width={78} height={82} rx={12} fill={RED} stroke={INK} strokeWidth={3} />
      <path d="M262 284 H290 Q296 284 297 291 L299 312 H262 Z" fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <rect x={230} y={286} width={28} height={26} rx={4} fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <path d="M226 322 H296" stroke={INK} strokeWidth={2.5} />
      <rect x={240} y={326} width={12} height={4} rx={2} fill={INK} />
      <rect x={238} y={266} width={46} height={10} rx={5} fill="#E5E9F0" stroke={INK} strokeWidth={2.5} />
      <circle cx={248} cy={262} r={6} fill={RED} stroke={INK} strokeWidth={2.5} />
      <circle cx={274} cy={262} r={6} fill="#3B82F6" stroke={INK} strokeWidth={2.5} />
      <rect x={296} y={338} width={14} height={12} rx={3} fill="#A8B0C0" stroke={INK} strokeWidth={2.5} />
      <circle cx={298} cy={328} r={6} fill="#FFE59A" stroke={INK} strokeWidth={2.5} />

      <Wheel cx={64} />
      <Wheel cx={118} />
      <Wheel cx={262} />

      {/* water */}
      <path d="M240 96 Q260 70 282 106" fill="none" stroke="#6EC6F0" strokeWidth={6} />
      <path d="M240 96 Q260 70 282 106" fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="2 10" />
      <g fill="#6EC6F0" stroke={INK} strokeWidth={1.5}>
        <circle cx={292} cy={116} r={4} />
        <circle cx={300} cy={104} r={3} />
        <circle cx={284} cy={122} r={3} />
      </g>
      <rect x={232} y={90} width={12} height={10} rx={3} fill="#7A8499" stroke={INK} strokeWidth={2.5} transform="rotate(-49 238 95)" />

      {/* lower street details */}
      <g stroke={INK} strokeWidth={2.5}>
        <path d="M34 438 L46 408 L58 438 Z" fill="#FF8A3D" />
        <path d="M30 440 H62" strokeWidth={4} />
        <path d="M70 438 L82 408 L94 438 Z" fill="#FF8A3D" />
        <path d="M66 440 H98" strokeWidth={4} />
      </g>
      <SvgPic emoji="🐕" x={290} y={392} size={48} />
      <SvgPic emoji="🧯" x={196} y={404} size={30} />
    </g>
  );
}

export function SceneDefs() {
  return (
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9FD6EC" />
        <stop offset="1" stopColor="#E4F5FB" />
      </linearGradient>
    </defs>
  );
}
