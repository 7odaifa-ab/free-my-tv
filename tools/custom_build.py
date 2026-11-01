"""This fork's own build steps, kept out of webapp.py so main's updates merge without touching them.

webapp.py asks this file for the extra settings (settings) and the extra files (files); without it, the build is main's.

config.properties:
  home_layout=office   the office home screen (web/custom.js): no app shelf and no live TV, one row of HDMI, screen
                       mirroring, USB and Home Settings, YouTube small, the weather and the next prayer above
  prayer_times=true    the Hijri date and the five prayer times for latitude/longitude (web/prayer.js, Umm al-Qura)
  hijri_offset=0       moves the Hijri date by whole days (-2 to 2)

The person's brand, used when it's there and never in a --generic build (git ignores it all):
  app/assets/fonts/thmanyah/*.woff2   Thmanyah Sans and Serif Display
  app/assets/logo-corner.png          the logo, at the size it shows (780 x 736)
  tizen/icon.local.png                the Samsung package's icon (tizen/build.py)
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def hijri_offset(v):
    """config.properties' hijri_offset: whole days, -2 to 2."""
    if not re.match(r'^[+-]?[0-2]$', v.strip()):
        sys.exit('config.properties: hijri_offset must be a whole number from -2 to 2 (got "%s")' % v)
    return int(v)


def settings(values, generic=False):
    """The extra settings for config.js, from config.properties' values ({} and generic for a --generic build)."""
    return {
        'homeLayout': values.get('home_layout', '').strip().lower(),
        'prayerTimes': values.get('prayer_times', 'false').lower() == 'true',
        'hijriOffset': hijri_offset(values.get('hijri_offset', '') or '0'),
        'generic': generic,
    }


def files(out, config):
    """Adds the office layout's photos, and the person's fonts and logo, to the app's files ({path: bytes})."""
    if config.get('homeLayout') != 'office':
        return
    web = os.path.join(ROOT, 'web', 'backgrounds')
    for name in sorted(os.listdir(web)):
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
