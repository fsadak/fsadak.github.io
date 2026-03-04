---
title: "Godot Engine Eğitim Serisi - Bölüm 9: 3D Düşmanlar ve Çarpışma Mekanikleri"
date: 2026-03-09 12:00:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, enemies, collision, spawning]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj0PYkZzIGSep_TcG6Qi-5h7RhUet7OwgaXTkLwSi10IdTEExUX1e1B5tyG4Vd3tLgLEQf3407cB3miDIOsrHvzDGmBGm6O7NQMwNAUyBMk0O-Qo7-mKc7I6i1Nthyphenhyphenul_PoVS5NY8ESxcTBwVnhnNoguPujtYUnE56XNoRx6hLStJgRHlPLoIRhVVQPQA/s320/03.physics_layers.webp
  alt: Godot Fizik Katmanları
---

# Godot Engine Eğitim Serisi - Bölüm 9: 3D Düşmanlar ve Çarpışma Mekanikleri

Bu yazıda, Godot 3D projemize hareket ve tehlike katıyoruz. Düşman (Mob) sahnemizi tasarlayacak, onları rastgele oluşturacak (spawning) ve oyuncumuzun çarpışma sistemiyle etkileşime girip, üzerlerine zıplayarak (squash) onları ezmesini sağlayacağız.

### 1- Düşman Sahnesinin (Mob) Mimarisini Kurmak

Player sahnemize çok benzer adımlar izleyeceğiz. Yeni bir sahne (`mob.tscn`) oluşturup kök düğüm ismini `Mob` yapıyoruz (Türü: `CharacterBody3D`).

1. Kendi ekseninde dönebilmesi için `Node3D` den `Pivot` ekleyin.
2. `art/mob.glb` dosyasını `Pivot`'un içine sürükleyin (Adı `Character` olsun).
3. `Mob`'a geri dönüp bir `CollisionShape3D` verin ve kutu formu (`BoxShape3D`) atayarak havada canavarı kaplayacak boyuta getirin.

Düşmanlar oyuna kameranın dışından girdikten sonra, haritanın karşı açısından kamerayı terk edecekler. Eğer terk eden düşmanı silmezsek, RAM’de sonsuza dek kalırlar ve oyun çöker. Çözüm: `VisibleOnScreenNotifier3D` ekliyor ve pembe dikdörtgeni modelimizi kaplayacak boyuta getiriyoruz.

`mob.gd` yaratıyoruz:

```gdscript
extends CharacterBody3D

@export var min_speed = 10
@export var max_speed = 18

func _physics_process(_delta):
    move_and_slide()

# Doğuş noktası ve hedef belirten özel fonksiyon
func initialize(start_position, player_position):
    look_at_from_position(start_position, player_position, Vector3.UP)
    rotate_y(randf_range(-PI / 4, PI / 4)) # Düz gelmemesi için rotasyon sapması
    var random_speed = randi_range(min_speed, max_speed)
    velocity = Vector3.FORWARD * random_speed
    velocity = velocity.rotated(Vector3.UP, rotation.y)

# VisibleOnScreenNotifier3D sinyali ile ekrandan çıkınca yok et
func _on_visible_on_screen_notifier_3d_screen_exited():
    queue_free()
```

**Kod Açıklaması:**
- `extends CharacterBody3D`: Düşmanın (mob) fizik kurallarına (hız, ivme, kayma) duyarlı bir karakter olduğunu belirtir.
- `@export var min_speed / max_speed`: Düşmanların sabit hızda değil, Inspector panelinden belirlenebilen minimum ve maksimum değerler arasında rastgele bir hızla gelmesini sağlayan değişkenler.
- `_physics_process(_delta)`: Sadece `move_and_slide()` komutu çalıştırıyoruz; çünkü düşmanların hızı (velocity) doğdukları an verilecek ve o hızda dümdüz, duvara çarpana kadar veya ekran bitene kadar gidecekler.
- `look_at_from_position`: Düşmanı `start_position` (doğduğu yer) koordinatına koyar ve yüzünü tam olarak `player_position` (hedef/oyuncu) noktasına döndürür. Son parametre `Vector3.UP` sistemin hangi yönü “Yukarı” sayacağını bildirir.
- `randf_range / rotate_y`: Düşmanın dümdüz (ip gibi dizili) gelmemesi için Y ekseninde (sağa veya sola) rastgele -45 ile +45 derece aralığında sapma verir.
- `velocity = Vector3.FORWARD * random_speed`: Düşmanı, kendi baktığı yöne doğru (FORWARD) rastgele verilen hızla (random_speed) uçar gibi fırlatır.
- `queue_free()`: Ekranda görünmeyen canavarın (objenin) RAM’de (bellekte) yer tutmaması için oyun akışından ve sahneden tamamen silinmesi talimatıdır.

### 2- Main Sahnesinde Spawning (Düşman Üretimi) Sistemi

Main sahnemize gidiyor ve ekran boyutunu ayarlıyoruz (Project -> Project Settings -> Display -> Window’dan Width: 720, Height: 540).

Main düğümüne `Path3D` ekliyoruz (Adı: `SpawnPath`). Yukarıdaki “Add Point” aracı ile kameranın dış kenarlarından köşegen bir kare yol çizip “Close Curve” yapıyoruz. Yolun üzerine bir `PathFollow3D` düğümü ekliyoruz (Adı: `SpawnLocation`).

Ayrıca süreyi tutsun diye Main düğümüne bir `Timer` (`MobTimer`) ekliyor, 0.5 saniye verip Autostart özelliğini aktif ediyoruz.

Main sahnemize script (`main.gd`) oluşturuyoruz. Inspector’da çıkan `mob_scene` kısmına `mob.tscn` dosyasını sürüklemeyi unutmayın!

Sonra Timer’ın “timeout” sinyalini koda bağlıyoruz.

![Canavarların Yol Haritası](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPZ5m26ZEZ-6l28dBuwsej2hSr9eNkFTFDFVYA6cSUMXoCAUN0YmtY6YO7o-sZ0OekEQGWY-PDKfOfFmbnqVS8-509ah6EU-LqCWvoDd3W9cgTzs9npWTZmHeCo0eLXKlNuA16YPX4wAHAvHZTalx_Rqx6l1vqxpy4_zqEVe7QRbVn2kxizB7VJ_h3ng/s320/01.monsters_path_preview.png)

![Yolu Kapatma Butonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEinMVnKYmVeK5LKpfjqADu_IduBW8XYXKkva_gVOqSAlf-zo14KIYnIK3H6X0LSPPI6Bx1dHodGc6ZP4BXdMlW6Moa3vkZLkFfxxJV6oa872-WFIWj2V8ojz1lX127dCxk0KWVx74ev7z-clVqsQBdTXsnQbJ_vTboDJiX3zO1Bvu9BEscpTcuPr_wasg/s1600/18.close_path.webp)

![Çizim Sonucu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtEtMSMDFL7WMEkzAvW_OZmKgEDG7igTdr-euEhYxXeZnj7v51aS9lwM3bKukTXAo3MiwK7V3adsANpDEXMYsHl-O5bN_MEb1ShrpL__eaDk957ECD1GHhq66dd_mydXcIKXzQkYbGgwB2aDvCofJcEn-jXW10TBTneNXgkHYLA4zD2OhVTJ-Tg6no0A/s320/19.path_result.png)

```gdscript
extends Node

@export var mob_scene: PackedScene

func _on_mob_timer_timeout():
    var mob = mob_scene.instantiate()
    var mob_spawn_location = get_node("SpawnPath/SpawnLocation")
    mob_spawn_location.progress_ratio = randf() # Yolda rastgele bir yer seç
    var player_position = $Player.position
    mob.initialize(mob_spawn_location.position, player_position)
    add_child(mob)
```

**Kod Açıklaması:**
- `@export var mob_scene: PackedScene`: Dışarıdan (Inspector’dan) bir şablon dosyası (`mob.tscn`) sürükleyip vereceğimiz değişkendir. Oyun motoru bunu bir kalıp (Cookie Cutter) olarak görecek.
- `mob_scene.instantiate()`: Yukarıda verdiğimiz şablondan birebir aynı kopyada yeni bir klon nesne (`mob` değişkeni olarak) yaratır.
- `get_node("SpawnPath/SpawnLocation")`: Sahnemizin içinde çizdiğimiz çerçeve yolu (`Path3D`) bulur.
- `.progress_ratio = randf()`: Yolun rastgele bir noktasını (`0.0` ile `1.0` arası bir yüzde bularak) seçer ve başlangıç üssü (Spawn) ilan eder.
- `mob.initialize(...)`: Canavar şablonumuzun içine az önce yazdığımız hizalama ve yöneltme metodumuza, nerede doğduğunu ve nerede bize bakacağını parametre olarak atar.
- `add_child(mob)`: Her şeyi hazır olan o klonu, Main sahnesine görünür ve kalıcı bir şekilde (çocuk düğüm olarak) ekler.

### 3- Fizik Katmanları (Layers) ve Maskeler

Fizik çarpışmalarının birbirini yormaması (düşmanların takılmaması) için Project Settings -> Layer Names -> 3D Physics bölümünden isimler tanımlıyoruz.

- Layer 1: `player`
- Layer 2: `enemies`
- Layer 3: `world`

Inspector “Collision” bölümünden:
- **Zemin (Ground):** Sadece Layer 3 (world) işaretli. Mask kapalı.
- **Player:** Layer 1 (player). Mask 2 (enemies) ve 3 (world) seçili.
- **Mob:** Layer 2 (enemies). Mask kapalı. (Böylece düşmanlar yer ve birbiriyle ilgilenmez, havada dümdüz devam eder).

![Fizik Katmanları İsimlendirme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj0PYkZzIGSep_TcG6Qi-5h7RhUet7OwgaXTkLwSi10IdTEExUX1e1B5tyG4Vd3tLgLEQf3407cB3miDIOsrHvzDGmBGm6O7NQMwNAUyBMk0O-Qo7-mKc7I6i1Nthyphenhyphenul_PoVS5NY8ESxcTBwVnhnNoguPujtYUnE56XNoRx6hLStJgRHlPLoIRhVVQPQA/s320/03.physics_layers.webp)

![Zemin Layer ve Maske Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGA83_mPoCBHPvOjj-zonQUsttraY2tdgYhyuSBC3HTNSdZ1mBvFWky17PhiPu3mUK5tlyOdRBTTB_oniFthyyF7WXGxMvwHXW8ZWg4iw1xPxXcZuRatd6v3Oo6sCWiReBlfssQI5JIdZov9E1mn_lXF691PveWJsf0weohEHSBhgEGujfZFGqsJG3Yg/s1600/05.toggle_layer_and_mask.webp)

![Oyuncu Maske Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgi2TeFJbLqrUtTTBhBoBJufTVDL-rTotN5dW9j918-q5znWIAK7UOJ9pOVv0IbbeQ_BtVDwxQ6s0Y3K20GhVHXN8CPMLt-mO6iUr4elfbj1BLVTxiSTaAWBPFkCWJJGChP4U4iIa1dPDVJ3vbpWK2fMkZoLDNvybWUMJFh-5fE6BSLaJiTll6R2WdHGg/s1600/07.player_physics_mask.webp)

![Düşman Maske Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEig5cxResdhPeE3PMmVt4oF2d8h-5RsB78_YjY0afTEr5_crqh49-7_ZkDS0xfRJaTHt0wpbN1GAYZ4U9DZydFEma_ilasipP9JCH5-YApmPw2AjFhPQuvILndci9PaQHPhSrXT6SFcVSNy1XKuayMz9ASPOds0g71Qy83XvYbgFp1GORaytlnhDYH73w/s1600/08.mob_physics_mask.webp)

### 4- Jump (Zıplama) ve Squash (Ezme) İşlemi!

Zıplamak için çok kolay bir mantığımız var. `Player.gd` dosyamıza önce şunları ekliyoruz:

`@export var jump_impulse = 20` ve `@export var bounce_impulse = 16`

Player’da `_physics_process` içine zıplamayı ekliyoruz:

```gdscript
# Jumping.
if is_on_floor() and Input.is_action_just_pressed("jump"):
    target_velocity.y = jump_impulse
```

**Kod Açıklaması:**
- `is_on_floor()`: Karakterin o esnada havada süzülmediğini, iki ayağının zeminde (`StaticBody3D`) olduğunu teyit eder (böylece çift zıplamayı-havada uçmayı engelleriz).
- `Input.is_action_just_pressed("jump")`: Oyuncunun klavyeden fırlatmayı atadığımız `jump` (genellikle Space) tuşuna SADECE BİR KEZ (basılı tutmuyor, o an yarım saniye basıp çekiyor kuralını getiren `just_pressed`) bastığını onaylar.
- `target_velocity.y = jump_impulse`: Hedef hız vektörümüzün sırf Y (Yukarı/Aşağı) kısmına, zıplama gücümüzü (`jump_impulse`) yollar ve karakteri bir ivmeyle yukarı gönderir.

**Ezme Mekaniği:** Mob sahnemizi açıp `Mob` kök düğümünün Inspector yanında yer alan “Node -> Groups” ekranından `mob` grubuna dahil ediyoruz. Aynı koda, eklendiğinde silinmesi için `squash()` fonksiyonu yaratıyoruz:

```gdscript
# mob.gd içerisine eklenecekler

signal squashed

func squash():
    squashed.emit()
    queue_free()
```

**Kod Açıklaması:**
- `signal squashed`: Düşman ezildiğinde diğer sistemlere (Skor tahtası, ses çıkarıcı) ileteceği özel bir sinyal tanımlarız.
- `func squash()`: Oyuncu tepemize atladığında çağıracağı ezme (ölüm) metodudur.
- `squashed.emit()`: Sinyalimizi her tarafa yayar (“Ben Ezildim!” uyarısı).
- `queue_free()`: Sinyal gittikten hemen sonra canavarı (Mob) oyun sahnesinden derhal siler (öldürür).

**Player.gd** içinde yine `_physics_process` in en sonuna, `move_and_slide()` çalıştırıldıktan hemen sonra bu bloğu ekliyoruz:

```gdscript
for index in range(get_slide_collision_count()):
    var collision = get_slide_collision(index)

    if collision.get_collider() == null:
        continue

    # Çarptığımız obje 'mob' sınıfındaysa:
    if collision.get_collider().is_in_group("mob"):
        var mob = collision.get_collider()

        # Vector3.UP ile yukarıdan düşüp düşmediğimizi (dot) inceliyoruz.
        if Vector3.UP.dot(collision.get_normal()) > 0.1:
            mob.squash() # Yukarıdansa Eziyoruz
            target_velocity.y = bounce_impulse # Tekrar Hoplatıyoruz
            break # Aynısını iki kez saymaması için kırıyoruz
```

**Kod Açıklaması:**
- `get_slide_collision_count()`: Karakterin duvar, cisim veya yer gibi o an kaç adet nesneye sürtündüğünün (çarptığının) sayısını döndürür.
- `for index in range(...)`: O anki tüm sürtünmeleri (çarpışmaları) sırayla gezip (döngü) incelememizi sağlar.
- `.get_collider()`: Temas ettiğimiz cismi fizik motorundan bir veri/nesne olarak alır.
- `.is_in_group("mob")`: Temas ettiğimiz o nesne, oyun başında verdiğimiz grup (“mob”) ismine ait mi diye sorar. Böylece zemine çarpmalarımızı pas geçeriz.
- `Vector3.UP.dot(collision.get_normal()) > 0.1`: Çarpışma matematiğinde Dot Product (Nokta Çarpımı) kuralıdır. Çarptığımız açının normalini Yukarı (`Vector3.UP` yani Y=1) ile kıyaslarız. Eğer bu oran 0.1’den büyükse, açımız yukarıdandır. Yani canavarın alttan karnına vurmadık, tam tepesinden şapkasına bastık demek olur!
- `mob.squash()`: Temas ettiğimiz o eşsiz canavara “ezil” sinyalini yollarız (o da gidip kendi `queue_free`'sini çalıştırır ve ölür).
- `target_velocity.y = bounce_impulse`: Mario gibi ezdikten sonra hafifçe yukarı doğru sekmemiz (`bounce` / trampolin etkisi) için belirlediğimiz impuls ivmesini (Y ekseninde) bize ekler.
- `break`: Sürtündüğümüz şeyleri taramayı aniden keser (kırar); çünkü bir kere (başarı ile) ezdik, aynı yaratık parçasını bir daha eziyormuş gibi işlem görerek hatayı ve fazla hesaplamayı önleriz.

Muazzam! Oyunu Main sahnemizle başlattığımızda uzay boşluğundan bize süzülerek gelen kırmızı ve öfkeli küpleri, Space bar yardımı ile sekerek darmaduman edebiliyoruz!

Bir sonraki bölümde skorumuza ve Game Over mantığına geçeceğiz.
