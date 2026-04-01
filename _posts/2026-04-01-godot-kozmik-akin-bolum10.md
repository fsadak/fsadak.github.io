---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 10: Ana Menü ve Sahne Geçişi"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, ana menü, control, button, pressed sinyali, change_scene_to_file, sahne geçişi, ui]
description: "Control node'u ile ana menü sahnesi oluşturuluyor. pressed sinyali ile butona tıklama dinleniyor ve change_scene_to_file ile sahneler arası geçiş öğreniliyor."
permalink: /godot-kozmik-akin-bolum-10/
published: true
---

# Kozmik Akın — Bölüm 10: Ana Menü ve Sahne Geçişi

Oyunumuz artık tam anlamıyla oynanabilir. Ama her `F5` tuşuna bastığımızda direkt oyuna giriyoruz. Gerçek bir oyunda önce bir ana menü olur — oyuncu "Oyna" butonuna basınca oyun başlar.

Bu bölümde ana menü sahnesini oluşturacağız ve sahneler arası geçişi öğreneceğiz.

---

## Ana Menü Sahnesini Oluşturalım

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçin
3. Arama kutusuna `Control` yazın ve seçin
4. Node adını `MainMenu` olarak değiştirin
5. `Ctrl + S` ile `res://scenes/main_menu.tscn` olarak kaydedin

> 💡 **Control nedir?**
> Godot'ta tüm UI elementlerinin temel node türüdür. `Button`, `Label`, `Panel` gibi arayüz node'ları `Control`'dan türer. Ana menü tamamen UI'dan oluşacağı için kök node olarak `Control` seçtik.

---

## Arka Planı Ayarlayalım

Ana menünün arka planı siyah olmalı — oyunla aynı atmosfer.

1. `MainMenu` node'u seçiliyken **"+"** butonuyla `ColorRect` ekleyin
2. **Inspector → Color** alanına `#000000` girin
3. **Inspector → Layout → Layout Mode ** kısmını ** Anchors ** yapın
4. **Inspector → Layout → Anchors Preset** alanından **"Full Rect"** seçin

> 💡 **Full Rect** seçeneği `ColorRect`'i ekranın tamamını kaplayacak şekilde otomatik boyutlandırır.

---

## Oyun Başlığını Ekleyelim

1. `MainMenu` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `TitleLabel` yapın
3. **Inspector → Text** alanına `Kozmik Akın` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `48` yazın
5. **Inspector → Horizontal Alignment** → `Center` seçin

`TitleLabel`'ı ekranın üst ortasına taşıyalım. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `100` |
| Y | `250` |

> 💡 X ve Y değerlerini label boyutuna göre ayarlamanız gerekebilir. Sahne görünümünde başlığın ortalandığını kontrol edin.

---

## Oyna Butonunu Ekleyelim

1. `MainMenu` node'u seçiliyken **"+"** butonuyla `Button` ekleyin
2. Adını `PlayButton` yapın
3. **Inspector → Text** alanına `Oyna` yazın
4. **Inspector → Theme Overrides → Font Sizes → Font Size** alanına `32` yazın

`PlayButton`'ı başlığın altına taşıyalım. **Inspector →  Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `180` |
| Y | `380` |

Sahne yapısı şöyle olmalı:
```
MainMenu (Control)
├── ColorRect
├── TitleLabel (Label)
└── PlayButton (Button)
```

---

## Ana Menü Script'ini Yazalım

`MainMenu` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/main_menu.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends Control

@onready var play_button = $PlayButton

func _ready() -> void:
	play_button.pressed.connect(_on_play_button_pressed)

func _on_play_button_pressed() -> void:
	GameManager.reset()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
```

Kodu inceleyelim:

**`@onready var play_button = $PlayButton`**
`PlayButton` node'una script içinden erişmek için referans oluşturuyoruz.

**`func _ready() -> void:`** içinde;

**`play_button.pressed.connect(_on_play_button_pressed)`**
`Button` node'unun yerleşik `pressed` sinyalini kendi fonksiyonumuza bağlıyoruz. Butona her tıklandığında `_on_play_button_pressed` çalışacak.

**`func _on_play_button_pressed() -> void:`** içinde;

**`GameManager.reset()`**
Oyun başlamadan önce skor ve canı sıfırlıyoruz. Böylece önceki oyundan kalan değerler temizleniyor.

**`get_tree().change_scene_to_file("res://scenes/main.tscn")`**
Mevcut sahneyi kapatıp oyun sahnesini açıyoruz. `get_tree()` Godot'un sahne ağacına erişim sağlar. `change_scene_to_file()` belirtilen sahne dosyasını yükler ve aktif sahne olarak ayarlar.

---

## Başlangıç Sahnesini Değiştirelim

Bölüm 1'de başlangıç sahnesini `main.tscn` olarak ayarlamıştık. Artık oyun `main_menu.tscn` ile başlamalı.

**Project → Project Settings → Application → Run** sekmesine gelin:

- **Main Scene** → `res://scenes/main_menu.tscn` olarak değiştirin

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Oyun ana menü ekranıyla başlıyor
- ✅ `Kozmik Akın` başlığı görünüyor
- ✅ `Oyna` butonuna tıklayınca oyun sahnesi açılıyor
- ✅ Oyun sahnesi açılınca skor `0`, can `3` ile başlıyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `Control` node'u ile ana menü sahnesi oluşturduk
- `ColorRect` ile arka plan, `Label` ile başlık, `Button` ile buton ekledik
- `pressed` sinyali ile butona tıklamayı dinledik
- `get_tree().change_scene_to_file()` ile sahneler arası geçişi öğrendik
- `GameManager.reset()` ile yeni oyun başlamadan değerleri sıfırladık

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='oW3ayXb4fks' %}

---

## Sıradaki Bölüm

**Bölüm 11'de** serinin son bölümüne geldik. Game Over ekranını oluşturacağız, `game_over` sinyalini bağlayacağız.

Görüşmek üzere! 🚀
