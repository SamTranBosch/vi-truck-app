/**
 * Lists every sentence/word the app can speak, with the clip file name it expects.
 *   npm run audio:list            -> table to stdout
 *   npm run audio:list -- --json  -> JSON ({ text, key }[]) to stdout
 */
import { collectSpeech } from '../src/content/speech';
import { WORLD1 } from '../src/content/world1';
import { audioKey } from '../src/lib/audio';

export function allClips(): { text: string; key: string }[] {
  return collectSpeech(WORLD1).map((text) => ({ text, key: audioKey(text) }));
}

if (process.argv[1]?.endsWith('list-audio.ts')) {
  const clips = allClips();
  if (process.argv.includes('--json')) console.log(JSON.stringify(clips, null, 2));
  else {
    for (const c of clips) console.log(`${c.key.padEnd(24)} ${c.text}`);
    console.error(`\n${clips.length} clips`);
  }
}
