---
title: "Godot Engine Eğitim Serisi - Bölüm 5: BAŞLIK"
date: 2026-03-08 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript]
---  

# <span style="background-color: white;">Godot Engine Eğitim Serisi - Bölüm 5: 2D Oyuna Hazırlık ve Oyuncu Karakteri</span>

<span style="background-color: white;">Godot Engine eğitim serimizin ilk
gerçek oyun yapma aşamasına hoş geldiniz! Bu dersimizde basit bir
“Kaçınma” oyunu hazırlayacağız. İlk olarak projeyi kuracak ve
oyuncumuzun (Player) kontrollerini ve animasyonlarını
hazırlayacağız.</span>

### <span style="background-color: white;">1. Oyun Alanı: Ekran Boyutlandırma</span>

<span style="background-color: white;">Dikey ekranda oynanan bir oyun
yapımız olacak. Telefon ekranı gibi düşünebilirsiniz.</span>

<span style="background-color: white;">Godot
menüsünden <span style="box-sizing: border-box; font-weight: bolder;">Project
-&gt; Project Settings</span> diyerek ayarları
açın. <span style="box-sizing: border-box; font-weight: bolder;">Display
-&gt; Window</span> bölümünde “Viewport Width” (Genişlik)
değerini `480`, “Viewport Height” (Yükseklik)
değerini `720` yapın.</span>

<span style="background-color: white;">Oyunumuzun farklı ekranlarda
doğru oranda büyümesi
için <span style="box-sizing: border-box; font-weight: bolder;">Stretch</span> (Esnetme)
seçeneklerinde <span style="box-sizing: border-box; font-weight: bolder;">Mode</span> değerini `canvas_items`, <span style="box-sizing: border-box; font-weight: bolder;">Aspect</span> değerini
ise `keep` yapmayı unutmayın.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgN_42a4sI0XjzgivK2OoAQe3deTbK8S38kqZE4THFHabZlfC9xAliU0XfHizKNg2G9Ouirp6GJ8K5oC1fS3ZvfyWXkpmJFAAt3KmZUla_ksP_fixctQ9lrdtgbfZGCSWucfpwFzxkKPm-laIVnhp5QISdxLk7uteXkqVR7eoaCiDe7ot1KNSjjjeWHuQ/s782/setting-project-width-and-height.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgN_42a4sI0XjzgivK2OoAQe3deTbK8S38kqZE4THFHabZlfC9xAliU0XfHizKNg2G9Ouirp6GJ8K5oC1fS3ZvfyWXkpmJFAAt3KmZUla_ksP_fixctQ9lrdtgbfZGCSWucfpwFzxkKPm-laIVnhp5QISdxLk7uteXkqVR7eoaCiDe7ot1KNSjjjeWHuQ/s320/setting-project-width-and-height.webp"
data-border="0" data-original-height="575" data-original-width="782"
width="320" height="235" /></a>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgg1vv1RGmKv5EBt8eXTfwOIKbizmdpcu4dbZMS2QLW9vneesp2MhFA8CzzPsuoH7cM2uQMVpjDINPt9V62GEoWeWA_EA9I4qAyigBUbS9O1Oqp89k0PNlHE6B7tE1Tb3nOUEgAEUbPOqFHzzU4RzMOfLIFIgFHmYDLLT0LjeP5uprbWXXXs_OlRVWRMg/s782/setting-stretch-mode.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgg1vv1RGmKv5EBt8eXTfwOIKbizmdpcu4dbZMS2QLW9vneesp2MhFA8CzzPsuoH7cM2uQMVpjDINPt9V62GEoWeWA_EA9I4qAyigBUbS9O1Oqp89k0PNlHE6B7tE1Tb3nOUEgAEUbPOqFHzzU4RzMOfLIFIgFHmYDLLT0LjeP5uprbWXXXs_OlRVWRMg/s320/setting-stretch-mode.webp"
data-border="0" data-original-height="575" data-original-width="782"
width="320" height="235" /></a>

### <span style="background-color: white;">2. Oyuncu Sahnesi ve Temeller</span>

<span style="background-color: white;">Oyuncu karakterimiz için işleri
temiz tutmak adına yeni bir sahne oluşturacağız. Bu sahnemizin ana
düğümü
bir <span style="box-sizing: border-box; font-weight: bolder;">Area2D</span> olacak.
Çünkü düşmanlarla çarpışma tespiti üzerine çalışacağız.</span>

<span style="background-color: white;">Sol üstten “Other Node”
ile <span style="box-sizing: border-box; font-weight: bolder;">Area2D</span> ekleyin
ve adını `Player` olarak değiştirin.</span>

<span style="background-color: white;">Hemen ardından sağ kısımdaki
gruplama (Lock/Kilitleme) ikonuna basarak çocuk düğümlerle ana düğümü
birbirine kenetleyin. Böylece sahnede taşıma işlemi yaparken parçalar
birbirinden kopmaz.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeKlI5hQ3AUQOlRt2RkxrEOm18Fgw62cueM_qa7f3fyQ65lRW84pcAz3BBoZsIAXSwrS-cAUK4DsktqnUYC5wB0JwVNQ1WmRkmq-nBGIr09vCAnkdzdDcQNdtaXPIxyk4P3XktKzGxxDt8nB7wiSXdVRugFtaQ01SAq50mk-S7XHas4Id4fvcsDtmMEg/s608/lock_children.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeKlI5hQ3AUQOlRt2RkxrEOm18Fgw62cueM_qa7f3fyQ65lRW84pcAz3BBoZsIAXSwrS-cAUK4DsktqnUYC5wB0JwVNQ1WmRkmq-nBGIr09vCAnkdzdDcQNdtaXPIxyk4P3XktKzGxxDt8nB7wiSXdVRugFtaQ01SAq50mk-S7XHas4Id4fvcsDtmMEg/s320/lock_children.webp"
data-border="0" data-original-height="73" data-original-width="608"
width="320" height="38" /></a>

<span style="background-color: white;">Sahnemizi `player.tscn` adıyla
kaydedin.</span>

### <span style="background-color: white;">3. Görseller ve Animasyon (AnimatedSprite2D)</span>

<span style="background-color: white;">Oyuncumuzun hareketli görünmesini
istiyoruz. Player düğümüne
bir <span style="box-sizing: border-box; font-weight: bolder;">AnimatedSprite2D</span> ekleyin.
Sağda açılan Inspector panelinde “Sprite Frames” karşısında “\[empty\]”
tıkla ve <span style="box-sizing: border-box; font-weight: bolder;">New
SpriteFrames</span> diyerek yeni bir paket yaratın.</span>

<span style="background-color: white;">Alt kısımda açılan sahnede,
“default” olan animasyonun adını `walk` (yürüme) yapın. Yeni bir tane
daha ekleyip ona da `up` (yukarı) diyin. Daha önce projenize
attığınız `art` (görsel) dosyalarından ilgili kareleri sürükleyerek bu
animasyon pencerelerine ekleyin. Görüntü ekranda çok büyük
gözükeceğinden AnimatedSprite2D’nin Scale
ayarını `x: 0.5, y:0.5` yaparak küçültebilirsiniz.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpOBHHM_ytWLKqEBv6BEbDcozFI1Gg7fbMeeEVHAVtaANxdW9gVXLJMFQvKj8Wnj8oPwqzvMgzhL7i-Duiu2eIWfjmr2nvVmjWU11WsybZYpTVOF5mgiLf4QcKDVUD4MNBsDXuVeX1n_VE1znllDKPUiNDcT_m5csZCi3uCUhHxaD5UPFKiri4XbB7LA/s1107/spriteframes_panel2.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhpOBHHM_ytWLKqEBv6BEbDcozFI1Gg7fbMeeEVHAVtaANxdW9gVXLJMFQvKj8Wnj8oPwqzvMgzhL7i-Duiu2eIWfjmr2nvVmjWU11WsybZYpTVOF5mgiLf4QcKDVUD4MNBsDXuVeX1n_VE1znllDKPUiNDcT_m5csZCi3uCUhHxaD5UPFKiri4XbB7LA/s320/spriteframes_panel2.webp"
data-border="0" data-original-height="352" data-original-width="1107"
width="320" height="102" /></a>

*(Görsel Referansı: `spriteframes_panel2.webp` - Animasyon iskeletine
kareleri yerleştirme)*

### <span style="background-color: white;">4. Hitbox (Çarpışma Alanı) Belirleme</span>

<span style="background-color: white;">Area2D’ler çarpışma sınırlarını
bilmek için bir şekle ihtiyaç duyarlar. Player düğümüne çocuk olarak
bir <span style="box-sizing: border-box; font-weight: bolder;">CollisionShape2D</span> ekleyin.
Shape alanından “New CapsuleShape2D” seçin ve ekrandaki turuncu
kontrolcüleri sürükleyerek karakter formuna oturtun.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-CL2MJMGwZ292lfZwMEq4HZrULwE5HANfK225sxgLdrZeZ6_cnn4N7CRcKb8ZtmLRjyVqAJ2wb5w9Rh2GvrTF6d2IDo9Lda2guEaWcrNGEW_-Yn0FAcCcc5gUu_Mjpdh4447Ok01m0_HwQJq3zROtdQTq4M3wj6Deifze7Qhyphenhyphena7qJznrhPvOueDhwTA/s403/player_coll_shape1.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><span>    </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-CL2MJMGwZ292lfZwMEq4HZrULwE5HANfK225sxgLdrZeZ6_cnn4N7CRcKb8ZtmLRjyVqAJ2wb5w9Rh2GvrTF6d2IDo9Lda2guEaWcrNGEW_-Yn0FAcCcc5gUu_Mjpdh4447Ok01m0_HwQJq3zROtdQTq4M3wj6Deifze7Qhyphenhyphena7qJznrhPvOueDhwTA/s320/player_coll_shape1.webp"
data-border="0" data-original-height="403" data-original-width="324"
width="257" height="320" /></a>

  

### <span style="background-color: white;">5. Input Map ile Kontrolleri Tanımlamak</span>

<span style="background-color: white;">Kodlamaya geçmeden oyuncu
kontrollerini (ok tuşları) tanıtalım.</span>

<span style="background-color: white;">Tekrar <span style="box-sizing: border-box; font-weight: bolder;">Project
Settings -&gt; Input Map</span> sekmesine gelin. Yukarıdaki “Add New
Action”
çubuğuna `move_right`, `move_left`, `move_up` ve `move_down` isimlerini
yazıp listeleyin. Yanlarındaki + butonuna basıp klavyenizdeki ilgili yön
tuşlarını tanımlayın.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXzA4QmfsMhzP0F6UWPkZC4Yp8aERV5zNoNz11peGPFKgS6y-Bcvtjiv89cGZPKZ-UF6qHH1fGF0b0Xznfa10UJ_15Wrlv9IxotfmjXHS-FpAaUMnPiQT8zYWJwnDLQ6TPf_cXk0urFonK-kLjnwR0AqeLAcPKFAmXeF4uRUXMADAAnMTl7h1Pco07GQ/s782/input-mapping-completed.webp"
data-imageanchor="1"
style="margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXzA4QmfsMhzP0F6UWPkZC4Yp8aERV5zNoNz11peGPFKgS6y-Bcvtjiv89cGZPKZ-UF6qHH1fGF0b0Xznfa10UJ_15Wrlv9IxotfmjXHS-FpAaUMnPiQT8zYWJwnDLQ6TPf_cXk0urFonK-kLjnwR0AqeLAcPKFAmXeF4uRUXMADAAnMTl7h1Pco07GQ/s320/input-mapping-completed.webp"
data-border="0" data-original-height="437" data-original-width="782"
width="320" height="179" /></a>

  

### <span style="background-color: white;">6. Oyuncuyu Kodlamak (Karakter Hareketi)</span>

<span style="background-color: white;">Şimdi işin eğlenceli kod kısmına
geçelim! `Player` düğümüne Script ekleyin.</span>

    extends Area2D

    @export var speed = 400 # Saniyede px cinsinden hız.
        var screen_size # Ekran boyutunu tutacağımız değişken.

    func _ready():
        screen_size = get_viewport_rect().size
        hide() # Oyun başlarken karakterimiz gizli başlayacak.

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `extends Area2D`: Bu scriptin bir Area2D düğümü (ve özelliklerini)
  temel aldığını belirtir.

- `@export var speed = 400`: `speed` (hız) adında bir değişken tanımlar.
  Başına koyulan `@export` takısı sayesinde bu değişkeni doğrudan
  Godot’un sağ tarafındaki Inspector panelinde görebilir ve kodu açmadan
  değiştirebilirsiniz.

- `var screen_size`: Ekranımızın o anki genişliğini ve yüksekliğini
  kaydetmek için oluşturulan boş değişken.

- `screen_size = get_viewport_rect().size`: Oyun ilk başladığında
  (`_ready` içinde) oyun penceresinin (viewport) büyüklüğünü alır ve
  yukarıdaki değişkene kaydeder.

- `hide()`: Karakteri görünmez yapar. Çünkü oyun tam olarak başladığında
  onu ortaya çıkaracağız.

<span style="background-color: white;">*Not:* `@export` anahtar
kelimesi, değişkenin özelliklerini editörde (Inspector) de gösterip
oradan değiştirilebilmesini sağlar!</span>

<span style="background-color: white;">Şimdi hareket
döngümüzü `_process(delta)` içerisine inşa ediyoruz:</span>

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
            velocity = velocity.normalized() * speed # Çaprazda ekstra hızlanmayı engeller (normalize)

        $AnimatedSprite2D.play() # Hız varsa animasyon çalışsın

        else:
            $AnimatedSprite2D.stop()

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `var velocity = Vector2.ZERO`: Her saniye hareket yönünü sıfırdan
  (`(0, 0)`) hesaplamak için boş bir vektör oluştururuz.

- `if Input.is_action_pressed("move_right"):`:
  Belirlediğimiz `move_right` (Sağ tuş) eylemine basılıp basılmadığını
  kontrol eder.

- `velocity.x += 1` vb.: İlgili tuşa basılmışsa hareket vektörünün X
  (Yatay) veya Y (Dikey) eksenini o yönde 1 birim artırır veya azaltır.

- `if velocity.length() > 0:`: Eğer vektörün uzunluğu 0’dan büyükse
  (yani oyuncu herhangi bir tuşa basıyorsa)…

- `.normalized() * speed`: Çapraz giderken (hem X’te hem Y’de 1 birim
  giderseniz, hızınız çapraz ölçümde 1’den büyük çıkar) ekstra
  hızlanmayı engellemek için vektör uzunluğunu tekrar 1’e eşitler ve
  belirlediğimiz hız ile çarpar.

- `$AnimatedSprite2D.play() / stop()`:
  Altımızdaki `AnimatedSprite2D` düğümünü isminden bulmak
  için `$` işareti kullanırız. Karakter hareket ediyorsa animasyonu
  oynatır (`play()`), duruyorsa durdurur (`stop()`).

<span style="background-color: white;">Karakter konumunu güncelleyelim
ve sınırları (`clamp`) belirleyelim ki ekrandan çıkamasın:</span>

    position += velocity * delta
    position = position.clamp(Vector2.ZERO, screen_size)

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `position += velocity * delta`: Oyuncunun mevcut konumuna,
  hesapladığımız hız vektörüyle geçen sürenin çarpımını ekleyerek
  karakteri hareket ettirir.

- `.clamp(Vector2.ZERO, screen_size)`: Oyuncunun pozisyonunu sadece
  belirli iki değer arasında (Min: `(0, 0)`, Max: `screen_size`) tutmaya
  zorlar. Yani karakter ekran dışına çıkamaz.

<span style="background-color: white;">Animasyon yönünü ayarlamak içinse
hızımıza göre sprite resmimizin yönünü çeviriyoruz (flip):</span>

    if velocity.x != 0:
        $AnimatedSprite2D.animation = "walk"
        $AnimatedSprite2D.flip_v = false
        $AnimatedSprite2D.flip_h = velocity.x < 0
    elif velocity.y != 0:
        $AnimatedSprite2D.animation = "up"
        $AnimatedSprite2D.flip_v = velocity.y > 0

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `if velocity.x != 0:`: Eğer yatay eksende bir hareket varsa (sağa veya
  sola) “walk” animasyonunu seç.

- `flip_v = false`: Dikeyde takla atmasını durdur (emin olmak için).

- `flip_h = velocity.x < 0`: Gidilen yön eksi değerdeyse (yani SOLA
  gidiyorsa), sprite görselini yatayda ters çevir (takla attır).

- `elif velocity.y != 0:`: Eğer dikey eksende bir hareket varsa “up”
  animasyonuna geç. Yönü aşağı ise dikeyde ters çevir.

### <span style="background-color: white;">7. Düşmanlara Çarpma (Sinyaller)</span>

<span style="background-color: white;">Düşmanımız henüz hazır değil ama
onlara çarptığımızda çalışacak altyapıyı “Sinyaller” ile kuralım.</span>

<span style="background-color: white;">Scriptin en
üstüne, `extends Area2D` satırının altına şu kodu yazın:</span>

<span style="background-color: white;">`signal hit` (Kendi özel
sinyalimiz)</span>

<span style="background-color: white;">Player düğümü seçiliyken sağ
üstteki “Node” kısmından `body_entered` sinyaline çift tıklayın. Kod
otomatik olarak bağlanıp metod oluşturacaktır. Metodun içini aşağıdaki
gibi doldurun:</span>

    func _on_body_entered(_body):
        hide() # Çarpınca kendimizi gizliyoruz
        hit.emit() # Oluşturduğumuz özel sinyali diğer node'lar duysun diye fırlatıyoruz

        # Sinyalin birden fazla kez tetiklenmemesi için deferred olarak collision'ı kapatıyoruz:
        $CollisionShape2D.set_deferred("disabled", true)

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `hide()`: Çarpışma olduğunda oyuncuyu görünmez yapar.

- `hit.emit()`: Üstte tanımladığımız kendi “hit” sinyalimizi ateşler ve
  tüm oyuna “ben vuruldum” mesajı gönderir.

- `.set_deferred("disabled", true)`: Fizik işlemleri arka arkaya
  hesaplanırken aniden çarpışma kutumuzu `disabled = true` yapmak motoru
  çökertebilir. Bu yüzden `set_deferred` kullanarak güvenli olan ilk
  anda kapat diyoruz. Bu sayede vurulduktan sonra düşman üstümüze gelse
  de bir daha sinyal tetiklenmez.

*<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEip8CKJupVd0ITl39GsMwG7jh8JIrMtyxmnJxczCVcS7fDPuN_Pzl5lqHiulOFnYWRCg9pjQM3VEJKDBMjQPq53vRH7_CtuiyRttTXmPb_HoIQywN1daV6U5YECNxgL2_armJqoL3PCGjLfplzSvIt4w5_GGynx90oxIyK5PpkmLW7CcLlSKorwrPsBlA/s417/player_signal_connection.webp"
data-imageanchor="1"
style="font-style: normal; margin-left: 1em; margin-right: 1em; text-align: center;"><span>  
 </span><span>    </span><span>    </span><span>    </span><span>  
 </span><span>    </span><span>    </span><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEip8CKJupVd0ITl39GsMwG7jh8JIrMtyxmnJxczCVcS7fDPuN_Pzl5lqHiulOFnYWRCg9pjQM3VEJKDBMjQPq53vRH7_CtuiyRttTXmPb_HoIQywN1daV6U5YECNxgL2_armJqoL3PCGjLfplzSvIt4w5_GGynx90oxIyK5PpkmLW7CcLlSKorwrPsBlA/s320/player_signal_connection.webp"
data-border="0" data-original-height="78" data-original-width="417"
width="320" height="60" /></a>*

<span style="background-color: white;">Son olarak oyun her yeni baştan
başladığında çağıracağımız start fonksiyonunu ekliyoruz:</span>

    func start(pos):
        position = pos
        show()
        $CollisionShape2D.disabled = false

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `func start(pos):`: Bu bize ait, kendi yarattığımız bir başlangıç
  fonksiyonu. Oyunu her resetlediğimizde veya
  başlattığımızda `Player.start()` diyerek içindeki konumu (pos)
  yollayacağız.

- `show()`: Karakteri tekrar görünür hale getirir (Ölünce gizlenmişti).

- `disabled = false`: Çarpışma kutumuzu tekrar aktif eder, düşmanlar
  bize yeniden çarpabilir duruma gelir.

<span style="background-color: white;">Tebrikler! Oyuncu karakteriniz
hareket etmeye ve çarpışmalara hazır. Sıradaki bölümde bu karakterin
arkasından koşturacağımız düşmanlarımızı (Mob) ekleyeceğiz!</span>
