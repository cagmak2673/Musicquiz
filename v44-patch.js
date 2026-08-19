/* =========================================================================
 * v44 PATCH — Music Quiz PRO
 *  1) Mobil klavye açıkken sohbetin görünmesi (Göz Bağlı Kaptan + tüm ekranlar)
 *  2) prompt/confirm kullanan akışların uygulama içi modale taşınması
 *     (webview/iframe'de prompt engellendiği için premium & YouTube çalışmıyordu)
 *  3) Premium avantajlarının gerçekten uygulanması (2× XP, günlük joker, rozet)
 *  4) YENİ MOD: Müzik Zaman Makinesi (Nostalji Radarı)
 *  5) YENİ MOD: 4x4 Hızlı Parmak (grid eleme)
 * ========================================================================= */
(function () {
  'use strict';
  if (window.__V44__) return;
  window.__V44__ = true;

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toast(m) { try { if (window.toast) return window.toast(m); } catch (e) {} try { console.log(m); } catch (e) {} }
  function db() { try { return window.db || (window.firebase && window.firebase.database()); } catch (e) { return null; } }
  function ref(p) { try { var d = db(); return d ? d.ref(p) : null; } catch (e) { return null; } }
  function uid() { return (window.currentUser && window.currentUser.uid) || window.playerId || 'guest'; }
  function nick() { return window.nickname || 'Misafir'; }
  function avatar() { return window.userAvatar || '👤'; }
  function show(id) { try { window.showScreen && window.showScreen(id); } catch (e) {} }

  /* Misafirler için anonim Firebase oturumu (odalı modlar auth ister) */
  (function ensureAnonAuth() {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (tries > 40) return clearInterval(iv);
      try {
        if (!window.firebase || !window.firebase.auth) return;
        var a = window.firebase.auth();
        if (a.currentUser) return clearInterval(iv);
        clearInterval(iv);
        a.signInAnonymously().catch(function () { /* anonim giriş kapalıysa sessiz geç */ });
      } catch (e) {}
    }, 800);
  })();

  /* =====================================================================
   * 0) STİL
   * ===================================================================== */
  var css = document.createElement('style');
  css.textContent = [
    /* --- mobil klavye / görünür alan --- */
    '@media (max-width:519px){ .app{ height:var(--vvh,100dvh)!important; max-height:none!important; } }',
    'body.v44-kb{ align-items:flex-start!important; }',
    '#v43bk .bk-chat{ max-height:min(38vh,220px); min-height:96px; }',
    '#v43bk .bk-input-row{ position:sticky; bottom:0; z-index:4; background:var(--card); padding:8px 0 4px; }',
    '#v43bk #v43BkQuick{ max-height:88px; overflow:auto; }',
    'body.v44-kb #v43bk .bk-quick{ display:none; }',
    'body.v44-kb #v43BkStart{ display:none; }',
    /* --- modal --- */
    '.v44-ov{position:fixed;inset:0;background:rgba(6,8,20,.62);backdrop-filter:blur(6px);z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;}',
    '.v44-modal{width:min(400px,100%);background:var(--card);border:1px solid var(--border);border-radius:24px;padding:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:12px;}',
    '.v44-modal h3{font-size:17px;font-weight:900;margin:0;color:var(--text);}',
    '.v44-modal p{margin:0;font-size:13px;color:var(--text2);white-space:pre-line;line-height:1.45;}',
    '.v44-modal input{width:100%;padding:13px 14px;border-radius:14px;border:1px solid var(--border-strong);background:var(--card-soft);color:var(--text);font-size:15px;font-family:inherit;}',
    '.v44-row{display:flex;gap:8px;}',
    '.v44-row button{flex:1;padding:12px;border-radius:14px;font-weight:900;font-size:14px;cursor:pointer;border:1px solid var(--border-strong);background:var(--card-soft);color:var(--text);font-family:inherit;}',
    '.v44-row button.pri{background:var(--accent-grad);color:#fff;border-color:transparent;}',
    /* --- zaman makinesi --- */
    '#v44tm .v44-decades{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}',
    '#v44tm .v44-dec{padding:18px 12px;border-radius:20px;border:1px solid var(--border);background:linear-gradient(180deg,var(--card),var(--card-soft));font-weight:900;font-size:16px;color:var(--text);cursor:pointer;font-family:inherit;}',
    '#v44tm .v44-dec.on{background:var(--accent-grad);color:#fff;border-color:transparent;}',
    '#v44tm .v44-opt{width:100%;padding:14px;border-radius:16px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:800;font-size:14px;margin-bottom:8px;cursor:pointer;text-align:left;font-family:inherit;}',
    '#v44tm .v44-opt.ok{background:var(--success-grad,linear-gradient(135deg,#10B981,#34d399));color:#fff;border-color:transparent;}',
    '#v44tm .v44-opt.no{background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;border-color:transparent;}',
    '.v44-cover{width:150px;height:150px;border-radius:24px;object-fit:cover;margin:0 auto;display:block;box-shadow:var(--shadow);}',
    /* --- 4x4 grid --- */
    '#v44gr .v44-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;}',
    '#v44gr .v44-cell{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--card-soft);cursor:pointer;padding:0;}',
    '#v44gr .v44-cell img{width:100%;height:100%;object-fit:cover;display:block;}',
    '#v44gr .v44-cell.taken{opacity:.32;pointer-events:none;filter:grayscale(1);}',
    '#v44gr .v44-cell.miss{animation:v44shake .4s;}',
    '#v44gr .v44-cell .tag{position:absolute;left:0;right:0;bottom:0;font-size:9px;font-weight:900;padding:3px 4px;background:rgba(8,10,22,.72);color:#fff;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '@keyframes v44shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}',
    '#v44gr .v44-scores{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}',
    '#v44gr .v44-sc{padding:6px 10px;border-radius:12px;background:var(--card-soft);border:1px solid var(--border);font-size:12px;font-weight:900;color:var(--text);}',
    '#v44gr .v44-sc.me{background:var(--accent-grad);color:#fff;border-color:transparent;}'
  ].join('\n');
  document.head.appendChild(css);

  /* =====================================================================
   * 1) MOBİL KLAVYE / GÖRÜNÜR ALAN FIX
   * ===================================================================== */
  var vv = window.visualViewport;
  function applyViewport() {
    var h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty('--vvh', Math.round(h) + 'px');
    var kb = vv ? (window.innerHeight - vv.height > 120) : false;
    document.body.classList.toggle('v44-kb', !!kb);
    if (kb) {
      var el = document.activeElement;
      if (el && /INPUT|TEXTAREA/.test(el.tagName)) {
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
      }
    }
  }
  if (vv) { vv.addEventListener('resize', applyViewport); vv.addEventListener('scroll', applyViewport); }
  window.addEventListener('orientationchange', function () { setTimeout(applyViewport, 250); });
  window.addEventListener('resize', applyViewport);
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t || !/INPUT|TEXTAREA/.test(t.tagName)) return;
    setTimeout(function () {
      applyViewport();
      try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) {}
      var chat = $('v43BkChat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }, 320);
  });
  document.addEventListener('focusout', function () { setTimeout(applyViewport, 250); });
  applyViewport();

  /* =====================================================================
   * 2) UYGULAMA İÇİ PROMPT / CONFIRM (webview'de native prompt engelli)
   * ===================================================================== */
  function modal(opts) {
    return new Promise(function (resolve) {
      var ov = document.createElement('div');
      ov.className = 'v44-ov';
      var inputHtml = opts.input
        ? '<input id="v44ModalInput" placeholder="' + esc(opts.placeholder || '') + '" value="' + esc(opts.value || '') + '">'
        : '';
      ov.innerHTML =
        '<div class="v44-modal" role="dialog" aria-modal="true">' +
        '<h3>' + esc(opts.title || '') + '</h3>' +
        (opts.text ? '<p>' + esc(opts.text) + '</p>' : '') +
        inputHtml +
        '<div class="v44-row">' +
        '<button type="button" data-a="cancel">' + esc(opts.cancelText || 'Vazgeç') + '</button>' +
        '<button type="button" class="pri" data-a="ok">' + esc(opts.okText || 'Tamam') + '</button>' +
        '</div></div>';
      document.body.appendChild(ov);
      var inp = ov.querySelector('#v44ModalInput');
      if (inp) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
      function done(v) { try { ov.remove(); } catch (e) {} resolve(v); }
      ov.addEventListener('click', function (e) {
        if (e.target === ov) return done(null);
        var a = e.target.getAttribute && e.target.getAttribute('data-a');
        if (a === 'cancel') return done(null);
        if (a === 'ok') return done(opts.input ? ((inp && inp.value) || '') : true);
      });
      ov.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && opts.input) { e.preventDefault(); done((inp && inp.value) || ''); }
        if (e.key === 'Escape') done(null);
      });
    });
  }
  window.v44Ask = function (title, text, placeholder, value) {
    return modal({ title: title, text: text, input: true, placeholder: placeholder, value: value });
  };
  window.v44Confirm = function (title, text, okText) {
    return modal({ title: title, text: text, okText: okText || 'Evet' }).then(function (v) { return v === true; });
  };

  /* Orijinal fonksiyonları, prompt/confirm'i geçici olarak besleyerek çalıştır */
  function runWithAnswers(fn, answers, confirmValue) {
    var op = window.prompt, oc = window.confirm, i = 0;
    window.prompt = function () { var v = answers[i++]; return v === undefined ? null : v; };
    window.confirm = function () { return confirmValue !== false; };
    try { return fn(); } finally {
      setTimeout(function () { window.prompt = op; window.confirm = oc; }, 0);
    }
  }

  function wrapWhenReady(name, wrapper) {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var orig = window[name];
      if (typeof orig === 'function' && !orig.__v44) {
        var next = wrapper(orig);
        next.__v44 = true;
        window[name] = next;
        clearInterval(iv);
      }
      if (tries > 40) clearInterval(iv);
    }, 400);
  }

  /* --- Göz Bağlı Kaptan: oda kodu modal ile --- */
  wrapWhenReady('v43BkOpen', function (orig) {
    return function () {
      window.v44Ask(
        '🙈 Göz Bağlı Kaptan (2v2)',
        'Yeni takım kurmak için boş bırak.\nArkadaşına katılmak için kodu yaz.',
        'Örn. K7QM2'
      ).then(function (code) {
        if (code === null) return;
        runWithAnswers(orig, [String(code || '').trim().toUpperCase()]);
      });
      return true;
    };
  });

  /* --- Müzik odası: YouTube şarkı ekleme --- */
  wrapWhenReady('mrAddYouTube', function (orig) {
    return function () {
      window.v44Ask('🎬 YouTube Şarkı Ekle', 'Video bağlantısı veya 11 haneli ID', 'https://youtu.be/...')
        .then(function (link) {
          if (!link) return;
          return window.v44Ask('🎵 Şarkı adı', '', 'Şarkı adı', 'YouTube Şarkı').then(function (title) {
            if (title === null) return;
            return window.v44Ask('🎤 Sanatçı', '', 'Sanatçı', 'YouTube').then(function (artist) {
              if (artist === null) return;
              runWithAnswers(orig, [link, title || 'YouTube Şarkı', artist || 'YouTube']);
            });
          });
        });
      return true;
    };
  });

  /* --- Müzik odası: YouTube PLAYLIST --- */
  wrapWhenReady('mrAddYouTubePlaylist', function (orig) {
    return function () {
      window.v44Ask(
        '▶ YouTube Playlist Ekle',
        'Playlist bağlantısını yapıştır.\nörn. https://www.youtube.com/playlist?list=PL...',
        'https://www.youtube.com/playlist?list=...'
      ).then(function (link) {
        if (!link) return;
        runWithAnswers(orig, [link]);
      });
      return true;
    };
  });

  /* --- Premium: demo satın alma & iptal --- */
  wrapWhenReady('runDemoPayment', function (orig) {
    return function (productId) {
      var products = (window.MQPremium && window.MQPremium.products) || {};
      var p = products[productId] || products.pro_month || { name: 'Premium', days: 30, price: '₺0 (Demo)' };
      window.v44Confirm(
        '💎 ' + p.name,
        'Tutar: ' + p.price + '\nGerçek bir ödeme alınmaz. Premium ' + p.days + ' gün boyunca aktif olur.',
        'Premium’u Aç'
      ).then(function (ok) {
        if (!ok) return;
        runWithAnswers(function () { return orig(productId); }, [], true);
      });
      return true;
    };
  });
  wrapWhenReady('cancelPremiumDemo', function (orig) {
    return function () {
      window.v44Confirm('Premium kapatılsın mı?', 'Demo aboneliğin kapatılacak.', 'Kapat').then(function (ok) {
        if (!ok) return;
        runWithAnswers(orig, [], true);
      });
      return true;
    };
  });

  /* =====================================================================
   * 3) PREMIUM AVANTAJLARI GERÇEKTEN ÇALIŞSIN
   * ===================================================================== */
  function premiumOn() { try { return !!(window.isPremium && window.isPremium()); } catch (e) { return false; } }

  /* 2× XP */
  (function () {
    var iv = setInterval(function () {
      if (typeof window.addXP !== 'function' || window.addXP.__v44prem) return;
      var orig = window.addXP;
      var next = function (amount) {
        var amt = Number(amount) || 0;
        if (premiumOn()) amt = Math.round(amt * 2);
        return orig.call(this, amt);
      };
      next.__v44prem = true;
      window.addXP = next;
      clearInterval(iv);
    }, 500);
  })();

  /* Günlük joker + reklamsız bayrağı */
  function premiumDaily() {
    if (!premiumOn()) return;
    window.adsDisabled = true;
    var key = 'mq_v44_prem_daily';
    var today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(key) === today) return;
    localStorage.setItem(key, today);
    try {
      window.jokersOwned = window.jokersOwned || {};
      window.jokersOwned.fifty = (Number(window.jokersOwned.fifty) || 0) + 1;
      window.saveState && window.saveState();
      window.updateAllUI && window.updateAllUI();
      toast('👑 Premium günlük hediyen: 1 ⚖️ Yarı Yarıya jokeri!');
    } catch (e) {}
  }
  setInterval(premiumDaily, 5000);
  setTimeout(premiumDaily, 3000);

  /* =====================================================================
   * ORTAK: iTunes parça havuzu
   * ===================================================================== */
  function itunes(term, limit) {
    return fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(term) +
      '&entity=song&limit=' + (limit || 60) + '&country=tr')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        return (j.results || []).filter(function (t) { return t.previewUrl && t.trackName && t.artistName; });
      })
      .catch(function () { return []; });
  }
  function art(t, size) {
    return String(t.artworkUrl100 || '').replace('100x100', (size || 300) + 'x' + (size || 300)) ||
      'https://placehold.co/300x300?text=%F0%9F%8E%B5';
  }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  function uniqByTrack(list) {
    var seen = Object.create(null), out = [];
    list.forEach(function (t) {
      var k = (t.trackName + '|' + t.artistName).toLowerCase();
      if (!seen[k]) { seen[k] = 1; out.push(t); }
    });
    return out;
  }

  /* =====================================================================
   * 4) MÜZİK ZAMAN MAKİNESİ (NOSTALJİ RADARI)
   * ===================================================================== */
  var DECADES = [
    { id: '80', label: "80'ler", from: 1980, to: 1989, terms: ['80s hits', '1980s pop', '80ler turkce', 'new wave 80s', 'disco 80s'] },
    { id: '90', label: "90'lar", from: 1990, to: 1999, terms: ['90s hits', '90lar turkce pop', '90s rock', 'eurodance 90s', '90s rnb'] },
    { id: '00', label: '2000’ler', from: 2000, to: 2009, terms: ['2000s hits', '2000ler turkce pop', '2000s pop rock', '2000s rnb', 'emo 2000s'] },
    { id: '10', label: '2010’lar', from: 2010, to: 2019, terms: ['2010s hits', '2010lar turkce pop', 'edm 2010s', '2010s pop', 'indie 2010s'] }
  ];
  var tm = { decade: null, rounds: [], i: 0, score: 0, audio: null, timer: null, answered: false, birthYear: 0 };

  function tmBuild() {
    if ($('v44tm')) return;
    var app = $('app') || document.body;
    var d = document.createElement('div');
    d.className = 'screen'; d.id = 'v44tm';
    d.innerHTML =
      '<div class="header" style="flex-shrink:0;"><div class="logo">⏳ Zaman Makinesi</div>' +
      '<button class="icon-btn" onclick="v44TmExit()">✕</button></div>' +
      '<div id="v44TmBody" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:12px;padding:2px;"></div>';
    app.appendChild(d);
  }

  window.v44TmOpen = function () {
    tmBuild(); show('v44tm'); tmSetup();
  };
  window.v44TmExit = function () { tmStop(); show('menu'); };

  function tmSetup() {
    var b = $('v44TmBody'); if (!b) return;
    var saved = Number(localStorage.getItem('mq_v44_birth') || 0);
    b.innerHTML =
      '<div style="text-align:center;font-size:13px;color:var(--text2);line-height:1.5;">' +
      'Doğum yılını gir ya da bir dönem seç — o yılların hit şarkılarından sana özel nostalji quizi hazırlayalım.</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<input class="input" id="v44TmYear" inputmode="numeric" maxlength="4" placeholder="Doğum yılın (örn. 1994)" value="' + (saved || '') + '" style="flex:1;">' +
      '<button class="btn" style="width:auto;padding:0 16px;" onclick="v44TmFromYear()">Hesapla</button></div>' +
      '<div id="v44TmHint" style="text-align:center;font-size:12px;color:var(--accent);font-weight:800;min-height:18px;"></div>' +
      '<div class="v44-decades">' +
      DECADES.map(function (d) {
        return '<button class="v44-dec' + (tm.decade === d.id ? ' on' : '') + '" data-dec="' + d.id + '" onclick="v44TmPick(\'' + d.id + '\')">' + esc(d.label) + '</button>';
      }).join('') + '</div>' +
      '<button class="btn" id="v44TmGo" onclick="v44TmStart()">🚀 Zaman Yolculuğunu Başlat</button>' +
      '<div style="text-align:center;font-size:12px;color:var(--text2);">10 soru · her doğru cevap süreye göre puan · Premium ile 2× XP</div>';
    if (tm.decade) tmHint();
  }

  function decOf(id) { for (var i = 0; i < DECADES.length; i++) if (DECADES[i].id === id) return DECADES[i]; return null; }

  window.v44TmPick = function (id) {
    tm.decade = id;
    document.querySelectorAll('#v44tm .v44-dec').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-dec') === id);
    });
    tmHint();
  };
  function tmHint() {
    var h = $('v44TmHint'); var d = decOf(tm.decade); if (!h || !d) return;
    h.textContent = tm.birthYear
      ? '🎯 ' + tm.birthYear + ' doğumlusun — gençlik yılların: ' + d.label
      : '🎯 Seçili dönem: ' + d.label;
  }
  window.v44TmFromYear = function () {
    var el = $('v44TmYear'); var y = parseInt((el && el.value) || '', 10);
    if (!y || y < 1930 || y > new Date().getFullYear()) { toast('Geçerli bir doğum yılı gir'); return; }
    tm.birthYear = y;
    localStorage.setItem('mq_v44_birth', String(y));
    /* 13-19 yaş aralığı = nostalji penceresi */
    var mid = y + 16;
    var best = DECADES[DECADES.length - 1];
    for (var i = 0; i < DECADES.length; i++) if (mid >= DECADES[i].from && mid <= DECADES[i].to) best = DECADES[i];
    if (mid < 1980) best = DECADES[0];
    window.v44TmPick(best.id);
    toast('⏳ ' + best.label + ' senin dönemin!');
  };

  window.v44TmStart = function () {
    var d = decOf(tm.decade);
    if (!d) { toast('Önce bir dönem seç'); return; }
    var go = $('v44TmGo'); if (go) { go.disabled = true; go.textContent = 'Şarkılar toplanıyor…'; }
    Promise.all(shuffle(d.terms).slice(0, 4).map(function (t) { return itunes(t, 60); }))
      .then(function (res) {
        var all = uniqByTrack([].concat.apply([], res));
        var inEra = all.filter(function (t) {
          var y = parseInt(String(t.releaseDate || '').slice(0, 4), 10);
          return y >= d.from && y <= d.to;
        });
        var pool = inEra.length >= 14 ? inEra : all;
        if (pool.length < 8) throw new Error('az');
        pool = shuffle(pool);
        tm.rounds = [];
        for (var i = 0; i < 10 && i < pool.length; i++) {
          var correct = pool[i];
          var others = shuffle(pool.filter(function (t) { return t !== correct; })).slice(0, 3);
          var opts = shuffle([correct].concat(others));
          tm.rounds.push({
            url: correct.previewUrl,
            cover: art(correct, 300),
            year: String(correct.releaseDate || '').slice(0, 4),
            correct: opts.indexOf(correct),
            opts: opts.map(function (t) { return t.trackName + ' — ' + t.artistName; })
          });
        }
        tm.i = 0; tm.score = 0;
        tmRound();
      })
      .catch(function () {
        toast('Şarkılar yüklenemedi, tekrar dene');
        if (go) { go.disabled = false; go.textContent = '🚀 Zaman Yolculuğunu Başlat'; }
      });
  };

  function tmStop() {
    if (tm.audio) { try { tm.audio.pause(); } catch (e) {} tm.audio = null; }
    clearInterval(tm.timer); tm.timer = null;
  }

  function tmRound() {
    var b = $('v44TmBody'); if (!b) return;
    tmStop();
    if (tm.i >= tm.rounds.length) return tmFinish();
    var r = tm.rounds[tm.i];
    tm.answered = false;
    b.innerHTML =
      '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900;color:var(--text2);">' +
      '<span>Soru ' + (tm.i + 1) + '/' + tm.rounds.length + '</span><span id="v44TmT">20</span>' +
      '<span>Puan: <b style="color:var(--accent);">' + tm.score + '</b></span></div>' +
      '<div style="text-align:center;font-size:56px;">🎧</div>' +
      '<div style="text-align:center;font-size:13px;font-weight:800;color:var(--text2);">' +
      esc(decOf(tm.decade).label) + ' — bu şarkı hangisi?</div>' +
      '<div id="v44TmOpts"></div>' +
      '<button class="btn" style="background:var(--card-soft);color:var(--text);" onclick="v44TmReplay()">🔁 Tekrar dinlet</button>';
    var o = $('v44TmOpts');
    o.innerHTML = r.opts.map(function (t, i) {
      return '<button class="v44-opt" data-i="' + i + '">' + esc(t) + '</button>';
    }).join('');
    o.querySelectorAll('.v44-opt').forEach(function (btn) {
      btn.onclick = function () { tmAnswer(Number(btn.getAttribute('data-i'))); };
    });
    try {
      tm.audio = new Audio(r.url); tm.audio.volume = 0.9;
      tm.audio.play().catch(function () { toast('Sesi başlatmak için ekrana dokun'); });
    } catch (e) {}
    var left = 20;
    tm.timer = setInterval(function () {
      left--;
      var t = $('v44TmT'); if (t) t.textContent = left;
      if (left <= 0) { clearInterval(tm.timer); tmAnswer(-1); }
    }, 1000);
  }
  window.v44TmReplay = function () { if (tm.audio) { try { tm.audio.currentTime = 0; tm.audio.play(); } catch (e) {} } };

  function tmAnswer(i) {
    if (tm.answered) return; tm.answered = true;
    clearInterval(tm.timer);
    var r = tm.rounds[tm.i];
    var ok = i === r.correct;
    if (ok) tm.score += 100;
    document.querySelectorAll('#v44TmOpts .v44-opt').forEach(function (btn, k) {
      if (k === r.correct) btn.classList.add('ok');
      else if (k === i) btn.classList.add('no');
    });
    if (ok) { try { window.playBeep && window.playBeep(880, 0.15); } catch (e) {} }
    setTimeout(function () { tm.i++; tmRound(); }, 1400);
  }

  function tmFinish() {
    tmStop();
    var b = $('v44TmBody'); if (!b) return;
    var xp = Math.round(tm.score / 10);
    try {
      if (typeof window.applyPremiumXP === 'function') window.applyPremiumXP(xp);
      else if (typeof window.addXP === 'function') window.addXP(xp);
      window.gold = (window.gold || 0) + Math.round(tm.score / 20);
      window.saveState && window.saveState();
      window.updateAllUI && window.updateAllUI();
    } catch (e) {}
    b.innerHTML =
      '<div style="text-align:center;font-size:62px;">🏁</div>' +
      '<div style="text-align:center;font-size:20px;font-weight:900;">' + esc(decOf(tm.decade).label) + ' yolculuğu bitti!</div>' +
      '<div style="text-align:center;font-size:34px;font-weight:900;color:var(--accent);">' + tm.score + ' puan</div>' +
      '<div style="text-align:center;font-size:13px;color:var(--text2);">+' + xp + ' XP · +' + Math.round(tm.score / 20) + ' 🪙</div>' +
      '<button class="btn" onclick="v44TmAgain()">🔁 Yeni Yolculuk</button>' +
      '<button class="btn" style="background:var(--card-soft);color:var(--text);" onclick="v44TmExit()">Menüye Dön</button>';
  }
  window.v44TmAgain = function () { tmSetup(); };

  /* =====================================================================
   * 5) 4x4 HIZLI PARMAK (grid eleme)
   * ===================================================================== */
  var gr = { code: null, state: null, members: {}, audio: null, timer: null, lock: false, lastRound: -1, local: false };
  function grBase() { return gr.code ? 'v44grid/' + gr.code : ''; }

  /* Odalı mod Firebase gerektirir; erişim yoksa tek cihaz (local) modu devreye girer */
  function grSetState(obj) {
    if (gr.local) { gr.state = obj; grRender(); return Promise.resolve(); }
    var r = ref(grBase() + '/state');
    if (!r) { grGoLocal(obj); return Promise.resolve(); }
    return r.set(obj).catch(function () { grGoLocal(obj); });
  }
  function grUpdate(obj) {
    if (gr.local) {
      Object.keys(obj).forEach(function (k) { gr.state[k] = obj[k]; });
      grRender(); return Promise.resolve();
    }
    var r = ref(grBase() + '/state');
    if (!r) return Promise.resolve();
    return r.update(obj).catch(function () {});
  }
  function grGoLocal(obj) {
    gr.local = true;
    gr.members = {}; gr.members[uid()] = { nick: nick(), avatar: avatar(), score: 0 };
    gr.state = obj || gr.state;
    toast('📴 Çok oyunculu bağlantı yok — tek cihaz modunda oynuyorsun');
    grScores(); grRender();
  }
  function grAddScore(pts) {
    if (gr.local) {
      gr.members[uid()].score = (gr.members[uid()].score || 0) + pts;
      grScores(); return;
    }
    var m = ref(grBase() + '/members/' + uid() + '/score');
    if (m) m.transaction(function (s) { return (s || 0) + pts; });
  }

  function grBuild() {
    if ($('v44gr')) return;
    var app = $('app') || document.body;
    var d = document.createElement('div');
    d.className = 'screen'; d.id = 'v44gr';
    d.innerHTML =
      '<div class="header" style="flex-shrink:0;"><div class="logo">⚡ Hızlı Parmak</div>' +
      '<div style="display:flex;gap:6px;align-items:center;"><div class="mr-code" id="v44GrCode">-----</div>' +
      '<button class="icon-btn" onclick="v44GrLeave()">✕</button></div></div>' +
      '<div style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:2px;">' +
      '<div id="v44GrStage" style="text-align:center;font-size:13px;font-weight:800;color:var(--text2);">Oyuncular bekleniyor…</div>' +
      '<div class="v44-scores" id="v44GrScores"></div>' +
      '<div class="v44-grid" id="v44GrGrid"></div>' +
      '<button class="btn" id="v44GrStart" onclick="v44GrStart()">▶ Turu Başlat</button>' +
      '<div style="text-align:center;font-size:12px;color:var(--text2);">Çalan şarkının kapağına ilk dokunan puanı alır; o kare kapanır.</div>' +
      '</div>';
    app.appendChild(d);
  }

  window.v44GrOpen = function () {
    grBuild();
    window.v44Ask('⚡ 4x4 Hızlı Parmak', 'Yeni oda için boş bırak.\nArkadaşına katılmak için kodu yaz.', 'Örn. R3TX9')
      .then(function (c) {
        if (c === null) return;
        c = String(c || '').trim().toUpperCase();
        if (!c) {
          var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c = '';
          for (var i = 0; i < 5; i++) c += ch[Math.floor(Math.random() * ch.length)];
        }
        grJoin(c);
      });
  };

  function grJoin(code) {
    grBuild(); gr.code = code; gr.lastRound = -1; gr.local = false;
    show('v44gr');
    var el = $('v44GrCode'); if (el) el.textContent = code;
    var b = grBase();
    var mine = ref(b + '/members/' + uid());
    if (!mine) { grGoLocal(null); return; }
    mine.update({ nick: nick(), avatar: avatar(), score: 0, ts: Date.now() })
      .catch(function () { grGoLocal(null); });
    try { mine.onDisconnect().remove(); } catch (e) {}
    var mref = ref(b + '/members');
    if (mref) mref.on('value', function (s) { gr.members = s.val() || {}; grScores(); });
    var sref = ref(b + '/state');
    if (sref) sref.on('value', function (s) { gr.state = s.val() || null; grRender(); });
  }

  window.v44GrLeave = function () {
    var b = grBase();
    if (b && !gr.local) {
      try {
        ref(b + '/members/' + uid()).remove();
        ref(b + '/members').off(); ref(b + '/state').off();
      } catch (e) {}
    }
    grStop(); gr.code = null; gr.state = null; gr.local = false;
    show('menu');
  };
  function grStop() {
    if (gr.audio) { try { gr.audio.pause(); } catch (e) {} gr.audio = null; }
    clearInterval(gr.timer); gr.timer = null;
  }

  function grScores() {
    var c = $('v44GrScores'); if (!c) return;
    var ks = Object.keys(gr.members || {});
    if (!ks.length) { c.innerHTML = ''; return; }
    ks.sort(function (a, b) { return (gr.members[b].score || 0) - (gr.members[a].score || 0); });
    c.innerHTML = ks.map(function (k) {
      var m = gr.members[k] || {};
      return '<div class="v44-sc' + (k === uid() ? ' me' : '') + '">' + esc(m.avatar || '👤') + ' ' +
        esc(m.nick || 'Oyuncu') + ' · ' + (m.score || 0) + '</div>';
    }).join('');
  }

  window.v44GrStart = function () {
    var b = grBase(); if (!b) { toast('Odaya bağlı değilsin'); return; }
    var btn = $('v44GrStart'); if (btn) { btn.disabled = true; btn.textContent = 'Hazırlanıyor…'; }
    Promise.all([
      itunes('turkce pop', 60), itunes('pop hits', 60), itunes('rock hits', 60),
      itunes('rap hits', 60), itunes('90s hits', 60), itunes('dance hits', 60)
    ])
      .then(function (res) {
        var pool = uniqByTrack([].concat.apply([], res)).filter(function (t) { return t.artworkUrl100; });
        /* Aynı kapak/albüm/sanatçı tekrar etmesin — 16 kare ayırt edilebilir olsun */
        var seenArt = Object.create(null), seenArtist = Object.create(null), uniq = [];
        shuffle(pool).forEach(function (t) {
          var a = String(t.artworkUrl100 || ''), ar = String(t.artistName || '').toLowerCase();
          if (seenArt[a] || seenArtist[ar]) return;
          seenArt[a] = 1; seenArtist[ar] = 1; uniq.push(t);
        });
        if (uniq.length < 16) throw new Error('az');
        var picked = uniq.slice(0, 16).map(function (t) {
          return { title: t.trackName, artist: t.artistName, cover: art(t, 300), url: t.previewUrl };
        });
        return grSetState({
          phase: 'play',
          cells: picked,
          order: shuffle(picked.map(function (_, i) { return i; })),
          round: 0,
          taken: {},
          startedAt: Date.now(),
          host: uid()
        });
      })
      .catch(function () { toast('Şarkılar yüklenemedi, tekrar dene'); })
      .then(function () { if (btn) { btn.disabled = false; btn.textContent = '▶ Yeni Oyun'; } });
  };

  function grRender() {
    var st = gr.state, g = $('v44GrGrid'), stage = $('v44GrStage');
    if (!g) return;
    if (!st || !st.cells) {
      g.innerHTML = '';
      if (stage) stage.textContent = 'Kod: ' + (gr.code || '-----') + ' · Herkes girince turu başlat.';
      grStop(); return;
    }
    var taken = st.taken || {};
    if (st.phase === 'done') {
      grStop();
      var ks = Object.keys(gr.members || {}).sort(function (a, b) {
        return (gr.members[b].score || 0) - (gr.members[a].score || 0);
      });
      var win = ks.length ? (gr.members[ks[0]].nick || 'Oyuncu') : '-';
      if (stage) stage.innerHTML = '🏁 Bitti! Kazanan: <b>' + esc(win) + '</b>';
    }
    g.innerHTML = st.cells.map(function (c, i) {
      var t = taken[i];
      return '<button class="v44-cell' + (t ? ' taken' : '') + '" data-i="' + i + '">' +
        '<img src="' + esc(c.cover) + '" alt="' + esc(c.title) + '" loading="lazy">' +
        '<span class="tag">' + esc(t ? (t.nick || '✔') : c.artist) + '</span></button>';
    }).join('');
    g.querySelectorAll('.v44-cell').forEach(function (btn) {
      btn.onclick = function () { grTap(Number(btn.getAttribute('data-i')), btn); };
    });

    if (st.phase !== 'play') return;
    var idx = st.order && st.order[st.round];
    if (idx == null) return;
    if (gr.lastRound !== st.round) {
      gr.lastRound = st.round; gr.lock = false;
      grStop();
      try {
        gr.audio = new Audio(st.cells[idx].url); gr.audio.volume = 0.9;
        gr.audio.play().catch(function () { toast('Sesi başlatmak için ekrana dokun'); });
      } catch (e) {}
      var left = 20;
      gr.timer = setInterval(function () {
        left--;
        if (stage) stage.textContent = '🎵 Çalan şarkının kapağına dokun — ' + left + 's';
        if (left <= 0) { clearInterval(gr.timer); if (gr.local || st.host === uid()) grNext(null); }
      }, 1000);
    }
    if (stage && stage.textContent.indexOf('🎵') < 0) stage.textContent = '🎵 Çalan şarkının kapağına dokun!';
  }

  function grNext(winnerUid) {
    var st = gr.state, b = grBase(); if (!st || !b) return;
    var idx = st.order[st.round];
    var taken = st.taken || {};
    taken[idx] = winnerUid ? { uid: winnerUid, nick: (gr.members[winnerUid] || {}).nick || 'Oyuncu' } : { uid: '', nick: '⏱' };
    var next = st.round + 1;
    grUpdate({
      taken: taken,
      round: next,
      startedAt: Date.now(),
      phase: next >= st.order.length ? 'done' : 'play'
    });
  }

  function grTap(i, btn) {
    var st = gr.state, b = grBase();
    if (!st || st.phase !== 'play' || !b || gr.lock) return;
    var idx = st.order[st.round];
    if ((st.taken || {})[i]) return;
    if (i !== idx) {
      gr.lock = true;
      btn.classList.add('miss');
      toast('❌ Yanlış kapak — 3 sn bekle');
      setTimeout(function () { gr.lock = false; btn.classList.remove('miss'); }, 3000);
      return;
    }
    var secsNow = Math.max(0, 20 - Math.floor((Date.now() - (st.startedAt || Date.now())) / 1000));
    if (gr.local) {
      var tk = st.taken || {};
      tk[i] = { uid: uid(), nick: nick() };
      grAddScore(100 + secsNow * 10);
      toast('✅ Doğru! +' + (100 + secsNow * 10));
      var nx = st.round + 1;
      grUpdate({ taken: tk, round: nx, startedAt: Date.now(), phase: nx >= st.order.length ? 'done' : 'play' });
      return;
    }
    /* İlk dokunan kazanır: transaction ile yarış koşulu engellenir */
    var claim = ref(b + '/state/taken/' + i);
    if (!claim) return;
    claim.transaction(function (cur) {
      if (cur) return;                      /* zaten alınmış */
      return { uid: uid(), nick: nick() };
    }, function (err, committed, snap) {
      if (err || !committed) return;
      var v = snap && snap.val();
      if (!v || v.uid !== uid()) return;
      var pts = 100 + secsNow * 10;
      grAddScore(pts);
      try { window.playBeep && window.playBeep(920, 0.15); } catch (e) {}
      toast('✅ Senin! +' + pts);
      try {
        if (typeof window.applyPremiumXP === 'function') window.applyPremiumXP(10);
      } catch (e) {}
      var next = st.round + 1;
      grUpdate({
        round: next,
        startedAt: Date.now(),
        phase: next >= st.order.length ? 'done' : 'play'
      });
    });
  }

  /* =====================================================================
   * 6) MENÜ KARTLARI
   * ===================================================================== */
  function card(id, icon, name, desc, onclick) {
    var menu = $('menu'); if (!menu || $(id)) return;
    var host = menu.querySelector('.mode-card'); if (!host || !host.parentNode) return;
    var c = document.createElement('div');
    c.className = 'mode-card'; c.id = id;
    c.onclick = onclick;
    c.innerHTML = '<div class="mode-icon" style="font-size:26px;">' + icon + '</div>' +
      '<div class="mode-info"><span class="mode-name">' + esc(name) + '</span>' +
      '<span class="mode-desc">' + esc(desc) + '</span></div>';
    host.parentNode.insertBefore(c, host.nextSibling);
  }
  setInterval(function () {
    card('v44TmCard', '⏳', 'Müzik Zaman Makinesi', 'Doğum yılına veya döneme özel nostalji quizi', function () { window.v44TmOpen(); });
    card('v44GrCard', '⚡', '4x4 Hızlı Parmak', '16 albüm kapağı — çalan şarkıya ilk dokunan kazanır', function () { window.v44GrOpen(); });
  }, 1200);

  console.log('[v44] keyboard/chat fix, modal prompts, premium perks, time machine, 4x4 grid loaded');
})();
