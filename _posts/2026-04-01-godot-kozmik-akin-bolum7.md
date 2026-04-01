---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 7: Can ve Skor Sistemi"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, autoload, singleton, skor, can, sinyal, game_manager, hitbox, print debugging]
description: "Autoload ile GameManager singleton oluşturuyoruz. Skor ve can sistemi kuruluyor, özel sinyaller tanımlanıyor ve düşman çarpışması Player'a bağlanıyor."
permalink: /godot-kozmik-akin-bolum-7/
published: true
---

# Kozmik Akın — Bölüm 7: Can ve Skor Sistemi

Önceki bölümde mermiler düşmanları yok etti. Ama oyunun hâlâ bir amacı yok — ne skor var ne de kaybetme koşulu. Bu bölümde can ve skor sistemini kuracağız. Düşman bize çarptığında can azalacak, düşman yok ettiğimizde skor artacak, can sıfırlandığında oyun bitecek.

Bunun için Godot'un **Autoload** sistemini öğreneceğiz. Oyun durumunu tüm sahnelerden erişilebilir tek bir yerden yöneteceğiz.

---

## Autoload Nedir?

Şu ana kadar her script kendi sahnesine aitti. `player.gd` yalnızca Player'a, `enemy.gd` yalnızca Enemy'e aitti. Peki skor ve can bilgisi hangi sahneye ait olmalı?

Ne Player'a ne Enemy'e ne de Main'e — çünkü bu bilgiye hepsi ihtiyaç duyacak.

Godot'ta bunun için **Autoload** sistemi var. Autoload, oyun başladığında otomatik yüklenen ve tüm sahnelerden erişilebilen özel bir script'tir. Buna **Singleton** da denir — oyun boyunca tek bir örneği vardır, silinmez, değişmez.

---

## GameManager Script'ini Oluşturalım

Önce script dosyasını oluşturalım.

**FileSystem** panelinde `res://scripts/` klasörüne sağ tıklayın ve **"New Script"** seçin. Dosya adını `game_manager.gd` yapın.

Tüm içeriği silip şunu yazın:
```gdscript
extends Node

var score = 0
var health = 3

signal score_changed(new_score)
signal health_changed(new_health)
signal game_over

func add_score(amount: int) -> void:
	score += amount
	score_changed.emit(score)
	print("Skor: ", score)

func take_damage(amount: int) -> void:
	health -= amount
	health_changed.emit(health)
	print("Can: ", health)

	if health <= 0:
		health = 0
		game_over.emit()
		print("Oyun bitti!")

func reset() -> void:
	score = 0
	health = 3
```

Kodu inceleyelim:

**`var score = 0`**
Oyuncunun mevcut skorunu tutar.

**`var health = 3`**
Oyuncunun mevcut canını tutar. Üç candan başlıyoruz.

**`signal score_changed(new_score)`**
**`signal health_changed(new_health)`**
**`signal game_over`**
Kendi sinyallerimizi tanımlıyoruz. Skor ya da can değiştiğinde ilgili sinyali yayacağız. Bölüm 9'da bu sinyalleri UI'a bağlayacağız.

**`func add_score(amount: int) -> void:`** içinde;

**`score += amount`**
Skora belirtilen miktarı ekler.

**`score_changed.emit(score)`**
`score_changed` sinyalini yeni skor değeriyle yayar. "Skor değişti, yeni değer bu" demek.

**`print("Skor: ", score)`**
Mevcut skoru Godot'un **Output** konsoluna yazdırır. Oyunu test ederken skor değişimini buradan takip edebiliriz.

**`func take_damage(amount: int) -> void:`** içinde;

**`health -= amount`**
Candan belirtilen miktarı çıkarır.

**`health_changed.emit(health)`**
`health_changed` sinyalini yeni can değeriyle yayar.

**`print("Can: ", health)`**
Mevcut can değerini Output konsoluna yazdırır.

**`if health <= 0:`**
Can sıfırın altına düşerse...

**`health = 0`**
...can değerini sıfırda sabitliyoruz. Eksi değer olmasın.

**`game_over.emit()`**
Oyun bitti sinyalini yayıyoruz. Bölüm 11'de bu sinyali game over ekranına bağlayacağız.

**`print("Oyun bitti!")`**
Oyunun bittiğini Output konsoluna yazdırır.

**`func reset() -> void:`** içinde;

**`score = 0`**
**`health = 3`**
Oyun yeniden başladığında skor ve canı sıfırlıyoruz. Bölüm 11'de kullanacağız.

> 💡 **print() nedir?**
> Godot'ta `print()` fonksiyonu değer ve mesajları editörün alt kısmındaki **Output** konsoluna yazdırır. Ekranda görünmez, yalnızca geliştirici görür. Kodun doğru çalışıp çalışmadığını anlamanın en hızlı yoludur. Profesyonel geliştirmede buna **print debugging** denir. Bölüm 9'da UI hazır olduğunda bu `print` satırlarını kaldırabiliriz.

---

## Autoload Olarak Tanımlayalım

Script hazır ama henüz Autoload değil. Bunu Godot'a tanıtmamız gerekiyor.

**Project → Project Settings → Globals** sekmesine gelin:

1. **Path** alanına `res://scripts/game_manager.gd` yazın ya da sağdaki klasör ikonundan seçin
2. **Node Name** alanına `GameManager` yazın
3. **"Add"** butonuna tıklayın

Listede `GameManager` göründü. Artık oyunun her yerinden `GameManager.score` ya da `GameManager.health` şeklinde erişebilirsiniz.

---

## Enemy Düşmana Çarptığında Skor Ekleyelim

`res://scripts/enemy.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Area2D

const SPEED = 200.0
const SCORE_VALUE = 10

func _ready() -> void:
	area_entered.connect(_on_area_entered)

func _physics_process(delta: float) -> void:
	position.y += SPEED * delta

	if position.y > 800:
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	GameManager.add_score(SCORE_VALUE)
	area.queue_free()
	queue_free()
```

Yeni eklenen kısımları inceleyelim:

**`const SCORE_VALUE = 10`**
Her düşman yok edildiğinde eklenecek skor miktarı.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`GameManager.add_score(SCORE_VALUE)`**
`GameManager` Autoload olduğu için herhangi bir `@onready` ya da referans tanımlamadan direkt erişebiliyoruz. `add_score` fonksiyonunu çağırarak skora 10 ekliyoruz.

---

## Player Sahnesine HitBox Ekleyelim

`area_entered` sinyali yalnızca `Area2D` node'larında bulunur, `CharacterBody2D`'de yoktur. Bu yüzden Player sahnesine ayrı bir `Area2D` node'u ekleyeceğiz ve çarpışmayı oradan dinleyeceğiz.

`res://scenes/player.tscn` dosyasını açın:

1. `Player` node'u seçiliyken **"+"** butonuyla `Area2D` ekleyin
2. Adını `HitBox` yapın
3. `HitBox` seçiliyken **"+"** ile `CollisionShape2D` ekleyin
4. **Inspector'da** Shape alanından **"New RectangleShape2D"** seçin ve gemiye uyacak şekilde ayarlayın
5. `HitBox` node'unu seçin, **Inspector → Collision** bölümünde:
   - **Layer:** Yalnızca `player` katmanını açın
   - **Mask:** Yalnızca `enemy` katmanını açın

Sahne yapısı şöyle olmalı:
```
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
├── FirePoint (Marker2D)
└── HitBox (Area2D)
    └── CollisionShape2D
```

---

## Düşman Oyuncuya Çarptığında Can Azalsın

`res://scripts/player.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0
const BULLET_SCENE = preload("res://scenes/bullet.tscn")
const FIRE_RATE = 0.2

var can_shoot = true

@onready var fire_point = $FirePoint
@onready var hit_box = $HitBox

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
	await get_tree().create_timer(FIRE_RATE).timeout
	can_shoot = true

func _on_area_entered(area: Area2D) -> void:
	GameManager.take_damage(1)
	area.queue_free()

func _input(event: InputEvent) -> void:
	pass
```

Yeni eklenen kısımları inceleyelim:

**`@onready var hit_box = $HitBox`**
`HitBox` node'una script içinden erişmek için referans oluşturuyoruz.

**`func _ready() -> void:`** içinde;

**`hit_box.area_entered.connect(_on_area_entered)`**
Sinyali `CharacterBody2D`'den değil, `HitBox` Area2D node'undan dinliyoruz.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`GameManager.take_damage(1)`**
Düşman bize çarptığında `GameManager`'a "1 hasar al" diyoruz. Can 0'a düştüğünde `GameManager` otomatik olarak `game_over` sinyalini yayacak.

**`area.queue_free()`**
Çarpan düşmanı sahneden siliyoruz. Düşman bize çarptı, amacına ulaştı.

> 💡 Player'ı silmiyoruz — can sistemi olduğu için oyuncu ölmüyor, hasar alıyor. Oyun bitmeden ekrandan kaybolmamalı.

---

## Test Edelim

`F5` tuşuna basın. Godot editörünün alt kısmındaki **Output** sekmesini açık tutun. Şunları kontrol edin:

- ✅ Düşman yok ettiğimizde Output'ta `Skor: 10`, `Skor: 20` şeklinde artan değerler görünüyor
- ✅ Düşman bize çarptığında Output'ta `Can: 2`, `Can: 1` şeklinde azalan değerler görünüyor
- ✅ 3 düşman çarptıktan sonra Output'ta `Oyun bitti!` yazısı çıkıyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `Autoload` ile `GameManager` singleton'ı oluşturduk
- Skor ve can değişkenlerini merkezi olarak yönettik
- Özel sinyal tanımlamayı öğrendik — `signal score_changed`, `signal health_changed`, `signal game_over`
- Player sahnesine `HitBox` ekleyerek düşman çarpışmasını doğru şekilde dinledik
- Düşman yok edilince skor, düşman çarpınca can azalmasını sağladık
- `print()` ile Output konsoluna debug mesajları yazdırmayı öğrendik

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='0h9ovgCXJZ4' %}

---

## Sıradaki Bölüm

**Bölüm 8'de** ses ve efektler ekleyeceğiz. Ateş sesi, patlama animasyonu ve çarpışma efekti ile oyun çok daha canlı hale gelecek.

Görüşmek üzere! 🚀
