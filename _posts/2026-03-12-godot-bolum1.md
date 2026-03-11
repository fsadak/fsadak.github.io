---
title: "Godot Engine Eğitim Serisi - Bölüm 1: Godot Engine Nedir ve Neden Seçmeliyiz?"
date: 2026-03-12 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, engine, giriş, başlangıç, oyun motoru]
permalink: /godot-egitim-serisi-bolum-1/
published: true
---

# Godot Nedir? Oyun Motoruna İlk Bakış

Oyun geliştirmeye ilgi duyan ama nereden başlayacağını bilemeyen biri misin? Ya da "Bu benim için uygun mu?" diye kendini sorgulayan? O zaman bu yazı tam sana göre. Godot Engine'i tanıyacak; ne olduğunu, ne yapabildiğini ve öğrenmek için ne bilmen gerektiğini birlikte keşfedeceğiz.

---

## Godot Nedir?

Godot, hem 2D hem de 3D oyun geliştirmek için tasarlanmış, genel amaçlı bir oyun motorudur. Bu motorla geliştirdiğin oyunları ya da uygulamaları masaüstü, mobil ve web platformlarında yayınlayabilirsin. Konsol desteği de mevcut, ancak bunun için ya güçlü bir programlama alt yapısı ya da oyununu porta edecek deneyimli bir geliştirici gerekiyor.

> 💡 Konsollar hakkında daha fazla bilgi için [Godot'nun resmi web sitesini](https://godotengine.org) inceleyebilirsin.

---

## Godot ile Neler Yapıldı?

Godot, ilk olarak 2001 yılında Arjantinli bir oyun stüdyosu tarafından iç kullanım için geliştirildi. 2014'te açık kaynak olarak yayınlandıktan bu yana sürekli yeniden yazılıp geliştirildi.

Bu motorla geliştirilmiş oyunlara ve uygulamalara birkaç örnek:

- 🎮 **Cassette Beasts** — yaratıkları kasetlere dönüştürdüğün RPG
- 🎮 **PVKK: Planetenverteidigungskanonenkommandant** — top-down savaş oyunu
- 🎮 **Usagi Shima** — tavşan adası simülasyonu
- 🖼️ **Pixelorama** — açık kaynaklı piksel sanat çizim programı
- 🗺️ **RPG in a Box** — voxel RPG oluşturma aracı

Daha fazlasını görmek istersen Godot'nun resmi [Showcase sayfasına](https://godotengine.org/showcase/) göz atabilirsin.

![Usagi Shima oyununun ekran görüntüsü](/assets/images/introduction_usagi_shima.webp)
*Godot ile geliştirilmiş oyunlardan biri: Usagi Shima*

![Cassette Beasts oyununun ekran görüntüsü](/assets/images/introduction_cassette_beasts.webp)
*Cassette Beasts — Godot ile geliştirilmiş popüler bir RPG*

![PVKK oyununun ekran görüntüsü](/assets/images/introduction_pvkk.webp)
*PVKK: Planetenverteidigungskanonenkommandant*

![RPG in a Box uygulamasının ekran görüntüsü](/assets/images/introduction_rpg_in_a_box.webp)
*RPG in a Box — Godot ile yazılmış bir uygulama örneği*

---

## Editör Nasıl Görünüyor?

Godot, içinde her şeyin bulunduğu tam donanımlı bir oyun editörüyle birlikte geliyor. Bu editörde şunlar yerleşik olarak mevcut:

- Kod editörü
- Animasyon editörü
- Tilemap editörü
- Shader editörü
- Hata ayıklayıcı (debugger)
- Performans profilleyici (profiler)

Ekip, tutarlı ve kullanımı kolay bir arayüz sunmayı hedefliyor. Editör her geçen sürümle daha da gelişiyor.

![Godot Editörünün genel görünümü](/assets/images/introduction_editor.webp)
*Godot editörü — kod, animasyon, sahne ve daha fazlası tek çatı altında*

Tabii ki harici araçlarla çalışmayı tercih edersen bu da mümkün. Godot resmi olarak şunları destekliyor:

- **Blender** ile tasarlanmış 3D sahnelerin içe aktarılması
- **VSCode** ve **Emacs** ile GDScript ve C# yazmak için eklentiler
- **Visual Studio** ile Windows üzerinde C# geliştirme

![VSCode ile Godot entegrasyonu](/assets/images/introduction_vscode.png)
*VSCode üzerinden Godot ile kod yazabilirsin*

---

## Programlama Dilleri

### GDScript

Godot'ya özgü, Python'a benzer sözdizimiyle hafif ve öğrenmesi kolay bir dildir. Godot ile sıkı sıkıya entegre olduğu için performanslı çalışır. Oyun geliştirmeye yeni başlayanlar için önerilen ilk seçenektir.

```gdscript
extends CharacterBody2D

const SPEED = 200.0

func _physics_process(delta):
    var direction = Input.get_axis("ui_left", "ui_right")
    velocity.x = direction * SPEED
    move_and_slide()
```

### C#

Oyun sektöründe yaygın olarak kullanılan, daha büyük projelere uygun bir dildir. Daha önce Unity gibi bir motor kullandıysan C# sana tanıdık gelecektir.

### GDExtension

C++ ya da diğer dillerle yüksek performanslı algoritmalar veya oyun mekanikleri yazmanı sağlar. Üstelik motoru yeniden derlemeye gerek yoktur. Üçüncü taraf kütüphaneleri ve SDK'ları Godot'ya entegre etmek için de kullanılabilir.

---

## Godot Öğrenmek İçin Ne Bilmem Gerekiyor?

Godot çok sayıda özelliğe sahip zengin bir motordur. Bu özelliklerden en iyi şekilde yararlanmak için temel programlama bilgisi büyük avantaj sağlar. Özellikle şu kavramlara aşina olmak süreci hızlandırır:

- **Nesne yönelimli programlama (OOP):** Godot bu paradigmaya dayanır. Sınıflar ve nesneler hakkında bilgi sahibi olmak, kodu verimli yazmanı kolaylaştırır.

Eğer programlamaya hiç giriş yapmadıysan, paniklemene gerek yok. **GDQuest**'in hazırladığı [Learn GDScript From Zero](https://gdquest.itch.io/learn-gdscript-from-zero) adlı eğitim serisi, sıfırdan başlayanlar için tamamen ücretsiz ve açık kaynaklı bir kaynaktır. Hem masaüstü uygulaması hem de tarayıcı üzerinden erişilebilir.

---

## Özet

| Özellik | Godot |
|---|---|
| Fiyat | Tamamen ücretsiz |
| Lisans | MIT (ticari kullanım serbestir) |
| 2D Desteği | ✅ Mükemmel, kendine özgü motor |
| 3D Desteği | ✅ Güçlü ve gelişmeye devam ediyor |
| Script Dili | GDScript, C#, GDExtension (C++) |
| Platform Desteği | Masaüstü, Mobil, Web, Konsol |
| Editör | Yerleşik, tam donanımlı |
| Topluluk | Aktif ve büyüyen |

---

## Sıradaki Adım

Bu yazıda Godot'nun ne olduğuna, hangi projelerde kullanılabileceğine ve nasıl çalıştığına genel bir bakış attık. Serinin ilerleyen bölümlerinde Godot'nun temel kavramlarını — sahne, node, sinyal sistemi gibi konuları — adım adım ele alacağız.

Hazırsan devam edelim! 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/introduction_to_godot.html) esas alınarak Türkçe olarak hazırlanmıştır.*

Herkese merhaba! Sıfırdan başlayarak profesyonel düzeyde oyunlar geliştirmeyi öğreneceğimiz Godot Engine eğitim serimizin ilk bölümüne hoş geldiniz. Bu yazıda ve eşlik eden videomuzda, Godot’un ne olduğuna, neler yapabildiğine ve neden son yılların en çok konuşulan oyun motoru haline geldiğine yakından bakacağız.

Tüm bu içeriklerde kaynak olarak Godot (Godo diye okunur) resmi dökümanları kullanılmış ve oradaki akışa sadık kalınmıştır. Amacım Godot hakkında hem yazılı (blog) hem de görsel (Youtube) Türkçe içerik oluşturmaktır. Her bölümün sonunda o bölüme ait Youtube bağlantısını bulacaksınız.

Dilerseniz lafı uzatmadan ilk bölüme başlayalım.

### Godot Engine Nedir?

Godot; masaüstü, mobil, web ve konsollar için her türlü projeyi desteklemek üzere tasarlanmış genel amaçlı bir 2D ve 3D oyun motorudur. 2014 yılında açık kaynak olarak yayınlanmasından bu yana muazzam bir gelişim gösteren motor, tamamen ücretsizdir ve sizden asla bir telif veya abonelik ücreti talep etmez.

### Godot ile Neler Yapılabilir?

Godot’yu sadece basit prototipler yapmak için kullanılan bir araç sanıyorsanız yanılıyorsunuz. Gelişmiş özellikleri sayesinde yüksek kaliteli bağımsız oyunlardan tutun da profesyonel masaüstü uygulamalarına kadar birçok alanda kullanılmaktadır.

İşte Godot ile geliştirilmiş bazı harika örnekler:

- RPG severlerin favorilerinden hit oyun **Cassette Beasts**
- Sevimli atmosferiyle büyüleyen **Usagi Shima**
- Yine Godot ile yapılmış bir piksel art programı olan **Pixelorama** ve oyun yapma aracı **RPG in a Box**

![Godot ile geliştirilen Usagi Shima oyunu.](https://blogger.googleusercontent.com/img/a/AVvXsEi_GrqQFBxVCbHPL9ZOP9FJxuVNV62EI9CPtKlz7zvb58SgN7xlI8MOENz7_ybfqXbeRaWv4yh9HLkGmrOLBIrSb84Avj4WwUH2K7SLMFugqDy_P4nLldbJeFPSB1EwdgFmgiMRiu20Lf4ZWpWSrDuXIgki3-QqGuggejBTiLhJ0KRiLhSgAEe6C0TVsg)

*Godot ile geliştirilen Usagi Shima oyunu.*

![Cassette Beasts oyunundan bir kare.](https://blogger.googleusercontent.com/img/a/AVvXsEhaU3nNkozT9D_EUFxBP4qkHtVZAghzoY0-6HpbcEeVaRcre3CVNrgu2TmnroV7wKeZpPXJCHI_J7UzVEpsnnyAbrCO2bimypg3Xg35Bg3fuQBgrYsSS_fHWcDbZEf2NbiYMBKPCx-s1N5HXsVsURDyApjKNO3ctPoMQzlv9CO6htfVdFp76fGTzJtTTg)

*Cassette Beasts oyunundan bir kare.*

### Hepsi Bir Arada, Kullanışlı Bir Editör

Godot’u indirdiğinizde karşınıza her şeyi kendi içinde barındıran tam donanımlı bir editör çıkar.

![Godot Engine genel çalışma alanı.](https://blogger.googleusercontent.com/img/a/AVvXsEjZp7qDLMv-fohVPdQ1DYTz0XbJtbBdn42QOCoZDtKJtQMhaFOERw3XlwlEshg3Lnd7kiUUfiZpCIm-_ifdIMihty_kjBp03z6ag1wnj1lpes11GR7dDDVvSi818Svmsg6VHoVVW0BjRKbI3DIgXyYN0k2ogqAK5iLQpwn6S_tIeFtndoQJrBrt41OrhQ=w640-h340)

*Godot Engine genel çalışma alanı.*

Kod editörü, animasyon oluşturucu, harita (tilemap) editörü, shader editörü ve hata ayıklayıcı (debugger)… Hepsi tek bir uygulamadadır. Arayüzü karmaşadan uzak, oldukça tutarlı ve hızlı çalışacak şekilde tasarlanmıştır.

Tabii ki Godot sizi sadece kendi araçlarına mahkum etmez. Dışarıdan 3D tasarımlarınız için **Blender** ile kusursuz çalışırken; kodlama tarafında **VSCode**, **Emacs** veya **Visual Studio** gibi popüler kod editörlerini rahatlıkla bağlayıp kullanabilirsiniz.

### Hangi Programlama Dillerini Destekler?

Kodlama becerileriniz veya hedefleriniz ne olursa olsun, Godot size uyan bir çözüm sunar:

1. **GDScript:** Godot’un kendisine özel, Python’a çok benzeyen dilidir. Motora sıkı sıkıya entegre olduğu için oyun geliştirmeyi inanılmaz derecede hızlandırır. Biz de eğitim serimiz boyunca GDScript kullanacağız.
2. **C#:** Oyun endüstrisinde standart kabul edilen C# dilini resmi olarak ve güçlü bir şekilde destekler. Eğer Unity gibi motorlardan geliyorsanız, hiç yabancılık çekmeyeceksiniz.
3. **C++ ve GDExtension:** Performansın sınırlarını zorlamanız gereken ağır algoritmalarınız mı var? GDExtension teknolojisi sayesinde motoru yeniden derlemeye bile gerek kalmadan C++, Rust gibi dillerle eklentiler yazabilirsiniz.

### Başlamak İçin Ne Bilmelisiniz?

Godot’un özellikleri saymakla bitmez, binlerce araç ve fonksiyon barındırır. Bu yüzden güçlü bir temelle başlamak çok önemlidir.

Godot, “Nesne Yönelimli Programlama” (Object-Oriented Programming) mantığını benimser. Yani `Sınıflar (Class)` ve `Nesneler (Objects)` üzerine kuruludur. Temel bir kodlama mantığına sahip olmak size büyük hız kazandırır. Ancak hiç korkmayın; bu seriyi hazırlarken sıfırdan başlayanları da düşünerek her adımı mantığıyla anlatacağım.

Bir sonraki bölümde, Godot’yu diğer motorlardan ayıran, motorun kalbi olan eşsiz “Sahneler (Scenes) ve Düğümler (Nodes)” mantığını ve mimarisini keşfedeceğiz. Kendinize iyi bakın, kodlamaya hazır olun!
