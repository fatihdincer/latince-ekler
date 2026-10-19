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
  function tipsFor(v, tk) { return L.tips(v.conj, tk); }

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

  /* ---------- Aralıklı tekrar (Leitner kutuları) ----------
   * Her zaman+kişi birleşimi bir "kart". Doğru → bir üst kutu, yanlış → kutu 0.
   * Düşük kutudaki kartların seçilme ağırlığı yüksek: yanlışlar daha sık gelir. */
  const BOX_WEIGHT = [8, 5, 3, 2, 1, 0.5];
  const NEW_WEIGHT = 6;
  const UNLOCK_RIGHT = 15, UNLOCK_WINDOW = 20, UNLOCK_ACC = 0.75;
  const IRR_TENSES = ['pres', 'impf', 'fut', 'perf', 'plpf', 'fut2'];

  function conjFilter() {
    const f = S.prefs.conj;
    if (f === 'irr' && maxStage() < 5) return 'all';
    return f;
  }
  function poolKeys() {
    const f = conjFilter();
    const keys = [];
    if (f !== 'irr') {
      L.TENSE_KEYS.filter(function (k) { return stageOfTense(k) <= maxStage(); }).forEach(function (tk) {
        L.PERSONS.forEach(function (p) { keys.push(tk + '.' + p.id); });
      });
    }
    if (maxStage() >= 5 && (f === 'all' || f === 'irr')) {
      IRR_TENSES.forEach(function (t) { L.PERSONS.forEach(function (p) { keys.push('irr.' + t + '.' + p.id); }); });
    }
    return keys;
  }
  function weight(key) { const st = S.stats[key]; return st ? BOX_WEIGHT[st.box] : NEW_WEIGHT; }

  let lastKey = null;
  function pickItem() {
    let keys = poolKeys();
    if (keys.length > 1) keys = keys.filter(function (k) { return k !== lastKey; });
    const total = keys.reduce(function (s, k) { return s + weight(k); }, 0);
    let r = Math.random() * total, key = keys[keys.length - 1];
    for (let j = 0; j < keys.length; j++) { r -= weight(keys[j]); if (r <= 0) { key = keys[j]; break; } }
    lastKey = key;
    const p = key.split('.');
    const i = L.PERSONS.findIndex(function (x) { return x.id === p[2]; });
    let v;
    if (p[0] === 'irr') v = rand(IRREGULAR);
    else {
      const f = conjFilter();
      v = rand(f === 'all' ? REGULAR : REGULAR.filter(function (x) { return x.conj === f; }));
    }
    const voice = p[0] === 'irr' ? 'act' : p[0];
    return { key: key, voice: voice, tense: p[1], tk: voice + '.' + p[1], i: i, v: v, parts: L.form(v, voice, p[1], i) };
  }

  function stageProgress(n) {
    const hs = S.history.filter(function (h) { return stageOfKey(h.k) === n; });
    const recent = hs.slice(-UNLOCK_WINDOW);
    const recentOk = recent.filter(function (h) { return h.ok; }).length;
    return {
      right: hs.filter(function (h) { return h.ok; }).length,
      total: hs.length, recentN: recent.length,
      acc: recent.length ? recentOk / recent.length : 0
    };
  }
  function stageReady(n) {
    const p = stageProgress(n);
    return p.right >= UNLOCK_RIGHT && p.recentN >= UNLOCK_WINDOW && p.acc >= UNLOCK_ACC;
  }
  function checkUnlock() {
    while (S.stage < 5 && stageReady(S.stage)) {
      S.stage++;
      toast('🎉 Yeni aşama açıldı: ' + L.STAGES[S.stage - 1].title);
    }
    updateBadge();
  }
  function record(item, ok) {
    const st = S.stats[item.key] || (S.stats[item.key] = { box: 0, right: 0, wrong: 0 });
    if (ok) { st.right++; st.box = Math.min(BOX_WEIGHT.length - 1, st.box + 1); }
    else { st.wrong++; st.box = 0; }
    st.last = Date.now();
    S.history.push({ k: item.key, ok: ok ? 1 : 0, c: item.v.conj });
    if (S.history.length > 1000) S.history.splice(0, S.history.length - 1000);
    checkUnlock();
    save();
  }

  function conjFilterHTML() {
    const f = conjFilter();
    let opts = [['all', 'Tüm çekimler']].concat(Object.keys(L.CONJ).map(function (c) {
      return [c, L.CONJ[c].name + ' (' + L.CONJ[c].model + ')'];
    }));
    if (maxStage() >= 5) opts.push(['irr', 'Sadece sum / possum']);
    return '<label>Çekim<select id="conj-filter">' + opts.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === f ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select></label>';
  }
  function bindConjFilter(rerender) {
    document.getElementById('conj-filter').onchange = function (e) { S.prefs.conj = e.target.value; save(); rerender(true); };
  }

  function partsExplainHTML(item) {
    return '<ul class="parts">' + item.parts.map(function (p) {
      return '<li><span class="lat s-' + p.k + '">' + esc(p.t) + '</span> ' +
        esc(L.explainPart(p, item.v, item.voice, item.tense, item.i)) + '</li>';
    }).join('') + '</ul>';
  }
  function verbLine(v) {
    return '<span class="lat">' + esc(v.lemma) + '</span> <span class="muted">(' + esc(v.tr) + ')</span>';
  }
  function itemLabel(item) {
    const pr = L.PERSONS[item.i];
    return L.tenseLabel(item.voice, item.tense) + ', ' + pr.label + ' (' + pr.short + ')';
  }
  // Bu zamana uygun ipuçlarından biri
  function oneTip(item) {
    const tips = tipsFor(item.v, item.tk);
    if (!tips.length) return '';
    return '<div class="tip-box">' + esc(rand(tips)) + '</div>';
  }

  let onEnter = null;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); }
  });

  /* ---------- Ekran 2: Ek tanıma ---------- */
  let R = null;
  function renderRecog(fresh) {
    if (!R || fresh) R = { item: pickItem(), tk: null, per: null, num: null, done: false };
    const it = R.item;
    const tenses = openTenses(it.v);
    if (tenses.length === 1) R.tk = tenses[0];

    function btns(name, list, cur) {
      return '<div class="btn-row">' + list.map(function (o) {
        return '<button class="btn' + (o[0] === cur ? ' sel' : '') + '" data-' + name + '="' + o[0] + '"' +
          (R.done ? ' disabled' : '') + '>' + esc(o[1]) + '</button>';
      }).join('') + '</div>';
    }
    const tenseBtns = btns('tk', tenses.map(function (k) { const p = k.split('.'); return [k, L.tenseLabel(p[0], p[1])]; }), R.tk);
    const perBtns = btns('per', [['1', '1. kişi'], ['2', '2. kişi'], ['3', '3. kişi']], R.per);
    const numBtns = btns('num', [['tekil', 'tekil'], ['çoğul', 'çoğul']], R.num);
    const ready = R.tk && R.per && R.num;

    view.innerHTML =
      '<div class="card"><div class="controls">' + conjFilterHTML() + '</div>' +
      '<p class="muted small" style="margin:0">Biçimin zamanını, kişisini ve sayısını seç.</p>' +
      '<div class="big-form">' + (R.done ? segHTML(it.parts, true) : '<span class="lat">' + esc(L.joinForm(it.parts)) + '</span>') + '</div>' +
      '<div class="prompt-line small">' + verbLine(it.v) + '</div>' +
      '<div class="q-label">Zaman</div>' + tenseBtns +
      '<div class="q-label">Kişi</div>' + perBtns +
      '<div class="q-label">Sayı</div>' + numBtns +
      (R.done ? '' : '<button id="r-check" class="btn primary"' + (ready ? '' : ' disabled') + '>Kontrol et</button>') +
      (R.done ? feedbackRecog() : '') + '</div>';

    bindConjFilter(renderRecog);
    view.querySelectorAll('[data-tk],[data-per],[data-num]').forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.tk) R.tk = b.dataset.tk;
        if (b.dataset.per) R.per = b.dataset.per;
        if (b.dataset.num) R.num = b.dataset.num;
        renderRecog(false);
      };
    });
    const chk = document.getElementById('r-check');
    if (chk) chk.onclick = checkRecog;
    const nx = document.getElementById('r-next');
    if (nx) { nx.onclick = function () { renderRecog(true); }; nx.focus(); }
    onEnter = R.done ? function () { renderRecog(true); } : (ready ? checkRecog : null);
  }

  // Aynı yazılışa sahip tüm çözümlemeler (örn. makron dahil aynı biçim)
  function analyses(item) {
    const target = L.joinForm(item.parts);
    const out = [];
    L.TENSE_KEYS.forEach(function (tk) {
      const p = tk.split('.');
      if (item.v.conj === 'irr' && p[0] === 'pas') return;
      for (let i = 0; i < 6; i++) {
        if (L.joinForm(L.form(item.v, p[0], p[1], i)) === target) out.push({ tk: tk, i: i });
      }
    });
    return out;
  }
  function checkRecog() {
    if (!(R.tk && R.per && R.num) || R.done) return;
    const idx = (R.num === 'çoğul' ? 3 : 0) + Number(R.per) - 1;
    R.choice = { tk: R.tk, i: idx };
    R.ok = analyses(R.item).some(function (a) { return a.tk === R.tk && a.i === idx; });
    R.done = true;
    record(R.item, R.ok);
    renderRecog(false);
  }
  function feedbackRecog() {
    const it = R.item;
    const pr = L.PERSONS[it.i];
    let html = '<div class="feedback ' + (R.ok ? 'ok' : 'bad') + '">';
    if (R.ok) {
      html += '<div class="verdict">✓ Doğru!</div>';
    } else {
      const cp = R.choice.tk.split('.');
      html += '<div class="verdict">✗ Yanlış</div>' +
        '<div>Senin cevabın: ' + esc(L.tenseLabel(cp[0], cp[1]) + ', ' + L.PERSONS[R.choice.i].label) + '</div>';
    }
    html += '<div>Doğrusu: <b>' + esc(itemLabel(it)) + '</b> — „' + esc(L.meaning(it.v, it.voice, it.tense, it.i)) + '"</div>';
    if (!R.ok) {
      const what = [];
      if (R.choice.tk !== it.tk) what.push('zaman işaretine');
      if (R.choice.i !== it.i) what.push('kişi ekine (' + pr.label + ')');
      if (what.length) html += '<div class="small" style="margin-top:6px">Bak: ' + what.join(' ve ') + '.</div>';
    }
    html += partsExplainHTML(it) + oneTip(it) +
      '<div style="margin-top:12px"><button id="r-next" class="btn primary">Sonraki →</button></div></div>';
    return html;
  }

  /* ---------- Ekran 3: Ek yazma ---------- */
  let W = null;
  function normalize(s) {
    // makron ve büyük/küçük harf önemsiz; baştaki tire ve boşluklar atılır
    return L.stripMacrons(s).replace(/\s+/g, '').replace(/^-+/, '').replace(/j/g, 'i');
  }
  function renderWrite(fresh) {
    if (!W || fresh) W = { item: pickItem(), done: false, input: '' };
    const it = W.item;
    const mode = it.v.conj === 'irr' ? 'full' : S.prefs.writeMode;
    const sp = stemPart(it.parts);
    const prefix = sp.stem.map(function (p) { return p.t; }).join('');
    const perf = sp.stem.length && sp.stem[0].k === 'p';

    const modeSwitch = '<div class="seg-switch">' +
      '<button data-mode="full" class="' + (S.prefs.writeMode === 'full' ? 'sel' : '') + '">Tam biçim</button>' +
      '<button data-mode="end" class="' + (S.prefs.writeMode === 'end' ? 'sel' : '') + '">Sadece ek</button></div>';
    const note = it.v.conj === 'irr' && S.prefs.writeMode === 'end'
      ? '<p class="small muted">Düzensiz fiilde gövde de sorulur: tam biçimi yaz.</p>' : '';

    view.innerHTML =
      '<div class="card"><div class="controls">' + conjFilterHTML() +
      '<label>Yazma biçimi' + modeSwitch + '</label></div>' + note +
      '<div class="prompt-line">' + verbLine(it.v) + '</div>' +
      '<div class="prompt-line"><b>' + esc(itemLabel(it)) + '</b></div>' +
      '<div class="prompt-line muted small">„' + esc(L.meaning(it.v, it.voice, it.tense, it.i)) + '"</div>' +
      '<div class="answer-row">' +
      (mode === 'end' ? '<span class="prefix' + (perf ? ' perf' : '') + '">' + esc(prefix) + '-</span>' : '') +
      '<input type="text" id="w-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
      'placeholder="' + (mode === 'end' ? 'eki yaz' : 'biçimi yaz') + '" value="' + esc(W.input) + '"' + (W.done ? ' disabled' : '') + '>' +
      (W.done ? '' : '<button id="w-check" class="btn primary">Kontrol</button>') + '</div>' +
      '<p class="small muted" style="margin:6px 0 0">Makron (ā, ē…) yazmak zorunlu değil.</p>' +
      (W.done ? feedbackWrite(mode, sp) : '') + '</div>';

    bindConjFilter(renderWrite);
    view.querySelectorAll('[data-mode]').forEach(function (b) {
      b.onclick = function () { S.prefs.writeMode = b.dataset.mode; save(); renderWrite(false); };
    });
    const inp = document.getElementById('w-in');
    inp.oninput = function () { W.input = inp.value; };
    const chk = document.getElementById('w-check');
    if (chk) chk.onclick = function () { checkWrite(mode, sp); };
    const nx = document.getElementById('w-next');
    if (nx) { nx.onclick = function () { renderWrite(true); }; nx.focus(); }
    else inp.focus();
    onEnter = W.done ? function () { renderWrite(true); } : function () { checkWrite(mode, sp); };
  }
  function checkWrite(mode, sp) {
    if (W.done) return;
    const a = normalize(W.input);
    if (!a) return;
    const full = normalize(L.joinForm(W.item.parts));
    const end = normalize(sp.rest.map(function (p) { return p.t; }).join(''));
    W.ok = a === full || (mode === 'end' && a === end);
    W.done = true;
    record(W.item, W.ok);
    renderWrite(false);
  }
  function feedbackWrite(mode, sp) {
    const it = W.item;
    let html = '<div class="feedback ' + (W.ok ? 'ok' : 'bad') + '">' +
      '<div class="verdict">' + (W.ok ? '✓ Doğru!' : '✗ Yanlış') + '</div>';
    if (!W.ok) html += '<div>Senin yazdığın: <span class="lat">' + esc(W.input) + '</span></div>';
    html += '<div>Doğrusu: ' + segHTML(it.parts, true) +
      (mode === 'end' ? ' &nbsp;→ ek: ' + endingHTML(it.parts) : '') + '</div>' +
      partsExplainHTML(it) + oneTip(it) +
      '<div style="margin-top:12px"><button id="w-next" class="btn primary">Sonraki →</button></div></div>';
    return html;
  }

  /* ---------- Ekran 4: Karşılaştırma ---------- */
  function renderCompare() {
    let v = VERB[S.prefs.cmpVerb];
    if (openVerbs().indexOf(v) < 0) v = VERB.amo;
    const i = S.prefs.cmpPer || 0;
    const rows = openTenses(v).map(function (tk) {
      const p = tk.split('.');
      const f = L.form(v, p[0], p[1], i);
      return '<tr><td class="per">' + esc(L.tenseLabel(p[0], p[1])) + '</td><td>' + segHTML(f, true) + '</td>' +
        '<td class="col-end">' + endingHTML(f) + '</td><td class="tr">' + esc(L.meaning(v, p[0], p[1], i)) + '</td></tr>';
    }).join('');
    const perBtns = '<div class="btn-row">' + L.PERSONS.map(function (pr, j) {
      return '<button class="btn' + (j === i ? ' sel' : '') + '" data-per="' + j + '">' + pr.label + ' (' + pr.short + ')</button>';
    }).join('') + '</div>';

    view.innerHTML =
      '<div class="card"><div class="controls"><label>Fiil<select id="c-verb">' + verbOptions(v.id) + '</select></label></div>' +
      '<div class="q-label">Kişi</div>' + perBtns + stemsHTML(v) + LEGEND + '</div>' +
      '<div class="card"><h2>' + esc(L.PERSONS[i].label) + ' — tüm zamanlar</h2>' +
      '<p class="small muted" style="margin-top:0">Kişi aynı, zaman değişiyor: farkı turuncu zaman işareti ve gövde gösteriyor.</p>' +
      '<table class="conj"><thead><tr><th>Zaman</th><th>Biçim</th><th class="col-end">Ek</th><th>Türkçe</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';

    document.getElementById('c-verb').onchange = function (e) { S.prefs.cmpVerb = e.target.value; save(); renderCompare(); };
    view.querySelectorAll('[data-per]').forEach(function (b) {
      b.onclick = function () { S.prefs.cmpPer = Number(b.dataset.per); save(); renderCompare(); };
    });
  }

  /* ---------- Ekran 5: İlerleme ---------- */
  function keyLabel(key) {
    const p = key.split('.');
    const pr = L.PERSONS.find(function (x) { return x.id === p[2]; });
    const t = p[0] === 'irr' ? 'sum/possum ' + L.TENSES[p[1]].name : L.tenseLabel(p[0], p[1]);
    return t + ', ' + pr.label;
  }
  function accColor(acc) {
    return 'hsla(' + Math.round(acc * 130) + ', 70%, 50%, .28)';
  }
  function gridRow(label, prefix) {
    return '<tr><th>' + esc(label) + '</th>' + L.PERSONS.map(function (pr) {
      const st = S.stats[prefix + '.' + pr.id];
      if (!st) return '<td class="none">·</td>';
      const n = st.right + st.wrong;
      return '<td style="background:' + accColor(st.right / n) + '" title="' + st.right + ' doğru, ' + st.wrong + ' yanlış">' +
        st.right + '/' + n + '</td>';
    }).join('') + '</tr>';
  }
  function renderProgress() {
    const ms = maxStage();
    const stages = L.STAGES.map(function (st) {
      const open = st.n <= ms;
      let extra = '';
      if (st.n === S.stage && S.stage < 5 && !S.unlockAll) {
        const p = stageProgress(st.n);
        extra = '<div class="small" style="margin-top:6px">Sonraki aşama için: ' + Math.min(p.right, UNLOCK_RIGHT) + '/' + UNLOCK_RIGHT +
          ' doğru, son ' + UNLOCK_WINDOW + ' cevapta en az %' + (UNLOCK_ACC * 100) + ' başarı (şu an: ' +
          (p.recentN ? '%' + Math.round(p.acc * 100) + ', ' + p.recentN + ' cevap' : '—') + ')</div>' +
          '<div class="bar"><div style="width:' + Math.round(100 * Math.min(1, p.right / UNLOCK_RIGHT)) + '%"></div></div>';
      }
      return '<div class="stage' + (open ? ' open' : '') + '"><div class="num">' + (open ? st.n : '🔒') + '</div>' +
        '<div class="body"><b>' + esc(st.title) + '</b><div class="small muted">' + esc(st.desc) + '</div>' + extra + '</div></div>';
    }).join('');

    let grid = '<table class="grid"><thead><tr><th></th>' + L.PERSONS.map(function (p) {
      return '<th style="text-align:center">' + p.id.replace('s', 'T').replace('p', 'Ç') + '</th>';
    }).join('') + '</tr></thead><tbody>';
    L.TENSE_KEYS.filter(function (k) { return stageOfTense(k) <= ms; }).forEach(function (tk) {
      const p = tk.split('.');
      grid += gridRow(L.tenseLabel(p[0], p[1]), tk);
    });
    if (ms >= 5) IRR_TENSES.forEach(function (t) { grid += gridRow('sum/possum ' + L.TENSES[t].name, 'irr.' + t); });
    grid += '</tbody></table>';

    const hard = Object.keys(S.stats).filter(function (k) { return S.stats[k].wrong > 0; })
      .sort(function (a, b) {
        const x = S.stats[a], y = S.stats[b];
        return (y.wrong - y.right * 0.5) - (x.wrong - x.right * 0.5) || x.box - y.box;
      }).slice(0, 8);
    const hardHTML = hard.length ? '<ul class="tips">' + hard.map(function (k) {
      const st = S.stats[k];
      const p = k.split('.');
      const v = p[0] === 'irr' ? VERB.sum : VERB.amo;
      const voice = p[0] === 'irr' ? 'act' : p[0];
      const i = L.PERSONS.findIndex(function (x) { return x.id === p[2]; });
      return '<li>' + esc(keyLabel(k)) + ' — örn. ' + segHTML(L.form(v, voice, p[1], i), false) +
        ' <span class="small muted">(' + st.wrong + ' yanlış, ' + st.right + ' doğru)</span></li>';
    }).join('') + '</ul><p class="small muted">Bunlar alıştırmalarda daha sık sorulur.</p>'
      : '<p class="muted">Henüz hata yok. Alıştırma yaptıkça burada görünür.</p>';

    const byConj = {};
    S.history.forEach(function (h) {
      const c = byConj[h.c] || (byConj[h.c] = { ok: 0, n: 0 });
      c.n++; c.ok += h.ok;
    });
    const conjHTML = Object.keys(byConj).length ? '<table class="conj"><tbody>' + Object.keys(byConj).map(function (c) {
      const x = byConj[c];
      const name = c === 'irr' ? 'sum / possum' : L.CONJ[c].name + ' (' + L.CONJ[c].model + ')';
      return '<tr><td>' + esc(name) + '</td><td>%' + Math.round(100 * x.ok / x.n) + '</td><td class="muted small">' + x.n + ' soru</td></tr>';
    }).join('') + '</tbody></table>' : '<p class="muted">Veri yok.</p>';

    const total = S.history.length, okAll = S.history.filter(function (h) { return h.ok; }).length;

    view.innerHTML =
      '<div class="card"><h2>Aşamalar</h2>' + stages +
      '<div class="btn-row" style="margin-top:10px">' +
      (S.stage < 5 && !S.unlockAll ? '<button id="p-next" class="btn">Sonraki aşamayı şimdi aç</button>' : '') +
      '<button id="p-all" class="btn">' + (S.unlockAll ? 'Kilitleri geri getir' : 'Tüm aşamaları aç') + '</button></div></div>' +
      '<div class="card"><h2>Zaman × kişi</h2><p class="small muted" style="margin-top:0">Doğru / toplam. Kırmızıya yakın = zorlandığın yer. ' +
      'T = tekil, Ç = çoğul.</p><div style="overflow-x:auto">' + grid + '</div></div>' +
      '<div class="card"><h2>En çok zorlananlar</h2>' + hardHTML + '</div>' +
      '<div class="card"><h2>Çekimlere göre</h2>' + conjHTML +
      '<p class="small muted">Toplam ' + total + ' cevap' + (total ? ', %' + Math.round(100 * okAll / total) + ' doğru' : '') + '.</p>' +
      '<button id="p-reset" class="btn">İlerlemeyi sıfırla</button></div>';

    const nx = document.getElementById('p-next');
    if (nx) nx.onclick = function () { S.stage++; R = W = null; save(); updateBadge(); renderProgress(); };
    document.getElementById('p-all').onclick = function () { S.unlockAll = !S.unlockAll; R = W = null; save(); updateBadge(); renderProgress(); };
    document.getElementById('p-reset').onclick = function () {
      if (confirm('Tüm ilerleme silinsin mi?')) { S = defaultState(); R = W = null; save(); show('ilerleme'); }
    };
  }

  /* ---------- Gezinme ---------- */
  const SCREENS = {
    tablo: renderTable,
    tanima: function () { renderRecog(false); },
    yazma: function () { renderWrite(false); },
    karsilastir: renderCompare,
    ilerleme: renderProgress
  };

  function updateBadge() {
    const st = L.STAGES[maxStage() - 1];
    document.getElementById('stage-badge').textContent = 'Aşama ' + st.n + ': ' + st.title;
  }
  function show(tab) {
    if (!SCREENS[tab]) tab = 'tablo';
    S.prefs.tab = tab; save();
    onEnter = null;
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
