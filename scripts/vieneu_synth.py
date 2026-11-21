#!/usr/bin/env python3
"""Reads a job list and writes mp3 files with VieNeu-TTS (open source, runs on the CPU, no API key).

  python3 scripts/vieneu_synth.py --jobs jobs.json --voice "Thục Đoan" --tempo 0.9

jobs.json: [{"out": "public/audio/<key>.mp3", "text": "cá"}, ...]
Needs: pip install vieneu soundfile numpy, and ffmpeg. Exit code 2 when some clips failed (the others are kept).
The model (a few hundred MB) is downloaded from Hugging Face on the first run.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time

ap = argparse.ArgumentParser()
ap.add_argument("--jobs", required=True)
ap.add_argument("--voice", default="Thục Đoan")
ap.add_argument("--tempo", type=float, default=0.9, help="1.0 = as generated; below 1 = slower, same pitch (good for a 5-year-old)")
args = ap.parse_args()

jobs = json.load(open(args.jobs, encoding="utf8"))

from vieneu import Vieneu  # noqa: E402  (slow import, after argument parsing)
import soundfile as sf  # noqa: E402

tts = Vieneu()
names = [v for _, v in tts.list_preset_voices()]
print(f"{len(names)} preset voices: {', '.join(names)}", flush=True)
if args.voice not in names:
    print(f"Voice '{args.voice}' not found.", file=sys.stderr)
    sys.exit(1)

# trim silence at both ends, slow down a little, small mp3
tempo = max(0.5, min(args.tempo, 1.5))
trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05"
chain = f"{trim},areverse,{trim},areverse,atempo={tempo}"

failed = 0
for i, job in enumerate(jobs, 1):
    text, out = job["text"], job["out"]
    try:
        started = time.time()
        audio = tts.infer(text, voice=args.voice)
        os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, "clip.wav")
            sf.write(wav, audio, tts.sample_rate)
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", chain, "-ar", "44100", "-ac", "1", "-b:a", "64k", out],
                check=True,
            )
        if os.path.getsize(out) < 800:
            raise RuntimeError("clip is empty")
        final = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout or 0)
        print(f"[{i}/{len(jobs)}] {args.voice}: {text} (model {len(audio) / tts.sample_rate:.2f}s -> clip {final:.2f}s, took {time.time() - started:.1f}s)", flush=True)
    except Exception as e:  # keep going: one bad clip must not lose the rest
        failed += 1
        print(f"[{i}/{len(jobs)}] FAILED \"{text}\": {e}", file=sys.stderr, flush=True)

print(f"done, {failed} failed", flush=True)
sys.exit(2 if failed else 0)
