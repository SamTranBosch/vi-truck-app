# Vietnamese Truck Mask App – Backlog

Last updated: 2026-11-18

A web app that teaches Vietnamese to a 5-year-old. Each truck picture is covered by mask tiles. Each tile is one lesson, and finishing the lesson reveals a part of the truck. The voice is a Southern female teacher.

## Decisions (agreed, building now)

- **Delivery:** PWA, installed on iPhone (primary device) and iPad via Safari → Share → Add to Home Screen. Same code runs on Android and laptop.
- **Layout:** design phone-first (iPhone, portrait, one-thumb play), then scale up to iPad. The truck picture and its tiles must work on a small portrait screen and stay sharp on a large landscape one.
- **Audio:** all audio is pre-generated and shipped inside the app. There is no TTS API call at runtime, so the app works fully offline.
- **Voice:** one consistent Southern female voice. Zalo TTS (speaker ID 1, "South women") is the leading candidate, to be confirmed by a voice bake-off.
- **Stack:** Vite + TypeScript + React, SVG mask reveal, canvas for letter tracing, Howler.js for audio, lessons as JSON, progress in IndexedDB.
- **Curriculum:** follow the Grade 1 Tiếng Việt program (2018), using the **Cánh Diều** textbook set (file received: "Tiếng Việt 1 Tập 1 – Cánh diều"). The letter and vần order comes from this book.
- **First milestone:** one fire truck world following the book's own first blocks: Mở đầu + lessons 1–15 (16 tiles, one per lesson), about 80–100 audio clips. (Changed from 12 tiles: the book's first review falls at lessons 9 and 15, so 16 tiles is a cleaner cut.)

## Next up (MVP)

- [x] Lesson map of Tập 1 (Cánh Diều) written to `LESSON_MAP.md`: 93 lessons + reviews, lesson template, suggested worlds (titles read by eye from the scan, spot-check before relying on them)
- [x] World 1 content extracted to `WORLD1_CONTENT.md` (Mở đầu, lessons 1–15, pp. 3–31): printed words, picture-set answers, tones, reading words, writing. Picture answers are my reading of unlabeled pictures, so verify those marked (?) with the school's teacher guide
- [ ] Spot-check diacritics on the printed words of pp. 4–31 that were read at low resolution (pp. 15, 19, 23, 31 already checked)
- [ ] Decide how reading practice works without copying the book's texts: write own short sentences from the same words (the book's texts are the publisher's copyright; fine for personal use, but get permission before publishing)
- [ ] Check one vần lesson (e.g. Bài 36) to see how vần lessons differ from the letter lessons
- [ ] Extract World 2 (lessons 16–27, pp. 32–60)
- [ ] Alphabet page (p. 3): extract the picture word for each of the 29 letters
- [ ] Get Tập 2 as well when we reach the later lessons
- [ ] Audio script must follow the book's spoken forms (e.g. "cờ – a – ca"); confirm how the book names each letter
- [ ] Voice bake-off: same 20 words from Zalo, ElevenLabs (Southern voices) and VieNeu; a native Southern speaker picks one
- [ ] Confirm the Zalo API key, free quota and terms for shipping audio inside an app
- [ ] Audio pipeline: CSV of (id, text) → script generates mp3 → human listening check → ship
- [ ] Layered SVG fire truck with 12 cover tiles (mud splats), scattered unlock order
- [ ] Lesson player: listen-and-tap, drag-and-drop, letter tracing, sound-to-picture matching
- [ ] Start button to unlock iOS audio, parent gate on settings
- [ ] Phone-first UI: portrait layout, big touch targets in the thumb zone, safe-area insets (notch / home bar), no pinch-zoom or accidental scrolling during play
- [ ] Handle iPhone interruptions: pause and resume audio on calls, lock screen and app switching; respect the silent switch
- [ ] Service worker plus install instructions; test on a real iPhone first, then iPad, including offline and 7+ days idle
- [ ] Export / import progress button (protection against iOS storage eviction)

## Backlog (later)

### Distribution
- [ ] Capacitor wrapper with audio bundled in the app (avoids storage eviction), TestFlight for family
- [ ] App Store release: Apple Developer account, check Kids Category rules (parental gate, no third-party ads or analytics)

### Voice and audio
- [ ] Record a real Southern female teacher for letter names and sounds, the six tones and key words (about 300–500 clips); keep TTS for stories and long instructions
- [ ] Offline generation on a laptop with VieNeu-TTS (Southern female voice) as a free alternative to Zalo; check the license of the chosen model variant
- [ ] Test the iOS built-in vi-VN voice (probably a Northern accent) as a fallback
- [ ] Teach hỏi vs ngã by mark shape and memorized words, since Southern speech pronounces them the same

### Learning features
- [ ] Review mode: finished tiles come back as short spaced-repetition games in a "garage"
- [ ] Speaking practice with microphone and speech recognition
- [ ] Smarter tracing: check stroke order and direction, not only shape
- [ ] Pre-reading stage before letters (listening, rhymes, simple words), slower pacing than school Grade 1
- [ ] More truck worlds: dump truck, crane, cement mixer, tow truck… each tied to vocabulary (e.g. "bánh xe" for wheel)
- [ ] Sticker album with truck drive-away animation and sound after each world

### Product
- [ ] Simple parent view: progress, time played, weak sounds
- [ ] Accounts and cloud sync (only if more than one device or child is needed)
- [ ] Original truck illustrations (commission or generate), layered so the masks work; no copyrighted characters
- [ ] Android and laptop testing pass

## Open questions

- Is Vietnamese his first language or a second/heritage language? (decides the amount of speaking practice before reading)
- Does he attend a Vietnamese school? (the textbook is settled: Cánh Diều)
- Is this for family use only, or may it be published later? (decides when Capacitor / App Store work starts)

## Status after MVP build (World 1)
Done: 16 tiles/lessons playable, 8 activity types, mud-wipe map with fire truck art, parent area (hold ⚙️ 2 s: sound, save/restore/reset progress), PWA (offline verified in Chrome), icons, audio pipeline scripts, 153 automated tests.
Verified in real Chrome (iPhone 390×844 and iPad 820×1180 viewports, touch): all 16 lessons played to the end, incl. finger tracing on real canvas; offline reload works.
Found and fixed by the browser run: scene/tap-grid misalignment; tracing judged after every stroke (multi-stroke letters like "ga", "ô" could never pass) → now judged 0.9 s after the finger lifts.
NOT verified: real iPhone/Safari (audio unlock, PWA install, speechSynthesis voice), live Zalo API, voice quality/accent, a real 5-year-old's finger tracing tolerances (thresholds in tracing.ts/Trace.tsx are guesses), ONSET_SAY names vs the teacher guide.
Next: bake-off Zalo voices → generate clips; try on a real iPhone; tune tracing; World 2 content (lessons 16+).


## Deployment notes (GitHub / Docker) — what is and is not covered
Covered by files in the repo: `Dockerfile`, `nginx.conf`, `.dockerignore`, `.gitignore`, `.github/workflows/{ci,pages,docker}.yml`, README sections "Architecture" and "GitHub: CI, Pages, Docker".
Verified: workflow YAML parses; a clean `npm ci && npm run build` from the lockfile (the Dockerfile's build stage steps) succeeds; built file names match the nginx cache rules.
NOT verified (needs a machine/repo this session did not have):
- [x] `docker build` — verified by GitHub Actions (docker.yml run #1 succeeded and pushed the image to ghcr.io). Still to try locally (`docker run` + /healthz): `docker build -t xe-hoc-chu . && docker run --rm -p 8080:8080 xe-hoc-chu`, then open /healthz.
- [x] First run (2026-11-20): CI ✅, Docker image ✅, Pages ❌ at the deploy step. Cause is almost certainly that Pages is not enabled yet → Settings → Pages → Source = GitHub Actions, then re-run the failed job (Actions tab → Deploy to GitHub Pages → Re-run). Logs were not readable from the build sandbox, so confirm in the run log.
- [x] Repo `SamTranBosch/vi-truck-app` created by the user; first push needed the Claude GitHub App to be granted access to the new repo.
- [ ] GHCR package visibility (private by default) and Pages on a private repo (paid plan only).
- [ ] Custom domain / TLS for the Docker image (put it behind Caddy/Traefik/Cloudflare Tunnel; iPhone PWA requires HTTPS).
- [ ] Zalo key stays local (never in repo/CI). Generated mp3s are committed to the repo (≈200 small files).
- [ ] Optional later: Dependabot, `npm audit` step, Playwright e2e in CI (the autoplayer script used in development lives only in /tmp; port it into `e2e/`), Lighthouse PWA check.

## Voice (user feedback 2026-11-20: "not the Vietnamese Southern woman")
Cause: no clips were baked in, so the app used the device's built-in vi-VN voice (northern).
Done: `scripts/gen-audio.ts` + `scripts/lib/tts.ts` support FPT.AI (lannhi / linhsan, Southern female) and Zalo (speaker 1); `audio.yml` workflow makes listening samples and generates + commits all 199 clips using repository secrets.
Open:
- [ ] User adds `FPT_API_KEY` (or `ZALO_API_KEY`) secret, runs "Teacher voice" in samples mode, picks the voice, runs mode all.
- [ ] Neither API has been called from this code (no key in the build environment). Expect small fixes on first live run.
- [ ] Letter names/tone names by TTS may sound wrong ("a", "cờ", "huyền"): have a native speaker review; replace with real recordings (see BACKLOG "real voice").
- [ ] Mixed voice problem: while only some clips exist, the app mixes teacher clips and the device voice. Generate all clips in one run.
- [ ] Licensing: check the provider's terms for redistributing the generated audio inside a published app (free tier terms may limit commercial use).

## Feedback round 2 (2026-11-20)
Done: background music (code-composed, default on, very low, dips while the teacher speaks, pauses when the app is hidden; toggle "Nhạc nền" in the parent area), back buttons (lesson bar ◀ = previous activity; ◀ on Meet/Story cards = previous card; celebration screen ◀ / 🗺️ / ▶ = previous lesson / map / next lesson), kid-appeal pass (mascot "Bé Xe" that reacts to right/wrong, per-lesson colours and clouds, pop-in animations, celebration screen with confetti + 3 stars), layout fixes found at 360 px width (3-card row, review syllable grid now turns on its side when there are more vowels than consonants).
Open:
- [ ] Music taste: only the user's ears can judge "funny but not distracting". Volume constants are `BASE_VOLUME` / `DUCKED_VOLUME` in `src/lib/music.ts`; tempo `BPM`. A real royalty-free track could replace it later.
- [ ] Not verified on a real iPhone: music start after first tap, ducking while the iOS voice speaks, silent switch behaviour (iOS mutes WebAudio when the ring/silent switch is on silent).
- [ ] Textbook content/pictures: see conversation. Open decision on copyright for using the PDF's pictures in a public repo.

## Feedback round 3 (2026-11-20): "use MCP to enhance UI/UX and pictures"
Done
- Word pictures are now bundled Noto SVGs (`src/components/Pic.tsx`, `src/assets/noto/`, 95 files, Apache-2.0, see NOTICE) instead of system emoji: same look on every iPhone/iPad, works offline. `scripts/extract-pics.mjs` rebuilds them from the @svgmoji/noto sprite if a word is added.
- Cards fill the screen (picture on a coloured disc, bigger buttons, tighter spacing), pictures on mud tiles, big green "play next" button on the map.
- Optional hero picture: put `truck.png|jpg|webp` (3:4) in `src/assets/hero/` and the map shows it under the mud instead of the built-in drawing.
Canva (connected 2026-11-20)
- `generate-image` works and gave a good 3:4 fire-truck picture (Canva media id MAHbbX5UUaU, kept in the user's Canva account).
- Only a 150x199 preview reaches the workspace and the workspace cannot reach Canva's download hosts, so the full-size file has to be exported by the user (Canva -> Share -> Download -> PNG) and dropped into `src/assets/hero/truck.webp` (already done: truck, mascot and celebration are in, resized to webp).
- Ideas once that works: a sticker sheet per lesson hue, a nicer mascot, a celebration background.
Not done / ideas
- Hand-drawn or Canva-generated pictures per word (80+) would look more unified than Noto; needs a download route for each file.

## UX pass (2026-11-20, evening)
Done: tablet layout (play button no longer clipped on iPad; lessons scaled up with `zoom` at >= 700 px), idle nudge (`useIdleHint`: after 9 s a right answer wiggles in Hunt and Pick), image sizes confirmed (truck 156 KB, celebration 53 KB, mascot 48 KB).
Ideas not done: first-run welcome screen with the mascot; "Add to Home Screen" hint for iPhone Safari in the parent area; nudge in FindLetter/Trace; per-lesson resume after leaving mid-lesson; parent progress overview (which letters are still shaky); a landscape-specific map layout for iPad.

## Zalo wrapper review (2026-11-21)
`iconclub/zalo-tts` is a small Python client (needs Python 3.7-3.8 and PyAudio, no licence stated) for the same official endpoint our script already calls (`POST https://api.zalo.ai/v1/tts/synthesize`, header `apikey`, form `input`, `speed` 0.8-1.2, `speaker_id` 1 South women, 2 North women, 3 South men, 4 North men). We keep our own Node script (no extra dependency, no code copied). Changes: voice ids aligned with the wrapper, retry on error 155. Not verified: whether Zalo still hands out free keys / what the terms say; check when creating the key.

## Multi-world plan (2026-11-21)
The book has 93 lessons plus two big reviews = 95 tiles after Mở đầu; with Mở đầu that is 96 = six trucks of 16.
| World | Truck | Lessons | Status |
|---|---|---|---|
| 1 | fire truck | Mở đầu, 1-15 | done |
| 2 | cement mixer | 16-31 | done (docs/WORLD2_CONTENT.md) |
| 3 | container truck | 32-47 | done (docs/WORLD3_CONTENT.md) |
| 4 | tank truck | 48-62 + Ôn tập giữa học kì I (p. 92) | done (docs/WORLD4_CONTENT.md) |
| 5 | dump truck | 63-78 | done (docs/WORLD5_CONTENT.md) |
| 6 | crane truck | 79-93 + Ôn tập cuối học kì I (pp. 166-169) | done (docs/WORLD6_CONTENT.md) |
Each world needs: page reading (pages x2 per lesson), a data file `worldN.ts`, tests like world2.test.ts, a drawing in TruckArts.tsx
and (optional) a Canva picture. Final consonants are handled since World 3: vần targets, `isDecodable` needs the whole vần taught.
