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

**`_ready()` — Satır satır açıklama:**

```
func _ready() -> void:
```
- `func` → GDScript'te fonksiyon tanımlama anahtar kelimesi.
- `_ready()` → Godot'un **yerleşik yaşam döngüsü** (lifecycle) fonksiyonudur. Düğüm sahne ağacına eklendiğinde Godot bu fonksiyonu **otomatik olarak bir kez** çağırır. Yani oyun başladığında bu fonksiyon çalışır.
- `-> void` → Bu fonksiyon geriye hiçbir değer döndürmez. GDScript'te `void` dönüş tipi "bu fonksiyon bir iş yapar ama sonuç üretmez" demektir.

```
	_load_textures()
	_init_grid()
	_draw_candies()
```
- Üç fonksiyonu **sırasıyla** çağırıyoruz. Sıra önemlidir: önce görsel dosyaları yükle, sonra mantıksal tahtayı oluştur, en son görselleri ekrana yerleştir. Eğer sıra değişirse, örneğin texture yüklenmeden çizim yapılırsa hata alırsınız.
- Fonksiyon isimlerinin başındaki `_` alt çizgi, Godot'da "bu fonksiyon dışarıdan değil, sadece bu script içinden çağrılır" anlamına gelen bir **gelenektir** (convention). Zorunlu değildir ama tüm Godot topluluğu bu kurala uyar.

---

**`_load_textures()` — Satır satır açıklama:**

```
func _load_textures() -> void:
```
- Texture (görsel dosyası) yükleme fonksiyonumuz. Oyun başında bir kez çağrılır.

```
	for candy_name in CANDY_TYPES:
```
- `CANDY_TYPES` dizisi üzerinde döngü kurar. Sırasıyla `candy_name` değişkeni `"red"`, `"yellow"`, `"blue"`, `"green"`, `"purple"` değerlerini alır.

```
		var path: String = "res://assets/images/" + candy_name + ".png"
```
- Dosya yolunu string birleştirme ile oluşturuyoruz. Örneğin `candy_name = "red"` ise → `"res://assets/images/red.png"`.
- `var path: String` — Godot 4.6'da `:=` operatörü string birleştirme sonucunun tipini her zaman çıkaramadığı için tip bilgisini açıkça yazıyoruz. Bu Godot 4.6'ya özgü bir gerekliliktir.
- `res://` → Godot'un proje kök dizinini temsil eden sanal yoldur. Gerçek dosya sistemi yolu yerine bu sanal yolu kullanırız, böylece oyun hangi platformda çalışırsa çalışsın doğru dosyayı bulur.

```
		candy_textures[candy_name] = load(path)
```
- `load()` → Godot'un yerleşik fonksiyonudur. Verilen yoldaki dosyayı diskten okuyup bellekte bir **Resource** nesnesine dönüştürür. PNG dosyaları için bu bir `Texture2D` nesnesi olur.
- `candy_textures[candy_name]` → Sözlüğe (Dictionary) yeni bir anahtar-değer çifti ekler. Örneğin `candy_textures["red"]` artık `red.png` dosyasının texture'ını tutar.
- Neden önceden yüklüyoruz? Her şekeri çizerken `load()` çağırmak yerine bir kez yükleyip sözlükte saklamak **çok daha performanslıdır**. 64 şeker × her kare = sürekli disk okuma yerine, 5 kez yükle + sözlükten oku.

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

**Satır satır açıklama:**

```
func _init_grid() -> void:
```
- Grid'i sıfırdan oluşturan fonksiyon. Oyun başında ve her seviye geçişinde çağrılır.

```
	grid.clear()
```
- `grid` dizisinin içini tamamen boşaltır. Seviye geçişlerinde eski grid verisini temizlemek için gerekli. İlk çalıştırmada zaten boş ama temizlemek güvenli bir alışkanlıktır.

```
	for row in GRID_SIZE:
		var grid_row := []
		for col in GRID_SIZE:
			grid_row.append("")
		grid.append(grid_row)
```
- `for row in GRID_SIZE` → `row` değişkeni 0'dan 7'ye kadar (toplam 8) döner. GDScript'te `for i in N` yazarsak, `i` 0, 1, 2, ..., N-1 değerlerini alır.
- Her satır için boş bir `grid_row` dizisi oluşturuyoruz.
- İç döngüde her sütun için boş string `""` ekliyoruz.
- Sonuçta `grid` şöyle bir yapıya sahip olur: `[["","","",...""], ["","","",...""], ...]` — 8 satır, her satırda 8 boş hücre.

```
	for row in GRID_SIZE:
		for col in GRID_SIZE:
```
- İkinci geçişte tüm hücreleri sol üstten (0,0) sağ alta (7,7) doğru dolduruyoruz. Bu sıra önemlidir çünkü kontrol ettiğimiz sol ve üst hücreler zaten dolu olmalı.

```
			var available := CANDY_TYPES.duplicate()
```
- `CANDY_TYPES.duplicate()` → Orijinal dizinin bir **kopyasını** oluşturur: `["red", "yellow", "blue", "green", "purple"]`. Kopyasını almamız şart çünkü aşağıda bu diziden eleman çıkaracağız — orijinali değiştirmek istemeyiz.

```
			if col >= 2 and grid[row][col - 1] == grid[row][col - 2]:
				available.erase(grid[row][col - 1])
```
- **Yatay kontrol:** `col >= 2` → En az 2 sütun geride bakabilecek kadar ilerdeyiz mi? (0. ve 1. sütunlarda sol tarafta 2 hücre yok).
- `grid[row][col - 1] == grid[row][col - 2]` → Soldaki iki hücre aynı renk mi? Örneğin ikisi de `"red"` ise, bu hücreye de `"red"` koyarsak 3'lü eşleşme olur.
- `available.erase(grid[row][col - 1])` → O rengi kullanılabilir listesinden çıkar. `erase()` diziden belirtilen elemanı siler. Artık bu renk seçilemez.

```
			if row >= 2 and grid[row - 1][col] == grid[row - 2][col]:
				available.erase(grid[row - 1][col])
```
- **Dikey kontrol:** Aynı mantık ama bu sefer üstteki iki hücreye bakıyoruz. `row - 1` bir üst satır, `row - 2` iki üst satır.

```
			grid[row][col] = available[randi() % available.size()]
```
- `randi()` → Godot'un yerleşik rastgele tam sayı üreten fonksiyonu.
- `% available.size()` → Modülo (kalan) operatörü ile sonucu `0` ile `available.size() - 1` arasına sınırlıyoruz. Örneğin listede 4 eleman kaldıysa, `randi() % 4` → 0, 1, 2 veya 3 döner.
- `available[...]` → Listeden rastgele bir renk seçilir ve grid'e yazılır.

> **Neden `available` listesi her zaman en az 1 eleman içerir?** 5 renkten en kötü durumda hem yatayda hem dikeyde birer renk çıkarılır = 5 - 2 = 3 renk kalır. Yani her zaman en az 3 seçenek mevcuttur ve program asla boş listeden seçim yapmak zorunda kalmaz.

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

```
	candy_sprites.clear()
```
- Önceki görsel referanslarını temizliyoruz. Seviye geçişlerinde eski sprite referanslarının kalmamasını sağlar.

```
	for child in get_children():
		if child.name != "Grid":
			child.queue_free()
```
- `get_children()` → Game düğümünün altındaki **tüm çocuk düğümleri** bir dizi olarak döndürür (Grid sprite'ı, eski şeker sprite'ları vs.).
- `child.name != "Grid"` → Grid arka plan görseli hariç tüm çocukları siliyoruz. Grid'i silmemeliyiz çünkü o tahtanın arka plan çizgilerini gösterir.
- `queue_free()` → Düğümü sahne ağacından **güvenli şekilde** kaldırır. "Güvenli" demek: Godot mevcut frame'i bitirdikten sonra siler, böylece silme işlemi sırasında hata oluşmaz. `free()` yerine `queue_free()` kullanmak Godot'ta standart uygulamadır.

```
	for row in GRID_SIZE:
		var sprite_row := []
```
- Her satır için boş bir sprite referans dizisi oluşturuyoruz. Bu dizi o satırdaki sprite'ları tutacak.

```
		for col in GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				sprite_row.append(null)
				continue
```
- `grid[row][col]` → Mantıksal grid'den bu hücrenin şeker türünü okuyoruz (örneğin `"red"`).
- Eğer hücre boşsa (`""`) → sprite listesine `null` ekliyoruz (bu hücrede görsel yok) ve `continue` ile döngünün sonraki iterasyonuna atlıyoruz. İlk oluşturmada boş hücre olmaz ama ileride yerçekimi sonrası boş hücreler oluşacak.

```
			var sprite := Sprite2D.new()
```
- `Sprite2D.new()` → **Kod ile** yeni bir Sprite2D düğümü oluşturur. Godot Editor'da "Add Node" ile yaptığımız işlemin aynısını kodda yapıyoruz. Bu düğüm henüz sahneye eklenmedi, sadece bellekte var.

```
			sprite.texture = candy_textures[candy_type]
```
- Daha önce `_load_textures()` ile yüklediğimiz texture'ı sprite'a atıyoruz. Örneğin `candy_type = "blue"` ise → `candy_textures["blue"]` = `blue.png`'nin texture'ı.

```
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
```
- Sprite'ın hem x hem y ekseninde ölçeğini `0.63` yapıyoruz. 82px × 0.63 ≈ 52px ile şeker, 64px'lik hücrenin içine güzel oturur ve grid çizgilerinin üstüne taşmaz.

```
			sprite.position = _grid_to_pixel(row, col)
```
- Grid koordinatlarını (satır, sütun) ekran piksellerine çeviriyoruz. Bu fonksiyonu bir sonraki bölümde yazacağız.

```
			add_child(sprite)
			sprite_row.append(sprite)
		candy_sprites.append(sprite_row)
```
- `add_child(sprite)` → Sprite'ı Game düğümünün **çocuğu** olarak sahne ağacına ekler. Bu adımdan sonra sprite ekranda görünür hale gelir. Godot'ta bir düğüm sahne ağacına eklenmeden ekranda görünmez.
- `sprite_row.append(sprite)` → Sprite referansını satır dizisine ekliyoruz.
- `candy_sprites.append(sprite_row)` → Tamamlanan satırı ana diziye ekliyoruz. Sonuçta `candy_sprites[row][col]` ile herhangi bir hücrenin sprite'ına erişebiliyoruz.

---

## 2.7 — Hücre Pozisyonu Hesaplama

Grid koordinatlarını (satır, sütun) ekran piksellerine çeviren yardımcı fonksiyon:

```gdscript
func _grid_to_pixel(row: int, col: int) -> Vector2:
	var x := GRID_OFFSET.x + col * CELL_SIZE + CELL_SIZE / 2
	var y := GRID_OFFSET.y + row * CELL_SIZE + CELL_SIZE / 2
	return Vector2(x, y)
```

**Satır satır açıklama:**

```
func _grid_to_pixel(row: int, col: int) -> Vector2:
```
- `row: int, col: int` → Grid koordinatları parametre olarak gelir. `row` = satır (0-7), `col` = sütun (0-7).
- `-> Vector2` → Bu fonksiyon bir `Vector2` (x, y çifti) döndürür. Sprite'ların pozisyonu `Vector2` tipindedir.

```
	var x := GRID_OFFSET.x + col * CELL_SIZE + CELL_SIZE / 2
```
- `GRID_OFFSET.x` → Grid'in sol kenarının ekrandaki x pozisyonu (24 piksel).
- `col * CELL_SIZE` → Kaçıncı sütundaysak o kadar hücre genişliği kaydırıyoruz. Örneğin sütun 3 → 3 × 64 = 192 piksel.
- `CELL_SIZE / 2` → 64 / 2 = 32 piksel ekliyoruz. Neden? Sprite2D görseli **merkezinden** konumlandırılır. Hücrenin sol kenarına değil, **ortasına** yerleştirmek için yarım hücre genişliği ekliyoruz.

```
	var y := GRID_OFFSET.y + row * CELL_SIZE + CELL_SIZE / 2
```
- Aynı mantık dikey eksen için. `GRID_OFFSET.y = 225` + satır sayısı × hücre yüksekliği + yarım hücre.

```
	return Vector2(x, y)
```
- Hesaplanan x ve y'yi bir `Vector2` olarak döndürüyoruz. Bu değer doğrudan `sprite.position`'a atanabilir.

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

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='iP-YtOrW-4g' %}

---