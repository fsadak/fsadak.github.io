---
title: "Godot Engine Oyun Mekanikleri - Bölüm 3: Candy Blast — Şeker Seçme ve Takas (Swap)"
date: 2026-03-24 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-3/
published: true
---

Bu bölümde şekerlere tıklama, seçili şekeri vurgulama ve iki komşu şekeri yer değiştirme mekaniklerini ekleyeceğiz. Bölüm sonunda iki komşu şekere tıklayarak yerlerini değiştirebileceksiniz.

---

## 3.1 — Piksel → Grid Dönüşümü

Bölüm 2'de grid koordinatlarını piksele çeviren `_grid_to_pixel()` yazmıştık. Şimdi tersini yapacağız: oyuncu ekrana tıkladığında, o piksel konumunun hangi hücreye denk geldiğini bulacağız.

`game.gd` dosyasında `_grid_to_pixel()` fonksiyonunun **altına** şu fonksiyonu ekleyin:

```gdscript
func _pixel_to_grid(pixel: Vector2) -> Vector2i:
	var col := int((pixel.x - GRID_OFFSET.x) / CELL_SIZE)
	var row := int((pixel.y - GRID_OFFSET.y) / CELL_SIZE)
	return Vector2i(row, col)
```

**Açıklama:**

- Tıklanan pikselden `GRID_OFFSET`'i çıkarıyoruz → grid'in sol üst köşesine göre konum buluyoruz
- `CELL_SIZE`'a bölüyoruz → hangi hücrede olduğunu hesaplıyoruz
- `int()` ile tam sayıya çeviriyoruz (örneğin 1.7 → 1, yani 2. hücre)
- `Vector2i` — tam sayı (integer) vektörü döndürüyoruz çünkü satır/sütun her zaman tam sayıdır

**Örnek:** Oyuncu (150, 300) pikselina tıklarsa:
- col = int((150 - 24) / 64) = int(1.97) = 1
- row = int((300 - 225) / 64) = int(1.17) = 1
- Sonuç: (1, 1) → 2. satır, 2. sütun (0'dan başlıyor)

---

## 3.2 — Tıklanan Hücrenin Grid İçinde Olup Olmadığını Kontrol Etme

Oyuncu grid dışına da tıklayabilir. Bu durumda geçersiz bir hücre dönecektir. Bunu kontrol eden bir fonksiyon ekleyelim:

```gdscript
func _is_valid_cell(cell: Vector2i) -> bool:
	return cell.x >= 0 and cell.x < GRID_SIZE and cell.y >= 0 and cell.y < GRID_SIZE
```

**Açıklama:**

- `cell.x` satır, `cell.y` sütundur
- Her ikisi de 0 ile 7 arasında olmalı (8x8 grid)
- Bu koşulların hepsi sağlanırsa `true`, biri bile sağlanmazsa `false` döner

---

## 3.3 — Seçim Değişkenleri

Oyuncunun hangi şekeri seçtiğini takip etmemiz gerekiyor. Dosyanın üst kısmındaki değişkenler bölümüne (`var candy_textures` satırının altına) şunları ekleyin:

```gdscript
var selected_cell := Vector2i(-1, -1)  # Seçili hücre (-1,-1 = seçim yok)
var is_animating := false              # Animasyon sırasında girişi engelle
```

**Açıklama:**

- `selected_cell` — Oyuncunun ilk tıkladığı hücrenin koordinatları. (-1, -1) demek henüz seçim yapılmamış.
- `is_animating` — Şekerler yer değiştirirken (animasyon sırasında) oyuncunun tekrar tıklamasını engellemek için kullanacağız. Yoksa animasyon bitmeden tekrar tıklanırsa kaos olur.

---

## 3.4 — Tıklama Girişini Yakalama

Godot'da kullanıcı girişlerini yakalamak için `_input()` fonksiyonu kullanılır. Bu fonksiyon her tuş basımında, fare tıklamasında vs. otomatik olarak Godot tarafından çağrılır.

`_is_valid_cell()` fonksiyonunun altına ekleyin:

```gdscript
func _input(event: InputEvent) -> void:
	if is_animating:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var cell := _pixel_to_grid(event.position)
		if _is_valid_cell(cell):
			_on_cell_clicked(cell)
```

**Satır satır açıklama:**

- `_input(event)` — Godot her kullanıcı etkileşiminde bu fonksiyonu çağırır ve olay bilgisini `event` parametresiyle verir
- `if is_animating: return` — Animasyon devam ediyorsa hiçbir şey yapma, fonksiyondan çık
- `event is InputEventMouseButton` — Bu olay bir fare tıklaması mı?
- `event.pressed` — Buton basıldı mı? (bırakma olayını filtreliyoruz)
- `event.button_index == MOUSE_BUTTON_LEFT` — Sol tuş mu?
- `_pixel_to_grid(event.position)` — Tıklanan pikseli grid koordinatına çevir
- `_is_valid_cell(cell)` — Grid içinde mi kontrol et
- `_on_cell_clicked(cell)` — Geçerliyse tıklama işlemini başlat (bir sonraki adımda yazacağız)

---

## 3.5 — Tıklama İşlemi: Seçme ve Takas Başlatma

Oyuncunun bir hücreye tıkladığında ne olacağını belirleyen fonksiyon. Mantık şu:

1. **İlk tıklama** → şekeri seç ve vurgula
2. **İkinci tıklama (komşu hücre)** → iki şekeri takas et
3. **İkinci tıklama (komşu değil)** → önceki seçimi iptal et, yeni hücreyi seç

```gdscript
func _on_cell_clicked(cell: Vector2i) -> void:
	# Boş hücreye tıklandıysa yok say
	if grid[cell.x][cell.y] == "":
		return

	# Henüz seçim yapılmamışsa → bu hücreyi seç
	if selected_cell == Vector2i(-1, -1):
		selected_cell = cell
		_highlight_cell(cell, true)
		return

	# Aynı hücreye tekrar tıklandıysa → seçimi iptal et
	if selected_cell == cell:
		_highlight_cell(cell, false)
		selected_cell = Vector2i(-1, -1)
		return

	# Komşu hücreye tıklandıysa → takas yap
	if _is_adjacent(selected_cell, cell):
		_highlight_cell(selected_cell, false)
		_swap_candies(selected_cell, cell)
		selected_cell = Vector2i(-1, -1)
	else:
		# Komşu değilse → önceki seçimi kaldır, yenisini seç
		_highlight_cell(selected_cell, false)
		selected_cell = cell
		_highlight_cell(cell, true)
```

**Akış diyagramı:**

```
Tıklama
  │
  ├── Boş hücre? → Yok say
  │
  ├── İlk seçim? → Seç ve vurgula
  │
  ├── Aynı hücre? → Seçimi iptal et
  │
  ├── Komşu mu? → TAKAS YAP
  │
  └── Komşu değil? → Eski seçimi kaldır, yenisini seç
```

---

## 3.6 — Komşuluk Kontrolü

İki hücrenin komşu olup olmadığını kontrol eden fonksiyon. Match-3 oyunlarında sadece **yatay veya dikey** komşular geçerlidir (çapraz değil).

```gdscript
func _is_adjacent(cell_a: Vector2i, cell_b: Vector2i) -> bool:
	var diff := (cell_a - cell_b).abs()
	return (diff.x == 1 and diff.y == 0) or (diff.x == 0 and diff.y == 1)
```

**Açıklama:**

- İki hücre arasındaki farkı hesaplıyoruz ve mutlak değer alıyoruz
- Komşu olmak için: ya satır farkı 1 ve sütun farkı 0 olmalı (dikey komşu), ya da tam tersi (yatay komşu)
- Çapraz komşular reddedilir (her iki fark da 1 olurdu)

**Örnekler:**
- (2,3) ve (2,4) → fark (0,1) → yatay komşu ✓
- (2,3) ve (3,3) → fark (1,0) → dikey komşu ✓
- (2,3) ve (3,4) → fark (1,1) → çapraz ✗
- (2,3) ve (2,5) → fark (0,2) → uzak ✗

---

## 3.7 — Seçim Vurgulama

Seçili şekeri görsel olarak belirgin kılmak için boyutunu biraz büyüteceğiz. Bu, oyuncuya "bu şeker seçili" mesajını verir.

```gdscript
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
```

**Açıklama:**

- `highlight = true` → Şekeri %20 büyüt ve parlaklaştır
- `highlight = false` → Normal boyutuna ve rengine döndür
- `sprite.modulate` — Sprite'ın rengini çarpar. `Color(1.2, 1.2, 1.2)` görseli normalden biraz daha parlak yapar
- `sprite.scale` — Sprite'ın ölçeğini değiştirir

---

## 3.8 — Takas İşlemi (Animasyonlu)

İki şekerin yerini değiştiren fonksiyon. Sadece veriyi değil, görselleri de değiştireceğiz ve bunu **animasyonlu** yapacağız ki oyuncu hareketi görsün.

Godot'da animasyon için **Tween** kullanacağız. Tween, bir değeri belirli sürede A'dan B'ye yumuşak geçişle değiştirir.

```gdscript
func _swap_candies(cell_a: Vector2i, cell_b: Vector2i) -> void:
	is_animating = true

	# 1. Grid verisini takas et
	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	# 2. Sprite referanslarını takas et
	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	# 3. Animasyonlu hareket
	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(_on_swap_finished)

func _on_swap_finished() -> void:
	is_animating = false
```

**Satır satır açıklama:**

**Veri takası:**
- `grid` dizisindeki iki hücrenin değerlerini klasik `temp` yöntemiyle değiştiriyoruz
- Aynı şekilde `candy_sprites` dizisindeki referansları da değiştiriyoruz

**Animasyon (Tween):**
- `create_tween()` — Yeni bir Tween nesnesi oluşturur
- `set_parallel(true)` — Bundan sonraki tween işlemleri aynı anda (paralel) çalışsın
- `tween_property(sprite_a, "position", pos_b, 0.2)` — sprite_a'nın `position` özelliğini 0.2 saniyede pos_b'ye taşı
- `.set_ease(Tween.EASE_IN_OUT)` — Hareket başta yavaş, ortada hızlı, sonda yavaş olsun (doğal görünüm)
- `set_parallel(false)` — Paralel modu kapat, sonraki işlem sıralı olsun
- `tween_callback(_on_swap_finished)` — Animasyon bitince bu fonksiyonu çağır

**`_on_swap_finished()`:**
- `is_animating = false` → Oyuncunun tekrar tıklamasına izin ver

> **Not:** Şu an takas sonrası eşleşme kontrolü yapmıyoruz. Eşleşme yoksa geri takas da yok. Bunları Bölüm 5'te ekleyeceğiz. Şimdilik sadece takasın çalıştığını doğruluyoruz.

---

## 3.9 — Tam Kod (game.gd)

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
	is_animating = false
```

---

## 3.10 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| Bir şekere tıkla | Şeker büyür ve parlar (seçildi) |
| Aynı şekere tekrar tıkla | Normal boyutuna döner (seçim iptal) |
| Bir şeker seç, sonra komşusuna tıkla | İki şeker animasyonla yer değiştirir |
| Bir şeker seç, uzak bir şekere tıkla | Önceki seçim kalkar, yeni şeker seçilir |
| Grid dışına tıkla | Hiçbir şey olmaz |
| Animasyon sırasında tıkla | Hiçbir şey olmaz (engellendi) |

> **Sonraki bölümde:** Eşleşme bulma algoritmasını yazacağız. Yatay ve dikey 3+ aynı renk dizilimlerini tespit edeceğiz.
