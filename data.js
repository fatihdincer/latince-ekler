/* Latince fiil ekleri — veri ve çekim motoru.
 * Her biçim parçalardan oluşur: {t: metin, k: tür}
 *   k = 'r' kök (şimdiki zaman gövdesi), 'p' perfectum gövdesi,
 *       'v' bağlayıcı/tema ünlüsü, 'm' zaman işareti, 'e' kişi eki,
 *       'q' participium (PPP) gövdesi, 'a' sıfat eki (-us/-ī), 'x' yardımcı fiil (sum),
 *       'sp' iki kelime arasındaki boşluk
 * Hem tarayıcıda (global LATIN) hem Node'da (module.exports) çalışır.
 */
(function (root) {
  'use strict';

  const PERSONS = [
    { id: '1s', label: '1. tekil', short: 'ben', num: 'tekil', per: 1 },
    { id: '2s', label: '2. tekil', short: 'sen', num: 'tekil', per: 2 },
    { id: '3s', label: '3. tekil', short: 'o', num: 'tekil', per: 3 },
    { id: '1p', label: '1. çoğul', short: 'biz', num: 'çoğul', per: 1 },
    { id: '2p', label: '2. çoğul', short: 'siz', num: 'çoğul', per: 2 },
    { id: '3p', label: '3. çoğul', short: 'onlar', num: 'çoğul', per: 3 }
  ];

  const TENSES = {
    pres: { name: 'Praesens', abbr: 'Praes.', tr: 'şimdiki zaman' },
    impf: { name: 'Imperfectum', abbr: 'Impf.', tr: 'geçmişte süregelen' },
    fut: { name: 'Futurum I', abbr: 'Fut. I', tr: 'gelecek zaman' },
    perf: { name: 'Perfectum', abbr: 'Perf.', tr: 'geçmiş (tamamlanmış)' },
    // ­: dar ekranda kelime buradan bölünebilsin
    plpf: { name: 'Plusquam­perfectum', abbr: 'Plpf.', tr: 'geçmişten önceki geçmiş' },
    fut2: { name: 'Futurum II', abbr: 'Fut. II', tr: 'gelecekte tamamlanmış' }
  };

  const VOICES = { act: 'etken', pas: 'edilgen', irr: 'düzensiz' };

  // "Zaman" seçenekleri: çatı + zaman birleşimi
  const TENSE_KEYS = [
    'act.pres', 'act.impf', 'act.fut', 'act.perf', 'act.plpf', 'act.fut2',
    'pas.pres', 'pas.impf', 'pas.fut', 'pas.perf', 'pas.plpf', 'pas.fut2'
  ];

  function tenseLabel(voice, tense) {
    const t = TENSES[tense].name;
    return voice === 'pas' ? t + ' (edilgen)' : t;
  }

  const STAGES = [
    { n: 1, title: 'Kişi ekleri (praesens, etken)', keys: ['act.pres'], irregular: false,
      desc: 'Etken çatının kişi ekleri: -ō/-m, -s, -t, -mus, -tis, -nt.' },
    { n: 2, title: 'Praesens · Imperfectum · Futurum I', keys: ['act.pres', 'act.impf', 'act.fut'], irregular: false,
      desc: 'Zaman işaretleri: -ba- (imperfectum); -b-/-bi-/-bu- (1.-2. çekim futurum); -a-/-e- (3.-4. çekim futurum).' },
    { n: 3, title: 'Perfectum · Plusquamperfectum · Futurum II', keys: ['act.perf', 'act.plpf', 'act.fut2'], irregular: false,
      desc: 'Perfectum gövdesi + -ī, -istī, -it…; -era-; -er-/-eri-.' },
    { n: 4, title: 'Edilgen çatı', keys: ['pas.pres', 'pas.impf', 'pas.fut'], irregular: false,
      desc: 'Edilgen kişi ekleri: -r, -ris, -tur, -mur, -minī, -ntur.' },
    { n: 5, title: 'Düzensiz: sum, possum', keys: ['act.pres', 'act.impf', 'act.fut', 'act.perf', 'act.plpf', 'act.fut2'], irregular: true,
      desc: 'sum (olmak) ve possum (-ebilmek): ekler tanıdık, gövde düzensiz.' },
    { n: 6, title: 'Edilgen perfectum sistemi', keys: ['pas.perf', 'pas.plpf', 'pas.fut2'], irregular: false,
      desc: 'Participium + sum: amātus sum, amātus eram, amātus erō.' }
  ];

  const CONJ = {
    '1': { name: '1. çekim', model: 'amō' },
    '2': { name: '2. çekim', model: 'moneō' },
    '3': { name: '3. çekim', model: 'regō' },
    '3io': { name: '3. çekim (-iō)', model: 'capiō' },
    '4': { name: '4. çekim', model: 'audiō' }
  };

  /* Türkçe anlam gövdeleri:
   * yor: -iyor gövdesi, ecek: gelecek gövdesi (k ile biter), di: 3. tekil -di'li geçmiş,
   * mis: -miş gövdesi, pyor / pecek: edilgen gövdeler. */
  const VERBS = [
    // 1. çekim
    { id: 'amo', conj: '1', lemma: 'amō, amāre, amāvī, amātus', root: 'am', perf: 'amāv', ppp: 'amāt', tr: 'sevmek',
      t: { yor: 'seviyor', ecek: 'sevecek', di: 'sevdi', mis: 'sevmiş', pyor: 'seviliyor', pecek: 'sevilecek' } },
    { id: 'laudo', conj: '1', lemma: 'laudō, laudāre, laudāvī, laudātus', root: 'laud', perf: 'laudāv', ppp: 'laudāt', tr: 'övmek',
      t: { yor: 'övüyor', ecek: 'övecek', di: 'övdü', mis: 'övmüş', pyor: 'övülüyor', pecek: 'övülecek' } },
    { id: 'voco', conj: '1', lemma: 'vocō, vocāre, vocāvī, vocātus', root: 'voc', perf: 'vocāv', ppp: 'vocāt', tr: 'çağırmak',
      t: { yor: 'çağırıyor', ecek: 'çağıracak', di: 'çağırdı', mis: 'çağırmış', pyor: 'çağrılıyor', pecek: 'çağrılacak' } },
    { id: 'porto', conj: '1', lemma: 'portō, portāre, portāvī, portātus', root: 'port', perf: 'portāv', ppp: 'portāt', tr: 'taşımak',
      t: { yor: 'taşıyor', ecek: 'taşıyacak', di: 'taşıdı', mis: 'taşımış', pyor: 'taşınıyor', pecek: 'taşınacak' } },
    { id: 'narro', conj: '1', lemma: 'narrō, narrāre, narrāvī, narrātus', root: 'narr', perf: 'narrāv', ppp: 'narrāt', tr: 'anlatmak',
      t: { yor: 'anlatıyor', ecek: 'anlatacak', di: 'anlattı', mis: 'anlatmış', pyor: 'anlatılıyor', pecek: 'anlatılacak' } },
    // 2. çekim
    { id: 'moneo', conj: '2', lemma: 'moneō, monēre, monuī, monitus', root: 'mon', perf: 'monu', ppp: 'monit', tr: 'uyarmak',
      t: { yor: 'uyarıyor', ecek: 'uyaracak', di: 'uyardı', mis: 'uyarmış', pyor: 'uyarılıyor', pecek: 'uyarılacak' } },
    { id: 'terreo', conj: '2', lemma: 'terreō, terrēre, terruī, territus', root: 'terr', perf: 'terru', ppp: 'territ', tr: 'korkutmak',
      t: { yor: 'korkutuyor', ecek: 'korkutacak', di: 'korkuttu', mis: 'korkutmuş', pyor: 'korkutuluyor', pecek: 'korkutulacak' } },
    { id: 'video', conj: '2', lemma: 'videō, vidēre, vīdī, vīsus', root: 'vid', perf: 'vīd', ppp: 'vīs', tr: 'görmek',
      // fiile özel ipucu: çatı → ipuçları
      tips: { pas: ['videor çoğunlukla „görünüyorum, …gibi görünüyorum" anlamındadır: vidētur „(öyle) görünüyor", ' +
                    'bonus vidētur „iyi görünüyor". „Görülüyorum" anlamı da var ama daha seyrek.'] },
      t: { yor: 'görüyor', ecek: 'görecek', di: 'gördü', mis: 'görmüş', pyor: 'görülüyor', pecek: 'görülecek' } },
    { id: 'teneo', conj: '2', lemma: 'teneō, tenēre, tenuī, tentus', root: 'ten', perf: 'tenu', ppp: 'tent', tr: 'tutmak',
      t: { yor: 'tutuyor', ecek: 'tutacak', di: 'tuttu', mis: 'tutmuş', pyor: 'tutuluyor', pecek: 'tutulacak' } },
    { id: 'doceo', conj: '2', lemma: 'doceō, docēre, docuī, doctus', root: 'doc', perf: 'docu', ppp: 'doct', tr: 'öğretmek',
      t: { yor: 'öğretiyor', ecek: 'öğretecek', di: 'öğretti', mis: 'öğretmiş', pyor: 'öğretiliyor', pecek: 'öğretilecek' } },
    // 3. çekim
    { id: 'rego', conj: '3', lemma: 'regō, regere, rēxī, rēctus', root: 'reg', perf: 'rēx', ppp: 'rēct', tr: 'yönetmek',
      t: { yor: 'yönetiyor', ecek: 'yönetecek', di: 'yönetti', mis: 'yönetmiş', pyor: 'yönetiliyor', pecek: 'yönetilecek' } },
    { id: 'duco', conj: '3', lemma: 'dūcō, dūcere, dūxī, dūctus', root: 'dūc', perf: 'dūx', ppp: 'dūct', tr: 'götürmek',
      t: { yor: 'götürüyor', ecek: 'götürecek', di: 'götürdü', mis: 'götürmüş', pyor: 'götürülüyor', pecek: 'götürülecek' } },
    { id: 'mitto', conj: '3', lemma: 'mittō, mittere, mīsī, missus', root: 'mitt', perf: 'mīs', ppp: 'miss', tr: 'göndermek',
      t: { yor: 'gönderiyor', ecek: 'gönderecek', di: 'gönderdi', mis: 'göndermiş', pyor: 'gönderiliyor', pecek: 'gönderilecek' } },
    { id: 'scribo', conj: '3', lemma: 'scrībō, scrībere, scrīpsī, scrīptus', root: 'scrīb', perf: 'scrīps', ppp: 'scrīpt', tr: 'yazmak',
      t: { yor: 'yazıyor', ecek: 'yazacak', di: 'yazdı', mis: 'yazmış', pyor: 'yazılıyor', pecek: 'yazılacak' } },
    { id: 'dico', conj: '3', lemma: 'dīcō, dīcere, dīxī, dictus', root: 'dīc', perf: 'dīx', ppp: 'dict', tr: 'söylemek',
      t: { yor: 'söylüyor', ecek: 'söyleyecek', di: 'söyledi', mis: 'söylemiş', pyor: 'söyleniyor', pecek: 'söylenecek' } },
    // 3. çekim -iō
    { id: 'capio', conj: '3io', lemma: 'capiō, capere, cēpī, captus', root: 'cap', perf: 'cēp', ppp: 'capt', tr: 'almak, yakalamak',
      t: { yor: 'alıyor', ecek: 'alacak', di: 'aldı', mis: 'almış', pyor: 'alınıyor', pecek: 'alınacak' } },
    { id: 'iacio', conj: '3io', lemma: 'iaciō, iacere, iēcī, iactus', root: 'iac', perf: 'iēc', ppp: 'iact', tr: 'atmak, fırlatmak',
      t: { yor: 'atıyor', ecek: 'atacak', di: 'attı', mis: 'atmış', pyor: 'atılıyor', pecek: 'atılacak' } },
    { id: 'accipio', conj: '3io', lemma: 'accipiō, accipere, accēpī, acceptus', root: 'accip', perf: 'accēp', ppp: 'accept', tr: 'kabul etmek',
      t: { yor: 'kabul ediyor', ecek: 'kabul edecek', di: 'kabul etti', mis: 'kabul etmiş', pyor: 'kabul ediliyor', pecek: 'kabul edilecek' } },
    { id: 'rapio', conj: '3io', lemma: 'rapiō, rapere, rapuī, raptus', root: 'rap', perf: 'rapu', ppp: 'rapt', tr: 'kapmak',
      t: { yor: 'kapıyor', ecek: 'kapacak', di: 'kaptı', mis: 'kapmış', pyor: 'kapılıyor', pecek: 'kapılacak' } },
    { id: 'cupio', conj: '3io', lemma: 'cupiō, cupere, cupīvī, cupītus', root: 'cup', perf: 'cupīv', ppp: 'cupīt', tr: 'arzulamak',
      t: { yor: 'arzuluyor', ecek: 'arzulayacak', di: 'arzuladı', mis: 'arzulamış', pyor: 'arzulanıyor', pecek: 'arzulanacak' } },
    // 4. çekim
    { id: 'audio', conj: '4', lemma: 'audiō, audīre, audīvī, audītus', root: 'aud', perf: 'audīv', ppp: 'audīt', tr: 'duymak',
      t: { yor: 'duyuyor', ecek: 'duyacak', di: 'duydu', mis: 'duymuş', pyor: 'duyuluyor', pecek: 'duyulacak' } },
    { id: 'invenio', conj: '4', lemma: 'inveniō, invenīre, invēnī, inventus', root: 'inven', perf: 'invēn', ppp: 'invent', tr: 'bulmak',
      t: { yor: 'buluyor', ecek: 'bulacak', di: 'buldu', mis: 'bulmuş', pyor: 'bulunuyor', pecek: 'bulunacak' } },
    { id: 'custodio', conj: '4', lemma: 'custōdiō, custōdīre, custōdīvī, custōdītus', root: 'custōd', perf: 'custōdīv', ppp: 'custōdīt', tr: 'korumak',
      t: { yor: 'koruyor', ecek: 'koruyacak', di: 'korudu', mis: 'korumuş', pyor: 'korunuyor', pecek: 'korunacak' } },
    { id: 'punio', conj: '4', lemma: 'pūniō, pūnīre, pūnīvī, pūnītus', root: 'pūn', perf: 'pūnīv', ppp: 'pūnīt', tr: 'cezalandırmak',
      t: { yor: 'cezalandırıyor', ecek: 'cezalandıracak', di: 'cezalandırdı', mis: 'cezalandırmış', pyor: 'cezalandırılıyor', pecek: 'cezalandırılacak' } },
    { id: 'aperio', conj: '4', lemma: 'aperiō, aperīre, aperuī, apertus', root: 'aper', perf: 'aperu', ppp: 'apert', tr: 'açmak',
      t: { yor: 'açıyor', ecek: 'açacak', di: 'açtı', mis: 'açmış', pyor: 'açılıyor', pecek: 'açılacak' } },
    // Düzensiz
    { id: 'sum', conj: 'irr', lemma: 'sum, esse, fuī', perf: 'fu', tr: 'olmak',
      t: { ecek: 'olacak', di: 'oldu', mis: 'olmuş' },
      trOverride: {
        // Türkçede ek-fiil: örnek kelimeyle göster
        pres: ['(ben) …-im: öğrenciyim', '(sen) …-sin: öğrencisin', '(o) …-dir: öğrencidir',
               '(biz) …-iz: öğrenciyiz', '(siz) …-siniz: öğrencisiniz', '(onlar) …-dirler: öğrencidirler'],
        impf: ['(ben) …-idim: öğrenciydim', '(sen) …-idin: öğrenciydin', '(o) …-idi: öğrenciydi',
               '(biz) …-idik: öğrenciydik', '(siz) …-idiniz: öğrenciydiniz', '(onlar) …-idiler: öğrenciydiler']
      } },
    { id: 'possum', conj: 'irr', lemma: 'possum, posse, potuī', perf: 'potu', tr: '-ebilmek, gücü yetmek',
      t: { yor: 'yapabiliyor', ecek: 'yapabilecek', di: 'yapabildi', mis: 'yapabilmiş' },
      trOverride: {
        pres: ['yapabilirim', 'yapabilirsin', 'yapabilir', 'yapabiliriz', 'yapabilirsiniz', 'yapabilirler']
      } }
  ];

  /* ---------- Ek tabloları ---------- */
  const END_ACT_O = ['ō', 's', 't', 'mus', 'tis', 'nt'];   // 1. tekil -ō
  const END_ACT_M = ['m', 's', 't', 'mus', 'tis', 'nt'];   // 1. tekil -m
  const END_PAS_OR = ['or', 'ris', 'tur', 'mur', 'minī', 'ntur'];
  const END_PAS_R = ['r', 'ris', 'tur', 'mur', 'minī', 'ntur'];
  const END_PERF = ['ī', 'istī', 'it', 'imus', 'istis', 'ērunt'];

  // Praesens'te kök ile kişi eki arasındaki tema ünlüsü
  const THEME_PRES_ACT = {
    '1': ['', 'ā', 'a', 'ā', 'ā', 'a'],
    '2': ['e', 'ē', 'e', 'ē', 'ē', 'e'],
    '3': ['', 'i', 'i', 'i', 'i', 'u'],
    '3io': ['i', 'i', 'i', 'i', 'i', 'iu'],
    '4': ['i', 'ī', 'i', 'ī', 'ī', 'iu']
  };
  const THEME_PRES_PAS = {
    '1': ['', 'ā', 'ā', 'ā', 'ā', 'a'],
    '2': ['e', 'ē', 'ē', 'ē', 'ē', 'e'],
    '3': ['', 'e', 'i', 'i', 'i', 'u'],
    '3io': ['i', 'e', 'i', 'i', 'i', 'iu'],
    '4': ['i', 'ī', 'ī', 'ī', 'ī', 'iu']
  };
  // Imperfectum: tema ünlüsü + -bā-
  const THEME_IMPF = { '1': 'ā', '2': 'ē', '3': 'ē', '3io': 'iē', '4': 'iē' };
  const MARK_IMPF_ACT = ['ba', 'bā', 'ba', 'bā', 'bā', 'ba'];
  const MARK_IMPF_PAS = ['ba', 'bā', 'bā', 'bā', 'bā', 'ba'];
  // Futurum I, 1.-2. çekim: tema ünlüsü + -b-/-bi-/-bu-
  const MARK_FUT_B_ACT = ['b', 'bi', 'bi', 'bi', 'bi', 'bu'];
  const MARK_FUT_B_PAS = ['b', 'be', 'bi', 'bi', 'bi', 'bu'];
  // Futurum I, 3.-4. çekim: -a- / -ē-
  const THEME_FUT_AE = { '3': '', '3io': 'i', '4': 'i' };
  const MARK_FUT_AE_ACT = ['a', 'ē', 'e', 'ē', 'ē', 'e'];
  const MARK_FUT_AE_PAS = ['a', 'ē', 'ē', 'ē', 'ē', 'e'];
  // Perfectum gövdesinden kurulan zamanlar
  const MARK_PLPF = ['era', 'erā', 'era', 'erā', 'erā', 'era'];
  const MARK_FUT2 = ['er', 'eri', 'eri', 'eri', 'eri', 'eri'];
  // Edilgen perfectum sistemi: PPP + -us/-ī + sum'ın praesens / imperfectum / futurum biçimi
  const AUX = {
    perf: ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'],
    plpf: ['eram', 'erās', 'erat', 'erāmus', 'erātis', 'erant'],
    fut2: ['erō', 'eris', 'erit', 'erimus', 'eritis', 'erunt']
  };

  function seg(t, k) { return { t: t, k: k }; }
  function clean(parts) { return parts.filter(function (p) { return p.t !== ''; }); }

  function regularForm(v, voice, tense, i) {
    const c = v.conj;
    const r = seg(v.root, 'r');
    if (voice === 'act') {
      switch (tense) {
        case 'pres': return clean([r, seg(THEME_PRES_ACT[c][i], 'v'), seg(END_ACT_O[i], 'e')]);
        case 'impf': return clean([r, seg(THEME_IMPF[c], 'v'), seg(MARK_IMPF_ACT[i], 'm'), seg(END_ACT_M[i], 'e')]);
        case 'fut':
          if (c === '1' || c === '2') {
            return clean([r, seg(THEME_IMPF[c], 'v'), seg(MARK_FUT_B_ACT[i], 'm'), seg(END_ACT_O[i], 'e')]);
          }
          return clean([r, seg(THEME_FUT_AE[c], 'v'), seg(MARK_FUT_AE_ACT[i], 'm'), seg(END_ACT_M[i], 'e')]);
        case 'perf': return [seg(v.perf, 'p'), seg(END_PERF[i], 'e')];
        case 'plpf': return [seg(v.perf, 'p'), seg(MARK_PLPF[i], 'm'), seg(END_ACT_M[i], 'e')];
        case 'fut2': return [seg(v.perf, 'p'), seg(MARK_FUT2[i], 'm'), seg(END_ACT_O[i], 'e')];
      }
    } else if (voice === 'pas') {
      switch (tense) {
        case 'pres': return clean([r, seg(THEME_PRES_PAS[c][i], 'v'), seg(END_PAS_OR[i], 'e')]);
        case 'impf': return clean([r, seg(THEME_IMPF[c], 'v'), seg(MARK_IMPF_PAS[i], 'm'), seg(END_PAS_R[i], 'e')]);
        case 'fut':
          if (c === '1' || c === '2') {
            return clean([r, seg(THEME_IMPF[c], 'v'), seg(MARK_FUT_B_PAS[i], 'm'), seg(END_PAS_OR[i], 'e')]);
          }
          return clean([r, seg(THEME_FUT_AE[c], 'v'), seg(MARK_FUT_AE_PAS[i], 'm'), seg(END_PAS_R[i], 'e')]);
        case 'perf': case 'plpf': case 'fut2':
          // tabloda eril: -us (tekil), -ī (çoğul)
          return [seg(v.ppp, 'q'), seg(i < 3 ? 'us' : 'ī', 'a'), seg(' ', 'sp'), seg(AUX[tense][i], 'x')];
      }
    }
    return null;
  }

  /* sum: ekler tanıdık ama gövde düzensiz; elle parçalanmış */
  const SUM = {
    pres: [[['su', 'r'], ['m', 'e']], [['e', 'r'], ['s', 'e']], [['es', 'r'], ['t', 'e']],
           [['su', 'r'], ['mus', 'e']], [['es', 'r'], ['tis', 'e']], [['su', 'r'], ['nt', 'e']]],
    impf: [[['er', 'r'], ['a', 'm'], ['m', 'e']], [['er', 'r'], ['ā', 'm'], ['s', 'e']], [['er', 'r'], ['a', 'm'], ['t', 'e']],
           [['er', 'r'], ['ā', 'm'], ['mus', 'e']], [['er', 'r'], ['ā', 'm'], ['tis', 'e']], [['er', 'r'], ['a', 'm'], ['nt', 'e']]],
    fut: [[['er', 'r'], ['ō', 'e']], [['er', 'r'], ['i', 'v'], ['s', 'e']], [['er', 'r'], ['i', 'v'], ['t', 'e']],
          [['er', 'r'], ['i', 'v'], ['mus', 'e']], [['er', 'r'], ['i', 'v'], ['tis', 'e']], [['er', 'r'], ['u', 'v'], ['nt', 'e']]]
  };

  function irregularForm(v, tense, i) {
    if (tense === 'perf' || tense === 'plpf' || tense === 'fut2') {
      return regularForm({ perf: v.perf, conj: 'irr' }, 'act', tense, i);
    }
    const base = SUM[tense][i].map(function (p) { return seg(p[0], p[1]); });
    if (v.id === 'sum') return base;
    // possum = pot- + sum; s'den önce pot- → pos-
    const first = base[0].t;
    const pre = first.charAt(0) === 's' ? 'pos' : 'pot';
    return [seg(pre, 'r')].concat(base);
  }

  function form(v, voice, tense, i) {
    if (v.conj === 'irr') return voice === 'pas' ? null : irregularForm(v, tense, i);
    return regularForm(v, voice, tense, i);
  }

  function joinForm(parts) { return parts.map(function (p) { return p.t; }).join(''); }

  /* ---------- Türkçe anlam ---------- */
  function lastVowel(s) {
    const m = s.match(/[aeıioöuü](?=[^aeıioöuü]*$)/);
    return m ? m[0] : 'e';
  }
  function isFront(s) { return 'eiöü'.indexOf(lastVowel(s)) >= 0; }
  // dört yollu ünlü uyumu: i/ı/u/ü
  function v4(s) { return { a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' }[lastVowel(s)]; }

  function trYor(st) { return [st + 'um', st + 'sun', st, st + 'uz', st + 'sunuz', st + 'lar']; }
  function trYordu(st) { return [st + 'dum', st + 'dun', st + 'du', st + 'duk', st + 'dunuz', st + 'lardı']; }
  function trEcek(st) {
    const x = st.slice(0, -1); const f = isFront(st);
    return [x + (f ? 'ğim' : 'ğım'), st + (f ? 'sin' : 'sın'), st,
            x + (f ? 'ğiz' : 'ğız'), st + (f ? 'siniz' : 'sınız'), st + (f ? 'ler' : 'lar')];
  }
  function trDi(st) {
    const u = v4(st);
    return [st + 'm', st + 'n', st, st + 'k', st + 'n' + u + 'z', st + (isFront(st) ? 'ler' : 'lar')];
  }
  function trMisti(st) {
    const u = v4(st);
    return [st + 't' + u + 'm', st + 't' + u + 'n', st + 't' + u, st + 't' + u + 'k', st + 't' + u + 'n' + u + 'z',
            st + (isFront(st) ? 'lerdi' : 'lardı')];
  }
  function trFut2(st) { return trEcek('olacak').map(function (o) { return st + ' ' + o; }); }

  function meaning(v, voice, tense, i) {
    if (v.trOverride && v.trOverride[tense] && voice !== 'pas') return v.trOverride[tense][i];
    const t = v.t;
    if (voice === 'pas') {
      if (tense === 'pres') return trYor(t.pyor)[i];
      if (tense === 'impf') return trYordu(t.pyor)[i];
      if (tense === 'fut') return trEcek(t.pecek)[i];
      // edilgen gövde: "seviliyor" → "sevil"
      const ps = t.pyor.slice(0, -4);
      if (tense === 'perf') return trDi(ps + 'd' + v4(ps))[i];
      if (tense === 'plpf') return trMisti(ps + 'm' + v4(ps) + 'ş')[i];
      if (tense === 'fut2') return trFut2(ps + 'm' + v4(ps) + 'ş')[i];
      return '';
    }
    switch (tense) {
      case 'pres': return trYor(t.yor)[i];
      case 'impf': return trYordu(t.yor)[i];
      case 'fut': return trEcek(t.ecek)[i];
      case 'perf': return trDi(t.di)[i];
      case 'plpf': return trMisti(t.mis)[i];
      case 'fut2': return trFut2(t.mis)[i];
    }
    return '';
  }

  /* ---------- İpuçları ----------
   * Metin ya da {t, c}: c verilirse yalnız o çekimlerde gösterilir. */
  const TIPS = {
    'act.pres': [
      'Praesens\'te zaman işareti yok: kök + (tema ünlüsü) + kişi eki.',
      'Kişi ekleri: -ō/-m, -s, -t, -mus, -tis, -nt. Bunları her zamanda tekrar göreceksin.',
      { t: '3. çekimde ara ünlü -i-, 3. çoğulda -u-: regis, regit, regunt.', c: ['3'] },
      { t: '4. çekim ve -iō fiillerinde 3. çoğul -iunt: audiunt, capiunt.', c: ['3io', '4'] }
    ],
    'act.impf': [
      '-ba- görürsen imperfectum: amābam, monēbās, regēbat.',
      { t: '3. ve 4. çekimde -ba- önünde -ē- / -iē- var: regēbam, capiēbam, audiēbam.', c: ['3', '3io', '4'] },
      '1. tekil -m ile biter (-ō değil): amābam.'
    ],
    'act.fut': [
      { t: '1. ve 2. çekimde futurum -b- ile: amābō, amābis, amābit … amābunt (-bō / -bi- / -bu-).', c: ['1', '2'] },
      { t: '3. ve 4. çekimde futurum -e- ile yapılır, -bi- değil: regēs, reget, regent.', c: ['3', '3io', '4'] },
      { t: '3.-4. çekimde 1. tekil -am: regam, capiam, audiam.', c: ['3', '3io', '4'] },
      { t: 'Dikkat: regis (praesens) ≠ regēs (futurum); regit ≠ reget.', c: ['3'] },
      { t: 'Dikkat: monēbit (futurum, -bi-) ≠ monēbat (imperfectum, -ba-).', c: ['1', '2'] }
    ],
    'act.perf': [
      'Perfectum kendi gövdesiyle kurulur — sözlükteki 3. biçimden -ī atılır: amāvī → amāv-.',
      'Perfectum ekleri sadece burada: -ī, -istī, -it, -imus, -istis, -ērunt.',
      'Gövdeler: amāv-, monu-, rēx-, cēp-, audīv-. Gövde ezberlenir, ek hep aynıdır.'
    ],
    'act.plpf': [
      'Perfectum gövdesi + -era- = plusquamperfectum: amāveram, rēxerās.',
      '-era- aslında sum\'ın imperfectumu (eram, erās…) gibi görünür.'
    ],
    'act.fut2': [
      'Perfectum gövdesi + -er-/-eri- = futurum II: amāverō, amāveris.',
      'sum\'ın futurumu gibi (erō, eris…) ama 3. çoğul -erint (-erunt değil).',
      'amāverint (futurum II) ≠ amāverant (plusquamperfectum) ≠ amāvērunt (perfectum).'
    ],
    'pas.pres': [
      'Edilgen kişi ekleri: -r (-or), -ris, -tur, -mur, -minī, -ntur.',
      '-ntur görürsen edilgen 3. çoğul; -tur edilgen 3. tekil.',
      { t: '3. çekim 2. tekilde -e-: regeris, caperis (kısa e).', c: ['3', '3io'] }
    ],
    'pas.impf': [
      'Etkendeki -ba- aynen kalır, sadece kişi eki değişir: amābam → amābar.',
      '1. tekilde -m yerine -r gelir: regēbar.'
    ],
    'pas.fut': [
      { t: '1.-2. çekimde 2. tekil -beris (-bi- değil): amāberis, monēberis.', c: ['1', '2'] },
      { t: '3.-4. çekim edilgen futurum: regar, regēris, regētur … regentur.', c: ['3', '3io', '4'] },
      { t: 'regeris (praesens, kısa e) ≠ regēris (futurum, uzun ē).', c: ['3'] }
    ],
    'pas.perf': [
      'Edilgen perfectum iki kelimedir: participium (PPP) + sum. amātus sum = sevildim.',
      'Zamanı yardımcı fiil gösterir: sum/es/est… → perfectum. Dikkat: amātus sum „sevildim", „seviliyorum" değil!',
      'Participium sıfat gibi özneye uyar: amātus (eril), amāta (dişil), amātum (nötr); çoğulda amātī, amātae, amāta. Tabloda eril gösteriliyor.',
      'PPP gövdesi sözlükteki 4. biçimden gelir: amātus → amāt-, monitus → monit-, rēctus → rēct-.'
    ],
    'pas.plpf': [
      'PPP + sum\'ın imperfectumu (eram, erās…) = edilgen plusquamperfectum: amātus eram „sevilmiştim".',
      'Etkendeki -era- burada ayrı kelime olarak çıkar: amāveram ↔ amātus eram.',
      'Cinsiyet: amāta eram (kadın), amātum erat (nötr). Tabloda eril.'
    ],
    'pas.fut2': [
      'PPP + sum\'ın futurumu (erō, eris…) = edilgen futurum II: amātus erō „sevilmiş olacağım".',
      '3. çoğul amātī erunt (erint değil — burada sum\'ın kendi futurumu kullanılır).',
      'Cinsiyet: amāta erō (kadın), amātum erit (nötr). Tabloda eril.'
    ],
    'irr': [
      'sum: su-m, e-s, es-t, su-mus, es-tis, su-nt — ekler tanıdık!',
      { t: 'sum\'ın Türkçe karşılığı çoğunlukla ek-fiildir: discipulus sum „öğrenciyim", discipulus erat „öğrenciydi". ' +
           'Futurum ve perfectumda „olmak": erō „olacağım", fuī „oldum".', v: 'sum' },
      'possum = pot- + sum; s\'den önce pot- → pos-: possum, possunt; diğerlerinde pot-: potes, poterat.',
      'Perfectum düzenli: fu- ve potu- gövdesi + -ī, -istī, -it…'
    ]
  };

  /* Ek parçalarının açıklaması (yanlış cevapta gösterilir) */
  function explainPart(p, v, voice, tense, i) {
    const pr = PERSONS[i];
    switch (p.k) {
      case 'r': return 'kök' + (v.conj === 'irr' ? ' (düzensiz)' : ' — ' + (CONJ[v.conj] ? CONJ[v.conj].name : ''));
      case 'p': return 'perfectum gövdesi → perfectum sistemi (perfectum / plusquamperfectum / futurum II)';
      case 'v': return 'tema / bağlayıcı ünlü';
      case 'm':
        if (v.conj === 'irr' && tense === 'impf') return 'zaman işareti -a- (er-a-m) → imperfectum';
        if (tense === 'impf') return 'zaman işareti -ba- → imperfectum';
        if (tense === 'fut') return /^b/.test(p.t) ? 'zaman işareti -b- → futurum I (1.-2. çekim)' : 'zaman işareti -a-/-e- → futurum I (3.-4. çekim)';
        if (tense === 'plpf') return 'zaman işareti -era- → plusquamperfectum';
        if (tense === 'fut2') return 'zaman işareti -er(i)- → futurum II';
        return 'zaman işareti';
      case 'q': return 'participium (PPP) gövdesi → edilgen perfectum sistemi';
      case 'a': return 'sıfat eki ' + (i < 3 ? '-us → tekil (eril)' : '-ī → çoğul (eril)');
      case 'x': {
        const which = { perf: 'sum\'ın praesensi → perfectum', plpf: 'sum\'ın imperfectumu → plusquamperfectum',
                        fut2: 'sum\'ın futurumu → futurum II' }[tense];
        return 'yardımcı fiil: ' + which + '; kişiyi gösterir → ' + pr.label + ' (' + pr.short + ')';
      }
      case 'e': {
        const kind = voice === 'pas' ? 'edilgen kişi eki' : (tense === 'perf' ? 'perfectum kişi eki' : 'kişi eki');
        return kind + ' → ' + pr.label + ' (' + pr.short + ')';
      }
    }
    return '';
  }

  // Fiile uygun ipuçları: genel + çekime özel ({c}) + fiile özel ({v} ya da v.tips[çatı])
  function tips(v, tk) {
    const conj = v.conj;
    const list = TIPS[conj === 'irr' ? 'irr' : tk] || [];
    const out = list.filter(function (x) {
      if (typeof x === 'string') return true;
      if (x.c) return x.c.indexOf(conj) >= 0;
      return x.v === v.id;
    }).map(function (x) { return typeof x === 'string' ? x : x.t; });
    const own = v.tips && v.tips[tk.split('.')[0]];
    return own ? own.concat(out) : out;
  }

  function stripMacrons(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /* ---------- Yazma cevabının kontrolü ---------- */
  // makron ve büyük/küçük harf önemsiz; baştaki tire ve boşluklar atılır
  function normalizeAnswer(s) {
    return stripMacrons(s).replace(/\s+/g, '').replace(/^-+/, '').replace(/j/g, 'i');
  }
  // Edilgen perfectum sisteminde participium özneye uyar:
  // tekil -us / -a / -um, çoğul -ī / -ae / -a (eril / dişil / nötr)
  const ADJ_VARIANTS = {
    us: [['us', 'm'], ['a', 'f'], ['um', 'n']],
    'ī': [['ī', 'm'], ['ae', 'f'], ['a', 'n']]
  };
  // parts: beklenen biçim; endOnly: kök/gövde verildi, sadece ek de kabul.
  // Sonuç {ok, gender}: gender = 'm' | 'f' | 'n' (yalnız sıfat ekli biçimlerde), yoksa null.
  function checkAnswer(parts, input, endOnly) {
    const a = normalizeAnswer(input);
    let stemLen = 0;
    while (stemLen < parts.length && 'rpq'.indexOf(parts[stemLen].k) >= 0) stemLen++;
    const adj = parts.findIndex(function (p) { return p.k === 'a'; });
    const variants = adj < 0 ? [[null, parts]] : ADJ_VARIANTS[parts[adj].t].map(function (x) {
      return [x[1], parts.map(function (p, j) { return j === adj ? seg(x[0], 'a') : p; })];
    });
    for (let n = 0; n < variants.length; n++) {
      const ps = variants[n][1];
      if (a === normalizeAnswer(joinForm(ps)) || (endOnly && a === normalizeAnswer(joinForm(ps.slice(stemLen))))) {
        return { ok: true, gender: variants[n][0] };
      }
    }
    return { ok: false, gender: null };
  }

  const API = {
    PERSONS: PERSONS, TENSES: TENSES, VOICES: VOICES, TENSE_KEYS: TENSE_KEYS, STAGES: STAGES,
    CONJ: CONJ, VERBS: VERBS, TIPS: TIPS,
    form: form, joinForm: joinForm, meaning: meaning, tenseLabel: tenseLabel,
    explainPart: explainPart, tips: tips, stripMacrons: stripMacrons,
    normalizeAnswer: normalizeAnswer, checkAnswer: checkAnswer
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.LATIN = API;
})(this);
