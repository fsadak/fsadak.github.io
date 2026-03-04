---
title: "Godot Eğitim Serisi - Bölüm 6: Düşmanları Yaratmak ve Ana Sahne"
date: 2026-03-09 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, enemy, rigidbody2d, path2d, spawn, oyun döngüsü]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPjIojZQtp7MBJM96YHC8sfq1vI2YgXY6LBpyIeR2HGRyFAxUHgQqmf0bXuSkkjZkqx10-qIjtO-oLs0wOZNQu0cqjPFAxD4omkP_4fICBujejPclcWHXfeNJr_rRLEIRkVLGK9_2BpoqbFoN5iWwmYDlXU2RfafGhxI6dOUnkusPY2suU9TUXvGr4ow/s320/draw_path2d.gif
  alt: Path2D ile Yol Çizimi
---

Oyunumuzu artık tam bir oyun yapacak ana bileşenlere geldik: Düşmanlardan kaçmak! Önce düşmanları yaratacak, ardından `Main` adı vereceğimiz bir sahnede düşmanlarımızı, oyuncuyu ve genel kuralları birleştireceğiz.

## 1. Düşman Sahnesi: RigidBody2D ve Özellikleri

Yeni bir sahne oluşturun. Kök düğüm tipi olarak **RigidBody2D** (Katı Cisim) seçin ve adını `Mob` yapın. Tıpkı Player sahnesindeki gibi çocukları ebeveynle gruplayın (kilit ikonu).

* RigidBody2D yerçekiminden etkilenir ancak uzaydaki düşmanlarımız için bunu istemiyoruz. **Gravity Scale** değerini `0` yapın.
* Düşmanların birbirine çarpmasını istemediğimiz için **Collision Mask** içinden 1’inci katmanı kaldırın.

Sahneye eklenecek Alt düğümler:

1.  **AnimatedSprite2D:** Görselimiz.
2.  **CollisionShape2D:** Vurulma alanımız.
3.  **VisibleOnScreenNotifier2D:** Ekrandan çıkışları yakalamak için.

![Mask Ayarları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfOKbCqtGo4sTI2vd1Hh5LvVtZaDrTkNUJn0kEo18bNc4KOIwngiqTcmUk7uPy3rJWCxR7BOp2NEdxDb_cFZjwkSlNWp-_vn8l_9RnzxRjrhrvsZDdMlZWM6bO10ef27N5NBTQkRI6JtYHTgwxgb2U7j5iDTmTBJfomiO1r2M4kwT7QwFRzy9-3KNafg/s320/set_collision_mask.webp)

---

## 2. Düşman Animasyonları ve Çarpışma

`AnimatedSprite2D` Sprite Frames’ini yaratın, 3 adet animasyon oluşturun: `fly`, `swim`, `walk`. (Her biri üç saniye hızında çalışsın, ‘Animation Speed’ = 3). Sprite’ı çok az küçülterek Scale değerini `(0.75, 0.75)` yapın.

Sonrasında CollisionShape2D için ‘CapsuleShape2D’ seçin, ancak kapsül dikeydir, düşmanlarımız yatay olduğu için **Transform > Rotation** kısmından `90` derece çevirin ve boyutu tam olarak düşmana oturtun. `mob.tscn` olarak kaydedin.

![Mob Animasyonları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHTNmDVHSG6Gd0girHieJLusoA_iJJcXJ8Fjm5bO-q8Ml-uMMA-_NprWRgdrnnGf4By0KQ1M8-Hz5_Blxijgwwq0HVtCzeOyyuzEftp6LhGUPy9T6Z67Yj8-3AVQk_yIrEU2nIzbzz9sCkq26ZN9-dSjHQ71bRvhk8rChyphenhyphenx7rIU5OiXtYy7QvEx1b9Ww/s320/mob_animations.webp)

---

## 3. Düşman Davranışı (Kod)

Düşmanımız rastgele üreyecek ve rasgele bir animasyon tipiyle ekranda süzülecek. `mob.gd` isimli bir script ekleyin.

```gdscript
extends RigidBody2D

func _ready():
	var mob_types = Array($AnimatedSprite2D.sprite_frames.get_animation_names())
	$AnimatedSprite2D.animation = mob_types.pick_random() # Animasyonu rastgele seç
	$AnimatedSprite2D.play()
