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
  ['sum', 'act.fut', 0, 'olacağım'], ['sum', 'act.perf', 5, 'oldular'], ['possum', 'act.pres', 0, 'yapabilirim']
];

let fail = 0, ok = 0;
const byId = Object.fromEntries(L.VERBS.map(v => [v.id, v]));
for (const [id, tables] of Object.entries(REF)) {
  const v = byId[id];
  if (!v) { console.log('Fiil yok:', id); fail++; continue; }
  for (const [key, ref] of Object.entries(tables)) {
    const [voice, tense] = key.split('.');
    const exp = ref.split(' ');
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
