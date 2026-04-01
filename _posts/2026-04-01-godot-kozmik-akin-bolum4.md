---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 4: Mermiyi Doğru Noktadan Atalım"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, marker2d, ateş noktası, fire rate, await, create_timer, onready, ateş hızı]
description: "Marker2D ile mermiyi geminin ucundan çıkarıyoruz. await ve create_timer kullanarak ateş hızını sınırlıyoruz. Basılı tutarak sürekli ateş sistemi kuruluyor."
permalink: /godot-kozmik-akin-bolum-4/
published: true
---

# Kozmik Akın — Bölüm 4: Mermiyi Doğru Noktadan Atalım

Önceki bölümde ateş etmeyi başardık ama iki sorun kaldı: mermi geminin ortasından çıkıyor ve sürekli ateş edemiyoruz. Bu bölümde her ikisini de çözeceğiz.

Bölümün sonunda mermi geminin ucundan çıkacak ve Space tuşuna basılı tutarak sürekli ateş edebileceğiz.

---

## Marker2D ile Ateş Noktası Belirleyelim

`res://scenes/player.tscn` dosyasını açın. `Player` node'u seçiliyken **"+"** butonuna tıklayın ve `Marker2D` ekleyin. Node adını `FirePoint` olarak değiştirin.

> 💡 **Marker2D nedir?**
> Sahnede görünmez bir işaret noktasıdır. Boyutu, fiziği, görseli yoktur — sadece bir konum taşır. "Mermi buradan çıksın", "efekt burada oluşsun" gibi referans noktaları için kullanılır.

Sahne yapısı şöyle olmalı:
```
Player (CharacterBody2D)
├── Sprite2D
├── CollisionShape2D
└── FirePoint (Marker2D)
```

### FirePoint'i Doğru Konuma Taşıyın

`FirePoint` node'unu seçin. Sahne görünümünde yeşil bir artı işareti belirdi — bu bizim işaret noktamız. Bunu geminin ucuna taşımamız gerekiyor.

**Inspector** panelinde **Transform > Position** alanını bulun:

| Eksen | Değer |
|-------|-------|
| X | `0` |
| Y | `-50` |

> 💡 Y ekseninde eksi yön yukarıdır. Gemi görselinize göre bu değeri ayarlamanız gerekebilir. `FirePoint` sahne görünümünde geminin tam ucuna gelene kadar Y değerini değiştirin.

---

## player.gd'yi Güncelleyelim

`res://scripts/player.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0
const BULLET_SCENE = preload("res://scenes/bullet.tscn")
const FIRE_RATE = 0.2

var can_shoot = true

@onready var fire_point = $FirePoint

func _physics_process(delta: float) -> void:
	var direction = Input.get_axis("ui_left", "ui_right")
	velocity.x = direction * SPEED
	move_and_slide()
	clamp_to_screen()

	if Input.is_action_pressed("ui_accept") and can_shoot:
		shoot()

func clamp_to_screen() -> void:
	var screen_size = get_viewport_rect().size
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)

func shoot() -> void:
	can_shoot = false
	var bullet = BULLET_SCENE.instantiate()
	bullet.position = fire_point.global_position
	get_parent().add_child(bullet)
	await get_tree().create_timer(FIRE_RATE).timeout
	can_shoot = true

func _input(event: InputEvent) -> void:
	pass
```

Yeni eklenen kısımları inceleyelim:

**`const FIRE_RATE = 0.2`**
İki ateş arasındaki minimum süreyi saniye cinsinden belirler. 0.2 saniye, yani saniyede en fazla 5 mermi atılabilir.

**`var can_shoot = true`**
Ateş etme iznini tutan bir bayrak değişkeni. `true` iken ateş edilebilir, `false` iken edilemez.

**`@onready var fire_point = $FirePoint`**
`@onready`, sahne hazır olduğunda bu satırın çalışacağını söyler. `$FirePoint` ise sahnedeki `FirePoint` node'una kısayoldur. Artık script içinden bu node'a `fire_point` adıyla erişebiliriz.

** func _physics_process(delta: float) ** içinde;

**`if Input.is_action_pressed("ui_accept") and can_shoot:`**
Bölüm 3'te `_input` fonksiyonu kullandık — bu sadece tuşa basıldığı anda tetikleniyordu. Şimdi `_physics_process` içinde `Input.is_action_pressed` kullanıyoruz. Bu fonksiyon tuş basılı tutulduğu sürece `true` döndürür. `can_shoot` bayrağı ile de ateş iznini kontrol ediyoruz.

** func shoot() -> void: ** içinde;

**`can_shoot = false`**
Ateş edilince hemen bayrağı kapatıyoruz. Bu sayede yeni bir mermi oluşturulmadan önce bekleme süresi dolması gerekiyor.

**`bullet.position = fire_point.global_position`**
Merminin başlangıç konumunu artık geminin merkezine değil, `FirePoint`'in sahne koordinatlarına göre konumuna eşitliyoruz.

**`await get_tree().create_timer(FIRE_RATE).timeout`**
`create_timer` belirtilen süre kadar bekleyen tek kullanımlık bir zamanlayıcı oluşturur. `await` ise bu satırda beklenir ama diğer kodların çalışması durmaz — oyun donmaz. Süre dolunca bir sonraki satıra geçilir.

**`can_shoot = true`**
Bekleme süresi dolunca bayrak tekrar açılır ve yeni bir ateş mümkün olur.

**`func _input` → `pass`**
Ateş kontrolünü `_physics_process`'e taşıdık. `_input` fonksiyonuna artık ihtiyacımız yok ama tamamen silersek Godot uyarı verebilir — `pass` yazarak "bu fonksiyon burada, ama şimdilik boş" demiş oluyoruz.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Mermi geminin ucundan çıkıyor
- ✅ Space tuşuna basılı tutunca sürekli ateş ediliyor
- ✅ Mermiler arasında kısa bir bekleme süresi var

> 💡 Mermi hâlâ tam uctan çıkmıyorsa `FirePoint`'in Y değerini ayarlayın. Ateş hızı çok yavaş ya da hızlı geliyorsa `FIRE_RATE` sabitini değiştirin.

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- `Marker2D` ile gemiye ateş noktası ekledik
- `@onready` ile node referansı oluşturduk
- `can_shoot` bayrağı ile ateş hızını sınırladık
- `await` ve `create_timer` ile bekleme mekanizması kurduk
- `Input.is_action_pressed` ile basılı tutarak ateş etmeyi sağladık

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='yDy67MSoqD0' %}

---

## Sıradaki Bölüm

**Bölüm 5'te** düşmanları üretmeye başlayacağız. `Timer` node'u ile belirli aralıklarla ekrana düşman spawn eden bir sistem kuracağız.

Görüşmek üzere! 🚀
