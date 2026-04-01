---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 8: Ses Efektleri Ekleyelim"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, audiostreamplayer, ses efekti, lazer, patlama, finished sinyali, set_deferred, ogg]
description: "AudioStreamPlayer node'u ile ateş, patlama ve hasar sesleri ekleniyor. finished sinyali ile ses tamamlanana kadar düşman sahnede tutuluyor."
permalink: /godot-kozmik-akin-bolum-8/
published: true
---

# Kozmik Akın — Bölüm 8: Ses Efektleri Ekleyelim

Oyunumuz mekanik olarak çalışıyor ama sessiz bir uzay savaşı pek heyecan vermiyor! Bu bölümde ateş, patlama ve hasar seslerini ekleyeceğiz. Godot'un `AudioStreamPlayer` node'unu öğreneceğiz.

Bölümün sonunda lazer ateşlenirken, düşman patlarken ve bize çarpıldığında sesler duyulacak.

---

## Ses Dosyalarını Projeye Ekleyelim

Ses dosyalarını `res://assets/sounds/` klasörüne kopyalayın. Üç dosyamız var:

| Dosya | Kullanım |
|-------|----------|
| `laser.ogg` | Ateş sesi |
| `explosion.ogg` | Düşman patlaması |
| `collision.ogg` | Bize çarpma sesi |

Dosyaları kopyaladıktan sonra Godot'un **FileSystem** panelinde otomatik olarak görünecekler.

> 💡 Godot `.ogg` formatını doğrudan destekler ve oyunlar için önerilen ses formatıdır. `.mp3` ve `.wav` de kullanılabilir ancak `.ogg` hem kaliteli hem de dosya boyutu açısından daha verimlidir.

---

## Ateş Sesini Ekleyelim

Lazer sesi Player sahnesine ait — her ateş ettiğimizde bu ses çalacak.

`res://scenes/player.tscn` dosyasını açın:

1. `Player` node'u seçiliyken **"+"** butonuyla `AudioStreamPlayer` ekleyin
2. Adını `LaserSound` yapın
3. **Inspector** panelinde **Stream** alanına `res://assets/sounds/laser.ogg` dosyasını sürükleyin

Sahne yapısı şöyle olmalı:
```
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
├── FirePoint (Marker2D)
├── HitBox (Area2D)
│   └── CollisionShape2D
├── LaserSound (AudioStreamPlayer)
└── CollisionSound (AudioStreamPlayer)
```

> 💡 **AudioStreamPlayer nedir?**
> Ses dosyası çalan özel bir node'dur. `play()` fonksiyonu çağrıldığında ses bir kez çalar. Pozisyona bağlı değildir — ekranın neresinde olursa olsun aynı ses seviyesinde çalar. Pozisyona bağlı ses için `AudioStreamPlayer2D` kullanılır, ama bizim oyunumuz için `AudioStreamPlayer` yeterli.

---

## Hasar Sesini Ekleyelim

Bize çarpıldığında çalacak ses de Player sahnesine ait.

`res://scenes/player.tscn` dosyasını açın:

1. `Player` node'u seçiliyken **"+"** butonuyla `AudioStreamPlayer` ekleyin
2. Adını `CollisionSound` yapın
3. **Inspector** panelinde **Stream** alanına `res://assets/sounds/collision.ogg` dosyasını sürükleyin

İki ses node'unu da ekledikten sonra sahne yapısı şöyle olmalı:
```
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
├── FirePoint (Marker2D)
├── HitBox (Area2D)
│   └── CollisionShape2D
├── LaserSound (AudioStreamPlayer)
└── CollisionSound (AudioStreamPlayer)
```

### player.gd'yi Güncelleyelim

`res://scripts/player.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0
const BULLET_SCENE = preload("res://scenes/bullet.tscn")
const FIRE_RATE = 0.2

var can_shoot = true

@onready var fire_point = $FirePoint
@onready var hit_box = $HitBox
@onready var laser_sound = $LaserSound
@onready var collision_sound = $CollisionSound

func _ready() -> void:
	hit_box.area_entered.connect(_on_area_entered)

func _physics_process(delta: float) -> void:
	var direction = Input.get_axis("ui_left", "ui_right")
	velocity.x = direction * SPEED
	move_and_slide()
	clamp_to_screen()

	if Input.is_action_pressed("ui_accept") and can_shoot:
		shoot()

func clamp_to_screen() -> void:
	var screen_size = get_viewport_rect().size
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)

func shoot() -> void:
	can_shoot = false
	var bullet = BULLET_SCENE.instantiate()
	bullet.position = fire_point.global_position
	get_parent().add_child(bullet)
	laser_sound.play()
	await get_tree().create_timer(FIRE_RATE).timeout
	can_shoot = true

func _on_area_entered(area: Area2D) -> void:
	collision_sound.play()
	GameManager.take_damage(1)
	area.queue_free()

func _input(event: InputEvent) -> void:
	pass
```

Yeni eklenen kısımları inceleyelim:

**`@onready var laser_sound = $LaserSound`**
**`@onready var collision_sound = $CollisionSound`**
İki ses node'una script içinden erişmek için referanslar oluşturuyoruz.

**`func shoot() -> void:`** içinde;

**`laser_sound.play()`**
Mermi oluşturulduktan hemen sonra lazer sesini çalıştırıyoruz.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`collision_sound.play()`**
Düşman bize çarptığında hasar sesini çalıştırıyoruz. Ses çalarken düşman sahneden silinse de ses tamamlanır — `CollisionSound` node'u Player'a ait olduğu için kesilmez.

---

## Patlama Sesini Ekleyelim

Patlama sesi düşman sahnesine ait — her düşman yok olduğunda bu ses çalacak.

`res://scenes/enemy.tscn` dosyasını açın:

1. `Enemy` node'u seçiliyken **"+"** butonuyla `AudioStreamPlayer` ekleyin
2. Adını `ExplosionSound` yapın
3. **Inspector** panelinde **Stream** alanına `res://assets/sounds/explosion.ogg` dosyasını sürükleyin

Sahne yapısı şöyle olmalı:
```
Enemy (Area2D)
├── Sprite2D
├── CollisionShape2D
└── ExplosionSound (AudioStreamPlayer)
```

### enemy.gd'yi Güncelleyelim

`res://scripts/enemy.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Area2D

const SPEED = 200.0
const SCORE_VALUE = 10

@onready var explosion_sound = $ExplosionSound

func _ready() -> void:
	area_entered.connect(_on_area_entered)

func _physics_process(delta: float) -> void:
	position.y += SPEED * delta

	if position.y > 800:
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	GameManager.add_score(SCORE_VALUE)
	area.queue_free()
	$Sprite2D.visible = false
	$CollisionShape2D.set_deferred("disabled", true)
	explosion_sound.play()
	explosion_sound.finished.connect(queue_free)
```

Yeni eklenen kısımları inceleyelim:

**`@onready var explosion_sound = $ExplosionSound`**
`ExplosionSound` node'una referans oluşturuyoruz.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`area.queue_free()`**
Mermiyi hemen siliyoruz — ses çalarken mermi ekranda durmasın.

**`$Sprite2D.visible = false`**
Düşman görselini hemen gizliyoruz. Ses çalarken düşman ekranda görünmüyor, patlama olmuş hissi veriyor.

**`$CollisionShape2D.set_deferred("disabled", true)`**
Çarpışma alanını devre dışı bırakıyoruz. Böylece ses çalarken ikinci bir mermi tekrar `_on_area_entered` fonksiyonunu tetiklemiyor. `set_deferred` kullanmamızın nedeni: çarpışma şekillerini fizik işlemi sırasında direkt değiştirmek Godot'ta hataya yol açabilir — `set_deferred` değişikliği güvenli bir ana erteliyor.

**`explosion_sound.play()`**
Patlama sesini başlatıyoruz.

**`explosion_sound.finished.connect(queue_free)`**
`finished` sinyali ses tamamlandığında yayılır ve `queue_free` fonksiyonunu çağırarak düşmanı sahneden güvenli şekilde siler. Bu yöntem `await` kullanmaktan daha güvenilirdir — sinyal bağlantısı kopma riski taşımaz.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Space tuşuna basınca lazer sesi duyuluyor
- ✅ Düşman vurulunca görsel hemen kayboluyor ve patlama sesi duyuluyor
- ✅ Patlama sesi tamamlandıktan sonra düşman sahneden siliniyor
- ✅ Düşman bize çarpınca hasar sesi duyuluyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `AudioStreamPlayer` node'u ile ses efektleri ekledik
- Lazer, patlama ve hasar seslerini ilgili sahnelere bağladık
- `finished` sinyali ile ses tamamlanana kadar düşmanı sahnede tuttuk
- `set_deferred` ile çarpışma alanını güvenli şekilde devre dışı bıraktık

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='kZCoYhgYquk' %}

---

## Sıradaki Bölüm

**Bölüm 9'da** oyun arayüzünü oluşturacağız. Skor ve can bilgisini ekranda göstereceğiz. `Label`, `ProgressBar` ve `CanvasLayer` node'larıyla tanışacağız.

Görüşmek üzere! 🚀
