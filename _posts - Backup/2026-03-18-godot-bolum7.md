---
title: "Godot Engine Eğitim Serisi - Bölüm 7: Sinyalleri Kullanmak: Node'lar Arası İletişim"
date: 2026-03-18 12:00:00 +0300
categories: [Godot Eğitim Serisi, İpuçları]
tags: [godot, autoload, singleton, globals, static]
permalink: /godot-egitim-serisi-bolum-7/
published: true
---

Bu bölümde Godot'nun en güçlü özelliklerinden biri olan **sinyal (signal)** sistemini ele alacağız. Sinyaller, bir node'da belirli bir şey olduğunda yayılan mesajlardır — örneğin bir butona basılması gibi. Diğer node'lar bu sinyale bağlanarak olay gerçekleştiğinde bir fonksiyon çağırabilir.

Sinyaller, Godot'nun yerleşik bir **delegasyon mekanizmasıdır** ve oyun nesnelerinin birbirini doğrudan referans almadan birbirine tepki vermesini sağlar. Bu yapı, kod bağımlılığını (coupling) azaltır ve kodunu esnek tutar.

> 💡 **Örnek:** Ekranda oyuncunun canını gösteren bir can çubuğun var. Oyuncu hasar aldığında veya iyileştirme kullandığında çubuğun güncellenmesini istiyorsun. Godot'da bunun için sinyal sistemi kullanırsın.

Godot 4.0'dan itibaren sinyaller, metodlar gibi **birinci sınıf tip (first-class type)** olarak tanımlandı. Bu, onları string olarak geçmek yerine doğrudan metod argümanı olarak iletebileceğin anlamına gelir; bu da daha iyi otomatik tamamlama ve daha az hata sağlar.

---

## Sahne Kurulumu

Önceki bölümlerden Godot ikonunu butona basınca durdurup harekete geçireceğiz. Bunun için hem `Button` hem de `sprite_2d.tscn` sahnesini içeren yeni bir sahne oluşturacağız.

### Adım 1: Yeni Sahne Oluştur

`Scene > New Scene` menüsüne git.

![Yeni Sahne Menüsü](/assets/images/signals_01_new_scene.webp)
*Yeni sahne oluşturmak için Scene > New Scene*

Scene doku'nda **2D Scene** butonuna tıkla. Bu, kök node olarak `Node2D` ekler.

![2D Sahne Seçimi](/assets/images/signals_02_2d_scene.webp)
*2D Scene butonu Node2D'yi kök node olarak ekler*

### Adım 2: Sprite2D Sahnesini Instance Olarak Ekle

FileSystem doku'nda `sprite_2d.tscn` dosyasını bul ve `Node2D`'nin üzerine sürükleyip bırak:

![Sahneyi Sürükle Bırak](/assets/images/signals_03_dragging_scene.webp)
*sprite_2d.tscn dosyasını Node2D'ye sürüklüyoruz*

### Adım 3: Button Node'u Ekle

Scene doku'nda `Node2D`'ye sağ tıkla ve **Add Child Node** seç:

![Alt Node Ekle](/assets/images/signals_04_add_child_node.webp)
*Node2D'ye sağ tıklayıp "Add Child Node" seçiyoruz*

`Button` node'unu ara ve ekle:

![Button Ekleme](/assets/images/signals_05_add_button.webp)
*Button node'unu aratıp ekliyoruz*

Buton varsayılan olarak küçük gelir. Viewport'ta **seçim aracının** aktif olduğundan emin ol:

![Seçim Aracı](/assets/images/signals_07_select_tool.webp)
*Seçim aracı aktif olmalı — yoksa handle'lar görünmez*

Butonu büyütmek için sağ alt köşesindeki **handle'dan** sürükle. Ardından butonu sürükleyerek sprite'a yakın bir konuma getir:

![Buton Taşıma](/assets/images/signals_06_drag_button.webp)
*Butonu viewport'ta yeniden boyutlandırıp konumlandırıyoruz*

Son olarak Inspector'da **Text** özelliğine `Toggle motion` yaz:

![Buton Etiketi](/assets/images/signals_08_toggle_motion_text.webp)
*Butonun Text özelliğine "Toggle motion" yazıyoruz*

Sahne ağacı ve viewport şöyle görünmeli:

![Sahne Kurulumu Tamamlandı](/assets/images/signals_09_scene_setup.webp)
*Sahne hazır — Node2D altında Sprite2D instance'ı ve Button yan yana*

Sahneyi `node_2d.tscn` olarak kaydet. **F6** ile çalıştırırsan buton görünür ama henüz bir şey yapmaz.

---

## Editörde Sinyal Bağlamak

Button'ın `pressed` sinyalini Sprite2D'ye bağlayalım. Böylece butona basıldığında ikonun hareketi durur ya da devam eder.

### Sinyal Doku'ndan Bağla

**Button** node'unu seç. Sağ panelde Inspector'ın yanındaki **Signals** sekmesine tıkla:

![Signals Sekmesi](/assets/images/signals_10_node_dock.webp)
*Sağ panelde "Signals" sekmesini açıyoruz*

Seçili node'da kullanılabilir sinyallerin listesi görünür. `pressed` sinyaline **çift tıkla**:

![pressed Sinyali](/assets/images/signals_11_pressed_signals.webp)
*"pressed" sinyaline çift tıklıyoruz*

**Node Connection** penceresi açılır:

![Sinyal Bağlantı Penceresi](/assets/images/signals_12_node_connection.webp)
*Sinyali hangi node'a bağlayacağımızı seçiyoruz*

Bağlantı penceresinde sinyali **Sprite2D** node'una bağlayacağız. Node, sinyali alacak bir **alıcı metod (receiver method)** gerektirir — editör bunu senin için otomatik oluşturur.

Kural gereği bu callback metodlar `_on_node_adı_sinyal_adı` şeklinde adlandırılır. Burada `_on_button_pressed` olacak.

> 💡 **İleri Mod:** Pencerenin sağ altındaki **Advanced** butonuyla gelişmiş bağlantı moduna geçebilirsin. Bu mod; herhangi bir node'a ve yerleşik fonksiyona bağlanmana, callback'e argüman eklemeye ve çeşitli seçenekleri ayarlamana olanak tanır.

![Gelişmiş Bağlantı Penceresi](/assets/images/signals_advanced_connection_window.webp)
*Gelişmiş bağlantı penceresi — daha fazla seçenek sunar*

**Connect** butonuna tıkla. Script çalışma alanına geçersin ve sol kenarda **bağlantı simgesi** olan yeni metodu görürsün:

![Bağlantı Simgesi](/assets/images/signals_13_signals_connection_icon.webp)
*Sol kenardaki simge sinyalin bağlı olduğunu gösterir*

Simgeye tıklarsan bağlantı hakkında bilgi veren bir pencere açılır:

![Bağlantı Bilgisi](/assets/images/signals_14_signals_connection_info.webp)
*Sinyal bağlantısının detaylarını gösteren pencere*

### Callback Fonksiyonu Yaz

Oluşturulan metodun içindeki `pass` satırını şu kodla değiştir:

```gdscript
func _on_button_pressed():
    set_process(not is_processing())
```

- `set_process()` — node'un `_process()` fonksiyonunun çalışıp çalışmamasını kontrol eder
- `is_processing()` — işleme aktifse `true`, değilse `false` döner
- `not` — değeri tersine çevirir

Bu fonksiyon, butona her basıldığında ikonun hareket edip etmemesini değiştirecek.

### `_process()` Fonksiyonunu Güncelle

Klavye girdisini kaldırıp ikonu tekrar otomatik hareket ettirelim. `_process()` fonksiyonunu şu hâle getir:

```gdscript
func _process(delta):
    rotation += angular_speed * delta
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta
```

Tam `sprite_2d.gd` kodu şöyle olmalı:

```gdscript
extends Sprite2D

var speed = 400
var angular_speed = PI

func _process(delta):
    rotation += angular_speed * delta
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta

func _on_button_pressed():
    set_process(not is_processing())
```

**F6** ile sahneyi çalıştır ve butona tıkla — ikon durur ve tekrar tıklayınca hareket etmeye başlar!

---

## Kodla Sinyal Bağlamak

Sinyalleri editörde bağlamanın yanı sıra **kodla da bağlayabilirsin**. Bu, script içinde dinamik olarak node oluşturduğunda veya sahne instance'ladığında gereklidir.

Bunu göstermek için `Timer` node'unu kullanalım. Timer, beceri bekleme süreleri, silah yeniden yükleme gibi işlemler için kullanışlıdır.

### Timer Node'u Ekle

2D çalışma alanına dön (Ctrl + F1 veya üstten "2D" butonuna tıkla). Scene doku'nda `Sprite2D`'ye sağ tıkla ve **Timer** node'u ekle:

![Timer Eklenmiş Sahne Ağacı](/assets/images/signals_15_scene_tree.webp)
*Sprite2D'nin altına Timer node'u ekledik*

Timer node'u seçiliyken Inspector'da **Autostart** özelliğini etkinleştir:

![Timer Autostart](/assets/images/signals_18_timer_autostart.webp)
*Autostart açıldığında Timer, sahne başlar başlamaz otomatik çalışır*

### Script'e Dön

Sprite2D'nin yanındaki **script simgesine** tıkla:

![Script Simgesi](/assets/images/signals_16_click_script.webp)
*Script simgesine tıklayarak kod editörüne geçiyoruz*

### `_ready()` ile Bağlantıyı Kur

Kodla sinyal bağlamak için iki adım gerekiyor:

1. Sprite2D'den Timer'a referans al
2. Timer'ın `timeout` sinyalinde `connect()` metodunu çağır

Bunları `_ready()` fonksiyonunda yapacağız. `_ready()`, bir node tamamen bellekte oluşturulduğunda motor tarafından otomatik çağrılır:

```gdscript
func _ready():
    var timer = get_node("Timer")
    timer.timeout.connect(_on_timer_timeout)
```

- `get_node("Timer")` — mevcut node'un çocukları arasında "Timer" adındaki node'u bulur
- `timer.timeout.connect(...)` — Timer'ın `timeout` sinyali tetiklendiğinde `_on_timer_timeout` fonksiyonunu çağırır

> 📝 **Not:** Eğer Timer'ı editörde "BlinkingTimer" olarak yeniden adlandırdıysan, çağrıyı `get_node("BlinkingTimer")` şeklinde güncellemelisin.

### Callback Fonksiyonu Ekle

Scriptin altına şu fonksiyonu ekle:

```gdscript
func _on_timer_timeout():
    visible = not visible
```

- `visible` — node'un görünürlüğünü kontrol eden boolean özellik
- `visible = not visible` — her çağrıda görünürlüğü tersine çevirir (görünür ↔ görünmez)

Sahneyi çalıştırırsan ikon saniyede bir yanıp sönecek!

---

## Tam Script

```gdscript
extends Sprite2D

var speed = 400
var angular_speed = PI

func _ready():
    var timer = get_node("Timer")
    timer.timeout.connect(_on_timer_timeout)

func _process(delta):
    rotation += angular_speed * delta
    var velocity = Vector2.UP.rotated(rotation) * speed
    position += velocity * delta

func _on_button_pressed():
    set_process(not is_processing())

func _on_timer_timeout():
    visible = not visible
```

---

## Özel Sinyal Tanımlamak

Godot'nun yerleşik sinyallerinin yanı sıra **kendi sinyallerini** de tanımlayabilirsin.

![Özel Sinyal Örneği](/assets/images/signals_17_custom_signal.webp)
*Editörde özel bir sinyal nasıl görünür*

Örneğin oyuncunun canı sıfıra düştüğünde "game over" ekranı göstermek istediğini varsay. Bunun için `health_depleted` adında bir sinyal tanımlayabilirsin:

```gdscript
extends Node2D

signal health_depleted

var health = 10
```

Özel sinyaller yerleşik sinyaller gibi davranır; Signals sekmesinde görünürler ve aynı şekilde bağlanabilirler.

Sinyali tetiklemek için `emit()` metodunu çağır:

```gdscript
func take_damage(amount):
    health -= amount
    if health <= 0:
        health_depleted.emit()
```

Sinyaller isteğe bağlı olarak **argüman** da alabilir:

```gdscript
signal health_changed(old_value, new_value)

func take_damage(amount):
    var old_health = health
    health -= amount
    health_changed.emit(old_health, health)
```

---

## Özet

| Kavram | Açıklama |
|---|---|
| **Sinyal** | Belirli bir olay gerçekleştiğinde node tarafından yayılan mesaj |
| **connect()** | Bir sinyali bir callback fonksiyonuna bağlar |
| **emit()** | Sinyali tetikler, bağlı fonksiyonları çağırır |
| **_ready()** | Node tamamen oluşturulduğunda otomatik çağrılan fonksiyon |
| **set_process()** | `_process()` döngüsünü açıp kapatır |
| **is_processing()** | `_process()` aktifse `true` döner |
| **visible** | Node'un görünürlüğünü kontrol eden boolean özellik |
| **get_node()** | İsme göre çocuk node'a referans alır |

Sinyallerin kullanım alanları çok geniş:
- Bir node'un oyun dünyasına girmesi veya çıkması
- İki nesne arasındaki çarpışma
- Bir karakterin belirli bir alana girmesi
- Arayüz elemanının boyut değişimi
- Oyun mantığına özgü özel olaylar

---

## Sıradaki Adım

Step by Step serisi burada tamamlandı! 🎉 Artık Godot'nun temel yapıtaşlarını — node'lar, sahneler, script'ler, girdi ve sinyaller — öğrendin.

Bir sonraki büyük adım: **İlk 2D Oyunun** — tüm öğrendiklerini gerçek bir oyun projesinde bir araya getireceğiz! 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html) esas alınarak Türkçe olarak hazırlanmıştır.*
