/**
 * Bakes the teacher voice into public/audio/<voice set>/<key>.mp3 + <voice set>/manifest.json, and lists the sets in
 * public/audio/voices.json (the app lets the parent switch between them).
 *
 *   npm run audio:gen -- --provider vieneu --sets all            # every set of scripts/voice-sets.json (missing clips only)
 *   npm run audio:gen -- --provider vieneu --sets nam-thuc-doan-cau --force
 *       (the open-source model runs on this computer: pip install vieneu soundfile numpy, and ffmpeg)
 *   FPT_API_KEY=... npm run audio:gen -- --provider fpt --voice lannhi          # -> public/audio/fpt-lannhi/
 *   ZALO_API_KEY=... npm run audio:gen -- --provider zalo --voice 1 --force     # -> public/audio/zalo-1/
 *   npm run audio:gen -- --provider vieneu --dry                                # list, no network
 *
 * Listen first (FPT / Zalo): generate a few clips per voice into a folder (does NOT touch public/audio):
 *   FPT_API_KEY=... npm run audio:gen -- --samples --provider fpt --voices lannhi,linhsan --out voice-samples
 *
 * Options: --provider vieneu|fpt|zalo  --sets ID,ID|all  --voice ID  --speed N  --only "cá,cà"  --force  --dry
 * The same thing runs in GitHub Actions: Actions tab -> "Teacher voice" -> Run workflow.
 */
import { spawnSync } from 'node:child_process';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { allClips } from './list-audio';
import { DEFAULT_SPEED, DEFAULT_VOICE, KEY_ENV, SAMPLE_TEXTS, VOICES, synthesize, type Provider } from './lib/tts';
import { audioKey } from '../src/lib/audio';

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const exists = (p: string) => access(p).then(() => true, () => false);

const provider = opt('provider', 'fpt') as Provider;
if (provider !== 'fpt' && provider !== 'zalo' && provider !== 'vieneu') throw new Error(`--provider must be vieneu, fpt or zalo, got "${provider}"`);
const speed = opt('speed', DEFAULT_SPEED[provider]);
const ROOT = join(process.cwd(), 'public', 'audio');
/** Clips of one voice live in their own folder: public/audio/<voice set>/<key>.mp3 + manifest.json */
let OUT = ROOT;
const only = opt('only', '').split(',').map((s) => s.trim().normalize('NFC')).filter(Boolean);

interface SetDef {
  id: string;
  label: string;
  note?: string;
  voice: string;
  method: 'plain' | 'pad' | 'carrier';
  tempo: number;
  shortTempo?: number;
}
const REGISTRY = join(process.cwd(), 'scripts', 'voice-sets.json');
async function readRegistry(): Promise<{ default: string; sets: SetDef[] }> {
  return JSON.parse(await readFile(REGISTRY, 'utf8'));
}

/** VieNeu-TTS runs here, not behind a web API: one Python process makes all the clips (the model loads once). */
function runVieneu(jobs: { out: string; text: string }[], voice: string, def?: Pick<SetDef, 'method' | 'tempo' | 'shortTempo'>): number {
  const file = join(tmpdir(), `vieneu-jobs-${process.pid}.json`);
  writeFileSync(file, JSON.stringify(jobs));
  const extra = def
    ? ['--method', def.method, '--tempo', String(def.tempo), ...(def.shortTempo ? ['--short-tempo', String(def.shortTempo)] : [])]
    : ['--tempo', speed];
  const r = spawnSync(process.env.PYTHON ?? 'python3', [join(process.cwd(), 'scripts', 'vieneu_synth.py'), '--jobs', file, '--voice', voice, ...extra], {
    stdio: 'inherit',
  });
  return r.status ?? 1;
}

function requireKey(): string {
  if (provider === 'vieneu') return '';
  const k = process.env[KEY_ENV[provider]];
  if (!k) {
    console.error(`Set ${KEY_ENV[provider]} first (or use --dry).`);
    process.exit(1);
  }
  return k;
}

async function samples() {
  const apiKey = requireKey();
  let voices = opt('voices', DEFAULT_VOICE[provider]).split(',');
  const out = opt('out', 'voice-samples');
  if (provider === 'vieneu') {
    if (voices[0] === 'south-female') voices = VOICES.vieneu.map((v) => v.id);
    let bad = 0;
    for (const voice of voices) {
      const dir = join(out, `vieneu-${voice}`);
      await mkdir(dir, { recursive: true });
      bad += runVieneu(SAMPLE_TEXTS.map((text, i) => ({ text, out: join(dir, `${i + 1}-${audioKey(text)}.mp3`) })), voice) ? 1 : 0;
    }
    if (bad) process.exit(2);
    return;
  }
  for (const voice of voices) {
    const dir = join(out, `${provider}-${voice}`);
    await mkdir(dir, { recursive: true });
    for (const [i, text] of SAMPLE_TEXTS.entries()) {
      try {
        const mp3 = await synthesize(text, { provider, apiKey, voice, speed });
        await writeFile(join(dir, `${i + 1}-${audioKey(text)}.mp3`), mp3);
        console.log(`${provider}/${voice}: ${text}`);
      } catch (e) {
        console.error(`${provider}/${voice} FAILED "${text}": ${(e as Error).message}`);
      }
      await sleep(1000);
    }
  }
}

async function writeManifest(dir = OUT): Promise<number> {
  const clips = (await readdir(dir)).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, '')).sort();
  await writeFile(join(dir, 'manifest.json'), JSON.stringify({ clips }) + '\n');
  return clips.length;
}

/** public/audio/voices.json: the voice sets the app offers (those that have clips), labelled from the registry. */
async function writeVoicesIndex(): Promise<void> {
  const reg = await readRegistry();
  const have: string[] = [];
  for (const d of await readdir(ROOT, { withFileTypes: true })) {
    if (!d.isDirectory() || !(await exists(join(ROOT, d.name, 'manifest.json')))) continue;
    const m = JSON.parse(await readFile(join(ROOT, d.name, 'manifest.json'), 'utf8')) as { clips?: string[] };
    if (m.clips?.length) have.push(d.name);
  }
  const known = reg.sets.filter((s) => have.includes(s.id)).map((s) => ({ id: s.id, label: s.label, note: s.note }));
  const extra = have.filter((n) => !reg.sets.some((s) => s.id === n)).sort().map((n) => ({ id: n, label: n }));
  const sets = [...known, ...extra];
  const def = sets.some((s) => s.id === reg.default) ? reg.default : sets[0]?.id;
  await writeFile(join(ROOT, 'voices.json'), JSON.stringify({ default: def, sets }, null, 2) + '\n');
  console.log(`voices.json lists ${sets.length} voice set(s): ${sets.map((s) => s.id).join(', ')}`);
}

/** VieNeu-TTS voice sets from scripts/voice-sets.json: --sets all | id,id */
async function makeSets(): Promise<void> {
  const reg = await readRegistry();
  const wanted = opt('sets', 'all');
  const defs = wanted === 'all' ? reg.sets : wanted.split(',').map((id) => reg.sets.find((s) => s.id === id.trim()) ?? (() => { throw new Error(`unknown voice set "${id}"`); })());
  let bad = 0;
  for (const def of defs) {
    const dir = join(ROOT, def.id);
    let clips = allClips();
    if (only.length) clips = clips.filter((c) => only.includes(c.text.normalize('NFC')));
    const todo = [];
    for (const c of clips) if (flag('force') || !(await exists(join(dir, `${c.key}.mp3`)))) todo.push(c);
    console.log(`== ${def.id}: ${clips.length} clips, ${todo.length} to make (${def.voice}, ${def.method}, tempo ${def.tempo}/${def.shortTempo ?? def.tempo})`);
    if (flag('dry')) continue;
    await mkdir(dir, { recursive: true });
    if (todo.length && runVieneu(todo.map((c) => ({ text: c.text, out: join(dir, `${c.key}.mp3`) })), def.voice, def)) bad++;
    console.log(`${def.id}: manifest lists ${await writeManifest(dir)} clips`);
  }
  if (!flag('dry')) await writeVoicesIndex();
  if (bad) process.exit(2);
}

async function all() {
  if (provider === 'vieneu') return makeSets();
  OUT = join(ROOT, opt('set', `${provider}-${opt('voice', DEFAULT_VOICE[provider])}`));
  await mkdir(OUT, { recursive: true });
  let clips = allClips();
  if (only.length) clips = clips.filter((c) => only.includes(c.text.normalize('NFC')));
  const todo = [];
  for (const c of clips) if (flag('force') || !(await exists(join(OUT, `${c.key}.mp3`)))) todo.push(c);
  const voice = opt('voice', DEFAULT_VOICE[provider]);
  console.log(`${clips.length} clips total, ${todo.length} to generate (${provider}, voice ${voice}, speed ${speed})`);
  if (flag('dry')) {
    todo.forEach((c) => console.log(`  ${c.key}  ${c.text}`));
    return;
  }
  const apiKey = requireKey();
  let queue = todo;
  // a rate limit usually clears after a pause: retry what failed up to 3 more times, a minute apart
  let gaveUp = false;
  for (let round = 0; round < 4 && queue.length && !gaveUp; round++) {
    if (round > 0) {
      console.log(`Waiting 60 s, then retrying ${queue.length} clip(s) (round ${round + 1})`);
      await sleep(60000);
    }
    const failedNow: typeof todo = [];
    let inARow = 0;
    for (const [i, c] of queue.entries()) {
      if (inARow >= 4) {
        // the provider refuses everything (daily quota used up?): stop wasting time, keep what we have
        console.error('4 clips in a row failed: the provider is refusing requests. Stopping; run again later.');
        failedNow.push(...queue.slice(i));
        break;
      }
      try {
        await writeFile(join(OUT, `${c.key}.mp3`), await synthesize(c.text, { provider, apiKey, voice, speed }));
        console.log(`[${i + 1}/${queue.length}] ${c.text}`);
        inARow = 0;
      } catch (e) {
        inARow++;
        failedNow.push(c);
        console.error(`[${i + 1}/${queue.length}] FAILED "${c.text}": ${(e as Error).message}`);
      }
      await sleep(1000); // free tiers queue requests: stay slow and polite
    }
    gaveUp = inARow >= 4;
    queue = failedNow;
  }
  const failed = queue.length;
  const n = await writeManifest();
  await writeVoicesIndex();
  console.log(`manifest.json lists ${n} clips${failed ? `; ${failed} failed, rerun to retry` : ''}`);
  if (failed) process.exit(2);
}

void (flag('samples') ? samples() : all());
