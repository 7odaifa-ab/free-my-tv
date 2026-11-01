/*
 * Prayer times and the Hijri date, worked out on the TV: no account, no network. Umm al-Qura (Saudi Arabia's method):
 * Fajr with the sun 18.5° below the horizon, Isha 90 minutes after Maghrib (120 in Ramadan), Asr when a shadow is as long
 * as the object plus its noon shadow. The sun's position is the usual low-precision one (good to about a minute).
 * Off unless config.properties says prayer_times=true. Names are in Arabic and English only; other languages show English.
 * ES5, like the rest of web/.
 */
var Prayer = (function () {
  'use strict';

  var RAD = Math.PI / 180;
  function sin(d) { return Math.sin(d * RAD); }
  function cos(d) { return Math.cos(d * RAD); }
  function tan(d) { return Math.tan(d * RAD); }
  function fix(a, b) { return a - b * Math.floor(a / b); }

  /** The Julian day of a calendar day at 0h UT. */
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  }

  /** The sun's declination (degrees) and the equation of time (hours) at a Julian day. */
  function sun(jd) {
    var n = jd - 2451545.0;
    var g = fix(357.529 + 0.98560028 * n, 360);
    var q = fix(280.459 + 0.98564736 * n, 360);
    var l = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    var e = 23.439 - 0.00000036 * n;
    var ra = fix(Math.atan2(cos(e) * sin(l), cos(l)) / RAD / 15, 24);
    return {decl: Math.asin(sin(e) * sin(l)) / RAD, eqt: fix(q / 15 - ra + 12, 24) - 12};
  }

  /** Hours (0-24, the city's own clock) from a day's local midnight, or NaN where the sun never gets that far (polar summer and winter). */
  function hours(y, m, d, lat, lon, tz, ramadan) {
    var jd = julian(y, m, d) - lon / (15 * 24), s = sun(jd + 0.5);
    var noon = 12 + tz - lon / 15 - s.eqt;
    // Hours from noon until the sun is `below` degrees under the horizon (a negative `below` is above it).
    function from(below) {
      return Math.acos((-sin(below) - sin(s.decl) * sin(lat)) / (cos(s.decl) * cos(lat))) / RAD / 15;
    }
    var asr = -Math.atan(1 / (1 + tan(Math.abs(lat - s.decl)))) / RAD;
    var maghrib = noon + from(0.833);
    return {
      fajr: noon - from(18.5),
      sunrise: noon - from(0.833),
      dhuhr: noon,
      asr: noon + from(asr),
      maghrib: maghrib,
      isha: maghrib + (ramadan ? 120 : 90) / 60
    };
  }

  var KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  /** The calendar the TV's browser knows, or null (old Chromium lacks Umm al-Qura). */
  function formatter(locale, options) {
    try {
      var f = new Intl.DateTimeFormat(locale + '-u-ca-islamic-umalqura-nu-' + (locale === 'ar-SA' ? 'arab' : 'latn'), options);
      return f.resolvedOptions().calendar === 'islamic-umalqura' ? f : null;
    } catch (e) {
      return null;
    }
  }

  function shifted(ms, offset) { return new Date(ms + (offset || 0) * 86400000); }

  /** The Hijri date in words ("6 جمادى الأولى 1448 هـ"), or '' where the TV can't. */
  function hijri(ms, offset) {
    var f = formatter(arabic() ? 'ar-SA' : 'en-US', {day: 'numeric', month: 'long', year: 'numeric'});
    return f ? f.format(shifted(ms, offset)) : '';
  }

  function ramadan(ms, offset) {
    var f = formatter('en-US', {month: 'numeric'});
    return f ? f.format(shifted(ms, offset)) === '9' : false;
  }

  // The year's occasions in the Umm al-Qura calendar: [month, day, key].
  var OCCASIONS = [[9, 1, 'ramadan'], [10, 1, 'fitr'], [12, 10, 'adha']], occasionCache = null;

  /**
   * The next of Ramadan, Eid al-Fitr and Eid al-Adha: {key, days, at, year} (at: that day's noon), or null where the TV has
   * no Umm al-Qura calendar. Worked out once a day: up to a year of days, one by one.
   */
  function occasion(ms, offset) {
    var local = new Date(ms), day = local.getFullYear() * 10000 + local.getMonth() * 100 + local.getDate();
    if (occasionCache && occasionCache.day === day) return occasionCache.value;
    var f = formatter('en-US', {month: 'numeric', day: 'numeric', year: 'numeric'}), value = null;
    var noon = new Date(ms);
    noon.setHours(12, 0, 0, 0);
    for (var i = 0; f && i < 400 && !value; i++) {
      var at = noon.getTime() + i * 86400000, parts = f.format(shifted(at, offset)).split(/[\/ ,]+/);
      for (var k = 0; k < OCCASIONS.length; k++) {
        if (+parts[0] === OCCASIONS[k][0] && +parts[1] === OCCASIONS[k][1]) {
          value = {key: OCCASIONS[k][2], days: i, at: at, year: parts[2]};
          break;
        }
      }
    }
    occasionCache = {day: day, value: value};
    return value;
  }

  function arabic() { return typeof I18N !== 'undefined' && I18N.base === 'ar'; }

  /**
   * The six times of the day that `ms` falls in, as instants (ms): {fajr, sunrise, dhuhr, asr, maghrib, isha}, or null.
   * The day is the TV's own, and its time zone must be the city's (Riyadh's +3 all year for Jeddah).
   */
  function times(ms, lat, lon, offset) {
    var now = new Date(ms), tz = -now.getTimezoneOffset() / 60;
    var h = hours(now.getFullYear(), now.getMonth() + 1, now.getDate(), +lat, +lon, tz, ramadan(ms, offset));
    var base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()), out = {};
    for (var i = 0; i < KEYS.length; i++) {
      if (!isFinite(h[KEYS[i]])) return null;
      out[KEYS[i]] = Math.round(base + (h[KEYS[i]] - tz) * 3600000);
    }
    return out;
  }

  /** The next prayer after `ms` (never the sunrise): {key, at}, the next day's Fajr after Isha. */
  function next(ms, lat, lon, offset) {
    var t = times(ms, lat, lon, offset);
    if (!t) return null;
    var list = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (var i = 0; i < list.length; i++) if (t[list[i]] > ms) return {key: list[i], at: t[list[i]]};
    var tomorrow = times(ms + 86400000, lat, lon, offset);
    return tomorrow ? {key: 'fajr', at: tomorrow.fajr} : null;
  }

  var TEXT = {
    ar: {fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
      jumuah: 'الجمعة', title: 'مواقيت اليوم', next: 'الصلاة القادمة', after: 'بعد ', and: ' و ', less: 'أقل من دقيقة',
      morning: 'صباح الخير', evening: 'مساء الخير', night: 'تصبح على خير', ramadan: 'رمضان', fitr: 'عيد الفطر',
      adha: 'عيد الأضحى', today: 'اليوم', timeIn: 'بتوقيت '},
    en: {fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
      jumuah: "Jumu'ah", title: "Today's prayers", next: 'Next prayer', after: 'in ', and: ' ', less: 'under a minute',
      morning: 'Good morning', evening: 'Good evening', night: 'Good night', ramadan: 'Ramadan', fitr: 'Eid al-Fitr',
      adha: 'Eid al-Adha', today: 'today', timeIn: ''}
  };

  function text(key) { return TEXT[arabic() ? 'ar' : 'en'][key]; }

  function digits(s) { return typeof I18N !== 'undefined' ? I18N.digits(s) : String(s); }

  /** A prayer's name on that day: Dhuhr is Jumu'ah on Fridays. */
  function name(key, at) { return key === 'dhuhr' && new Date(at).getDay() === 5 ? text('jumuah') : text(key); }

  /** A count of hours, minutes or days in Arabic: the word alone for one, its dual for two, plural 3-10, singular after. */
  function count(n, one, two, few, many) {
    return n === 1 ? one : n === 2 ? two : digits(n) + ' ' + (n % 100 >= 3 && n % 100 <= 10 ? few : many);
  }

  /** "بعد ساعتين و ٣٤ دقيقة" / "in 2h 34m" for a wait in ms. */
  function after(wait) {
    var min = Math.ceil(wait / 60000), h = Math.floor(min / 60), m = min % 60;
    if (min < 1) return text('after') + text('less');
    if (!arabic()) return ('in ' + (h ? h + 'h ' : '') + (m || !h ? m + 'm' : '')).replace(/\s+$/, '');
    var hours = h ? count(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة') : '';
    var mins = m ? count(m, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة') : '';
    return text('after') + hours + (hours && mins ? text('and') : '') + mins;
  }

  /** "يوم", "يومان", "أيام", "يوم" after a number of days (the number itself is drawn apart, big). */
  function dayWord(n) {
    if (!arabic()) return n === 1 ? 'day' : 'days';
    return n === 2 ? 'يومان' : n % 100 >= 3 && n % 100 <= 10 ? 'أيام' : 'يوم';
  }

  /** صباح الخير from 4 am, مساء الخير from noon, تصبح على خير from 11 pm. */
  function greeting(d) {
    var h = d.getHours();
    return text(h >= 4 && h < 12 ? 'morning' : h >= 12 && h < 23 ? 'evening' : 'night');
  }

  return {keys: KEYS, times: times, next: next, hijri: hijri, text: text, name: name, after: after,
    occasion: occasion, dayWord: dayWord, greeting: greeting, digits: digits};
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Prayer;
