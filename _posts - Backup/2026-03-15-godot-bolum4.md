---
title: "Godot Engine Eğitim Serisi - Bölüm 4: Godot'da Script Dilleri: GDScript, C# ve C++"
date: 2026-03-15 12:00:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, enemies, collision, spawning]
permalink: /godot-egitim-serisi-bolum-4/
published: true
---

Godot'da oyun mantığını kodlamak için birden fazla dil seçeneğin var. Bu bölümde mevcut script dillerine genel bir bakış atacak, her birinin avantajlarını ve dezavantajlarını inceleyeceğiz. Böylece projen için en doğru seçimi yapabilirsin.

---

## Script Nedir? Node'a Nasıl Bağlanır?

Script'ler, bir node'a eklenen ve o node'un davranışını genişleten kod dosyalarıdır. Bu şu anlama gelir: **bir script, bağlandığı node'un tüm fonksiyonlarını ve özelliklerini miras alır.**

Somut bir örnek düşünelim: Oyuncunun gemisini takip eden bir `Camera2D` node'un var. `Camera2D`, varsayılan olarak üst node'unu takip eder. Şimdi oyuncu hasar aldığında kameranın sallanmasını (camera shake) istiyorsun. Bu özellik Godot'ya yerleşik olarak gelmez.

Çözüm: `Camera2D` node'una bir script ekleyip sallama davranışını kodlamak.

![Kamera Sallama Efekti](/assets/images/scripting_camera_shake.gif)
*Script ile Camera2D node'una eklenen kamera sallama efekti — Godot'da olmayan bir özelliği kendin ekleyebilirsin*

---

## Mevcut Script Dilleri

Godot dört resmi oyun programlama dili sunar:

- **GDScript**
- **C#** (.NET)
- **C** ve **C++** (GDExtension aracılığıyla)

Bunların yanında topluluk tarafından desteklenen diller de mevcut, ama resmi destek bu dörde ait.

### Tek Projede Birden Fazla Dil Kullanabilirsin

Godot, tek bir projede birden fazla dil kullanmanı destekler. Örneğin:

- Hızlı yazılması gereken oyun mantığı için **GDScript**
- Karmaşık algoritmalar ve maksimum performans için **C#** veya **C++**

Ya da her şeyi GDScript veya C# ile yazabilirsin. Karar tamamen sana ait.

---

## Hangi Dili Seçmeliyim?

**Yeni başlıyorsan: GDScript ile başla.**

GDScript, Godot ve oyun geliştiricilerinin ihtiyaçları için özel olarak tasarlandı. Hafif ve sade sözdizimi, Godot ile en sıkı entegrasyonu sunuyor.

C# için VSCode veya Visual Studio gibi harici bir kod editörüne ihtiyaç duyulur. C# desteği artık olgunlaşmış olsa da GDScript'e kıyasla öğrenme kaynakları daha az. Bu yüzden **C# öncelikli olarak dili zaten bilen kullanıcılara önerilir.**

---

## GDScript

GDScript, Godot için özel olarak geliştirilmiş nesne yönelimli ve zorunlu (imperative) bir programlama dilidir.

![GDScript Editörü](/assets/images/scripting_gdscript.webp)
*Godot'nun yerleşik script editöründe GDScript kodu*

### Öne Çıkan Özellikleri

- **Sade sözdizimi** — kısa ve okunaklı dosyalar
- **Yıldırım hızında derleme ve yükleme**
- **Sıkı editör entegrasyonu** — node'lar, sinyaller ve sahne bağlamına göre kod tamamlama
- **Yerleşik vektör ve dönüşüm tipleri** — oyunlarda kritik olan lineer cebir işlemleri için optimize edilmiş
- **Çoklu thread desteği** — statik tipli diller kadar verimli
- **Çöp toplayıcı (garbage collector) yok** — motor referansları sayarak belleği yönetir; gerektiğinde manuel kontrol de mümkün
- **Kademeli tipleme (gradual typing)** — değişkenler varsayılan olarak dinamik tipli, ama güçlü tip kontrolü için tip ipuçları (type hints) eklenebilir

GDScript, kod bloklarını girintilerle yapılandırması açısından Python'a benzer görünür; ama pratikte farklı çalışır. Squirrel, Lua ve Python gibi dillerden ilham almıştır.

> 💡 **"Neden doğrudan Python veya Lua kullanmıyoruz?"**
> Godot, yıllar önce önce Python sonra Lua kullandı. Her ikisinin entegrasyonu büyük çaba gerektirdi ve ciddi kısıtlamalar yarattı — örneğin Python'da thread desteği büyük bir sorundu. Özel bir dil geliştirmek daha az iş yükü getiriyor ve oyun geliştiricilerinin ihtiyaçlarına tam uyum sağlıyor.

---

## C# (.NET)

C#, oyun geliştiricileri arasında popüler bir dil olduğundan Godot tarafından resmi olarak destekleniyor. Microsoft'un cömert bir bağışı sayesinde bu destek mümkün oldu.

![C# Editörü](/assets/images/scripting_csharp.png)
*Godot'da C# ile kod yazımı — harici bir editör gerektirir*

### Özellikler

- **Olgun ve esnek** bir dil — yazılmış tonlarca kütüphane mevcut
- **Performans ve kullanım kolaylığı** arasında iyi bir denge
- **.NET 8** desteği — teorik olarak herhangi bir üçüncü taraf .NET kütüphanesi ya da F#, Boo, ClojureCLR gibi CIL uyumlu diller kullanılabilir
- Ancak resmi olarak desteklenen tek .NET seçeneği **C#**'tır

### Dikkat Edilmesi Gerekenler

- C# için **Godot'nun .NET sürümünü** indirmen gerekiyor (standart sürümde C# desteği yok)
- **Çöp toplayıcı (garbage collector)** var — oyun geliştirmede dikkatli olunması gereken bir nokta
- Godot 4 ile C# ile yazılmış projeler şu an için **web platformuna export edilemiyor**
- Android ve iOS desteği Godot 4.2 itibarıyla mevcut, ancak deneysel aşamada

> ℹ️ **Not:** GDScript kodu, derlenmiş C# veya C++ kadar hızlı çalışmaz. Ancak script kodu genellikle Godot'nun C++ içinde yazılmış hızlı fonksiyonlarını çağırır. Pek çok durumda GDScript, C# veya C++ ile yazılmış oyun mantığı arasında performans farkı önemsiz kalır.

---

## C++ (GDExtension)

GDExtension, Godot'yu yeniden derlemeden oyun kodunu C++ ile yazmanı sağlar.

![C++ GDExtension](/assets/images/scripting_cpp.png)
*GDExtension ile C++ kodu Godot'ya dahil edilebilir*

### Özellikler

- **En yüksek performans** seçeneği
- Dahili C API Bridge sayesinde farklı derleyici sürümleri ve markalarıyla oluşturulan paylaşımlı kütüphaneler (shared libraries) kullanılabilir
- GDExtension ile çalışırken kullanabileceğin tipler, fonksiyonlar ve özellikler Godot'nun asıl C++ API'sine yakından benziyor

Tüm oyunu C++ ile yazmak zorunda değilsin. Yoğun hesaplama gerektiren bölümleri C++ ile yazıp geri kalanı GDScript veya C# ile geliştirebilirsin.

---

## Karşılaştırma Tablosu

| Özellik | GDScript | C# | C++ (GDExtension) |
|---|---|---|---|
| Öğrenme kolaylığı | ✅ Çok kolay | 🟡 Orta | ❌ Zor |
| Performans | 🟡 İyi | ✅ Yüksek | ✅ En yüksek |
| Editör entegrasyonu | ✅ Mükemmel | 🟡 İyi | 🟡 Orta |
| Web export | ✅ Var | ❌ Yok (Godot 4) | 🟡 Sınırlı |
| Harici editor gerekir mi? | ❌ Hayır | ✅ Evet | ✅ Evet |
| Yeni başlayanlar için | ✅ Önerilir | 🟡 Deneyimlilere | ❌ İleri seviye |

---

## Özet

- Script'ler node'lara eklenir ve o node'un davranışını genişletir
- **Yeni başlayanlar için GDScript** en iyi seçim — sade, hızlı ve Godot ile tam entegre
- **C#** daha önce bu dili kullananlar için iyi bir seçenek — ama .NET Godot sürümü gerektirir
- **C++/GDExtension** maksimum performans gereken durumlar için — ileri seviye kullanım
- Tek projede birden fazla dil kullanılabilir

---

## Sıradaki Adım

Dil tercihimizi yaptık: **GDScript**. Bir sonraki bölümde ilk script'imizi yazacak ve bir node'a nasıl davranış kazandırılacağını adım adım göreceğiz. 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/scripting_languages.html) esas alınarak Türkçe olarak hazırlanmıştır.*
