---
title: "Godot Eğitim Serisi - Bölüm 8: 3D Dünyaya Giriş ve Karakter Kontrolü"
date: 2026-03-11 12:00:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, characterbody3d, staticbody3d, camera3d, fizik, hareket]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCa-pGfHQR3gppiHIwXry0Qz7OiG8c-40LiOrS48AbksghV22toYQm5FIQDwiQE7m9Aik01-Rq8oLabJdhuXWEDemb75jKiv9botaCErWOV9xpH9yea5Ter3w4L0AqRTisIU4ELxroQ8aIDl3811LFC9dYxDlv9HTBZ8rmRK7BWbGYlWcXQEatYSj2Aw/s1600/player_scene_nodes.webp
  alt: 3D Oyuncu Sahne Yapısı
---

Godot Engine ile ikinci projemizde yepyeni bir boyuta, 3D’ye geçiyoruz! Artık önümüzde geniş bir X, Y (boy) ve Z (derinlik) koordinat sistemi var. Bu yazıda size zemin hazırlamayı, bir 3D oyuncu yaratmayı ve kodla onun fiziksel dünyada ilerlemesini aktaracağım.

**Başlangıç Asist dosyaları (Sesler, Modeller):** [Squash the Creeps Assets (Zip)](https://github.com/godotengine/godot-docs-project-starters/releases/download/latest-4.x/3d_squash_the_creeps_starter.zip)

> **Kurulum Notu:** İndirdiğiniz bu dosya aslında sıfırdan oluşturacağımız 3D oyunumuzun önceden ayarlanmış boş klasörüdür. Zip dosyasını bilgisayarınızda bir klasöre çıkartın. Godot’yu açın ve başlangıçtaki ‘Project Manager’ ekranında “Import” (İçe Aktar) butonuna tıklayın. Çıkarttığınız klasörün içindeki `project.godot` dosyasını bulup seçin. Bu projeyi içe aktarıp açtığınızda, aslında “Squash the Creeps” (3D Oyunumuz) isimli yepyeni projemize giriş yapmış oluyorsunuz. İçerisinde sadece `art/` ve `fonts/` gibi ihtiyacımız olacak tasarım dosyaları var. Kendi sahnelerimizi ve kodlarımızı bu projenin içine kurmaya başlayacağız.

---

## 1. Oyun Alanının Kutusu (StaticBody3D)

Godot’da sabit zeminler, harita unsurları `StaticBody3D` sınıfına aittir. Kök düğümü basit bir `Node` olan yeni bir `main.tscn` yarattıktan sonra şu şekilde zeminimizi oluşturalım:

1.  Bir **StaticBody3D** (Adı: `Ground` olsun)
2.  Çarpışması için çocuk düğüm olan **CollisionShape3D**.
3.  Görünmesi (boyanması) için çocuk düğüm olan **MeshInstance3D**.

Şimdi `CollisionShape3D` Inspectoründen yeni bir **BoxShape3D** seçip X, Y ve Z “Size” değerlerini `(60, 2, 60)` girin (2, kalındığı belirtir).

`MeshInstance3D` Inspectorü içinden de yeni bir **BoxMesh** seçip aynı değerleri girerek onu görünür kılın. Zeminimizi Grid (ızgaraya) ortalaması için Y eksenindeki konumunu (Position) `-1` yapın.

Kapanış için sahnenize **DirectionalLight3D** güneşi ekleyip “Shadows” u açın ve açıyı kırmızı halkasından yamultun. Zemin hazır.

<!--![Zemin Yapısı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh5RUiWZC-MTgWViFMMxo-gFHVePjpRxJggYKeW8xFrrv1CaFw_w8i2kQBMSyEtPxfUqFFJJwlS86tV-PAhCxphPgQqaW_MGquYsR_aPEC0i_igRBzJd0KwhtOxJ-Zu6aM4NPGTHH2gAUdSlpEwOl48Qk_U8cQmNAbZB7cJNXXSHCvB2qTKCDTi2Edo1g/s1600/05.main_node.webp)
![Boyut Ayarları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjEZQzSJMptYpXwh9ZtFh8lDfqG1fCkBK3XoYxajnROQdNOO0xNNDx_VBiXNlhCvi0r5X-_Gvc02dj-PoZBUz9LWWBpL9xV-KkhT_rvE7ovvrQNLXZRl0reS1arOMaecl72_4-p88yriqEgl0tZ1ZA0JlX8SZkebM3cFNSf3mGd5TfPo5IwXiI9ft2CLg/s320/09.box_size.webp)
![Gölgeleri Açmak](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiE_r5vv2dwftcoijk2LCFx9iZsgVu2cMrS-S6NPTf4knGqfmjM2R_Mc8vY1kNwGe_von3hBI-XHpJvSfIwBoPoRbEE-z-vsrr8hEYh9QDFYj8h-70O6KKq1IPdsRLl85KTCKgsiR-LIUjEfHSXeRZhk_W-DhD-lX2BK5YuCnN4I-gfbaJHsQRQulgCBg/s320/16.turn_on_shadows.webp)-->

---

## 2. Oyuncu (CharacterBody3D) ve Gözleri (Pivot)

Yeni sahnemizde oyuncu için **CharacterBody3D** (Adı `Player` olsun) açıyoruz.

**Pivot Tekniği:** Modellerin kendi referans noktası yerine bizim eksenimizde dönmesini istiyorsak, ona `Node3D`den oluşan bir `Pivot` düğümü verip modeli o pivotun altında tutarız.

1.  `Player`'a bir adet **Node3D** atayın ve adını `Pivot` koyun.
2.  FileSystem içinde bulunan `art/player.glb` model dosyasını sahnede direkt `Pivot` içine sürükleyerek bırakın. İsmini `Character` yapın.
3.  Bu da fiziksel olduğu için `Player`'a geri dönerek **CollisionShape3D** bağlayıp bir **SphereShape3D** verin ve modelin içine oturacak şekilde büyütün. Merkezinin zemine değdiğinden emin olup sahneyi `player.tscn` olarak kaydedin.

<!--![Oyuncu Sahne Ağacı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCa-pGfHQR3gppiHIwXry0Qz7OiG8c-40LiOrS48AbksghV22toYQm5FIQDwiQE7m9Aik01-Rq8oLabJdhuXWEDemb75jKiv9botaCErWOV9xpH9yea5Ter3w4L0AqRTisIU4ELxroQ8aIDl3811LFC9dYxDlv9HTBZ8rmRK7BWbGYlWcXQEatYSj2Aw/s1600/player_scene_nodes.webp)
![Çarpışma Alanı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiR-QpJ5_HI-pFVnVoNbyMUr_4zVqeeFIF2S6lVJPXg4DSaFyYgUb9s0NYK3rspgUsSC1UMNaVeKDj_oKTBcpplyg9mNMn5qv8_fveZ3JAYtvN2u1DVRmodSq1Q-h8sNhVqww2Tj4vUE8kcKeTNugyl7Fp8DK5uBVnnIY1UoRQfGmrBo3cTtVPdz0N8Nw/s320/player_coll_shape.webp)-->

---

## 3. Input Map Ayarları ve Kodlama

Godot **Project Settings -> Input Map** menüsünden şu girdileri Yaratın ve Klavyeniz/Gamepadiniz için uygun okları, analogları atayın:

* `move_left`, `move_right`
* `move_forward` (ileri, W)
* `move_back` (geri, S)
* `jump`

Şimdi `Player`'a script’imizi ekleme vakti (Boş kalıp ‘Empty’ olarak açın).

* 2D de olan `_process(delta)`'yi unutun, fiziksel hareket varsa Frame bağımsız stabil çalışan **`_physics_process(delta)`** kullanılır.
* Ayrıca bir objeyi döndürmek için Vector3’ün `.normalized()` ayarı ve objenin `basis`'i (temeli) kullanılır.

<!--![Input Map](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC4DR53H4q84GbLszhyow_rWsFN47A0v1kQn8zybA_ZKtg5ssSrBiJVFVo0eBAsjassJ0x9-KvnN3mX8dzm0hzePB_M64p83gLVm91mJBApLwn4wtYStzV1ldf9vrQ5iaAehNXQ6Z0LWAKZ9JOj5UtyuqRGOkhtfU8PGr75BKl7Pf7Te6297gbcecz1g/s320/input-mapping-completed.webp)-->

Kodumuzun tüm hali şöyledir:

```gdscript
extends CharacterBody3D

@export var speed = 14 # Hızımız. (3D dünyada her bir birim 1 metredir!)
@export var fall_acceleration = 75 # Yükseklikten düşme (yerçekimi) ivmesi.

var target_velocity = Vector3.ZERO # Her frame'de hızı hafızada tutmak için.

func _physics_process(delta):
	var direction = Vector3.ZERO

	# Yönümüzü saptama (Z Ekseni Derinliktir. Z + ise Dışa (Kameraya - Geriye) gelir.)
	if Input.is_action_pressed("move_right"):
		direction.x += 1

	if Input.is_action_pressed("move_left"):
		direction.x -= 1

	if Input.is_action_pressed("move_back"):
		direction.z += 1

	if Input.is_action_pressed("move_forward"):
		direction.z -= 1
	
	# Yön bulununca normalize ediyoruz ki çarpraz giderken ekstra hız almasın.
	if direction != Vector3.ZERO:
		direction = direction.normalized()
		# Pivotu yani dolaylı olarak modeli yön iskeletine baktırıyoruz!
		$Pivot.basis = Basis.looking_at(direction)

	# Hedef Hızımızı (Yer Zemin Hızı) hesaplayalım.
	target_velocity.x = direction.x * speed
	target_velocity.z = direction.z * speed

	# Havadaysa Düşüş Hızı Hesabı
	if not is_on_floor():
		target_velocity.y = target_velocity.y - (fall_acceleration * delta)

	# Nihai Hedef Hızımızı motora bildir, gerisini o halletsin.
	velocity = target_velocity
	move_and_slide()
