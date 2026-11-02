/*
 * This fork's own layer over Free My TV's home screen, kept in its own file so main's updates merge without touching
 * it: the office layout (home_layout=office) in UrTV's look. home.js hands it its helpers (FreeMyTVCustom(api)) and asks
 * it first in a few places; without home_layout=office it returns null and the home screen is main's.
 *
 *  - top: pills for the screensaver, the network and the TV's settings at the end edge; the office's name
 *    (office_label), the clock (ص/م and the colon in the accent), the date line "weekday، Hijri · Gregorian" and the weather;
 *  - above the row: the next prayer and the next occasion (Ramadan, the Eids), from prayer.js;
 *  - one row along the bottom, no shelf and no drawer: the first HDMI port, screen mirroring, USB, Home Settings, and
 *    YouTube small in the far corner;
 *  - behind it a Saudi landscape (web/backgrounds) under a veil, dark at night and light by day, and the person's logo;
 *  - the screensaver in UrTV's layout: the dates and the weather, the big clock, the logo, and a line of the next prayer,
 *    the next occasion and the coming days.
 * Plain ES5, like the rest of web/. Styles: custom.css.
 */
window.FreeMyTVCustom = function (h) {
  'use strict';

  var CONFIG = window.CONFIG || {};
  if (CONFIG.homeLayout !== 'office') return null;

  var $ = h.$, el = h.el, setClass = h.setClass, startAt = h.startAt, endAt = h.endAt, st = h.st, Z = h.Z;
  var body = document.body;
  var MIRROR = 'org.tizen.ScreenMirroring-app-tv', USB = 'com.samsung.tv.mycontents';   // Samsung's own apps
  var items = [];

  setClass(body, 'office', true);

  // MARK: - Helpers

  /** Sets a node's text only when it changed: no repaint for the same words. */
  function put(node, text) { if (node && node.textContent !== text) node.textContent = text; }

  /** True when this TV has that app (Samsung's API; elsewhere false). */
  function tvHas(id) {
    try { return !!window.tizen.application.getAppInfo(id); } catch (e) { return false; }
  }

  /** An icon of our own (icons/*.svg) as the mask of a symbol. */
  function icon(parent, url) {
    var s = el('span', 'sym', parent);
    s.style.webkitMaskImage = s.style.maskImage = 'url(' + url + ')';
    return s;
  }

  function prayerOn() { return CONFIG.prayerTimes === true && !!window.Prayer; }

  function offset() { return +CONFIG.hijriOffset || 0; }

  function nextPrayer(at) { return prayerOn() ? Prayer.next(at, Prefs.latitude(), Prefs.longitude(), offset()) : null; }

  // MARK: - Clock and dates

  /** "الأحد" and "١ نوفمبر", from the catalogue's "EEEE, MMMM d" (Arabic: "EEEE، d MMMM"). */
  function dayParts(at) {
    var s = formatDate('format|EEEE, MMMM d', at), i = s.search(/[،,]/);
    return i < 0 ? [s, ''] : [s.substring(0, i), s.substring(i + 1).replace(/^\s+/, '')];
  }

  /** The weekday, then the Hijri date, then the Gregorian day: "الأحد، ٢١ جمادى الأولى ١٤٤٨ هـ · ١ نوفمبر". */
  function dateLine(at) {
    var hijri = prayerOn() ? Prayer.hijri(at, offset()) : '';
    if (!hijri) return formatDate('format|EEEE, MMMM d', at);
    var p = dayParts(at);
    return p[0] + (h.rtl() ? '، ' : ', ') + hijri + ' · ' + p[1];
  }

  /**
   * The time as digits in their own spans, the colon and AM/PM (ص/م) apart so they take the accent, as on UrTV's
   * screens; written left to right whatever the language, AM/PM on the left of the digits in Arabic.
   */
  function clockDigits(node, at) {
    var time = formatDate('format|h:mm', at), rtl = h.rtl();
    var ap = /a/.test(tr('format|h:mm a').replace(/'[^']*'/g, '')) ? I18N.period(at) : '';
    if (node.getAttribute('data-t') === time + ap + rtl) return;
    node.setAttribute('data-t', time + ap + rtl);
    node.innerHTML = '';
    var colon = time.indexOf(':'), period = ap ? el('span', 'ap', null, ap) : null;
    if (period && rtl) node.appendChild(period);
    if (colon < 0) el('span', 'h', node, time);
    else {
      el('span', 'h', node, time.substring(0, colon));
      el('span', 'sep', node, ':');
      el('span', 'm', node, time.substring(colon + 1));
    }
    if (period && !rtl) node.appendChild(period);
  }

  function clock(c) {
    if (!c.getAttribute('data-custom')) {
      c.setAttribute('data-custom', '1');
      c.innerHTML = '';
      el('div', 'greet', c);
      el('div', 'time', c);
      el('div', 'date', c);
    }
    var d = new Date(), at = d.getTime();
    put(c.children[0], window.Prayer ? Prayer.greeting(d) : '');
    clockDigits(c.children[1], at);
    put(c.children[2], dateLine(at));
    info(at);
    skyPhoto();
    return true;
  }

  // MARK: - Background: a Saudi landscape, and the person's logo

  // The office's own photos (tools/office_photos.py), else web/backgrounds (Unsplash); each with how bright it may stay
  // so text reads on it.
  var BACKGROUNDS = CONFIG.backgrounds || [['9hWJs7iblh8', 0.9], ['XDtzu1D2P8c', 0.84], ['t3dlLOhdEzs', 0.99], ['LAj90eAXOZA', 0.96], ['f5ZB0LHwi0s', 0.88]];

  /** The photo for this half hour: a new one every 30 minutes, the same on every TV. */
  function background(at) { return BACKGROUNDS[Math.floor(at / 1800000) % BACKGROUNDS.length]; }

  var sky = $('sky'), photo = el('div', 'photo'), brand = el('div', 'brand');
  el('div', 'dark', photo);
  sky.insertBefore(photo, sky.querySelector('canvas'));
  sky.insertBefore(brand, sky.querySelector('.lift'));
  // The office's name, on the pills' row at the start edge
  if (CONFIG.officeLabel) el('div', '', $('top'), CONFIG.officeLabel).id = 'org';

  function skyPhoto() {
    var bg = background(Date.now());
    if (photo.getAttribute('data-bg') === bg[0]) return;
    photo.setAttribute('data-bg', bg[0]);
    photo.style.backgroundImage = 'url(backgrounds/' + bg[0] + '.jpg)';
    photo.firstChild.style.opacity = Math.round((1 - bg[1]) * 100) / 100;
  }

  // MARK: - Pills: the screensaver, the network, the TV's settings

  var NET = {ar: ['متصل', 'غير متصل'], en: ['Online', 'Offline']};

  function netLabel() { return (NET[I18N.base] || NET.en)[navigator.onLine === false ? 1 : 0]; }

  function netIcon() { return navigator.onLine === false ? 'icons/wifi_off.svg' : 'icons/wifi.svg'; }

  function netPill() {
    var p = $('buttons').children[1];
    if (!p) return;
    put(p.lastChild, netLabel());
    var url = netIcon();
    if (p.getAttribute('data-icon') === url) return;
    p.setAttribute('data-icon', url);
    p.firstChild.style.webkitMaskImage = p.firstChild.style.maskImage = 'url(' + url + ')';
  }

  /** The TV's network settings, where it has them apart; else its settings. */
  function networkSettings() {
    TV.launch('com.samsung.tv.coba.setting.networksettings', null, function (ok) { if (!ok) h.tvSettings(); });
  }

  var PILLS = [[h.showSaver, function (p) { h.sym('bedtime', p); return tr('Screensaver'); }],
    [networkSettings, function (p) { icon(p, netIcon()); return netLabel(); }],
    [h.tvSettings, function (p) { h.sym('tv_settings', p); return tr('TV Settings'); }]];

  function buttons(holder) {
    for (var b = 0; b < PILLS.length; b++) {
      var r = el('button', 'pill', holder);
      el('span', 'lbl', r, PILLS[b][1](r));   // the icon (made by PILLS' function) first, its name after
      h.hover(r, Z.TOP, 3 + b);
    }
    return true;
  }

  window.addEventListener('online', netPill);
  window.addEventListener('offline', netPill);

  // MARK: - How-to cards (mirroring, USB)

  // Samsung's mirroring and USB apps can't be opened from a developer app on Tizen 9 (launch answers success and
  // nothing comes up, for every id the TV lists), so these keys show how to do it instead.
  var guideOn = false, tvName = '', wifiName = '';

  /** The name given to the TV in its settings (General, System Manager, Device Name), from its own REST API. */
  function loadTvName(done) {
    if (tvName) { done(); return; }
    try {
      var x = new XMLHttpRequest();
      x.open('GET', 'http://127.0.0.1:8001/api/v2/', true);
      x.timeout = 3000;
      x.onreadystatechange = function () {
        if (x.readyState !== 4) return;
        try { tvName = JSON.parse(x.responseText).device.name || ''; } catch (e) {}
        try {
          window.tizen.systeminfo.getPropertyValue('WIFI_NETWORK', function (w) { wifiName = w && w.ssid || ''; done(); }, done);
        } catch (e) { done(); }
      };
      x.send();
    } catch (e) { done(); }
  }

  function showGuide(title, sections, note) {
    var g = $('guide') || el('div', '', body);
    g.id = 'guide';
    g.innerHTML = '';
    var card = el('div', 'g-card', g);
    el('div', 'g-title', card, title);
    if (note) el('div', 'g-note', card, note);
    var cols = el('div', 'g-cols', card);
    for (var i = 0; i < sections.length; i++) {
      var c = el('div', 'g-col', cols);
      el('div', 'g-head', c, sections[i][0]);
      for (var j = 1; j < sections[i].length; j++) el('div', 'g-step', c, sections[i][j]);
    }
    el('div', 'g-hint', card, 'اضغط رجوع أو موافق للإغلاق');
    guideOn = true;
    setClass(g, 'on', true);
  }

  function hideGuide() {
    guideOn = false;
    if ($('guide')) setClass($('guide'), 'on', false);
  }

  function mirrorGuide() {
    loadTvName(function () {
      var name = tvName ? '«' + tvName + '»' : 'هذا التلفزيون';
      showGuide('مشاركة الشاشة', [
        ['ويندوز', '١. اضغط مفتاح Windows + K', '٢. اختر ' + name + ' من القائمة', '٣. وافق على الطلب في التلفزيون إن ظهر'],
        ['ماك', '١. افتح مركز التحكم أعلى الشاشة', '٢. اضغط «انعكاس الشاشة» (Screen Mirroring)', '٣. اختر ' + name],
        ['آيفون وأندرويد', 'آيفون: مركز التحكم ← انعكاس الشاشة', 'أندرويد: الإعدادات السريعة ← Smart View', 'ثم اختر ' + name]
      ], 'يجب أن يكون الجهاز والتلفزيون متصلين بنفس الشبكة' + (wifiName ? ': ' + wifiName : '') + (tvName ? '  ·  اسم التلفزيون: ' + tvName : ''));
    });
  }

  // MARK: - USB: our own viewer

  // The drive isn't one of the TV's video sources and Samsung's USB app doesn't open from a developer app on Tizen 9,
  // so the key opens the drive here: its folders, photos and videos (tizen.filesystem; the privileges are added at build
  // time by tools/custom_build.py). OK opens, the arrows move, Back goes up a folder, then out.
  var PHOTO = /\.(jpe?g|png|gif|bmp|webp)$/i, VIDEO = /\.(mp4|m4v|mov|mkv|avi|webm|ts|3gp)$/i, USB_COLS = 6;
  var usb = null;   // {stack: [folders], list: [{name, kind, file}], at, view: '' | 'photo' | 'video'}
  // What happens when a video ends (▲ ▼ in the viewer change it; this TV remembers it): close, play it again, or go on
  // through the folder's photos and videos and start over (photos stay SLIDE ms each, as a slideshow).
  var MODES = [['once', 'تشغيل مرة ثم إغلاق'], ['one', 'تكرار الملف'], ['all', 'تشغيل المجلد بالتكرار']], SLIDE = 8000;
  var usbMode = 0, slideTimer = 0, modeTimer = 0;
  try { usbMode = Math.max(0, Math.min(2, +localStorage.getItem('officeUsbMode') || 0)); } catch (e) {}

  /** The next photo or video after `from` (dx 1) or before it (dx -1), round the folder; -1 when there's none. */
  function usbNext(from, dx) {
    var n = usb.list.length;
    for (var k = 1; k <= n; k++) {
      var i = ((from + dx * k) % n + n) % n;
      if (usb.list[i].kind !== 'dir') return i;
    }
    return -1;
  }

  function usbAdvance() {
    var i = usbNext(usb.at, 1);
    if (i < 0) { usbCloseView(); return; }
    usb.at = i;
    usbShow();
  }

  function showMode() {
    var v = $('usbview'), m = v && v.querySelector('.u-mode');
    if (!m) return;
    m.textContent = '▲▼  ' + MODES[usbMode][1];
    setClass(m, 'on', true);
    clearTimeout(modeTimer);
    modeTimer = setTimeout(function () { setClass(m, 'on', false); }, 3000);
  }

  /** Where the viewer was: {dir: path under the drive ('a/b'), name: the file, t: seconds into a video}. */
  function usbSaved() {
    try { return JSON.parse(localStorage.getItem('officeUsbAt')) || {}; } catch (e) { return {}; }
  }

  function usbSave(t) {
    if (!usb) return;
    var dirs = [], it = usb.list[usb.at];
    for (var i = 1; i < usb.stack.length; i++) dirs.push(usb.stack[i].name);
    try { localStorage.setItem('officeUsbAt', JSON.stringify({dir: dirs.join('/'), name: it ? it.name : '', t: t || 0})); } catch (e) {}
  }

  function openUsb(auto) {
    var toast = window.FreeMyTV.toast;
    if (usb) return;
    try {
      window.tizen.filesystem.listStorages(function (all) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].type === 'EXTERNAL' && all[i].state === 'MOUNTED') {
            window.tizen.filesystem.resolve(all[i].label, function (root) {
              // The screensaver waits while the viewer is open: a slideshow or a film runs with no key pressed
              usb = {stack: [root], list: [], at: 0, view: '', awake: setInterval(h.idle, 30000)};
              var saved = usbSaved(), parts = saved.dir ? saved.dir.split('/') : [];
              // Back into the folder it was in, as far as it still exists on this drive
              for (var k = 0; k < parts.length; k++) {
                try { usb.stack.push(usb.stack[usb.stack.length - 1].resolve(parts[k])); } catch (e) { break; }
              }
              usbList(saved.name, auto);
            }, function (e) { toast('USB: ' + e.name); }, 'r');
            return;
          }
        }
        if (!auto) toast('وصّل فلاش USB بالتلفزيون أولاً');
      }, function (e) { toast('USB: ' + e.name); });
    } catch (e) { toast('USB: ' + e.name); }
  }

  // 3: a drive plugged in while this screen shows opens by itself and plays its folder on repeat
  try {
    window.tizen.filesystem.addStorageStateChangeListener(function (s) {
      if (s.type !== 'EXTERNAL') return;
      if (s.state === 'MOUNTED' && !document.hidden) setTimeout(function () { openUsb(true); }, 1500);
      else if (s.state !== 'MOUNTED' && usb) { usbCloseView(); usbBack(true); }
    });
  } catch (e) {}

  function usbList(focusName, auto) {
    usb.stack[usb.stack.length - 1].listFiles(function (files) {
      var list = [];
      for (var i = 0; i < files.length; i++) {
        var f = files[i], n = f.name;
        if (n.charAt(0) === '.') continue;
        var kind = f.isDirectory ? 'dir' : PHOTO.test(n) ? 'photo' : VIDEO.test(n) ? 'video' : '';
        if (kind) list.push({name: n, kind: kind, file: f});
      }
      list.sort(function (x, y) { return (x.kind === 'dir' ? 0 : 1) - (y.kind === 'dir' ? 0 : 1) || (x.name < y.name ? -1 : 1); });
      usb.list = list;
      usb.at = 0;
      for (var j = 0; focusName && j < list.length; j++) if (list[j].name === focusName) usb.at = j;
      usbDraw();
      if (auto) {
        usbMode = 2;   // the folder on repeat
        var first = list[usb.at] && list[usb.at].kind !== 'dir' ? usb.at : usbNext(usb.at, 1);
        if (first >= 0) { usb.at = first; usbShow(); }
      }
    }, function (e) { window.FreeMyTV.toast('USB: ' + e.name); });
  }

  function usbDraw() {
    var u = $('usb') || el('div', '', body);
    u.id = 'usb';
    u.innerHTML = '';
    setClass(u, 'on', true);
    var path = [];
    for (var i = 0; i < usb.stack.length; i++) path.push(i ? usb.stack[i].name : 'USB');
    el('div', 'u-path', u, path.join('  ›  '));
    var grid = el('div', 'u-grid', u);
    if (!usb.list.length) el('div', 'u-empty', grid, 'لا توجد صور أو فيديوهات هنا');
    for (var k = 0; k < usb.list.length; k++) {
      var it = usb.list[k], t = el('div', 'u-tile', grid);
      // Only the first rows' photos load now: a drive can hold hundreds of camera photos
      if (it.kind === 'photo') { var img = el('img', '', el('div', 'u-thumb', t)); if (k < USB_COLS * 3) img.src = it.file.toURI(); }
      else el('div', 'u-thumb', t, it.kind === 'dir' ? '📁' : '▶');
      el('div', 'u-name', t, it.name);
    }
    el('div', 'u-hint', u, 'موافق للفتح  ·  ▲▼ داخل العرض لاختيار التكرار  ·  رجوع للخلف');
    usbScroll();
  }

  function usbScroll() {
    var grid = $('usb').querySelector('.u-grid'), tiles = grid.querySelectorAll('.u-tile');
    var row = Math.floor(usb.at / USB_COLS);
    for (var i = 0; i < tiles.length; i++) {
      setClass(tiles[i], 'focus', i === usb.at);
      var img = tiles[i].querySelector('img');
      if (img && !img.src && Math.floor(i / USB_COLS) <= row + 2) img.src = usb.list[i].file.toURI();
    }
    grid.style.webkitTransform = grid.style.transform = 'translateY(' + (-Math.max(0, row - 1) * 300) + 'px)';
  }

  function usbShow() {
    var it = usb.list[usb.at], v = $('usbview') || el('div', '', body);
    v.id = 'usbview';
    v.innerHTML = '';
    setClass(v, 'on', true);
    clearTimeout(slideTimer);
    if (it.kind === 'photo') {
      usbSave(0);
      usb.view = 'photo';
      el('img', '', v).src = it.file.toURI();
      if (MODES[usbMode][0] === 'all') slideTimer = setTimeout(usbAdvance, SLIDE);
    } else {
      usb.view = 'video';
      var vid = el('video', '', v), saved = usbSaved(), lastSave = 0;
      vid.src = it.file.toURI();
      vid.autoplay = true;
      // 1: the same file again starts where it stopped (not in its last 10 s)
      if (saved.name === it.name && saved.t > 5) {
        vid.addEventListener('loadedmetadata', function () { if (saved.t < vid.duration - 10) { vid.currentTime = saved.t; usbBar(); } });
      }
      vid.ontimeupdate = function () {
        if (Date.now() - lastSave > 5000) { lastSave = Date.now(); usbSave(vid.currentTime); }
        if (h.hasClass(bar, 'on')) usbBarText();
      };
      vid.onended = function () {
        usbSave(0);
        var mode = MODES[usbMode][0];
        if (mode === 'one') { vid.currentTime = 0; vid.play(); }
        else if (mode === 'all') usbAdvance();
        else usbCloseView();
      };
      // 7: a format the TV can't play says so, then moves on (or closes)
      vid.onerror = function () {
        window.FreeMyTV.toast('صيغة هذا الملف غير مدعومة: ' + it.name);
        setTimeout(function () { if (usb && usb.view === 'video' && usb.list[usb.at] === it) { if (MODES[usbMode][0] === 'all') usbAdvance(); else usbCloseView(); } }, 2500);
      };
      vid.onplay = vid.onpause = usbBar;
      var bar = el('div', 'u-bar', v);
      el('div', 'u-state', bar);
      el('div', 'u-fill', el('div', 'u-track', bar));
      el('div', 'u-time', bar);
      usbBar();
    }
    var cap = el('div', 'u-cap', v, it.name);
    setTimeout(function () { setClass(cap, 'gone', true); }, 3000);   // the name, then the picture alone
    el('div', 'u-mode', v);
    showMode();
  }

  /** 2: the progress bar, shown for 3 s after a key, a pause or a play (always while paused). */
  var barTimer = 0;
  function mmss(t) {
    t = Math.max(0, Math.floor(t || 0));
    var h2 = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, sec = t % 60;
    return (h2 ? h2 + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }
  function usbBarText() {
    var v = $('usbview'), vid = v && v.querySelector('video'), bar = v && v.querySelector('.u-bar');
    if (!vid || !bar) return;
    var d = vid.duration || 0;
    bar.querySelector('.u-fill').style.width = (d ? Math.min(100, vid.currentTime / d * 100) : 0) + '%';
    bar.querySelector('.u-time').textContent = mmss(vid.currentTime) + ' / ' + mmss(d) + (d ? '   (−' + mmss(d - vid.currentTime) + ')' : '');
    bar.querySelector('.u-state').textContent = vid.paused ? '❚❚' : '▶';
  }
  function usbBar() {
    var v = $('usbview'), vid = v && v.querySelector('video'), bar = v && v.querySelector('.u-bar');
    if (!bar) return;
    usbBarText();
    setClass(bar, 'on', true);
    clearTimeout(barTimer);
    barTimer = setTimeout(function () { if (!vid.paused) setClass(bar, 'on', false); }, 3000);
  }

  function usbCloseView() {
    clearTimeout(slideTimer);
    var v = $('usbview');
    if (v) {
      var vid = v.querySelector('video');
      if (vid && usb) usbSave(vid.ended ? 0 : vid.currentTime);
      if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
      v.innerHTML = '';
      setClass(v, 'on', false);
    }
    usb.view = '';
    usbScroll();
  }

  function usbMove(dx, dy) {
    var n = usb.list.length, vid;
    if (usb.view && dy) {
      usbMode = (usbMode + (dy > 0 ? 1 : MODES.length - 1)) % MODES.length;
      try { localStorage.setItem('officeUsbMode', usbMode); } catch (e) {}
      if (usb.view === 'photo') usbShow(); else showMode();
      return;
    }
    if (usb.view === 'video') {
      vid = $('usbview').querySelector('video');
      if (vid && dx) vid.currentTime = Math.max(0, vid.currentTime + dx * 10);   // ← → skip 10 s
      usbBar();
      return;
    }
    if (!n) return;
    if (usb.view === 'photo') {
      var i = dx ? usbNext(usb.at, dx) : -1;
      if (i >= 0) { usb.at = i; usbShow(); }
      return;
    }
    usb.at = Math.max(0, Math.min(n - 1, usb.at + dx + dy * USB_COLS));
    usbScroll();
  }

  function usbOk() {
    if (usb.view === 'video') {
      var vid = $('usbview').querySelector('video');
      if (vid) { if (vid.paused) vid.play(); else vid.pause(); }
      return;
    }
    if (usb.view === 'photo') { usbCloseView(); return; }
    var it = usb.list[usb.at];
    if (!it) return;
    if (it.kind === 'dir') { usb.stack.push(it.file); usbList(); } else usbShow();
  }

  function usbBack(all) {
    if (usb.view && !all) { usbCloseView(); return; }
    if (usb.stack.length > 1 && !all) { var left = usb.stack.pop().name; usbList(left); return; }
    clearInterval(usb.awake);
    usb = null;
    var u = $('usb');
    if (u) { u.innerHTML = ''; setClass(u, 'on', false); }
  }

  // MARK: - The row along the bottom

  function drawer(d) {
    items = [];
    var inputs = h.inputs(), apps = h.apps(), i;
    for (i = 0; i < inputs.length; i++) {
      // One HDMI is all this office uses: the first port the TV has.
      if (inputs[i].key !== 'live') { items.push({label: inputs[i].label, symbol: inputs[i].symbol, run: h.launcher(inputs[i].id, inputs[i].label)}); break; }
    }
    if (tvHas(MIRROR)) items.push({label: tr('Screen Mirroring'), symbol: 'cast', run: mirrorGuide});
    var groupStart = items.length;
    if (tvHas(USB)) items.push({label: 'USB', icon: 'icons/usb.svg', run: openUsb});
    items.push({label: tr('Home Settings'), symbol: 'settings', run: h.openSettings});
    var yt = null;
    for (i = 0; i < apps.length && !yt; i++) if (/youtube/i.test(apps[i].id + ' ' + apps[i].title) && !/kids|tv$|test/i.test(apps[i].id)) yt = apps[i];
    if (yt) items.push({label: yt.title, small: true, run: h.launcher(yt.id, yt.title)});
    // As wide as 220 while the row fits beside YouTube's small key in the far corner.
    var gap = 18, groupGap = 56, xPos = 80, big = items.length - (yt ? 1 : 0);
    var w = Math.min(220, (1760 - (yt ? 150 + 40 : 0) - (big - 1) * gap - (groupGap - gap)) / Math.max(1, big));
    startAt(el('div', 'row-title', d, tr('Inputs')), 84);
    for (var k = 0; k < items.length; k++) {
      var item = items[k], key = el('div', 'key glass' + (item.small ? ' small' : ''), d);
      if (k === groupStart) {
        xPos += groupGap - gap;
        startAt(el('div', 'row-title', d, tr('Shortcuts')), xPos + 4);
      }
      if (item.small) {
        endAt(key, 80);   // YouTube, small, in the far corner
        el('img', '', key).src = 'icons/youtube.png';
      } else {
        startAt(key, xPos);
        key.style.width = w + 'px';
        if (item.icon) icon(key, item.icon); else h.sym(item.symbol, key);
        el('div', 'label', key, item.label);
        xPos += w + gap;
      }
      h.hover(key, Z.DRAWER, k);
    }
    st.drawer = Math.max(0, Math.min(st.drawer, items.length - 1));
    info(Date.now());
    return {items: items, inputs: groupStart};
  }

  // MARK: - The weather, and the line above the row

  /** One column of a line: its label, its big line (spans by class), the line under it. */
  function fill(col, label, spans, sub) {
    put(col.children[0], label);
    var big = col.children[1], sig = JSON.stringify(spans);
    if (big.getAttribute('data-sig') !== sig) {
      big.setAttribute('data-sig', sig);
      big.innerHTML = '';
      for (var i = 0; i < spans.length; i++) el('span', spans[i][0], big, spans[i][1]);
    }
    put(col.children[2], sub);
    setClass(col, 'empty', !label);
  }

  function column(parent) {
    var col = el('div', 'col', parent);
    el('div', 'lbl', col);
    el('div', 'big', col);
    el('div', 'sub', col);
    return col;
  }

  /** The next prayer and the next occasion into two columns. */
  function prayerColumns(cols, at) {
    var n = nextPrayer(at), o = prayerOn() ? Prayer.occasion(at, offset()) : null;
    fill(cols[0], n ? Prayer.text('next') : '', n ? [['nm', Prayer.name(n.key, n.at)], ['tm', formatDate('format|h:mm a', n.at)]] : [],
      n ? Prayer.after(n.at - at) : '');
    fill(cols[1], o ? Prayer.text(o.key) + ' ' + I18N.digits(o.year) : '',
      o ? (o.days ? [['num', I18N.digits(o.days)], ['unit', Prayer.dayWord(o.days)]] : [['nm', Prayer.text('today')]]) : [],
      o ? formatDate('format|EEEE, MMMM d', o.at) : '');
    return !!(n || o);
  }

  var wx = null, bar = null;

  function info(at) {
    if (!wx) {
      wx = el('div', '', $('top'));
      wx.id = 'wxbox';
      el('div', 'big', wx);
      el('div', 'sub', wx);
      el('div', 'rule', wx);
      bar = el('div', '', $('top'));
      bar.id = 'infobar';
      column(bar);
      column(bar);
    }
    var w = Prefs.weather() ? Data.weather : null;
    put(wx.children[0], w ? Data.degrees(w.temp) + '  ' + Data.condition(w.code, w.isDay) : '');
    put(wx.children[1], w ? (Data.city ? Data.city + ' · ' : '') + Data.degrees(w.max) + ' / ' + Data.degrees(w.min) : '');
    setClass(wx, 'empty', !w);
    for (var i = 0; i < 2; i++) startAt(bar.children[i], i * 520);   // each time: the language may have changed sides
    setClass(bar, 'empty', !prayerColumns(bar.children, at));
    netPill();
  }

  // MARK: - Focus: the pills on top, the row below; nothing else on this screen

  function focus() {
    if (!h.sheetOpen() && st.zone !== Z.DRAWER && st.zone !== Z.TOP) st.zone = Z.DRAWER;
  }

  function move(dx, dy) {
    if (guideOn) return true;
    if (usb) { usbMove(dx, dy); return true; }
    if (st.zone === Z.DRAWER) {
      if (dx) st.drawer = Math.max(0, Math.min(items.length - 1, st.drawer + dx));
      else if (dy < 0) {
        st.zone = Z.TOP;
        st.top = 3 + h.nearest($('buttons').children, h.centerX(document.querySelectorAll('#drawer .key')[st.drawer]));
      }
      return true;
    }
    if (st.zone === Z.TOP) {
      if (dx) st.top = Math.max(3, Math.min(2 + PILLS.length, st.top + dx));
      else if (dy > 0) st.zone = Z.DRAWER;
      return true;
    }
    return false;
  }

  function activate() {
    if (guideOn) { hideGuide(); return true; }
    if (usb) { usbOk(); return true; }
    if (st.zone !== Z.TOP) return false;   // the row's keys run as the drawer's
    PILLS[st.top - 3][0]();
    return true;
  }

  /** Back on this screen leaves the app, as on the home screen of the TV. */
  function back() {
    if (guideOn) { hideGuide(); return true; }
    if (usb) { usbBack(); return true; }
    if (st.zone !== Z.DRAWER && st.zone !== Z.TOP) return false;
    TV.back();
    return true;
  }

  // MARK: - Screensaver, in UrTV's layout

  var saverOn = false, saverTimer = 0, shiftTimer = 0, shiftStep = 0, saverIndex = 0;
  // Burn-in care for a screen that can stay on all night: everything on it moves a few pixels every 4 minutes along a
  // small path, and from 9 pm the screen dims to about half by 11 pm, until 5 am, back to normal at 7 am.
  var SHIFT = [[0, 0], [3, 2], [0, 4], [-3, 2], [-3, -2], [0, -4], [3, -2]];

  function saver(s) {
    var photos = h.saverPhotos();
    saverOn = true;
    h.setSaverPick(null);
    s.innerHTML = '';
    var a = el('div', 'photo', s), b = el('div', 'photo', s);
    el('div', 'dark', a);
    el('div', 'dark', b);
    el('div', 'veil', s);
    var stg = el('div', 'stg', s);
    var dates = el('div', 'dates', stg);
    el('div', 'hijri', dates);
    el('div', 'greg', dates);
    el('div', 'rule', dates);
    var weather = el('div', 'wx', stg);
    el('div', 'big', weather);
    el('div', 'sub', weather);
    var ck = el('div', 'sclock', stg);
    el('div', 'digits', ck);
    el('div', 'zone', ck);
    var bottom = el('div', 'bottom', stg), cols = [column(bottom), column(bottom), column(bottom)];
    var title = el('div', 'title', stg), hint = el('div', 'hint', stg);
    if (CONFIG.officeLabel) startAt(el('div', 'org', stg, CONFIG.officeLabel), 72);   // above the prayer line
    el('div', 'dim', s);
    startAt(dates, 72);
    endAt(weather, 72);
    startAt(ck, 120);
    startAt(cols[0], 0);
    startAt(cols[1], 590);
    startAt(cols[2], 1110);
    startAt(title, 72);
    startAt(hint, 72);
    clearInterval(shiftTimer);
    shiftTimer = setInterval(shift, 240000);
    var front = a;
    function next() {
      if (!saverOn) return;
      var p = photos.length ? photos[saverIndex++ % photos.length] : null, bg = background(Date.now());
      var url = p ? Data.image(p.backdrop, 'original') : 'backgrounds/' + bg[0] + '.jpg';
      if (front.getAttribute('data-url') !== url) {
        var back = front === a ? b : a, was = front;
        back.setAttribute('data-url', url);
        back.style.backgroundImage = 'url(' + url + ')';
        back.firstChild.style.opacity = p ? 0.2 : Math.round((1 - bg[1]) * 100) / 100;
        setClass(back, 'settle', false);
        front = back;
        setTimeout(function () {
          setClass(back, 'on', true);
          setClass(back, 'settle', true);   // a slow 60 s settle, then still: no endless drift for the TV to redraw
          setClass(was, 'on', false);
        }, 60);
      }
      h.setSaverPick(p);
      put(title, p ? p.title : '');
      // With Watch from the screensaver on, OK opens this title's app (any other key only closes).
      var target = p && Prefs.saverWatch() ? h.pickTarget(p) : null;
      put(hint, target ? trf('Press OK to watch on {app} · any other button to close', {app: target.app.title}) : '');
      tickSaver();
      saverTimer = setTimeout(next, p ? 12000 : 60000);
    }
    next();
    return true;
  }

  function hideSaver() {
    saverOn = false;
    clearTimeout(saverTimer);
    clearInterval(shiftTimer);
  }

  /** Fills the screensaver's text; called every few seconds, it writes only what changed. */
  function tickSaver() {
    var s = $('saver'), d = new Date(), at = d.getTime(), w = Data.weather;
    if (!saverOn || !s.querySelector('.stg')) return false;
    var parts = dayParts(at), hijri = prayerOn() ? Prayer.hijri(at, offset()) : '';
    put(s.querySelector('.hijri'), hijri ? parts[0] + (h.rtl() ? '، ' : ', ') + hijri : formatDate('format|EEEE, MMMM d', at));
    put(s.querySelector('.greg'), hijri ? formatDate('format|EEEE, MMMM d', at) + ' ' + I18N.digits(d.getFullYear()) : '');
    clockDigits(s.querySelector('.digits'), at);
    put(s.querySelector('.zone'), Data.city ? (window.Prayer ? Prayer.text('timeIn') : '') + Data.city : '');
    put(s.querySelector('.wx .big'), w ? Data.degrees(w.temp) + '  ' + Data.condition(w.code, w.isDay) : '');
    put(s.querySelector('.wx .sub'), w ? (Data.city ? Data.city + ' · ' : '') + Data.degrees(w.max) + ' / ' + Data.degrees(w.min) : '');
    var cols = s.querySelectorAll('.bottom .col');
    prayerColumns(cols, at);
    var days = w && w.days ? w.days.slice(1, 4) : [], list = [];
    for (var i = 0; i < days.length; i++) list.push(['day', Data.weekday(days[i].at) + ' ' + Data.degrees(days[i].max)]);
    fill(cols[2], days.length ? tr('Next days') : '', list, w ? Data.condition(w.code, w.isDay) : '');
    s.querySelector('.dim').style.opacity = dimAt(d);
    return true;
  }

  function shift() {
    shiftStep = (shiftStep + 1) % SHIFT.length;
    var p = SHIFT[shiftStep], stg = $('saver').querySelector('.stg');
    if (stg) stg.style.webkitTransform = stg.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)';
  }

  /** The dimmer's opacity for a time of day: 0 by day, rising 9-11 pm to 0.46, held until 5 am, falling to 0 by 7 am. */
  function dimAt(d) {
    var hour = d.getHours() + d.getMinutes() / 60;
    if (hour >= 23 || hour < 5) return 0.46;
    if (hour >= 21) return Math.round((hour - 21) / 2 * 46) / 100;
    if (hour >= 7) return 0;
    return Math.round((7 - hour) / 2 * 46) / 100;
  }

  return {
    focus: focus,
    buttons: buttons,
    clock: clock,
    drawer: drawer,
    panels: function () { info(Date.now()); return true; },
    move: move,
    activate: activate,
    back: back,
    saver: saver,
    hideSaver: hideSaver,
    tickSaver: tickSaver,
    night: skyPhoto
  };
};
