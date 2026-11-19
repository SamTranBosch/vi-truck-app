/**
 * Generates the teacher-voice clips with Zalo AI Text-to-Speech and writes
 * public/audio/<key>.mp3 + public/audio/manifest.json.
 *
 *   ZALO_API_KEY=xxxx npm run audio:gen                 # only clips that are missing
 *   ZALO_API_KEY=xxxx npm run audio:gen -- --force      # regenerate everything
 *   npm run audio:gen -- --dry                          # show what would be generated, no network
 *   options: --speaker 1 (1 = South female)  --speed 0.8
 *
 * NOT TESTED against the live API (no key / network in the build environment).
 * The request format follows Zalo's public docs (POST form, `apikey` header, JSON reply with a
 * download url); if Zalo changes it, only `synthesize()` below needs adjusting.
 * Do a listening bake-off first: run with --only "cá,cà" and --speaker 1,2,3 into different folders.
 */
import { mkdir, readdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { allClips } from './list-audio';

const OUT = join(process.cwd(), 'public', 'audio');
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const API = 'https://api.zalo.ai/v1/tts/synthesize';
const speaker = opt('speaker', '1');
const speed = opt('speed', '0.8');
const only = opt('only', '').split(',').map((s) => s.trim().normalize('NFC')).filter(Boolean);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const exists = (p: string) => access(p).then(() => true, () => false);

async function synthesize(text: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ input: text, speaker_id: speaker, speed, encode_type: '1' }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { error_code?: number; error_message?: string; data?: { url?: string } };
  if (json.error_code !== 0 || !json.data?.url) throw new Error(`Zalo error ${json.error_code}: ${json.error_message}`);
  // the audio file is produced asynchronously: poll the url for a few seconds
  for (let i = 0; i < 12; i++) {
    const a = await fetch(json.data.url);
    const type = a.headers.get('content-type') ?? '';
    if (a.ok && (type.includes('audio') || type.includes('octet'))) return Buffer.from(await a.arrayBuffer());
    await sleep(700);
  }
  throw new Error('audio url never became ready');
}

async function writeManifest(): Promise<number> {
  const files = (await readdir(OUT)).filter((f) => f.endsWith('.mp3'));
  const clips = files.map((f) => f.replace(/\.mp3$/, '')).sort();
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify({ clips }) + '\n');
  return clips.length;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let clips = allClips();
  if (only.length) clips = clips.filter((c) => only.includes(c.text.normalize('NFC')));
  const todo: typeof clips = [];
  for (const c of clips) if (flag('force') || !(await exists(join(OUT, `${c.key}.mp3`)))) todo.push(c);
  console.log(`${clips.length} clips total, ${todo.length} to generate (speaker ${speaker}, speed ${speed})`);
  if (flag('dry')) {
    todo.forEach((c) => console.log(`  ${c.key}  ${c.text}`));
    return;
  }
  const apiKey = process.env.ZALO_API_KEY;
  if (!apiKey) {
    console.error('Set ZALO_API_KEY first (or use --dry).');
    process.exit(1);
  }
  let failed = 0;
  for (const [i, c] of todo.entries()) {
    try {
      const mp3 = await synthesize(c.text, apiKey);
      await writeFile(join(OUT, `${c.key}.mp3`), mp3);
      console.log(`[${i + 1}/${todo.length}] ${c.text}`);
    } catch (e) {
      failed++;
      console.error(`[${i + 1}/${todo.length}] FAILED "${c.text}": ${(e as Error).message}`);
    }
    await sleep(350); // stay well under the rate limit
  }
  const n = await writeManifest();
  console.log(`manifest.json now lists ${n} clips${failed ? `; ${failed} failed, rerun to retry` : ''}`);
  if (failed) process.exit(2);
}

void main();
