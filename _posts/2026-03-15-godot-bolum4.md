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
* **C# (.NET):** Oyun sektöründe popüler olan bu dil, performans ve esneklik sunar ancak harici bir editör gerektirir ve daha çok deneyimli kullanıcılara önerilir.
* **C / C++ (GDExtension):** Maksimum performans içindir, ancak öğrenme eğrisi oldukça zordur.

Biz bu eğitim serimizde, oyun geliştiricilerinin ihtiyaçlarına tam uyum sağlayan ve yıldırım hızında çalışan **GDScript**'i kullanacağız.

---

## İlk Script'inizi Yazın: Godot İkonunu Canlandırıyoruz

Artık kod yazmaya başlayabiliriz! Amacımız, Godot ikonunu ekranda döndürmek ve hareket ettirmektir.

1. Yeni bir proje oluşturun ve kök node olarak `Sprite2D` ekleyin.
2. FileSystem (Dosya Sistemi) panelinden `icon.svg` dosyasını Inspector (Denetçi) panelindeki **Texture** alanına sürükleyip bırakın.
3. `Sprite2D` node'una sağ tıklayın ve **Attach Script** (Script Ekle) seçeneğini seçin.
4. Açılan pencerede Template (Şablon) alanını **Object: Empty** olarak değiştirip **Create** (Oluştur) butonuna tıklayın.

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

> 💡 **Bilgilendirme:** `_process()` fonksiyonu Godot tarafından her karede otomatik olarak çağrılır. Parametre olarak aldığı `delta`, bir önceki kareden bu yana geçen süreyi (saniye cinsinden) temsil eder.

> ⚠️ **Uyarı:** `delta` kullanmak oyun geliştirmede hayati öneme sahiptir. Hareketi saniyedeki kare hızından (FPS) bağımsız hâle getirir. Böylece oyununuz 30 FPS'de de 120 FPS'de de aynı hızda çalışır.

Şimdi ileriye doğru hareket etmesini sağlayalım. Aynı fonksiyonun içine şu satırları ekleyin:

```gdscript
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta
```

Bu kod sayesinde ikonunuz baktığı yöne doğru çember çizerek hareket edecektir. `Vector2.UP`, Godot'da yukarı yönünü temsil eden bir sabittir.

---

## Oyuncu Girdilerini (Input) Dinlemek

İkonun kendi kendine dönmesi güzel, ancak kontrolü oyuncuya vermemiz gerekiyor. Godot'da klavye veya fare girdilerini işlemek için iki temel yöntem vardır: `_unhandled_input()` (sadece tuşa basıldığında tetiklenir) ve `Input` singleton'ı (her karede sürekli kontrol sağlar).

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

Bu kodda `direction` değişkeni, oyuncunun dönmek istediği yönü tutar. `Input.is_action_pressed()` metodu ise belirtilen tuşa o an basılıp basılmadığını kontrol eder. `"ui_left"` ve `"ui_right"`, Godot'da varsayılan olarak tanımlanmış sol ve sağ ok tuşlarını temsil eder.

### İleri Gitme Kontrolünü Eklemek

Son olarak, ikonun yalnızca yukarı ok tuşuna basıldığında ilerlemesini sağlayalım:

```gdscript
    var velocity = Vector2.ZERO
    if Input.is_action_pressed("ui_up"):
        velocity = Vector2.UP.rotated(rotation) * speed

    position += velocity * delta
```

> 💡 **Bilgilendirme:** `Vector2.ZERO`, uzunluğu 0 olan, yani karakterin tamamen hareketsiz olduğunu temsil eden bir vektör sabitidir. Oyuncu `"ui_up"` (yukarı ok) tuşuna bastığında karakter ileri fırlar, basmadığında ise `Vector2.ZERO` sayesinde yerinde durur.

> 🔗 **Web Linki:** Kendi özel tuş atamalarınızı (örneğin W, A, S, D tuşlarını) yapmak isterseniz **Project > Project Settings > Input Map** menüsünü kullanabilirsiniz.

---

## Özet

Bu uzun ve doyurucu rehberde şunları başardınız:
* GDScript'in avantajlarını öğrendiniz ve ilk script'inizi bir node'a bağladınız.
* `_process()` fonksiyonu ve `delta` zamanı ile oyun döngüsünün nasıl çalıştığını kavradınız.
* Input sistemi ile klavye kontrollerini oyununuza entegre ettiniz.

---

## Sıradaki Adım

Bir sonraki bölümde, Godot'nun en güçlü ve esnek sistemlerinden biri olan **Sinyallere (Signals)** ve node'ların birbiriyle nasıl iletişim kurduğuna odaklanacağız!

---

*Bu yazı, Godot Engine resmi dokümantasyonu esas alınarak Türkçe olarak hazırlanmıştır.*