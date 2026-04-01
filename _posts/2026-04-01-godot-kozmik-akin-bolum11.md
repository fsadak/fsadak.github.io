---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 11: Game Over"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, game over, control, sinyal, sahne geçişi, skor gösterimi, tekrar oyna, ana menü]
description: "Can sıfırlandığında Game Over ekranı açılıyor. game_over sinyali oyun sahnesinden dinleniyor, skor gösteriliyor ve Tekrar Oyna / Ana Menü butonları bağlanıyor."
permalink: /godot-kozmik-akin-bolum-11/
published: true
---

# Kozmik Akın — Bölüm 11: Game Over

Serinin son bölümüne geldik! Bu bölümde can sıfırlandığında Game Over ekranı göstereceğiz. Oyuncu skoru görecek, ana menüye dönebilecek ya da tekrar oynayabilecek.

---

## Game Over Sahnesini Oluşturalım

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçin
3. Arama kutusuna `Control` yazın ve seçin
4. Node adını `GameOver` olarak değiştirin
5. `Ctrl + S` ile `res://scenes/game_over.tscn` olarak kaydedin

---

## Arka Planı Ekleyelim

1. `GameOver` node'u seçiliyken **"+"** butonuyla `ColorRect` ekleyin
2. **Inspector → Color** alanına `#000000` girin
3. **Inspector → Layout → Layout Mode ** kısmını ** Anchors ** yapın
4. **Inspector → Layout → Anchors Preset** alanından **"Full Rect"** seçin

---

## Game Over Yazısını Ekleyelim

1. `GameOver` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `GameOverLabel` yapın
3. **Inspector → Text** alanına `Oyun Bitti!` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `48` yazın
5. **Inspector → Horizontal Alignment** → `Center` seçin
6. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `130` |
| Y | `180` |

---

## Skor Yazısını Ekleyelim

1. `GameOver` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `ScoreLabel` yapın
3. **Inspector → Text** alanına `Skor: 0` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `32` yazın
5. **Inspector → Horizontal Alignment** → `Center` seçin
6. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `180` |
| Y | `280` |

---

## Butonları Ekleyelim

**Tekrar Oyna butonu:**

1. `GameOver` node'u seçiliyken **"+"** butonuyla `Button` ekleyin
2. Adını `RestartButton` yapın
3. **Inspector → Text** alanına `Tekrar Oyna` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `28` yazın
5. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `155` |
| Y | `400` |

**Ana Menü butonu:**

1. `GameOver` node'u seçiliyken **"+"** butonuyla `Button` ekleyin
2. Adını `MenuButton` yapın
3. **Inspector → Text** alanına `Ana Menü` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `28` yazın
5. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `155` |
| Y | `470` |

Sahne yapısı şöyle olmalı:
```
GameOver (Control)
├── ColorRect
├── GameOverLabel (Label)
├── ScoreLabel (Label)
├── RestartButton (Button)
└── MenuButton (Button)
```

---

## Game Over Script'ini Yazalım

`GameOver` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/game_over.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends Control

@onready var score_label = $ScoreLabel
@onready var restart_button = $RestartButton
@onready var menu_button = $MenuButton

func _ready() -> void:
	score_label.text = "Skor: " + str(GameManager.score)
	restart_button.pressed.connect(_on_restart_button_pressed)
	menu_button.pressed.connect(_on_menu_button_pressed)

func _on_restart_button_pressed() -> void:
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main.tscn")

func _on_menu_button_pressed() -> void:
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
```

Kodu inceleyelim:

**`func _ready() -> void:`** içinde;

**`score_label.text = "Skor: " + str(GameManager.score)`**
Sahne açılır açılmaz `GameManager`'dan güncel skoru alıp ekranda gösteriyoruz. `GameManager` Autoload olduğu için sahne geçişinden sonra da değerini koruyor.

**`restart_button.pressed.connect(_on_restart_button_pressed)`**
**`menu_button.pressed.connect(_on_menu_button_pressed)`**
Her iki butonun `pressed` sinyalini ilgili fonksiyonlara bağlıyoruz.

**`func _on_restart_button_pressed() -> void:`** içinde;

**`GameManager.reset()`**
Skor ve canı sıfırlıyoruz.

**`get_tree().change_scene_to_file("res://scenes/main.tscn")`**
Direkt oyun sahnesine geçiyoruz — oyuncu hemen tekrar oynamaya başlıyor.

**`func _on_menu_button_pressed() -> void:`** içinde;

**`GameManager.reset()`**
Skor ve canı sıfırlıyoruz.

**`get_tree().change_scene_to_file("res://scenes/main_menu.tscn")`**
Ana menüye dönüyoruz.

---

## game_over Sinyalini Bağlayalım

`game_over` sinyali Bölüm 7'de `GameManager`'a tanımlanmıştı. Şimdi bu sinyali oyun sahnesinden dinleyip Game Over ekranına geçeceğiz.

`res://scripts/main.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Node2D

const ENEMY_SCENE = preload("res://scenes/enemy.tscn")

@onready var spawn_timer = $SpawnTimer

func _ready() -> void:
	spawn_timer.timeout.connect(_on_spawn_timer_timeout)
	GameManager.game_over.connect(_on_game_over)

func _on_spawn_timer_timeout() -> void:
	spawn_enemy()

func spawn_enemy() -> void:
	var enemy = ENEMY_SCENE.instantiate()
	var screen_width = get_viewport_rect().size.x
	enemy.position.x = randf_range(50, screen_width - 50)
	enemy.position.y = -50
	add_child(enemy)

func _on_game_over() -> void:
	spawn_timer.stop()
	get_tree().change_scene_to_file("res://scenes/game_over.tscn")
```

Yeni eklenen kısımları inceleyelim:

**`func _ready() -> void:`** içinde;

**`GameManager.game_over.connect(_on_game_over)`**
`GameManager`'ın `game_over` sinyalini dinliyoruz. Can sıfırlandığında bu sinyal yayılacak ve `_on_game_over` fonksiyonu çalışacak.

**`func _on_game_over() -> void:`** içinde;

**`spawn_timer.stop()`**
Game Over ekranına geçmeden önce düşman üretimini durduruyoruz. Aksi halde sahne geçişi sırasında yeni düşmanlar üretilebilir.

**`get_tree().change_scene_to_file("res://scenes/game_over.tscn")`**
Game Over sahnesine geçiyoruz. Skor `GameManager`'da korunduğu için Game Over ekranı doğru skoru gösterecek.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Ana menü açılıyor
- ✅ Oyna butonuyla oyun başlıyor
- ✅ 3 düşman çarptıktan sonra Game Over ekranı açılıyor
- ✅ Game Over ekranında doğru skor görünüyor
- ✅ Tekrar Oyna butonu oyunu sıfırlayıp yeniden başlatıyor
- ✅ Ana Menü butonu ana menüye dönüyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `Control` node'u ile Game Over sahnesi oluşturduk
- `GameManager.score` değerini Game Over ekranında gösterdik
- `game_over` sinyalini oyun sahnesinden dinleyip Game Over ekranına geçtik
- Tekrar Oyna ve Ana Menü butonlarını bağladık

---

## Serinin Sonu

Tebrikler! 🎉 Sıfırdan tam oynanabilir bir uzay nişancı oyunu yaptınız. Bu seri boyunca şunları öğrendik:

- Godot 4 proje kurulumu ve klasör yapısı
- `CharacterBody2D` ile hareket sistemi
- Sahne instancing ile mermi ve düşman üretimi
- Collision layer ve mask sistemi
- Sinyal sistemi ile node'lar arası iletişim
- Autoload ile merkezi oyun yönetimi
- `AudioStreamPlayer` ile ses efektleri
- `CanvasLayer` ile oyun arayüzü
- Sahneler arası geçiş

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='LxKvOJu9xw4' %}

---

## Bonus Bölüm

Serinin temelini tamamladınız. Ama daha fazlasını öğrenmek istiyorsanız **Bonus Bölüm'de** şunları ele alacağız:

- Kaçan düşmanlar için ceza sistemi (-5 puan)
- İki namlulu gemi yükseltmesi
- Patlama animasyonu
- Ve aklımıza gelen diğer geliştirmeler!

Görüşmek üzere! 🚀
