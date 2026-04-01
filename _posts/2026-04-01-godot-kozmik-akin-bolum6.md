---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 6: Çarpışmaları Yönetelim"
date: 2026-04-01 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, collision layer, collision mask, area_entered, çarpışma, sinyal, mermi, düşman]
description: "Godot'un collision layer ve mask sistemi ile mermi-düşman çarpışmasını kuruyoruz. area_entered sinyali ile ikisi de sahneden siliniyor."
permalink: /godot-kozmik-akin-bolum-6/
published: true
---

# Kozmik Akın — Bölüm 6: Çarpışmaları Yönetelim

Önceki bölümde düşmanlar ekrana geldi ama mermiler çarpıyor gibi görünse de hiçbir şey olmuyor. Bu bölümde çarpışma sistemini kuracağız. Mermi düşmana çarptığında ikisi de yok olacak.

Bölümün sonunda mermiler düşmanları yok edecek.

---

## Collision Layer ve Mask Nedir?

Godot'ta her fizik nesnesi iki ayara sahiptir:

- **Collision Layer:** "Ben hangi katmandayım?" — nesnenin kendi kimliği
- **Collision Mask:** "Ben kimlerle çarpışırım?" — nesnenin takip ettiği katmanlar

Bunu trafik gibi düşünebilirsiniz: arabalar yolda gider, yayalar kaldırımda. Araba yolda başka arabayla çarpışır ama kaldırımı "görmez". Katmanlar bu ayrımı sağlar.

Projemiz için şu katman düzenini kullanacağız:

| Katman | İsim | Kim Kullanıyor |
|--------|------|----------------|
| Layer 1 | player | Player |
| Layer 2 | enemy | Enemy |
| Layer 3 | bullet | Bullet |

---

## Katman İsimlerini Tanımlayalım

Önce katmanlara isim verelim ki Inspector'da sayı yerine anlamlı isimler görelim.

**Project → Project Settings → Layer Names → 2D Physics** sekmesine gelin:

| Layer | İsim |
|-------|------|
| Layer 1 | `player` |
| Layer 2 | `enemy` |
| Layer 3 | `bullet` |

Ayarları kaydedip pencereyi kapatın.

---

## Player Collision Ayarları

`res://scenes/player.tscn` dosyasını açın. `Player` node'unu seçin.

**Inspector** panelinde **Collision** bölümünü bulun:

- **Layer:** Yalnızca `player` katmanını açın
- **Mask:** Yalnızca `enemy` katmanını açın

> 💡 Player "ben player katmanındayım, enemy katmanını takip ediyorum" diyor. Düşman bize çarptığında biz bunu fark edeceğiz. Bunu Bölüm 7'de kullanacağız.

---

## Enemy Collision Ayarları

`res://scenes/enemy.tscn` dosyasını açın. `Enemy` node'unu seçin.

**Inspector** panelinde **Collision** bölümünü bulun:

- **Layer:** Yalnızca `enemy` katmanını açın
- **Mask:** Yalnızca `bullet` katmanını açın

> 💡 Enemy "ben enemy katmanındayım, bullet katmanını takip ediyorum" diyor. Mermi ona çarptığında biz bunu fark edeceğiz.

---

## Bullet Collision Ayarları

`res://scenes/bullet.tscn` dosyasını açın. `Bullet` node'unu seçin.

**Inspector** panelinde **Collision** bölümünü bulun:

- **Layer:** Yalnızca `bullet` katmanını açın
- **Mask:** Yalnızca `enemy` katmanını açın

---

## Enemy Script'ine Çarpışma Sinyalini Ekleyelim

Katman ayarları tamam. Şimdi "mermi düşmana çarptığında ne olsun?" sorusunu cevaplayacağız.

`res://scripts/enemy.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends Area2D

const SPEED = 200.0

func _ready() -> void:
	area_entered.connect(_on_area_entered)

func _physics_process(delta: float) -> void:
	position.y += SPEED * delta

	if position.y > 800:
		queue_free()

func _on_area_entered(area: Area2D) -> void:
	area.queue_free()
	queue_free()
```

Yeni eklenen kısımları inceleyelim:

**`func _ready() -> void:`** içinde;

**`area_entered.connect(_on_area_entered)`**
`Area2D` node'unun yerleşik bir sinyali olan `area_entered`'ı kendi fonksiyonumuza bağlıyoruz. Bu sinyal, başka bir `Area2D` node'u bu düşmanın çarpışma alanına girdiğinde tetiklenir. Bizim durumumuzda bu mermi olacak.

**`func _on_area_entered(area: Area2D) -> void:`** içinde;

**`area.queue_free()`**
Çarpışan nesneyi — yani mermiyi — sahneden siler.

**`queue_free()`**
Düşmanın kendisini sahneden siler.

> 💡 Sinyaller Godot'ta "bir şey oldu, ilgilenen varsa haber vereyim" mantığıyla çalışır. `area_entered` sinyali "birileri benim alanıma girdi" demek. Biz de bu haberi alınca hem mermiyi hem düşmanı yok ediyoruz.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Mermi düşmana çarptığında ikisi de yok oluyor
- ✅ Çarpışmayan düşmanlar ekranın altına inince siliniyor
- ✅ Çarpışmayan mermiler ekranın üstüne çıkınca siliniyor

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- Collision layer ve mask kavramlarını öğrendik
- Üç nesne için katman düzenini belirledik
- `area_entered` sinyali ile mermi-düşman çarpışmasını yönettik

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='Gf4GrLFb1oE' %}

---

## Sıradaki Bölüm

**Bölüm 7'de** can ve skor sistemini kuracağız. Düşman bize çarptığında can azalacak, düşman yok ettiğimizde skor artacak. Ayrıca can sıfırlandığında oyun bitecek.

Görüşmek üzere! 🚀
