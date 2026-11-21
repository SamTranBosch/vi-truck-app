/**
 * Bakes the teacher voice into public/audio/<key>.mp3 + public/audio/manifest.json.
 *
 *   FPT_API_KEY=... npm run audio:gen -- --provider fpt --voice lannhi          # missing clips only
 *   ZALO_API_KEY=... npm run audio:gen -- --provider zalo --voice 1 --force     # regenerate all
 *   npm run audio:gen -- --provider vieneu --voice "Thục Đoan"                  # open-source model on this computer (pip install vieneu soundfile numpy, ffmpeg)
 *   npm run audio:gen -- --dry                                                  # list, no network
 *
 * Listen first: generate a few clips per voice into a folder (does NOT touch public/audio):
 *   FPT_API_KEY=... npm run audio:gen -- --samples --provider fpt --voices lannhi,linhsan --out voice-samples
 *
 * Options: --provider vieneu|fpt|zalo  --voice ID  --speed N  --only "cá,cà"  --force  --dry
 * The same thing runs in GitHub Actions: Actions tab -> "Teacher voice" -> Run workflow.
 */
import { spawnSync } from 'node:child_process';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
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
const OUT = join(process.cwd(), 'public', 'audio');
const only = opt('only', '').split(',').map((s) => s.trim().normalize('NFC')).filter(Boolean);

/** VieNeu-TTS runs here, not behind a web API: one Python process makes all the clips (the model loads once). */
function runVieneu(jobs: { out: string; text: string }[], voice: string): number {
  const file = join(tmpdir(), `vieneu-jobs-${process.pid}.json`);
  writeFileSync(file, JSON.stringify(jobs));
  const r = spawnSync(process.env.PYTHON ?? 'python3', [join(process.cwd(), 'scripts', 'vieneu_synth.py'), '--jobs', file, '--voice', voice, '--tempo', speed], {
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

async function writeManifest(): Promise<number> {
  const clips = (await readdir(OUT)).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, '')).sort();
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify({ clips }) + '\n');
  return clips.length;
}

async function all() {
  await mkdir(OUT, { recursive: true });
  let clips = allClips();
  if (only.length) clips = clips.filter((c) => only.includes(c.text.normalize('NFC')));
  const todo = [];
  for (const c of clips) if (flag('force') || !(await exists(join(OUT, `${c.key}.mp3`)))) todo.push(c);
  let voice = opt('voice', DEFAULT_VOICE[provider]);
  if (provider === 'vieneu' && voice === 'south-female') voice = DEFAULT_VOICE.vieneu;
  console.log(`${clips.length} clips total, ${todo.length} to generate (${provider}, voice ${voice}, speed ${speed})`);
  if (flag('dry')) {
    todo.forEach((c) => console.log(`  ${c.key}  ${c.text}`));
    return;
  }
  const apiKey = requireKey();
  if (provider === 'vieneu') {
    const code = todo.length ? runVieneu(todo.map((c) => ({ text: c.text, out: join(OUT, `${c.key}.mp3`) })), voice) : 0;
    const n = await writeManifest();
    console.log(`manifest.json lists ${n} clips${code ? '; some failed, rerun to retry' : ''}`);
    if (code) process.exit(2);
    return;
  }
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
  console.log(`manifest.json lists ${n} clips${failed ? `; ${failed} failed, rerun to retry` : ''}`);
  if (failed) process.exit(2);
}

void (flag('samples') ? samples() : all());
