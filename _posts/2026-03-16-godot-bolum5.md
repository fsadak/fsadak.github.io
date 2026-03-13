---
title: "Godot Engine Eğitim Serisi - Bölüm 5: İlk Script'ini Yaz: Godot İkonunu Döndürelim"
date: 2026-03-16 12:05:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, mob, enemy, spawning, path3d, collision layers, squash]
permalink: /godot-egitim-serisi-bolum-5/
published: true
---

Artık teoriden pratiğe geçme zamanı! Bu bölümde ilk GDScript kodunu yazacak ve Godot ikonunu ekranda döndürüp hareket ettireceksin. Temel programlama bilgisine sahip olduğunu varsayıyoruz.

![Dönen Godot İkonu](/assets/images/scripting_first_script_rotating_godot.webp)
*Bu bölümün sonunda Godot ikonu böyle dönüyor olacak — hadi başlayalım!*

---

## Proje Kurulumu

Yeni bir proje oluştur. Proje, Godot'nun toplulukta prototip yapmak için sık kullandığı **Godot ikonunu** (`icon.svg`) varsayılan olarak içerecek.

![Godot İkonu](/assets/images/scripting_first_script_icon.svg)
*Godot ikonu — bu bölümde bunu hareket ettireceğiz*

### Sprite2D Node'u Ekle

İkonu oyunda görüntülemek için bir **Sprite2D** node'una ihtiyacımız var.

Scene doku'nda **Other Node** butonuna tıkla:

![Other Node Butonu](/assets/images/scripting_first_script_click_other_node.webp)
*Scene doku'nda "Other Node" butonuna tıklıyoruz*

Arama çubuğuna `Sprite2D` yaz, filtrele ve çift tıklayarak oluştur:

![Sprite2D Ekleme](/assets/images/scripting_first_script_add_sprite_node.webp)
*Sprite2D node'unu oluşturuyoruz*

Scene sekmende şimdi yalnızca bir `Sprite2D` node'u görünmeli:

![Scene Ağacı](/assets/images/scripting_first_script_scene_tree.webp)
*Scene ağacında tek bir Sprite2D node'u var*

### Texture Ata

Sprite2D, görüntülemek için bir **texture'a** ihtiyaç duyar. Inspector'da `Texture` özelliğinin `<empty>` olduğunu göreceksin.

FileSystem doku'ndan `icon.svg` dosyasını sürükleyip Inspector'daki **Texture** alanına bırak:

![Texture Ayarı](/assets/images/scripting_first_script_setting_texture.webp)
*icon.svg dosyasını Texture alanına sürükleyip bırakıyoruz*

> 💡 **İpucu:** Görseli doğrudan viewport'a sürükleyip bırakarak da otomatik olarak Sprite2D oluşturabilirsin.

Ardından ikonu viewport'ta tıklayıp oyun görünümünün ortasına sürükle:

![Sprite Ortalama](/assets/images/scripting_first_script_centering_sprite.webp)
*Godot ikonunu viewport'un ortasına taşıyoruz*

---

## Yeni Script Oluştur

Node'umuza script ekleyelim. Scene doku'nda `Sprite2D`'ye **sağ tıkla** ve **Attach Script** seçeneğini seç:

![Script Ekleme Menüsü](/assets/images/scripting_first_script_attach_script.webp)
*Sprite2D'ye sağ tıklayıp "Attach Script" seçiyoruz*

**Attach Node Script** penceresi açılır:

![Script Ayar Penceresi](/assets/images/scripting_first_script_attach_node_script.webp)
*Script dili ve dosya yolunu burada ayarlıyoruz*

- **Template** alanını `Node: Default`'tan `Object: Empty`'ye değiştir — böylece temiz bir dosyayla başlarız
- Diğer seçenekleri varsayılan hâlde bırak
- **Create** butonuna tıkla

Script çalışma alanı açılır ve yeni `sprite_2d.gd` dosyan şu satırla başlar:

```gdscript
extends Sprite2D
```

Her GDScript dosyası örtük olarak bir **sınıftır (class)**. `extends` anahtar kelimesi bu scriptin hangi sınıfı miras aldığını belirtir. Burada `Sprite2D`'yi genişletiyoruz — yani scriptimiz, Sprite2D'nin tüm özellik ve fonksiyonlarına (Node2D, CanvasItem, Node dahil) erişebilecek.

> 📝 **Not:** Inspector'da özelliklerin adları "Title Case" formatındadır (örneğin `Rotation Degrees`). GDScript'te ise aynı özellikler "snake_case" formatında yazılır (örneğin `rotation_degrees`). Inspector'da herhangi bir özelliğin üzerine fareyle geldiğinde açıklama ve kod tanımlayıcısını görebilirsin.

---

## Hello, World!

Script şu an hiçbir şey yapmıyor. Başlangıç olarak **Output** paneline `"Hello, world!"` yazdıralım.

Scripte şu kodu ekle:

```gdscript
extends Sprite2D

func _init():
    print("Hello, world!")
```

Kodu parçalayalım:

- `func` anahtar kelimesi yeni bir fonksiyon tanımlar
- `_init` bu sınıfın **yapıcı fonksiyonunun (constructor)** özel adıdır
- Motor, bir nesne ya da node bellekte oluşturulurken `_init()` fonksiyonunu otomatik olarak çağırır

> ⚠️ **Dikkat:** GDScript **girinti tabanlı** bir dildir. `print()` satırının başındaki sekme (tab) zorunludur. Unutursan editör kırmızıyla vurgular ve "Indented block expected" hatası gösterir.

Sahneyi `sprite_2d.tscn` olarak kaydet (henüz kaydetmediysen), ardından **F6** (macOS'ta Cmd + R) ile çalıştır. Alt paneldeki **Output** sekmesinin `"Hello, world!"` yazdığını göreceksin:

![Hello World Çıktısı](/assets/images/scripting_first_script_print_hello_world.webp)
*Output panelinde "Hello, world!" görünüyor*

Şimdi `_init()` fonksiyonunu sil; yalnızca `extends Sprite2D` satırı kalsın.

---

## İkon Dönsün!

Node'u hareket ettirme ve döndürme zamanı. Bunun için scripte **iki üye değişken (member variable)** ekleyeceğiz: piksel cinsinden hareket hızı ve radyan cinsinden açısal hız.

`extends Sprite2D` satırının hemen altına şunları ekle:

```gdscript
extends Sprite2D

var speed = 400
var angular_speed = PI
```

Üye değişkenler scriptin üst kısmında, `extends` satırlarından sonra ve fonksiyonlardan önce yer alır. Bu scripte sahip her node örneği, `speed` ve `angular_speed` özelliklerinin bağımsız kopyasını taşır.

> 💡 **Not:** Godot'da açılar varsayılan olarak **radyan** cinsindendir. Derece cinsinden çalışmak istersen yerleşik fonksiyonlar ve özellikler de mevcut.

### `_process()` Fonksiyonu

İkonu hareket ettirmek için, oyun döngüsünde her kare (frame) pozisyonu ve rotasyonu güncellememiz gerekiyor. Bunun için `Node` sınıfının `_process()` sanal (virtual) fonksiyonunu kullanırız.

`Node` sınıfını genişleten herhangi bir sınıfta (Sprite2D gibi) bu fonksiyonu tanımlarsan, Godot onu **her kare** çağırır. Fonksiyona `delta` adında bir argüman iletilir — bu, **bir önceki kareden bu yana geçen süreyi** (saniye cinsinden) temsil eder.

> 🎮 **Delta neden önemli?** Oyunlar saniyede pek çok kare (genellikle 60 FPS) render eder. Kare render süreleri küçük değişkenlikler gösterebilir. `delta` değerini kullanmak, hareketi kare hızından bağımsız hâle getirir — böylece oyun 30 FPS'de de 120 FPS'de de aynı hızda çalışır.

Scriptin altına şu fonksiyonu ekle:

```gdscript
func _process(delta):
    rotation += angular_speed * delta
```

- `rotation`, `Node2D`'den miras alınan bir özelliktir — node'un rotasyonunu radyan cinsinden kontrol eder
- Her kare, `angular_speed * delta` kadar rotasyon ekliyoruz

> 💡 **İpucu:** Kod editöründe `position`, `rotation` veya `_process` gibi yerleşik bir özelliğe ya da fonksiyona **Ctrl + tıklayarak** (macOS'ta Cmd + tık) ilgili dokümantasyonu yeni sekmede açabilirsin.

Sahneyi çalıştır — Godot ikonunun yerinde döndüğünü göreceksin!

![Yerinde Dönen İkon](/assets/images/scripting_first_script_godot_turning_in_place.webp)
*Godot ikonu yerinde dönüyor — `_process()` fonksiyonu her kare çalışıyor*

---

## İleriye Hareket!

Şimdi node'un ileriye de hareket etmesini sağlayalım. `_process()` fonksiyonunun içine, mevcut satırla **aynı girintide** olmak üzere şu iki satırı ekle:

```gdscript
func _process(delta):
    rotation += angular_speed * delta
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta
```

Yeni satırları inceleyelim:

- `var velocity` — yerel bir değişken tanımlar; yalnızca bu fonksiyon içinde geçerlidir
- `Vector2.UP` — yukarı yönünü gösteren bir 2D vektörü sabiti
- `.rotated(rotation)` — bu vektörü mevcut rotasyon açısına göre döndürür; ikonun baktığı yönü verir
- `* speed` — hız değeriyle çarparak ilerleme hızını belirler
- `position += velocity * delta` — node'u her kare bu hız kadar ileri taşır

> 📝 **Not:** `Vector2`, Godot'nun 2D vektörü temsil eden yerleşik tipidir. `position` de `Vector2` türündendir.

Sahneyi çalıştır — Godot ikonunun çember çizerek döndüğünü göreceksin!

![Çember Çizen İkon](/assets/images/scripting_first_script_rotating_godot.webp)
*Godot ikonu artık çember çizerek hareket ediyor*

> ⚠️ **Not:** Node'u bu şekilde hareket ettirmek duvarlarla veya zemine çarpışmayı hesaba katmaz. İlk 2D oyun bölümünde çarpışmaları da ele alacağız.

---

## Tam Script

Referans olması için `sprite_2d.gd` dosyasının tam hâli:

```gdscript
extends Sprite2D

var speed = 400
var angular_speed = PI

func _process(delta):
    rotation += angular_speed * delta
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta
```

---

## Özet

| Kavram | Açıklama |
|---|---|
| `extends` | Scriptin hangi node sınıfını genişlettiğini belirtir |
| Üye değişken | Sınıfın üst kısmında tanımlanan, tüm örneklerde bulunan değişken |
| `_process(delta)` | Her kare Godot tarafından çağrılan sanal fonksiyon |
| `delta` | Bir önceki kareden bu yana geçen süre (saniye) |
| `rotation` | Node2D'den miras alınan rotasyon özelliği (radyan) |
| `position` | Node2D'den miras alınan konum özelliği (Vector2) |
| `Vector2.UP` | Yukarı yönü gösteren sabit 2D vektör |

---

## Sıradaki Adım

Node kendi kendine hareket ediyor. Bir sonraki bölümde **oyuncu girdisini dinleme** konusunu ele alacağız — klavye veya fare ile bu hareketi nasıl kontrol ederiz? 🎮

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/scripting_first_script.html) esas alınarak Türkçe olarak hazırlanmıştır.*
