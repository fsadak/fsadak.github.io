---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 9: Oyun Arayüzünü Yapalım"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, canvaslayer, hud, label, ui, skor göstergesi, can göstergesi, sinyal, arayüz]
description: "CanvasLayer ve Label node'ları ile oyun içi arayüz yapıyoruz. GameManager sinyalleri HUD'a bağlanarak skor ve can bilgisi ekranda güncelleniyor."
permalink: /godot-kozmik-akin-bolum-9/
published: true
---

# Kozmik Akın — Bölüm 9: Oyun Arayüzünü Yapalım

Şu ana kadar skor ve can bilgisini yalnızca Output konsolundan takip edebildik. Bu bölümde bu bilgileri ekranda göstereceğiz. Godot'un UI sistemi ve `CanvasLayer` node'unu öğreneceğiz.

Bölümün sonunda ekranın üst kısmında skor ve can bilgisi görünecek.

---

## CanvasLayer Nedir?

Oyun nesneleri (gemi, düşman, mermi) sahne içinde hareket eder. Ama arayüz elementleri (skor, can) ekrana sabit olarak yapışık kalmalı — kamera hareket etse bile yerinde durmalı.

Godot'ta bunun için `CanvasLayer` kullanılır. `CanvasLayer` içindeki her şey oyun dünyasından bağımsız olarak ekrana çizilir.

---

## HUD Sahnesini Oluşturalım

Arayüzü ayrı bir sahne olarak oluşturacağız. Bu sayede hem düzenli kalır hem de ileride farklı sahnelerde de kullanılabilir.

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçin
3. Arama kutusuna `CanvasLayer` yazın ve seçin
4. Node adını `HUD` olarak değiştirin
5. `Ctrl + S` ile `res://scenes/hud.tscn` olarak kaydedin

---

## Skor Label'ını Ekleyelim

1. `HUD` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `ScoreLabel` yapın
3. **Inspector** panelinde **Text** alanına `Skor: 0` yazın
4. **Inspector** panelinde **Theme Overrides → Font Sizes → Font Size** alanına `24` yazın

Şimdi `ScoreLabel`'ı ekranın üst sol köşesine taşıyalım. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `10` |
| Y | `10` |

---

## Can Label'ını Ekleyelim

1. `HUD` node'u seçiliyken **"+"** butonuyla `Label` ekleyin
2. Adını `HealthLabel` yapın
3. **Inspector** panelinde **Text** alanına `Can: 3` yazın
4. **Inspector** panelinde **Theme Overrides → Font Sizes → Font Size** alanına `24` yazın

`HealthLabel`'ı ekranın üst sağ köşesine taşıyalım. **Inspector → Layout → Transform → Position** alanına:

| Eksen | Değer |
|-------|-------|
| X | `380` |
| Y | `10` |

> 💡 X değerini gemi görselinize ve label genişliğine göre ayarlamanız gerekebilir. Label ekranın sağına taşmasın diye kontrol edin.

Sahne yapısı şöyle olmalı:
```
HUD (CanvasLayer)
├── ScoreLabel (Label)
└── HealthLabel (Label)
```

---

## HUD Script'ini Yazalım

`HUD` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/hud.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends CanvasLayer

@onready var score_label = $ScoreLabel
@onready var health_label = $HealthLabel

func _ready() -> void:
	GameManager.score_changed.connect(_on_score_changed)
	GameManager.health_changed.connect(_on_health_changed)

func _on_score_changed(new_score: int) -> void:
	score_label.text = "Skor: " + str(new_score)

func _on_health_changed(new_health: int) -> void:
	health_label.text = "Can: " + str(new_health)
```

Kodu inceleyelim:

**`@onready var score_label = $ScoreLabel`**
**`@onready var health_label = $HealthLabel`**
İki Label node'una script içinden erişmek için referanslar oluşturuyoruz.

**`func _ready() -> void:`** içinde;

**`GameManager.score_changed.connect(_on_score_changed)`**
Bölüm 7'de `GameManager`'a tanımladığımız `score_changed` sinyalini burada dinliyoruz. Skor her değiştiğinde `_on_score_changed` fonksiyonu çalışacak.

**`GameManager.health_changed.connect(_on_health_changed)`**
Aynı şekilde `health_changed` sinyalini dinliyoruz. Can her değiştiğinde `_on_health_changed` fonksiyonu çalışacak.

**`func _on_score_changed(new_score: int) -> void:`** içinde;

**`score_label.text = "Skor: " + str(new_score)`**
Label'ın text özelliğini güncelliyoruz. `str()` fonksiyonu sayıyı metne çeviriyor — Godot'ta sayı ve metni direkt birleştiremeyiz.

**`func _on_health_changed(new_health: int) -> void:`** içinde;

**`health_label.text = "Can: " + str(new_health)`**
Can label'ını güncelliyoruz.

---

## HUD'ı Ana Sahneye Ekleyelim

`res://scenes/main.tscn` dosyasını açın. **FileSystem** panelinden `hud.tscn` dosyasını sürükleyip sahne hiyerarşisine bırakın.

Ana sahne yapısı şöyle olmalı:
```
Main (Node2D)
├── Player (CharacterBody2D)
├── SpawnTimer (Timer)
└── HUD (CanvasLayer)
```

`Ctrl + S` ile kaydedin.

---

## print() Satırlarını Temizleyelim

Bölüm 7'de test amacıyla `game_manager.gd`'ye eklediğimiz `print` satırlarına artık ihtiyacımız yok. `res://scripts/game_manager.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Node

var score = 0
var health = 3

signal score_changed(new_score)
signal health_changed(new_health)
signal game_over

func add_score(amount: int) -> void:
	score += amount
	score_changed.emit(score)

func take_damage(amount: int) -> void:
	health -= amount
	if health <= 0:
		health = 0
		health_changed.emit(health)
		game_over.emit()
	else:
		health_changed.emit(health)

func reset() -> void:
	score = 0
	health = 3
```

> 💡 `print()` satırları geliştirme sırasında çok işe yarar ama yayınlanan oyunlarda gereksiz yük oluşturabilir. İşi biten `print` satırlarını temizlemek iyi bir alışkanlıktır.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Ekranın üst kısmında `Skor: 0` ve `Can: 3` yazıları görünüyor
- ✅ Düşman yok edildiğinde skor artıyor
- ✅ Düşman bize çarptığında can azalıyor
- ✅ Arayüz yazıları oyun nesnelerinin önünde görünüyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `CanvasLayer` ile oyun dünyasından bağımsız bir arayüz katmanı oluşturduk
- `Label` node'ları ile skor ve can bilgisini ekrana yazdırdık
- `GameManager`'ın sinyallerini HUD'a bağladık
- Artık gerek kalmayan `print()` satırlarını temizledik

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='6kAOBU4PcTs' %}

---

## Sıradaki Bölüm

**Bölüm 10'da** ana menüyü oluşturacağız. Oyun başlamadan önce bir karşılama ekranı olacak. `SceneTree` ve sahne değiştirmeyi öğreneceğiz.

Görüşmek üzere! 🚀
