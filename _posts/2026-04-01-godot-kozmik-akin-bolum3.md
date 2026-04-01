---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 3: Sınırları Belirleyelim ve Mermi Atalım"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, ekran sınırı, clamp, area2d, mermi, instantiate, queue_free, sahne instancing]
description: "Geminin ekran dışına çıkmasını önlüyoruz ve Area2D kullanarak mermi atma sistemini kuruyoruz. Sahne instancing ve queue_free kavramları anlatılıyor."
permalink: /godot-kozmik-akin-bolum-3/
published: true
---

# Kozmik Akın — Bölüm 3: Sınırları Belirleyelim ve Mermi Atalım

Önceki bölümde gemimizi hareket ettirdik. Ama iki sorun kaldı: gemi ekranın sol üstünde başlıyor ve ekranın dışına çıkabiliyor. Önce bunları düzelteceğiz, sonra ateş etmeyi ekleyeceğiz.

Bölümün sonunda gemimiz ekranın alt ortasında başlayacak, sınırların dışına çıkmayacak ve Space tuşuyla mermi atacak.

---

## Geminin Başlangıç Konumunu Ayarlayalım

`res://scenes/main.tscn` dosyasını açın. Sahne hiyerarşisinde `Player` node'unu seçin.

**Inspector** panelinde **Transform > Position** alanını bulun ve şu değerleri girin:

| Eksen | Değer |
|-------|-------|
| X | `240` |
| Y | `620` |

> 💡 Ekranımız 480×720 piksel. X ekseninde ortası 240, Y ekseninde alta yakın bir konum için 620 iyi bir başlangıç noktası. Gemi görselinize göre bu değeri biraz yukarı ya da aşağı taşıyabilirsiniz.

`F5` ile test edin — gemi artık ekranın alt ortasında başlıyor olmalı.

---

## Ekran Sınırlarını Ekleyelim

Şimdi `res://scripts/player.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0

func _physics_process(delta: float) -> void:
	var direction = Input.get_axis("ui_left", "ui_right")
	velocity.x = direction * SPEED
	move_and_slide()
	clamp_to_screen()

func clamp_to_screen() -> void:
	var screen_size = get_viewport_rect().size
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)
```

Yeni eklenen kısımları inceleyelim:

**`func clamp_to_screen() -> void:`**
Sınır kontrolünü ayrı bir fonksiyon olarak yazdık. Bu sayede `_physics_process` temiz ve okunabilir kalıyor.

**`get_viewport_rect().size`**
O an çalışan ekranın boyutunu döndürür. Biz Bölüm 1'de 480×720 ayarlamıştık — bu değer oradan gelir. Sabit sayı yazmak yerine bunu kullanmak, ekran boyutu değişse bile kodun çalışmaya devam etmesini sağlar.

**`clamp(position.x, 0, screen_size.x)`**
`clamp` bir değeri belirli bir aralıkta tutar. Paraetrelerden ilk değer kontrol edilecek değerdir yani geminin x eksenindeki konumu. İkinci parametre geminin x ekseni değerinin alabileceği minimum değer. Burada sıfır vererek x ekseni değerinin sıfırdan daha küçük olmasını engelliyoruz. Üçüncü parametre ise geminin x ekseninde gidebileceği maksimum değer. Burada ise oyunun çalıştığı cihazın ekran genişliğini alarak sınırlıyoruz. Bu sayede gemi 0'ın soluna ya da ekran genişliğinin sağına geçemez.

`F5` ile test edin — gemi artık ekranın dışına çıkmamalı.

---

## Mermi Sahnesi Oluşturalım

Sınır sorunlarını çözdük. Şimdi sıra ateş etmeye geldi! Mermiler de tıpkı gemi gibi kendi sahnesine sahip olacak. Her ateş ettiğimizde bu sahnenin bir kopyasını oluşturacağız.

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçin
3. Arama kutusuna `Area2D` yazın ve seçin
4. Node adını `Bullet` olarak değiştirin
5. `Ctrl + S` ile `res://scenes/bullet.tscn` olarak kaydedin

> 💡 **Neden `Area2D` kullandık, `CharacterBody2D` değil?**
> Mermiler fizik motoruna göre hareket etmez — sadece düz yukarı gider. Ama bir şeye çarpıp çarpmadığını tespit etmemiz gerekiyor. `Area2D` tam bunun için var: hareket kontrolü bizde, çarpışma tespiti Godot'ta.

---

## Mermi Sprite'ını Ekleyelim

1. `Bullet` node seçiliyken **"+"** butonuyla `Sprite2D` ekleyin
2. **Inspector'da** Texture alanına `res://assets/sprites/Laser.png` dosyasını sürükleyin

---

## Çarpışma Şeklini Ekleyelim

1. `Bullet` node seçiliyken **"+"** butonuyla `CollisionShape2D` ekleyin
2. **Inspector'da** Shape alanından **"New RectangleShape2D"** seçin
3. Şekli lazer görseline uyacak şekilde ayarlayın

Sahne yapısı şöyle olmalı:
```
Bullet (Area2D)
├── Sprite2D
└── CollisionShape2D
```

---

## Mermi Script'ini Yazalım

`Bullet` node'una sağ tıklayıp **"Attach Script"** seçin. Path: `res://scripts/bullet.gd`

Tüm içeriği silip şunu yazın:
```gdscript
extends Area2D

const SPEED = 600.0

func _physics_process(delta: float) -> void:
	position.y -= SPEED * delta

	if position.y < -50:
		queue_free()
```

Kodu inceleyelim:

**`const SPEED = 600.0`**
Mermi gemiden daha hızlı olmalı — 600 iyi bir başlangıç değeri.

**`position.y -= SPEED * delta`**
Her karede merminin Y pozisyonunu azaltıyoruz. Godot'ta Y ekseni aşağıya doğru artar, yani eksi yönü yukarıdır.

**`delta`**
İki kare arasındaki süredir (saniye cinsinden). Hızı `delta` ile çarpmak, oyunun farklı FPS değerlerinde bile aynı hızda çalışmasını sağlar.

**`if position.y < -50: queue_free()`**
Mermi ekranın üstüne çıktığında kendini sahneden siler. `queue_free()` bir node'u güvenli şekilde bellekten kaldırır.

> 💡 **Neden `queue_free()` kullanıyoruz, `free()` değil?**
> `free()` node'u anında siler — aynı kare içinde o node'a başka bir erişim varsa oyun çöker. `queue_free()` ise "bu kare bitince sil" der. Çok daha güvenli.

---

## Gemi Script'ine Ateş Etmeyi Ekleyelim

`player.gd` dosyasını açın ve kodu şu şekilde güncelleyin:
```gdscript
extends CharacterBody2D

const SPEED = 300.0
const BULLET_SCENE = preload("res://scenes/bullet.tscn")

func _physics_process(delta: float) -> void:
	var direction = Input.get_axis("ui_left", "ui_right")
	velocity.x = direction * SPEED
	move_and_slide()
	clamp_to_screen()

func clamp_to_screen() -> void:
	var screen_size = get_viewport_rect().size
	position.x = clamp(position.x, 0, screen_size.x)
	position.y = clamp(position.y, 0, screen_size.y)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		shoot()

func shoot() -> void:
	var bullet = BULLET_SCENE.instantiate()
	bullet.position = global_position
	get_parent().add_child(bullet)
```

Yeni eklenen kısımları inceleyelim:

**`const BULLET_SCENE = preload("res://scenes/bullet.tscn")`**
Mermi sahnesini önceden belleğe yükler. `preload` oyun başlarken çalışır, ateş ettiğimizde gecikme olmaz.

**`func _input(event: InputEvent) -> void:`**
Klavye, fare veya dokunmatik ekrandan gelen her girişi yakalar. Sadece bir tuşa basıldığında tetiklenir.

**`event.is_action_pressed("ui_accept")`**
`ui_accept` varsayılan olarak **Space** ve **Enter** tuşlarına atanmıştır. Bu tuşlardan birine basıldığında ** shoot() ** fonksiyonunu çağırır. ** shoot() ** fonksiyonu ise şunları yapar;

**`BULLET_SCENE.instantiate()`**
Sahne şablonundan yeni bir kopya oluşturur. Her ateş ettiğimizde yeni bir mermi nesnesi doğar.

**`bullet.position = global_position`**
Merminin başlangıç konumunu geminin konumuna eşitleriz.

**`get_parent().add_child(bullet)`**
Mermiyi ana sahneye (`Main`) ekleriz. Gemi sahnesine değil — çünkü mermi gemiden bağımsız hareket edecek.

---

## Test Edelim

`F5` tuşuna basın. Şunları kontrol edin:

- ✅ Gemi ekranın alt ortasında başlıyor
- ✅ Gemi ekranın dışına çıkmıyor
- ✅ Space tuşuyla mermi çıkıyor
- ✅ Mermi ekranın üstüne çıkınca kayboluyor

İki sorun fark edeceksiniz: ilki; mermi geminin ortasından çıkıyor, ucundan değil. İkincisi ise; sürekli ateş edemiyoruz. Her ateş etme işlemi için boşluk tuşunu bırakıp yeniden basmak gerekiyor. Bunları bir sonraki bölümde `Marker2D` node'u ile düzelteceğiz.

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- Geminin başlangıç konumunu ekranın alt ortasına ayarladık
- `get_viewport_rect()` ve `clamp()` ile ekran sınırlarını belirledik
- `Area2D` kullanarak `Bullet` sahnesi oluşturduk
- `queue_free()` ile ekran dışına çıkan mermileri sildik
- `preload` ve `instantiate()` ile sahne instancing öğrendik
- `_input` fonksiyonu ile Space tuşuna ateş etmeyi bağladık

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='0IenjR1W_hM' %}

---

## Sıradaki Bölüm

**Bölüm 4'te** mermiyi geminin ucundan çıkaracağız. `Marker2D` node'unu öğreneceğiz. Ayrıca Space'e basılı tutunca mermi yağmurunu da sınırlayacağız.

Görüşmek üzere! 🚀
