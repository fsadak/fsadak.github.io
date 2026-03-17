---
title: "Godot Engine Oyun Mekanikleri - Bölüm 8: Candy Blast — Seviye Geçiş Ekranı, Bonus Zincirleme ve Düzeltmeler"
date: 2026-03-29 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-8/
published: true
---

Önceki bölümde seviye tamamlandığında sadece kısa bir mesaj gösterip devam ediyorduk — tahta yenilenmiyordu ve oyuncu hiçbir seçenek göremiyordu. Ayrıca iki kritik sorun vardı:

1. **Skor taşması:** Seviye geçişinde skor sıfırlanmıyordu, yeni seviyeye eski puanla başlıyorduk → 1-2 eşleşme ile hedef tutuyordu
2. **Bonus zincirleme eksik:** Bir bomba patlayıp yanındaki oku yok ettiğinde, ok da aktive olmalıydı — ama olmuyordu

**Bu bölümde yapılacaklar:**

- Seviye tamamlanınca → kutlama ekranı (skor bilgisi + "Sonraki Seviye" / "Çıkış" butonları)
- Game over olunca → bitiş ekranı (skor bilgisi + "Tekrar Oyna" / "Çıkış" butonları)
- Sonraki seviyeye geçerken tahtayı tamamen yenileme + **skoru sıfırlama**
- Yarı saydam karartma efekti (overlay)
- **Bonus zincirleme:** Silinen hücre bonus içeriyorsa otomatik aktive olması

---

## 8.1 — Tasarım Yaklaşımı

Modal ekranımız şu katmanlardan oluşacak:

```
┌────────────────────────────┐
│  ▓▓▓▓▓ Yarı saydam ▓▓▓▓▓▓  │  ← ColorRect (siyah, %50 opak)
│  ▓▓┌─────────────────┐▓▓▓  │
│  ▓▓│   TEBRİKLER!    │▓▓▓  │  ← Başlık (Label)
│  ▓▓│                 │▓▓▓  │
│  ▓▓│  Skor: 1250     │▓▓▓  │  ← Bilgi (Label)
│  ▓▓│  Seviye: 2      │▓▓▓  │
│  ▓▓│                 │▓▓▓  │
│  ▓▓│ [Sonraki Seviye]│▓▓▓  │  ← Buton 1
│  ▓▓│ [    Çıkış     ]│▓▓▓  │  ← Buton 2
│  ▓▓└─────────────────┘▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
└────────────────────────────┘
```

Tüm bu elemanları **kod ile** oluşturacağız. Böylece sahne dosyasına ek node eklememize gerek kalmaz.

**Neden kod ile?** Çünkü bu modal geçici bir UI — sadece belirli anlarda görünür ve birden fazla durumda farklı içerikle gösterilir. Kod ile oluşturmak bize esneklik sağlar.

---

## 8.2 — Modal Değişkenleri

**Değişkenler bölümüne** (`chain_count` satırının altına) şunu ekleyin:

```gdscript
var popup_overlay: ColorRect = null
```

Bu değişken modal açıkken referansı tutar, kapalıyken `null` olur.

---

## 8.3 — Modal Oluşturma Fonksiyonu

Eski `_show_message()`, `_on_message_finished()` fonksiyonlarını **tamamen silin**. Yerlerine şunları yazın:

```gdscript
func _show_popup(title: String, info: String, button1_text: String, button1_action: Callable, button2_text: String, button2_action: Callable) -> void:
	is_animating = true  # Oyun girişini kilitle

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
```

**Satır satır açıklama:**

```gdscript
func _show_popup(title: String, info: String, button1_text: String, button1_action: Callable, button2_text: String, button2_action: Callable) -> void:
```
Fonksiyon 6 parametre alıyor: başlık metni, bilgi metni, iki butonun metni ve iki butonun **Callable** tipinde aksiyon fonksiyonları. `Callable`, Godot 4'te bir fonksiyon referansını taşıyan özel bir tiptir — yani "şu fonksiyonu çağır" bilgisini parametre olarak gönderebiliyoruz. Bu sayede aynı popup fonksiyonunu hem seviye tamamlama hem de game over için kullanabiliriz.

```gdscript
	is_animating = true
```
Popup açıkken oyuncunun şekerlere tıklamasını engelliyoruz. `_input()` fonksiyonumuz `is_animating == true` olduğunda hiçbir girişi işlemez.

```gdscript
	popup_overlay = ColorRect.new()
	popup_overlay.color = Color(0, 0, 0, 0.6)
	popup_overlay.position = Vector2.ZERO
	popup_overlay.size = Vector2(576, 1024)
	add_child(popup_overlay)
```
- `ColorRect.new()` → Godot'ta **kod ile** yeni bir UI node oluşturuyoruz. `ColorRect`, düz renk dikdörtgen çizen en basit UI elemanıdır.
- `Color(0, 0, 0, 0.6)` → RGBA formatında renk: R=0, G=0, B=0 (siyah), A=0.6 (%60 opak). Yani arka plan yarı saydam siyah olur — altındaki oyun tahtası hafifçe görünür ama kararmış olur.
- `Vector2.ZERO` → `Vector2(0, 0)` ile aynı, sol üst köşe. Bu overlay tüm ekranı kaplayacak.
- `size = Vector2(576, 1024)` → Viewport'umuzun tam boyutu. Ekranın her pikseli kararır.
- `add_child(popup_overlay)` → Overlay'i sahne ağacına ekliyoruz. `self` (yani Game node) altına çocuk olarak girer.

```gdscript
	var panel := ColorRect.new()
	panel.color = Color(0.15, 0.15, 0.25, 0.95)
	panel.size = Vector2(400, 320)
	panel.position = Vector2(88, 340)
	popup_overlay.add_child(panel)
```
- Panelin rengi `Color(0.15, 0.15, 0.25, 0.95)` → koyu lacivert-gri, neredeyse tam opak (%95). RGB değerleri 0-1 arasında olduğu için 0.15 çok koyu bir tondur.
- `size = Vector2(400, 320)` → Panel 400x320 piksel. Ekranın ortasına sığacak büyüklükte.
- `position = Vector2(88, 340)` → Yatayda: `(576 - 400) / 2 = 88` piksel → tam ortada. Dikeyden biraz aşağıda.
- **Dikkat:** `popup_overlay.add_child(panel)` — panel, overlay'in **çocuğu**. Bu çok önemli çünkü overlay silindiğinde tüm çocukları (panel, label'lar, butonlar) otomatik olarak birlikte silinir. Godot'un sahne ağacı mimarisi bu hiyerarşiyi garanti eder.

```gdscript
	var title_label := Label.new()
	title_label.text = title
	title_label.position = Vector2(0, 20)
	title_label.size = Vector2(400, 50)
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 32)
	title_label.add_theme_color_override("font_color", Color.YELLOW)
	panel.add_child(title_label)
```
- `Label.new()` → Yeni bir metin node'u oluşturuyoruz.
- `title_label.text = title` → Parametre olarak gelen başlığı ("TEBRİKLER!" veya "OYUN BİTTİ!") atıyoruz.
- `position = Vector2(0, 20)` → Panelin **içinde** 20 piksel aşağıda. Pozisyon, panele göre (relative) hesaplanır çünkü panelin çocuğu.
- `size = Vector2(400, 50)` → Panelin tam genişliğinde, 50 piksel yüksekliğinde.
- `horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER` → Metin yatay ortaya hizalı.
- `add_theme_font_size_override("font_size", 32)` → Tema fontunu 32px ile eziyoruz. "Override" kelimesi önemli: Godot'un varsayılan tema ayarını geçersiz kılıyoruz.
- `add_theme_color_override("font_color", Color.YELLOW)` → Sarı renk. `Color.YELLOW` Godot'un built-in renk sabiti.
- `panel.add_child(title_label)` → Label'ı panelin çocuğu yapıyoruz.

```gdscript
	var info_label := Label.new()
	info_label.text = info
	info_label.position = Vector2(0, 80)
	info_label.size = Vector2(400, 80)
	info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info_label.add_theme_font_size_override("font_size", 22)
	info_label.add_theme_color_override("font_color", Color.WHITE)
	panel.add_child(info_label)
```
Bilgi label'ı — skor ve seviye bilgisini gösterir. Yapısı başlık ile aynı, farklı olan: daha küçük font (22px), beyaz renk ve pozisyon daha aşağıda (y=80). `info` parametresi `\n` (newline) içerdiği için otomatik olarak iki satır halinde görünür.

```gdscript
	var btn1 := Button.new()
	btn1.text = button1_text
	btn1.position = Vector2(75, 180)
	btn1.size = Vector2(250, 50)
	btn1.add_theme_font_size_override("font_size", 20)
	btn1.pressed.connect(button1_action)
	panel.add_child(btn1)
```
- `Button.new()` → Godot'un tıklanabilir buton node'u. Label'dan farklı olarak, fare ile etkileşim desteği hazır gelir.
- `position = Vector2(75, 180)` → Panelin içinde ortalanmış. Yatay: `(400 - 250) / 2 = 75`.
- `btn1.pressed.connect(button1_action)` → **Sinyal bağlantısı.** `pressed`, Button node'unun built-in sinyalidir — oyuncu butona her tıkladığında bu sinyal yayılır. `.connect()` ile bu sinyale bir fonksiyon bağlarız. `button1_action` zaten `Callable` tipinde bir fonksiyon referansı — mesela `_start_next_level` veya `_restart_game`. Sinyal/slot sistemi Godot'un temel yapı taşlarından biridir ve node'lar arası iletişimi sağlar.

İkinci buton (`btn2`) tamamen aynı yapıda, sadece pozisyonu daha aşağıda (y=245) ve farklı bir aksiyon fonksiyonuna bağlı.

---

## 8.4 — Modal Kapatma

Modalı kapatıp temizleyen yardımcı fonksiyon:

```gdscript
func _close_popup() -> void:
	if popup_overlay != null:
		popup_overlay.queue_free()
		popup_overlay = null
```

**Satır satır açıklama:**

```gdscript
func _close_popup() -> void:
```
Modalı kapatıp bellekten temizleyen yardımcı fonksiyon. `-> void` dönüş tipi yok demektir.

```gdscript
	if popup_overlay != null:
```
Güvenlik kontrolü: Popup zaten kapalıysa (yani `null` ise) hiçbir şey yapmıyoruz. Bu, fonksiyonun yanlışlıkla iki kez çağrılmasını önler.

```gdscript
		popup_overlay.queue_free()
```
`queue_free()`, Godot'un node silme yöntemidir. "Hemen sil" yerine "bu frame sonunda sil" der — böylece o anki işlemler güvenle tamamlanır. **Kritik nokta:** `queue_free()` bir node'u sildiğinde, **tüm alt node'larını** (children) da otomatik siler. Bizim hiyerarşimiz: `popup_overlay → panel → (title_label, info_label, btn1, btn2)`. Yani sadece overlay'i silmek tüm popup elemanlarını temizler.

```gdscript
		popup_overlay = null
```
Referansı `null` yapıyoruz. Bu iki işe yarar: (1) Garbage collector belleği temizleyebilir, (2) `_close_popup()` tekrar çağrılırsa `!= null` kontrolü sayesinde güvenli şekilde atlanır.

---

## 8.5 — Seviye Tamamlama ve Game Over

Eski `_level_complete()`, `_game_over()` ve `_restart_game()` fonksiyonlarını **tamamen silin**. Yerlerine şunları yazın:

```gdscript
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

func _start_next_level() -> void:
	_close_popup()
	level += 1
	score = 0  # Her seviye sıfırdan başlar!
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _restart_game() -> void:
	_close_popup()
	score = 0
	moves_left = BASE_MOVES
	level = 1
	target_score = BASE_TARGET
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _quit_game() -> void:
	get_tree().quit()
```

**Satır satır açıklama:**

### `_level_complete()`

```gdscript
func _level_complete() -> void:
	is_animating = true
```
Popup açılacağı için oyuncu girişini kilitleriz.

```gdscript
	var next_level := level + 1
```
Bir sonraki seviye numarasını hesaplıyoruz. Henüz `level` değişkenini artırmıyoruz — bunu "Sonraki Seviye" butonuna basıldığında yapacağız.

```gdscript
	var info: String = "Skor: " + str(score) + "\nSeviye " + str(next_level) + " hazır!"
```
Popup'ta gösterilecek bilgi metni. `str()` ile sayıları stringe çeviriyoruz. `\n` newline karakteri — metin iki satır halinde görünür. **Not:** `var info: String = ...` yazıyoruz, `:=` değil — Godot 4.6'da string birleştirme ile `:=` tip çıkarımı hata verebiliyor.

```gdscript
	_show_popup(
		"TEBRİKLER!",
		info,
		"Sonraki Seviye",
		_start_next_level,
		"Çıkış",
		_quit_game
	)
```
Az önce yazdığımız popup fonksiyonunu çağırıyoruz. Dikkat edin: `_start_next_level` ve `_quit_game` fonksiyon isimleri parantez **olmadan** yazılıyor — çünkü fonksiyonu **çağırmıyoruz**, **referansını** (Callable) gönderiyoruz. Parantez koysaydık fonksiyon hemen çalışırdı.

### `_game_over()`

```gdscript
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
```
`_level_complete()` ile aynı yapıda — tek fark başlık, buton metinleri ve aksiyon fonksiyonları. "Tekrar Oyna" butonu `_restart_game`'e, "Çıkış" butonu `_quit_game`'e bağlanıyor.

### `_start_next_level()`

```gdscript
func _start_next_level() -> void:
	_close_popup()
```
Önce popup'ı kapatıp bellekten temizliyoruz.

```gdscript
	level += 1
```
Seviye numarasını artırıyoruz.

```gdscript
	score = 0  # Her seviye sıfırdan başlar!
```
**Kritik düzeltme!** Önceki bölümde bu satır yoktu. Sonuç: Seviye 1'de 1200 puan kazandınız → Seviye 2'ye 1200 puanla giriyorsunuz → Seviye 2 hedefi 1500 → Sadece 300 puan daha lazım → 1-2 eşleşme ile seviye bitiyor! Bu, oyunu çok kolay ve anlamsız yapıyordu. Şimdi her seviye `score = 0` ile başlıyor.

```gdscript
	moves_left = BASE_MOVES
```
Hamle sayısını sıfırlıyoruz (20 hamle). Her seviye aynı hamle hakkıyla başlar.

```gdscript
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
```
Yeni hedef skoru hesaplıyoruz. Formül: `1000 + (seviye - 1) × 500`. Seviye 2 için 1500, Seviye 3 için 2000, vs. Her seviye bir öncekinden 500 puan daha zor.

```gdscript
	chain_count = 0
```
Zincirleme sayacını sıfırlıyoruz — yeni seviyede zincirleme çarpanı baştan başlar.

```gdscript
	_init_grid()
	_draw_candies()
	_update_ui()
```
Tahtayı tamamen yeniliyoruz: `_init_grid()` yeni rastgele bir grid oluşturur, `_draw_candies()` eski sprite'ları silip yenilerini çizer, `_update_ui()` skor/hamle/seviye/hedef label'larını günceller.

```gdscript
	is_animating = false
```
Oyuncu girişini tekrar açıyoruz — yeni seviye oynamaya hazır.

### `_restart_game()`

```gdscript
func _restart_game() -> void:
	_close_popup()
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
`_start_next_level()` ile çok benzer — tek fark `level = 1` ve `target_score = BASE_TARGET` (artış formülü yok). Her şeyi fabrika ayarlarına döndürür.

### `_quit_game()`

```gdscript
func _quit_game() -> void:
	get_tree().quit()
```
`get_tree()` → Godot'un **SceneTree** nesnesine erişir. Bu, tüm oyun sahnesini yöneten ana yapıdır. `.quit()` uygulamayı tamamen kapatır. Masaüstünde pencere kapanır, mobilde uygulama sonlanır.

---

## 8.6 — Bonus Zincirleme Mekaniği

Şu ana kadar `_clear_cell()` bir hücreyi sildiğinde, o hücrede bonus olsa bile sadece siliyordu. Ama gerçek bir Match-3 oyununda:

- Bomba patlar → yanındaki oka isabet eder → ok da aktive olur → satır/sütun temizlenir
- Ok aktive olur → yolundaki rainbow'a isabet eder → rainbow da aktive olur → en çok renk silinir

Bu **zincirleme tetikleme** (chain triggering) mekaniğidir.

**`_clear_cell()` fonksiyonunu** şununla değiştirin:

```gdscript
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
```

**Satır satır açıklama:**

```gdscript
func _clear_cell(cell: Vector2i) -> void:
	if not _is_valid_cell(cell):
		return
```
İlk güvenlik katmanı: Hücre koordinatları grid sınırları dışındaysa (mesela bomba grid kenarında patladığında negatif indeks oluşabilir) hemen çıkıyoruz.

```gdscript
	if grid[cell.x][cell.y] == "":
		return
```
İkinci güvenlik katmanı ve **sonsuz döngü koruması**: Hücre zaten boşsa bir şey yapmıyoruz. Bu kontrol, iki bonusun birbirini sonsuz döngüde tetiklemesini önler (aşağıda detaylı açıklama var).

```gdscript
	var cell_type: String = grid[cell.x][cell.y]
```
Hücredeki şekerin tipini kaydediyoruz. Bunu **silmeden önce** yapmamız şart — çünkü bir sonraki adımda hücreyi boşaltacağız ve tip bilgisi kaybolacak.

```gdscript
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""
```
Hücreyi **hem görsel hem veri** olarak temizliyoruz:
- `sprite.queue_free()` → Ekrandaki görsel node'u siler
- `candy_sprites[...] = null` → Sprite referansını temizler
- `grid[...] = ""` → Grid verisini boşaltır

**Kritik sıralama:** Önce hücreyi boşaltıyoruz, **sonra** bonusu aktive ediyoruz. Bu sıralama sonsuz döngüyü önler.

```gdscript
	if BONUS_TYPES.has(cell_type):
```
Sildiğimiz hücre bir bonus mu kontrol ediyoruz. `BONUS_TYPES = ["arrow_h", "arrow_v", "bomb", "rainbow"]` — `has()` metodu bu dizide arama yapar.

```gdscript
		_add_bonus_score(cell_type)
```
Bonus puan ekliyoruz (ok: 80, bomba: 120, rainbow: 200).

```gdscript
		match cell_type:
			"arrow_h":
				_activate_arrow_h(cell)
			"arrow_v":
				_activate_arrow_v(cell)
			"bomb":
				_activate_bomb(cell)
			"rainbow":
				_activate_rainbow()
```
Bonus tipine göre ilgili aktivasyon fonksiyonunu çağırıyoruz. `match` ifadesi her bonus tipini doğru fonksiyona yönlendirir. Bu fonksiyonlar da kendi içinde `_clear_cell()` çağırır — böylece **zincirleme** oluşur.

**Sonsuz döngü koruması detaylı açıklama:**

```
_clear_cell(bomba) → grid'i boşalt → _activate_bomb() → _clear_cell(ok) →
grid'i boşalt → _activate_arrow_h() → _clear_cell(başka hücre) → grid'i boşalt →
(hücre zaten boş? → return!)
```

Eğer önce aktive edip sonra boşaltsaydık, iki bonus birbirine isabet ettiğinde sonsuz döngüye girerdi. Ama `grid = ""` kontrolü sayesinde zaten boşaltılmış bir hücre tekrar tetiklenemez. Bu, **özyinelemeli** (recursive) bir yapıdır ve "önce temizle, sonra tetikle" sıralaması güvenliğin garantisidir.

**Zincirleme senaryo örneği:**

```
[bomb] [arrow_h] [red] [red] [red]
   ↓
Oyuncu bomb'a tıklar
   ↓
bomb patlar → 3x3 alan temizlenir
   ↓
arrow_h da bu alanda → _clear_cell(arrow_h) çağrılır
   ↓
arrow_h bonus olduğu tespit edilir → _activate_arrow_h() çağrılır
   ↓
Tüm satır temizlenir!
```

---

## 8.7 — MessageLabel'ı Temizleme

Artık `MessageLabel` kullanmıyoruz (popup sistemi ile değiştirdik). Sahne dosyasından kaldırabilirsiniz, ama **kodda da temizlememiz lazım:**

**`_setup_ui()` fonksiyonundan** `MessageLabel` ile ilgili satırları (son 8 satır) silin:

```gdscript
# Bu satırları SİLİN:
	var message_label: Label = $MessageLabel
	message_label.position = Vector2(0, 400)
	message_label.size = Vector2(576, 80)
	message_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	message_label.add_theme_font_size_override("font_size", 36)
	message_label.add_theme_color_override("font_color", Color.WHITE)
	message_label.text = ""
```

---

## 8.8 — Tam Kod (game.gd)

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
var popup_overlay: ColorRect = null

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
	level += 1
	score = 0
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _restart_game() -> void:
	_close_popup()
	score = 0
	moves_left = BASE_MOVES
	level = 1
	target_score = BASE_TARGET
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _quit_game() -> void:
	get_tree().quit()
```

---

## 8.9 — Sahne Dosyası Güncelleme

`MessageLabel` artık gerekli değil. Godot Editor'da sahne ağacından `MessageLabel` node'unu sağ tıklayıp **Delete** ile silebilirsiniz. Diğer 4 Label (ScoreLabel, MovesLabel, LevelLabel, TargetLabel) kalmalı.

---

## 8.10 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| Skor >= 1000 olduğunda | "TEBRİKLER!" paneli görünür |
| "Sonraki Seviye" tıkla | Skor 0'a döner, tahta yenilenir, hedef 1500 |
| Seviye 2'de oyna | 1500 puana ulaşmak artık gerçekten zor |
| Bomb patlatma (yanında arrow var) | Arrow da aktive olur → satır/sütun temizlenir |
| Arrow patlatma (yolunda bomb var) | Bomb da patlar → 3x3 alan temizlenir |
| Arrow/Bomb rainbow'u tetikler | En çok renk silinir |
| Zincirleme sonrası | Yerçekimi + doldurma normal çalışır |
| 20 hamle bittiğinde | "OYUN BİTTİ!" paneli görünür |
| "Tekrar Oyna" tıkla | Her şey sıfırlanır |
| "Çıkış" tıkla | Oyun kapanır |

**Bu bölümde yapılan düzeltmeler özeti:**

| Sorun | Çözüm |
|-------|-------|
| Skor seviyeler arası taşınıyordu | `_start_next_level()` içinde `score = 0` eklendi |
| Bonuslar birbirini tetiklemiyordu | `_clear_cell()` artık bonus hücreleri otomatik aktive ediyor |
| Sonsuz döngü riski | Hücre önce boşaltılıp sonra aktive ediliyor |

> **Sonraki bölümde:** Kalıcı hafıza (save/load), global puan ve kaldığı yerden devam etme sistemi ekleyeceğiz.
