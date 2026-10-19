// Çekim tablolarını elle yazılmış standart tablolarla karşılaştırır.
// Çalıştırma: node test/kontrol.js
'use strict';
const L = require('../data.js');

const REF = {
  amo: {
    'act.pres': 'amō amās amat amāmus amātis amant',
    'act.impf': 'amābam amābās amābat amābāmus amābātis amābant',
    'act.fut': 'amābō amābis amābit amābimus amābitis amābunt',
    'act.perf': 'amāvī amāvistī amāvit amāvimus amāvistis amāvērunt',
    'act.plpf': 'amāveram amāverās amāverat amāverāmus amāverātis amāverant',
    'act.fut2': 'amāverō amāveris amāverit amāverimus amāveritis amāverint',
    'pas.pres': 'amor amāris amātur amāmur amāminī amantur',
    'pas.impf': 'amābar amābāris amābātur amābāmur amābāminī amābantur',
    'pas.fut': 'amābor amāberis amābitur amābimur amābiminī amābuntur'
  },
  moneo: {
    'act.pres': 'moneō monēs monet monēmus monētis monent',
    'act.impf': 'monēbam monēbās monēbat monēbāmus monēbātis monēbant',
    'act.fut': 'monēbō monēbis monēbit monēbimus monēbitis monēbunt',
    'act.perf': 'monuī monuistī monuit monuimus monuistis monuērunt',
    'act.plpf': 'monueram monuerās monuerat monuerāmus monuerātis monuerant',
    'act.fut2': 'monuerō monueris monuerit monuerimus monueritis monuerint',
    'pas.pres': 'moneor monēris monētur monēmur monēminī monentur',
    'pas.impf': 'monēbar monēbāris monēbātur monēbāmur monēbāminī monēbantur',
    'pas.fut': 'monēbor monēberis monēbitur monēbimur monēbiminī monēbuntur'
  },
  rego: {
    'act.pres': 'regō regis regit regimus regitis regunt',
    'act.impf': 'regēbam regēbās regēbat regēbāmus regēbātis regēbant',
    'act.fut': 'regam regēs reget regēmus regētis regent',
    'act.perf': 'rēxī rēxistī rēxit rēximus rēxistis rēxērunt',
    'act.plpf': 'rēxeram rēxerās rēxerat rēxerāmus rēxerātis rēxerant',
    'act.fut2': 'rēxerō rēxeris rēxerit rēxerimus rēxeritis rēxerint',
    'pas.pres': 'regor regeris regitur regimur regiminī reguntur',
    'pas.impf': 'regēbar regēbāris regēbātur regēbāmur regēbāminī regēbantur',
    'pas.fut': 'regar regēris regētur regēmur regēminī regentur'
  },
  capio: {
    'act.pres': 'capiō capis capit capimus capitis capiunt',
    'act.impf': 'capiēbam capiēbās capiēbat capiēbāmus capiēbātis capiēbant',
    'act.fut': 'capiam capiēs capiet capiēmus capiētis capient',
    'act.perf': 'cēpī cēpistī cēpit cēpimus cēpistis cēpērunt',
    'act.plpf': 'cēperam cēperās cēperat cēperāmus cēperātis cēperant',
    'act.fut2': 'cēperō cēperis cēperit cēperimus cēperitis cēperint',
    'pas.pres': 'capior caperis capitur capimur capiminī capiuntur',
    'pas.impf': 'capiēbar capiēbāris capiēbātur capiēbāmur capiēbāminī capiēbantur',
    'pas.fut': 'capiar capiēris capiētur capiēmur capiēminī capientur'
  },
  audio: {
    'act.pres': 'audiō audīs audit audīmus audītis audiunt',
    'act.impf': 'audiēbam audiēbās audiēbat audiēbāmus audiēbātis audiēbant',
    'act.fut': 'audiam audiēs audiet audiēmus audiētis audient',
    'act.perf': 'audīvī audīvistī audīvit audīvimus audīvistis audīvērunt',
    'act.plpf': 'audīveram audīverās audīverat audīverāmus audīverātis audīverant',
    'act.fut2': 'audīverō audīveris audīverit audīverimus audīveritis audīverint',
    'pas.pres': 'audior audīris audītur audīmur audīminī audiuntur',
    'pas.impf': 'audiēbar audiēbāris audiēbātur audiēbāmur audiēbāminī audiēbantur',
    'pas.fut': 'audiar audiēris audiētur audiēmur audiēminī audientur'
  },
  sum: {
    'act.pres': 'sum es est sumus estis sunt',
    'act.impf': 'eram erās erat erāmus erātis erant',
    'act.fut': 'erō eris erit erimus eritis erunt',
    'act.perf': 'fuī fuistī fuit fuimus fuistis fuērunt',
    'act.plpf': 'fueram fuerās fuerat fuerāmus fuerātis fuerant',
    'act.fut2': 'fuerō fueris fuerit fuerimus fueritis fuerint'
  },
  possum: {
    'act.pres': 'possum potes potest possumus potestis possunt',
    'act.impf': 'poteram poterās poterat poterāmus poterātis poterant',
    'act.fut': 'poterō poteris poterit poterimus poteritis poterunt',
    'act.perf': 'potuī potuistī potuit potuimus potuistis potuērunt',
    'act.plpf': 'potueram potuerās potuerat potuerāmus potuerātis potuerant',
    'act.fut2': 'potuerō potueris potuerit potuerimus potueritis potuerint'
  },
  // Edilgen perfectum sistemi (PPP + sum); iki kelimelik biçimler '_' ile birleştirildi
  amo_pp: {
    'pas.perf': 'amātus_sum amātus_es amātus_est amātī_sumus amātī_estis amātī_sunt',
    'pas.plpf': 'amātus_eram amātus_erās amātus_erat amātī_erāmus amātī_erātis amātī_erant',
    'pas.fut2': 'amātus_erō amātus_eris amātus_erit amātī_erimus amātī_eritis amātī_erunt'
  },
  moneo_pp: {
    'pas.perf': 'monitus_sum monitus_es monitus_est monitī_sumus monitī_estis monitī_sunt',
    'pas.plpf': 'monitus_eram monitus_erās monitus_erat monitī_erāmus monitī_erātis monitī_erant',
    'pas.fut2': 'monitus_erō monitus_eris monitus_erit monitī_erimus monitī_eritis monitī_erunt'
  },
  rego_pp: {
    'pas.perf': 'rēctus_sum rēctus_es rēctus_est rēctī_sumus rēctī_estis rēctī_sunt',
    'pas.plpf': 'rēctus_eram rēctus_erās rēctus_erat rēctī_erāmus rēctī_erātis rēctī_erant',
    'pas.fut2': 'rēctus_erō rēctus_eris rēctus_erit rēctī_erimus rēctī_eritis rēctī_erunt'
  },
  capio_pp: {
    'pas.perf': 'captus_sum captus_es captus_est captī_sumus captī_estis captī_sunt',
    'pas.plpf': 'captus_eram captus_erās captus_erat captī_erāmus captī_erātis captī_erant',
    'pas.fut2': 'captus_erō captus_eris captus_erit captī_erimus captī_eritis captī_erunt'
  },
  audio_pp: {
    'pas.perf': 'audītus_sum audītus_es audītus_est audītī_sumus audītī_estis audītī_sunt',
    'pas.plpf': 'audītus_eram audītus_erās audītus_erat audītī_erāmus audītī_erātis audītī_erant',
    'pas.fut2': 'audītus_erō audītus_eris audītus_erit audītī_erimus audītī_eritis audītī_erunt'
  },
  video_pp: { 'pas.perf': 'vīsus_sum vīsus_es vīsus_est vīsī_sumus vīsī_estis vīsī_sunt' },
  dico_pp: { 'pas.perf': 'dictus_sum dictus_es dictus_est dictī_sumus dictī_estis dictī_sunt' },
  mitto_pp: { 'pas.plpf': 'missus_eram missus_erās missus_erat missī_erāmus missī_erātis missī_erant' },
  // Ek fiiller: her birinden birkaç ayırt edici biçim
  laudo: { 'act.pres': 'laudō laudās laudat laudāmus laudātis laudant', 'act.perf': 'laudāvī laudāvistī laudāvit laudāvimus laudāvistis laudāvērunt' },
  voco: { 'act.fut': 'vocābō vocābis vocābit vocābimus vocābitis vocābunt', 'pas.pres': 'vocor vocāris vocātur vocāmur vocāminī vocantur' },
  porto: { 'act.impf': 'portābam portābās portābat portābāmus portābātis portābant' },
  narro: { 'pas.fut': 'narrābor narrāberis narrābitur narrābimur narrābiminī narrābuntur' },
  terreo: { 'act.pres': 'terreō terrēs terret terrēmus terrētis terrent', 'act.perf': 'terruī terruistī terruit terruimus terruistis terruērunt' },
  video: { 'act.pres': 'videō vidēs videt vidēmus vidētis vident', 'act.perf': 'vīdī vīdistī vīdit vīdimus vīdistis vīdērunt', 'pas.pres': 'videor vidēris vidētur vidēmur vidēminī videntur' },
  teneo: { 'act.fut': 'tenēbō tenēbis tenēbit tenēbimus tenēbitis tenēbunt' },
  doceo: { 'pas.impf': 'docēbar docēbāris docēbātur docēbāmur docēbāminī docēbantur', 'act.plpf': 'docueram docuerās docuerat docuerāmus docuerātis docuerant' },
  duco: { 'act.pres': 'dūcō dūcis dūcit dūcimus dūcitis dūcunt', 'act.fut': 'dūcam dūcēs dūcet dūcēmus dūcētis dūcent', 'act.perf': 'dūxī dūxistī dūxit dūximus dūxistis dūxērunt' },
  mitto: { 'pas.pres': 'mittor mitteris mittitur mittimur mittiminī mittuntur', 'act.perf': 'mīsī mīsistī mīsit mīsimus mīsistis mīsērunt' },
  scribo: { 'act.impf': 'scrībēbam scrībēbās scrībēbat scrībēbāmus scrībēbātis scrībēbant', 'act.fut2': 'scrīpserō scrīpseris scrīpserit scrīpserimus scrīpseritis scrīpserint' },
  dico: { 'pas.fut': 'dīcar dīcēris dīcētur dīcēmur dīcēminī dīcentur' },
  iacio: { 'act.pres': 'iaciō iacis iacit iacimus iacitis iaciunt', 'act.perf': 'iēcī iēcistī iēcit iēcimus iēcistis iēcērunt' },
  accipio: { 'pas.pres': 'accipior acciperis accipitur accipimur accipiminī accipiuntur' },
  rapio: { 'act.fut': 'rapiam rapiēs rapiet rapiēmus rapiētis rapient', 'act.perf': 'rapuī rapuistī rapuit rapuimus rapuistis rapuērunt' },
  cupio: { 'act.impf': 'cupiēbam cupiēbās cupiēbat cupiēbāmus cupiēbātis cupiēbant', 'act.perf': 'cupīvī cupīvistī cupīvit cupīvimus cupīvistis cupīvērunt' },
  invenio: { 'act.pres': 'inveniō invenīs invenit invenīmus invenītis inveniunt', 'act.perf': 'invēnī invēnistī invēnit invēnimus invēnistis invēnērunt' },
  custodio: { 'pas.fut': 'custōdiar custōdiēris custōdiētur custōdiēmur custōdiēminī custōdientur' },
  punio: { 'act.fut': 'pūniam pūniēs pūniet pūniēmus pūniētis pūnient', 'pas.pres': 'pūnior pūnīris pūnītur pūnīmur pūnīminī pūniuntur' },
  aperio: { 'act.impf': 'aperiēbam aperiēbās aperiēbat aperiēbāmus aperiēbātis aperiēbant', 'act.perf': 'aperuī aperuistī aperuit aperuimus aperuistis aperuērunt' }
};

// Türkçe anlam örnekleri
const TR = [
  ['amo', 'act.impf', 0, 'seviyordum'], ['amo', 'act.fut', 5, 'sevecekler'], ['amo', 'act.perf', 4, 'sevdiniz'],
  ['amo', 'act.plpf', 5, 'sevmişlerdi'], ['amo', 'act.fut2', 0, 'sevmiş olacağım'], ['amo', 'pas.pres', 0, 'seviliyorum'],
  ['capio', 'act.fut', 0, 'alacağım'], ['capio', 'act.fut', 4, 'alacaksınız'], ['capio', 'act.perf', 4, 'aldınız'],
  ['capio', 'act.plpf', 5, 'almışlardı'], ['laudo', 'act.perf', 4, 'övdünüz'], ['laudo', 'act.plpf', 1, 'övmüştün'],
  ['teneo', 'act.perf', 4, 'tuttunuz'], ['teneo', 'act.plpf', 3, 'tutmuştuk'], ['dico', 'act.fut', 3, 'söyleyeceğiz'],
  ['accipio', 'act.fut', 0, 'kabul edeceğim'], ['rego', 'pas.fut', 2, 'yönetilecek'], ['audio', 'pas.impf', 5, 'duyuluyorlardı'],
  ['amo', 'pas.perf', 0, 'sevildim'], ['amo', 'pas.plpf', 0, 'sevilmiştim'], ['amo', 'pas.fut2', 0, 'sevilmiş olacağım'],
  ['amo', 'pas.perf', 5, 'sevildiler'], ['capio', 'pas.plpf', 4, 'alınmıştınız'], ['laudo', 'pas.perf', 4, 'övüldünüz'],
  ['dico', 'pas.perf', 3, 'söylendik'], ['terreo', 'pas.fut2', 5, 'korkutulmuş olacaklar'],
  ['sum', 'act.fut', 0, 'olacağım'], ['sum', 'act.perf', 5, 'oldular'], ['possum', 'act.pres', 0, 'yapabilirim']
];

let fail = 0, ok = 0;
const byId = Object.fromEntries(L.VERBS.map(v => [v.id, v]));
for (const [rid, tables] of Object.entries(REF)) {
  const id = rid.replace(/_pp$/, '');
  const v = byId[id];
  if (!v) { console.log('Fiil yok:', id); fail++; continue; }
  for (const [key, ref] of Object.entries(tables)) {
    const [voice, tense] = key.split('.');
    const exp = ref.split(' ').map(x => x.replace('_', ' '));
    for (let i = 0; i < 6; i++) {
      const got = L.joinForm(L.form(v, voice, tense, i));
      if (got !== exp[i]) { console.log(`HATA ${id} ${key} ${L.PERSONS[i].id}: ${got} ≠ ${exp[i]}`); fail++; } else ok++;
    }
  }
}
for (const [id, key, i, exp] of TR) {
  const [voice, tense] = key.split('.');
  const got = L.meaning(byId[id], voice, tense, i);
  if (got !== exp) { console.log(`HATA anlam ${id} ${key} ${i}: ${got} ≠ ${exp}`); fail++; } else ok++;
}
// Yazma cevabı kabulü: [fiil, zaman, kişi, girdi, sadece ek modu, beklenen ok, beklenen cinsiyet]
const ANS = [
  ['amo', 'pas.perf', 0, 'amatus sum', false, true, 'm'],
  ['amo', 'pas.perf', 0, 'amāta sum', false, true, 'f'],
  ['amo', 'pas.perf', 0, 'amatum  sum', false, true, 'n'],
  ['amo', 'pas.perf', 3, 'amati sumus', false, true, 'm'],
  ['amo', 'pas.perf', 3, 'amatae sumus', false, true, 'f'],
  ['amo', 'pas.perf', 3, 'amata sumus', false, true, 'n'],
  ['amo', 'pas.perf', 0, 'amatae sum', false, false, null],   // çoğul ek, tekil kişi
  ['amo', 'pas.perf', 3, 'amatum sumus', false, false, null], // tekil ek, çoğul kişi
  ['amo', 'pas.perf', 0, 'amata es', false, false, null],     // yanlış kişi
  ['rego', 'pas.plpf', 2, '-a erat', true, true, 'f'],
  ['rego', 'pas.plpf', 2, 'um erat', true, true, 'n'],
  ['rego', 'pas.plpf', 2, 'um erat', false, false, null],     // tam biçim modunda sadece ek yetmez
  ['capio', 'pas.fut2', 5, 'ae erunt', true, true, 'f'],
  ['capio', 'pas.fut2', 5, 'capta erunt', false, true, 'n'],
  ['duco', 'pas.perf', 1, 'ductus es', false, true, 'm'],
  ['amo', 'act.perf', 0, 'AMAVI', false, true, null],
  ['amo', 'act.perf', 0, 'vi', true, false, null],
  ['amo', 'act.perf', 0, '-i', true, true, null],
  ['iacio', 'act.pres', 0, 'jacio', false, true, null]
];
for (const [id, key, i, input, endOnly, expOk, expG] of ANS) {
  const [voice, tense] = key.split('.');
  const r = L.checkAnswer(L.form(byId[id], voice, tense, i), input, endOnly);
  if (r.ok !== expOk || r.gender !== expG) {
    console.log(`HATA kabul ${id} ${key} ${i} "${input}": ${JSON.stringify(r)} ≠ ok=${expOk}, ${expG}`); fail++;
  } else ok++;
}
// Her fiil için tüm tabloların üretilebildiğini ve boş anlam olmadığını kontrol et
for (const v of L.VERBS) {
  for (const key of L.TENSE_KEYS) {
    const [voice, tense] = key.split('.');
    if (v.conj === 'irr' && voice === 'pas') continue;
    for (let i = 0; i < 6; i++) {
      const f = L.form(v, voice, tense, i);
      const m = L.meaning(v, voice, tense, i);
      if (!f || !f.length || !m) { console.log(`EKSİK ${v.id} ${key} ${i}`); fail++; }
    }
  }
}
console.log(`${ok} doğru, ${fail} hata`);
process.exit(fail ? 1 : 0);
