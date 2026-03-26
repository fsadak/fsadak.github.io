---
title: "Godot Engine Oyun Mekanikleri - Bölüm 5: Candy Blast — Yerçekimi, Doldurma ve Zincir Reaksiyon"
date: 2026-03-26 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
description: "Godot Match-3 oyununda yerçekimi, boş hücre doldurma ve zincir reaksiyon mekaniği. Düşerek dolan şekerlerin Tween animasyonu."
permalink: /godot-oyun-mekanikleri-bolum-5/
published: true
---

Bu bölümde eşleşme sonrası boşalan hücrelere yerçekimi uygulayacak, çapraz kayma mekaniği ekleyecek, yeni şekerlerle doldurma yapacak ve zincir reaksiyonları yöneteceğiz. Bölüm sonunda oyun gerçek bir Match-3 gibi çalışacak.

---

## 5.1 — Genel Akış

Eşleşme sonrası akış şöyle olacak:

```
Eşleşme bulundu → Şekerler silindi → Boşluklar oluştu
    │
    ▼
Dikey yerçekimi (şekerler aşağı düşer)
    │
    ▼
Çapraz kayma (boşluk doldurulamıyorsa yanlara kayarak dolar)
    │
    ▼
Üstten yeni şekerler gelir
    │
    ▼
Animasyon oynar
    │
    ▼
Tekrar eşleşme kontrolü (zincir reaksiyon)
    │
    ├── Eşleşme var → Başa dön
    └── Eşleşme yok → Oyuncunun sırası
```

Bu bölümde 6 yeni fonksiyon yazacağız ve 1 mevcut fonksiyonu güncelleyeceğiz.

---

## 5.2 — Dikey Yerçekimi

Her sütunda şekerleri aşağı çekip boşlukları üste toplayan fonksiyon. Mantık basit: her sütunu aşağıdan yukarı tarayıp, dolu hücreleri alta doğru sıkıştırıyoruz.

`_reverse_swap()` fonksiyonunun altına ekleyin:

```gdscript
func _apply_vertical_gravity() -> bool:
	var moved := false
	for col in GRID_SIZE:
		var write_row := GRID_SIZE - 1  # Yazma pozisyonu (alttan başla)
		for read_row in range(GRID_SIZE - 1, -1, -1):  # Alttan üste tara
			if grid[read_row][col] != "":
				if read_row != write_row:
					# Şekeri aşağı taşı (veri)
					grid[write_row][col] = grid[read_row][col]
					grid[read_row][col] = ""
					# Sprite referansını taşı
					candy_sprites[write_row][col] = candy_sprites[read_row][col]
					candy_sprites[read_row][col] = null
					moved = true
				write_row -= 1
	return moved
```

**Nasıl çalışıyor? Adım adım bir sütun örneği:**

```
Başlangıç:  [__, 🔴, __, 🟢, __, 🔵, __, 🟡]  (row 0-7, __ = boş)

write_row = 7
read_row = 7: 🟡 bulundu, read==write → write_row = 6
read_row = 6: boş → geç
read_row = 5: 🔵 bulundu, 5 ≠ 6 → 🔵'yu row 6'ya taşı → write_row = 5
read_row = 4: boş → geç
read_row = 3: 🟢 bulundu, 3 ≠ 5 → 🟢'yu row 5'e taşı → write_row = 4
read_row = 2: boş → geç
read_row = 1: 🔴 bulundu, 1 ≠ 4 → 🔴'yu row 4'e taşı → write_row = 3
read_row = 0: boş → geç

Sonuç:      [__, __, __, __, 🔴, 🟢, 🔵, 🟡]  ← boşluklar üstte
```

**Satır satır açıklama:**

```
func _apply_vertical_gravity() -> bool:
	var moved := false
```
- `-> bool` → Herhangi bir şeker taşındıysa `true`, hiçbir şey değişmediyse `false` döner. Bu bilgi `_settle_candies()` tarafından döngü kontrolü için kullanılacak.

```
	for col in GRID_SIZE:
		var write_row := GRID_SIZE - 1
```
- Her sütunu ayrı ayrı işliyoruz. `write_row` bir **yazma imleci** görevi görür — sütunun en altından başlar (row 7) ve her dolu hücre yerleştirildiğinde bir yukarı çıkar.

```
		for read_row in range(GRID_SIZE - 1, -1, -1):
```
- `range(7, -1, -1)` → 7, 6, 5, 4, 3, 2, 1, 0 — alttan yukarıya doğru okuyoruz. Bu **iki-işaretçi** (two-pointer) algoritmasıdır: `read_row` okur, `write_row` yazar.

```
			if grid[read_row][col] != "":
				if read_row != write_row:
```
- Dolu hücre bulduğumuzda: eğer okuma ve yazma pozisyonu farklıysa → şeker taşınmalı. Aynıysa → şeker zaten doğru yerde.

```
					grid[write_row][col] = grid[read_row][col]
					grid[read_row][col] = ""
					candy_sprites[write_row][col] = candy_sprites[read_row][col]
					candy_sprites[read_row][col] = null
					moved = true
```
- Hem `grid` verisini hem `candy_sprites` referansını yeni pozisyona taşıyoruz. Eski pozisyonu boşaltıyoruz. Sprite'ın ekrandaki pozisyonu henüz değişmez — o animasyonla yapılacak.

```
				write_row -= 1
```
- Yazma imlecini bir yukarı kaydırıyoruz. Sonraki dolu hücre buraya yazılacak.

---

## 5.3 — Çapraz Kayma

Dikey yerçekiminden sonra hâlâ boşluk kalabilir. Özellikle bir sütunun tamamı boşaldığında, yanındaki şekerlerin oraya "kayarak düşmesi" gerekir.

Kural: Bir hücre boşsa **VE** doğrudan üstü de boşsa (yani dikey yerçekimi dolduramıyorsa), çapraz yukarıdan (sol-üst veya sağ-üst) bir şekeri bu hücreye kaydır.

```gdscript
func _apply_diagonal_slide() -> bool:
	for row in range(GRID_SIZE - 1, 0, -1):  # Alttan üste (row 0 hariç)
		for col in GRID_SIZE:
			if grid[row][col] != "":
				continue  # Dolu hücre, atla

			# Üstü de boşsa dikey yerçekimi işe yaramaz → çapraz dene
			if grid[row - 1][col] != "":
				continue  # Üstte şeker var, dikey yerçekimi halleder

			# Sol üstten kayma
			if col > 0 and grid[row - 1][col - 1] != "":
				grid[row][col] = grid[row - 1][col - 1]
				grid[row - 1][col - 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col - 1]
				candy_sprites[row - 1][col - 1] = null
				return true  # Bir kayma yaptık, başa dön

			# Sağ üstten kayma
			if col < GRID_SIZE - 1 and grid[row - 1][col + 1] != "":
				grid[row][col] = grid[row - 1][col + 1]
				grid[row - 1][col + 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col + 1]
				candy_sprites[row - 1][col + 1] = null
				return true

	return false  # Hiç kayma olmadı
```

**Neden her seferinde sadece 1 kayma yapıyoruz?**

Bir şeker kaydığında, kaynak hücre boşalır. Bu boşluk üstteki şekerlerin düşmesine yol açabilir. O yüzden her kaymadan sonra tekrar dikey yerçekimi uygulamamız gerekir. `return true` ile fonksiyondan çıkıp döngüyü yeniden başlatıyoruz.

**Neden `grid[row-1][col] != ""` kontrolü var?**

Eğer boş hücrenin hemen üstünde bir şeker varsa, dikey yerçekimi o şekeri zaten aşağı düşürecektir. Çapraz kaymaya gerek yok. Çapraz kayma sadece dikey yolun tıkalı olduğu durumlarda devreye girer.

**Görsel örnek:**

```
Yerçekimi sonrası:          Çapraz kayma sonrası:
🔴 __ __                   __ __ __
🟢 __ __          →        🔴 __ __
🔵 __ __                   🟢 🔵 __

🔵, (2,0)'dan (2,1)'e çapraz kaydı.
Sonra tekrar yerçekimi: 🔵 (2,1)'den düşecek yer yok, kalır.
Ama 🔴 ve 🟢 de bir satır düşer.
```

---

## 5.4 — Yerleşme Döngüsü

Dikey yerçekimi ve çapraz kaymayı birleştiren fonksiyon. İkisini stabil olana kadar tekrar eder.

```gdscript
func _settle_candies() -> void:
	var changed := true
	while changed:
		changed = _apply_vertical_gravity()
		if not changed:
			changed = _apply_diagonal_slide()
```

**Satır satır açıklama:**

```
func _settle_candies() -> void:
	var changed := true
```
- `changed` döngü kontrolü için kullanılır. `true` ile başlıyoruz ki döngüye en az bir kez girelim.

```
	while changed:
		changed = _apply_vertical_gravity()
```
- Önce dikey yerçekimi uygula. Hareket olduysa `changed = true`, olmadıysa `false`.

```
		if not changed:
			changed = _apply_diagonal_slide()
```
- Dikey yerçekimi bir şey taşımadıysa → çapraz kaymayı dene. Kayma olduysa `changed = true` olur ve döngü başa döner (tekrar dikey yerçekimi). Kayma da olmadıysa `changed = false` kalır ve döngü biter.

**Akış:**

```
┌─→ Dikey yerçekimi uygula
│    ├── Hareket oldu → Tekrar dikey yerçekimi
│    └── Hareket olmadı → Çapraz kayma dene
│         ├── Kayma oldu → Başa dön (tekrar dikey yerçekimi)
│         └── Kayma olmadı → Stabil! Döngüden çık
└──────────┘
```

---

## 5.5 — Boş Hücreleri Yeni Şekerlerle Doldurma

Yerleşme sonrası boş kalan hücreler (her sütunun üst kısmında) yeni rastgele şekerlerle doldurulur. Yeni şekerler grid'in **üstünden** başlayıp animasyonla düşecek.

```gdscript
func _fill_empty_cells() -> void:
	for col in GRID_SIZE:
		# Bu sütundaki boş hücre sayısını bul (hepsi üstte olmalı)
		var empty_count := 0
		for row in GRID_SIZE:
			if grid[row][col] == "":
				empty_count += 1
			else:
				break  # Yerçekimi sonrası boşluklar sadece üstte

		# Boş hücreleri doldur
		for i in empty_count:
			var candy_type: String = CANDY_TYPES[randi() % CANDY_TYPES.size()]
			grid[i][col] = candy_type

			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
			# Grid'in üstünde başlat (animasyonla düşecek)
			sprite.position = _grid_to_pixel(i - empty_count, col)
			sprite.modulate.a = 0.0  # Başlangıçta görünmez
			add_child(sprite)
			candy_sprites[i][col] = sprite
```

**Satır satır açıklama:**

```
func _fill_empty_cells() -> void:
	for col in GRID_SIZE:
```
- Her sütunu ayrı ayrı işliyoruz. Yerçekimi sonrası boş hücreler her sütunun **üst kısmında** toplanmış durumda.

```
		var empty_count := 0
		for row in GRID_SIZE:
			if grid[row][col] == "":
				empty_count += 1
			else:
				break
```
- Sütunun tepesinden aşağı doğru boş hücreleri sayıyoruz. İlk dolu hücreye ulaşınca `break` ile çıkıyoruz. Yerçekimi zaten boşlukları üste topladığı için ortada veya altta boş hücre kalmaz.

```
		for i in empty_count:
			var candy_type: String = CANDY_TYPES[randi() % CANDY_TYPES.size()]
			grid[i][col] = candy_type
```
- `for i in empty_count` → 0'dan `empty_count - 1`'e kadar döner. Her boş hücre için rastgele bir şeker türü seçip `grid`'e yazıyoruz. Burada başlangıç eşleşme kontrolü yapmıyoruz — yeni gelen şekerler eşleşme oluşturursa zincir reaksiyon halledecek.

```
			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
```
- Yeni sprite oluşturup texture ve ölçeği ayarlıyoruz (Bölüm 2'deki `_draw_candies()` ile aynı mantık).

```
			sprite.position = _grid_to_pixel(i - empty_count, col)
```
- **Kritik satır:** Sprite'ı grid'in **üstünde** konumlandırıyoruz. `i - empty_count` negatif bir satır numarası verir. Örneğin 3 boş hücre varsa: `i=0` → `_grid_to_pixel(-3, col)` → grid'in 3 hücre üstü. Animasyon sırasında sprite buradan aşağı düşerek gerçek yerine (row 0) gelecek.

```
			sprite.modulate.a = 0.0
```
- Sprite'ı tamamen **görünmez** başlatıyoruz. `modulate.a` alfa (saydamlık) kanalıdır: `0.0` = tamamen şeffaf, `1.0` = tamamen opak. Grid dışında oluştuğu için oyuncuya görünmemeli, `_animate_board()` içinde yavaşça görünür olacak.

```
			add_child(sprite)
			candy_sprites[i][col] = sprite
```
- Sprite'ı sahneye ekleyip referansını diziye kaydediyoruz.

---

## 5.6 — Tahta Animasyonu

Tüm sprite'ları olması gereken pozisyona animasyonla taşıyan fonksiyon. Yerçekimi ve doldurma veriyi anında değiştirir ama görseller eski yerlerinde kalır. Bu fonksiyon görselleri doğru pozisyona animasyonla kaydırır.

```gdscript
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
			# Görünmez sprite'ları grid alanına girerken görünür yap
			if sprite.modulate.a < 1.0:
				tween.tween_property(sprite, "modulate:a", 1.0, 0.15)
				has_animation = true

	if has_animation:
		tween.set_parallel(false)
		tween.tween_callback(callback)
	else:
		callback.call()
```

**Satır satır açıklama:**

```
func _animate_board(callback: Callable) -> void:
```
- `callback: Callable` → Animasyon bitince çağrılacak fonksiyonu parametre olarak alır. Bu **callback deseni** sayesinde aynı fonksiyonu farklı devam işlemleriyle kullanabiliriz. Bizim kullanımımızda callback = `_check_chain_matches`.

```
	var tween := create_tween()
	tween.set_parallel(true)
```
- Yeni tween oluşturup paralel moda alıyoruz. Tüm sprite animasyonları **aynı anda** çalışacak.

```
	var has_animation := false
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var sprite: Sprite2D = candy_sprites[row][col]
			if sprite == null:
				continue
```
- Tüm hücreleri tarıyoruz. `null` olan hücreler (boş) atlanır.

```
			var target := _grid_to_pixel(row, col)
			if not sprite.position.is_equal_approx(target):
				tween.tween_property(sprite, "position", target, 0.3) \
					.set_ease(Tween.EASE_IN) \
					.set_trans(Tween.TRANS_QUAD)
				has_animation = true
```
- `target` → Sprite'ın **olması gereken** piksel pozisyonu (grid verisine göre).
- `is_equal_approx()` → İki `Vector2` değerini karşılaştırır. Float sayılarda küçük yuvarlama hataları olabileceği için `==` yerine bu fonksiyon kullanılır.
- Pozisyon farklıysa → Tween ile animasyonlu taşıma ekler. `0.3` saniye sürer.
- `EASE_IN` + `TRANS_QUAD` → Hareket **başta yavaş, sona doğru hızlanır**. Bu, gerçek yerçekimini simüle eder — düşen bir nesne giderek hızlanır.

```
			if sprite.modulate.a < 1.0:
				tween.tween_property(sprite, "modulate:a", 1.0, 0.15)
				has_animation = true
```
- Yeni oluşturulan sprite'lar `modulate.a = 0.0` (görünmez) başlatılmıştı. Bu kontrol onları 0.15 saniyede tamamen görünür yapar.
- `"modulate:a"` → Godot'ta alt özellik yolu. `modulate` özelliğinin `a` (alfa) kanalını anime eder.

```
	if has_animation:
		tween.set_parallel(false)
		tween.tween_callback(callback)
	else:
		callback.call()
```
- Animasyon varsa → paralel modu kapat, tüm animasyonlar bittikten sonra `callback` çağrılsın.
- Animasyon yoksa (hiçbir sprite taşınmadı) → `callback.call()` ile hemen devam et. Beklemeye gerek yok.

---

## 5.7 — Yerçekimi + Doldurma Orkestratörü

Tüm adımları sırayla çalıştıran ana fonksiyon:

```gdscript
func _apply_gravity_and_fill() -> void:
	_settle_candies()
	_fill_empty_cells()
	_animate_board(_check_chain_matches)
```

**Satır satır açıklama:**

```
func _apply_gravity_and_fill() -> void:
	_settle_candies()
```
- Önce mevcut şekerleri yerleştirir (dikey yerçekimi + çapraz kayma döngüsü). Tüm dolu hücreler mümkün olan en alt pozisyona taşınır.

```
	_fill_empty_cells()
```
- Üstte kalan boş hücrelere yeni rastgele şekerler yerleştirir. Sprite'lar grid'in üstünde, görünmez başlar.

```
	_animate_board(_check_chain_matches)
```
- Tüm veri değişikliklerini animasyonla görselleştirir. Animasyon bitince `_check_chain_matches` callback'i çağrılır — bu da zincir reaksiyon döngüsünü başlatır.

---

## 5.8 — Zincir Reaksiyon

Yerçekimi ve doldurma sonrası yeni eşleşmeler oluşabilir. Bu kontrolü yapan fonksiyon:

```gdscript
func _check_chain_matches() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()  # Tekrar yerçekimi + doldurma + kontrol
	else:
		is_animating = false  # Zincir bitti, oyuncunun sırası
```

**Satır satır açıklama:**

```
func _check_chain_matches() -> void:
	var matches := _find_matches()
```
- Yerçekimi ve doldurma sonrası tahtada yeni eşleşme var mı kontrol ediyoruz.

```
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()
```
- Yeni eşleşme bulunduysa → sil + tekrar yerçekimi + doldurma + animasyon + tekrar kontrol. Bu **öz-yinelemeli** (recursive) bir zincir oluşturur: `_apply_gravity_and_fill()` bitince tekrar `_check_chain_matches()` çağrılır.

```
	else:
		is_animating = false
```
- Eşleşme yoksa → zincir bitti! `is_animating = false` ile oyuncunun tekrar tıklamasına izin veriyoruz.

**Zincir akışı:**

```
Eşleşme bul → Sil → Yerçekimi → Doldur → Animasyon →
→ Eşleşme bul → Sil → Yerçekimi → Doldur → Animasyon →
→ Eşleşme yok → DUR
```

Her döngü bir "zincir" sayılır. Oyuncular büyük zincirler oluşturmaya bayılır!

---

## 5.9 — _on_swap_finished Güncelleme

Mevcut `_on_swap_finished()` fonksiyonunu güncelleyin. Eşleşme bulununca artık yerçekimi akışını başlatacak:

Mevcut `_on_swap_finished()` fonksiyonunu şununla **değiştirin**:

```gdscript
func _on_swap_finished() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		_remove_matches(matches)
		_apply_gravity_and_fill()
	else:
		_reverse_swap()
```

> Bu fonksiyon Bölüm 4'teki ile neredeyse aynı. Tek fark: `is_animating = false` yerine `_apply_gravity_and_fill()` çağırıyoruz. Yerçekimi + doldurma + zincir döngüsünün sonunda `_check_chain_matches()` zaten `is_animating = false` yapacak.

---

## 5.10 — Tam Kod (game.gd)

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
			# Görünmez sprite'ları grid alanına girerken görünür yap
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

## 5.11 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| 3'lü eşleşme yap | Şekerler silinir, üsttekiler düşer, üstten yenileri gelir |
| Düşme sonrası yeni eşleşme oluşsun | Zincir reaksiyon: yeni eşleşme de otomatik silinir |
| Eşleşme olmayan takas | Şekerler geri döner |
| Yeni gelen şekerler | Üstten animasyonla düşerek gelir |

**Dikkat edilecek noktalar:**

- Düşen şekerler hücrelere tam oturmalı (kayma olmamalı)
- Zincir reaksiyon sırasında tıklama engellenmeli
- Yeni gelen şekerler grid dışından (üstten) animasyonla inmeli

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='trRGmreerAA' %}

---

> **Sonraki bölümde:** Bonus şeker üretimi ekleyeceğiz — 4'lü eşleşme arrow, düz 5'li eşleşme rainbow, diğer 5'li eşleşmeler bomb verecek.
