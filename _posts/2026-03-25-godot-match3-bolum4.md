---
title: "Godot Engine Oyun Mekanikleri - Bölüm 4: Candy Blast — Eşleşme Bulma Algoritması"
date: 2026-03-25 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-4/
published: true
---

Bu bölümde tahtadaki yatay ve dikey 3+ eşleşmeleri tespit eden algoritmayı yazacağız. Ayrıca takas sonrası eşleşme kontrolü yapacak, eşleşme yoksa takası geri alacağız. Bölüm sonunda eşleşen şekerler tahtadan silinecek.

---

## 4.1 — Eşleşme Bulma Mantığı

Eşleşme aramak için tahtayı iki kez tarıyoruz:

1. **Yatay tarama:** Her satırda soldan sağa giderek aynı renkte ardışık şekerleri sayıyoruz
2. **Dikey tarama:** Her sütunda yukarıdan aşağı aynı mantıkla tarıyoruz

3 veya daha fazla ardışık aynı renk bulduğumuzda, bu hücreleri bir listeye ekliyoruz.

`game.gd` dosyasında `_on_swap_finished()` fonksiyonunun altına şu fonksiyonu ekleyin:

```gdscript
func _find_matches() -> Array:
	var matches := []

	# Yatay tarama
	for row in GRID_SIZE:
		var col := 0
		while col < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
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

	# Dikey tarama
	for col in GRID_SIZE:
		var row := 0
		while row < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
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
```

**Algoritma adım adım (yatay tarama örneği):**

```
Satır: [red, red, red, blue, blue, green, green, green]
        ───────────                     ─────────────
        col=0, 3 ardışık red → eşleşme!  col=5, 3 ardışık green → eşleşme!
```

1. `col = 0`'dan başla, mevcut rengi oku (`red`)
2. Sağa doğru aynı renk devam ediyor mu say (`match_length`)
3. 3 veya daha fazlaysa, bu hücreleri bir grup olarak `matches`'e ekle
4. `col`'u `match_length` kadar ileri atla (zaten kontrol edildi)
5. Satır bitene kadar tekrarla

**Dönüş değeri:** Her eleman bir eşleşme grubunu temsil eden `Vector2i` dizisi. Örneğin:
```
[
  [Vector2i(0,0), Vector2i(0,1), Vector2i(0,2)],     ← yatay 3'lü
  [Vector2i(2,3), Vector2i(3,3), Vector2i(4,3), Vector2i(5,3)]  ← dikey 4'lü
]
```

---

## 4.2 — Eşleşen Şekerleri Silme

Eşleşme bulunduktan sonra o hücrelerdeki şekerleri hem `grid` verisinden hem de ekrandan kaldırmamız gerekiyor.

```gdscript
func _remove_matches(matches: Array) -> void:
	# Tekrarlı hücreleri önlemek için set kullan
	var cells_to_remove := {}
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	for cell: Vector2i in cells_to_remove:
		# Sprite'ı sahneden kaldır
		var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
		if sprite != null:
			sprite.queue_free()
			candy_sprites[cell.x][cell.y] = null
		# Grid verisini temizle
		grid[cell.x][cell.y] = ""
```

**Açıklama:**

- **Neden `cells_to_remove` sözlüğü?** Bir hücre hem yatay hem dikey eşleşmenin parçası olabilir (T veya L şekli). Sözlük aynı hücrenin iki kez silinmesini önler.
- `sprite.queue_free()` — Sprite'ı sahneden güvenli şekilde kaldırır (Godot frame sonunda siler)
- `candy_sprites[cell.x][cell.y] = null` — Referansı temizler
- `grid[cell.x][cell.y] = ""` — Hücreyi boş olarak işaretle

---

## 4.3 — Takas Sonrası Eşleşme Kontrolü

Şimdi `_swap_candies()` fonksiyonunu güncellememiz gerekiyor. Takas sonrası:
1. Eşleşme var mı kontrol et
2. Varsa → eşleşen şekerleri sil
3. Yoksa → takası geri al (şekerler eski yerlerine döner)

Önce `_on_swap_finished()` fonksiyonunu güncelleyin. Mevcut `_on_swap_finished()`'i tamamen silip yerine şunu yazın:

```gdscript
func _on_swap_finished() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		is_animating = false
	else:
		# Eşleşme yok → takası geri al
		_reverse_swap()
```

Ayrıca son yapılan takası hatırlamamız gerekiyor. Bunun için `_swap_candies()` fonksiyonuna takası kaydeden değişkenler ekleyeceğiz.

**Değişkenler bölümüne** (dosyanın üst kısmı) şunu ekleyin:

```gdscript
var last_swap := [Vector2i(-1, -1), Vector2i(-1, -1)]  # Son takas edilen hücreler
```

**`_swap_candies()` fonksiyonunun en başına** (is_animating = true satırının hemen altına) şu satırı ekleyin:

```gdscript
	last_swap = [cell_a, cell_b]
```

---

## 4.4 — Geri Takas (Eşleşme Yoksa)

Eşleşme olmadığında şekerleri eski yerlerine döndüren fonksiyon:

```gdscript
func _reverse_swap() -> void:
	var cell_a: Vector2i = last_swap[0]
	var cell_b: Vector2i = last_swap[1]

	# Veriyi geri takas et
	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	# Animasyonlu geri hareket
	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(func() -> void: is_animating = false)
```

**Açıklama:**

- Geri takas, normal takasla aynı mantıkta çalışır — veriyi ve sprite'ları tersine çevirir
- Animasyon tamamlandığında `is_animating = false` yaparak oyuncunun tekrar oynamasına izin verir
- `func() -> void:` — Bu bir **lambda** (anonim) fonksiyondur. Sadece `is_animating = false` yapması gereken tek satırlık bir callback için ayrı fonksiyon yazmak yerine, satır içinde tanımlıyoruz

---

## 4.5 — Tam Kod (game.gd)

İşte `game.gd` dosyasının bu bölüm sonundaki tam hali:

```gdscript
extends Node2D

# --- Sabitler ---
const GRID_SIZE := 8
const CELL_SIZE := 64.0
const CANDY_SCALE := 0.63

const GRID_OFFSET := Vector2(24, 225)

const CANDY_TYPES := ["red", "yellow", "blue", "green", "purple"]

# --- Değişkenler ---
var grid := []
var candy_sprites := []
var candy_textures := {}
var selected_cell := Vector2i(-1, -1)
var is_animating := false
var last_swap := [Vector2i(-1, -1), Vector2i(-1, -1)]

func _ready() -> void:
	_load_textures()
	_init_grid()
	_draw_candies()

func _load_textures() -> void:
	for candy_name in CANDY_TYPES:
		var path: String = "res://assets/images/" + candy_name + ".png"
		candy_textures[candy_name] = load(path)

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
		if child.name != "Grid":
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
		is_animating = false
	else:
		_reverse_swap()

func _find_matches() -> Array:
	var matches := []

	# Yatay tarama
	for row in GRID_SIZE:
		var col := 0
		while col < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
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

	# Dikey tarama
	for col in GRID_SIZE:
		var row := 0
		while row < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
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
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	for cell: Vector2i in cells_to_remove:
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
```

---

## 4.6 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| 3'lü eşleşme oluşturacak takas yap | Şekerler takas olur, eşleşen 3+ şeker kaybolur |
| Eşleşme oluşturmayan takas yap | Şekerler takas olur, sonra geri döner |
| T veya L şeklinde eşleşme oluştur | Hem yatay hem dikey eşleşmenin kesiştiği hücreler doğru silinir |

**Bilinen eksikler (sonraki bölümlerde çözülecek):**
- Silinen şekerlerin yerine yenileri gelmiyor (boşluklar kalıyor)
- Yerçekimi yok — üstteki şekerler düşmüyor
- Puan sistemi yok

> **Sonraki bölümde:** Yerçekimi sistemi ekleyeceğiz. Eşleşme sonrası şekerler düşecek, boşluklar yeni şekerlerle dolacak ve zincir reaksiyonlar kontrol edilecek.
