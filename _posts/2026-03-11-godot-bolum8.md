---
title: "Godot Engine Eğitim Serisi - Bölüm 8: 3D Dünyaya Giriş ve Karakter Kontrolü"
date: 2026-03-08 12:00:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, character_controller, pivot, inputmap]
---

# Godot Engine Eğitim Serisi - Bölüm 8: 3D Dünyaya Giriş ve Karakter Kontrolü

Godot Engine ile ikinci projemizde yepyeni bir boyuta, 3D’ye geçiyoruz! Artık önümüzde geniş bir X, Y (boy) ve Z (derinlik) koordinat sistemi var. Bu yazıda size zemin hazırlamayı, bir 3D oyuncu yaratmayı ve kodla onun fiziksel dünyada ilerlemesini aktaracağım.

Başlangıç Asist dosyaları (Sesler, Modeller): [Squash the Creeps Assets (Zip)](https://github.com/godotengine/godot-docs-project-starters/releases/download/latest-4.x/3d_squash_the_creeps_starter.zip)

*İndirdiğiniz bu dosya aslında sıfırdan oluşturacağımız 3D oyunumuzun önceden ayarlanmış boş klasörüdür. Zip dosyasını bilgisayarınızda bir klasöre çıkartın. Godot’yu açın ve başlangıçtaki ‘Project Manager’ ekranında “Import” (İçe Aktar) butonuna tıklayın. Çıkarttığınız klasörün içindeki `project.godot` dosyasını bulup seçin. Bu projeyi içe aktarıp açtığınızda, aslında “Squash the Creeps” (3D Oyunumuz) isimli yepyeni projemize giriş yapmış oluyorsunuz. İçerisinde sadece `art/` ve `fonts/` gibi ihtiyacımız olacak tasarım dosyaları var. Kendi sahnelerimizi ve kodlarımızı bu projenin içine kurmaya başlayacağız.*

### 1- Oyun Alanının Kutusu (StaticBody3D)

Godot’da sabit zeminler, harita unsurları `StaticBody3D` sınıfına aittir. Kök düğümü basit bir `Node` olan yeni bir `main.tscn` yarattıktan sonra şu şekilde zeminimizi oluşturalım:

1. Bir `StaticBody3D` (Adı: `Ground` olsun)
2. Çarpışması için çocuk düğüm olan `CollisionShape3D`.
3. Görünmesi (boyanması) için çocuk düğüm olan `MeshInstance3D`.

Şimdi `CollisionShape3D` Inspectoründen yeni bir `BoxShape3D` seçip X, Y ve Z “Size” değerlerini (60, 2, 60) girin (2, kalındığı belirtir). `MeshInstance3D` Inspectorü içinden de yeni bir `BoxMesh` seçip aynı değerleri girerek onu görünür kılın. Zeminimizi Grid (ızgaraya) ortalaması için Y eksenindeki konumunu (Position) `-1` yapın. Kapanış için sahnenize `DirectionalLight3D` güneşi ekleyip “Shadows” u açın ve açıyı kırmızı halkasından yamultun. Zemin hazır.

![Zemin Düğümleri](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh5RUiWZC-MTgWViFMMxo-gFHVePjpRxJggYKeW8xFrrv1CaFw_w8i2kQBMSyEtPxfUqFFJJwlS86tV-PAhCxphPgQqaW_MGquYsR_aPEC0i_igRBzJd0KwhtOxJ-Zu6aM4NPGTHH2gAUdSlpEwOl48Qk_U8cQmNAbZB7cJNXXSHCvB2qTKCDTi2Edo1g/s1600/05.main_node.webp)

![Zemin Boyutları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjEZQzSJMptYpXwh9ZtFh8lDfqG1fCkBK3XoYxajnROQdNOO0xNNDx_VBiXNlhCvi0r5X-_Gvc02dj-PoZBUz9LWWBpL9xV-KkhT_rvE7ovvrQNLXZRl0reS1arOMaecl72_4-p88yriqEgl0tZ1ZA0JlX8SZkebM3cFNSf3mGd5TfPo5IwXiI9ft2CLg/s320/09.box_size.webp)

![Gölgeleri Açmak](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiE_r5vv2dwftcoijk2LCFx9iZsgVu2cMrS-S6NPTf4knGqfmjM2R_Mc8vY1kNwGe_von3hBI-XHpJvSfIwBoPoRbEE-z-vsrr8hEYh9QDFYj8h-70O6KKq1IPdsRLl85KTCKgsiR-LIUjEfHSXeRZhk_W-DhD-lX2BK5YuCnN4I-gfbaJHsQRQulgCBg/s320/16.turn_on_shadows.webp)

### 2- Oyuncu (CharacterBody3D) ve Gözleri (Pivot)

Yeni sahnemizde oyuncu için `CharacterBody3D` (Adı `Player` olsun) açıyoruz.

**Pivot Tekniği:** Modellerin kendi referans noktası yerine bizim eksenimizde dönmesini istiyorsak, ona `Node3D`den oluşan bir `Pivot` düğümü verip modeli o pivotun altında tutarız.

- `Player`'a bir adet `Node3D` atayın ve adını `Pivot` koyun.
- FileSystem içinde bulunan `art/player.glb` model dosyasını sahnede direkt `Pivot` içine sürükleyerek bırakın. İsmini `Character` yapın.
- Bu da fiziksel olduğu için `Player`'a geri dönerek `CollisionShape3D` bağlayıp bir `SphereShape3D` verin ve modelin içine oturacak şekilde büyütün. Merkezinin zemine değdiğinden emin olup sahneyi `player.tscn` olarak kaydedin.

![Oyuncu Düğümleri](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCa-pGfHQR3gppiHIwXry0Qz7OiG8c-40LiOrS48AbksghV22toYQm5FIQDwiQE7m9Aik01-Rq8oLabJdhuXWEDemb75jKiv9botaCErWOV9xpH9yea5Ter3w4L0AqRTisIU4ELxroQ8aIDl3811LFC9dYxDlv9HTBZ8rmRK7BWbGYlWcXQEatYSj2Aw/s1600/player_scene_nodes.webp)

![Oyuncu Collision](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiR-QpJ5_HI-pFVnVoNbyMUr_4zVqeeFIF2S6lVJPXg4DSaFyYgUb9s0NYK3rspgUsSC1UMNaVeKDj_oKTBcpplyg9mNMn5qv8_fveZ3JAYtvN2u1DVRmodSq1Q-h8sNhVqww2Tj4vUE8kcKeTNugyl7Fp8DK5uBVnnIY1UoRQfGmrBo3cTtVPdz0N8Nw/s320/player_coll_shape.webp)

### 3- Input Map Ayarları ve Kodlama

Godot Project Settings -> Input Map menüsünden şu girdileri Yaratın ve Klavyeniz/Gamepadiniz için uygun okları, analogları atayın:

- `move_left`, `move_right`, `move_forward` (ileri, W), `move_back` (geri, S), `jump`.

Şimdi `Player`'a script’imizi ekleme vakti (Boş kalıp ‘Empty’ olarak açın).
2D de olan `_process(delta)`'yi unutun, fiziksel hareket varsa Frame bağımsız stabil çalışan `_physics_process(delta)` kullanılır.
Ayrıca bir objeyi döndürmek için Vector3’ün `.normalized()` ayarı ve objenin `basis`'i (temeli) kullanılır.

![İnput Atamaları](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC4DR53H4q84GbLszhyow_rWsFN47A0v1kQn8zybA_ZKtg5ssSrBiJVFVo0eBAsjassJ0x9-KvnN3mX8dzm0hzePB_M64p83gLVm91mJBApLwn4wtYStzV1ldf9vrQ5iaAehNXQ6Z0LWAKZ9JOj5UtyuqRGOkhtfU8PGr75BKl7Pf7Te6297gbcecz1g/s320/input-mapping-completed.webp)

![Gamepad İnput](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi54_qDIYSqZXktcSTLYfUqw0FCVNxO_ny5fge-9hwtn3lebte8HftNL1ByazRTESgX_dVxNbMX1qbMDtcM-GyAB9L_kc815a3iAcjl2AjJvmAm0CzvXWe5iewfKCk9uy_VwjPCDnWv2C5VJSg2XcF0SemZrnLnmrdviFDUDSr6bNbY3h-pgrjRS_dXvw/s320/joystick_axis_input.webp)

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
```

**Kod Açıklaması:**
- `extends CharacterBody3D`: Bu scriptin fizik kurallarıyla hareket eden (yerçekimine uyan, duvara takılan) bir karaktere ait olduğunu belirtir.
- `_physics_process(delta)`: 3D fizik hesaplamalarının yapıldığı yerdir. `_process` gibi PC hızına göre değil, motorun sabit fizik hızında (genelde saniyede 60 kez) çalışır.
- `direction.x / direction.z`: 3D dünyada ileri/geri Z eksenidir, sağ/sol X eksenidir. Yukarı/aşağı ise Y ekseniyle (zıplama, düşme) kontrol edilir.
- `$Pivot.basis`: 3D’de bir objenin baktığı yön, duruş açısı (rotasyonu) `basis` olarak geçer. Modeli taşıyan Pivot düğümümüzü…
- `Basis.looking_at(direction)`: …bulduğumuz yöne doğru (`direction`) doğrudan anında baktırır (çevirir).
- `if not is_on_floor():`: Karakterin altında yer/zemin yoksa (havadaysa)…
- `target_velocity.y - (fall_acceleration * delta)`: Mevcut Y hızından, her saniye yerçekimi ivmesini çıkarır ki giderek hızlanan gerçekçi bir düşüş olsun.
- `move_and_slide()`: CharacterBody3D’lerin en kritik fonksiyonudur. Hazırladığımız tüm yön, zıplama ve ivmeleri (`velocity`) alıp karakterin fizikli gerçek hareketini yapar, zeminde veya duvarda doğru kaymasını sağlar.

Bu kadar! Yerçekiminden dolayı düştük mü (`is_on_floor()` false ise Y eksenim ivme hızında aşağı inmeye başlar) diye havada tarttık. Cisimleri kaydırarak duvara yapışmak yerine sürtünmesi için `move_and_slide` dedik. O bizim yerimize hesapladı.

### 4- Kameranın Entegrasyonu

Main sahnemize gidiyor ve Player sahnemizi Zincir butonuyla odaya dahil ediyoruz. Fakat Play tuşuna basarsanız hiçbir şey göremezsiniz. Çünkü 3B dünyada size her zaman çekim yapacak aktif bir `Camera3D` düğümü lazımdır. Yaratın.
Omuz arkasından ve havadan izometrik (Retro rpg usulü) bir his vermek için Kamera sistemini şöyle kuruyoruz:

1. Yine Pivot yapıyoruz: Main düğümüne `Marker3D` ekleyip (adı `CameraPivot`) Kamerayı onun altına `Camera3D` koyuyoruz.
2. `Camera3D`'yi boşlukta Mavi okun üzerine getirip eksende geriye (`Z: 19`) çekiyoruz.
3. Tepeden bakması için `CameraPivot`'a gidip kırmızı okundan aşağı `X: -45` derece büküyoruz (Rotate ediyoruz).

Perspektif yerine o eski Mario, Sonic usülü izometrik görünüm için de Camera3D seçiliyken `Projection` değerini `Orthogonal` yapıp, görüş alanının (Size) `19` olarak ayarlanmasını sağlayın. Hepsi bu! Artık etrafta sekiz yöne koşturabilen tatlı yeşil bir topuz var. Gelecek bölümde üzerine basıp ezebileceğimiz pis düşmanları yerleştireceğiz, görüşmek üzere!
