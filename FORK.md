# This fork: the office TV

دليل مختصر: كل ما يخص تلفزيون المكتب معزول في ملفات خاصة بنا، فتحديثات المشروع الأصلي تُدمج دون إعادة برمجة.

Free My TV as an office screen for a Samsung UA65CU7000 (Tizen 9): Arabic, right to left, UrTV's look, prayer times, and
a home screen of HDMI, screen mirroring and shortcuts instead of an app shelf. Everything specific to it is kept apart
from main's files, so main's updates merge with little or nothing to fix.

## What is ours

| File | What it is |
|---|---|
| `web/custom.js` | The office layout (`home_layout=office`): pills, clock, date line, weather, the bottom row, the screensaver. Returns `null` without `home_layout=office`, and the home screen is main's. |
| `web/custom.css` | Its styles, every rule under `body.office`. |
| `web/prayer.js` | Prayer times (Umm al-Qura), the Hijri date, Ramadan and the Eids, the greeting. |
| `web/backgrounds/` | The Saudi landscapes (Unsplash, credits inside). |
| `web/icons/usb.svg`, `wifi.svg`, `wifi_off.svg` | Icons for the row and the network pill. |
| `tools/custom_build.py` | Our settings (`home_layout`, `prayer_times`, `hijri_offset`, `office_label`) and files (photos, fonts, logo, icon). |
| `tools/office_photos.py` | Makes the office's own photos (`web/backgrounds/AlAhyaa/`) into softened 1920-wide backgrounds in `app/assets/backgrounds.local/`, used instead of the Unsplash ones. Run it again after adding photos. |
| `FORK.md` | This guide. |
| `OFFICE-TV.md` | The full record: every change, why, what it gives, and the plan for what comes next. |

Not in git (the person's brand, `.gitignore`): `app/assets/fonts/thmanyah/`, `app/assets/logo-corner.png`,
`app/assets/backgrounds.local/`, `web/backgrounds/AlAhyaa/`, `app/assets/credit.local.png` (Zakhm's credit badge, shown under Home Settings), `tizen/icon.local.png` (a copy of `app/res/drawable-nodpi/icon.png`), and `config.properties`.

## Where main's files call ours (the only lines to check after a merge)

- `web/home.js`: `var custom`, `customApi()`, and one `custom.…` check each in `updateFocus`, `renderTop`, `renderClock`,
  `renderDrawer`, `renderPanels`, `move`, `activate`, `back`, `showSaver`, `hideSaver`, `checkNight`, the 30-second loop
  and the start (`custom = window.FreeMyTVCustom(...)`). `grep -n "custom" web/home.js` lists them.
- `web/index.html`: `custom.css`, `prayer.js` and `custom.js`.
- `tools/webapp.py`: `import custom_build`, and its `settings()` and `files()`.
- `tizen/build.py`: `custom_build.icon()`.
- `.gitignore`: the brand's lines.

Arabic, the right-to-left layout, the Arabic digits and Samsung's HDMI ports are not ours to keep: they are on the
branch `pr/arabic-rtl`, sent to main. Once main has them, they leave this list.

## Updating from main

```bash
git checkout office-tv
git fetch origin
git merge origin/main
```

1. Conflicts, if any, are in the lines above: keep main's code and our one-line check beside it.
2. `python tools/translate.py --check`: main's new strings need Arabic. `python tools/translate.py` lists them; until
   main has Arabic itself, translate them into `app/assets/i18n/ar.json` by hand.
3. The checks `tools/check.sh` runs for the web app: ES5 (`npx acorn --ecma5`), and `webos/build.py --generic`,
   `tizen/build.py --generic`.
4. Preview at the TV's size (1920 x 1080): `python webos/build.py --preview`, serve `out/`, open `webos/index.html`.
5. Build, sign and install on the TV:

```bash
python tizen/build.py --sign FreeMyTV
python tizen/install.py 10.0.0.52
```

The TV's Developer mode must name this computer's IP as Host PC IP (it changes when the computer's does). The `FreeMyTV`
signing profile (Samsung certificate for this TV's DUID) is in `~/tizen-sdk-data`; updates must be signed with it.
