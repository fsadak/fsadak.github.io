---
title: "Godot Engine Eğitim Serisi - Bölüm 6: Düşmanları Yaratmak ve Ana Sahne"
date: 2026-03-31 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, düşman, rigidbody2d, path2d, timer]
permalink: /godot-egitim-serisi-bolum-6/
published: true
---

Oyunumuzu artık tam bir oyun yapacak ana bileşenlere geldik: Düşmanlardan kaçmak! Önce düşmanları yaratacak, ardından `Main` adı vereceğimiz bir sahnede düşmanlarımızı, oyuncuyu ve genel kuralları birleştireceğiz.

## 1. Düşman Sahnesi: RigidBody2D ve Özellikleri

Yeni bir sahne oluşturun. Kök düğüm tipi olarak `RigidBody2D` (Katı Cisim) seçin ve adını `Mob` yapın. Tıpkı Player sahnesindeki gibi çocukları ebeveynle gruplayın (kilit ikonu).

- RigidBody2D yerçekiminden etkilenir ancak uzaydaki düşmanlarımız için bunu istemiyoruz. Gravity Scale değerini 0 yapın.
- Düşmanların birbirine çarpmasını istemediğimiz için Collision Mask içinden 1. katmanı kaldırın.

Sahneye eklenecek alt düğümler:

- **AnimatedSprite2D:** Görselimiz.
- **CollisionShape2D:** Vurulma alanımız.
- **VisibleOnScreenNotifier2D:** Ekrandan çıkışları yakalamak için.

## 2. Düşman Animasyonları ve Çarpışma

`AnimatedSprite2D` Sprite Frames'ini yaratın, 3 adet animasyon oluşturun: `fly`, `swim`, `walk`. (Her biri üç saniye hızında çalışsın, 'Animation Speed' = 3). Sprite'ı çok az küçülterek Scale değerini `(0.75, 0.75)` yapın.

Sonrasında CollisionShape2D için 'CapsuleShape2D' seçin, ancak kapsül dikeydir, düşmanlarımız yatay olduğu için Transform > Rotation kısmından `90` derece çevirin ve boyutu tam olarak düşmana oturtun. `mob.tscn` olarak kaydedin.

![Collision Mask Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfOKbCqtGo4sTI2vd1Hh5LvVtZaDrTkNUJn0kEo18bNc4KOIwngiqTcmUk7uPy3rJWCxR7BOp2NEdxDb_cFZjwkSlNWp-_vn8l_9RnzxRjrhrvsZDdMlZWM6bO10ef27N5NBTQkRI6JtYHTgwxgb2U7j5iDTmTBJfomiO1r2M4kwT7QwFRzy9-3KNafg/s320/set_collision_mask.webp)

![Mob Animasyonları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHTNmDVHSG6Gd0girHieJLusoA_iJJcXJ8Fjm5bO-q8Ml-uMMA-_NprWRgdrnnGf4By0KQ1M8-Hz5_Blxijgwwq0HVtCzeOyyuzEftp6LhGUPy9T6Z67Yj8-3AVQk_yIrEU2nIzbzz9sCkq26ZN9-dSjHQ71bRvhk8rChyphenhyphenx7rIU5OiXtYy7QvEx1b9Ww/s320/mob_animations.webp)

## 3. Düşman Davranışı (Kod)

Düşmanımız rastgele üreyecek ve rastgele bir animasyon tipiyle ekranda süzülecek. `mob.gd` isimli bir script ekleyin.

```gdscript
extends RigidBody2D

func _ready():
    var mob_types = Array($AnimatedSprite2D.sprite_frames.get_animation_names())
    $AnimatedSprite2D.animation = mob_types.pick_random() # Animasyonu rastgele seç
    $AnimatedSprite2D.play()
```

**Kod Açıklaması:**

- `extends RigidBody2D`: Düşmanımızın fizikli bir cisim (`RigidBody2D`) özelliklerini taşıdığını gösterir.
- `$AnimatedSprite2D.sprite_frames.get_animation_names()`: Düşmanların içindeki "fly, swim, walk" isimli animasyon isimlerini doğrudan Godot sisteminden çeker.
- `var mob_types = Array(...)`: Çektiği o animasyon isimlerini `["fly", "swim", "walk"]` yazılımsal bir diziye (Array) dönüştürür.
- `.pick_random()`: Bu nesne her yaratıldığında (`_ready`), tanımlanan 3 animasyondan rastgele herhangi birini seçer ve atar. Böylece her düşman birbirinden farklı görünür.
- `play()`: Seçilen animasyonu oynatmaya başlar.

Ekranda gereksiz yer kaplamaması için, `VisibleOnScreenNotifier2D` düğümünün `screen_exited` (ekrandan çıktı) sinyalini `mob.gd` belgesine bağlayın ve içine alttaki kodu yazın:

```gdscript
func _on_visible_on_screen_notifier_2d_screen_exited():
    queue_free() # Düğümü güvenlice sahneden sil.
```

**Kod Açıklaması:**

- `_on_..._screen_exited()`: Düğüm (Mob) ekranın dışına çıktığında tetiklenen fonksiyondur.
- `queue_free()`: İlgili nesneyi (düşmanı) Godot'un silinme kuyruğuna gönderir ve ilk fırsatta RAM'den siler. Bu işlem olmazsa, kenarlara kaçan düşmanlar oyun arka planında milyonlara ulaşıp cihazın hafızasını dondururdu.

## 4. Ana Sahneyi Kurmak

Farklı sahnelerde oluşturduğunuz objeleri tek bir ana kurguya oturtma zamanı. `Node` tipli yeni bir sahne oluşturup adını `Main` yapın.

- `player.tscn` dosyasını zincir ("Instance Child Scene") butonuyla sahnenize çağırın.
- 3 adet `Timer` yaratın: Adları `MobTimer` (0.5), `ScoreTimer` (1), `StartTimer` (2 saniye bekleme süresi, "One Shot" aktif olacak).
- Oyuncunun başlayacağı noktayı belirlemek için 1 adet `Marker2D` ekleyin ve adını `StartPosition` (G:240, Y:450) yapın.

![Instance Scene](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiHdu-LEW8VIljlue3509LJST5TQwJRVblHa5enQWZtsMijL9HcWjyjED1AHxvGC34znsTxmiMs3cV3wYt5pW3zA26JAqAS_Iep23MYI1LLSEadpW2yHcO7vRq_HK2M47KwCnoF9k4TubHd7APZj7YtwVTmq6QfaRaL80cTD_DAZfBeYCyZCB5UZMlXyA/s1600/instance_scene.webp)

## 5. Spawn Sistemi İçin Path2D

Düşmanların ekranın neresinden geleceğini belirlemek bazen çok kod gerektirir. Godot'un mucizevi düğümlerinden biri olan `Path2D` bu işi mükemmel yapar.

Main düğümüne `Path2D` (`MobPath`) ekleyin ve ekranın hemen dış sınırlarını köşe noktalardan seçerek kare çizin. Yolun "saat yönünde" olmasına dikkat edin, böylece düşmanlar ekranın içine bakarak spawnlanacaktır. İçine de `PathFollow2D` (`MobSpawnLocation`) düğümü atın.

![Path2D Butonları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPupCBeOaVrquWYM0NMYxRwiquwByYaervAk_LVe2jB6DtL5eM0rqkWj49V6oMQvKJDdRDhnXLiEoMd-XINB2pUnaq65DsHbBIaT8ImDOswVVfm_9LbMxizm_JVAtAzPCVVU6k6EYH8NiqXXSaCEAqRV2TcplzgvXJtH1WBQyah5pQCEth6OFdHUH4dA/s320/path2d_buttons.webp)

![Path2D Çizimi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPjIojZQtp7MBJM96YHC8sfq1vI2YgXY6LBpyIeR2HGRyFAxUHgQqmf0bXuSkkjZkqx10-qIjtO-oLs0wOZNQu0cqjPFAxD4omkP_4fICBujejPclcWHXfeNJr_rRLEIRkVLGK9_2BpoqbFoN5iWwmYDlXU2RfafGhxI6dOUnkusPY2suU9TUXvGr4ow/s320/draw_path2d.gif)

## 6. Ana Kod Dosyası

`Main` düğümüne `main.gd` scriptini atın.

`@export var mob_scene: PackedScene` (Mob.tscn'yi inspector'dan bu değişkene sürükleyip bırakmayı kesinlikle unutmayın!)

Şimdi `Player`'ın "hit" sinyalini ve üç Timer'ın "timeout" sinyallerini bu scripte bağlayın:

```gdscript
extends Node

@export var mob_scene: PackedScene
var score

func game_over(): # Player "hit" olduğunda
    $ScoreTimer.stop()
    $MobTimer.stop()

func new_game():
    score = 0
    $Player.start($StartPosition.position)
    $StartTimer.start()

func _on_start_timer_timeout():
    $MobTimer.start()
    $ScoreTimer.start()

func _on_score_timer_timeout():
    score += 1
```

**Kod Açıklaması:**

- `@export var mob_scene: PackedScene`: Ana sahnemizde oluşturacağımız düşman nesnelerinin şablon dosyasını (`mob.tscn`) inspector panelinden sürüklemek için tanımlanan değişkendir.
- `game_over()`: Oyuncu düşmana çarptığında (hit sinyali tetiklenince) çalışacak fonksiyondur. Skor artış döngüsünü (`ScoreTimer.stop()`) ve düşman yaratma döngüsünü (`MobTimer.stop()`) anında kapatır.
- `new_game()`: Oyunu başlattığımızda skoru 0'lar, oyuncuyu başlangıç pozisyonuna taşır ve 2 saniyelik bekleme süresini (`StartTimer`) tetikler.
- `_on_start_timer_timeout()`: 2 saniyelik hazırlık süresi bitince düşmanları (`MobTimer`) ve skor sayımını (`ScoreTimer`) otomatik başlatır.
- `_on_score_timer_timeout()`: Skor sayacı her saniye sıfırlandığında (`timeout`) tetiklenir ve skoru 1 artırır (`score += 1`).

MobTimer için düşmanı yarattığımız kritik kodumuz:

```gdscript
func _on_mob_timer_timeout():
    # 1. Yeni bir Mob (Düşman) Örneği Oluştur.
    var mob = mob_scene.instantiate()

    # 2. Yolda rastgele bir yer seç
    var mob_spawn_location = $MobPath/MobSpawnLocation
    mob_spawn_location.progress_ratio = randf()

    # 3. Yönü ayarla (dışarıya dik) ve biraz rastgelelik kat
    var direction = mob_spawn_location.rotation + PI / 2
    mob.position = mob_spawn_location.position
    direction += randf_range(-PI / 4, PI / 4)
    mob.rotation = direction

    # 4. Hızı belirle (vektörü açıyla döndür)
    var velocity = Vector2(randf_range(150.0, 250.0), 0.0)
    mob.linear_velocity = velocity.rotated(direction)

    # 5. Sahneye nesneyi çocuk olarak ekle
    add_child(mob)
```

**Kod Açıklaması:**

- `.instantiate()`: Şablon sahneden (`mob_scene`) bir klon üretir.
- `.progress_ratio = randf()`: Saat yönünde çizdiğimiz Path2D yolu 0.0 ile 1.0 arasında bir değer alır. `randf()` 0 ile 1 arasında rastgele bir yer seçer ve düşmanı oraya koyar.
- `direction = mob_spawn_location.rotation + PI / 2`: Yolun o anki çizgisine dik olarak nesneyi içeriye doğru tam 90 derecelik açıya döndürür.
- `randf_range(-PI / 4, PI / 4)`: Dümdüz çıkmasın diye açıyı hafif sağa veya sola -45 ile +45 aralığında kaydırarak sürpriz katar.
- `linear_velocity = velocity.rotated(direction)`: RigidBody2D objelerinin ilerleme hızına rastgele 150 ile 250 arasında bir kuvvet, hesaplanan açıda gönderilir.
- `add_child(mob)`: Klonlanmış nesneyi `Main` sahnesinin bir çocuğu olarak ekler ve oyun akışına koyar.

Eğer test etmek isterseniz hemen `_ready` fonksiyonuna `new_game()` fonksiyonunu çağırıp ekleyin ve F5'e basıp oyununuzun tadını çıkarın! Düşman yaratıp yok edebiliyorsunuz! Sıradaki ve son bölümümüz artık ana menü, skor ve arayüz detayları olacak.
