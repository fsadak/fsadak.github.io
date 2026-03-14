---
title: "Godot Engine Eğitim Serisi - Bölüm 4: GDScript ile Oyun Mantığını Yazmak ve Oyuncu Girdileri"
date: 2026-03-15 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, 2d, gdscript]
permalink: /godot-egitim-serisi-bolum-4/
published: true
---

Önceki bölümlerde Godot'nun temel yapı taşlarını ve arayüzünü inceledik. Artık teoriden pratiğe geçme ve oyunlarınıza "hayat verme" zamanı! Bu kapsamlı rehberde, Godot'da hangi script dillerini kullanabileceğinizi öğrenecek, ilk script'inizi yazacak ve karakterinizi klavye ile nasıl kontrol edebileceğinizi adım adım keşfedeceksiniz.

---

## Godot'da Script Dilleri: Hangisini Seçmelisiniz?

Script'ler, bir node'a eklenen ve o node'un davranışını genişleten kod dosyalarıdır. Bir script, bağlandığı node'un tüm fonksiyonlarını ve özelliklerini miras alır. Godot'da oyun mantığını kodlamak için dört resmi dil seçeneğiniz bulunmaktadır: GDScript, C#, C ve C++.

> 💡 **Bilgilendirme:** Godot, tek bir projede birden fazla dil kullanmanıza olanak tanır. Hızlı yazılması gereken mantıklar için GDScript, maksimum performans gerektiren kısımlar için C++ kullanabilirsiniz.

* **GDScript:** Godot için özel olarak geliştirilmiş, sade ve öğrenmesi çok kolay bir dildir. Motorla sıkı bir editör entegrasyonu sunar ve harici bir kod editörü gerektirmez. Yeni başlıyorsanız kesinlikle GDScript ile başlamalısınız.

![GDScript Editörü](/assets/images/scripting_gdscript.webp)
*Godot'nun yerleşik script editöründe GDScript kodu*

* **C# (.NET):** Oyun sektöründe popüler olan bu dil, performans ve esneklik sunar ancak harici bir editör gerektirir ve daha çok deneyimli kullanıcılara önerilir.

* **C / C++ (GDExtension):** Maksimum performans içindir, ancak öğrenme eğrisi oldukça zordur.

Biz bu eğitim serimizde, oyun geliştiricilerinin ihtiyaçlarına tam uyum sağlayan ve yıldırım hızında çalışan **GDScript**'i kullanacağız.

---

## İlk Script'inizi Yazın: Godot İkonunu Canlandırıyoruz

Artık kod yazmaya başlayabiliriz! Amacımız, Godot ikonunu ekranda döndürmek ve hareket ettirmektir.

![Dönen Godot İkonu](/assets/images/scripting_first_script_rotating_godot.webp)
*Bu bölümün sonunda Godot ikonu böyle dönüyor olacak*

1. Yeni bir proje oluşturun ve kök node olarak `Sprite2D` ekleyin.

![Sprite2D Ekleme](/assets/images/scripting_first_script_add_sprite_node.webp)
*Sprite2D node'unu oluşturuyoruz*

2. FileSystem (Dosya Sistemi) panelinden `icon.svg` dosyasını Inspector (Denetçi) panelindeki **Texture** alanına sürükleyip bırakın.

![Texture Ayarı](/assets/images/scripting_first_script_setting_texture.webp)
*icon.svg dosyasını Texture alanına sürükleyip bırakıyoruz*

![Sprite Ortalama](/assets/images/scripting_first_script_centering_sprite.webp)
*Godot ikonunu viewport'un ortasına taşıyoruz*

3. `Sprite2D` node'una sağ tıklayın ve **Attach Script** (Script Ekle) seçeneğini seçin.

![Script Ekleme Menüsü](/assets/images/scripting_first_script_attach_script.webp)
*Sprite2D'ye sağ tıklayıp "Attach Script" seçiyoruz*

4. Açılan pencerede Template (Şablon) alanını **Object: Empty** olarak değiştirip **Create** (Oluştur) butonuna tıklayın.

![Script Ayar Penceresi](/assets/images/scripting_first_script_attach_node_script.webp)
*Script ayarlama penceresi*

Script dosyanızın en üstünde `extends Sprite2D` yazısını göreceksiniz. Bu, yazdığınız kodun `Sprite2D`'nin tüm özelliklerine erişebileceği anlamına gelir.

### Oyun Döngüsü: _process() ve delta Kavramları

Bir karakteri hareket ettirmek için, oyun döngüsünde her kare (frame) pozisyonu güncellemeniz gerekir. Bunun için `Node` sınıfının `_process()` sanal fonksiyonunu kullanacağız.

Script'inize şu değişkenleri ve fonksiyonu ekleyin:

```gdscript
extends Sprite2D

var speed = 400
var angular_speed = PI

func _process(delta):
    rotation += angular_speed * delta
```

**Kodun Satır Satır Açıklaması:**
*   `extends Sprite2D`: Bu kod dosyasının bir görsel öğe olan `Sprite2D` node'una ait olduğunu ve onun özellikleriyle çalışacağını belirtir.
*   `var speed = 400`: `speed` (hız) adında bir değişken oluşturur ve değerine 400 atarız. Bu karakterin saniyede kaç piksel ileri gideceğini belirler.
*   `var angular_speed = PI`: `angular_speed` (dönme hızı) adında bir değişken oluşturur. Değer olarak matematiksel `PI` (yaklaşık 3.14) atanır. Godot'da dönüşler radyan cinsinden heaplandığından `PI` saniyede yarım tur (180 derece) dönmek anlamına gelir.
*   `func _process(delta):`: Oyun açık olduğu sürece her bir karede (frame) Godot tarafından otomatik çalıştırılan özel bir fonksiyondur. Saniyede 60 kez çalışabilir.
*   `rotation += angular_speed * delta`: Nesnenin geçerli açısını (`rotation`) sürekli güncelleriz. Sabit belirlediğimiz dönme hızını (`angular_speed`) geçen süreyle (`delta`) çarparak ekleriz. `delta` ile çarpmamız oyun hızından (FPS) bağımsız akıcı bir dönüş sağlar.


> 💡 **Bilgilendirme:** `_process()` fonksiyonu Godot tarafından her karede otomatik olarak çağrılır. Parametre olarak aldığı `delta`, bir önceki kareden bu yana geçen süreyi (saniye cinsinden) temsil eder.

> ⚠️ **Uyarı:** `delta` kullanmak oyun geliştirmede hayati öneme sahiptir. Hareketi saniyedeki kare hızından (FPS) bağımsız hâle getirir. Böylece oyununuz 30 FPS'de de 120 FPS'de de aynı hızda çalışır.

Şimdi ileriye doğru hareket etmesini sağlayalım. Aynı fonksiyonun içine şu satırları ekleyin:

```gdscript
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta
```

**Kodun Satır Satır Açıklaması:**
*   `var velocity = Vector2.UP.rotated(rotation) * speed`: Karakterin hareket yönünü ve ne kadar hızlı gideceğini (velocity) hesapladığımız satırdır.
    *   `Vector2.UP`: Godot için yukarı doğru dümdüz bakan bir ok (yön) gösterir. (Sıfır açısında yukarı demektir)
    *   `.rotated(rotation)`: Bu oku, karakterin şu anki dönük olduğu açı kadar (`rotation`) eğmeye yarar. Yani karakter nereye bakıyorsa yön bilgisini o tarafa çevirir.
    *   `* speed`: Ortaya çıkan bu yön bilgisini az önce belirlediğimiz hız (400) ile çarparak nihai hareket gücünü buluruz. Artık `velocity` (hız) hesaplanmıştır.
*   `position += velocity * delta`: Karakterimizin oyun dünyasındaki son konumunu (`position`) güncelliyoruz. Az önce hesapladığımız hızı (`velocity`), zaman telafisi (`delta`) ile çarparak mevcut konuma ekleriz. Böylece karakterimiz saniyesi saniyesine baktığı yöne doğru ilerler.


Bu kod sayesinde ikonunuz baktığı yöne doğru çember çizerek hareket edecektir. `Vector2.UP`, Godot'da yukarı yönünü temsil eden bir sabittir.

---

## Oyuncu Girdilerini (Input) Dinlemek

İkonun kendi kendine dönmesi güzel, ancak kontrolü oyuncuya vermemiz gerekiyor. Godot'da klavye veya fare girdilerini işlemek için iki temel yöntem vardır: `_unhandled_input()` (sadece tuşa basıldığında tetiklenir) ve `Input` singleton'ı (her karede sürekli kontrol sağlar).

![Girdiye Göre Hareket](/assets/images/scripting_first_script_moving_with_input.webp)
*Bu bölümün sonunda ok tuşlarıyla ikonu yönlendiriyor olacaksın*

Biz hareket mekaniği için `Input` singleton'ını kullanacağız. Dönme hareketini ok tuşlarına bağlamak için `_process()` fonksiyonunuzu şu şekilde güncelleyin:

```gdscript
func _process(delta):
    var direction = 0
    if Input.is_action_pressed("ui_left"):
        direction = -1
    if Input.is_action_pressed("ui_right"):
        direction = 1

    rotation += angular_speed * direction * delta
```

**Kodun Satır Satır Açıklaması:**
*   `func _process(delta):`: Her karede çalışan motorumuz. Animasyon ve girdi işlemleri buralarda yapılır.
*   `var direction = 0`: Karakterin hangi yöne döneceğini tutmak için geçici bir `direction` (yön) değişkeni yaratıyoruz ve varsayılan olarak `0` (dönme) veriyoruz.
*   `if Input.is_action_pressed("ui_left"):`: Oyun motoruna "Oyuncu şu an klavyedeki sol ok tuşuna ('ui_left') basıyor mu?" diye sorarız. `if` (eğer) şart sağlıyorsa, bir alt satıra geçer.
*   `direction = -1`: Klavyede sola basıldığı için yön değerini `-1` yaparız ki karakter saat yönünün tersine dönsün.
*   `if Input.is_action_pressed("ui_right"):`: Benzer şekilde sağ ok tuşuna ('ui_right') basılıp basılmadığını kontrol eder.
*   `direction = 1`: Eğer klavyede sağa basılıyorsa, yönü `1` yaparız ki karakter saat yönünde dönsün.
*   `rotation += angular_speed * direction * delta`: Yukarıdaki işlemlerin nihai sonucudur. Eğer her iki tuşa da basmıyorsak `direction` `0` kalır, böylece dönüş hesabının sonucu `0` olur ve karakter dönmez. Basıyorsak `+/-1` ile çarpılarak sağa veya sola doğru belirlenen hızda akıcı bir şekilde döner.


### İleri Gitme Kontrolünü Eklemek

Son olarak, ikonun yalnızca yukarı ok tuşuna basıldığında ilerlemesini sağlayalım:

```gdscript
    var velocity = Vector2.ZERO
    if Input.is_action_pressed("ui_up"):
        velocity = Vector2.UP.rotated(rotation) * speed

    position += velocity * delta
```

**Kodun Satır Satır Açıklaması:**
*   `var velocity = Vector2.ZERO`: `velocity` (hız vektörü) değişkenini sıfırlayarak işe başlıyoruz. `Vector2.ZERO` hızın yatayda ve dikeyde sıfır olması, yani hareket olmadığı anlamına gelir. Eğer bir tuşa basılmazsa karakter olduğu yerde duracaktır.
*   `if Input.is_action_pressed("ui_up"):`: "Oyuncu şu an klavyede yukarı ok tuşuna ('ui_up') basılı tutuyor mu?" diye kontrol ederiz. Basmıyorsa bu `if` bloğu atlanır.
*   `velocity = Vector2.UP.rotated(rotation) * speed`: Eğer oyuncu ileri (yukarı ok) basıyorsa, karakterin baktığı açıyı alır (`rotated(rotation)`) ve gidiş gücünü (`speed`) uygulayarak `velocity` büyüklüğünü belirleririz.
*   `position += velocity * delta`: En sonda ise karakterimizin yeni konumunu (`position`), varsa yeni hızı (`velocity`) ile güncelleriz. Eğer tuşa basılmadıysa hız sıfır olduğu için karakter hareket etmeyecektir.


> 💡 **Bilgilendirme:** `Vector2.ZERO`, uzunluğu 0 olan, yani karakterin tamamen hareketsiz olduğunu temsil eden bir vektör sabitidir. Oyuncu `"ui_up"` (yukarı ok) tuşuna bastığında karakter ileri fırlar, basmadığında ise `Vector2.ZERO` sayesinde yerinde durur.

> 💡 **Bilgilendirme:** Kendi özel tuş atamalarınızı (örneğin W, A, S, D tuşlarını) yapmak isterseniz **Project > Project Settings > Input Map** menüsünü kullanabilirsiniz.

---

## Özet

Bu uzun ve doyurucu rehberde şunları başardınız:
* GDScript'in avantajlarını öğrendiniz ve ilk script'inizi bir node'a bağladınız.
* `_process()` fonksiyonu ve `delta` zamanı ile oyun döngüsünün nasıl çalıştığını kavradınız.
* Input sistemi ile klavye kontrollerini oyununuza entegre ettiniz.

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='tAj18IY1n5w' %}

## Sıradaki Adım

Bir sonraki bölümde, Godot'nun en güçlü ve esnek sistemlerinden biri olan **Sinyallere (Signals)** ve node'ların birbiriyle nasıl iletişim kurduğuna odaklanacağız!

---

*Bu yazı, Godot Engine resmi dokümantasyonu esas alınarak Türkçe olarak hazırlanmıştır.*