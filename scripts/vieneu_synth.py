#!/usr/bin/env python3
"""Reads a job list and writes mp3 files with VieNeu-TTS (open source, runs on the CPU, no API key).

  python3 scripts/vieneu_synth.py --jobs jobs.json --voice "Thục Đoan" --method pad --tempo 0.9 --short-tempo 0.8

jobs.json: [{"out": "public/audio/<set>/<key>.mp3", "text": "cá"}, ...]
Needs: pip install vieneu soundfile numpy, and ffmpeg. Exit code 2 when some clips failed (the others are kept).
The model (a few hundred MB) is downloaded from Hugging Face on the first run.

Methods (single sounds and words are where small TTS models are weakest: they rush, clip or add noise):
  plain    the text as it is.
  pad      short texts get a full stop and a little silence before and after, and are spoken more slowly.
  carrier  short texts are spoken inside a carrier phrase ("Đọc là: cờ.") so the voice keeps a stable rhythm and
           tone; the target word is then cut out by finding the pause before it. When no clean cut is found the
           clip falls back to the pad method (the log says so).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time

ap = argparse.ArgumentParser()
ap.add_argument("--jobs", required=True)
ap.add_argument("--voice", default="Thục Đoan")
ap.add_argument("--method", choices=["plain", "pad", "carrier"], default="plain")
ap.add_argument("--tempo", type=float, default=0.9, help="1.0 = as generated; below 1 = slower, same pitch (good for a 5-year-old)")
ap.add_argument("--short-tempo", type=float, default=None, help="tempo for single sounds and words (default: same as --tempo)")
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

CARRIER = "Đọc là: {}."
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05"


def clamp(t):
    return max(0.5, min(t, 1.5))


def is_short(text):
    """A single sound or word or two: no sentence punctuation, at most 2 words."""
    return len(text.split()) <= 2 and not re.search(r"[.!?,]", text)


def ffprobe_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(r.stdout or 0)


def encode(src, out, tempo, pad=False, start=None, end=None):
    """wav -> trimmed, slowed, small mp3. pad adds a short silence before and after."""
    cut = []
    if start is not None:
        cut = ["-ss", f"{start:.3f}", "-to", f"{end:.3f}"]
    chain = f"{TRIM},areverse,{TRIM},areverse,atempo={clamp(tempo)}"
    if pad:
        chain += ",adelay=120|120,apad=pad_dur=0.25"
    chain += ",afade=t=in:d=0.01"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *cut, "-i", src, "-af", chain, "-ar", "44100", "-ac", "1", "-b:a", "64k", out],
        check=True,
    )


def voiced_segments(wav):
    """[(start, end)] of the stretches that are not silence, from ffmpeg silencedetect."""
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", wav, "-af", "silencedetect=noise=-38dB:d=0.10", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    total = ffprobe_duration(wav)
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r.stderr)]
    segs, cursor = [], 0.0
    for s in starts:
        if s - cursor > 0.05:
            segs.append((cursor, s))
        ends_after = [e for e in ends if e > s]
        cursor = ends_after[0] if ends_after else total
    if total - cursor > 0.05:
        segs.append((cursor, total))
    return segs


failed = 0
fallbacks = 0
short_tempo = args.short_tempo if args.short_tempo is not None else args.tempo
for i, job in enumerate(jobs, 1):
    text, out = job["text"], job["out"]
    short = is_short(text)
    tempo = short_tempo if short else args.tempo
    how = args.method
    try:
        started = time.time()
        os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, "clip.wav")
            if args.method == "carrier" and short:
                audio = tts.infer(CARRIER.format(text), voice=args.voice)
                sf.write(wav, audio, tts.sample_rate)
                segs = voiced_segments(wav)
                last = segs[-1] if segs else None
                if last and len(segs) >= 2 and 0.12 <= last[1] - last[0] <= 1.6:
                    encode(wav, out, tempo, pad=True, start=max(0.0, last[0] - 0.04), end=last[1] + 0.10)
                else:
                    fallbacks += 1
                    how = "carrier->pad"
                    audio = tts.infer(text if re.search(r"[.!?]$", text) else text + ".", voice=args.voice)
                    sf.write(wav, audio, tts.sample_rate)
                    encode(wav, out, tempo, pad=True)
            else:
                spoken = text
                if args.method in ("pad", "carrier") and short and not re.search(r"[.!?]$", text):
                    spoken = text + "."
                audio = tts.infer(spoken, voice=args.voice)
                sf.write(wav, audio, tts.sample_rate)
                encode(wav, out, tempo, pad=(args.method in ("pad", "carrier") and short))
        if os.path.getsize(out) < 800:
            raise RuntimeError("clip is empty")
        print(f"[{i}/{len(jobs)}] {args.voice} ({how}): {text} -> {ffprobe_duration(out):.2f}s, took {time.time() - started:.1f}s", flush=True)
    except Exception as e:  # keep going: one bad clip must not lose the rest
        failed += 1
        print(f"[{i}/{len(jobs)}] FAILED \"{text}\": {e}", file=sys.stderr, flush=True)

print(f"done, {failed} failed, {fallbacks} carrier clips fell back to pad", flush=True)
sys.exit(2 if failed else 0)
