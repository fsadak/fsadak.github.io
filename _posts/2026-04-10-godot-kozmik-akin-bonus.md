---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bonus: Oyunu Geliştirelim"
date: 2026-04-10 10:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, audio bus, seviye sistemi, patlama animasyonu, çift namlu, animatedsprite2d, progression]
description: "Kozmik Akın'a arka plan müziği, ses/müzik kontrolleri, seviye sistemi, kaçan düşman cezası, çift namlulu gemi ve patlama animasyonu ekliyoruz."
permalink: /godot-kozmik-akin-bonus/
published: true
---

# Kozmik Akın — Bonus Bölüm: Oyunu Geliştirelim

Ana seriyi tamamladınız! Bu bonus bölümde oyunumuzu daha zengin ve profesyonel hale getireceğiz. Sırasıyla şunları ekleyeceğiz:

- 🎵 Arka plan müziği ve ses/müzik kontrolleri
- 📈 Seviye sistemi ve düşman hızı artışı
- 💀 Kaçan düşman ceza puanı
- 🚀 5. seviyede çift namlulu gemi
- 💥 Patlama animasyonu

---

## 1. Ses Bus Sistemini Kuralım

Şu ana kadar tüm sesler aynı kanaldan çıkıyordu. Müzik ve ses efektlerini ayrı ayrı kontrol edebilmek için Godot'un **Audio Bus** sistemini kullanacağız.

Ekranın en altındaki ** Output ** sekmesi ile başlayan bölümden **Audio ** sekmesini seçin.

Varsayılan olarak yalnızca `Master` bus'ı var. İki yeni bus ekleyelim:

1. **"Add Bus"** butonuna tıklayın — yeni bir bus oluştu
2. Bus adını `Music` olarak değiştirin
3. **"Add Bus"** butonuna tekrar tıklayın
4. Bus adını `SFX` olarak değiştirin

Her iki bus'ın da en altındaki aşağı açılır seçenekten Master`'a bağlı olduğunu kontrol edin.

> 💡 **Audio Bus nedir?**
> Godot'ta sesler bir mikser masasından geçer gibi "bus" adı verilen kanallardan geçer. Her `AudioStreamPlayer` hangi bus'a bağlı olduğunu belirleyebilir. Bus'ı susturduğumuzda o kanaldaki tüm sesler susar — tek tek her sesi kapatmak zorunda kalmayız.

---

## 2. Mevcut Ses Node'larını Bus'lara Bağlayalım

### Player sahnesi

`res://scenes/player.tscn` dosyasını açın.

`LaserSound` node'unu seçin → **Inspector → Bus** alanını `SFX` yapın.
`CollisionSound` node'unu seçin → **Inspector → Bus** alanını `SFX` yapın.

### Enemy sahnesi

`res://scenes/enemy.tscn` dosyasını açın.

`ExplosionSound` node'unu seçin → **Inspector → Bus** alanını `SFX` yapın.

---

## 3. GameManager'ı Güncelleyelim

`res://scripts/game_manager.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Node

var score = 0
var health = 3
var current_level = 1

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250]
const LEVEL_SPEEDS = [200, 220, 245, 270, 300, 330, 365, 400, 440, 480]

signal score_changed(new_score)
signal health_changed(new_health)
signal level_changed(new_level)
signal game_over

var music_player: AudioStreamPlayer

func _ready() -> void:
	music_player = AudioStreamPlayer.new()
	music_player.stream = load("res://assets/sounds/music.wav")
	music_player.bus = "Music"
	music_player.volume_db = -10.0
	music_player.autoplay = false
	add_child(music_player)

func play_music() -> void:
	if not music_player.playing:
		music_player.play()

func stop_music() -> void:
	music_player.stop()

func set_music_mute(muted: bool) -> void:
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Music"), muted)

func set_sfx_mute(muted: bool) -> void:
	AudioServer.set_bus_mute(AudioServer.get_bus_index("SFX"), muted)

func get_enemy_speed() -> float:
	return LEVEL_SPEEDS[current_level - 1]

func add_score(amount: int) -> void:
	score += amount
	if score < 0:
		score = 0
	score_changed.emit(score)
	_check_level()

func _check_level() -> void:
	for i in range(LEVEL_THRESHOLDS.size() - 1, -1, -1):
		if score >= LEVEL_THRESHOLDS[i]:
			if current_level != i + 1:
				current_level = i + 1
				level_changed.emit(current_level)
			break

func take_damage(amount: int) -> void:
	health -= amount
	if health <= 0:
		health = 0
		health_changed.emit(health)
		game_over.emit()
	else:
		health_changed.emit(health)

func reset() -> void:
	score = 0
	health = 3
	current_level = 1
```

Yeni eklenen kısımları inceleyelim:

**`const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250]`**
10 elemanlı bir dizi. Her eleman bir seviyenin başladığı puan eşiği. İndeks 0 = Seviye 1, İndeks 9 = Seviye 10.

**`const LEVEL_SPEEDS = [200, 220, 245, 270, 300, 330, 365, 400, 440, 480]`**
10 elemanlı bir dizi. Her eleman o seviyedeki düşman hızı. `LEVEL_THRESHOLDS` ile birebir eşleşir.

**`func _ready() -> void:`** içinde;

**`music_player = AudioStreamPlayer.new()`**
Kod ile yeni bir `AudioStreamPlayer` oluşturuyoruz. Sahnede görünmez ama `GameManager` Autoload olduğu için oyun boyunca yaşar.

**`music_player.bus = "Music"`**
Müzik player'ı `Music` bus'ına bağlıyoruz.

**`music_player.volume_db = -10.0`**
Müzik ses seviyesini biraz düşürüyoruz. `0.0` tam ses, `-10.0` biraz daha sessiz — ses efektleri müziğin önüne geçsin diye.

**`func play_music() -> void:`** içinde;

**`if not music_player.playing:`**
Müzik zaten çalıyorsa tekrar başlatmıyoruz. Bu kontrol olmasaydı her sahne geçişinde müzik başa sarardı.

**`func set_music_mute(muted: bool) -> void:`** içinde;

**`AudioServer.set_bus_mute(AudioServer.get_bus_index("Music"), muted)`**
`AudioServer` Godot'un ses sistemine doğrudan erişim sağlar. `get_bus_index("Music")` `Music` adlı bus'ın sıra numarasını bulur. `set_bus_mute` ise o bus'ı susturur ya da açar.

**`func get_enemy_speed() -> float:`** içinde;

**`return LEVEL_SPEEDS[current_level - 1]`**
`current_level` 1'den başlar ama diziler 0'dan başlar. Bu yüzden `current_level - 1` ile doğru indekse erişiyoruz. Seviye 1 → İndeks 0 → Hız 200. Seviye 5 → İndeks 4 → Hız 300.

**`func add_score(amount: int) -> void:`** içinde;

**`score += amount`**
`amount` pozitif olabilir (düşman vurma: +10) ya da negatif (kaçan düşman: -5). Aynı fonksiyon her ikisini de yönetir.

**`if score < 0: score = 0`**
Skor eksi değere düşmesin. Örneğin skor 3 iken düşman kaçsa 3 + (-5) = -2 olurdu, bunu 0'da tutuyoruz.

**`score_changed.emit(score)`**
HUD'a yeni skoru bildiriyoruz.

**`_check_level()`**
Skor değiştikten sonra seviye kontrolü yapıyoruz.

**`func _check_level() -> void:`** içinde;

**`for i in range(LEVEL_THRESHOLDS.size() - 1, -1, -1):`**

Bu satırı parçalayalım:

`LEVEL_THRESHOLDS.size()` dizinin eleman sayısını döndürür → `10`

`range()` fonksiyonu üç parametre alır:
- **Başlangıç:** `LEVEL_THRESHOLDS.size() - 1` → `9` (son indeks)
- **Bitiş:** `-1` (bu değere ulaşınca dur, ama dahil etme)
- **Adım:** `-1` (her adımda 1 azalt, yani geriye git)

Yani `i` değerleri sırayla şöyle gelir: `9, 8, 7, 6, 5, 4, 3, 2, 1, 0`

**Neden sondan başa gidiyoruz?**
En yüksek eşiği önce kontrol etmek için. Skor 600 iken baştan tarısak önce Seviye 1 eşiğini (0) bulur ve orada kalırdık. Sondan tarayınca ilk eşleşen en yüksek seviyedir.

**`if score >= LEVEL_THRESHOLDS[i]:`**
Mevcut skor bu eşiğe ulaştı mı?

**`if current_level != i + 1:`**
Zaten bu seviyedeysek sinyal yayma. `i` 0 tabanlı indeks, seviye 1 tabanlı — bu yüzden `i + 1`.

**`level_changed.emit(current_level)`**
Yeni seviyeyi HUD'a ve Player'a bildiriyoruz.

**`break`**
İlk eşleşen en yüksek seviyeyi bulduk, döngüyü durdurup çıkıyoruz.

---

## 4. Müziği Ana Menü ve Oyun Sahnesine Bağlayalım

`res://scripts/main_menu.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Control

@onready var play_button = $PlayButton

func _ready() -> void:
	play_button.pressed.connect(_on_play_button_pressed)
	GameManager.play_music()

func _on_play_button_pressed() -> void:
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
```

**`func _ready() -> void:`** içinde;

**`GameManager.play_music()`**
Ana menü açılır açılmaz müzik başlıyor. `play_music()` içindeki `if not music_player.playing` kontrolü sayesinde müzik zaten çalıyorsa tekrar başlamıyor — sahne geçişlerinde müzik kesintisiz devam ediyor.

---

## 5. Ana Menüye Ses Kontrolleri Ekleyelim

`res://scenes/main_menu.tscn` dosyasını açın.

**Müzik butonu:**

1. `MainMenu` node'u seçiliyken **"+"** butonuyla `CheckButton` ekleyin
2. Adını `MusicButton` yapın
3. **Inspector → Text** alanına `🎵 Müzik` yazın
4. **Inspector → Button Pressed** alanını `On` yapın
5. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `22` yazın
6. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `150` |
| Y | `530` |

**Ses Efektleri butonu:**

1. `MainMenu` node'u seçiliyken **"+"** butonuyla `CheckButton` ekleyin
2. Adını `SFXButton` yapın
3. **Inspector → Text** alanına `🔊 Ses Efektleri` yazın
4. **Inspector → Button Pressed** alanını `On` yapın
5. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `22` yazın
6. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `120` |
| Y | `580` |

Sahne yapısı şöyle olmalı:
```
MainMenu (Control)
├── ColorRect
├── TitleLabel (Label)
├── PlayButton (Button)
├── MusicButton (CheckButton)
└── SFXButton (CheckButton)
```

`res://scripts/main_menu.gd` dosyasını şu şekilde güncelleyin:
```gdscript
extends Control

@onready var play_button = $PlayButton
@onready var music_button = $MusicButton
@onready var sfx_button = $SFXButton

func _ready() -> void:
	play_button.pressed.connect(_on_play_button_pressed)
	music_button.toggled.connect(_on_music_toggled)
	sfx_button.toggled.connect(_on_sfx_toggled)
	GameManager.play_music()

func _on_play_button_pressed() -> void:
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main.tscn")

func _on_music_toggled(pressed: bool) -> void:
	GameManager.set_music_mute(!pressed)

func _on_sfx_toggled(pressed: bool) -> void:
	GameManager.set_sfx_mute(!pressed)
```

**`func _on_music_toggled(pressed: bool) -> void:`** içinde;

**`GameManager.set_music_mute(!pressed)`**
`CheckButton` açıksa `pressed = true` gelir — müzik çalmalı yani mute olmamalı. `!pressed` ile durumu tersine çeviriyoruz.

---

## 6. HUD'a Seviye Göstergesi Ekleyelim

`res://scenes/hud.tscn` dosyasını açın:

1. `HUD` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `LevelLabel` yapın
3. **Inspector → Text** alanına `Seviye: 1` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `24` yazın
5. **Inspector → Horizontal Alignment** → `Center` seçin
6. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `170` |
| Y | `10` |

`res://scripts/hud.gd` dosyasını şu şekilde güncelleyin:
```gdscript
extends CanvasLayer

@onready var score_label = $ScoreLabel
@onready var health_label = $HealthLabel
@onready var level_label = $LevelLabel

func _ready() -> void:
	GameManager.score_changed.connect(_on_score_changed)
	GameManager.health_changed.connect(_on_health_changed)
	GameManager.level_changed.connect(_on_level_changed)

func _on_score_changed(new_score: int) -> void:
	score_label.text = "Skor: " + str(new_score)

func _on_health_changed(new_health: int) -> void:
	health_label.text = "Can: " + str(new_health)

func _on_level_changed(new_level: int) -> void:
	level_label.text = "Seviye: " + str(new_level)
```

---

## 7. Kaçan Düşman Cezasını ve Düşman Script'ini Güncelleyelim

Önceki versiyonda birkaç sorun vardı:

- Ekrana girmeden vurulabilen düşmanlar patlama animasyonu olmadan yok oluyordu
- Patlama animasyonu loop modunda çalışıyordu
- Vurulmuş düşman hareket ettiği için ekran dışına çıkınca hem +10 hem -5 puan hesaplanıyor, net +5 görünüyordu

Tüm bunları `is_dead` bayrağı ile çözüyoruz.

`res://scripts/enemy.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Area2D

const SCORE_VALUE = 10
const ESCAPE_PENALTY = -5

var speed = 200.0
var is_dead = false

@onready var explosion_sound = $ExplosionSound
@onready var explosion_anim = $ExplosionAnim

func _ready() -> void:
	area_entered.connect(_on_area_entered)
	speed = GameManager.get_enemy_speed()
	explosion_anim.sprite_frames.set_animation_loop("explosion", false)
	explosion_anim.animation_finished.connect(queue_free)

func _physics_process(delta: float) -> void:
	if is_dead:
		return
	position.y += speed * delta
	if position.y > 800:
		GameManager.add_score(ESCAPE_PENALTY)
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	if is_dead:
		return
	if position.y < 0:
		return
	is_dead = true
	GameManager.add_score(SCORE_VALUE)
	area.queue_free()
	$Sprite2D.visible = false
	$CollisionShape2D.set_deferred("disabled", true)
	explosion_anim.visible = true
	explosion_anim.play("explosion")
	explosion_sound.play()
```

Yeni eklenen kısımları inceleyelim:

**`var is_dead = false`**
Düşmanın vurulup vurulmadığını tutan bayrak. `true` olunca hareket durur ve ikinci çarpışma engellenir.

**`func _ready() -> void:`** içinde;

**`explosion_anim.sprite_frames.set_animation_loop("explosion", false)`**
Patlama animasyonunun tekrar etmemesini sağlıyoruz. Bu ayar kod ile yapılmazsa editörde varsayılan olarak loop açık gelir ve animasyon sürekli döner.

**`explosion_anim.animation_finished.connect(queue_free)`**
Animasyon bir kez oynadıktan sonra düşmanı sahneden siliyoruz.

**`func _physics_process(delta: float) -> void:`** içinde;

**`if is_dead: return`**
Düşman vurulduysa hareketi tamamen durduruyoruz. Patlama animasyonu yerinde oynayacak, ekran dışına çıkmaya devam etmeyecek.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`if is_dead: return`**
Düşman zaten vurulmuşsa ikinci bir çarpışmayı yok sayıyoruz.

**`if position.y < 0: return`**
Düşman henüz ekrana girmemişse çarpışmayı yok sayıyoruz. Spawn noktası `-50` olduğu için ilk anlarda görünmeden vurulabiliyordu — bu kontrol bunu engelliyor.

**`is_dead = true`**
Bayrağı kapatıyoruz. Artık hareket etmez, tekrar çarpışma algılanmaz.

---

## 8. Çift Namlulu Gemiyi Ekleyelim

### FirePoint Konumunu Düzeltelim

Tek namlulu modda gemi ortasından ateş etmeli. `res://scenes/player.tscn` dosyasını açın, `FirePoint` node'unu seçin ve **Inspector → Transform → Position** alanını kontrol edin:

| Eksen | Değer |
|-------|-------|
| X | `0` |
| Y | `-50` |

### İkinci FirePoint'i Ekleyelim

1. `Player` node'u seçiliyken **"+"** butonuyla `Marker2D` ekleyin
2. Adını `FirePoint2` yapın
3. **Inspector → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `20` |
| Y | `-50` |

> 💡 5. seviyeye geçildiğinde `FirePoint` X değeri kod ile `-37`'ye taşınacak, `FirePoint2` ise `+20`'de kalacak. Böylece iki namlu simetrisi otomatik sağlanıyor.

### İkinci Sprite Ekleyelim

1. `Player` node'u seçiliyken **"+"** butonuyla `Sprite2D` ekleyin
2. Adını `Sprite2DLevel5` yapın
3. **Inspector → Texture** alanına `res://assets/sprites/SpaceShip_2.png` sürükleyin
4. **Inspector → Visible** alanını `Off` yapın — başlangıçta gizli

Sahne yapısı şöyle olmalı:
```
Player (CharacterBody2D)
├── Sprite2D
├── Sprite2DLevel5
├── CollisionShape2D
├── FirePoint (Marker2D)
├── FirePoint2 (Marker2D)
├── HitBox (Area2D)
│   └── CollisionShape2D
├── LaserSound (AudioStreamPlayer)
└── CollisionSound (AudioStreamPlayer)
```

`res://scripts/player.gd` dosyasını şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0
const BULLET_SCENE = preload("res://scenes/bullet.tscn")
const FIRE_RATE = 0.2

var can_shoot = true
var is_double_gun = false

@onready var fire_point = $FirePoint
@onready var fire_point2 = $FirePoint2
@onready var hit_box = $HitBox
@onready var laser_sound = $LaserSound
@onready var collision_sound = $CollisionSound
@onready var sprite_normal = $Sprite2D
@onready var sprite_level5 = $Sprite2DLevel5

func _ready() -> void:
	hit_box.area_entered.connect(_on_area_entered)
	GameManager.level_changed.connect(_on_level_changed)

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
	_spawn_bullet(fire_point.global_position)
	if is_double_gun:
		_spawn_bullet(fire_point2.global_position)
	laser_sound.play()
	await get_tree().create_timer(FIRE_RATE).timeout
	can_shoot = true

func _spawn_bullet(pos: Vector2) -> void:
	var bullet = BULLET_SCENE.instantiate()
	bullet.position = pos
	get_parent().add_child(bullet)

func _on_area_entered(area: Area2D) -> void:
	collision_sound.play()
	GameManager.take_damage(1)
	area.queue_free()

func _on_level_changed(new_level: int) -> void:
	if new_level >= 5 and not is_double_gun:
		is_double_gun = true
		fire_point.position.x = -37
		sprite_normal.visible = false
		sprite_level5.visible = true

func _input(event: InputEvent) -> void:
	pass
```

Yeni eklenen kısımları inceleyelim:

**`var is_double_gun = false`**
Çift namlu aktif mi değil mi diye tutan bayrak.

**`func shoot() -> void:`** içinde;

**`_spawn_bullet(fire_point.global_position)`**
Mermi oluşturmayı `_spawn_bullet` adlı ayrı bir fonksiyona taşıdık. Kod tekrarını önler.

**`if is_double_gun: _spawn_bullet(fire_point2.global_position)`**
Çift namlu aktifse ikinci `FirePoint`'ten de mermi çıkarıyoruz.

**`func _spawn_bullet(pos: Vector2) -> void:`** içinde;

**`bullet.position = pos`**
Hangi konumdan çağrıldıysa mermiyi oraya yerleştiriyoruz.

**`func _on_level_changed(new_level: int) -> void:`** içinde;

**`if new_level >= 5 and not is_double_gun:`**
5. seviyeye ilk geçişte çift namluu aktif ediyoruz. `not is_double_gun` kontrolü sayesinde her seviye atlayışında tekrar tetiklenmiyor.

**`fire_point.position.x = -37`**
`FirePoint`'i merkezden sola kaydırıyoruz. `FirePoint2` zaten `+20`'de. İki namlu simetrik konuma geldi.

---

## 9. Patlama Animasyonunu Ekleyelim

`res://scenes/enemy.tscn` dosyasını açın:

1. `Enemy` node'u seçiliyken **"+"** butonuyla `AnimatedSprite2D` ekleyin
2. Adını `ExplosionAnim` yapın
3. **Inspector → Visible** alanını `Off` yapın

### Animasyon Karelerini Ekleyelim

`ExplosionAnim` node'u seçili haldeyken **Inspector → Sprite Frames** alanına tıklayın ve **"New SpriteFrames"** seçin. Ardından **"SpriteFrames"** üzerine tıklayarak editörü açın.

Editörün alt kısmında **SpriteFrames** paneli açıldı:

1. Varsayılan animasyonun adını `explosion` olarak değiştirin
2. **FPS** değerini `24` yapın
3. **FileSystem** panelinden `spaceEffects_001.png` ile `spaceEffects_018.png` arasındaki 18 dosyayı sırasıyla seçip **SpriteFrames** paneline sürükleyin

Sahne yapısı şöyle olmalı:
```
Enemy (Area2D)
├── Sprite2D
├── CollisionShape2D
├── ExplosionSound (AudioStreamPlayer)
└── ExplosionAnim (AnimatedSprite2D)
```

> 💡 Animasyon loop ayarını editörde kapatmak yerine `enemy.gd` script'inde `set_animation_loop("explosion", false)` ile kod üzerinden kapatıyoruz. Bu daha güvenilir çünkü editör ayarı sahne kopyalanırken kaybolabilir.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Ana menüde müzik çalıyor
- ✅ Müzik ve Ses Efektleri butonları çalışıyor
- ✅ Oyun boyunca müzik kesintisiz devam ediyor
- ✅ HUD'da seviye göstergesi görünüyor
- ✅ Puan arttıkça seviye yükseliyor
- ✅ Düşmanlar her seviyede biraz daha hızlı geliyor
- ✅ Ekrana girmeden vurulabilen düşmanlar artık hasar vermiyor
- ✅ Kaçan düşman -5 puan yapıyor, vurduğumuz düşman +10 puan veriyor
- ✅ 5. seviyede gemi değişiyor, `FirePoint` sola kayıyor ve çift namlu aktif oluyor
- ✅ Düşman vurulunca patlama animasyonu bir kez oynuyor ve düşman siliniyor
- ✅ Patlama animasyonu yerinde oynuyor, hareket etmiyor

---

## Bonus Bölüm Özeti

Bu bonus bölümde şunları yaptık:

- Audio Bus sistemi ile müzik ve ses efektlerini ayrı kanallara ayırdık
- `AudioServer` ile bus'ları susturup açtık
- Ana menüye müzik ve ses kontrol butonları ekledik
- 10 seviyeli progression sistemi kurduk
- `is_dead` bayrağı ile düşman çarpışma ve hareket sorunlarını çözdük
- `set_animation_loop` ile patlama animasyonunun tekrar etmesini engelledik
- Ekrana girmeden vurulma sorununu `position.y < 0` kontrolü ile çözdük
- 5. seviyede `FirePoint` konumunu kaydırarak çift namluu simetrik hale getirdik

---

## Buradan Nereye?

Kozmik Akın'ı sıfırdan bitirdik. Bundan sonra neler yapılabilir?

- 🌟 **Yüksek skor tablosu** — en iyi skoru kaydetme
- 🛡️ **Kalkan sistemi** — geçici dokunulmazlık
- 🎨 **Arka plan parallax** — kayan yıldız efekti
- 📱 **Mobil export** — Android'e taşıma
- 🏆 **Farklı düşman tipleri** — farklı hareket örüntüleri

Godot'ta öğrenme yolculuğunuz burada bitmiyor — bu sadece başlangıç! 🚀
