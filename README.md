# Xe Học Chữ — Vietnamese letters game for a 5-year-old

A phone-first PWA (iPhone primary, iPad supported). A fire truck is hidden under 16 mud tiles;
each finished lesson wipes one tile. World 1 = "Mở đầu" + lessons 1–15 of Cánh Diều *Tiếng Việt 1, Tập 1*
(letters a c o ô ơ d đ e ê l b g h i ia, tones huyền/sắc/hỏi/nặng/ngã, 3 own-written stories, 2 reviews).
Texts, stories and pictures are original (emoji/SVG), not copied from the textbook.

## Run
```bash
npm install
npm run dev        # http://localhost:5173 (use --host to open from a phone on the same Wi-Fi)
npm test           # unit + component tests
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ on :4173 (service worker only works on the built version)
```

## Put it on the iPhone / iPad
1. Host `dist/` over HTTPS (Cloudflare Pages, Netlify, GitHub Pages — all free; the build uses relative paths).
2. Open the URL in **Safari**, tap Share → **Add to Home Screen**. Always play from the home-screen icon:
   Safari tabs and the installed app have separate storage, and installed apps are not wiped after 7 days of non-use.
3. Open it once online; after that it works offline (all assets and audio are precached).

Progress is stored on the device. Parent area: **hold the ⚙️ button 2 seconds** → sound on/off, save/restore progress
as a file (move a child to a new device), reset.

## Teacher voice (Southern female)
Until clips exist the app falls back to the device's Vietnamese voice (quality varies, often no Southern accent).
To ship real clips:
```bash
npm run audio:list                       # all 199 texts and their file keys
ZALO_API_KEY=... npm run audio:gen -- --dry   # preview
ZALO_API_KEY=... npm run audio:gen             # writes public/audio/*.mp3 + manifest.json, then rebuild
```
`audio:gen` uses Zalo TTS speaker 1 (South, female) at speed 0.8. **It has not been run against the live API**
(no key in the build environment); the request code is isolated in `synthesize()` if Zalo's format differs.
Listen to a few clips first (`--only "cá,cà" --speaker 1`) before generating everything. Letter names and tones
(cờ, a, ca, huyền…) are best recorded by a real teacher later — drop `<key>.mp3` into `public/audio/` and rerun the manifest step.

## Architecture
```
 content (TS data) ─┐                              ┌─ public/audio/*.mp3 + manifest.json  (optional teacher clips)
 vietnamese.ts ─────┼─> React + Vite SPA ──build──> dist/  (index.html, assets/, sw.js, manifest, icons)
 progress (IndexedDB/localStorage on the device) ─┘        │
                                                           ├─ GitHub Pages  (HTTPS, free)      <- recommended for iPhone
                                                           └─ Docker image (nginx, :8080)       <- ghcr.io/<owner>/<repo>
```
- Pure static site: no server, no database, no accounts. Progress lives only on the child's device.
- A service worker precaches everything (including audio), so after the first visit it works offline.
- iPhone needs **HTTPS** for the service worker and Add-to-Home-Screen, so "localhost over Wi-Fi" is only good for quick looks.

## GitHub: CI, Pages, Docker (step by step)
Workflows in `.github/workflows/`:
| File | Runs on | Does |
|---|---|---|
| `ci.yml` | every push / PR | `npm ci`, typecheck, 153 tests, production build |
| `pages.yml` | push to `main` | test + build + publish `dist/` to GitHub Pages |
| `docker.yml` | push to `main`, tags `v*` | builds the Docker image and pushes `ghcr.io/<owner>/<repo>:latest` / `:<sha>` / `:<version>` |

One-time setup after the first push:
1. Create the repo (e.g. `SamTranBosch/vi-truck-app`), push this folder to `main`.
2. **Settings → Pages → Build and deployment → Source = GitHub Actions.** The first `pages.yml` run then prints the URL
   (`https://<owner>.github.io/<repo>/`). Pages on a *private* repo needs a paid GitHub plan; public repos are free.
3. **Settings → Actions → General → Workflow permissions**: leave default; the workflows ask for the permissions they need.
4. Open the Pages URL in iPhone Safari → Share → Add to Home Screen.
5. Docker image: after `docker.yml` succeeds, find it under the repo's **Packages**. It is private by default; set package
   visibility to public if you want `docker pull` without login.

Run the image anywhere (home server, NAS, VPS behind a TLS proxy such as Caddy/Traefik):
```bash
docker build -t xe-hoc-chu .
docker run --rm -p 8080:8080 xe-hoc-chu          # http://localhost:8080   (healthcheck: /healthz)
# or from the registry
docker run -d --name xe -p 8080:8080 --restart unless-stopped ghcr.io/<owner>/vi-truck-app:latest
```
Image = multi-stage (`node:22-alpine` builds, `nginx-unprivileged` serves, runs as non-root on 8080).
`nginx.conf` sets no-cache on `index.html`, `sw.js`, `registerSW.js`, the manifest (so updates reach the phone) and
long immutable caching on hashed `assets/`.

Releasing a new version: commit to `main` (Pages + `:latest` update automatically) or tag `git tag v0.1.0 && git push --tags`
for a versioned image. Phones pick up the update the next time the app is opened online (service worker `autoUpdate`).

Adding the teacher voice to a deployed build: run `npm run audio:gen` **on your own machine** (the Zalo key must never be
committed or put in CI), commit the generated `public/audio/*.mp3` + `manifest.json`, push.

## Code map
- `src/lib/vietnamese.ts` — syllable parser; answers for "which word has sound X / tone Y" are computed, not typed.
- `src/content/world1.ts` — the 16 lessons as data; `world1.test.ts` checks decodability (only taught letters used), hunt answers, tone order.
- `src/components/activities/*` — meet, spell, hunt, findLetter, trace, pick, story, combine.
- `src/lib/mud.ts`, `TruckScene.tsx`, `TruckArt.tsx` — tiles over the truck picture; `UNLOCK_CELLS` sets the scattered reveal order.
- `src/lib/audio.ts` — clip player + speechSynthesis fallback + sound effects; `progress.ts` — storage.

See `BACKLOG.md` for later ideas and `docs/WORLD1_CONTENT.md` / `docs/LESSON_MAP.md` for the textbook mapping.
