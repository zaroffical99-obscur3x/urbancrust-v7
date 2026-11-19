/* ============================================================
   URBAN CRUST — VISITOR ANALYTICS (consent based)
   Sends visit info to https://api.powertree.site/collect
   Nothing is sent until the visitor taps "Allow".
   Respects Do Not Track / Global Privacy Control.
   IP address is NOT collected in the browser: your server reads
   it from the request itself (see collect_server_example.py).
============================================================ */
(function () {
  var ENDPOINT = window.UC_TRACK_ENDPOINT || 'https://api.powertree.site/collect';
  var SITE = location.hostname.indexOf('sweets') > -1 ? 'urbansip' : 'urbancrust';
  var KEY_CONSENT = 'uc_consent_v1', KEY_VID = 'uc_vid', KEY_INT = 'uc_interests';

  function ls(get, k, v) { try { return get ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } }
  function ss(get, k, v) { try { return get ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function uid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  var consent = dnt ? 'no' : ls(true, KEY_CONSENT);
  var pageStart = Date.now(), maxScroll = 0, sent = 0;

  var vid = ls(true, KEY_VID) || (function () { var v = uid(); ls(false, KEY_VID, v); return v; })();
  var sid = ss(true, 'uc_sid') || (function () { var v = uid(); ss(false, 'uc_sid', v); return v; })();

  function device() {
    var ua = navigator.userAgent || '';
    var type = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet' : (/Mobi|iPhone|Android/i.test(ua) ? 'mobile' : 'desktop');
    var os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
    var br = /Edg\//i.test(ua) ? 'Edge' : /OPR\/|Opera/i.test(ua) ? 'Opera' : /SamsungBrowser/i.test(ua) ? 'Samsung Internet' : /Firefox\//i.test(ua) ? 'Firefox' : /Chrome\//i.test(ua) ? 'Chrome' : /Safari\//i.test(ua) ? 'Safari' : 'Other';
    var c = navigator.connection || {};
    return {
      type: type, os: os, browser: br, ua: ua.slice(0, 240),
      lang: navigator.language || '', tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '',
      screen: screen.width + 'x' + screen.height, viewport: innerWidth + 'x' + innerHeight, dpr: window.devicePixelRatio || 1,
      net: c.effectiveType || '', pwa: !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches)
    };
  }

  // ---- interests (kept on the visitor's device, top ones are sent along) ----
  function bumpInterest(key, n) {
    if (!key) return;
    try {
      var o = JSON.parse(ls(true, KEY_INT) || '{}');
      o[key] = (o[key] || 0) + (n || 1);
      var keys = Object.keys(o);
      if (keys.length > 40) { keys.sort(function (a, b) { return o[a] - o[b]; }); delete o[keys[0]]; }
      ls(false, KEY_INT, JSON.stringify(o));
    } catch (e) {}
  }
  function topInterests() {
    try {
      var o = JSON.parse(ls(true, KEY_INT) || '{}');
      return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).slice(0, 6).map(function (k) { return { k: k, n: o[k] }; });
    } catch (e) { return []; }
  }

  function send(type, data, useBeacon) {
    if (consent !== 'yes') return;
    var body = JSON.stringify({
      type: type, site: SITE, vid: vid, sid: sid, ts: new Date().toISOString(),
      page: location.pathname.split('/').pop() || 'index.html', url: location.href.slice(0, 300),
      ref: (document.referrer || '').slice(0, 300), device: device(), interests: topInterests(), data: data || {}
    });
    sent++;
    try {
      if (useBeacon && navigator.sendBeacon) { navigator.sendBeacon(ENDPOINT, body); return; }
      fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: body }).catch(function () {});
    } catch (e) {}
  }

  window.ucTrack = function (type, data) {
    data = data || {};
    if (type === 'category') bumpInterest('cat:' + data.cat);
    if (type === 'search') bumpInterest('q:' + data.q);
    if (type === 'add_to_cart') bumpInterest('item:' + data.item, 2);
    if (type === 'poster_open') bumpInterest('poster:' + data.title);
    send(type, data);
  };

  // ---- automatic click tracking ----
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a');
    if (a) {
      var h = a.getAttribute('href') || '';
      if (h.indexOf('wa.me') > -1) return ucTrack('whatsapp_click', { where: a.className.slice(0, 40) });
      if (h.indexOf('tel:') === 0) return ucTrack('call_click', {});
      if (a.classList.contains('nav-sip') || a.classList.contains('nav-crust') || a.classList.contains('btn-sip') || a.classList.contains('btn-crust')) return ucTrack('cross_brand_click', { to: h });
      if (h.indexOf('google.com/maps') > -1) return ucTrack('directions_click', {});
    }
    var b = t.closest('.add-to-cart-btn');
    if (b) { var card = b.closest('.menu-item'); var nm = card && card.querySelector('.item-name'); return ucTrack('add_to_cart', { item: nm ? nm.textContent.trim().slice(0, 60) : '' }); }
    var p = t.closest('[data-pop]');
    if (p) return ucTrack('poster_open', { title: (p.dataset.title || '').slice(0, 60) });
  }, true);

  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) maxScroll = Math.max(maxScroll, Math.round(scrollY / h * 100));
  }, { passive: true });

  var ended = false;
  function endSession() {
    if (ended) return; ended = true;
    send('page_exit', { seconds: Math.round((Date.now() - pageStart) / 1000), scroll: maxScroll }, true);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { endSession(); ended = false; pageStart = Date.now(); } });
  window.addEventListener('pagehide', endSession);

  // ---- consent banner ----
  function buildBanner() {
    if (document.getElementById('ucConsent')) return;
    var d = document.createElement('div');
    d.id = 'ucConsent'; d.className = 'uc-consent'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Privacy choices');
    d.innerHTML =
      '<div class="ucc-ico"><i class="fas fa-cookie-bite"></i></div>' +
      '<div class="ucc-body"><b>Help us serve you better</b>' +
      '<p>With your OK we record your device &amp; browser type, the pages you view, what you search or tap, and your IP address (seen by our server) to improve our menu. No payment or personal details.</p>' +
      '<div class="ucc-acts"><button type="button" class="ucc-yes">Allow</button><button type="button" class="ucc-no">No thanks</button></div></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('show'); });
    d.querySelector('.ucc-yes').onclick = function () { setConsent('yes'); };
    d.querySelector('.ucc-no').onclick = function () { setConsent('no'); };
  }
  function setConsent(v) {
    consent = v; ls(false, KEY_CONSENT, v);
    var d = document.getElementById('ucConsent');
    if (d) { d.classList.remove('show'); setTimeout(function () { d.remove(); }, 400); }
    if (v === 'yes') { send('pageview', { first_visit: !ls(true, 'uc_seen') }); ls(false, 'uc_seen', '1'); if (window.ucToast) ucToast('Thanks! Analytics on.', 'fa-heart'); }
    else { try { localStorage.removeItem(KEY_INT); } catch (e) {} }
  }
  window.ucConsent = { open: function () { buildBanner(); }, reset: function () { try { localStorage.removeItem(KEY_CONSENT); } catch (e) {} consent = null; buildBanner(); } };

  function init() {
    if (dnt) return;
    if (consent === 'yes') { send('pageview', { returning: !!ls(true, 'uc_seen') }); ls(false, 'uc_seen', '1'); }
    else if (consent !== 'no') {
      var onMenu = /urban-menu/.test(location.pathname), t0 = Date.now();
      (function tryShow() {
        if (document.querySelector('.pop-ov.show')) return setTimeout(tryShow, 700);              // wait for welcome popup to close
        if (!onMenu && !ss(true, 'ucPromo') && !ss(true, 'ucPromoSip') && Date.now() - t0 < 7000) return setTimeout(tryShow, 700);
        buildBanner();
      })();
    }
    var l = document.querySelectorAll('[data-privacy-link]');
    for (var i = 0; i < l.length; i++) l[i].addEventListener('click', function (ev) { ev.preventDefault(); window.ucConsent.reset(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
