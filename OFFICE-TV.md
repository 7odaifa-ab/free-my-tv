# Office TV: technical record

What we built on top of Free My TV for the office screen of جمعية مراكز الأحياء بمنطقة مكة المكرمة, why each piece is
there, what it gives us, and what could come next. `FORK.md` is the short guide for merging main's updates; this file
is the full history and the plan.

Last updated: 2026-11-01.

---

## 1. Goal

A calm, ad-free Arabic screen for an office TV, used for HDMI (a laptop), screen mirroring, a USB stick and now and
then YouTube. Not a home media screen: no TMDB key, no film picks, no app shelf, no live TV.

What it shows:

- the office's name, the time, the Gregorian and Hijri dates, and the weather for Jeddah;
- the next prayer and the countdown to the next occasion (Ramadan, the two Eids);
- one row of large keys: HDMI 1, Screen Mirroring, USB, Home Settings, and YouTube small in the corner;
- three pills on top: Screensaver, network status, TV Settings;
- the office's own photos behind it all, with the logo;
- a screensaver in the same style that is safe to leave on all night.

## 2. The TV and the computer

| | |
|---|---|
| TV | Samsung UA65CU7000UXSA, 2023, Tizen 9.0, 65", 1920 x 1080 UI, 3 HDMI ports |
| TV IP | 10.0.0.52 |
| Second TV | Samsung UA55CU7000UXSA, 2023, Tizen 9.0, 55", at 10.0.0.53 (added 2026-11-02) |
| Third TV | Samsung UA98DU9000UXSA, 2024, 98", at 10.0.0.51 (added 2026-11-02) |
| City | Jeddah (21.4858, 39.1925), time zone Asia/Riyadh |
| Computer | Windows 11, IP 10.0.0.172 (was 10.0.0.190; the TV's *Host PC IP* must match the current one) |
| Signing | Samsung certificate profile `FreeMyTV3`: the same author certificate as the first profile `FreeMyTV`, and a distributor certificate listing all three TVs' DUIDs (`FreeMyTV2` covered the first two). Made with tizen-agent-skills' certificate manager (`generate-samsung-distributor --duid-file`, `create-samsung-profile`); the password was typed by the user, and the Samsung sign-in happened in the browser. Keeping the author certificate let the first TV take the update without uninstalling. A third TV needs a new distributor certificate with all the DUIDs (`0 getduid` over SDB reads each one). |
| Tizen tools | `~/tizen-sdk` (CLI in `~/tizen-sdk/tools/ide/bin`) |

Developer mode on the TV: *Apps* → `1 2 3 4 5` (on a remote without numbers, the on-screen number pad) → Developer mode
on, Host PC IP = the computer's IP → restart the TV.

## 3. Branches and versions

| Branch | Where | What |
|---|---|---|
| `main` / `origin/main` | upstream (simbasjungles/free-my-tv) | The project. We merge from it; we never change it directly. |
| `pr/arabic-rtl` | pushed to our fork (`fork` remote, github.com/7odaifa-ab/free-my-tv) | One commit (`ba2743a`): Arabic and the right-to-left layout for LG and Samsung. Source of the upstream pull request simbasjungles/free-my-tv#415. |
| `office-tv` | **local only, never pushed** | What runs on the TV: `pr/arabic-rtl` + our own layer (sections 5-6) + the brand. |
| `arabic-rtl-theme` | local, archive | The first version, where the office look was mixed into main's files. Kept for reference only. |

The app's version is main's (`1.3.0` at the time of writing); our builds are identified by the `office-tv` commit.

### History

| Date | Commit | Step |
|---|---|---|
| 2026-10-28 | `14a72e0` (archive) | Arabic and a mirrored right-to-left layout in the web app. |
| 2026-10-28 | `ae5657e` (archive) | The brand palette on text, focus and selected rows. |
| 2026-11-01 | `9c453c1` (archive) | Hijri date and prayer times, computed on the TV. |
| 2026-11-01 | `cda91df`, `d46590f`, `35de08b` (archive) | Thmanyah fonts, the faded logo in a bottom corner with padding, the office's icon, a calmer screensaver. |
| 2026-11-01 | `886c4ad` (archive) | UrTV's look, rebuilt in our own code (clock with coloured ص/م, pills, screensaver layout). |
| 2026-11-01 | `981954c`, `7090477` (archive) | The office layout: no shelf, no drawer, no live TV; HDMI 1 only; no prayer box; faster on the TV. |
| 2026-11-01 | `60a826d`, `cc73be0` (archive) | Clear focus in both looks, a light look matching the dark one; 9 bugs fixed after a review. |
| 2026-11-01 | `52f472c` (archive) | Merged main (dimmer, ambient clock, flat mode); 134 new strings translated to Arabic. |
| 2026-11-01 | `ba2743a` | Arabic + RTL alone, cleaned up for upstream → PR #415. |
| 2026-11-01 | `9ef3adb` | Our layer moved out of main's files (`custom.js`, `custom.css`, `prayer.js`, `custom_build.py`). |
| 2026-11-01 | `0115142`, `519cbe9` | The office's name on the pills' row, the clock centred, the prayer line above the row, the logo clear of YouTube, no prayer grid on the screensaver. |
| 2026-11-01 | `70950dd` | The office's own photos as backgrounds, softened for both looks. |
| 2026-11-01 | `9fe0e99` | A stronger logo, the office's app icon and banner, this document. |
| 2026-11-01 | `e3ba20b` | The office's name on the screensaver, under the logo (rejected the same day, see 6.9). |
| 2026-11-01 | `31f95a4` | The screensaver's office name moved to the start edge, just above the prayer line. |
| 2026-11-01 | `8178d20` | This document: the rotation timing, the design iterations (6.9), the image processing in detail. |
| 2026-11-02 | `9fa007a` | Screen Mirroring opens a how-to card; USB opens our own viewer of the drive, with repeat modes (6.10). |
| 2026-11-02 | `d79ac57` | The viewer's file name fades after 3 s. |
| 2026-11-02 | `a2f542b` | No screensaver while the USB viewer is open (`h.idle`, a one-line hook in home.js). |
| 2026-11-02 | `222b202` | USB viewer: resume, a progress bar, auto-play when a drive is plugged in, a message for formats the TV can't play. |
| 2026-11-02 | `963679c` | Inside a photo or video, → is forward even in Arabic (home.js swaps the arrows for RTL). |
| 2026-11-02 | `b24c809` | A second TV (10.0.0.53); profile `FreeMyTV2` signs for both. |
| 2026-11-02 | `d414226` | A third TV (10.0.0.51, 98"); profile `FreeMyTV3` signs for all three. |
| 2026-11-02 | (this commit) | How to add a Samsung TV, step by step: fixed IP, AdGuard DNS, developer mode, the certificate. |

## 4. Upstream contribution (PR #415)

What went to the project, because every Arabic speaker using Free My TV benefits from it:

- `app/assets/i18n/ar.json`: all 438 strings, with Arabic's six plural forms (zero, one, two, few, many, other).
- `web/strings.js`: the Arabic locale `ar-SA-u-ca-gregory-nu-arab` (Gregorian calendar, Arabic-Indic digits), Arabic's
  plural rule for TVs without `Intl.PluralRules`, `I18N.rtl`, `I18N.digits` (٠-٩ in numbers, while names like
  "HDMI 1" stay as they are), `I18N.period` (ص/م alone).
- `web/home.js`: `startAt` / `endAt` / `slide` place everything from the start edge; ← and → follow the mirrored
  layout; switching language flips at once. Left-to-right languages are unchanged.
- `web/home.css`: `.rtl` rules for what home.js doesn't place, no letter spacing on joined Arabic letters.
- `web/data.js`: temperatures in the language's digits.
- `web/tv.js`: Samsung lists only the HDMI ports the TV really has (the UA65CU7000 has 3; the app showed a 4th that
  switched to nothing).
- README and CLAUDE.md updated.

Status: open, no review yet. Auto-fix watches it (CI failures, conflicts, comments). **Once it merges**, `ar.json` and
the RTL code come from main, and `office-tv` only needs to merge main.

## 5. Architecture: our layer, kept apart from main

**Why:** main changes often. When our look was mixed into `home.js` and `home.css`, every update meant conflicts in
hundreds of lines. Now main's files carry only one-line hooks, and everything else is in files main never touches.

**Benefit:** an update from main is usually `git merge origin/main` with no conflicts, or a few one-line ones.

### Our files

| File | Role |
|---|---|
| `web/custom.js` | The office layout (`window.FreeMyTVCustom(api)`). Returns `null` unless `home_layout=office`, so the app is main's otherwise. |
| `web/custom.css` | Its styles; every rule is under `.office`. |
| `web/prayer.js` | Prayer times, Hijri date, occasions, greeting. |
| `web/backgrounds/` | Unsplash fallback photos (credits in `CREDITS.txt`). |
| `web/icons/usb.svg`, `wifi.svg`, `wifi_off.svg` | Icons for the row and the network pill. |
| `tools/custom_build.py` | Our settings and files for the build. |
| `tools/office_photos.py` | Prepares the office's own photos. |
| `FORK.md`, `OFFICE-TV.md` | Guides. |

### Hooks in main's files

- `web/home.js`: `var custom`, `customApi()` (hands our layer main's helpers: `$`, `el`, `sym`, `setClass`, `startAt`,
  `endAt`, `hover`, `nearest`, `centerX`, `launcher`, `tvSettings`, `openSettings`, `showSaver`, `updateFocus`,
  `sheetOpen`, `saverPhotos`, `pickTarget`, `setSaverPick`, `rtl()`, `st`, `Z`, `inputs()`, `apps()`), and one
  `if (custom && custom.x(...)) return` line in `updateFocus`, `renderTop`, `renderClock`, `renderDrawer`,
  `renderPanels`, `move`, `activate`, `back`, `showSaver`, `hideSaver`, `checkNight`, the 30-second loop and init.
  Our object answers `{focus, buttons, clock, drawer, panels, move, activate, back, saver, hideSaver, tickSaver, night}`.
- `web/index.html`: loads `custom.css`, `prayer.js`, `custom.js`.
- `tools/webapp.py`: `import custom_build` (optional), its `settings()` into `config.js`, its `files()` into the package.
- `tizen/build.py`: `custom_build.icon()` for the package icon.
- `.gitignore`: the brand's files.

`grep -n custom web/home.js` lists every hook.

### Build pipeline

`tizen/build.py` → `tools/webapp.py` reads `config.properties`, writes `config.js` (with `custom_build.settings()`),
packs `web/` plus `custom_build.files()` (photos, fonts, logo), adds the icon, and signs with the `FreeMyTV` profile.
`tizen/install.py` pushes it over SDB (port 26101), installs with `vd_appinstall` and opens it.

## 6. Features: what, why, benefit

### 6.1 Arabic, right to left
- **What:** the whole interface in Arabic, mirrored; Arabic-Indic digits in numbers, Western names kept.
- **Why:** an Arabic-speaking office.
- **Benefit:** reads naturally; sent upstream so it stays maintained with the project.

### 6.2 Brand
- **Palette:** Brown/Gold `#8D7A59`, Teal `#57938A`, Beige `#CBBAA1`, Light Mint `#CADACD`, Light Beige `#DDD2C0`,
  Dark Brown `#61553E`, Dark Navy `#0C233F`. Gold accents at night `#DCB86F`, cream text `#F6EFE0`.
- **Fonts:** Thmanyah Sans (UI) and Thmanyah Serif Display (clock, numbers, titles), `@font-face` in `custom.css`.
- **Logo:** `app/assets/logo-corner.png` (780 x 736 PNG; an SVG was slow on the TV), drawn behind the home screen at
  the end edge above the row (510 x 480, opacity 0.62 by day, 0.55 at night) and on the screensaver where the prayer
  grid used to be (640 x 604, opacity 0.5).
- **Icon and banner:** `app/res/drawable-nodpi/icon.png` (192 px, the office's mark); `tizen/icon.local.png` is a copy
  used for the Samsung package.
- **Office name:** `office_label` in `config.properties`, shown on the pills' row at the start edge, Thmanyah Display
  34 px bold, the same height (62 px) and line as the pills.
- **Why / benefit:** the screen is the organisation's, not a generic TV.

### 6.3 Prayer times and the Hijri date (`web/prayer.js`)
- **What:** the five prayers by Umm al-Qura (Fajr at 18.5°, Isha 90 min after Maghrib, 120 in Ramadan, Asr at shadow
  factor 1), the Hijri date through `Intl` `islamic-umalqura` with `hijri_offset` (-2..2 days), Ramadan and the two
  Eids with a day countdown, a greeting by time of day, الجمعة instead of الظهر on Fridays, Arabic counting ("بعد ٥٨ دقيقة").
- **Why:** an office in Saudi Arabia plans around prayers; no network service needed.
- **Benefit:** works offline; verified within one minute of Aladhan for Jeddah.

### 6.4 Home screen layout (`home_layout=office`)
- **Top row:** the office's name (start edge) and three pills (end edge): Screensaver, network status (Wi-Fi icon,
  متصل / غير متصل, live on `online`/`offline` events), TV Settings. Network opens Samsung's network settings, falling
  back to TV Settings.
- **Weather:** under the pills, UrTV style: temperature and condition, city and high/low, a gold rule.
- **Clock:** greeting, the time with ص/م and the colon in gold, the date line "weekday، Hijri · Gregorian"; centred
  vertically between the top row (ends at 118 px) and the prayer line (starts at 640 px).
- **Prayer line:** just above the row: next prayer (name, time, "بعد ..."), and the next occasion (days left, date).
- **Row:** HDMI 1 (the first port only), Screen Mirroring and USB (only if the TV has those apps), Home Settings, and
  YouTube small in the far corner. Key width is computed to fit.
- **Removed:** app shelf, drawer, live TV, picks, quotes, the prayer box.
- **Navigation:** ↑/↓ between the row and the pills; ←/→ along each; Back leaves to Samsung's home.
- **Why / benefit:** everything the office needs in one press, nothing else to confuse visitors.

### 6.5 Backgrounds
- **What:** the office's 15 photos (`web/backgrounds/AlAhyaa/`, drone and ground shots of the centre), prepared by
  `tools/office_photos.py`: 1920 wide, saturation 0.6, Gaussian blur 3 px, JPEG 82 (100-180 KB each instead of
  10-27 MB). For each photo it stores a "keep" factor (target middle brightness 85/255, between 0.55 and 1) that sets
  the opacity of a dark layer over it. Falls back to the Unsplash set when there are no own photos.
- **Processing, step by step** (`tools/office_photos.py`, run once on the computer; the originals are never touched):
  1. open the original and decode the JPEG at reduced size (`draft`), which is much faster for 27 MB files;
  2. apply the camera's orientation (EXIF);
  3. resize to 1920 px wide, keeping the aspect (3:2 photos are cropped by the screen's `cover`, centred at 30% from
     the top);
  4. lower the colour to 60% (`ImageEnhance.Color 0.6`): courts and pools were too saturated next to the brand's
     muted palette;
  5. blur 3 px (Gaussian): the photo stays recognisable but loses the fine detail that fought with the text;
  6. measure the middle band's brightness (the middle 60% of the height, in grey) and store
     `keep = 85 / brightness`, between 0.55 and 1. The app sets the dark layer to `1 - keep` (the sunniest photo,
     DSC_5705, gets 0.45; the darkest, DSC_5052, 0.17);
  7. save as progressive JPEG, quality 82, into `app/assets/backgrounds.local/`, with `backgrounds.json` listing
     `[name, keep]`.
  First try (resize and darken only, target 95) was readable on calm photos but not on the drone shots: text, the
  prayer line and the logo got lost. Adding steps 4-5 and lowering the target to 85 fixed it in both looks.
- **Rotation:** a new photo every 30 minutes, on the clock (:00 and :30), chosen as `floor(time / 30 min) mod 15`, so
  every TV shows the same photo at the same time and nothing is stored. 15 photos make a 7.5-hour cycle; a day has 48
  half hours, which 15 doesn't divide, so the order moves on by 3 photos each day and a given hour doesn't always get
  the same photo. The change is a 1.2 s cross-fade. The screensaver checks every minute but shows the same half-hour
  photo as the home screen.
- **Kept as before:** the veil gradients (dark at night, cream by day) over the photo.
- **Why:** the photos are bright, sunny and busy (courts, pools); raw, they drowned the text and the logo.
- **Benefit:** the centre's own places on screen, in both looks, with no cost on the TV (the softening is done once on
  the computer).

### 6.6 Screensaver (UrTV's layout)
- **What:** dates and weather on top, a 300 px clock with "• بتوقيت جدة" centred under it (the gold dot on the
  right, before the words, as Arabic reads; checked on the TV), the logo at the end edge (640 x 604, opacity 0.5), the
  office's name at the start edge just above the bottom line (Thmanyah Display 30 px bold, cream with a soft shadow),
  and a bottom line of next prayer, next occasion and the next three days' weather. Photos cross-fade with a 60 s settle (no endless motion).
- **Burn-in care:** everything moves a few pixels every 4 minutes along a 7-step path; a black dimmer rises from 9 pm
  to 0.46 at 11 pm, held until 5 am, gone by 7 am.
- **Removed:** today's prayer grid (2026-11-01), on request.

### 6.10 Screen Mirroring and USB

**What happened.** Both keys opened nothing on this TV (Tizen 9). Samsung's apps (`org.tizen.ScreenMirroring-app-tv`,
`com.samsung.tv.mycontents`) are listed, and `tizen.application.launch` answers *success*, but nothing comes to the
front. We tried, one at a time with a 1.5 s check of `document.hidden`: `launch`, `launchAppControl` with the default
operation, the TV's REST API (`POST 127.0.0.1:8001/api/v2/applications/<id>`), and every related id the TV lists
(`ContentsBrowser`, `coba.source.StorageShare`, `usb-launcher-tv`, `home.media`, `SMSourceAPP`, `happycast-service`).
All failed. A drive (a SanDisk *Cruzer Blade*) shows in Samsung's own source menu, but not in `VIDEOSOURCE`, so
`tvwindow.setSource` can't reach it either.

**Screen Mirroring → a how-to card** (`mirrorGuide` in `custom.js`, `#guide` in `custom.css`). Mirroring starts from
the laptop or phone, not the TV, so the key explains how, in three columns: Windows (Windows + K), Mac (Control Center →
Screen Mirroring; AirPlay 2, which 2018+ Samsungs have) and iPhone/Android. A line on top says the device must be on the
same network as the TV. It names the TV as set in its settings (read from `GET 127.0.0.1:8001/api/v2/` → `device.name`)
and the Wi-Fi's name (`systeminfo` `WIFI_NETWORK`), which is left out when the TV is on a cable, as this one is. OK or
Back closes it. The card's classes are prefixed `g-`: plain names (`title`, `step`) took main's styles and overlapped.

**USB → our own viewer** (`openUsb` … `usbBack` in `custom.js`, `#usb`, `#usbview` in `custom.css`).
- `tizen.filesystem.listStorages` finds the mounted `EXTERNAL` drive; its folders, photos and videos show as a grid of
  6 columns (folders first, then by name; hidden files and other types left out). Thumbnails load only for the rows
  near the focus, since a camera's card can hold hundreds of photos.
- OK opens a folder, a photo (full screen, `contain`) or a video (HTML5 `<video>`). In a photo, ← → move to the
  previous or next file. The file's name shows in the corner for 3 s, then fades. While the viewer is open the screensaver waits (`h.idle` every 30 s): a slideshow or a film runs with no key pressed. In a video, OK pauses or plays, and ← → skip 10 s. Inside a photo or a video, → is always forward, as on the progress bar: home.js swaps ← → in Arabic for the grid, and the viewer swaps them back there. Back closes the file, then goes up a
  folder, then leaves.
- **Repeat modes** (▲ ▼ inside the viewer, shown for 3 s, remembered in `localStorage` `officeUsbMode`): *play once
  and close*, *repeat the file*, or *play the folder on repeat*. That last one goes through the folder's photos and
  videos, round to the start; photos stay 8 s each, as a slideshow. It suits a screen left playing in the office.
- **Resume** (`localStorage` `officeUsbAt`: folder path, file name, seconds): the viewer opens in the last folder,
  focused on the last file. A video opened again starts where it stopped (saved every 5 s and on close), unless that
  was its last 10 s.
- **Progress bar:** the elapsed and total time, the time left, and ▶ or ❚❚. It shows for 3 s after a key, a pause or a
  play, and stays up while paused. The file's name moved to the top so the two don't meet.
- **Plug and play** (`filesystem.addStorageStateChangeListener`): a drive plugged in while Free My TV is in front opens
  the viewer by itself (1.5 s later) and plays its folder on repeat. Pulling the drive out closes the viewer.
- **Unsupported formats:** the video's `error` shows «صيغة هذا الملف غير مدعومة» with the name, then moves to the next
  file after 2.5 s (folder mode) or closes, never a black screen.
- **Privileges:** `filesystem.read`, `mediastorage`, `externalstorage` and `network.get`. They are added to
  `config.xml` at build time by `custom_build.manifest()`, only for `home_layout=office`, so main's `tizen/config.xml`
  is unchanged. `tizen/build.py` got a one-line hook for it.
- **Alternative if a format won't play:** community players such as Tessel or Beam-TV
  (github.com/Apps2Samsung/tizen-community-packages) play more formats and subtitles. The USB key could open one of
  them instead.

### 6.9 How the experience changed, step by step

What was tried, what the office said, and what stayed. Kept so we don't go back to what was already rejected.

| Area | First | Then | Now (why) |
|---|---|---|---|
| Overall look | Main's look in Arabic, palette colours | UrTV's look rebuilt | Office layout (no shelf, no drawer, no live TV): the TV is for HDMI, mirroring, USB, YouTube. |
| App shelf | Main's shelf | Shelf hidden but drawer floating | None: one row of HDMI 1, Mirroring, USB, Home Settings, YouTube small. |
| HDMI | All four listed ports (one dead) | The three real ports | HDMI 1 only: the office uses one. |
| Prayer times on home | A box of the five prayers | Removed | Only the next prayer, in a line (less to read, still useful). |
| Prayer/occasion line | Under the clock, mid-screen (440 px) | — | Just above the row (640 px): reads with the row, frees the middle for the photo. |
| Clock | Top start corner (52 px) | Pushed down by the name above it | Centred between the top row and the prayer line (238 px; 120 px gap each side). |
| Clock style | Plain digits | ص/م and colon in gold, digits Thmanyah Display | Same; ص/م kept on the correct side with bidi-override. |
| Office name | None | 26 px line above the greeting, inside the clock block | 34 px bold on the pills' row, same 62 px height: the screen's title, in line with the buttons. |
| Logo (home) | Top corner | Bottom corner, 780 x 736, with padding; YouTube's key sat on it | Above the row at the end edge, 510 x 480. |
| Logo opacity | 0.28 day / 0.2 night | Too faint on the office's photos | 0.62 day / 0.55 night; 0.5 on the screensaver. |
| Screensaver prayers | A 3 x 2 grid of today's prayers | Removed | The logo takes its place; the next prayer stays in the bottom line. |
| Screensaver name | None | Under the logo, centred (rejected: crowded, read as part of the logo) | Start edge, above the prayer line. |
| Backgrounds | Unsplash landscapes | Office photos, raw (too busy) | Office photos softened (6.5). |
| Light look | Light text on a light veil (broken) | — | Navy text, brown accents; YouTube's key navy so its white letters show. |
| Focus | Invisible at night | — | Cream + gold ring at night, navy + brown ring by day, scale 1.08. |
| Speed | Slow focus moves | — | Only transform animates; logo as PNG; photos at screen size. |

### 6.7 Two looks, one design
- **What:** dark (cream text, gold accents) and light (navy text, brown accents) with the same layout, photo and
  logo. Focus is the opposite of the glass: cream with a gold ring at night, navy with a brown ring by day, plus a
  1.08 scale. Main's "flat" mode (Samsungs with 2 GB or less lose shadows) keeps our ring via `!important`.
- **Why:** focus was invisible at night and the light look was broken (light text on a light veil).
- **Benefit:** whoever walks up to the TV sees where they are.

### 6.8 Performance
- Only `transform` and `opacity` animate; the keys and pills sit on their own layers; smaller blurs; no blur filters
  at runtime; text is written only when it changes (`put()`), the clock only when the minute changes; the logo is a
  PNG at its shown size; photos at screen size.
- Confirmed smooth on the TV.

## 7. Configuration (`config.properties`, git-ignored)

```
language=ar
city=Jeddah
latitude=21.4858
longitude=39.1925
tmdb_region=SA
temperature=C
show_crypto=false
theme=dark
drawer_first=false
prayer_times=true
hijri_offset=0
home_layout=office
office_label=جمعية مراكز الأحياء بمنطقة مكة المكرمة
```

`home_layout`, `prayer_times`, `hijri_offset` and `office_label` are ours (`tools/custom_build.py`); the rest are main's.

## 8. Private files (never in git, never in a `--generic` build)

| File | Why private |
|---|---|
| `config.properties` | The project's rule: settings and any key stay local. |
| `app/assets/fonts/thmanyah/*.woff2` | Thmanyah's licence doesn't allow republishing. |
| `app/assets/logo-corner.png`, `app/assets/app icon.zip` | The organisation's brand. |
| `tizen/icon.local.png` | Copy of the office icon for the Samsung package. |
| `web/backgrounds/AlAhyaa/`, `app/assets/backgrounds.local/` | The organisation's photos. |
| `~/tizen-sdk-data` (certificate, profile) | Signing keys; passwords are typed only by the owner, never shared. |

`app/res/drawable-nodpi/icon.png` and `banner.png` (the office's icon and banner) are committed on `office-tv` only,
which is never pushed; they must never go into `pr/arabic-rtl` or any pull request.

## 9. Routine tasks

**Adding a Samsung TV (the steps used for the 2nd and 3rd TVs)**

On the TV (someone at the TV does these):
1. **Fixed network settings:** Settings → General → Network → Network Status → IP Settings. Set the IP to *Enter
   manually*, with a fixed address on 10.0.0.x that no other device uses (the TVs so far: .51, .52, .53). Set the DNS to
   *Enter manually*: `94.140.14.14`, and `94.140.15.15` as the second where the TV asks for one (AdGuard DNS, which
   blocks ads and trackers). A fixed IP keeps every install command and this document right.
2. **Developer mode:** Apps → type `1 2 3 4 5` on the remote → *Developer mode* On → *Host PC IP* = this computer's IP
   (`10.0.0.172`). Check the digits didn't come out reversed in the Arabic UI.
3. **A full restart:** hold the power button until it restarts, or unplug it for 30 s (the remote's power alone is
   standby). Apps then shows *Developer Mode* at the top.

On the computer:
1. Check the TV answers on SDB: port 26101 must be open (`python tizen/install.py <IP>` says so if it isn't).
2. Read its DUID over SDB (`0 getduid`) and add it to the DUID list beside the others.
3. A new distributor certificate listing **all** the TVs' DUIDs, with the **same author certificate** (copy
   `author.*` from `~/tizen-sdk-data/keystore/samsung/FreeMyTV` into the new profile's folder first):
   `node ~/tizen-tools/tizen-agent-skills/tizen-sdk-skills/tizen-cli/bin/tizen-sdk.js certificate-manager --action
   generate-samsung-distributor --profile-name FreeMyTV<n> --duid-file <list> --privilege Public --prompt-password`,
   run in the user's own terminal: they type the password and sign in to Samsung in the browser. Then
   `--action create-samsung-profile --profile-name FreeMyTV<n> --privilege Public`.
4. `python tizen/build.py --sign FreeMyTV<n>`, then `python tizen/install.py <IP>` for **every** TV. The old ones update
   in place, and their settings stay.
5. On the new TV: *Autorun Last App* on. Then add the TV here (section 2, the history, the install commands).

**Build and install**

```bash
python tizen/build.py --sign FreeMyTV3
python tizen/install.py 10.0.0.51
python tizen/install.py 10.0.0.52
python tizen/install.py 10.0.0.53
```

If SDB can't connect: kill Samsung's `sdb.exe` if it is running, and check the TV's Host PC IP is this computer's
current IP. Use `python`, not `python3`, on this Windows machine.

**Add or change photos:** put them in `web/backgrounds/AlAhyaa/`, run `python tools/office_photos.py`, then build and
install.

**Change the office name:** edit `office_label`, then build and install.

**Preview at the TV's size:** `python webos/build.py --preview`, serve `out/` (`.claude/launch.json` has a `preview`
config on port 8765), open `webos/index.html` at 1920 x 1080.

**Update from main:** see `FORK.md` (merge, translate new strings into `ar.json`, ES5 and CSS checks, generic builds,
preview, install).

**Checks before any push to `pr/arabic-rtl`:** `python tools/translate.py --check`, `npx acorn --ecma5` on `web/*.js`,
`python webos/build.py --generic`, `python tizen/build.py --generic`.

## 10. Problems met, and what fixed them

| Problem | Cause | Fix |
|---|---|---|
| SDB connection reset | Host PC IP typed reversed in the Arabic UI; later the computer's IP changed | Typed correctly on the TV each time. |
| ص/م on the wrong side of the time | Bidi reordering of mixed digits | Digits in their own spans with `direction: ltr; unicode-bidi: bidi-override`. |
| Focus invisible at night | `.night .glass` overrode `.key.focus` | Cream key with a gold ring; kept in flat mode with `!important`. |
| Light look unreadable | Light text on a light veil | `.office:not(.night)` rules: navy text, brown accents. |
| Three photos zeroed | A Windows System.Drawing JPEG re-encode | Restored from git; photo processing now with Pillow into a separate folder, originals never touched. |
| `custom.css` generator dropped rules | It removed declarations also in base CSS | Removes only main's exact flat-mode block. |
| Edit scripts failing | CRLF vs LF | Scripts normalise and restore line endings. |
| `0 debug` refused on Tizen 9 | Retail firmware | A temporary page posting to the PC read the app list and `VIDEOSOURCE`; removed after. |
| A 4th HDMI that did nothing | The app assumed 4 ports | Only ports the TV lists (sent upstream). |
| New TV unreachable on SDB (port 26101 closed) | Developer mode not yet active | Developer mode on, Host PC IP checked, full restart. |
| New TV: `install failed[118]` Check certificate error | The distributor certificate listed only the first TV's DUID | A new distributor certificate with both DUIDs, the same author certificate (profile `FreeMyTV2`). |
| Logo under YouTube | Logo bottom corner, 736 px tall | Logo above the row, 480 px tall. |
| Build crash risk | A folder inside `web/backgrounds` | Only `.jpg` files are packed. |
| YouTube letters invisible in the light look | White logo on a white key | That key is navy in the light look. |
| USB and Screen Mirroring keys did nothing | Tizen 9 won't bring Samsung's own apps up from a developer app (launch answers success) | Mirroring: a how-to card. USB: our own viewer (6.10). |

## 11. Ideas and plan

Ordered by value for the office. None is started.

**Content**
1. **Announcements line:** a short message (meeting, event, welcome a visitor) set from a phone, shown under the clock.
   A web app can't serve a page on Samsung, so it would come from a small JSON file we host (GitHub Pages or the
   organisation's site) and the TV polls every few minutes.
2. **Today's events:** read a shared calendar (an ICS link) and show the next two meetings.
3. **Iqama countdown:** minutes from Adhan to Iqama for the office's prayer room, set per prayer.
4. **Photo captions:** the place's name on each photo (from a small list next to the photos).
5. **Move the prayer and greeting words into `ar.json`** instead of `prayer.js`'s own table, so they follow the
   catalogue rules.

**Screen**
6. **Day/night by sunrise and sunset** (from prayer.js) instead of fixed hours, for the look and the dimmer.
7. **Screensaver after office hours only**, and a fully black screen at night (or turning the TV to standby, if
   Samsung's API allows it for a Developer Mode app).
8. **Logo variants:** a light logo for the dark look and a dark one for the light look, instead of one PNG with opacity.
9. **HDMI auto-switch:** when a laptop is plugged into HDMI 1, offer to switch (Samsung's `tvwindow` source events).

**Maintenance**
10. **Autorun:** turn on *Autorun Last App* so the TV starts into Free My TV; check if the 2023 set honours it.
11. **One-command update script:** fetch main, merge, check, build, install, with a summary of what changed.
12. **A second office TV:** the same build works with another `office_label` and photos; the certificate must be
    made for that TV's DUID too.
13. **After PR #415 merges:** drop `ar.json` and RTL from our list, merge main, confirm nothing doubled.

## 12. Where things are

- Project: github.com/simbasjungles/free-my-tv
- Our fork: github.com/7odaifa-ab/free-my-tv (`pr/arabic-rtl` only)
- Upstream PR: simbasjungles/free-my-tv#415
- Design reference: github.com/tshi-dev/UrTV (no licence: its design is reimplemented in our code, none of its code
  is copied)
