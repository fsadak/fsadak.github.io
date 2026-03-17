---
title: "Godot Engine Oyun Mekanikleri - Bölüm 6: Candy Blast — Bonuslar. Üretim ve Aktivasyon"
date: 2026-03-27 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-6/
published: true
---

Bu bölümde 4'lü, 5'li ve L/T şekilli eşleşmelere bonus şeker üretimi ekleyeceğiz. Ayrıca bu bonusları tıklayarak aktive etme mekaniklerini yazacağız.

**Bonus kuralları:**

| Eşleşme | Bonus | Aktivasyon |
|---------|-------|------------|
| 4'lü düz eşleşme | `arrow_h` veya `arrow_v` (rastgele) | Bulunduğu satır veya sütunu siler |
| 5'li düz eşleşme (yatay veya dikey) | `rainbow` | Tahtadaki en çok bulunan rengi siler |
| L veya T şekilli 5+ eşleşme | `bomb` | 3x3 kareyi patlatır |

---

## 6.1 — Bonus Sabitleri ve Texture Yükleme

Bonus türlerini tanımlayıp görsellerini yükleyelim.

**Sabitler bölümüne** (`CANDY_TYPES` satırının altına) şunu ekleyin:

```gdscript
const BONUS_TYPES := ["arrow_h", "arrow_v", "bomb", "rainbow"]
```

**`_load_textures()` fonksiyonunu** güncelleyin — bonus görsellerini de yüklesin:

```gdscript
func _load_textures() -> void:
	for candy_name in CANDY_TYPES:
		var path: String = "res://assets/images/" + candy_name + ".png"
		candy_textures[candy_name] = load(path)
	for bonus_name in BONUS_TYPES:
		var path: String = "res://assets/images/" + bonus_name + ".png"
		candy_textures[bonus_name] = load(path)
```

**Açıklama:**

- `BONUS_TYPES` — Bonus şeker türlerini tanımlar. Normal şekerlerden ayrı tutuyoruz çünkü bonuslar eşleşme kontrolüne **katılmaz**
- Aynı `candy_textures` sözlüğüne ekliyoruz, böylece sprite oluşturma kodu değişmeden çalışır

---

## 6.2 — Eşleşme Bulma Güncellemesi

Bonus şekerler eşleşme kontrolüne katılmamalıdır. İki `arrow_h` yan yana gelse bile eşleşme sayılmaz.

**`_find_matches()` fonksiyonunda** her iki taramada da boş hücre kontrolünün hemen altına bonus kontrolü ekleyin:

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

	# Dikey tarama
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
```

Eklenen satır her iki taramada da aynı:

```gdscript
if not CANDY_TYPES.has(candy_type):
    col += 1  # veya row += 1
    continue
```

Bu kontrol, hücredeki değer normal şeker türlerinden biri değilse (yani bonus ise) o hücreyi atlamamızı sağlar.

---

## 6.3 — Eşleşme Analizi ve Bonus Üretimi

Şimdi en önemli kısım: eşleşme gruplarını analiz edip hangi bonusun üretileceğine karar veren mantık.

**`_remove_matches()` fonksiyonunu** tamamen şununla değiştirin:

```gdscript
func _remove_matches(matches: Array) -> void:
	var cells_to_remove := {}
	var bonuses_to_create := []

	# 1. Kesişen eşleşmeleri bul (L/T şekli → bomb)
	var used_in_intersection := {}
	for i in matches.size():
		for j in range(i + 1, matches.size()):
			var intersection := _get_intersection(matches[i], matches[j])
			if intersection != Vector2i(-1, -1):
				# İki grubun toplam benzersiz hücre sayısını hesapla
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

	# 3. Tüm eşleşen hücreleri topla
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	# 4. Bonus hücrelerini silme listesinden çıkar
	var bonus_positions := {}
	for b in bonuses_to_create:
		bonus_positions[b.cell] = b.type

	# 5. Hücreleri sil
	for cell: Vector2i in cells_to_remove:
		if bonus_positions.has(cell):
			continue  # Bonus yerleşecek, silme
		var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
		if sprite != null:
			sprite.queue_free()
			candy_sprites[cell.x][cell.y] = null
		grid[cell.x][cell.y] = ""

	# 6. Bonusları yerleştir
	for b in bonuses_to_create:
		_place_bonus(b.cell, b.type)
```

**Satır satır açıklama:**

```
	var cells_to_remove := {}
	var bonuses_to_create := []
```
- `cells_to_remove` → Silinecek tüm hücrelerin sözlüğü (tekrar önleme için).
- `bonuses_to_create` → Oluşturulacak bonusların listesi. Her eleman `{cell = pozisyon, type = "bomb"}` formatında bir sözlük.

**Adım 1 — Kesişim kontrolü (L/T şekli):**

```
	var used_in_intersection := {}
	for i in matches.size():
		for j in range(i + 1, matches.size()):
```
- `used_in_intersection` → Kesişime dahil olan grup indekslerini tutacak. Bunlar 2. adımda tekrar kontrol edilmemeli.
- İç içe iki döngü ile her eşleşme grubunu diğerleriyle karşılaştırıyoruz. `range(i + 1, ...)` sayesinde her çifti sadece bir kez kontrol ediyoruz (A-B ve B-A aynı şey).

```
			var intersection := _get_intersection(matches[i], matches[j])
			if intersection != Vector2i(-1, -1):
```
- İki grubun ortak hücresi var mı? Varsa bu L veya T şeklinde bir eşleşme — iki düz çizgi bir noktada kesişiyor.

```
				var unique := {}
				for c: Vector2i in matches[i]:
					unique[c] = true
				for c: Vector2i in matches[j]:
					unique[c] = true
				if unique.size() >= 5:
					bonuses_to_create.append({cell = intersection, type = "bomb"})
					used_in_intersection[i] = true
					used_in_intersection[j] = true
```
- İki grubun toplam **benzersiz** hücre sayısını hesaplıyoruz. Kesişim noktası iki kez sayılmamalı, o yüzden sözlük kullanıyoruz.
- 5+ benzersiz hücre varsa → kesişim noktasına `bomb` üretiyoruz. Her iki grubu da `used_in_intersection`'a ekliyoruz ki 2. adımda tekrar işlenmesinler.

**Adım 2 — Düz çizgi bonusları:**

```
	for i in matches.size():
		if used_in_intersection.has(i):
			continue
```
- Kesişime dahil olan grupları atlıyoruz (zaten bomb üretildi).

```
		var group: Array = matches[i]
		if group.size() >= 5:
			bonuses_to_create.append({cell = group[group.size() / 2], type = "rainbow"})
```
- 5+ hücrelik düz eşleşme → `rainbow` bonus. `group.size() / 2` ile grubun **ortasına** yerleştiriyoruz.

```
		elif group.size() == 4:
			var arrow_type: String = ["arrow_h", "arrow_v"][randi() % 2]
			bonuses_to_create.append({cell = group[2], type = arrow_type})
```
- 4'lü eşleşme → `arrow_h` veya `arrow_v` (rastgele). `[randi() % 2]` → 0 veya 1 döner, diziden o indeksteki elemanı seçer. Grubun 3. hücresine (indeks 2) yerleştirilir.

**Adım 3-6 — Silme ve yerleştirme:**

```
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true
```
- Tüm eşleşen hücreleri topluyoruz.

```
	var bonus_positions := {}
	for b in bonuses_to_create:
		bonus_positions[b.cell] = b.type
```
- Bonus yerleşecek hücrelerin listesini hazırlıyoruz.

```
	for cell: Vector2i in cells_to_remove:
		if bonus_positions.has(cell):
			continue
```
- Bonus yerleşecek hücreleri **silmiyoruz**. O hücredeki eski şeker yerine bonus sprite gelecek.

```
	for b in bonuses_to_create:
		_place_bonus(b.cell, b.type)
```
- Son adımda bonus sprite'larını oluşturuyoruz.

---

## 6.4 — Yardımcı Fonksiyonlar

İki eşleşme grubunun kesişim noktasını bulan fonksiyon:

```gdscript
func _get_intersection(group_a: Array, group_b: Array) -> Vector2i:
	for cell_a: Vector2i in group_a:
		for cell_b: Vector2i in group_b:
			if cell_a == cell_b:
				return cell_a
	return Vector2i(-1, -1)
```

**Satır satır açıklama:**

- İç içe iki döngü ile her iki grubun tüm hücrelerini karşılaştırır.
- Aynı hücre bulunursa → hemen o hücreyi döndürür. Bu kesişim noktası, L/T şeklinin köşe noktasıdır.
- Ortak hücre yoksa → `Vector2i(-1, -1)` döner (geçersiz koordinat, "bulunamadı" anlamında).

Bonus şekeri tahtaya yerleştiren fonksiyon:

```gdscript
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
```

**Satır satır açıklama:**

```
	var old_sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if old_sprite != null:
		old_sprite.queue_free()
```
- Bu hücrede hâlâ eski bir sprite varsa (eşleşen şekerin görseli) onu siliyoruz. Bonus sprite'ı onun yerine gelecek.

```
	grid[cell.x][cell.y] = bonus_type
```
- Grid verisini güncelliyoruz. Artık bu hücrede `"red"` yerine `"bomb"` veya `"arrow_h"` gibi bir bonus türü yazıyor.

```
	var sprite := Sprite2D.new()
	sprite.texture = candy_textures[bonus_type]
	sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
	sprite.position = _grid_to_pixel(cell.x, cell.y)
	add_child(sprite)
	candy_sprites[cell.x][cell.y] = sprite
```
- Yeni bonus sprite'ı oluşturup sahneye ekliyoruz. `candy_textures[bonus_type]` bonus görselini verir (örneğin `bomb.png`). Sprite hücrenin merkezine konumlandırılır.

---

## 6.5 — Bonus Aktivasyonu

Oyuncu bir bonus şekere tıkladığında onu aktive edecek fonksiyonlar.

Önce **`_on_cell_clicked()` fonksiyonunun en başına** bonus kontrolü ekleyin. Mevcut fonksiyonun ilk `if` bloğundan (boş hücre kontrolü) hemen sonrasına:

```gdscript
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
```

Şimdi aktivasyon fonksiyonlarını yazalım:

```gdscript
func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true

	# Bonusu kendisini sil
	_clear_cell(cell)

	# Türüne göre aktive et
	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		"arrow_v":
			_activate_arrow_v(cell)
		"bomb":
			_activate_bomb(cell)
		"rainbow":
			_activate_rainbow()

	# Yerçekimi ve zincir kontrolü
	_apply_gravity_and_fill()
```

**Satır satır açıklama:**

```
func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true
```
- Bonus türünü okuyup kaydediyoruz (`"arrow_h"`, `"bomb"` vs.). Animasyonu kilitlemeyi hemen yapıyoruz.

```
	_clear_cell(cell)
```
- Bonus şekerin kendisini tahtadan siliyoruz. Silmeden aktive edersek sorun çıkabilir (bonus kendini tekrar tetikleyebilir).

```
	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		...
```
- **`match` ifadesi** — GDScript'te `if-elif` zinciri yerine kullanılan daha temiz bir yapıdır. `bonus_type` değişkeninin değerine göre ilgili dal çalışır. Her bonus türü kendi aktivasyon fonksiyonunu çağırır.

```
	_apply_gravity_and_fill()
```
- Bonus aktivasyonu bitince yerçekimi, doldurma ve zincir kontrolü başlatılır.

---

## 6.6 — Aktivasyon Fonksiyonları

Her bonus türü için ayrı aktivasyon fonksiyonu:

```gdscript
func _activate_arrow_h(cell: Vector2i) -> void:
	# Bulunduğu satırın tamamını sil
	for col in GRID_SIZE:
		_clear_cell(Vector2i(cell.x, col))

func _activate_arrow_v(cell: Vector2i) -> void:
	# Bulunduğu sütunun tamamını sil
	for row in GRID_SIZE:
		_clear_cell(Vector2i(row, cell.y))

func _activate_bomb(cell: Vector2i) -> void:
	# 3x3 kareyi sil (merkez + 8 komşu)
	for dr in range(-1, 2):
		for dc in range(-1, 2):
			var target := Vector2i(cell.x + dr, cell.y + dc)
			if _is_valid_cell(target):
				_clear_cell(target)

func _activate_rainbow() -> void:
	# Tahtadaki en çok bulunan rengi bul ve hepsini sil
	var color_count := {}
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var ct: String = grid[row][col]
			if CANDY_TYPES.has(ct):
				color_count[ct] = color_count.get(ct, 0) + 1

	# En çok bulunan rengi bul
	var max_type := ""
	var max_count := 0
	for ct: String in color_count:
		if color_count[ct] > max_count:
			max_count = color_count[ct]
			max_type = ct

	# O renkteki tüm şekerleri sil
	if max_type != "":
		for row in GRID_SIZE:
			for col in GRID_SIZE:
				if grid[row][col] == max_type:
					_clear_cell(Vector2i(row, col))
```

**Satır satır açıklamalar:**

**Arrow yatay:**
```
func _activate_arrow_h(cell: Vector2i) -> void:
	for col in GRID_SIZE:
		_clear_cell(Vector2i(cell.x, col))
```
- `cell.x` sabit kalır (aynı satır), `col` 0'dan 7'ye döner → tüm satır silinir. Toplam 8 hücre temizlenir.

**Arrow dikey:**
```
func _activate_arrow_v(cell: Vector2i) -> void:
	for row in GRID_SIZE:
		_clear_cell(Vector2i(row, cell.y))
```
- `cell.y` sabit kalır (aynı sütun), `row` 0'dan 7'ye döner → tüm sütun silinir.

**Bomb:**
```
func _activate_bomb(cell: Vector2i) -> void:
	for dr in range(-1, 2):
		for dc in range(-1, 2):
			var target := Vector2i(cell.x + dr, cell.y + dc)
			if _is_valid_cell(target):
				_clear_cell(target)
```
- `range(-1, 2)` → -1, 0, 1 değerlerini üretir. İç içe iki döngüde `dr` ve `dc` kombinasyonları 3×3 = 9 hücre verir: sol-üst, üst, sağ-üst, sol, merkez, sağ, sol-alt, alt, sağ-alt.
- `_is_valid_cell()` kontrolü: Bomb grid kenarında ise bazı hücreler sınır dışı olabilir (örneğin köşede patlarsa 4 hücre grid dışı kalır).

**Rainbow:**
```
func _activate_rainbow() -> void:
	var color_count := {}
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var ct: String = grid[row][col]
			if CANDY_TYPES.has(ct):
				color_count[ct] = color_count.get(ct, 0) + 1
```
- Tüm tahtayı tarayıp her rengin kaç kez geçtiğini sayıyoruz. `CANDY_TYPES.has(ct)` kontrolü bonus şekerleri saymamamızı sağlar.
- `color_count.get(ct, 0)` → Sözlükte `ct` anahtarı varsa değerini döner, yoksa `0` döner. Sonra 1 ekleyerek sayacı artırıyoruz.

```
	var max_type := ""
	var max_count := 0
	for ct: String in color_count:
		if color_count[ct] > max_count:
			max_count = color_count[ct]
			max_type = ct
```
- En çok bulunan rengi arıyoruz. Klasik "maximum bulma" algoritması: her rengi mevcut maximum ile karşılaştır, daha büyükse güncelle.

```
	if max_type != "":
		for row in GRID_SIZE:
			for col in GRID_SIZE:
				if grid[row][col] == max_type:
					_clear_cell(Vector2i(row, col))
```
- Bulunan en yaygın renkteki **tüm** şekerleri tahtadan siliyoruz. Tahtada 12 kırmızı şeker varsa hepsi bir anda kaybolur — etkileyici bir patlama!

---

## 6.7 — Hücre Temizleme Yardımcı Fonksiyonu

Tek bir hücreyi güvenli şekilde temizleyen fonksiyon:

```gdscript
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
```

**Satır satır açıklama:**

```
func _clear_cell(cell: Vector2i) -> void:
	if not _is_valid_cell(cell):
		return
```
- Grid dışı bir hücreye erişmeye çalışıyorsak fonksiyondan çık. Bomb grid kenarındayken bazı hedef hücreler sınır dışı olabilir.

```
	if grid[cell.x][cell.y] == "":
		return
```
- Hücre zaten boşsa → bir şey yapmaya gerek yok. Birden fazla bonus aynı hücreyi silmeye çalışabilir (örneğin iki arrow'un yolları kesişirse).

```
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""
```
- Sprite'ı sahneden kaldır, referansı `null` yap, grid verisini `""` yap. Bu üç adım bir hücreyi tamamen temizler.

Bu fonksiyon her aktivasyonda tekrar tekrar kullanılır. Güvenlik kontrolleri sayesinde:
- Grid dışı hücreler atlanır (bomb köşede ise)
- Zaten boş hücreler atlanır (iki bonus aynı hücreyi silmeye çalışırsa)

---

## 6.8 — Tam Kod (game.gd)

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

	# 3. Tüm eşleşen hücreleri topla
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	# 4. Bonus pozisyonlarını belirle
	var bonus_positions := {}
	for b in bonuses_to_create:
		bonus_positions[b.cell] = b.type

	# 5. Hücreleri sil (bonus hücreleri hariç)
	for cell: Vector2i in cells_to_remove:
		if bonus_positions.has(cell):
			continue
		var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
		if sprite != null:
			sprite.queue_free()
			candy_sprites[cell.x][cell.y] = null
		grid[cell.x][cell.y] = ""

	# 6. Bonusları yerleştir
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
```

---

## 6.9 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| 4'lü eşleşme yap | Eşleşme silinir, yerine arrow_h veya arrow_v görünür |
| 5'li düz eşleşme yap | Eşleşme silinir, yerine rainbow görünür |
| L veya T şekli eşleşme yap (5+ hücre) | Eşleşme silinir, kesişimde bomb görünür |
| Arrow'a tıkla | Bulunduğu satır (h) veya sütun (v) tamamen silinir |
| Bomb'a tıkla | 3x3 alan silinir |
| Rainbow'a tıkla | En çok bulunan renkteki tüm şekerler silinir |
| Bonus aktivasyonu sonrası | Yerçekimi + zincir çalışır |

**İpucu:** 4'lü eşleşme oluşturmak zor olabilir. Tahtayı inceleyin, 2 aynı renk yan yana olan yere 3. birini kaydırarak 4'lü dizin.

> **Sonraki bölümde:** Puan sistemi, hamle sayacı, seviye hedefi ve game over mantığını ekleyeceğiz.
