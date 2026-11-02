"""This fork's own build steps, kept out of webapp.py so main's updates merge without touching them.

webapp.py asks this file for the extra settings (settings) and the extra files (files); without it, the build is main's.

config.properties:
  home_layout=office   the office home screen (web/custom.js): no app shelf and no live TV, one row of HDMI, screen
                       mirroring, USB and Home Settings, YouTube small, the weather and the next prayer above
  prayer_times=true    the Hijri date and the five prayer times for latitude/longitude (web/prayer.js, Umm al-Qura)
  hijri_offset=0       moves the Hijri date by whole days (-2 to 2)
  office_label=        a line above the clock, the office's name (UTF-8)

The person's brand, used when it's there and never in a --generic build (git ignores it all):
  app/assets/fonts/thmanyah/*.woff2   Thmanyah Sans and Serif Display
  app/assets/logo-corner.png          the logo, at the size it shows (780 x 736)
  tizen/icon.local.png                the Samsung package's icon (tizen/build.py)
  app/assets/backgrounds.local/       the office's own photos, instead of web/backgrounds (tools/office_photos.py)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OWN_PHOTOS = os.path.join(ROOT, 'app', 'assets', 'backgrounds.local')


def hijri_offset(v):
    """config.properties' hijri_offset: whole days, -2 to 2."""
    if not re.match(r'^[+-]?[0-2]$', v.strip()):
        sys.exit('config.properties: hijri_offset must be a whole number from -2 to 2 (got "%s")' % v)
    return int(v)


def own_photos():
    """The office's own photos and how bright each may stay ([[name, keep]]), or None."""
    listed = os.path.join(OWN_PHOTOS, 'backgrounds.json')
    if not os.path.exists(listed):
        return None
    with open(listed, encoding='utf-8') as f:
        return json.load(f) or None


def settings(values, generic=False):
    """The extra settings for config.js, from config.properties' values ({} and generic for a --generic build)."""
    return {
        'homeLayout': values.get('home_layout', '').strip().lower(),
        'prayerTimes': values.get('prayer_times', 'false').lower() == 'true',
        'hijriOffset': hijri_offset(values.get('hijri_offset', '') or '0'),
        'officeLabel': values.get('office_label', '').strip(),
        'backgrounds': own_photos() if not generic else None,
        'generic': generic,
    }


def files(out, config):
    """Adds the office layout's photos, and the person's fonts and logo, to the app's files ({path: bytes})."""
    if config.get('homeLayout') != 'office':
        return
    web = OWN_PHOTOS if config.get('backgrounds') else os.path.join(ROOT, 'web', 'backgrounds')
    for name in sorted(os.listdir(web)):
        if not name.lower().endswith('.jpg') or not os.path.isfile(os.path.join(web, name)):
            continue   # only the photos
        with open(os.path.join(web, name), 'rb') as f:
            out['backgrounds/' + name] = f.read()
    if config.get('generic'):
        return
    fonts = os.path.join(ROOT, 'app', 'assets', 'fonts', 'thmanyah')
    if os.path.isdir(fonts):
        for name in sorted(os.listdir(fonts)):
            if name.endswith('.woff2'):
                with open(os.path.join(fonts, name), 'rb') as f:
                    out['fonts/' + name] = f.read()
    logo = os.path.join(ROOT, 'app', 'assets', 'logo-corner.png')
    if os.path.exists(logo):
        with open(logo, 'rb') as f:
            out['logo.png'] = f.read()


def icon(default):
    """The Samsung package's icon: tizen/icon.local.png when the person made one, else main's."""
    own = os.path.join(ROOT, 'tizen', 'icon.local.png')
    return own if os.path.exists(own) else default


def manifest(data, config):
    """The Samsung package's config.xml: the office layout reads USB drives itself (Samsung's USB app doesn't open from
    a developer app on Tizen 9), and reads the Wi-Fi's name for the mirroring card."""
    if (config or {}).get('homeLayout') != 'office':
        return data
    extra = ''.join('    <tizen:privilege name="http://tizen.org/privilege/%s"/>\n' % p
                    for p in ('filesystem.read', 'mediastorage', 'externalstorage', 'network.get'))
    return data.replace(b'    <tizen:profile', extra.encode() + b'    <tizen:profile', 1)
