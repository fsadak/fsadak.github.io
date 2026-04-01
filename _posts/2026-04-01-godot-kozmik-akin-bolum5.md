---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 5: Düşmanları Üretelim"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, timer, spawn, düşman, area2d, randf_range, sinyal, timeout, otomatik üretim]
description: "Timer node'u ile belirli aralıklarla rastgele konumda düşman üretiyoruz. Godot sinyal sistemi ilk kez kullanılıyor: timeout sinyali ile spawn fonksiyonu bağlanıyor."
permalink: /godot-kozmik-akin-bolum-5/
published: true
---

# Kozmik Akın — Bölüm 5: Düşmanları Üretelim

Gemimiz hareket ediyor, ateş ediyor. Şimdi sıra düşmanlarda! Bu bölümde ekranın üstünden aşağıya doğru inen düşman gemiler oluşturacağız. Bunun için Godot'un `Timer` node'unu ve rastgele konum üretmeyi öğreneceğiz.

Bölümün sonunda düşmanlar belirli aralıklarla ekranın üstünden rastgele pozisyonlarda çıkacak ve aşağıya doğru inecek.

---

## Düşman Sahnesi Oluşturalım

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçin
3. Arama kutusuna `Area2D` yazın ve seçin
4. Node adını `Enemy` olarak değiştirin
5. `Ctrl + S` ile `res://scenes/enemy.tscn` olarak kaydedin

> 💡 Düşman için de `Area2D` kullanıyoruz. Tıpkı mermide olduğu gibi — hareket kontrolü bizde, çarpışma tespiti Godot'ta.

---

## Düşman Sprite'ını Ekleyelim

1. `Enemy` node seçiliyken **"+"** butonuyla `Sprite2D` ekleyin
2. **Inspector'da** Texture alanına `res://assets/sprites/Enemy_1.png` dosyasını sürükleyin

> 💡 `Enemy_1.png` doğrudan bizim gemimize bakacak şekilde tasarlanmış. Herhangi bir döndürme işlemi yapmamıza gerek yok.

---

## Çarpışma Şeklini Ekleyelim

1. `Enemy` node seçiliyken **"+"** butonuyla `CollisionShape2D` ekleyin
2. **Inspector'da** Shape alanından **"New RectangleShape2D"** seçin
3. Şekli düşman görseline uyacak şekilde ayarlayın

Sahne yapısı şöyle olmalı:
```
Enemy (Area2D)
├── Sprite2D
└── CollisionShape2D
```

---

## Düşman Script'ini Yazalım

`Enemy` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/enemy.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends Area2D

const SPEED = 200.0

func _physics_process(delta: float) -> void:
	position.y += SPEED * delta

	if position.y > 800:
		queue_free()
```

Kodu inceleyelim:

**`const SPEED = 200.0`**
Düşmanın aşağı doğru hareket hızı. Gemimizden yavaş, mermimizden çok yavaş — oyun dengesi açısından iyi bir başlangıç noktası.

**`func _physics_process(delta: float) -> void:`** içinde;

**`position.y += SPEED * delta`**
Merminin tersine, burada Y eksenini artırıyoruz. Godot'ta Y ekseni aşağıya doğru artar, yani düşman aşağı iniyor.

**`if position.y > 800: queue_free()`**
Düşman ekranın altına çıktığında kendini sahneden siler. Ekranımız 720 piksel yüksekliğinde, 800 biraz fazlası — düşman ekrandan tamamen çıkınca silinsin diye böyle ayarladık.

---

## Ana Sahneye Spawn Sistemi Ekleyelim

Düşmanları belirli aralıklarla otomatik olarak üretecek bir sisteme ihtiyacımız var. Bunun için `Main` sahnesine bir `Timer` node'u ekleyeceğiz.

`res://scenes/main.tscn` dosyasını açın.

1. `Main` node seçiliyken **"+"** butonuyla `Timer` ekleyin
2. Node adını `SpawnTimer` olarak değiştirin
3. **Inspector** panelinde şu değerleri ayarlayın:

| Ayar | Değer |
|------|-------|
| Wait Time | `1.5` |
| Autostart | `On` |

> 💡 **Timer nedir?**
> Belirli bir süre sonra sinyal gönderen özel bir node'dur. `Wait Time` süre dolunca `timeout` sinyalini yayar. `Autostart` açıksa sahne başladığında otomatik çalışır.

Sahne yapısı şöyle olmalı:
```
Main (Node2D)
├── Player (CharacterBody2D)
└── SpawnTimer (Timer)
```

---

## Main Script'ini Yazalım

`Main` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/main.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends Node2D

const ENEMY_SCENE = preload("res://scenes/enemy.tscn")

@onready var spawn_timer = $SpawnTimer

func _ready() -> void:
	spawn_timer.timeout.connect(_on_spawn_timer_timeout)

func _on_spawn_timer_timeout() -> void:
	spawn_enemy()

func spawn_enemy() -> void:
	var enemy = ENEMY_SCENE.instantiate()
	var screen_width = get_viewport_rect().size.x
	enemy.position.x = randf_range(50, screen_width - 50)
	enemy.position.y = -50
	add_child(enemy)
```

Kodu inceleyelim:

**`@onready var spawn_timer = $SpawnTimer`**
`SpawnTimer` node'una script içinden erişmek için referans oluşturuyoruz.

**`func _ready() -> void:`** içinde;

**`spawn_timer.timeout.connect(_on_spawn_timer_timeout)`**
`Timer`'ın `timeout` sinyalini `_on_spawn_timer_timeout` fonksiyonumuza bağlıyoruz. Her 1.5 saniyede bir `timeout` sinyali yayılacak ve bu fonksiyon çalışacak.

> 💡 **Sinyal nedir?**
> Godot'ta bir node "bir şey oldu!" diye diğer node'lara haber vermek istediğinde sinyal kullanır. `Timer`'ın `timeout` sinyali "sürem doldu" demek. Biz de bu haberi alınca `spawn_enemy()` fonksiyonunu çağırıyoruz. Sinyaller Godot'un en güçlü özelliklerinden biridir — ilerleyen bölümlerde çok daha fazla kullanacağız.

**`func spawn_enemy() -> void:`** içinde;

**`var enemy = ENEMY_SCENE.instantiate()`**
Mermi oluştururken öğrendiğimiz `instantiate()` fonksiyonunu burada da kullanıyoruz. Her çağrıda yeni bir düşman nesnesi doğuyor.

**`var screen_width = get_viewport_rect().size.x`**
Ekran genişliğini alıyoruz. Düşmanın yalnızca X ekseninde rastgele konumlandırılması için yeterli.

**`enemy.position.x = randf_range(50, screen_width - 50)`**
`randf_range` iki değer arasında rastgele bir ondalıklı sayı üretir. Düşmanın ekranın tam kenarında çıkmaması için her iki taraftan 50 piksel içeride tutuyoruz.

**`enemy.position.y = -50`**
Düşman ekranın üstünden, görünmez bir noktadan çıkıyor. İzleyiciye "gökten indi" hissi veriyor.

**`add_child(enemy)`**
Düşmanı ana sahneye ekliyoruz.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Düşmanlar 1.5 saniyede bir ekranın üstünden çıkıyor
- ✅ Her düşman farklı bir X konumunda beliriyor
- ✅ Düşmanlar aşağı doğru iniyor
- ✅ Alt taraftan ekranın dışına çıkan düşmanlar siliniyor

Bir sorun fark edeceksiniz: mermiler düşmanlara çarpıyor ama hiçbir şey olmuyor! Çarpışma tespitini henüz bağlamadık. Bunu bir sonraki bölümde çözeceğiz.

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `Area2D` kullanarak `Enemy` sahnesi oluşturduk
- `Timer` node'u ile otomatik spawn sistemi kurduk
- Sinyal sistemini ilk kez kullandık — `timeout` sinyalini fonksiyona bağladık
- `randf_range` ile rastgele konum ürettik
- `Main` sahnesine script ekledik

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='oxFnkMMYOmU' %}

---

## Sıradaki Bölüm

**Bölüm 6'da** çarpışmaları yöneteceğiz. Mermi düşmana çarptığında ikisi de yok olacak. Godot'un collision layer ve mask sistemi ile sinyal sistemini daha derin öğreneceğiz.

Görüşmek üzere! 🚀
