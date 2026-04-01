---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 2: Uzay Gemisini Hareket Ettirelim"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, characterbody2d, sprite2d, collisionshape2d, gdscript, hareket, input, move_and_slide]
description: "Godot 4 ile oyuncu gemisini oluşturuyoruz. CharacterBody2D, Sprite2D ve GDScript kullanarak klavye kontrolü adım adım anlatılıyor."
permalink: /godot-kozmik-akin-bolum-2/
published: true
---

# Kozmik Akın — Bölüm 2: Uzay Gemisini Hareket Ettirelim

Bu bölümde oyunumuzun en önemli parçasını oluşturacağız: oyuncunun kontrol ettiği uzay gemisi. Bölümün sonunda gemimiz ekranda görünecek ve klavyeyle sağa sola hareket edecek.

---

## Önce Asset'leri Hazırlayalım

Bu seride kullandığımız tüm görseller **Kenney.nl** sitesinden alınmıştır ve ücretsiz, lisanssız kullanıma açıktır. Seriyle birlikte hazırladığımız asset paketini aşağıdaki bağlantıdan indirebilirsiniz:

📦 **[kozmik_akin assets.zip](https://goldenware.tr/blog/kozmikakin/assets.zip)**

Zip dosyasını açın ve içindeki `sprites/` klasöründeki dosyaları Godot projenizin `res://assets/sprites/` klasörüne kopyalayın.

> 💡 Dosyaları kopyaladıktan sonra Godot'un **FileSystem** panelinde otomatik olarak görünecekler. Herhangi bir "import" işlemi yapmanıza gerek yok — Godot dosyaları kendisi algılar.

---

## Gemi Sahnesini Oluşturalım

Godot'ta her oyun nesnesi ayrı bir sahne dosyası olarak oluşturulur. Gemimiz de kendi sahnesine sahip olacak.

1. **Scene → New Scene** ile yeni bir sahne açın
2. Kök node olarak **"Other Node"** seçeneğine tıklayın
3. Arama kutusuna `CharacterBody2D` yazın ve seçin
4. Node adını `Player` olarak değiştirin
5. `Ctrl + S` ile sahneyi `res://scenes/player.tscn` olarak kaydedin

> 💡 **CharacterBody2D nedir?** Godot'ta hareket eden oyuncu karakterleri için özel olarak tasarlanmış bir node türüdür. Fizik motoruyla uyumlu çalışır, çarpışma tespiti yapabilir. Platformer oyunlarda, üstten bakış oyunlarda ve bizim gibi shooter oyunlarda kullanılır.

---

## Sprite'ı Ekleyelim

Şu an sahnede sadece bir `CharacterBody2D` node var, ekranda henüz hiçbir şey görünmüyor. Geminin görselini ekleyelim.

1. `Player` node'u seçili haldeyken üst soldaki **"+"** butonuna tıklayın (ya da `Ctrl + A`)
2. Arama kutusuna `Sprite2D` yazın ve ekleyin
3. **Inspector** panelinde **Texture** alanına gelin
4. **FileSystem** panelinden `res://assets/sprites/SpaceShip_1.png` dosyasını sürükleyip bu alana bırakın

Gemimiz sahne görünümünde belirdi! 🚀

> 💡 Gemi çok büyük ya da çok küçük görünüyorsa endişelenmeyin. `Sprite2D` node'u seçili haldeyken **Inspector'da** `Scale` değerlerini ayarlayabilirsiniz. Şimdilik olduğu gibi bırakın, ilerleyen bölümlerde düzenleriz.

---

## Çarpışma Şeklini Ekleyelim

`CharacterBody2D` çarpışma tespiti yapabilmek için bir **CollisionShape2D** node'una ihtiyaç duyar. Bunu eklemeden gemi diğer nesnelerle etkileşime giremez.

1. `Player` node'u seçili haldeyken tekrar **"+"** butonuna tıklayın
2. `CollisionShape2D` ekleyin
3. **Inspector** panelinde **Shape** alanına tıklayın ve **"New RectangleShape2D"** seçin
4. Sahne görünümünde kapsül şeklinin gemiyi kapsayacak şekilde boyutunu ayarlayın

> 💡 Çarpışma şeklinin sprite'ı tam olarak kaplaması şart değil. Biraz daha küçük tutmak oyunu daha "adil" hissettiriyor — düşman mermisi gemi görselinin kenarına değse bile hasar almıyoruz. Bu oyun tasarımında yaygın bir tekniktir.

Sahne yapısı şu an şöyle görünmeli:
```
Player (CharacterBody2D)
├── Sprite2D
└── CollisionShape2D
```

---

## Script Ekleyelim ve Hareketi Kodlayalım

Şimdi gemiye klavye kontrolü ekleyeceğiz. Bunun için bir GDScript dosyası oluşturacağız.

1. `Player` node'u seçin
2. **Scene** panelinin üst kısmındaki script ikonuna tıklayın (ya da sağ tıklayıp **"Attach Script"** seçin)
3. Açılan pencerede Path alanını `res://scripts/player.gd` olarak ayarlayın
4. **"Create"** butonuna tıklayın

Script editörü açıldı. Şu an içinde bazı kodlar var. Bu kodların tamamını silip aşağıdaki kodları girin;

```gdscript
extends CharacterBody2D

const SPEED = 300.0

func _physics_process(delta: float) -> void:
	var direction = Input.get_axis("ui_left", "ui_right")
	velocity.x = direction * SPEED
	move_and_slide()
```

Kodu satır satır inceleyelim:

**`const SPEED = 300.0`**
Geminin hareket hızını bir sabit olarak tanımladık. Sayıyı değiştirerek hızı kolayca ayarlayabilirsiniz.

**`func _physics_process(delta: float) -> void:`**
Bu fonksiyon her fizik adımında (saniyede 60 kez) çalışır. Hareket kodu buraya yazılır.

**`var direction = Input.get_axis("ui_left", "ui_right")`**
Sol ok tuşuna basıldığında `-1.0`, sağ ok tuşuna basıldığında `1.0`, hiçbirine basılmadığında `0.0` değerini döndürür.

**`velocity.x = direction * SPEED`**
Yön ile hızı çarparak geminin yatay hızını belirliyoruz.

**`move_and_slide()`**
`CharacterBody2D`'nin özel bir fonksiyonu. Velocity değerine göre node'u hareket ettirir ve yol üzerindeki nesnelere çarptığında onu durdurur.

---

## Gemiyi Ana Sahneye Ekleyelim

Şu an `player.tscn` sahnesi ayrı duruyor. Onu ana sahnемize ekleyelim.

1. **FileSystem** panelinden `res://scenes/main.tscn` dosyasına çift tıklayın
2. `Main` node'u seçili haldeyken **FileSystem'dan** `player.tscn` dosyasını sürükleyip sahne hiyerarşisine bırakın

Ana sahne yapısı şöyle olmalı:
```
Main (Node2D)
└── Player (CharacterBody2D)
```

3. `Ctrl + S` ile kaydedin

---

## Test Edelim

`F5` tuşuna basın. Siyah ekranda geminiz görünmeli. Sol ve sağ ok tuşlarıyla hareket etmeli.

İki sorun fark edeceksiniz:

1. Gemi ekranın tam ortasında değil
2. Gemi ekranın dışına çıkabiliyor

Bunları nasıl çözeceğimizi bir sonraki bölümde ele alacağız!

> 💡 Bir şeyi "eksik bırakmak" ve bir sonraki bölümde çözmek hem öğrenmeyi pekiştirir hem de biraz sabırsızlık verir. Eğer siz de şu an o sorunları fark ettiyseniz — bu harika bir işaret! 🎉

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- Asset paketini projeye ekledik
- `CharacterBody2D` kullanarak `Player` sahnesi oluşturduk
- `Sprite2D` ile geminin görselini ekledik
- `CollisionShape2D` ile çarpışma şeklini tanımladık
- GDScript ile klavye kontrolü yazdık
- Gemiyi ana sahneye ekledik

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='8E9eRMHrz_g' %}

---

## Sıradaki Bölüm

**Bölüm 3'te** mermi atacağız. Godot'un sahne instancing sistemini öğreneceğiz — bu, Godot'un en güçlü özelliklerinden biri!

Görüşmek üzere! 🚀
