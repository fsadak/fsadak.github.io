---
title: "Godot Engine Eğitim Serisi - Bölüm 1: Godot Engine Nedir ve Neden Seçmeliyiz?"
date: 2026-03-12 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, engine, giriş, başlangıç, oyun motoru]
published: true
---

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
