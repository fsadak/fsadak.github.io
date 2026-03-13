---
title: "Godot Engine Eğitim Serisi - Bölüm 1.6: Godot'nun Tasarım Felsefesi: Motor Neden Böyle Çalışıyor?"
date: 2026-03-12 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, düşman, rigidbody2d, path2d, timer]
permalink: /godot-egitim-serisi-bolum-1_6/
published: true
---

Her oyun motoru farklıdır ve farklı ihtiyaçlara hitap eder. Sunulan özellikler kadar, motorun **nasıl tasarlandığı** da son derece önemlidir. Çünkü bu tasarım, iş akışını ve oyunun yapısını şekillendirir. Bu yazıda Godot'nun temel tasarım pillerini inceleyeceğiz — böylece motorun neden böyle çalıştığını anlayacak, kararlarının arkasındaki mantığı göreceksin.

---

## Nesne Yönelimli Tasarım ve Kompozisyon

Godot, esnek sahne sistemi ve Node hiyerarşisiyle **nesne yönelimli tasarımı** özünde benimser. Ancak katı programlama kalıplarından uzak durarak oyun yapını sezgisel biçimde oluşturmana olanak tanır.

### Sahne Kompozisyonu

Godot'da sahneleri **birleştirebilir ya da iç içe geçirebilirsin** — bu, iç içe prefab'lara benzer bir yapıdır:

- Bir `BlinkingLight` (yanıp sönen ışık) sahnesi oluştur
- `BlinkingLight`'ı kullanan bir `BrokenLantern` (kırık fener) sahnesi oluştur
- Sonra bu `BrokenLantern`'larla dolu bir şehir yarat

Şimdi `BlinkingLight`'ın rengini değiştir ve kaydet — şehirdeki tüm `BrokenLantern`'lar anında güncellenir. Tek tek müdahale etmene gerek yok.

![Godot Tasarım Örneği 1](/assets/images/engine_design_01.png)
*Sahneler iç içe geçebilir; bir sahneyi değiştirmek, onu kullanan tüm sahneleri etkiler*

### Sahnelerden Kalıtım (Inheritance)

Godot'da herhangi bir sahneden **kalıtım** da alabilirsin. Bir Godot sahnesi şunlardan herhangi biri olabilir:

- Bir silah
- Bir karakter
- Bir kapı
- Bir seviye ya da seviyenin bir bölümü

Bu yapı, saf kodda bir **sınıf (class)** gibi davranır — ama sahneni editörü kullanarak, sadece kodla ya da ikisini harmanlayarak tasarlama özgürlüğüne sahipsin.

Örneğin `Character` adında bir temel karakter sahnesi oluşturup, ondan kalıtım alarak `Magician` (büyücü) sahnesi yapabilirsin. `Character` sahnesinde bir değişiklik yaptığında, `Magician` da otomatik olarak güncellenir.

![Godot Tasarım Örneği 2](/assets/images/engine_design_02.webp)
*Sahnelerden kalıtım almak, karakterler arasında ortak özellikleri kolayca paylaşmanı sağlar*

### Node'lar Bileşen (Component) Değildir

Bazı motorlarda nesneler bileşenlerden oluşur. Godot'da ise node'lar **birbirinden bağımsız** çalışır. Fizik gövdesinin kullandığı çarpışma şekilleri (collision shapes) gibi bazı istisnalar olsa da, çoğu node birbirinden habersiz şekilde işlev görür.

Örneğin `Sprite2D`, aynı zamanda bir `Node2D`, bir `CanvasItem` ve bir `Node`'dur. Üç üst sınıfının tüm özelliklerini ve yeteneklerini miras alır: dönüşümler (transforms), özel şekil çizimi, özel shader ile render etme gibi.

---

## Her Şey Dahil Paket (All-Inclusive Package)

Godot, en yaygın ihtiyaçları karşılamak için **kendi araçlarını** sunmaya çalışır:

- Kod editörü (scripting workspace)
- Animasyon editörü
- Tilemap editörü
- Shader editörü
- Hata ayıklayıcı ve profilleyici
- Yerel ve uzak cihazlarda **hot-reload** (çalışırken yeniden yükleme)

Bu araçların amacı, oyun geliştirmek için **eksiksiz bir paket** ve kesintisiz bir kullanıcı deneyimi sunmaktır.

Dışarıdan araç kullanmak istersen Godot'nun import eklentisi sistemi buna da izin verir. GDScript dilinin var olmasının da bir sebebi bu: Oyun geliştiricilerinin ve oyun tasarımcılarının ihtiyaçlarına göre tasarlanmış, motorla ve editörle sıkı sıkıya entegre bir dil.

GDScript ile ilgili bazı özellikler:

- **Girinti tabanlı sözdizimi** — Python'a benzer, okunması kolay
- **Tip tespiti** ve statik dil kalitesinde **otomatik tamamlama**
- `Vector` ve `Color` gibi oyun geliştirmeye özel **yerleşik tipler**

> 💡 **Not:** GDExtension ile C, C++, Rust, D, Haxe veya Swift gibi derlenen dillerle yüksek performanslı kod yazabilirsin — motoru yeniden derlemeye gerek yok.

Bir uyarı da ekleyelim: **3D çalışma alanı**, 2D'ye kıyasla daha az yerleşik araca sahip. Karmaşık karakter animasyonları veya arazi düzenleme gibi işler için harici programlara ya da eklentilere ihtiyaç duyabilirsin.

---

## Açık Kaynak (Open Source)

Godot, **MIT lisansı** altında tamamen açık kaynaklı bir kod tabanına sahiptir. Bu şu anlama gelir:

- Kaynak kodunu **ücretsiz indirebilir**, kullanabilir, değiştirebilir ve paylaşabilirsin
- Lisans dosyası korunduğu sürece hiçbir kısıtlama yoktur
- Godot ile birlikte gelen tüm teknolojiler (üçüncü taraf kütüphaneler dahil) bu açık kaynak lisansıyla yasal olarak uyumlu olmak zorundadır

Bu yüzden Godot'nun büyük çoğunluğu topluluk katılımcıları tarafından sıfırdan geliştirilmiştir. Google AdMob veya FMOD gibi özel araçlar motora dahil edilmez; bunlar üçüncü taraf eklentiler olarak kullanılabilir.

Açık kaynak olmanın pratik bir avantajı daha var: **Hata ayıklama kolaylığı.** Godot, hatalar için stack trace (hata izi) ile birlikte mesaj yazdırır — hata motorun kendi içinden bile gelse. Kodun ne yaptığını her zaman takip edebilirsin.

> 💡 **Önemli Not:** MIT lisansı, **yaptığın işi hiçbir şekilde etkilemez.** Motora ya da Godot ile yaptığın şeylere herhangi bir hak iddiası yoktur. Kazandığın para tamamen senindir.

---

## Topluluk Odaklı (Community-Driven)

Godot, topluluğu tarafından, topluluk için ve tüm oyun yapımcıları için geliştirilir. Temel güncellemelere yön veren şey, kullanıcıların ihtiyaçları ve açık tartışmalardır.

Birkaç tam zamanlı çekirdek geliştirici olsa da, projenin binlerce katkıcısı bulunmaktadır. Gönüllü programcılar kendilerinin de ihtiyaç duyduğu özellikleri geliştirdiğinden, her büyük sürümde motorun farklı köşelerinde iyileştirmeler görürsün.

---

## Godot Editörü Bir Godot Oyunudur

Bu belki de Godot'nun en ilginç tasarım kararlarından biridir: **Godot editörünün kendisi, Godot motoruyla çalışır.**

Editör, motorun kendi UI sistemini kullanır. Projeyi test ederken kod ve sahneleri **hot-reload** edebilir, hatta oyun kodunu editör içinde doğrudan çalıştırabilir.

Bu şu anlama gelir: Oyunların için kullandığın kodlar ve sahneler, editörü genişletmek için de kullanılabilir. **`@tool`** annotation'ını herhangi bir GDScript dosyasının başına eklersen, o kod editör içinde çalışır.

Bu sayede şunları yapabilirsin:

- Import ve export eklentileri oluşturmak
- Özel seviye editörleri gibi eklentiler geliştirmek
- Projelerinde kullandığın node'lar ve API ile editör scriptleri yazmak

![RPG in a Box uygulaması](/assets/images/introduction_rpg_in_a_box.webp)
*RPG in a Box, Godot ile yapılmış bir voxel RPG editörüdür — Godot'nun UI araçlarını node tabanlı programlama sistemi için kullanır*

> ℹ️ **Teknik not:** Editörün kendisi C++ ile yazılmıştır ve statik olarak derlenir. Bu yüzden onu `project.godot` dosyası olan normal bir proje gibi içe aktaramazsın.

---

## Ayrı 2D ve 3D Motorları

Godot, ayrı **2D ve 3D render motorları** sunar. 2D sahnelerinin temel birimi **pikseldir**. Motorlar ayrı olsa da şunları yapabilirsin:

- 3D ortamda 2D render etmek
- 2D ortamda 3D render etmek
- 3D dünyanın üzerine 2D sprite ve arayüzler yerleştirmek

![Godot Tasarım Örneği 3](/assets/images/engine_design_03.png)
*2D ve 3D motorlar ayrı ama birlikte kullanılabilir — karışık projeler kolayca mümkün*

Bu ayrımın en büyük avantajı: 2D projelerde gereksiz 3D hesaplama yükü olmaz; her ikisi de kendi alanında optimize çalışır.

---

## Özet: Godot'nun Temel Tasarım Pilleri

| Tasarım Kararı | Ne Anlama Geliyor? |
|---|---|
| **Nesne yönelimli & kompozisyon** | Sahneler iç içe geçebilir, birbirinden kalıtım alabilir |
| **Her şey dahil paket** | Editör, animasyon, shader, debugger — hepsi yerleşik |
| **Açık kaynak (MIT)** | Tamamen ücretsiz, hiçbir kısıtlama yok |
| **Topluluk odaklı** | Kullanıcı ihtiyaçları geliştirme yönünü belirler |
| **Editör = Godot oyunu** | Editörü genişletmek için aynı araçları kullanırsın |
| **Ayrı 2D/3D motorlar** | Her ikisi de kendi alanında optimize |

---

## Sıradaki Adım

Godot'nun neden böyle tasarlandığını artık biliyorsun. Bu temel anlayış, ilerleyen bölümlerde node sistemi, sahne yapısı ve GDScript ile çalışırken pek çok "neden böyle?" sorusuna zaten cevap verecek.

Bir sonraki bölümde Godot'yu kuruyoruz ve ilk projemizi oluşturuyoruz. Hazır ol!

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/godot_design_philosophy.html) esas alınarak Türkçe olarak hazırlanmıştır.*
