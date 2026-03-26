---
title: "Godot Engine Oyun Mekanikleri - Bölüm 9: Candy Blast — Kalıcı Hafıza: Kayıt, Yükleme ve Global Skor"
date: 2026-03-30 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, save-load, json, kalıcı-hafıza]
description: "Godot'da kayıt ve yükleme: JSON ile oyun verisi saklama, global skor takibi. FileAccess ve Autoload kullanımı. Türkçe rehber."
permalink: /godot-oyun-mekanikleri-bolum-9/
published: true
---

# Bölüm 9: Kalıcı Hafıza — Kayıt, Yükleme ve Global Skor

Şu ana kadar oyunumuz her kapatıldığında sıfırdan başlıyordu. Bu bölümde oyuncunun ilerlemesini diske kaydedip, oyun açıldığında kaldığı yerden devam etmesini sağlayacağız.

**Bu bölümde eklenecekler:**

- Oyun durumunu JSON dosyasına kaydetme
- Oyun açıldığında kaydedilmiş durumu yükleme
- Tüm seviyelerdeki toplam puanı tutan **global skor**
- En yüksek skoru tutan **high score**
- Otomatik kayıt (seviye geçişi ve game over sonrası)
- UI'da global skor ve high score gösterimi

---

## 9.1 — Kayıt Sistemi Tasarımı

Kaydetmemiz gereken veriler:

| Veri | Açıklama |
|------|----------|
| `level` | Oyuncunun ulaştığı seviye |
| `total_score` | Tüm seviyelerde kazanılan toplam puan |
| `high_score` | Tek bir seviyede ulaşılan en yüksek puan |

**Neden grid durumunu kaydetmiyoruz?** Grid zaten her seviyede rastgele üretiliyor. Oyuncu seviye 5'te kapatıp açtığında, seviye 5 yeni bir grid ile başlar — bu Match-3 oyunlarının standart davranışıdır.

**Kayıt formatı:** JSON — hem okunabilir hem de Godot'ta kolay işlenir.

**Kayıt yolu:** `user://save_data.json` — Godot'un platforma özel kullanıcı dizini:
- **Windows:** `%APPDATA%\Godot\app_userdata\CandyBlast\`
- **macOS:** `~/Library/Application Support/Godot/app_userdata/CandyBlast/`
- **Linux:** `~/.local/share/godot/app_userdata/CandyBlast/`

`user://` yolunu kullanmak önemlidir çünkü `res://` yolu export sonrası **salt okunurdur**.

---

## 9.2 — Yeni Değişkenler

**Sabitler bölümüne** (`TARGET_INCREMENT` satırının altına) şunu ekleyin:

```gdscript
const SAVE_PATH := "user://save_data.json"
```

**Değişkenler bölümüne** (`popup_overlay` satırının altına) şunları ekleyin:

```gdscript
var total_score := 0
var high_score := 0
```

**Satır satır açıklama:**

```gdscript
const SAVE_PATH := "user://save_data.json"
```
Kayıt dosyasının yolu. `user://` Godot'un **kullanıcı dizini** ön ekidir — platforma göre farklı bir klasöre işaret eder (Windows'ta `%APPDATA%`, macOS'ta `~/Library/Application Support/`...). Neden `res://` değil? Çünkü `res://` yolu oyun export edildikten sonra **salt okunurdur** — dosya yazamazsınız. `user://` ise her zaman yazılabilir.

```gdscript
var total_score := 0
```
Oyuncunun tüm seviyelerde topladığı **kümülatif** puan. Her seviye bittiğinde o seviyenin skoru buraya eklenir. Oyun kapatılıp açılınca bu değer JSON'dan geri yüklenir.

```gdscript
var high_score := 0
```
Tek bir seviyede ulaşılan en yüksek puan (rekor). `score > high_score` olduğunda güncellenir. Oyuncuya "en iyi performansın bu kadardı" bilgisi verir.

---

## 9.3 — Kaydetme Fonksiyonu

Oyun durumunu JSON formatında diske yazan fonksiyon. **`_quit_game()` fonksiyonunun altına** ekleyin:

```gdscript
# --- Kayıt / Yükleme ---

func _save_game() -> void:
	var save_data := {
		"level": level,
		"total_score": total_score,
		"high_score": high_score,
	}

	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		print("Kayıt hatası: ", FileAccess.get_open_error())
		return
	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()
```

**Satır satır açıklama:**

```gdscript
func _save_game() -> void:
```
Oyun durumunu diske yazan fonksiyon. `-> void` — bir değer döndürmez.

```gdscript
	var save_data := {
		"level": level,
		"total_score": total_score,
		"high_score": high_score,
	}
```
Kaydedilecek verileri bir **Dictionary** (sözlük) içinde topluyoruz. Anahtarlar string (`"level"`, `"total_score"`, `"high_score"`), değerler ise oyun değişkenlerimiz. Bu sözlük JSON'a dönüştürülecek. **Not:** Son virgül (trailing comma) GDScript'te geçerlidir ve yeni satır eklerken hata yapmayı önler.

```gdscript
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
```
`FileAccess`, Godot'un dosya sistemi sınıfıdır. `open()` **statik** bir metottur — doğrudan sınıf üzerinden çağrılır, bir nesne oluşturmaya gerek yok. İki parametre alır:
- `SAVE_PATH` → `"user://save_data.json"` — nereye yazacağımız
- `FileAccess.WRITE` → Yazma modu. Dosya yoksa **oluşturur**, varsa **üzerine yazar** (sıfırdan)

```gdscript
	if file == null:
		print("Kayıt hatası: ", FileAccess.get_open_error())
		return
```
Dosya açılamama durumu: disk dolu, izin yok, yol geçersiz vb. durumlarda `open()` `null` döner. `FileAccess.get_open_error()` son hatanın kodunu verir. `print()` ile konsola hata mesajı yazdırıp fonksiyondan çıkıyoruz — oyun çökmez, sadece kayıt atlanır.

```gdscript
	file.store_string(JSON.stringify(save_data, "\t"))
```
İki iş bir satırda yapılıyor:
1. `JSON.stringify(save_data, "\t")` → Dictionary'yi JSON string'ine çevirir. İkinci parametre `"\t"` **girintileme** (indentation) karakteridir — bu sayede dosya güzel biçimlendirilmiş (pretty-printed) olur. Bu parametre olmadan her şey tek satırda yazılırdı.
2. `file.store_string(...)` → Oluşan JSON string'ini dosyaya yazar.

```gdscript
	file.close()
```
Dosyayı kapatır. Bu adım **zorunludur** — `close()` çağrılmadan veri tamamen diske yazılmayabilir (işletim sistemi arabelleğe alabilir). Ayrıca dosya kapanmazsa diğer işlemler bu dosyaya erişemez.

**Oluşan JSON dosyası şöyle görünür:**

```json
{
	"level": 3,
	"total_score": 4500,
	"high_score": 1850
}
```

---

## 9.4 — Yükleme Fonksiyonu

Kaydedilmiş veriyi okuyan fonksiyon:

```gdscript
func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return  # İlk açılış, kayıt yok

	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return

	var json_text: String = file.get_as_text()
	file.close()

	var json := JSON.new()
	var error := json.parse(json_text)
	if error != OK:
		print("JSON parse hatası: ", json.get_error_message())
		return

	var data: Dictionary = json.data
	level = data.get("level", 1)
	total_score = data.get("total_score", 0)
	high_score = data.get("high_score", 0)
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
```

**Satır satır açıklama:**

```gdscript
func _load_game() -> void:
```
Daha önce kaydedilmiş veriyi diskten okuyup oyun değişkenlerine yükleyen fonksiyon.

```gdscript
	if not FileAccess.file_exists(SAVE_PATH):
		return  # İlk açılış, kayıt yok
```
`FileAccess.file_exists()` statik bir metot — dosya var mı diye kontrol eder. Oyun ilk kez çalışıyorsa kayıt dosyası henüz yoktur → `return` ile fonksiyondan çıkıyoruz. Bu durumda tüm değişkenler varsayılan değerlerinde kalır (`level = 1`, `total_score = 0`, `high_score = 0`).

```gdscript
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
```
Dosyayı **okuma** modunda (`READ`) açıyoruz. Yazma modundan farklı olarak, dosya üzerinde değişiklik yapamayız — sadece içeriğini okuyabiliriz. `null` kontrolü: dosya varsa bile bozuksa veya erişim izni yoksa `null` dönebilir.

```gdscript
	var json_text: String = file.get_as_text()
	file.close()
```
`get_as_text()` → Dosyanın **tüm** içeriğini tek bir string olarak okur. Bizim dosyamız küçük olduğu için (birkaç satır JSON) bu sorun değil, ama büyük dosyalar için satır satır okumak daha iyi olurdu. `close()` ile dosyayı hemen kapatıyoruz — artık ihtiyacımız yok.

```gdscript
	var json := JSON.new()
	var error := json.parse(json_text)
```
JSON parse işlemi iki adımda yapılıyor:
1. `JSON.new()` → Yeni bir JSON parser nesnesi oluşturuyoruz. `_save_game`'deki `JSON.stringify()` statik bir metottu ama `parse()` bir **nesne metodu** — bu yüzden önce `new()` ile nesne oluşturmamız gerekiyor.
2. `json.parse(json_text)` → JSON string'ini parse eder ve sonucu `json.data` içinde saklar. Hata kodu döner: `OK` (başarılı) veya bir hata enum'u.

```gdscript
	if error != OK:
		print("JSON parse hatası: ", json.get_error_message())
		return
```
Parse başarısız olduysa (dosya bozulmuş, geçersiz JSON formatı vb.) hata mesajı yazdırıp çıkıyoruz. `OK` Godot'un built-in enum değeridir (sayısal olarak 0). `get_error_message()` hatanın detaylı açıklamasını döner.

```gdscript
	var data: Dictionary = json.data
```
Parse başarılıysa, `json.data` bize bir Variant (Godot'un genel tip) döner. Biz bunun Dictionary olduğunu biliyoruz (çünkü biz yazdık), `Dictionary` tipine atıyoruz.

```gdscript
	level = data.get("level", 1)
	total_score = data.get("total_score", 0)
	high_score = data.get("high_score", 0)
```
`data.get(anahtar, varsayılan)` → Dictionary'den değer alır. **İkinci parametre kritik:** Eğer anahtar bulunamazsa varsayılan değer döner. Bu, **ileriye uyumluluk** sağlar — ileride yeni bir alan eklersek (mesela `"achievements"`), eski kayıt dosyalarında bu alan olmaz ama oyun patlamaz, varsayılan değer kullanılır. Doğrudan `data["level"]` yazsaydık, anahtar yoksa hata alırdık.

```gdscript
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
```
Hedef skoru yüklenen seviyeye göre yeniden hesaplıyoruz. Bu değeri kayıt dosyasında saklamıyoruz çünkü formülden türetilebilir — gereksiz veri kaydetmek yerine hesaplıyoruz. Bu, **veri normalizasyonu** ilkesidir.

---

## 9.5 — Kaydetme Noktaları

Oyunun hangi anlarda kaydedileceğini belirleyelim:

1. **Seviye tamamlandığında** — yeni seviye ve güncel puanlar kaydedilir
2. **Game over sonrası "Tekrar Oyna" seçildiğinde** — ilerleme kaydedilir
3. **Oyundan çıkarken** — son durum kaydedilir

**`_start_next_level()` fonksiyonunu** güncelleyin:

```gdscript
func _start_next_level() -> void:
	_close_popup()
	# Global skoru güncelle
	total_score += score
	if score > high_score:
		high_score = score
	# Yeni seviye
	level += 1
	score = 0
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	chain_count = 0
	_save_game()
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false
```

**Satır satır açıklama:**

```gdscript
	total_score += score
```
Tamamlanan seviyenin skorunu toplam skora ekliyoruz. `+=` operatörü: `total_score = total_score + score` ile aynı. Bu satır **`score = 0`'dan önce** olmalı — aksi halde sıfır eklemiş oluruz.

```gdscript
	if score > high_score:
		high_score = score
```
Bu seviyedeki skor rekordan yüksekse güncelliyoruz. Basit bir "en büyüğü bul" mantığı.

```gdscript
	_save_game()
```
Güncellenmiş `level`, `total_score` ve `high_score` değerlerini diske kaydediyoruz. Bu, `_init_grid()`'den **önce** yapılmalı — grid oluşturma sırasında bir hata olursa bile ilerleme korunur.

Diğer satırlar Bölüm 8'deki ile aynı: seviyeyi artır, skoru sıfırla, tahtayı yenile.

---

**`_restart_game()` fonksiyonunu** güncelleyin:

```gdscript
func _restart_game() -> void:
	_close_popup()
	# Mevcut skoru global'e ekle
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	# Oyunu sıfırla ama seviyeyi koru (kaldığı seviyeden devam)
	score = 0
	moves_left = BASE_MOVES
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false
```

**Satır satır açıklama:**

Bölüm 8'deki `_restart_game()`'ten iki kritik fark var:

1. **`total_score += score` ve high score kontrolü:** Game over olsa bile oyuncunun kazandığı puanlar korunuyor. Adil bir yaklaşım — 15 hamle oynadıysa o puanlar kaybolmasın.

2. **`level = 1` satırı YOK!** Bölüm 8'de `_restart_game()` seviyeyi 1'e sıfırlıyordu. Artık oyuncu **kaldığı seviyeden** tekrar deniyor. Game over → "Tekrar Oyna" → aynı seviyeyi yeni bir tahtayla tekrar başlatır. Bu, oyuncunun ilerlemesini korur.

3. **`_save_game()`:** Skor ve ilerleme kaydediliyor — böylece oyuncu "Tekrar Oyna" yerine "Çıkış"ı seçse bile, sonraki açılışta kaldığı yerden devam eder.

---

**`_quit_game()` fonksiyonunu** güncelleyin:

```gdscript
func _quit_game() -> void:
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	get_tree().quit()
```

**Satır satır açıklama:**

```gdscript
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
```
Çıkmadan önce son durumu kaydediyoruz. Aynı `total_score += score` ve high score kontrolü burada da var. Üç fonksiyonda da (`_start_next_level`, `_restart_game`, `_quit_game`) bu üç satır tekrarlanıyor — her çıkış noktasında veri kaybını önlemek için.

```gdscript
	get_tree().quit()
```
Kayıt tamamlandıktan sonra oyunu kapatıyoruz. Sıralama önemli: önce kaydet, sonra kapat.

---

## 9.6 — Yüklemeyi _ready()'e Ekleme

**`_ready()` fonksiyonunu** güncelleyin — yükleme, grid oluşturmadan **önce** yapılmalı:

```gdscript
func _ready() -> void:
	_load_textures()
	_load_game()
	_init_grid()
	_draw_candies()
	_setup_ui()
```

**Satır satır açıklama:**

```gdscript
func _ready() -> void:
	_load_textures()
	_load_game()       # ← YENİ
	_init_grid()
	_draw_candies()
	_setup_ui()
```

Çağrı sırası çok önemli:
1. `_load_textures()` → Görselleri yükle (her zaman gerekli)
2. **`_load_game()`** → Kaydedilmiş `level`, `total_score`, `high_score` değerlerini oku. Bu, `_init_grid()`'den **önce** yapılmalı — çünkü grid oluşturma henüz seviyeye bağlı olmasa da, `target_score` doğru hesaplanmalı
3. `_init_grid()` → Yeni tahta oluştur (kayıttan seviye yüklendikten sonra)
4. `_draw_candies()` → Tahtayı çiz
5. `_setup_ui()` → UI'ı hazırla ve `_update_ui()` ile `total_score`/`high_score` dahil tüm değerleri göster

Eğer `_load_game()` ilk açılışta dosya bulamazsa, tüm değişkenler varsayılan değerlerinde kalır — oyun normal başlar.

---

## 9.7 — UI Güncellemesi

Global skoru ve high score'u ekrana ekleyelim. Bunları grid'in altındaki boş alanda göstereceğiz.

Önce **sahneye iki yeni Label** ekleyin (Godot Editor'da veya `.tscn` dosyasını düzenleyerek):

```
Game (Node2D)
├── Grid (Sprite2D)
├── ScoreLabel (Label)
├── MovesLabel (Label)
├── LevelLabel (Label)
├── TargetLabel (Label)
├── TotalScoreLabel (Label)    ← YENİ
└── HighScoreLabel (Label)     ← YENİ
```

**`_setup_ui()` fonksiyonuna**, `_update_ui()` çağrısından **önce** şunları ekleyin:

```gdscript
	var total_label: Label = $TotalScoreLabel
	total_label.position = Vector2(20, 750)
	total_label.size = Vector2(260, 30)
	total_label.add_theme_font_size_override("font_size", 18)
	total_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))

	var high_label: Label = $HighScoreLabel
	high_label.position = Vector2(296, 750)
	high_label.size = Vector2(260, 30)
	high_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	high_label.add_theme_font_size_override("font_size", 18)
	high_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
```

**Satır satır açıklama:**

```gdscript
	var total_label: Label = $TotalScoreLabel
	total_label.position = Vector2(20, 750)
	total_label.size = Vector2(260, 30)
	total_label.add_theme_font_size_override("font_size", 18)
	total_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
```
- `$TotalScoreLabel` → Sahne ağacındaki yeni Label node'una erişiyoruz.
- `position = Vector2(20, 750)` → Grid'in altında, ekranın alt kısmına yerleştiriyoruz. Y=750 değeri grid alanının (225 + 8×64 = 737) hemen altıdır.
- `size = Vector2(260, 30)` → Ekranın sol yarısını kaplıyor. Diğer label'lardan daha küçük (30px yükseklik) çünkü bu ikincil bilgi.
- `font_size = 18` → Diğer label'lardan daha küçük font — ana skor (24px) ve seviye bilgisi (20px) daha önemli, toplam ve rekor ikincil bilgi.
- `Color(0.7, 0.7, 0.7)` → Gri renk. RGB her kanalda 0.7 → açık gri. Beyaz ve sarıdan daha sönük — görsel hiyerarşi oluşturuyoruz: önemli bilgiler parlak, ikincil bilgiler sönük.

```gdscript
	var high_label: Label = $HighScoreLabel
	high_label.position = Vector2(296, 750)
	high_label.size = Vector2(260, 30)
	high_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
```
Rekor label'ı sağ tarafa hizalı (`HORIZONTAL_ALIGNMENT_RIGHT`). Position X=296 ve size X=260 ile tam sağ kenara yaslanıyor (`296 + 260 = 556`, neredeyse 576'lık viewport genişliği). Toplam sol, rekor sağ — Skor/Hamle ikilisiyle aynı düzen.

---

**`_update_ui()` fonksiyonuna** iki satır ekleyin:

```gdscript
func _update_ui() -> void:
	$ScoreLabel.text = "Skor: " + str(score)
	$MovesLabel.text = "Hamle: " + str(moves_left)
	$LevelLabel.text = "Seviye: " + str(level)
	$TargetLabel.text = "Hedef: " + str(target_score)
	$TotalScoreLabel.text = "Toplam: " + str(total_score)
	$HighScoreLabel.text = "Rekor: " + str(high_score)
```

Son iki satır yeni: `$TotalScoreLabel` ve `$HighScoreLabel`'ın metinlerini güncelliyoruz. `str()` ile sayıları stringe çevirip label'a atıyoruz. `_update_ui()` her skor değişikliğinde çağrıldığı için toplam ve rekor da otomatik güncellenir.

**Ekran düzeni:**

```
┌──────────────────────────────────┐
│ Skor: 450        Hamle: 15      │  ← Beyaz, 24px
│ Seviye: 3        Hedef: 2000    │  ← Sarı, 20px
│                                  │
│         [GRID ALANI]             │
│                                  │
│ Toplam: 4500     Rekor: 1850    │  ← Gri, 18px
└──────────────────────────────────┘
```

---

## 9.8 — Tam Kod (game.gd)

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
const SAVE_PATH := "user://save_data.json"

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
var popup_overlay: ColorRect = null
var total_score := 0
var high_score := 0

func _ready() -> void:
	_load_textures()
	_load_game()
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

	var total_label: Label = $TotalScoreLabel
	total_label.position = Vector2(20, 750)
	total_label.size = Vector2(260, 30)
	total_label.add_theme_font_size_override("font_size", 18)
	total_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))

	var high_label: Label = $HighScoreLabel
	high_label.position = Vector2(296, 750)
	high_label.size = Vector2(260, 30)
	high_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	high_label.add_theme_font_size_override("font_size", 18)
	high_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))

	_update_ui()

func _update_ui() -> void:
	$ScoreLabel.text = "Skor: " + str(score)
	$MovesLabel.text = "Hamle: " + str(moves_left)
	$LevelLabel.text = "Seviye: " + str(level)
	$TargetLabel.text = "Hedef: " + str(target_score)
	$TotalScoreLabel.text = "Toplam: " + str(total_score)
	$HighScoreLabel.text = "Rekor: " + str(high_score)

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
		_clear_cell(cell)

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

	# Bonusu önce temizle (zincirleme _clear_cell ile halledilecek)
	_add_bonus_score(bonus_type)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

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

	var cell_type: String = grid[cell.x][cell.y]

	# Önce hücreyi temizle (sonsuz döngüyü önler)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

	# Silinen hücre bonus ise → zincirleme tetikle
	if BONUS_TYPES.has(cell_type):
		_add_bonus_score(cell_type)
		match cell_type:
			"arrow_h":
				_activate_arrow_h(cell)
			"arrow_v":
				_activate_arrow_v(cell)
			"bomb":
				_activate_bomb(cell)
			"rainbow":
				_activate_rainbow()

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

# --- Seviye ve Popup Sistemi ---

func _check_level_status() -> void:
	if score >= target_score:
		_level_complete()
	elif moves_left <= 0:
		_game_over()

func _level_complete() -> void:
	is_animating = true
	var next_level := level + 1
	var info: String = "Skor: " + str(score) + "\nSeviye " + str(next_level) + " hazır!"
	_show_popup(
		"TEBRİKLER!",
		info,
		"Sonraki Seviye",
		_start_next_level,
		"Çıkış",
		_quit_game
	)

func _game_over() -> void:
	is_animating = true
	var info: String = "Skor: " + str(score) + "\nSeviye: " + str(level)
	_show_popup(
		"OYUN BİTTİ!",
		info,
		"Tekrar Oyna",
		_restart_game,
		"Çıkış",
		_quit_game
	)

func _show_popup(title: String, info: String, button1_text: String, button1_action: Callable, button2_text: String, button2_action: Callable) -> void:
	is_animating = true

	# --- Karartma Katmanı ---
	popup_overlay = ColorRect.new()
	popup_overlay.color = Color(0, 0, 0, 0.6)
	popup_overlay.position = Vector2.ZERO
	popup_overlay.size = Vector2(576, 1024)
	add_child(popup_overlay)

	# --- Panel Arka Planı ---
	var panel := ColorRect.new()
	panel.color = Color(0.15, 0.15, 0.25, 0.95)
	panel.size = Vector2(400, 320)
	panel.position = Vector2(88, 340)
	popup_overlay.add_child(panel)

	# --- Başlık ---
	var title_label := Label.new()
	title_label.text = title
	title_label.position = Vector2(0, 20)
	title_label.size = Vector2(400, 50)
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 32)
	title_label.add_theme_color_override("font_color", Color.YELLOW)
	panel.add_child(title_label)

	# --- Bilgi ---
	var info_label := Label.new()
	info_label.text = info
	info_label.position = Vector2(0, 80)
	info_label.size = Vector2(400, 80)
	info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info_label.add_theme_font_size_override("font_size", 22)
	info_label.add_theme_color_override("font_color", Color.WHITE)
	panel.add_child(info_label)

	# --- Buton 1 ---
	var btn1 := Button.new()
	btn1.text = button1_text
	btn1.position = Vector2(75, 180)
	btn1.size = Vector2(250, 50)
	btn1.add_theme_font_size_override("font_size", 20)
	btn1.pressed.connect(button1_action)
	panel.add_child(btn1)

	# --- Buton 2 ---
	var btn2 := Button.new()
	btn2.text = button2_text
	btn2.position = Vector2(75, 245)
	btn2.size = Vector2(250, 50)
	btn2.add_theme_font_size_override("font_size", 20)
	btn2.pressed.connect(button2_action)
	panel.add_child(btn2)

func _close_popup() -> void:
	if popup_overlay != null:
		popup_overlay.queue_free()
		popup_overlay = null

func _start_next_level() -> void:
	_close_popup()
	total_score += score
	if score > high_score:
		high_score = score
	level += 1
	score = 0
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	chain_count = 0
	_save_game()
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _restart_game() -> void:
	_close_popup()
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	score = 0
	moves_left = BASE_MOVES
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _quit_game() -> void:
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	get_tree().quit()

# --- Kayıt / Yükleme ---

func _save_game() -> void:
	var save_data := {
		"level": level,
		"total_score": total_score,
		"high_score": high_score,
	}

	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		print("Kayıt hatası: ", FileAccess.get_open_error())
		return
	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return

	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return

	var json_text: String = file.get_as_text()
	file.close()

	var json := JSON.new()
	var error := json.parse(json_text)
	if error != OK:
		print("JSON parse hatası: ", json.get_error_message())
		return

	var data: Dictionary = json.data
	level = data.get("level", 1)
	total_score = data.get("total_score", 0)
	high_score = data.get("high_score", 0)
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
```

---

## 9.9 — Sahne Dosyası Güncelleme

Sahneye iki yeni Label ekleyin:

```
Game (Node2D)
├── Grid (Sprite2D)
├── ScoreLabel (Label)
├── MovesLabel (Label)
├── LevelLabel (Label)
├── TargetLabel (Label)
├── TotalScoreLabel (Label)    ← YENİ
└── HighScoreLabel (Label)     ← YENİ
```

---

## 9.10 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| İlk açılış | Seviye 1, Toplam: 0, Rekor: 0 |
| Birkaç eşleşme yap | Skor artar, Toplam ve Rekor değişmez (henüz kaydedilmedi) |
| Seviye tamamla → "Sonraki Seviye" | Toplam güncellenir, yüksek skorsa Rekor güncellenir |
| Oyunu kapat → tekrar aç | Seviye korunur! Aynı seviyeden devam eder |
| Toplam ve Rekor değerleri | Kapatıp açınca korunur |
| Game over → "Tekrar Oyna" | Aynı seviyeden tekrar başlar (1'e dönmez) |
| Game over → "Çıkış" → tekrar aç | Seviye ve skorlar korunur |

**Kayıt dosyasını görmek isterseniz:**

Windows'ta `%APPDATA%\Godot\app_userdata\CandyBlast\save_data.json` dosyasını açabilirsiniz (proje adınız `CandyBlast` ise).

> **Seri özeti:** 9 bölümde sıfırdan tam bir Match-3 oyunu geliştirdik — grid yapısı, eşleşme algoritması, yerçekimi, bonus mekanikleri, skor sistemi, seviye yönetimi ve kalıcı kayıt sistemi. Tebrikler!
