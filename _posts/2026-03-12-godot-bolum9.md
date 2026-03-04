---
title: "Godot Eğitim Serisi - Bölüm 9: 3D Düşmanlar ve Çarpışma Mekanikleri"
date: 2026-03-12 12:00:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, mob, enemy, spawning, path3d, collision layers, squash]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHTNmDVHSG6Gd0girHieJLusoA_iJJcXJ8Fjm5bO-q8Ml-uMMA-_NprWRgdrnnGf4By0KQ1M8-Hz5_Blxijgwwq0HVtCzeOyyuzEftp6LhGUPy9T6Z67Yj8-3AVQk_yIrEU2nIzbzz9sCkq26ZN9-dSjHQ71bRvhk8rChyphenhyphenx7rIU5OiXtYy7QvEx1b9Ww/s320/mob_animations.webp
  alt: Godot 3D Düşman Modeli
---

Bu yazıda, Godot 3D projemize hareket ve tehlike katıyoruz. Düşman (Mob) sahnemizi tasarlayacak, onları rastgele oluşturacak (spawning) ve oyuncumuzun çarpışma sistemiyle etkileşime girip, üzerlerine zıplayarak (squash) onları ezmesini sağlayacağız.

## 1. Düşman Sahnesinin (Mob) Mimarisini Kurmak

Player sahnemize çok benzer adımlar izleyeceğiz. Yeni bir sahne (`mob.tscn`) oluşturup kök düğüm ismini `Mob` yapıyoruz (Türü: **CharacterBody3D**).

1.  Kendi ekseninde dönebilmesi için `Mob` altına bir **Node3D** ekleyin ve adını `Pivot` yapın.
2.  `art/mob.glb` dosyasını `Pivot`'un içine sürükleyin (Adı `Character` olsun). 
3.  `Mob`'a geri dönüp bir **CollisionShape3D** verin ve kutu formu (**BoxShape3D**) atayarak havada canavarı kaplayacak boyuta getirin.

> **Önemli:** Düşmanlar oyuna kameranın dışından girdikten sonra, haritanın karşı açısından kamerayı terk edecekler. Eğer terk eden düşmanı silmezsek, RAM’de sonsuza dek kalırlar ve oyun çöker.

Çözüm: **VisibleOnScreenNotifier3D** ekliyor ve pembe dikdörtgeni modelimizi kaplayacak boyuta getiriyoruz.

---

## 2. Düşman Davranışı (Kod)

Şimdi düşmanımızın hareket etmesi için `mob.gd` scriptini oluşturuyoruz.

```gdscript
extends CharacterBody3D

@export var min_speed = 10
@export var max_speed = 18

func _physics_process(_delta):
	move_and_slide()

# Doğuş noktası ve hedef belirten özel fonksiyon
func initialize(start_position, player_position):
	# Düşmanı başlangıç noktasına koy ve oyuncuya bakmasını sağla
	look_at_from_position(start_position, player_position, Vector3.UP)
	
	# Düz gelmemesi için rotasyon sapması ekle (-45 ile +45 derece arası)
	rotate_y(randf_range(-PI / 4, PI / 4)) 
	
	# Rastgele bir hız belirle
	var random_speed = randi_range(min_speed, max_speed)
	
	# Hızı hesapla: İleri yön (Z ekseni) * hız
	velocity = Vector3.FORWARD * random_speed
	
	# Hız vektörünü, karakterin o anki dönüş açısına göre çevir
	velocity = velocity.rotated(Vector3.UP, rotation.y)

# VisibleOnScreenNotifier3D sinyali ile ekrandan çıkınca yok et
func _on_visible_on_screen_notifier_3d_screen_exited():
	queue_free()
