---
title: "Godot Engine Oyun Mekanikleri - Bölüm 7: Candy Blast — Skor, Hamle Sayacı ve Seviye Sistemi"
date: 2026-03-28 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-7/
published: true
---

Bu bölümde oyunumuza puan sistemi, hamle limiti, seviye hedefi ve game over/yeni seviye mantığını ekleyeceğiz. Ayrıca ekrana skor, hamle ve seviye bilgilerini gösteren basit bir UI oluşturacağız.

**Bu bölümde eklenecekler:**

- Her eşleşmede ve bonus aktivasyonunda puan kazanma
- Sınırlı hamle sayısı
- Seviye hedef puanı
- Hedefe ulaşılırsa → yeni seviye (sonsuz)
- Hamle biterse → game over
- UI: Skor, hamle, seviye ve hedef bilgisi

---

## 7.1 — Sahne Yapısını Güncelleme

UI elemanları için sahneye Label node'ları eklememiz gerekiyor. Godot Editor'da:

1. **Game** node'una sağ tıklayın → **Add Child Node** → **Label** seçin
2. Bu Label'ın adını `ScoreLabel` yapın
3. Aynı şekilde 3 Label daha ekleyin: `MovesLabel`, `LevelLabel`, `TargetLabel`
4. Bir tane daha Label ekleyin ve adını `MessageLabel` yapın (game over / level up mesajları için)

Sahne ağacınız şöyle görünmeli:

```
Game (Node2D)
├── Grid (Sprite2D)
├── ScoreLabel (Label)
├── MovesLabel (Label)
├── LevelLabel (Label)
├── TargetLabel (Label)
└── MessageLabel (Label)
```

**Label pozisyonlarını ve ayarlarını** kod ile yapacağız, bu yüzden Inspector'da bir şey ayarlamanıza gerek yok.

---

## 7.2 — Yeni Sabitler ve Değişkenler

**Sabitler bölümüne** (`BONUS_TYPES` satırının altına) şunları ekleyin:

```gdscript
const BASE_MOVES := 20
const BASE_TARGET := 1000
const TARGET_INCREMENT := 500
```

**Değişkenler bölümüne** (`last_swap` satırının altına) şunları ekleyin:

```gdscript
var score := 0
var moves_left := BASE_MOVES
var level := 1
var target_score := BASE_TARGET
```

**Açıklama:**

- `BASE_MOVES` — Her seviyede başlangıç hamle sayısı (20)
- `BASE_TARGET` — İlk seviyenin hedef puanı (1000)
- `TARGET_INCREMENT` — Her seviyede hedefin ne kadar artacağı (+500)
- `score` — Mevcut puan
- `moves_left` — Kalan hamle sayısı
- `level` — Mevcut seviye
- `target_score` — Bu seviyenin hedef puanı

---

## 7.3 — UI Kurulumu

Label'ları kod ile konumlandıracağız. **`_ready()` fonksiyonunu** güncelleyin:

```gdscript
func _ready() -> void:
	_load_textures()
	_init_grid()
	_draw_candies()
	_setup_ui()
```

Şimdi `_setup_ui()` fonksiyonunu yazalım. **`_draw_candies()` fonksiyonunun hemen altına** ekleyin:

```gdscript
func _setup_ui() -> void:
	var score_label: Label = $ScoreLabel
	score_label.position = Vector2(20, 10)
	score_label.size = Vector2(260, 40)
	score_label.add_theme_font_size_override("font_size", 24)
	score_label.add_theme_color_override("font_color", Color.WHITE)

	var moves_label: Label = $MovesLabel
	moves_label.position = Vector2(296, 10)
	moves_label.size = Vector2(260, 40)
	moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	moves_label.add_theme_font_size_override("font_size", 24)
	moves_label.add_theme_color_override("font_color", Color.WHITE)

	var level_label: Label = $LevelLabel
	level_label.position = Vector2(20, 50)
	level_label.size = Vector2(260, 35)
	level_label.add_theme_font_size_override("font_size", 20)
	level_label.add_theme_color_override("font_color", Color.YELLOW)

	var target_label: Label = $TargetLabel
	target_label.position = Vector2(296, 50)
	target_label.size = Vector2(260, 35)
	target_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	target_label.add_theme_font_size_override("font_size", 20)
	target_label.add_theme_color_override("font_color", Color.YELLOW)

	var message_label: Label = $MessageLabel
	message_label.position = Vector2(0, 400)
	message_label.size = Vector2(576, 80)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	message_label.add_theme_font_size_override("font_size", 36)
	message_label.add_theme_color_override("font_color", Color.WHITE)
	message_label.text = ""

	_update_ui()
```

Bu fonksiyon her Label'ın pozisyonunu, boyutunu, font büyüklüğünü ve rengini ayarlar.

**Label düzeni:**

```
┌──────────────────────────────────┐
│ Skor: 0          Hamle: 20       │  ← Üst satır (beyaz, 24px)
│ Seviye: 1        Hedef: 1000     │  ← Alt satır (sarı, 20px)
│                                  │
│         [GRID ALANI]             │
│                                  │
│       MESAJ ALANI (36px)         │  ← Ortada, büyük yazı
└──────────────────────────────────┘
```

---

## 7.4 — UI Güncelleme

Label'ları güncel değerlerle dolduran fonksiyon. **`_setup_ui()` fonksiyonunun altına** ekleyin:

```gdscript
func _update_ui() -> void:
	$ScoreLabel.text = "Skor: " + str(score)
	$MovesLabel.text = "Hamle: " + str(moves_left)
	$LevelLabel.text = "Seviye: " + str(level)
	$TargetLabel.text = "Hedef: " + str(target_score)
```

`$ScoreLabel` ifadesi `get_node("ScoreLabel")` kısayoludur. Godot'ta çok sık kullanılır.

---

## 7.5 — Puan Hesaplama

Eşleşme ve bonus aktivasyonlarında puan kazanacağız.

**Puanlama tablosu:**

| Aksiyon | Puan |
|---------|------|
| 3'lü eşleşme | 30 |
| 4'lü eşleşme | 60 |
| 5'li eşleşme | 100 |
| Arrow aktivasyonu | 80 |
| Bomb aktivasyonu | 120 |
| Rainbow aktivasyonu | 200 |
| Zincir bonusu | Her zincir × 1.5 çarpan |

Puan hesaplama fonksiyonunu ekleyelim. **`_update_ui()` fonksiyonunun altına** ekleyin:

```gdscript
var chain_count := 0

func _add_match_score(match_size: int) -> void:
	var base_score := 0
	match match_size:
		3:
			base_score = 30
		4:
			base_score = 60
		_:
			base_score = 100  # 5 ve üzeri

	# Zincir çarpanı: ilk eşleşme 1x, ikinci 1.5x, üçüncü 2.25x...
	var multiplier := pow(1.5, chain_count)
	score += int(base_score * multiplier)
	_update_ui()

func _add_bonus_score(bonus_type: String) -> void:
	var base_score := 0
	match bonus_type:
		"arrow_h", "arrow_v":
			base_score = 80
		"bomb":
			base_score = 120
		"rainbow":
			base_score = 200
	score += base_score
	_update_ui()
```

`chain_count` değişkenini **değişkenler bölümüne** (`target_score` satırının altına) ekleyin:

```gdscript
var chain_count := 0
```

**Açıklama:**

- `pow(1.5, chain_count)` — Üslü çarpan. 0. zincir = 1.0×, 1. zincir = 1.5×, 2. zincir = 2.25× ...
- `int(...)` — Ondalık sonucu tam sayıya çevirir (küsurat atılır)
- Bonus puanı zincir çarpanından etkilenmez, sabit kalır

---

## 7.6 — Hamle Sayacını Entegre Etme

Her takas (swap) bir hamle harcamalı. **`_swap_candies()` fonksiyonunun başına** hamle düşürme ekleyin:

```gdscript
func _swap_candies(cell_a: Vector2i, cell_b: Vector2i) -> void:
	is_animating = true
	last_swap = [cell_a, cell_b]
	moves_left -= 1
	chain_count = 0  # Yeni hamle, zincir sıfırla
	_update_ui()

	# ... geri kalan kod aynı kalır
```

Sadece ilk 3 satırdan sonra `moves_left -= 1`, `chain_count = 0` ve `_update_ui()` ekliyoruz. Fonksiyonun geri kalanı aynen kalır.

---

## 7.7 — Eşleşmelerde Puan Verme

**`_remove_matches()` fonksiyonunda**, hücreleri silme döngüsünden **önce** (3. adım ile 4. adım arasına) puan hesaplaması ekleyin:

Mevcut `# 3. Tüm eşleşen hücreleri topla` bölümünü şununla değiştirin:

```gdscript
	# 3. Puan hesapla
	for i in matches.size():
		if not used_in_intersection.has(i):
			_add_match_score(matches[i].size())
		# Kesişenler zaten bomb bonusu olarak puanlanacak
	chain_count += 1

	# 4. Tüm eşleşen hücreleri topla
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true
```

Burada her eşleşme grubu için boyutuna göre puan veriyoruz. `chain_count` her `_remove_matches` çağrısında artıyor — böylece zincir eşleşmelerde çarpan yükseliyor.

> Not: Adım numaraları kayıyor: eski 3→yeni 3+4, eski 4→yeni 5, eski 5→yeni 6, eski 6→yeni 7.

---

## 7.8 — Bonus Aktivasyonunda Puan

**`_activate_bonus()` fonksiyonuna** puan ekleme:

```gdscript
func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true

	_add_bonus_score(bonus_type)
	_clear_cell(cell)

	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		"arrow_v":
			_activate_arrow_v(cell)
		"bomb":
			_activate_bomb(cell)
		"rainbow":
			_activate_rainbow()

	_apply_gravity_and_fill()
```

Değişiklik: `_clear_cell(cell)` satırından önce `_add_bonus_score(bonus_type)` eklendi.

---

## 7.9 — Seviye Kontrolü ve Game Over

Zincir bittiğinde (artık eşleşme kalmadığında) seviye ve hamle kontrolü yapacağız.

**`_check_chain_matches()` fonksiyonunu** şununla değiştirin:

```gdscript
func _check_chain_matches() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()
	else:
		is_animating = false
		_check_level_status()
```

Şimdi seviye kontrol fonksiyonunu yazalım:

```gdscript
func _check_level_status() -> void:
	if score >= target_score:
		_level_complete()
	elif moves_left <= 0:
		_game_over()

func _level_complete() -> void:
	level += 1
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	# Skoru sıfırlamıyoruz — kümülatif devam eder
	_update_ui()
	_show_message("Seviye " + str(level) + "!")

func _game_over() -> void:
	_show_message("Oyun Bitti!\nSkor: " + str(score))
	is_animating = true  # Girişi engelle

func _show_message(text: String) -> void:
	$MessageLabel.text = text
	# 2 saniye sonra mesajı gizle ve tahtayı yenile
	var tween := create_tween()
	tween.tween_interval(2.0)
	tween.tween_callback(_on_message_finished)

func _on_message_finished() -> void:
	var was_game_over: bool = $MessageLabel.text.begins_with("Oyun")
	$MessageLabel.text = ""
	if was_game_over:
		_restart_game()

func _restart_game() -> void:
	score = 0
	moves_left = BASE_MOVES
	level = 1
	target_score = BASE_TARGET
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false
```

**Açıklamalar:**

- **`_check_level_status()`** — Her zincir bittiğinde çağrılır. Hedef puana ulaşıldıysa seviye atla, hamle bittiyse game over
- **`_level_complete()`** — Seviyeyi artırır, hamleleri sıfırlar, hedefi yükseltir. Skor kümülatif devam eder
- **`_game_over()`** — Mesaj gösterir ve `is_animating = true` ile girişi kilitler
- **`_show_message()`** — 2 saniyelik mesaj gösterir, sonra `_on_message_finished` çağrılır
- **`_on_message_finished()`** — Mesaj game over ise → oyunu yeniden başlat. Seviye atlama ise → sadece mesajı gizle
- **`_restart_game()`** — Tüm değişkenleri sıfırlar, tahtayı yeniden oluşturur

**Seviye atlama akışı:**
```
Hamle yap → eşleşme → puan kazan → zincir biter →
  skor >= hedef? → "Seviye 2!" mesajı → 2 sn → devam
  hamle = 0? → "Oyun Bitti!" mesajı → 2 sn → oyun sıfırla
```

---

## 7.10 — Tam Kod (game.gd)

İşte `game.gd` dosyasının bu bölüm sonundaki tam hali:

```gdscript
extends Node2D

# --- Sabitler ---
const GRID_SIZE := 8
const CELL_SIZE := 64.0
const CANDY_SCALE := 0.63

const GRID_OFFSET := Vector2(24, 225)

const CANDY_TYPES := ["red", "yellow", "blue", "green", "purple"]
const BONUS_TYPES := ["arrow_h", "arrow_v", "bomb", "rainbow"]

const BASE_MOVES := 20
const BASE_TARGET := 1000
const TARGET_INCREMENT := 500

# --- Değişkenler ---
var grid := []
var candy_sprites := []
var candy_textures := {}
var selected_cell := Vector2i(-1, -1)
var is_animating := false
var last_swap := [Vector2i(-1, -1), Vector2i(-1, -1)]

var score := 0
var moves_left := BASE_MOVES
var level := 1
var target_score := BASE_TARGET
var chain_count := 0

func _ready() -> void:
	_load_textures()
	_init_grid()
	_draw_candies()
	_setup_ui()

func _load_textures() -> void:
	for candy_name in CANDY_TYPES:
		var path: String = "res://assets/images/" + candy_name + ".png"
		candy_textures[candy_name] = load(path)
	for bonus_name in BONUS_TYPES:
		var path: String = "res://assets/images/" + bonus_name + ".png"
		candy_textures[bonus_name] = load(path)

func _init_grid() -> void:
	grid.clear()
	for row in GRID_SIZE:
		var grid_row := []
		for col in GRID_SIZE:
			grid_row.append("")
		grid.append(grid_row)

	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var available := CANDY_TYPES.duplicate()
			if col >= 2 and grid[row][col - 1] == grid[row][col - 2]:
				available.erase(grid[row][col - 1])
			if row >= 2 and grid[row - 1][col] == grid[row - 2][col]:
				available.erase(grid[row - 1][col])
			grid[row][col] = available[randi() % available.size()]

func _draw_candies() -> void:
	candy_sprites.clear()
	for child in get_children():
		if child.name != "Grid" and child is not Label:
			child.queue_free()

	for row in GRID_SIZE:
		var sprite_row := []
		for col in GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				sprite_row.append(null)
				continue

			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
			sprite.position = _grid_to_pixel(row, col)
			add_child(sprite)
			sprite_row.append(sprite)
		candy_sprites.append(sprite_row)

func _setup_ui() -> void:
	var score_label: Label = $ScoreLabel
	score_label.position = Vector2(20, 10)
	score_label.size = Vector2(260, 40)
	score_label.add_theme_font_size_override("font_size", 24)
	score_label.add_theme_color_override("font_color", Color.WHITE)

	var moves_label: Label = $MovesLabel
	moves_label.position = Vector2(296, 10)
	moves_label.size = Vector2(260, 40)
	moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	moves_label.add_theme_font_size_override("font_size", 24)
	moves_label.add_theme_color_override("font_color", Color.WHITE)

	var level_label: Label = $LevelLabel
	level_label.position = Vector2(20, 50)
	level_label.size = Vector2(260, 35)
	level_label.add_theme_font_size_override("font_size", 20)
	level_label.add_theme_color_override("font_color", Color.YELLOW)

	var target_label: Label = $TargetLabel
	target_label.position = Vector2(296, 50)
	target_label.size = Vector2(260, 35)
	target_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	target_label.add_theme_font_size_override("font_size", 20)
	target_label.add_theme_color_override("font_color", Color.YELLOW)

	var message_label: Label = $MessageLabel
	message_label.position = Vector2(0, 400)
	message_label.size = Vector2(576, 80)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	message_label.add_theme_font_size_override("font_size", 36)
	message_label.add_theme_color_override("font_color", Color.WHITE)
	message_label.text = ""

	_update_ui()

func _update_ui() -> void:
	$ScoreLabel.text = "Skor: " + str(score)
	$MovesLabel.text = "Hamle: " + str(moves_left)
	$LevelLabel.text = "Seviye: " + str(level)
	$TargetLabel.text = "Hedef: " + str(target_score)

func _add_match_score(match_size: int) -> void:
	var base_score := 0
	match match_size:
		3:
			base_score = 30
		4:
			base_score = 60
		_:
			base_score = 100

	var multiplier := pow(1.5, chain_count)
	score += int(base_score * multiplier)
	_update_ui()

func _add_bonus_score(bonus_type: String) -> void:
	var base_score := 0
	match bonus_type:
		"arrow_h", "arrow_v":
			base_score = 80
		"bomb":
			base_score = 120
		"rainbow":
			base_score = 200
	score += base_score
	_update_ui()

func _grid_to_pixel(row: int, col: int) -> Vector2:
	var x := GRID_OFFSET.x + col * CELL_SIZE + CELL_SIZE / 2
	var y := GRID_OFFSET.y + row * CELL_SIZE + CELL_SIZE / 2
	return Vector2(x, y)

func _pixel_to_grid(pixel: Vector2) -> Vector2i:
	var col := int((pixel.x - GRID_OFFSET.x) / CELL_SIZE)
	var row := int((pixel.y - GRID_OFFSET.y) / CELL_SIZE)
	return Vector2i(row, col)

func _is_valid_cell(cell: Vector2i) -> bool:
	return cell.x >= 0 and cell.x < GRID_SIZE and cell.y >= 0 and cell.y < GRID_SIZE

func _input(event: InputEvent) -> void:
	if is_animating:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var cell := _pixel_to_grid(event.position)
		if _is_valid_cell(cell):
			_on_cell_clicked(cell)

func _on_cell_clicked(cell: Vector2i) -> void:
	if grid[cell.x][cell.y] == "":
		return

	# Bonus şekere tıklandıysa → aktive et
	if BONUS_TYPES.has(grid[cell.x][cell.y]):
		if selected_cell != Vector2i(-1, -1):
			_highlight_cell(selected_cell, false)
			selected_cell = Vector2i(-1, -1)
		_activate_bonus(cell)
		return

	if selected_cell == Vector2i(-1, -1):
		selected_cell = cell
		_highlight_cell(cell, true)
		return

	if selected_cell == cell:
		_highlight_cell(cell, false)
		selected_cell = Vector2i(-1, -1)
		return

	if _is_adjacent(selected_cell, cell):
		_highlight_cell(selected_cell, false)
		_swap_candies(selected_cell, cell)
		selected_cell = Vector2i(-1, -1)
	else:
		_highlight_cell(selected_cell, false)
		selected_cell = cell
		_highlight_cell(cell, true)

func _is_adjacent(cell_a: Vector2i, cell_b: Vector2i) -> bool:
	var diff := (cell_a - cell_b).abs()
	return (diff.x == 1 and diff.y == 0) or (diff.x == 0 and diff.y == 1)

func _highlight_cell(cell: Vector2i, highlight: bool) -> void:
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite == null:
		return
	if highlight:
		sprite.scale = Vector2(CANDY_SCALE * 1.2, CANDY_SCALE * 1.2)
		sprite.modulate = Color(1.2, 1.2, 1.2, 1.0)
	else:
		sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
		sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

func _swap_candies(cell_a: Vector2i, cell_b: Vector2i) -> void:
	is_animating = true
	last_swap = [cell_a, cell_b]
	moves_left -= 1
	chain_count = 0
	_update_ui()

	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(_on_swap_finished)

func _on_swap_finished() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()
	else:
		_reverse_swap()

func _find_matches() -> Array:
	var matches := []

	for row in GRID_SIZE:
		var col := 0
		while col < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				col += 1
				continue
			if not CANDY_TYPES.has(candy_type):
				col += 1
				continue
			var match_length := 1
			while col + match_length < GRID_SIZE and grid[row][col + match_length] == candy_type:
				match_length += 1
			if match_length >= 3:
				var match_group := []
				for i in match_length:
					match_group.append(Vector2i(row, col + i))
				matches.append(match_group)
			col += match_length

	for col in GRID_SIZE:
		var row := 0
		while row < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				row += 1
				continue
			if not CANDY_TYPES.has(candy_type):
				row += 1
				continue
			var match_length := 1
			while row + match_length < GRID_SIZE and grid[row + match_length][col] == candy_type:
				match_length += 1
			if match_length >= 3:
				var match_group := []
				for i in match_length:
					match_group.append(Vector2i(row + i, col))
				matches.append(match_group)
			row += match_length

	return matches

func _remove_matches(matches: Array) -> void:
	var cells_to_remove := {}
	var bonuses_to_create := []

	# 1. Kesişen eşleşmeleri bul (L/T şekli → bomb)
	var used_in_intersection := {}
	for i in matches.size():
		for j in range(i + 1, matches.size()):
			var intersection := _get_intersection(matches[i], matches[j])
			if intersection != Vector2i(-1, -1):
				var unique := {}
				for c: Vector2i in matches[i]:
					unique[c] = true
				for c: Vector2i in matches[j]:
					unique[c] = true
				if unique.size() >= 5:
					bonuses_to_create.append({cell = intersection, type = "bomb"})
					used_in_intersection[i] = true
					used_in_intersection[j] = true

	# 2. Kesişmeye dahil olmayan grupları kontrol et
	for i in matches.size():
		if used_in_intersection.has(i):
			continue
		var group: Array = matches[i]
		if group.size() >= 5:
			bonuses_to_create.append({cell = group[group.size() / 2], type = "rainbow"})
		elif group.size() == 4:
			var arrow_type: String = ["arrow_h", "arrow_v"][randi() % 2]
			bonuses_to_create.append({cell = group[2], type = arrow_type})

	# 3. Puan hesapla
	for i in matches.size():
		if not used_in_intersection.has(i):
			_add_match_score(matches[i].size())
	chain_count += 1

	# 4. Tüm eşleşen hücreleri topla
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	# 5. Bonus pozisyonlarını belirle
	var bonus_positions := {}
	for b in bonuses_to_create:
		bonus_positions[b.cell] = b.type

	# 6. Hücreleri sil (bonus hücreleri hariç)
	for cell: Vector2i in cells_to_remove:
		if bonus_positions.has(cell):
			continue
		var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
		if sprite != null:
			sprite.queue_free()
			candy_sprites[cell.x][cell.y] = null
		grid[cell.x][cell.y] = ""

	# 7. Bonusları yerleştir
	for b in bonuses_to_create:
		_place_bonus(b.cell, b.type)

func _get_intersection(group_a: Array, group_b: Array) -> Vector2i:
	for cell_a: Vector2i in group_a:
		for cell_b: Vector2i in group_b:
			if cell_a == cell_b:
				return cell_a
	return Vector2i(-1, -1)

func _place_bonus(cell: Vector2i, bonus_type: String) -> void:
	var old_sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if old_sprite != null:
		old_sprite.queue_free()

	grid[cell.x][cell.y] = bonus_type
	var sprite := Sprite2D.new()
	sprite.texture = candy_textures[bonus_type]
	sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
	sprite.position = _grid_to_pixel(cell.x, cell.y)
	add_child(sprite)
	candy_sprites[cell.x][cell.y] = sprite

func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true

	_add_bonus_score(bonus_type)
	_clear_cell(cell)

	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		"arrow_v":
			_activate_arrow_v(cell)
		"bomb":
			_activate_bomb(cell)
		"rainbow":
			_activate_rainbow()

	_apply_gravity_and_fill()

func _activate_arrow_h(cell: Vector2i) -> void:
	for col in GRID_SIZE:
		_clear_cell(Vector2i(cell.x, col))

func _activate_arrow_v(cell: Vector2i) -> void:
	for row in GRID_SIZE:
		_clear_cell(Vector2i(row, cell.y))

func _activate_bomb(cell: Vector2i) -> void:
	for dr in range(-1, 2):
		for dc in range(-1, 2):
			var target := Vector2i(cell.x + dr, cell.y + dc)
			if _is_valid_cell(target):
				_clear_cell(target)

func _activate_rainbow() -> void:
	var color_count := {}
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var ct: String = grid[row][col]
			if CANDY_TYPES.has(ct):
				color_count[ct] = color_count.get(ct, 0) + 1

	var max_type := ""
	var max_count := 0
	for ct: String in color_count:
		if color_count[ct] > max_count:
			max_count = color_count[ct]
			max_type = ct

	if max_type != "":
		for row in GRID_SIZE:
			for col in GRID_SIZE:
				if grid[row][col] == max_type:
					_clear_cell(Vector2i(row, col))

func _clear_cell(cell: Vector2i) -> void:
	if not _is_valid_cell(cell):
		return
	if grid[cell.x][cell.y] == "":
		return
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

func _reverse_swap() -> void:
	var cell_a: Vector2i = last_swap[0]
	var cell_b: Vector2i = last_swap[1]

	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(func() -> void: is_animating = false)

# --- Yerçekimi ve Doldurma ---

func _apply_vertical_gravity() -> bool:
	var moved := false
	for col in GRID_SIZE:
		var write_row := GRID_SIZE - 1
		for read_row in range(GRID_SIZE - 1, -1, -1):
			if grid[read_row][col] != "":
				if read_row != write_row:
					grid[write_row][col] = grid[read_row][col]
					grid[read_row][col] = ""
					candy_sprites[write_row][col] = candy_sprites[read_row][col]
					candy_sprites[read_row][col] = null
					moved = true
				write_row -= 1
	return moved

func _apply_diagonal_slide() -> bool:
	for row in range(GRID_SIZE - 1, 0, -1):
		for col in GRID_SIZE:
			if grid[row][col] != "":
				continue
			if grid[row - 1][col] != "":
				continue
			if col > 0 and grid[row - 1][col - 1] != "":
				grid[row][col] = grid[row - 1][col - 1]
				grid[row - 1][col - 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col - 1]
				candy_sprites[row - 1][col - 1] = null
				return true
			if col < GRID_SIZE - 1 and grid[row - 1][col + 1] != "":
				grid[row][col] = grid[row - 1][col + 1]
				grid[row - 1][col + 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col + 1]
				candy_sprites[row - 1][col + 1] = null
				return true
	return false

func _settle_candies() -> void:
	var changed := true
	while changed:
		changed = _apply_vertical_gravity()
		if not changed:
			changed = _apply_diagonal_slide()

func _fill_empty_cells() -> void:
	for col in GRID_SIZE:
		var empty_count := 0
		for row in GRID_SIZE:
			if grid[row][col] == "":
				empty_count += 1
			else:
				break

		for i in empty_count:
			var candy_type: String = CANDY_TYPES[randi() % CANDY_TYPES.size()]
			grid[i][col] = candy_type

			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
			sprite.position = _grid_to_pixel(i - empty_count, col)
			sprite.modulate.a = 0.0
			add_child(sprite)
			candy_sprites[i][col] = sprite

func _animate_board(callback: Callable) -> void:
	var tween := create_tween()
	tween.set_parallel(true)

	var has_animation := false
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var sprite: Sprite2D = candy_sprites[row][col]
			if sprite == null:
				continue
			var target := _grid_to_pixel(row, col)
			if not sprite.position.is_equal_approx(target):
				tween.tween_property(sprite, "position", target, 0.3) \
					.set_ease(Tween.EASE_IN) \
					.set_trans(Tween.TRANS_QUAD)
				has_animation = true
			if sprite.modulate.a < 1.0:
				tween.tween_property(sprite, "modulate:a", 1.0, 0.15)
				has_animation = true

	if has_animation:
		tween.set_parallel(false)
		tween.tween_callback(callback)
	else:
		callback.call()

func _apply_gravity_and_fill() -> void:
	_settle_candies()
	_fill_empty_cells()
	_animate_board(_check_chain_matches)

func _check_chain_matches() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()
	else:
		is_animating = false
		_check_level_status()

func _check_level_status() -> void:
	if score >= target_score:
		_level_complete()
	elif moves_left <= 0:
		_game_over()

func _level_complete() -> void:
	level += 1
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	_update_ui()
	_show_message("Seviye " + str(level) + "!")

func _game_over() -> void:
	_show_message("Oyun Bitti!\nSkor: " + str(score))
	is_animating = true

func _show_message(text: String) -> void:
	$MessageLabel.text = text
	var tween := create_tween()
	tween.tween_interval(2.0)
	tween.tween_callback(_on_message_finished)

func _on_message_finished() -> void:
	var was_game_over: bool = $MessageLabel.text.begins_with("Oyun")
	$MessageLabel.text = ""
	if was_game_over:
		_restart_game()

func _restart_game() -> void:
	score = 0
	moves_left = BASE_MOVES
	level = 1
	target_score = BASE_TARGET
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false
```

---

## 7.11 — Test

Ama önce! Sahneye Label node'larını eklemeyi unutmayın (7.1 adımı).

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| Oyun başladığında | Sol üstte "Skor: 0", sağ üstte "Hamle: 20" görünür |
| Bir takas yapıldığında | Hamle 1 azalır |
| 3'lü eşleşme | Skor +30 |
| 4'lü eşleşme | Skor +60, bonus oluşur |
| Zincir eşleşme | İkinci zincir 1.5× puan verir |
| Skor >= 1000 olduğunda | "Seviye 2!" mesajı, hamle 20'ye döner |
| 20 hamle bittiğinde | "Oyun Bitti!" mesajı, 2 sn sonra oyun sıfırlanır |
| Bonus aktivasyonu | Bonus türüne göre puan eklenir |

> **Sonraki bölümde:** Patlama animasyonu (explotion.png sprite sheet) ve görsel efektler ekleyeceğiz.
