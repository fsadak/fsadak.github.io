---
title: "Godot Engine Eğitim Serisi - Bölüm 5: 2D Oyuna Hazırlık ve Oyuncu Karakteri"
date: 2026-03-08 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, oyuncu, animasyon, input]
---

Godot Engine eğitim serimizin ilk gerçek oyun yapma aşamasına hoş geldiniz! Bu dersimizde basit bir "Kaçınma" oyunu hazırlayacağız. İlk olarak projeyi kuracak ve oyuncumuzun (Player) kontrollerini ve animasyonlarını hazırlayacağız.

## 1. Oyun Alanı: Ekran Boyutlandırma

Dikey ekranda oynanan bir oyun yapımız olacak. Telefon ekranı gibi düşünebilirsiniz.

Godot menüsünden **Project -> Project Settings** diyerek ayarları açın. **Display -> Window** bölümünde "Viewport Width" (Genişlik) değerini `480`, "Viewport Height" (Yükseklik) değerini `720` yapın.

Oyunumuzun farklı ekranlarda doğru oranda büyümesi için **Stretch** (Esnetme) seçeneklerinde **Mode** değerini `canvas_items`, **Aspect** değerini ise `keep` yapmayı unutmayın.

![Ekran Boyutu Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgN_42a4sI0XjzgivK2OoAQe3deTbK8S38kqZE4THFHabZlfC9xAliU0XfHizKNg2G9Ouirp6GJ8K5oC1fS3ZvfyWXkpmJFAAt3KmZUla_ksP_fixctQ9lrdtgbfZGCSWucfpwFzxkKPm-laIVnhp5QISdxLk7uteXkqVR7eoaCiDe7ot1KNSjjjeWHuQ/s782/setting-project-width-and-height.webp)

![Stretch Modu Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgg1vv1RGmKv5EBt8eXTfwOIKbizmdpcu4dbZMS2QLW9vneesp2MhFA8CzzPsuoH7cM2uQMVpjDINPt9V62GEoWeWA_EA9I4qAyigBUbS9O1Oqp89k0PNlHE6B7tE1Tb3nOUEgAEUbPOqFHzzU4RzMOfLIFIgFHmYDLLT0LjeP5uprbWXXXs_OlRVWRMg/s782/setting-stretch-mode.webp)

## 2. Oyuncu Sahnesi ve Temeller

Oyuncu karakterimiz için işleri temiz tutmak adına yeni bir sahne oluşturacağız. Bu sahnemizin ana düğümü bir **Area2D** olacak. Çünkü düşmanlarla çarpışma tespiti üzerine çalışacağız.

Sol üstten "Other Node" ile **Area2D** ekleyin ve adını `Player` olarak değiştirin.

Hemen ardından sağ kısımdaki gruplama (Lock/Kilitleme) ikonuna basarak çocuk düğümlerle ana düğümü birbirine kenetleyin. Böylece sahnede taşıma işlemi yaparken parçalar birbirinden kopmaz.

![Kilitleme İkonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeKlI5hQ3AUQOlRt2RkxrEOm18Fgw62cueM_qa7f3fyQ65lRW84pcAz3BBoZsIAXSwrS-cAUK4DsktqnUYC5wB0JwVNQ1WmRkmq-nBGIr09vCAnkdzdDcQNdtaXPIxyk4P3XktKzGxxDt8nB7wiSXdVRugFtaQ01SAq50mk-S7XHas4Id4fvcsDtmMEg/s608/lock_children.webp)

Sahnemizi `player.tscn` adıyla kaydedin.

## 3. Görseller ve Animasyon (AnimatedSprite2D)

Oyuncumuzun hareketli görünmesini istiyoruz. Player düğümüne bir **AnimatedSprite2D** ekleyin. Sağda açılan Inspector panelinde "Sprite Frames" karşısında "[empty]" tıkla ve **New SpriteFrames** diyerek yeni bir paket yaratın.

Alt kısımda açılan sahnede, "default" olan animasyonun adını `walk` (yürüme) yapın. Yeni bir tane daha ekleyip ona da `up` (yukarı) diyin. Daha önce projenize attığınız `art` (görsel) dosyalarından ilgili kareleri sürükleyerek bu animasyon pencerelerine ekleyin. Görüntü ekranda çok büyük gözükeceğinden AnimatedSprite2D'nin Scale ayarını `x: 0.5, y: 0.5` yaparak küçültebilirsiniz.

![SpriteFrames Paneli](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpOBHHM_ytWLKqEBv6BEbDcozFI1Gg7fbMeeEVHAVtaANxdW9gVXLJMFQvKj8Wnj8oPwqzvMgzhL7i-Duiu2eIWfjmr2nvVmjWU11WsybZYpTVOF5mgiLf4QcKDVUD4MNBsDXuVeX1n_VE1znllDKPUiNDcT_m5csZCi3uCUhHxaD5UPFKiri4XbB7LA/s1107/spriteframes_panel2.webp)

## 4. Hitbox (Çarpışma Alanı) Belirleme

Area2D'ler çarpışma sınırlarını bilmek için bir şekle ihtiyaç duyarlar. Player düğümüne çocuk olarak bir **CollisionShape2D** ekleyin. Shape alanından "New CapsuleShape2D" seçin ve ekrandaki turuncu kontrolcüleri sürükleyerek karakter formuna oturtun.

![Çarpışma Şekli](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-CL2MJMGwZ292lfZwMEq4HZrULwE5HANfK225sxgLdrZeZ6_cnn4N7CRcKb8ZtmLRjyVqAJ2wb5w9Rh2GvrTF6d2IDo9Lda2guEaWcrNGEW_-Yn0FAcCcc5gUu_Mjpdh4447Ok01m0_HwQJq3zROtdQTq4M3wj6Deifze7Qhyphenhyphena7qJznrhPvOueDhwTA/s403/player_coll_shape1.webp)

## 5. Input Map ile Kontrolleri Tanımlamak

Kodlamaya geçmeden oyuncu kontrollerini (ok tuşları) tanıtalım.

Tekrar **Project Settings -> Input Map** sekmesine gelin. Yukarıdaki "Add New Action" çubuğuna `move_right`, `move_left`, `move_up` ve `move_down` isimlerini yazıp listeleyin. Yanlarındaki + butonuna basıp klavyenizdeki ilgili yön tuşlarını tanımlayın.

![Input Map Tamamlandı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXzA4QmfsMhzP0F6UWPkZC4Yp8aERV5zNoNz11peGPFKgS6y-Bcvtjiv89cGZPKZ-UF6qHH1fGF0b0Xznfa10UJ_15Wrlv9IxotfmjXHS-FpAaUMnPiQT8zYWJwnDLQ6TPf_cXk0urFonK-kLjnwR0AqeLAcPKFAmXeF4uRUXMADAAnMTl7h1Pco07GQ/s782/input-mapping-completed.webp)

## 6. Oyuncuyu Kodlamak (Karakter Hareketi)

Şimdi işin eğlenceli kod kısmına geçelim! `Player` düğümüne Script ekleyin.

```gdscript
extends Area2D

@export var speed = 400 # Saniyede px cinsinden hız.
var screen_size # Ekran boyutunu tutacağımız değişken.

func _ready():
    screen_size = get_viewport_rect().size
    hide() # Oyun başlarken karakterimiz gizli başlayacak.
```

**Kod Açıklaması:**

- `extends Area2D`: Bu scriptin bir Area2D düğümü (ve özelliklerini) temel aldığını belirtir.
- `@export var speed = 400`: `speed` (hız) adında bir değişken tanımlar. Başına koyulan `@export` takısı sayesinde bu değişkeni doğrudan Inspector panelinde görebilir ve kodu açmadan değiştirebilirsiniz.
- `var screen_size`: Ekranımızın o anki genişliğini ve yüksekliğini kaydetmek için oluşturulan boş değişken.
- `screen_size = get_viewport_rect().size`: Oyun ilk başladığında oyun penceresinin büyüklüğünü alır ve değişkene kaydeder.
- `hide()`: Karakteri görünmez yapar. Çünkü oyun tam olarak başladığında onu ortaya çıkaracağız.

Şimdi hareket döngümüzü `_process(delta)` içerisine inşa ediyoruz:

```gdscript
func _process(delta):
    var velocity = Vector2.ZERO # Hareket vektörü sıfırlı başlar.
    if Input.is_action_pressed("move_right"):
        velocity.x += 1
    if Input.is_action_pressed("move_left"):
        velocity.x -= 1
    if Input.is_action_pressed("move_down"):
        velocity.y += 1
    if Input.is_action_pressed("move_up"):
        velocity.y -= 1

    if velocity.length() > 0:
        velocity = velocity.normalized() * speed
        $AnimatedSprite2D.play()
    else:
        $AnimatedSprite2D.stop()
```

**Kod Açıklaması:**

- `var velocity = Vector2.ZERO`: Her saniye hareket yönünü sıfırdan `(0, 0)` hesaplamak için boş bir vektör oluştururuz.
- `if Input.is_action_pressed("move_right"):`: Belirlediğimiz `move_right` (Sağ tuş) eylemine basılıp basılmadığını kontrol eder.
- `velocity.x += 1` vb.: İlgili tuşa basılmışsa hareket vektörünün X (Yatay) veya Y (Dikey) eksenini o yönde 1 birim artırır veya azaltır.
- `if velocity.length() > 0:`: Eğer vektörün uzunluğu 0'dan büyükse (yani oyuncu herhangi bir tuşa basıyorsa)…
- `.normalized() * speed`: Çapraz giderken ekstra hızlanmayı engellemek için vektör uzunluğunu 1'e eşitler ve hız ile çarpar.
- `$AnimatedSprite2D.play() / stop()`: `$` işareti ile alt düğümü ismiyle bulur. Karakter hareket ediyorsa animasyonu oynatır, duruyorsa durdurur.

Karakter konumunu güncelleyelim ve sınırları (`clamp`) belirleyelim ki ekrandan çıkamasın:

```gdscript
    position += velocity * delta
    position = position.clamp(Vector2.ZERO, screen_size)
```

**Kod Açıklaması:**

- `position += velocity * delta`: Oyuncunun mevcut konumuna hesaplanan hız vektörüyle geçen sürenin çarpımını ekleyerek karakteri hareket ettirir.
- `.clamp(Vector2.ZERO, screen_size)`: Oyuncunun pozisyonunu sadece `(0,0)` ile `screen_size` arasında tutar. Yani karakter ekran dışına çıkamaz.

Animasyon yönünü ayarlamak için hızımıza göre sprite resmimizin yönünü çeviriyoruz (flip):

```gdscript
    if velocity.x != 0:
        $AnimatedSprite2D.animation = "walk"
        $AnimatedSprite2D.flip_v = false
        $AnimatedSprite2D.flip_h = velocity.x < 0
    elif velocity.y != 0:
        $AnimatedSprite2D.animation = "up"
        $AnimatedSprite2D.flip_v = velocity.y > 0
```

**Kod Açıklaması:**

- `if velocity.x != 0:`: Eğer yatay eksende bir hareket varsa "walk" animasyonunu seç.
- `flip_v = false`: Dikeyde takla atmasını durdur.
- `flip_h = velocity.x < 0`: Sola gidiyorsa sprite görselini yatayda ters çevir.
- `elif velocity.y != 0:`: Eğer dikey eksende bir hareket varsa "up" animasyonuna geç. Yönü aşağı ise dikeyde ters çevir.

## 7. Düşmanlara Çarpma (Sinyaller)

Düşmanımız henüz hazır değil ama onlara çarptığımızda çalışacak altyapıyı "Sinyaller" ile kuralım.

Scriptin en üstüne, `extends Area2D` satırının altına şu kodu yazın:

```gdscript
signal hit
```

Player düğümü seçiliyken sağ üstteki "Node" kısmından `body_entered` sinyaline çift tıklayın. Kod otomatik olarak bağlanıp metod oluşturacaktır. Metodun içini aşağıdaki gibi doldurun:

```gdscript
func _on_body_entered(_body):
    hide() # Çarpınca kendimizi gizliyoruz
    hit.emit() # Özel sinyalimizi fırlatıyoruz

    # Sinyalin birden fazla kez tetiklenmemesi için deferred olarak collision'ı kapatıyoruz:
    $CollisionShape2D.set_deferred("disabled", true)
```

**Kod Açıklaması:**

- `hide()`: Çarpışma olduğunda oyuncuyu görünmez yapar.
- `hit.emit()`: Üstte tanımladığımız "hit" sinyalimizi ateşler ve tüm oyuna "ben vuruldum" mesajı gönderir.
- `.set_deferred("disabled", true)`: Fizik işlemleri hesaplanırken çarpışma kutusunu aniden kapatmak motoru çökertebilir. `set_deferred` ile güvenli olan ilk anda kapat diyoruz.

![Sinyal Bağlantısı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEip8CKJupVd0ITl39GsMwG7jh8JIrMtyxmnJxczCVcS7fDPuN_Pzl5lqHiulOFnYWRCg9pjQM3VEJKDBMjQPq53vRH7_CtuiyRttTXmPb_HoIQywN1daV6U5YECNxgL2_armJqoL3PCGjLfplzSvIt4w5_GGynx90oxIyK5PpkmLW7CcLlSKorwrPsBlA/s417/player_signal_connection.webp)

Son olarak oyun her yeni baştan başladığında çağıracağımız start fonksiyonunu ekliyoruz:

```gdscript
func start(pos):
    position = pos
    show()
    $CollisionShape2D.disabled = false
```

**Kod Açıklaması:**

- `func start(pos):`: Kendi yarattığımız başlangıç fonksiyonu. Oyunu her resetlediğimizde `Player.start()` diyerek konumu (pos) yollayacağız.
- `show()`: Karakteri tekrar görünür hale getirir.
- `disabled = false`: Çarpışma kutumuzu tekrar aktif eder, düşmanlar bize yeniden çarpabilir duruma gelir.

Tebrikler! Oyuncu karakteriniz hareket etmeye ve çarpışmalara hazır. Sıradaki bölümde bu karakterin arkasından koşturacağımız düşmanlarımızı (Mob) ekleyeceğiz!
