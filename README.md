# Latince Fiil Ekleri

Latince fiillerin zamana ve kişiye göre aldığı **ekleri** öğrenmek için küçük bir web uygulaması. Kurulum yok, internet gerekmez.

## Nasıl açılır

`index.html` dosyasına çift tıkla; tarayıcıda açılır. Telefonda da kullanılabilir (dosyaları telefona kopyalayıp tarayıcıyla açman yeterli).

İlerleme tarayıcının `localStorage`'ında saklanır: aynı tarayıcıda kaldığın yerden devam edersin. Tarayıcı verilerini silersen ilerleme de silinir.

## Neler var

- **Ek tablosu:** Seçilen fiil ve zaman için tablo. Kök, perfectum gövdesi, tema ünlüsü, zaman işareti (-ba-, -bi-, -era- …) ve kişi eki ayrı renklerde; her satırda Türkçe anlam ve ipuçları.
- **Tanıma:** Bir biçim gösterilir (ör. *monēbitis*); zamanı, kişiyi ve sayıyı seçersin. Yanlışsa biçimin her parçasının neyi gösterdiği açıklanır.
- **Yazma:** „regō, Imperfectum, 3. çoğul" → tam biçimi ya da (kök verilip) sadece eki yazarsın. Makron (ā) yazmak zorunlu değil.
- **Karşılaştır:** Aynı kişi için tüm zamanlar yan yana (amō, amābam, amābō, amāvī …).
- **İlerleme:** Hangi zaman × kişi birleşiminde hata yaptığın, en çok zorlandıkların, çekimlere göre başarı. Yanlış yapılanlar alıştırmalarda daha sık sorulur (Leitner kutularıyla basit aralıklı tekrar).

## Aşamalar

1. Etken çatı kişi ekleri (praesens): -ō/-m, -s, -t, -mus, -tis, -nt
2. Praesens, Imperfectum (-ba-), Futurum I (-bō/-bi-/-bu-; 3.-4. çekimde -a-/-e-)
3. Perfectum, Plusquamperfectum (-era-), Futurum II (-er-/-eri-)
4. Edilgen çatı: -r, -ris, -tur, -mur, -minī, -ntur (praesens / imperfectum / futurum)
5. Düzensiz fiiller: sum, possum

Bir aşamada en az 15 doğru cevap verip son 20 cevapta %75 başarıya ulaşınca sonraki aşama açılır. İstersen İlerleme ekranından aşamaları elle de açabilirsin.

Fiiller: 5 çekim (amō, moneō, regō, capiō, audiō) ve her çekimden 4 ek fiil, toplam 25 düzenli fiil + sum, possum.

## Dosyalar

- `index.html`, `style.css`, `app.js` — arayüz
- `data.js` — fiiller, ekler ve çekim motoru
- `test/kontrol.js` — üretilen tabloları elle yazılmış standart tablolarla karşılaştırır (Node.js varsa: `node test/kontrol.js`)

## Kapsam dışı

Edilgen perfectum sistemi (amātus sum …), subiunctivus, imperativus, infinitivus ve participium yok.
