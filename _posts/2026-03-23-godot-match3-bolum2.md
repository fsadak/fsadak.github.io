---
title: "Godot Engine Oyun Mekanikleri - Bölüm 2: Candy Blast — Grid Veri Yapısı ve Şekerleri Yerleştirme"
date: 2026-03-23 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-2/
published: true
---

Bu bölümde oyun tahtasının arkasındaki veri yapısını oluşturacak, şekerleri rastgele yerleştirecek ve başlangıçta eşleşme oluşmamasını sağlayacağız. Bölüm sonunda grid üzerinde rastgele renkli şekerlerin göründüğünü göreceksiniz.

---

## 2.1 — Oyun Scriptini Oluşturma

Godot'da düğümlere davranış kazandırmak için **script** (kod dosyası) eklenir. Godot'un kendi dili olan **GDScript** kullanacağız. Python'a çok benzer, öğrenmesi kolaydır.

**Adımlar:**

1. Sol panelde **Game** düğümünü seçin
2. Inspector panelinin üstündeki **küçük kağıt ikonuna** (Attach Script) tıklayın — veya sağ tıklayıp **Attach Script** seçin
3. Açılan pencerede ayarları şu şekilde bırakın:
   - **Language:** GDScript
   - **Path:** `res://game.gd`
4. **Create** butonuna basın

Godot otomatik olarak script editörünü açacak ve şöyle bir şablon gösterecek:

```gdscript
extends Node2D
```

Bu satır "Bu script bir Node2D düğümüne bağlıdır" demektir. Şimdi bu dosyanın tüm içeriğini silip aşağıdaki kodu yazacağız.

---

## 2.2 — Sabit Değerleri Tanımlama

`game.gd` dosyasının içeriğini tamamen silip şunu yazın:

```gdscript
extends Node2D

# --- Sabitler ---
const GRID_SIZE := 8          # Satır ve sütun sayısı (8x8)
const CELL_SIZE := 64.0       # Hücreler arası mesafe (512 / 8)
const CANDY_SCALE := 0.63     # Şeker görsellerini hücreye sığdırma oranı (grid çizgileri alan kaplar)

# Grid'in ekrandaki başlangıç pozisyonu (sol üst köşe)
const GRID_OFFSET := Vector2(24, 225)

# Şeker türleri — her biri bir PNG dosyasına karşılık gelir
const CANDY_TYPES := ["red", "yellow", "blue", "green", "purple"]
```

**Satır satır açıklama:**

- `const GRID_SIZE := 8` — Tahtamız 8x8 olacak. `const` demek bu değer asla değişmez.
- `const CELL_SIZE := 64.0` — Grid görseli 512px, 8'e bölünce her hücre 64px. `64.0` yazıyoruz çünkü ileride piksel hesaplamalarında ondalıklı sonuçlar gerekebilir (GDScript'te `64 / 2` tam sayı bölmesi yapar, `64.0 / 2` ondalıklı sonuç verir).
- `const CANDY_SCALE := 0.63` — Şeker görselleri 82x82px ama grid çizgileri hücre içi alanı daraltır. 82×0.63 ≈ 52px ile şekerler hücrelere güzel oturur ve çizgilerle örtüşmez.
- `const GRID_OFFSET := Vector2(24, 225)` — Grid'in **sol üst köşesinin** ekrandaki piksel konumu. Grid sprite'ı merkezden konumlandırıldığı için (288, 480), bu değer grid çizgilerinin kalınlığı hesaba katılarak ayarlanmıştır. Dikeyde 225, yatayda 24 ile şekerler hücrelere tam oturur.
- `const CANDY_TYPES` — 5 renk şekerimiz var. Bu dizi ileride rastgele seçim ve dosya yolu oluşturmak için kullanılacak.

---

## 2.3 — Grid Veri Yapısı ve Değişkenler

Sabitlerden hemen sonra şu değişkenleri ekleyin:

```gdscript
# --- Değişkenler ---
var grid := []                # 8x8 dizi — her hücrede şeker türü (string) tutacak
var candy_sprites := []       # 8x8 dizi — her hücredeki Sprite2D düğümünü tutacak
var candy_textures := {}      # Şeker ismi → Texture2D eşlemesi (önbellek)
```

**Ne işe yarıyorlar?**

- `grid` — Oyunun **mantıksal** tahtası. Bir 2D dizi (dizi içinde dizi). Örneğin `grid[2][5]` → 2. satır, 5. sütundaki şekerin türü ("red", "blue" vb.).
- `candy_sprites` — Her hücredeki **görsel** düğümü tutan 2D dizi. Şekeri silmek veya hareket ettirmek istediğimizde bu referansı kullanacağız.
- `candy_textures` — PNG dosyalarını her seferinde diskten okumamak için bir kez yükleyip bu sözlükte saklayacağız.

---

## 2.4 — Texture'ları Önceden Yükleme

Değişkenlerden sonra `_ready()` fonksiyonunu yazalım. Bu fonksiyon Godot'da özel bir fonksiyondur — düğüm sahneye eklendiğinde **otomatik olarak bir kez** çalışır.

```gdscript
func _ready() -> void:
	_load_textures()
	_init_grid()
	_draw_candies()
```

Şimdi `_load_textures()` fonksiyonunu yazalım:

```gdscript
func _load_textures() -> void:
	for candy_name in CANDY_TYPES:
		var path: String = "res://assets/images/" + candy_name + ".png"
		candy_textures[candy_name] = load(path)
```

**Açıklama:**

- `_ready()` — Oyun başladığında sırasıyla: texture'ları yükle, grid'i oluştur, şekerleri ekrana çiz.
- `_load_textures()` — Her şeker türü için PNG dosyasını `load()` ile yükler ve `candy_textures` sözlüğüne kaydeder. Örneğin `candy_textures["red"]` artık `red.png` dosyasının texture'ını tutar.
- `var path: String` — Godot 4.6'da değişkenin tipini açıkça belirtiyoruz. `:=` operatörü string birleştirme sonucunun tipini her zaman çıkaramadığı için `var path: String = ...` şeklinde yazıyoruz.
- Fonksiyon isimlerinin başındaki `_` alt çizgi, Godot'da "bu fonksiyon dışarıdan değil, sadece bu script içinden çağrılır" anlamına gelen bir **gelenektir** (convention).

---

## 2.5 — Grid'i Rastgele Doldurma (Eşleşmesiz)

Şimdi en önemli kısım: tahtayı rastgele şekerlerle dolduracağız ama **başlangıçta hiçbir yerde 3'lü eşleşme olmamasını** garanti edeceğiz.

```gdscript
func _init_grid() -> void:
	# 8x8 boş grid oluştur
	grid.clear()
	for row in GRID_SIZE:
		var grid_row := []
		for col in GRID_SIZE:
			grid_row.append("")
		grid.append(grid_row)

	# Her hücreye eşleşme oluşturmayan rastgele şeker yerleştir
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var available := CANDY_TYPES.duplicate()
			# Solda 2 aynı renk varsa o rengi çıkar
			if col >= 2 and grid[row][col - 1] == grid[row][col - 2]:
				available.erase(grid[row][col - 1])
			# Üstte 2 aynı renk varsa o rengi çıkar
			if row >= 2 and grid[row - 1][col] == grid[row - 2][col]:
				available.erase(grid[row - 1][col])
			grid[row][col] = available[randi() % available.size()]
```

**Bu nasıl çalışıyor? Adım adım:**

1. Önce 8x8'lik boş bir dizi oluşturuyoruz (her hücre boş string `""`).
2. Sonra her hücreyi sol üstten sağ alta doğru dolduruyoruz.
3. Her hücre için 5 rengin kopyasını alıyoruz (`available`).
4. **Yatay kontrol:** Eğer soldaki 2 hücre aynı renkse (örneğin ikisi de "red"), bu hücreye "red" koyarsak 3'lü eşleşme olur. O yüzden "red"i listeden çıkarıyoruz.
5. **Dikey kontrol:** Aynı mantık üstteki 2 hücre için.
6. Kalan renklerden rastgele birini seçiyoruz.

> **Neden `available` listesi her zaman en az 1 eleman içerir?** En kötü durumda hem yatayda hem dikeyde birer renk çıkarılır = 5 - 2 = 3 renk kalır. Yani her zaman seçim yapılabilir.

---

## 2.6 — Şekerleri Ekrana Çizme

Şimdi `grid` dizisindeki verileri gerçek görsellere dönüştürelim:

```gdscript
func _draw_candies() -> void:
	# Önceki sprite'ları temizle
	candy_sprites.clear()
	for child in get_children():
		if child.name != "Grid":
			child.queue_free()

	# Her hücre için sprite oluştur
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
```

**Satır satır açıklama:**

- `candy_sprites.clear()` — Önceki görsel referanslarını temizliyoruz.
- `get_children()` döngüsü — Game düğümünün altındaki tüm çocuk düğümleri dolaşır. Grid sprite'ı hariç hepsini siler (`queue_free()` düğümü güvenli şekilde kaldırır).
- İç döngüde her hücre için:
  - `Sprite2D.new()` — Kod ile yeni bir sprite düğümü oluşturur.
  - `.texture` — Önceden yüklediğimiz texture'ı atar.
  - `.scale` — 82px'lik görseli 64px hücreye sığdırır.
  - `.position` — Hücrenin ekrandaki piksel konumu (bir sonraki fonksiyonda hesaplanacak).
  - `add_child(sprite)` — Sprite'ı Game düğümünün çocuğu olarak sahneye ekler.

---

## 2.7 — Hücre Pozisyonu Hesaplama

Grid koordinatlarını (satır, sütun) ekran piksellerine çeviren yardımcı fonksiyon:

```gdscript
func _grid_to_pixel(row: int, col: int) -> Vector2:
	var x := GRID_OFFSET.x + col * CELL_SIZE + CELL_SIZE / 2
	var y := GRID_OFFSET.y + row * CELL_SIZE + CELL_SIZE / 2
	return Vector2(x, y)
```

**Açıklama:**

- `GRID_OFFSET.x + col * CELL_SIZE` → Hücrenin sol kenarının x pozisyonu
- `+ CELL_SIZE / 2` → Sprite merkezden konumlandığı için yarım hücre kaydırıyoruz ki görselin merkezi hücrenin merkezine gelsin
- Aynı mantık y ekseni için de geçerli

**Görsel olarak:**

```
GRID_OFFSET (24, 225)
    ↓
    ┌────┬────┬────┬─── ...
    │ 0,0│ 0,1│ 0,2│
    ├────┼────┼────┼─── ...
    │ 1,0│ 1,1│ 1,2│
    ├────┼────┼────┼─── ...

Hücre (0,0) merkezi: (24 + 0*64 + 32, 225 + 0*64 + 32) = (56, 257)
Hücre (0,1) merkezi: (24 + 1*64 + 32, 225 + 0*64 + 32) = (120, 257)
```

---

## 2.8 — Tam Kod (game.gd)

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
```

---

## 2.9 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

Şunu görmelisiniz:

```
┌─────────────────────────┐
│                         │
│       (boş alan)        │
│                         │
│ ┌─────────────────────┐ │
│ │ 🔴🟡🔵🟢🟣🔴🟡🔵│ │
│ │ 🟢🔴🟡🔵🟢🟣🔴🟡│ │
│ │ 🟡🟢🟣🔴🟡🔵🟢🔴│ │
│ │  ... rastgele ...   │ │
│ │ 🔵🟣🔴🟡🟢🔵🟣🔴│ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

- Grid arka planı üzerinde renkli şekerler rastgele dizilmiş olmalı
- Hiçbir yerde yatay veya dikey 3 aynı renk yan yana olmamalı
- Her çalıştırdığınızda farklı bir düzen göreceksiniz

**Sorun giderme:**

- **Şekerler grid'in dışında mı?** → `GRID_OFFSET` değerlerini kontrol edin
- **Şekerler çok büyük/küçük mü?** → `CANDY_SCALE` değerini ayarlayın
- **Hata mesajı mı var?** → Output panelinde (altta) hata mesajını okuyun

> **Sonraki bölümde:** Şekerlere tıklama, seçme ve iki şekeri yer değiştirme (swap) mekaniklerini ekleyeceğiz.
