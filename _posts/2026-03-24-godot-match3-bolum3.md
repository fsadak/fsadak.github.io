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

**Satır satır açıklama:**

```
func _pixel_to_grid(pixel: Vector2) -> Vector2i:
```
- `pixel: Vector2` → Ekrandaki tıklama pozisyonu (x, y piksel cinsinden). Godot fare tıklamalarını `Vector2` olarak verir.
- `-> Vector2i` → Tam sayı (integer) vektör döndürür. Grid koordinatları her zaman tam sayıdır (3. satır, 5. sütun gibi).

```
	var col := int((pixel.x - GRID_OFFSET.x) / CELL_SIZE)
```
- `pixel.x - GRID_OFFSET.x` → Tıklanan x pikselinden grid'in sol kenarını çıkarıyoruz. Böylece grid'in **içindeki** konumu buluyoruz. Örneğin `pixel.x = 150`, `GRID_OFFSET.x = 24` → 150 - 24 = 126 piksel (grid'in solundan itibaren).
- `/ CELL_SIZE` → Hücre genişliğine bölüyoruz. 126 / 64 = 1.97 → 1. sütunun (0'dan başlıyor) sonuna yakınız.
- `int(...)` → Ondalık kısmı atarak tam sayıya çeviriyoruz. `int(1.97)` → `1`. Bu bize sütun numarasını verir.

```
	var row := int((pixel.y - GRID_OFFSET.y) / CELL_SIZE)
```
- Aynı mantık dikey eksen için. `GRID_OFFSET.y = 225` çıkarılır, `CELL_SIZE`'a bölünür, tam sayıya çevrilir.

```
	return Vector2i(row, col)
```
- Sonucu `Vector2i(satır, sütun)` formatında döndürüyoruz. **Dikkat:** `Vector2i`'nin `x` değeri **satır**, `y` değeri **sütun** olarak kullanılıyor. Bu grid tabanlı oyunlarda yaygın bir konvansiyondur.

**Örnek:** Oyuncu (150, 300) pikselina tıklarsa:
- col = int((150 - 24) / 64) = int(1.97) = 1
- row = int((300 - 225) / 64) = int(1.17) = 1
- Sonuç: Vector2i(1, 1) → 2. satır, 2. sütun (0'dan başlıyor)

---

## 3.2 — Tıklanan Hücrenin Grid İçinde Olup Olmadığını Kontrol Etme

Oyuncu grid dışına da tıklayabilir. Bu durumda geçersiz bir hücre dönecektir. Bunu kontrol eden bir fonksiyon ekleyelim:

```gdscript
func _is_valid_cell(cell: Vector2i) -> bool:
	return cell.x >= 0 and cell.x < GRID_SIZE and cell.y >= 0 and cell.y < GRID_SIZE
```

**Satır satır açıklama:**

```
func _is_valid_cell(cell: Vector2i) -> bool:
```
- `-> bool` → Bu fonksiyon `true` veya `false` döndürür. Geçerlilik kontrol fonksiyonları genelde `bool` döner.

```
	return cell.x >= 0 and cell.x < GRID_SIZE and cell.y >= 0 and cell.y < GRID_SIZE
```
- `cell.x >= 0` → Satır numarası negatif olmamalı (grid'in üstüne tıklanmış olabilir).
- `cell.x < GRID_SIZE` → Satır numarası 8'den küçük olmalı (0-7 arasında). Grid'in altına tıklanmışsa bu koşul sağlanmaz.
- `cell.y >= 0` ve `cell.y < GRID_SIZE` → Aynı kontrol sütun için.
- `and` operatörü → **Tüm** koşullar `true` olmalı. Biri bile `false` ise sonuç `false` döner.
- Oyuncu grid dışına (boş alana, skor bölgesine vs.) tıkladığında bu fonksiyon `false` döner ve tıklama yok sayılır.

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

```
func _input(event: InputEvent) -> void:
```
- `_input()` → Godot'un yerleşik fonksiyonudur. `_ready()` gibi otomatik çağrılır ama fark şudur: `_ready()` bir kez çalışır, `_input()` ise **her kullanıcı etkileşiminde** çağrılır (fare hareketi, tıklama, tuş basımı vs.).
- `event: InputEvent` → Godot, olayın ne olduğunu bu parametre ile bildirir. Fare tıklaması mı, klavye mi, dokunma mı — hepsi `InputEvent`'in alt sınıflarıdır.

```
	if is_animating:
		return
```
- Eğer bir animasyon devam ediyorsa (şekerler hareket ediyor, yer değiştiriyor vs.) fonksiyondan hemen çıkıyoruz. `return` fonksiyonu sonlandırır, altındaki kodlar çalışmaz. Bu sayede oyuncu animasyon bitmeden tıklayarak oyunu bozamaz.

```
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
```
- `event is InputEventMouseButton` → `is` operatörü ile olayın tipini kontrol ediyoruz. Bu bir fare **tuşu** olayı mı? (Fare hareketi `InputEventMouseMotion` olurdu, onu istemiyoruz.)
- `event.pressed` → Buton **basıldı** mı? Fare tuşu bırakıldığında da olay gelir (`pressed = false`), onu filtreliyoruz.
- `event.button_index == MOUSE_BUTTON_LEFT` → Hangi fare tuşu? Sol tuş mu? Sağ tuş veya orta tuş olaylarını yok sayıyoruz.
- Üç koşul `and` ile birleştirilmiş: hepsi `true` olmalı ki içeri girelim.

```
		var cell := _pixel_to_grid(event.position)
```
- `event.position` → Godot, fare tıklamasının ekrandaki piksel konumunu bu özellikle verir.
- Piksel konumunu grid koordinatlarına çeviriyoruz (3.1'de yazdığımız fonksiyon).

```
		if _is_valid_cell(cell):
			_on_cell_clicked(cell)
```
- Hesaplanan hücre grid sınırları içinde mi kontrol ediyoruz (3.2'de yazdığımız fonksiyon).
- Geçerliyse tıklama işleyici fonksiyonu çağırıyoruz.

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

**Satır satır açıklama:**

```
func _on_cell_clicked(cell: Vector2i) -> void:
	if grid[cell.x][cell.y] == "":
		return
```
- Tıklanan hücre boşsa (şeker yok) → hiçbir şey yapma. İleride yerçekimi sonrası boş hücreler oluşacak, onlara tıklamayı engellemek gerekiyor.

```
	if selected_cell == Vector2i(-1, -1):
		selected_cell = cell
		_highlight_cell(cell, true)
		return
```
- `selected_cell == Vector2i(-1, -1)` → Henüz hiçbir şeker seçili değilse: bu hücreyi seçili olarak işaretle, görsel olarak vurgula ve fonksiyondan çık. Oyuncu şimdi ikinci tıklamayı yapacak.

```
	if selected_cell == cell:
		_highlight_cell(cell, false)
		selected_cell = Vector2i(-1, -1)
		return
```
- Oyuncu aynı şekere tekrar tıkladıysa → seçimi iptal et. Vurguyu kaldır ve `selected_cell`'i sıfırla.

```
	if _is_adjacent(selected_cell, cell):
		_highlight_cell(selected_cell, false)
		_swap_candies(selected_cell, cell)
		selected_cell = Vector2i(-1, -1)
```
- Yeni tıklanan hücre, seçili hücrenin **komşusu** ise → takas yap! Önce eski vurguyu kaldır, sonra iki şekerin yerini değiştir, son olarak seçimi sıfırla.

```
	else:
		_highlight_cell(selected_cell, false)
		selected_cell = cell
		_highlight_cell(cell, true)
```
- Komşu değilse → önceki seçimi kaldır, yeni hücreyi seç. Oyuncu uzak bir yere tıkladığında seçimini o hücreye kaydırıyor.

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

**Satır satır açıklama:**

```
func _is_adjacent(cell_a: Vector2i, cell_b: Vector2i) -> bool:
```
- İki hücrenin komşu olup olmadığını kontrol eden fonksiyon. `-> bool` → `true` (komşu) veya `false` (komşu değil) döner.

```
	var diff := (cell_a - cell_b).abs()
```
- `cell_a - cell_b` → İki hücre arasındaki farkı hesaplıyoruz. Örneğin `(2,3) - (3,3)` → `(-1, 0)`.
- `.abs()` → Mutlak değer alıyoruz: `(-1, 0)` → `(1, 0)`. Hangi hücrenin yukarıda/aşağıda olduğu önemli değil, sadece **uzaklık** önemli.

```
	return (diff.x == 1 and diff.y == 0) or (diff.x == 0 and diff.y == 1)
```
- İlk koşul: `diff.x == 1 and diff.y == 0` → Satır farkı tam 1, sütun farkı 0 → **dikey komşu** (üst-alt).
- İkinci koşul: `diff.x == 0 and diff.y == 1` → Satır farkı 0, sütun farkı tam 1 → **yatay komşu** (sol-sağ).
- `or` ile bağlanmış: ikisinden biri sağlanırsa `true` döner.
- Çapraz komşular `(1,1)` olurdu → her iki koşul da sağlanmaz → `false` döner.

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

**Satır satır açıklama:**

```
func _highlight_cell(cell: Vector2i, highlight: bool) -> void:
```
- `highlight: bool` → `true` ise vurgula, `false` ise vurguyu kaldır. Tek fonksiyon ile iki işi yapıyoruz.

```
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite == null:
		return
```
- `candy_sprites` dizisinden bu hücrenin sprite referansını alıyoruz.
- `null` kontrolü: Hücre boşsa (şeker silinmişse) sprite olmayabilir. Bu durumda fonksiyondan çıkıyoruz, yoksa hata alırız.

```
	if highlight:
		sprite.scale = Vector2(CANDY_SCALE * 1.2, CANDY_SCALE * 1.2)
		sprite.modulate = Color(1.2, 1.2, 1.2, 1.0)
```
- `CANDY_SCALE * 1.2` → Normal ölçeğin %20 büyüğü. 0.63 × 1.2 = 0.756. Şeker biraz büyüyerek "seçildi" hissi verir.
- `sprite.modulate` → Sprite'ın **renk çarpanıdır**. Her piksel bu renkle çarpılır. `Color(1.2, 1.2, 1.2, 1.0)` → R, G, B kanalları 1.0'dan büyük olduğu için görsel normalden **daha parlak** görünür. Son değer `1.0` alfa (saydamlık) kanalıdır.

```
	else:
		sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
		sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)
```
- Normal boyut ve renk değerlerine döndürüyoruz. `Color(1.0, 1.0, 1.0, 1.0)` → orijinal renk (hiçbir değişiklik yok).

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

```
func _swap_candies(cell_a: Vector2i, cell_b: Vector2i) -> void:
	is_animating = true
```
- Takası başlatırken hemen `is_animating = true` yapıyoruz. Bu sayede animasyon süresince `_input()` fonksiyonu hiçbir tıklamayı işlemez.

**1. Grid verisini takas et:**
```
	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp
```
- Klasik **üç değişkenli takas** algoritması. Bir geçici değişken (`temp`) kullanarak iki hücrenin içeriğini yer değiştiriyoruz. Örneğin A="red", B="blue" ise: temp="red" → A="blue" → B="red". Bu mantıksal veri takasıdır, ekranda henüz bir şey değişmez.

**2. Sprite referanslarını takas et:**
```
	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a
```
- `candy_sprites` dizisindeki **referansları** da takas ediyoruz. Grid verisi ile sprite referanslarının **senkron** kalması şart. Yoksa ileride yanlış sprite'ı silmeye veya taşımaya çalışırız.

**3. Hedef pozisyonları hesapla:**
```
	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)
```
- Her iki hücrenin ekrandaki piksel pozisyonunu hesaplıyoruz. **Dikkat:** Grid verisi zaten takas edildiği için, `pos_a` artık `sprite_b`'nin gitmesi gereken yer, `pos_b` ise `sprite_a`'nın gitmesi gereken yer.

**4. Tween animasyonu oluştur:**
```
	var tween := create_tween()
```
- `create_tween()` → Godot'un **Tween** sistemidir. Bir değeri belirli sürede A noktasından B noktasına yumuşak geçişle değiştirir. Tek satır kodla profesyonel animasyon yaratır.

```
	tween.set_parallel(true)
```
- Bundan sonra eklenen tween işlemleri **aynı anda** (paralel) çalışsın. İki şeker **eş zamanlı** hareket etmeli, biri bitmeden diğeri başlamamalı.

```
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
```
- `tween_property()` → Bir düğümün belirli özelliğini animasyonla değiştirir.
  - 1\. parametre: Hangi düğüm (`sprite_a`)
  - 2\. parametre: Hangi özellik (`"position"` — sprite'ın ekrandaki konumu)
  - 3\. parametre: Hedef değer (`pos_b` — gitmesi gereken piksel konumu)
  - 4\. parametre: Süre (`0.2` saniye — hızlı ve akıcı)
- `.set_ease(Tween.EASE_IN_OUT)` → Hareket eğrisi. Başta yavaş başlar, ortada hızlanır, sonda yine yavaşlar. Bu, doğal ve profesyonel bir hareket hissi verir. Sabit hız kullanılsa robot gibi görünürdü.

```
	tween.set_parallel(false)
```
- Paralel modu kapatıyoruz. Bundan sonra eklenen işlem, üstteki animasyonlar **bittikten sonra** çalışacak.

```
	tween.tween_callback(_on_swap_finished)
```
- `tween_callback()` → Tween tamamlandığında verilen fonksiyonu çağır. Yani iki sprite hedef pozisyonlarına ulaştığında `_on_swap_finished()` otomatik çalışır.

**`_on_swap_finished()`:**
```
func _on_swap_finished() -> void:
	is_animating = false
```
- Animasyon tamamlandı, kilidi aç. Oyuncu artık tekrar tıklayabilir.

> **Not:** Şu an takas sonrası eşleşme kontrolü yapmıyoruz. Eşleşme yoksa geri takas da yok. Bunları bir sonraki bölümde ekleyeceğiz. Şimdilik sadece takasın çalıştığını doğruluyoruz.

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

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='4_amoZdCiIU' %}

---

> **Sonraki bölümde:** Eşleşme bulma algoritmasını yazacağız. Yatay ve dikey 3+ aynı renk dizilimlerini tespit edeceğiz.