---
title: "Godot Eğitim Serisi - Bölüm 5: 2D Oyuna Hazırlık ve Oyuncu Karakteri"
date: 2026-03-08 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, 2d oyun, player, karakter kontrolü, input map, animasyon]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpOBHHM_ytWLKqEBv6BEbDcozFI1Gg7fbMeeEVHAVtaANxdW9gVXLJMFQvKj8Wnj8oPwqzvMgzhL7i-Duiu2eIWfjmr2nvVmjWU11WsybZYpTVOF5mgiLf4QcKDVUD4MNBsDXuVeX1n_VE1znllDKPUiNDcT_m5csZCi3uCUhHxaD5UPFKiri4XbB7LA/s320/spriteframes_panel2.webp
  alt: Godot SpriteFrames Paneli
---

Godot Engine eğitim serimizin ilk gerçek oyun yapma aşamasına hoş geldiniz! Bu dersimizde basit bir “Kaçınma” oyunu hazırlayacağız. İlk olarak projeyi kuracak ve oyuncumuzun (Player) kontrollerini ve animasyonlarını hazırlayacağız.

## 1. Oyun Alanı: Ekran Boyutlandırma

Dikey ekranda oynanan bir oyun yapımız olacak. Telefon ekranı gibi düşünebilirsiniz.

Godot menüsünden **Project -> Project Settings** diyerek ayarları açın. **Display -> Window** bölümünde “Viewport Width” (Genişlik) değerini `480`, “Viewport Height” (Yükseklik) değerini `720` yapın.

Oyunumuzun farklı ekranlarda doğru oranda büyümesi için **Stretch** (Esnetme) seçeneklerinde **Mode** değerini `canvas_items`, **Aspect** değerini ise `keep` yapmayı unutmayın.

![Ekran Boyutları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgN_42a4sI0XjzgivK2OoAQe3deTbK8S38kqZE4THFHabZlfC9xAliU0XfHizKNg2G9Ouirp6GJ8K5oC1fS3ZvfyWXkpmJFAAt3KmZUla_ksP_fixctQ9lrdtgbfZGCSWucfpwFzxkKPm-laIVnhp5QISdxLk7uteXkqVR7eoaCiDe7ot1KNSjjjeWHuQ/s320/setting-project-width-and-height.webp)
![Stretch Modu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgg1vv1RGmKv5EBt8eXTfwOIKbizmdpcu4dbZMS2QLW9vneesp2MhFA8CzzPsuoH7cM2uQMVpjDINPt9V62GEoWeWA_EA9I4qAyigBUbS9O1Oqp89k0PNlHE6B7tE1Tb3nOUEgAEUbPOqFHzzU4RzMOfLIFIgFHmYDLLT0LjeP5uprbWXXXs_OlRVWRMg/s320/setting-stretch-mode.webp)

---

## 2. Oyuncu Sahnesi ve Temeller

Oyuncu karakterimiz için işleri temiz tutmak adına yeni bir sahne oluşturacağız. Bu sahnemizin ana düğümü bir **Area2D** olacak. Çünkü düşmanlarla çarpışma tespiti üzerine çalışacağız.

Sol üstten “Other Node” ile **Area2D** ekleyin ve adını `Player` olarak değiştirin.

Hemen ardından sağ kısımdaki gruplama (Lock/Kilitleme) ikonuna basarak çocuk düğümlerle ana düğümü birbirine kenetleyin. Böylece sahnede taşıma işlemi yaparken parçalar birbirinden kopmaz.

![Çocukları Kilitleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeKlI5hQ3AUQOlRt2RkxrEOm18Fgw62cueM_qa7f3fyQ65lRW84pcAz3BBoZsIAXSwrS-cAUK4DsktqnUYC5wB0JwVNQ1WmRkmq-nBGIr09vCAnkdzdDcQNdtaXPIxyk4P3XktKzGxxDt8nB7wiSXdVRugFtaQ01SAq50mk-S7XHas4Id4fvcsDtmMEg/s320/lock_children.webp)

Sahnemizi `player.tscn` adıyla kaydedin.

---

## 3. Görseller ve Animasyon (AnimatedSprite2D)

Oyuncumuzun hareketli görünmesini istiyoruz. Player düğümüne bir **AnimatedSprite2D** ekleyin. Sağda açılan Inspector panelinde “Sprite Frames” karşısında “[empty]” tıkla ve **New SpriteFrames** diyerek yeni bir paket yaratın.

Alt kısımda açılan sahnede, “default” olan animasyonun adını `walk` (yürüme) yapın. Yeni bir tane daha ekleyip ona da `up` (yukarı) diyin. Daha önce projenize attığınız `art` (görsel) dosyalarından ilgili kareleri sürükleyerek bu animasyon pencerelerine ekleyin. Görüntü ekranda çok büyük gözükeceğinden AnimatedSprite2D’nin Scale ayarını `x: 0.5, y:0.5` yaparak küçültebilirsiniz.

![Sprite Frames Paneli](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpOBHHM_ytWLKqEBv6BEbDcozFI1Gg7fbMeeEVHAVtaANxdW9gVXLJMFQvKj8Wnj8oPwqzvMgzhL7i-Duiu2eIWfjmr2nvVmjWU11WsybZYpTVOF5mgiLf4QcKDVUD4MNBsDXuVeX1n_VE1znllDKPUiNDcT_m5csZCi3uCUhHxaD5UPFKiri4XbB7LA/s320/spriteframes_panel2.webp)
_(Görsel Referansı: `spriteframes_panel2.webp` - Animasyon iskeletine kareleri yerleştirme)_

---

## 4. Hitbox (Çarpışma Alanı) Belirleme

Area2D’ler çarpışma sınırlarını bilmek için bir şekle ihtiyaç duyarlar. Player düğümüne çocuk olarak bir **CollisionShape2D** ekleyin. Shape alanından “New CapsuleShape2D” seçin ve ekrandaki turuncu kontrolcüleri sürükleyerek karakter formuna oturtun.

![Kapsül Çarpışma Alanı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-CL2MJMGwZ292lfZwMEq4HZrULwE5HANfK225sxgLdrZeZ6_cnn4N7CRcKb8ZtmLRjyVqAJ2wb5w9Rh2GvrTF6d2IDo9Lda2guEaWcrNGEW_-Yn0FAcCcc5gUu_Mjpdh4447Ok01m0_HwQJq3zROtdQTq4M3wj6Deifze7Qhyphenhyphena7qJznrhPvOueDhwTA/s320/player_coll_shape1.webp)

---

## 5. Input Map ile Kontrolleri Tanımlamak

Kodlamaya geçmeden oyuncu kontrollerini (ok tuşları) tanıtalım.

Tekrar **Project Settings -> Input Map** sekmesine gelin. Yukarıdaki “Add New Action” çubuğuna `move_right`, `move_left`, `move_up` ve `move_down` isimlerini yazıp listeleyin. Yanlarındaki + butonuna basıp klavyenizdeki ilgili yön tuşlarını tanımlayın.

![Input Map Ayarları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXzA4QmfsMhzP0F6UWPkZC4Yp8aERV5zNoNz11peGPFKgS6y-Bcvtjiv89cGZPKZ-UF6qHH1fGF0b0Xznfa10UJ_15Wrlv9IxotfmjXHS-FpAaUMnPiQT8zYWJwnDLQ6TPf_cXk0urFonK-kLjnwR0AqeLAcPKFAmXeF4uRUXMADAAnMTl7h1Pco07GQ/s320/input-mapping-completed.webp)

---

## 6. Oyuncuyu Kodlamak (Karakter Hareketi)

Şimdi işin eğlenceli kod kısmına geçelim! `Player` düğümüne Script ekleyin.

```gdscript
extends Area2D

@export var speed = 400 # Saniyede px cinsinden hız.
var screen_size # Ekran boyutunu tutacağımız değişken.

func _ready():
	screen_size = get_viewport_rect().size
	hide() # Oyun başlarken karakterimiz gizli başlayacak.
