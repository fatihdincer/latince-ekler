(function () {
  'use strict';
  const L = window.LATIN;

  /* ---------- Durum (localStorage) ---------- */
  const STORE_KEY = 'latinceEkler.v1';
  function defaultState() {
    return {
      stage: 1, unlockAll: false,
      stats: {},      // anahtar → {box, right, wrong, last}
      history: [],    // {k, ok, c}
      prefs: { tab: 'tablo', writeMode: 'full', conj: 'all', tableVerb: 'amo', tableTense: 'act.pres', cmpVerb: 'amo', cmpPer: 0 }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const d = defaultState();
        return Object.assign(d, s, { prefs: Object.assign(d.prefs, s.prefs || {}) });
      }
    } catch (e) { /* bozuk kayıt: sıfırdan başla */ }
    return defaultState();
  }
  let S = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* depolama kapalı */ }
  }

  /* ---------- Yardımcılar ---------- */
  const view = document.getElementById('view');
  const VERB = Object.fromEntries(L.VERBS.map(function (v) { return [v.id, v]; }));
  const REGULAR = L.VERBS.filter(function (v) { return v.conj !== 'irr'; });
  const IRREGULAR = L.VERBS.filter(function (v) { return v.conj === 'irr'; });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function segHTML(parts, split) {
    return '<span class="lat' + (split ? ' split' : '') + '">' + parts.map(function (p) {
      return '<span class="s s-' + p.k + '">' + esc(p.t) + '</span>';
    }).join('') + '</span>';
  }
  // Kökten sonraki kısım (ek)
  function stemPart(parts) {
    let i = 0;
    while (i < parts.length && (parts[i].k === 'r' || parts[i].k === 'p')) i++;
    return { stem: parts.slice(0, i), rest: parts.slice(i) };
  }
  function endingHTML(parts) {
    const rest = stemPart(parts).rest;
    return rest.length ? '<span class="lat">-' + rest.map(function (p) {
      return '<span class="s-' + p.k + '">' + esc(p.t) + '</span>';
    }).join('') + '</span>' : '';
  }

  const LEGEND = '<div class="legend">' +
    '<span class="s-r">kök</span><span class="s-p">perfectum gövdesi</span>' +
    '<span class="s-v">tema ünlüsü</span><span class="s-m">zaman işareti</span><span class="s-e">kişi eki</span></div>';

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 3500);
  }

  /* ---------- Aşamalar ---------- */
  function maxStage() { return S.unlockAll ? 5 : S.stage; }
  function stageOfTense(tk) {
    const p = tk.split('.');
    if (p[0] === 'pas') return 4;
    if (p[1] === 'perf' || p[1] === 'plpf' || p[1] === 'fut2') return 3;
    if (p[1] === 'pres') return 1;
    return 2;
  }
  function stageOfKey(key) {
    return key.indexOf('irr.') === 0 ? 5 : stageOfTense(key.split('.').slice(0, 2).join('.'));
  }
  // Fiile göre açık zamanlar
  function openTenses(v) {
    if (v.conj === 'irr') {
      return maxStage() >= 5 ? L.TENSE_KEYS.filter(function (k) { return k.indexOf('act.') === 0; }) : [];
    }
    return L.TENSE_KEYS.filter(function (k) { return stageOfTense(k) <= maxStage(); });
  }
  function openVerbs() { return maxStage() >= 5 ? L.VERBS : REGULAR; }

  function verbOptions(selected) {
    const groups = {};
    openVerbs().forEach(function (v) { (groups[v.conj] = groups[v.conj] || []).push(v); });
    return Object.keys(groups).map(function (c) {
      const label = c === 'irr' ? 'Düzensiz' : L.CONJ[c].name;
      return '<optgroup label="' + label + '">' + groups[c].map(function (v) {
        return '<option value="' + v.id + '"' + (v.id === selected ? ' selected' : '') + '>' +
          esc(v.lemma.split(',')[0]) + ' — ' + esc(v.tr) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }
  function tenseOptions(keys, selected) {
    return keys.map(function (k) {
      const p = k.split('.');
      return '<option value="' + k + '"' + (k === selected ? ' selected' : '') + '>' +
        esc(L.tenseLabel(p[0], p[1])) + ' — ' + esc(L.TENSES[p[1]].tr) + '</option>';
    }).join('');
  }
  function tipsFor(v, tk) { return L.TIPS[v.conj === 'irr' ? 'irr' : tk] || []; }

  function stemsHTML(v) {
    const pres = v.conj === 'irr' ? '' :
      '<div>Şimdiki zaman kökü: <span class="lat s-r">' + esc(v.root) + '-</span></div>';
    return '<div class="stems"><div class="muted">' + esc(v.lemma) + ' · <i>' + esc(v.tr) + '</i></div>' + pres +
      '<div>Perfectum gövdesi: <span class="lat s-p">' + esc(v.perf) + '-</span></div></div>';
  }

  /* ---------- Ekran 1: Ek tablosu ---------- */
  function renderTable() {
    let v = VERB[S.prefs.tableVerb];
    if (openVerbs().indexOf(v) < 0) v = VERB.amo;
    const tenses = openTenses(v);
    let tk = S.prefs.tableTense;
    if (tenses.indexOf(tk) < 0) tk = tenses[0];
    const p = tk.split('.');
    const voice = v.conj === 'irr' ? 'act' : p[0];

    const rows = L.PERSONS.map(function (pr, i) {
      const f = L.form(v, voice, p[1], i);
      return '<tr><td class="per">' + pr.label + '<br><span class="small">(' + pr.short + ')</span></td>' +
        '<td>' + segHTML(f, true) + '</td><td class="col-end">' + endingHTML(f) + '</td>' +
        '<td class="tr">' + esc(L.meaning(v, voice, p[1], i)) + '</td></tr>';
    }).join('');

    const tips = tipsFor(v, tk);
    const locked = maxStage() < 5 ? '<p class="small muted">Diğer zamanlar sonraki aşamalarda açılır (İlerleme ekranı).</p>' : '';

    view.innerHTML =
      '<div class="card"><div class="controls">' +
      '<label>Fiil<select id="t-verb">' + verbOptions(v.id) + '</select></label>' +
      '<label>Zaman<select id="t-tense">' + tenseOptions(tenses, tk) + '</select></label></div>' +
      stemsHTML(v) + LEGEND + '</div>' +
      '<div class="card"><h2>' + esc(L.tenseLabel(voice, p[1])) + ' <span class="muted small">' + esc(L.TENSES[p[1]].tr) + '</span></h2>' +
      '<table class="conj"><thead><tr><th>Kişi</th><th>Biçim</th><th class="col-end">Ek</th><th>Türkçe</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      (tips.length ? '<h3>İpuçları</h3><ul class="tips">' + tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
      locked + '</div>';

    document.getElementById('t-verb').onchange = function (e) { S.prefs.tableVerb = e.target.value; save(); renderTable(); };
    document.getElementById('t-tense').onchange = function (e) { S.prefs.tableTense = e.target.value; save(); renderTable(); };
  }

  /* ---------- Gezinme ---------- */
  const SCREENS = { tablo: renderTable };

  function updateBadge() {
    const st = L.STAGES[maxStage() - 1];
    document.getElementById('stage-badge').textContent = 'Aşama ' + st.n + ': ' + st.title;
  }
  function show(tab) {
    if (!SCREENS[tab]) tab = 'tablo';
    S.prefs.tab = tab; save();
    document.querySelectorAll('#nav button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    updateBadge();
    SCREENS[tab]();
    window.scrollTo(0, 0);
  }
  document.getElementById('nav').addEventListener('click', function (e) {
    const b = e.target.closest('button');
    if (b) show(b.dataset.tab);
  });

  show(S.prefs.tab);
})();
