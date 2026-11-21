import type { ReactElement } from 'react';
import type { TruckKind } from '../content/types';
import { SvgPic } from './Pic';
import { TruckArt } from './TruckArt';

/**
 * Built-in drawings of the trucks hidden under the mud (original flat artwork with ink outlines,
 * viewBox 360 x 480, covered by a 4 x 4 grid of tiles). The fire truck lives in TruckArt.tsx.
 * A Canva picture named src/assets/hero/truck-<kind>.webp replaces any of these (see the README there).
 */
const INK = '#1F2B47';
const SUN = '#FFC83D';

function Wheel({ cx, cy = 364, r = 22 }: { cx: number; cy?: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={INK} />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="#DADDE6" stroke={INK} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={3} fill={INK} />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" stroke={INK} strokeWidth={2.5}>
      <path d="M0 24 q-14 0 -14 -12 q0 -12 14 -12 q4 -12 18 -8 q12 -4 18 8 q14 0 14 12 q0 12 -14 12 z" />
    </g>
  );
}

function Road({ lane = SUN }: { lane?: string }) {
  return (
    <>
      <rect x={0} y={338} width={360} height={14} fill="#D9D3C7" stroke={INK} strokeWidth={3} />
      <rect x={0} y={352} width={360} height={140} fill="#4A5568" />
      <g fill={lane}>
        {[10, 70, 130, 190, 250, 310].map((x) => (
          <rect key={x} x={x} y={452} width={34} height={7} rx={3} />
        ))}
      </g>
    </>
  );
}

/** Cement mixer (xe trộn bê tông) at a building site with a crane. */
export function CementArt() {
  const stripes: ReactElement[] = [];
  for (let k = 0; k < 5; k++) {
    stripes.push(<path key={k} d={`M${28 + k * 26} -34 q16 34 0 68`} fill="none" stroke="#fff" strokeWidth={7} opacity={0.85} />);
  }
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={0} y={0} width={360} height={340} fill="url(#sky)" />
      <circle cx={300} cy={52} r={26} fill={SUN} stroke={INK} strokeWidth={3} />
      <Cloud x={40} y={44} />
      <Cloud x={170} y={92} s={0.8} />

      {/* building under construction */}
      <g>
        <rect x={20} y={168} width={150} height={172} fill="#CFC8BA" stroke={INK} strokeWidth={3} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={36 + c * 46} y={184 + r * 52} width={30} height={34} fill="#9AD3EA" stroke={INK} strokeWidth={2.5} />),
        )}
        <path d="M20 168 H170" stroke={INK} strokeWidth={5} />
      </g>
      {/* crane */}
      <g stroke={INK} strokeWidth={3} fill="none">
        <path d="M250 340 V96 M270 340 V96" />
        <path d="M250 130 L270 150 M250 170 L270 190 M250 210 L270 230 M250 250 L270 270 M250 290 L270 310" />
        <path d="M150 96 H340" strokeWidth={5} />
        <path d="M260 96 V70" />
        <path d="M120 96 L260 70 L340 96" />
        <path d="M314 96 V160" strokeWidth={2.5} />
      </g>
      <rect x={298} y={160} width={32} height={22} rx={3} fill="#E8523F" stroke={INK} strokeWidth={2.5} />
      <rect x={110} y={86} width={34} height={20} rx={3} fill="#7A8499" stroke={INK} strokeWidth={2.5} />

      <path d="M0 330 Q90 300 180 326 T360 322 L360 345 L0 345 Z" fill="#E7C98B" stroke={INK} strokeWidth={3} />
      <Road lane="#fff" />

      {/* chassis */}
      <rect x={26} y={312} width={206} height={34} rx={6} fill="#5B6478" stroke={INK} strokeWidth={3} />
      {/* drum: axis tilted up toward the cab */}
      <g transform="translate(46 306) rotate(-16)">
        <path d="M0 -12 L34 -36 H150 Q184 -36 184 0 Q184 36 150 36 H34 L0 12 Z" fill="#F28C28" stroke={INK} strokeWidth={3} />
        <clipPath id="drum-clip">
          <path d="M0 -12 L34 -36 H150 Q184 -36 184 0 Q184 36 150 36 H34 L0 12 Z" />
        </clipPath>
        <g clipPath="url(#drum-clip)">{stripes}</g>
        <path d="M0 -12 L34 -36 H150 Q184 -36 184 0 Q184 36 150 36 H34 L0 12 Z" fill="none" stroke={INK} strokeWidth={3} />
        <circle cx={172} cy={0} r={7} fill="#DADDE6" stroke={INK} strokeWidth={2.5} />
      </g>
      {/* chute at the back */}
      <path d="M18 330 L50 300 L66 312 L34 344 Z" fill="#A8B0C0" stroke={INK} strokeWidth={2.5} />
      <path d="M26 336 L56 308" stroke={INK} strokeWidth={2} />

      {/* cab */}
      <rect x={236} y={278} width={70} height={68} rx={12} fill="#F28C28" stroke={INK} strokeWidth={3} />
      <path d="M268 286 H296 Q302 286 303 293 L305 314 H268 Z" fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <rect x={244} y={288} width={20} height={26} rx={4} fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <rect x={244} y={322} width={12} height={4} rx={2} fill={INK} />
      <rect x={298} y={336} width={14} height={12} rx={3} fill="#A8B0C0" stroke={INK} strokeWidth={2.5} />
      <circle cx={303} cy={326} r={6} fill="#FFE59A" stroke={INK} strokeWidth={2.5} />
      <Wheel cx={64} />
      <Wheel cx={118} />
      <Wheel cx={270} />

      {/* sand and cones */}
      <path d="M296 440 L322 396 L348 440 Z" fill="#E7C98B" stroke={INK} strokeWidth={2.5} />
      <g stroke={INK} strokeWidth={2.5}>
        <path d="M34 438 L46 408 L58 438 Z" fill="#FF8A3D" />
        <path d="M30 440 H62" strokeWidth={4} />
      </g>
      <SvgPic emoji="🚧" x={150} y={410} size={44} />
    </g>
  );
}

/** Container truck (xe container) at a harbour with a gantry crane and stacked boxes. */
export function ContainerArt() {
  const ribs: ReactElement[] = [];
  for (let k = 0; k < 9; k++) ribs.push(<path key={k} d={`M${44 + k * 20} 244 V318`} stroke={INK} strokeWidth={2.5} opacity={0.35} />);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={0} y={0} width={360} height={340} fill="url(#sky)" />
      <circle cx={62} cy={48} r={24} fill={SUN} stroke={INK} strokeWidth={3} />
      <Cloud x={150} y={40} />
      <Cloud x={262} y={86} s={0.8} />

      {/* sea and ship */}
      <rect x={0} y={246} width={360} height={94} fill="#6FB6D8" stroke={INK} strokeWidth={3} />
      <path d="M0 262 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#fff" strokeWidth={3} opacity={0.8} />
      <path d="M180 246 L196 276 H340 L350 246 Z" fill="#5B6478" stroke={INK} strokeWidth={3} />
      <rect x={202} y={218} width={44} height={28} fill="#E8523F" stroke={INK} strokeWidth={2.5} />
      <rect x={246} y={218} width={44} height={28} fill="#3E7CC4" stroke={INK} strokeWidth={2.5} />
      <rect x={224} y={190} width={44} height={28} fill="#F2B632" stroke={INK} strokeWidth={2.5} />

      {/* gantry crane */}
      <g stroke={INK} strokeWidth={4} fill="none">
        <path d="M60 340 V120 M150 340 V120" />
        <path d="M40 120 H250" strokeWidth={6} />
        <path d="M60 120 L105 80 L150 120" strokeWidth={3} />
        <path d="M60 220 H150" strokeWidth={3} />
        <path d="M200 120 V160" strokeWidth={2.5} />
      </g>
      <rect x={184} y={158} width={32} height={20} rx={3} fill="#F2B632" stroke={INK} strokeWidth={2.5} />

      <Road lane="#fff" />

      {/* chassis and trailer */}
      <rect x={14} y={318} width={238} height={20} rx={5} fill="#5B6478" stroke={INK} strokeWidth={3} />
      <rect x={30} y={238} width={206} height={82} rx={6} fill="#3E7CC4" stroke={INK} strokeWidth={3} />
      {ribs}
      <rect x={30} y={238} width={206} height={82} rx={6} fill="none" stroke={INK} strokeWidth={3} />
      <rect x={196} y={250} width={30} height={60} rx={3} fill="#2F63A0" stroke={INK} strokeWidth={2.5} />
      <path d="M211 250 V310" stroke={INK} strokeWidth={2} />

      {/* cab */}
      <rect x={256} y={270} width={72} height={70} rx={12} fill="#E8523F" stroke={INK} strokeWidth={3} />
      <path d="M288 278 H316 Q322 278 323 285 L325 308 H288 Z" fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <rect x={264} y={280} width={20} height={28} rx={4} fill="#BFE4F2" stroke={INK} strokeWidth={2.5} />
      <rect x={316} y={332} width={14} height={12} rx={3} fill="#A8B0C0" stroke={INK} strokeWidth={2.5} />
      <circle cx={323} cy={320} r={6} fill="#FFE59A" stroke={INK} strokeWidth={2.5} />
      <Wheel cx={60} />
      <Wheel cx={112} />
      <Wheel cx={196} />
      <Wheel cx={292} />

      {/* stacked containers in the foreground */}
      <rect x={14} y={400} width={60} height={34} fill="#F2B632" stroke={INK} strokeWidth={2.5} />
      <rect x={74} y={400} width={60} height={34} fill="#3FA66B" stroke={INK} strokeWidth={2.5} />
      <rect x={44} y={366} width={60} height={34} fill="#E8523F" stroke={INK} strokeWidth={2.5} />
      <SvgPic emoji="📦" x={250} y={398} size={44} />
    </g>
  );
}

const ART: Partial<Record<TruckKind, () => ReactElement>> = {
  cement: CementArt,
  container: ContainerArt,
};

export function TruckArtFor({ kind }: { kind: TruckKind }) {
  const Art = ART[kind] ?? TruckArt;
  return <Art />;
}
