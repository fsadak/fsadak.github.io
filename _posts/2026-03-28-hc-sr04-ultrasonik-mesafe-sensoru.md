---
title: "HC-SR04 Ultrasonik Mesafe Sensörü: Basitten Profesyonele Tam Rehber"
date: 2026-03-28 03:00:00 +0300
categories: [Donanım, Sensörler]
description: "HC-SR04 ultrasonik sensörü teknik bilgi, devre güvenliği, verimli ve etkili kullanma rehberi"
tags: [hc-sr04, esp32, arduino, ultrasonik, interrupt, mesafe-sensoru, pulseIn, millis]
---

Bir nesnenin bize ne kadar uzak olduğunu ölçmek istediğimizde, elektroniğin dünyasında en klasik ve en tatmin edici çözümlerden biri HC-SR04 ultrasonik mesafe sensörüdür. Bu yazıda sıfırdan başlayıp adım adım ilerleyeceğiz: önce sensörün nasıl çalıştığını anlayacağız, ilk kodumuzu yazacağız ve ardından kodu gerçek projelerde kullanılabilecek, "profesyonel" seviyeye taşıyacağız.

![HC-SR04](/assets/images/hc-sr04.jpg)
*HC-SR04*

Hedef kitlesi olarak orta ve altı elektronik bilgisine sahip kişileri düşündüm; teknik terimleri kullanacağım ama her birini açıklayarak geçeceğim. Hadi başlayalım.

---

## HC-SR04 Nedir ve Nasıl Çalışır?

### Yarasalardan İlham Alan Bir Teknoloji

Sensörün çalışma prensibi aslında son derece zarif ve doğadan ilham almıştır: **Ekolokasyon**. Yarasalar, karanlıkta uçarken ses dalgaları yayar ve bu dalgaların çevredeki nesnelerden geri dönme süresini hesaplayarak uzaklığı belirler.

HC-SR04 de tam olarak bunu yapar. Sensörün ön yüzüne baktığınızda hoparlör ve mikrofona benzeyen iki adet silindirik parça görürsünüz. Bunlara **ultrasonik dönüştürücü (transducer)** denir.

- **T (Transmitter - Verici):** İnsan kulağının duyamayacağı **40 kHz frekansında** ses dalgası yayar.
- **R (Receiver - Alıcı):** Bu ses dalgasının bir engele çarpıp geri dönmesini (yankısını) dinler.

### Arkasındaki Matematik

Sesin havadaki yayılma hızı yaklaşık **343 m/s** (veya 0,0343 cm/µs) sabittir. Sensör sesi gönderir, ses engele çarpar ve geri döner. Eğer bu yolculuğun toplam süresini ölçersek, mesafeyi şu formülle bulabiliriz:

```
Mesafe = (Süre × Ses Hızı) / 2
```

İkiye bölmemizin sebebi: ses önce ileri gidip engele çarptı, sonra aynı yolu geri döndü. Yani ölçülen süre, aslında mesafenin iki katına karşılık geliyor.

---

## Donanım: Pinler ve ESP32 Bağlantısı

HC-SR04'ün üzerinde 4 adet pin bulunur:

| Pin | Açıklama |
|-----|----------|
| **VCC** | 5V besleme girişi |
| **Trig** | Tetik pini: "Ses dalgasını gönder" komutu |
| **Echo** | Yankı pini: Sesin gidip gelme süresini verir |
| **GND** | Toprak (eksi) pini |

![Devre Şeması](/assets/images/HC-SR04.png)
*Devre Şeması*

### ⚠️ Önemli Uyarı: 5V – 3.3V Uyumsuzluğu

Standart HC-SR04, **5V** ile çalışır ve Echo pininden **5V** sinyal gönderir. Ancak ESP32'nin pinleri **3.3V mantık seviyesindedir**. Bu uyumsuzluğu görmezden gelirseniz, ESP32'nin pinleri hasar görebilir.

Güvenli bağlantı için Echo hattına bir **gerilim bölücü** devre kurmanız gerekir. Bunun için 1kΩ ve 2kΩ'luk iki direnç yeterlidir:

```
HC-SR04 Echo (5V) ---[1kΩ]---|---[2kΩ]--- GND
                             |
                        ESP32 Pin 18 (3.3V)
```

Bağlantı şeması özeti:

| HC-SR04 | ESP32 |
|---------|-------|
| VCC | VIN (5V) |
| GND | GND |
| Trig | GPIO 5 |
| Echo | GPIO 18 (gerilim bölücü üzerinden) |

---

## 1. Aşama: Temel Kod — `pulseIn()` ile Mesafe Ölçümü

İlk adımda en sade ve anlaşılır yöntemi kullanacağız. Arduino ve ESP32 kütüphanesinde hazır gelen `pulseIn()` fonksiyonu, bir pinin belirli bir seviyede kaç mikrosaniye kaldığını ölçer. Sensör için biçilmiş kaftan.

```cpp
// Dosya: hc_sr04_temel.ino

const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);
  // Trig sensörü tetikleyeceğimiz için ÇIKIŞ
  pinMode(trigPin, OUTPUT);
  // Echo yankıyı dinleyeceğimiz için GİRİŞ
  pinMode(echoPin, INPUT);
}

long mesafeHesapla() {
  // 1. Trig pinini temizle, gürültüyü önle
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // 2. 10 mikrosaniye HIGH vererek sensörü tetikle (ses dalgasını gönder)
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // 3. Echo pininin HIGH kalma süresini mikrosaniye cinsinden ölç
  long sure = pulseIn(echoPin, HIGH);

  // 4. Süreyi mesafeye çevir: (süre × ses hızı) / 2
  long mesafe = sure * 0.034 / 2;

  return mesafe;
}

void loop() {
  long olculenMesafe = mesafeHesapla();

  Serial.print("Mesafe: ");
  Serial.print(olculenMesafe);
  Serial.println(" cm");

  delay(1000);
}
```

### Kod Satır Satır Ne Yapıyor?

- **`Serial.begin(115200)`** — Seri portu başlatır. Hesapladığımız mesafeyi bilgisayar ekranında görebilmek için gerekli.
- **`digitalWrite(trigPin, HIGH)` + `delayMicroseconds(10)`** — Sensöre tam anlamıyla "hadi çığlık at" komutu veriyoruz. 10 mikrosaniye yeterli, daha uzun tutmaya gerek yok.
- **`pulseIn(echoPin, HIGH)`** — Echo pininin HIGH olduğu süreyi mikrosaniye cinsinden ölçer. Yani sesin gidip gelmesi için geçen toplam süre.
- **`sure * 0.034 / 2`** — Süreyi (µs) × ses hızı ile (0.034 cm/µs) çarpıp ikiye bölüyoruz.

> 💡 **İpucu — Ölçüm Sınırlarını Bilin:**
> HC-SR04'ün güvenilir çalışma aralığı **2 cm ile 400 cm** arasındadır. 2 cm'nin altında ses dalgası gönderilmeden önce yankı gelebilir (sensör kendini karıştırır), 400 cm'nin üzerinde ise ses yeterince güçlü geri dönemez. Ölçüm kodunuza bu sınırları kontrol eden bir `if` eklemek, saçma değerlerin projenizi bozmasını önler.
> ```cpp
> if (mesafe >= 2 && mesafe <= 400) {
>   // Geçerli ölçüm
> } else {
>   Serial.println("Ölçüm aralığı dışında!");
> }
> ```

### Bu Yöntemin Kör Noktası

`pulseIn()` kullanışlıdır ama bir sorunu var: **bloklayıcıdır.** Eğer sensörün önünde hiçbir engel yoksa ses dalgası uzaya doğru gider ve asla geri dönmez. Bu durumda `pulseIn()`, varsayılan olarak **1 saniye** boyunca yankı beklemeye devam eder ve bu süre boyunca programın geri kalanı tamamen durur.

Basit bir test için gayet yeterli. Ama bir robot kontrolü, Wi-Fi bağlantısı veya ekran güncellemesi gibi işler de yaptırmak istediğinizde bu 1 saniyelik kilitlenme, projenizi rayından çıkarır. Bunu aklınızın bir köşesinde bulundurun; ilerleyen aşamada bu sorunu çözeceğiz.

---

## 2. Aşama: Pratik Uygulama — Park Sensörü

Şimdiye kadar mesafeyi ölçtük ve seri porta yazdırdık. Güzel, ama şunu düşünmüyor musunuz: "Bu gerçek hayatta ne işime yarar?"

O zaman arabanızın park sensörünü taklit edelim. Mesafe azaldıkça bir LED daha hızlı yanıp sönsün. Bu kadar basit, ama bir o kadar tatmin edici.

```cpp
// Dosya: park_sensoru.ino

const int trigPin = 5;
const int echoPin = 18;
const int uyariLed = 2; // ESP32 dahili LED veya harici bir LED

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(uyariLed, OUTPUT);
}

long mesafeHesapla() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long sure = pulseIn(echoPin, HIGH);
  return sure * 0.034 / 2;
}

void loop() {
  long mesafe = mesafeHesapla();

  Serial.print("Mesafe: ");
  Serial.print(mesafe);
  Serial.println(" cm");

  if (mesafe > 0 && mesafe < 10) {
    // Tehlike! Çok yakın — hızlı yanıp sön
    digitalWrite(uyariLed, HIGH);
    delay(100);
    digitalWrite(uyariLed, LOW);
    delay(100);
  } else if (mesafe >= 10 && mesafe < 30) {
    // Dikkat — orta hızda yanıp sön
    digitalWrite(uyariLed, HIGH);
    delay(500);
    digitalWrite(uyariLed, LOW);
    delay(500);
  } else {
    // Güvenli mesafe — LED kapalı
    digitalWrite(uyariLed, LOW);
    delay(1000);
  }
}
```

Bu kod işe yarıyor. Ama fark ettiniz mi: `delay()` hâlâ orada. Park sensörü LED'i yanıp sönerken başka hiçbir şey yapamıyoruz. Bir sonraki aşamada bunu da ortadan kaldıracağız.

---

## 3. Aşama: Profesyonel Yaklaşım — Interrupt (Kesme) ile Asenkron Ölçüm

ESP32, çift çekirdekli, Wi-Fi ve Bluetooth'u aynı anda yönetebilen güçlü bir mikrodenetleyicidir. `pulseIn()` ile onu "Köşede dur, yankı bekle, başka iş yapma" modunda çalıştırmak bu kapasiteye haksızlık olur. Şimdi işin gerçek profesyonel tarafına geçiyoruz.

### Interrupt (Kesme) Nedir?

Şöyle düşünün: Evde kitap okuyorsunuz. Postacının gelip gelmediğini anlamak için her iki saniyede bir kalkmak zorunda olsaydınız, bu hem yorucu hem de verimsiz olurdu. Bunun yerine kapıya bir **zil** takarsınız. Postacı geldiğinde zile basar, siz okuduğunuz sayfaya **ayraç koyar**, kapıyı açar ve dönersiniz.

İşte `Interrupt` (Kesme) tam olarak bu kapı zilidir. İşlemci ana işine (loop döngüsüne) devam eder. Echo pininde bir voltaj değişimi olduğunda donanım işlemciyi "uyarır" ve o an ne yapıyorsa bırakıp bizim yazdığımız **Kesme Fonksiyonunu (ISR - Interrupt Service Routine)** çalıştırır, sonra kaldığı yerden devam eder.

### `volatile` Anahtar Kelimesi Neden Gerekli?

Derleyiciler (kodunuzu makine diline çeviren yazılımlar) bazı optimizasyonlar yapar. Bir değişkenin değeri programın normal akışında değişmiyorsa, derleyici "Bunu tekrar tekrar RAM'den okumak yerine, bir yere not edeyim, daha hızlı olur" der.

Ama bizim sensör değişkenlerimiz, ana kodun haberi **olmadan**, bir kesme sinyali geldiğinde aniden değişiyor. Derleyici bu durumdan habersiz olduğu için ezberden yanlış değer dönebilir.

`volatile` anahtar kelimesi derleyiciye kesin bir emir verir: **"Bu değişkeni asla ezberden okuma. Her seferinde RAM'e gidip gerçek değerine bak."**

### `IRAM_ATTR` Ne İşe Yarar?

ESP32'deki kodlar normalde Flash hafızada tutulur. Flash geniştir ama nispeten yavaştır. Bir kesme sinyali geldiğinde işlemcinin **anında** ilgili fonksiyona atlaması gerekir. Eğer o fonksiyon yavaş Flash'tadaysa ve Flash o an meşgulse, ESP32 fonksiyonu zamanında okuyamaz, kilitlenir veya yeniden başlar.

`IRAM_ATTR` derleyiciye şunu söyler: "Bu fonksiyonu yavaş Flash'a değil, işlemcinin yanı başındaki **ultra hızlı IRAM**'e (Dahili RAM) yükle." Kesme anında sıfır gecikmeyle çalışması için zorunludur.

### `attachInterrupt()` Nasıl Çalışır?

```cpp
attachInterrupt(digitalPinToInterrupt(echoPin), yankiyiYakala, CHANGE);
```

Bu üç parametre şunu ifade eder:

1. **`digitalPinToInterrupt(echoPin)`** — İşlemciler pin numaralarını bizim gibi anlamaz; kendi içlerinde donanımsal **kesme kanalları** vardır. Bu fonksiyon, bizim verdiğimiz pin numarasını o kanala güvenli biçimde eşler. Arduino Uno'da sadece pin 2 ve 3 bu işlevi desteklerken, ESP32'de neredeyse tüm pinler destekler.

2. **`yankiyiYakala`** — Kesme tetiklendiğinde çalıştırılacak fonksiyonun hafızadaki adresidir. Dikkat: `yankiyiYakala()` **değil**, `yankiyiYakala` yazıyoruz. Parantez eklemek "şimdi çalıştır" demek olur; biz sadece "adresini ver" diyoruz.

3. **`CHANGE`** — Kesmenin hangi koşulda tetikleneceğini belirler:
   - `RISING` → Sadece LOW'dan HIGH'a çıkışta
   - `FALLING` → Sadece HIGH'dan LOW'a düşüşte
   - `CHANGE` → Her iki değişimde de (bizim ihtiyacımız bu: hem sesin gidişini hem dönüşünü yakalıyoruz)

---

```cpp
// Dosya: hc_sr04_profesyonel_kesme.ino

const int trigPin = 5;
const int echoPin = 18;
const int uyariLed = 2; // ESP32 dahili LED veya harici bir LED

// Kesme (Interrupt) içinde değişen değişkenlerin başına "volatile" koymalıyız ki 
// işlemci bu değerlerin her an dışarıdan değişebileceğini bilsin.
volatile long baslangicZamani = 0;
volatile long bitisZamani = 0;
volatile boolean yeniOlcumVar = false;

// Kesme Fonksiyonu (ISR - Interrupt Service Routine)
// Echo pininde bir voltaj değişimi olduğunda kod nerede olursa olsun durur ve burası çalışır.
void IRAM_ATTR yankiyiYakala() {
	if (digitalRead(echoPin) == HIGH) {
		// Yankı yeni başladı, o anki mikrosaniyeyi kaydet
		baslangicZamani = micros();
	} else {
		// Yankı bitti (ses geri döndü), bitiş zamanını kaydet ve bayrağı kaldır
		bitisZamani = micros();
		yeniOlcumVar = true;
	}
}

void setup() {
	Serial.begin(115200);
	pinMode(trigPin, OUTPUT);
	pinMode(echoPin, INPUT);
	pinMode(uyariLed, OUTPUT);
	
	// Echo pinini dinlemeye başlıyoruz. CHANGE parametresi pin HIGH veya LOW olduğunda 
	// yankiyiYakala fonksiyonunu tetikler.
	attachInterrupt(digitalPinToInterrupt(echoPin), yankiyiYakala, CHANGE);
}

void tetikleyiciGonder() {
	// Sensöre klasik "ses fırlat" komutunu veriyoruz.
	digitalWrite(trigPin, LOW);
	delayMicroseconds(2);
	digitalWrite(trigPin, HIGH);
	delayMicroseconds(10);
	digitalWrite(trigPin, LOW);
}

void loop() {
	// Sensörü tetikliyoruz ama yankıyı burada BEKLEMİYORUZ!
	tetikleyiciGonder();
	
	// Kesme fonksiyonumuz yankıyı yakaladığında bu bayrak true olacak
	if (yeniOlcumVar) {
		// Geçen süreyi mikrosaniye cinsinden hesaplıyoruz
		long sure = bitisZamani - baslangicZamani;
		long mesafe = sure * 0.034 / 2;
		
		Serial.print("Profesyonel Mesafe: ");
		Serial.print(mesafe);
		Serial.println(" cm");
		
		 if (mesafe > 0 && mesafe < 10) {
			// Tehlike! Çok yakın — hızlı yanıp sön
			digitalWrite(uyariLed, HIGH);
			delay(100);
			digitalWrite(uyariLed, LOW);
			delay(100);
		  } else if (mesafe >= 10 && mesafe < 30) {
			// Dikkat — orta hızda yanıp sön
			digitalWrite(uyariLed, HIGH);
			delay(500);
			digitalWrite(uyariLed, LOW);
			delay(500);
		  } else {
			// Güvenli mesafe — LED kapalı
			digitalWrite(uyariLed, LOW);
			delay(1000);
		  }

		// Bayrağı indiriyoruz ki bir sonraki ölçümü beklesin
		yeniOlcumVar = false;
	}
	
	// Sensöre bir sonraki ölçüm için zaman tanıyoruz.
	delay(100); 
}
```
---

## 4. Aşama: Tam Asenkron Kod — `delay()` de Gidiyor

Artık `pulseIn()`'i interrupt ile değiştirdik ama loop içinde hâlâ bir `delay(100)` var. Şimdi onu da `millis()` ile kaldırıyoruz.

`millis()`, ESP32'nin açılışından itibaren geçen süreyi **milisaniye** cinsinden döndürür. "Üzerinden 100ms geçti mi?" sorusunu sorarak bekleme yapmadan zamanlama yapabiliriz.

```cpp
// Dosya: hc_sr04_tam_asenkron.ino

const int trigPin = 5;
const int echoPin = 18;
const int uyariLed = 2; // ESP32 dahili LED veya harici bir LED

// Kesme içinde değişen değişkenler mutlaka 'volatile' olmalı
volatile unsigned long baslangicZamani = 0;
volatile unsigned long bitisZamani     = 0;
volatile boolean yeniOlcumVar          = false;

// millis() ile zamanlama için
unsigned long sonOlcumZamani = 0;
const int olcumAraligi = 100; // Her 100ms'de bir ölçüm yap

// ──────────────────────────────────────────────
// Kesme Fonksiyonu (ISR)
// Echo pininde voltaj değişimi olduğunda çalışır
// IRAM_ATTR: Fonksiyonu hızlı IRAM'e yükle
// ──────────────────────────────────────────────
void IRAM_ATTR yankiyiYakala() {
  if (digitalRead(echoPin) == HIGH) {
    // Ses dalgası yeni gönderildi, zamanı kaydet
    baslangicZamani = micros();
  } else {
    // Ses geri döndü, bitiş zamanını kaydet ve bayrak kaldır
    bitisZamani   = micros();
    yeniOlcumVar  = true;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(uyariLed, OUTPUT);

  // Echo pinini dinlemeye al; değişimde yankiyiYakala çağrılsın
  attachInterrupt(digitalPinToInterrupt(echoPin), yankiyiYakala, CHANGE);
}

void tetikleyiciGonder() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
}

void loop() {
	// LED'in asenkron yanıp sönmesi için gereken hafıza değişkenleri
	static unsigned long sonLedZamani = 0;
	static int ledDurumu = LOW;
	static long guncelMesafe = 100; // Başlangıçta güvenli bir mesafe varsayıyoruz
	
	unsigned long suAn = millis();
	
	// ── 1. KISIM: ZAMAN KONTROLÜ (Tetikleme) ──────────────────
	if (suAn - sonOlcumZamani >= olcumAraligi) {
		tetikleyiciGonder();
		sonOlcumZamani = suAn; // Sayacı sıfırla
	}
	
	// ── 2. KISIM: YANKI GELDİ Mİ? ─────────────────
	if (yeniOlcumVar) {
		unsigned long sure = bitisZamani - baslangicZamani;
		guncelMesafe = sure * 0.034 / 2; // Mesafeyi aklımızda tutuyoruz
		
		Serial.print("Mesafe: ");
		Serial.print(guncelMesafe);
		Serial.println(" cm");
		
		yeniOlcumVar = false; // Bayrağı indir, yeni ölçümü bekle
	}
	
	// ── 3. KISIM: ASENKRON LED KONTROLÜ (Sıfır Delay!) ────────────
	int yanipSonmeHizi = 1000; // Varsayılan değer
	
	if (guncelMesafe > 0 && guncelMesafe < 10) {
		yanipSonmeHizi = 100; // Tehlike! Çok hızlı
	} else if (guncelMesafe >= 10 && guncelMesafe < 30) {
		yanipSonmeHizi = 500; // Dikkat! Orta hız
	}
	
	if (guncelMesafe >= 30) {
		// Güvenli mesafedeysek LED'i tamamen kapalı tut
		digitalWrite(uyariLed, LOW);
		ledDurumu = LOW;
	} else {
		// Güvenli mesafede değilsek, belirlenen hıza göre delay kullanmadan yanıp sön
		if (suAn - sonLedZamani >= yanipSonmeHizi) {
			sonLedZamani = suAn;
			ledDurumu = (ledDurumu == LOW) ? HIGH : LOW; // Durumu tersine çevir
			digitalWrite(uyariLed, ledDurumu);
		}
	}
	
	// İşte ŞİMDİ loop içinde gerçekten hiçbir delay() yok!
	// Wi-Fi, ekran veya başka işlemler burada sıfır takılmayla çalışabilir.
}
```

## LED Uyarı Sistemi Nasıl Çalışıyor? (Sıfır Bekleme Mantığı)

Park sensörümüzün görsel uyarı kısmı iki temel aşamadan oluşuyor: Tehlike seviyesini belirlemek ve sistemi kilitlemeden LED'i yakıp söndürmek.

1.	Tehlike Seviyesinin Belirlenmesi:
	Tıpkı gerçek bir araç park sensöründe olduğu gibi, cisme olan uzaklığımıza göre farklı tepkiler veriyoruz. Kodumuzdaki if-else blokları tam olarak bu kararı alıyor:

	Mesafe 10 cm'den küçükse: Çarpma tehlikesi! Durum acil olduğu için yanipSonmeHizi değişkenimizi 100 (milisaniye) olarak ayarlıyoruz.

	Mesafe 10 ile 30 cm arasındaysa: Cisme yaklaşıyoruz. yanipSonmeHizi değişkenimizi 500 (milisaniye) yaparak orta hızda bir uyarı veriyoruz.

	Mesafe 30 cm'den büyükse: Güvenli bölgedeyiz. LED'in tamamen kapalı kalmasını sağlıyoruz.

2.	Asenkron (Kilitlenmeyen) Yanıp Sönme Mantığı:
	Bu projenin en profesyonel noktası burasıdır. Klasik delay() komutunu kullansaydık, LED 500 milisaniye yanık kalırken ESP32 başka hiçbir iş (örneğin Wi-Fi iletişimi veya yeni bir sensör ölçümü) yapamazdı. Bunun yerine ESP32'nin iç saati olan millis() fonksiyonunu kullandık.

	Bunu bir kronometre tutmak gibi düşünebilirsiniz:

	sonLedZamani değişkeni ile LED'in durumunu en son ne zaman değiştirdiğimizi aklımızda tutuyoruz.

	suAn - sonLedZamani >= yanipSonmeHizi satırı ile sürekli saate bakıyoruz. "Şu anki zamandan, en son işlem yaptığım zamanı çıkardığımda, hedeflediğim bekleme süresine ulaştım mı?" sorusunu soruyoruz.

	Eğer süre dolmuşsa, sihirli satırımız devreye giriyor: ledDurumu = (ledDurumu == LOW) ? HIGH : LOW;
	Bu kısa kod satırı aslında bir "eğer/değilse" sorgusudur. Sisteme şunu söyler: "Eğer LED şu an sönükse (LOW), onu yak (HIGH). Eğer zaten yanıksa, onu söndür (LOW)." Bu sayede LED'imiz kendi halinde sürekli durum değiştirirken, ana loop döngümüz hiçbir engele takılmadan ışık hızında akmaya devam eder.
---

## Özet: Üç Aşamada Ne Kazandık?

| Yöntem | Blokluyor mu? | Ne zaman kullanın? |
|--------|:-------------:|-------------------|
| `pulseIn()` | ✅ Evet (1s'ye kadar) | Hızlı prototipleme, tek görevli projeler |
| Interrupt + `delay()` | Kısmen | Öğrenme amaçlı geçiş kodu |
| Interrupt + `millis()` | ❌ Hayır | Gerçek projeler, çok görevli sistemler |

---

## Sonuç

HC-SR04 ilk bakışta sade bir sensör gibi görünse de arkasındaki kavramlar — kesme mekanizması, bellek yönetimi, asenkron zamanlama — mikroelektroniğin temel taşlarıdır. Bu sensörü anlamak, ilerleyen projelerde çok daha karmaşık sistemleri kurarken size sağlam bir temel sağlayacaktır.

Bir sonraki yazıda başka bir sensörle devam edeceğiz. Sorularınız veya denemek istediğiniz farklı senaryolar varsa yorumlarda buluşalım.

Görüşmek üzere. 🎛️
