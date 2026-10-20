# Latince Fiil Ekleri

Latince fiillerin zamana ve kişiye göre aldığı **ekleri** öğrenmek için küçük bir web uygulaması. Kurulum yok, internet gerekmez.

## Nasıl açılır

`index.html` dosyasına çift tıkla; tarayıcıda açılır. Telefonda da kullanılabilir (dosyaları telefona kopyalayıp tarayıcıyla açman yeterli).

İlerleme tarayıcının `localStorage`'ında saklanır: aynı tarayıcıda kaldığın yerden devam edersin. Tarayıcı verilerini silersen ilerleme de silinir. Eski sürümün kaydı ilk açılışta otomatik olarak yeni biçime taşınır.

## Neler var

- **Ek tablosu:** Seçilen fiil ve zaman için tablo. Kök, perfectum gövdesi, participium gövdesi, tema ünlüsü, zaman işareti (-ba-, -bi-, -era- …), kişi eki, sıfat eki (-us/-ī) ve yardımcı fiil (sum) ayrı renklerde; her satırda Türkçe anlam ve ipuçları.
- **Tanıma:** Bir biçim gösterilir (ör. *monēbitis*); zamanı, kişiyi ve sayıyı seçersin. Yanlışsa biçimin her parçasının neyi gösterdiği açıklanır.
  - **Metin modu** („Makronları gizle"): gerçek metinlerdeki gibi makronsuz gösterir. Makronsuz yazılınca birden çok anlama gelebilen biçimlerde (ör. *regeris*: praesens edilgen ya da futurum edilgen 2. tekil) geçerli çözümlemelerden herhangi biri doğru sayılır, diğerleri de gösterilir.
- **Yazma:** „regō, Imperfectum, 3. çoğul" → tam biçimi ya da (kök verilip) sadece eki yazarsın. Makron (ā) yazmak zorunlu değil; iki kelimelik biçimlerde (amātus sum) boşluk önemsiz.
- **Karşılaştır:** Aynı kişi için tüm zamanlar yan yana (amō, amābam, amābō, amāvī …, amātus sum).
- **İlerleme:** Hangi zaman × kişi birleşiminde hata yaptığın (çekime göre filtrelenebilir), en çok zorlandıkların, çekimlere göre başarı. Tanıma ve yazma ekranlarında „Bu oturum: x/y doğru" sayacı.

### Aralıklı tekrar

Her **zaman × kişi × çekim** birleşimi bir karttır (ör. „futurum I, 3. tekil, 3. çekim"). Önce kart seçilir, sonra o çekimden rastgele bir fiil. Yanlış cevaplanan kart en düşük kutuya düşer ve çok daha sık sorulur; doğru cevaplandıkça seyrekleşir. Böylece 3. çekim futurumunda zorlanan biri 1. çekim sorularıyla „kurtarılmaz".

## Aşamalar

1. Etken çatı kişi ekleri (praesens): -ō/-m, -s, -t, -mus, -tis, -nt
2. Praesens, Imperfectum (-ba-), Futurum I (-bō/-bi-/-bu-; 3.-4. çekimde -a-/-e-)
3. Perfectum, Plusquamperfectum (-era-), Futurum II (-er-/-eri-)
4. Edilgen çatı: -r, -ris, -tur, -mur, -minī, -ntur (praesens / imperfectum / futurum)
5. Düzensiz fiiller: sum, possum
6. Edilgen perfectum sistemi: participium + sum (amātus sum, amātus eram, amātus erō)

Bir aşamada en az 15 doğru cevap verip son 20 cevapta %75 başarıya ulaşınca sonraki aşama açılır. İstersen İlerleme ekranından aşamaları elle de açabilirsin.

Fiiller: 5 çekim (amō, moneō, regō, capiō, audiō) ve her çekimden 4 ek fiil, toplam 25 düzenli fiil + sum, possum. Her fiil için şimdiki zaman kökü, perfectum gövdesi ve participium (PPP) gövdesi gösterilir.

## Dosyalar

- `index.html`, `style.css`, `app.js` — arayüz
- `data.js` — fiiller, ekler ve çekim motoru
- `test/kontrol.js` — üretilen tabloları elle yazılmış standart tablolarla karşılaştırır (Node.js varsa: `node test/kontrol.js`)

## Kapsam dışı

- Subiunctivus (dilek kipi), imperativus (emir), infinitivus (mastar), participium ve gerundium çekimleri
- Edilgen perfectumda dişil / nötr biçimler tabloda yok (yalnız eril -us/-ī; ipuçlarında anlatılıyor)
- possum ve sum dışındaki düzensiz fiiller (eō, ferō, volō, fīō …) ve deponens fiiller
- Perfectum'un -ēre gibi kısa 3. çoğul biçimi (amāvēre) ve -v- düşmesiyle kısalmış biçimler (amāstī, audiit)
