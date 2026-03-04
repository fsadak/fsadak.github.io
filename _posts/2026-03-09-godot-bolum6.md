 

# <span style="background-color: white;">Godot Engine Eğitim Serisi - Bölüm 6: Düşmanları Yaratmak ve Ana Sahne</span>

<span style="background-color: white;">Oyunumuzu artık tam bir oyun
yapacak ana bileşenlere geldik: Düşmanlardan kaçmak! Önce düşmanları
yaratacak, ardından `Main` adı vereceğimiz bir sahnede düşmanlarımızı,
oyuncuyu ve genel kuralları birleştireceğiz.</span>

### <span style="background-color: white;">1. Düşman Sahnesi: RigidBody2D ve Özellikleri</span>

<span style="background-color: white;">Yeni bir sahne oluşturun. Kök
düğüm tipi olarak `RigidBody2D` (Katı Cisim) seçin ve adını `Mob` yapın.
Tıpkı Player sahnesindeki gibi çocukları ebeveynle gruplayın (kilit
ikonu).</span>

- <span style="background-color: white;">RigidBody2D yerçekiminden
  etkilenir ancak uzaydaki düşmanlarımız için bunu istemiyoruz. Gravity
  Scale değerini 0 yapın.</span>

- <span style="background-color: white;">Düşmanların birbirine
  çarpmasını istemediğimiz için Collision Mask içinden 1’inci katmanı
  kaldırın.</span>

<span style="background-color: white;">Sahneye eklenecek Alt
düğümler:</span>

- <span style="background-color: white;"><span style="box-sizing: border-box; font-weight: bolder;">AnimatedSprite2D:</span> Görselimiz.</span>

- <span style="background-color: white;"><span style="box-sizing: border-box; font-weight: bolder;">CollisionShape2D:</span> Vurulma
  alanımız.</span>

- <span style="background-color: white;"><span style="box-sizing: border-box; font-weight: bolder;">VisibleOnScreenNotifier2D:</span> Ekrandan
  çıkışları yakalamak için.</span>

### <span style="background-color: white;">2. Düşman Animasyonları ve Çarpışma</span>

<span style="background-color: white;">`AnimatedSprite2D` Sprite
Frames’ini yaratın, 3 adet animasyon oluşturun: `fly`, `swim`, `walk`.
(Her biri üç saniye hızında çalışsın, ‘Animation Speed’ = 3). Sprite’ı
çok az küçülterek Scale değerini `(0.75, 0.75)` yapın.</span>

<span style="background-color: white;">Sonrasında CollisionShape2D için
‘CapsuleShape2D’ seçin, ancak kapsül dikeydir, düşmanlarımız yatay
olduğu için Transform &gt; Rotation kısmından `90` derece çevirin ve
boyutu tam olarak düşmana oturtun. `mob.tscn` olarak kaydedin.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfOKbCqtGo4sTI2vd1Hh5LvVtZaDrTkNUJn0kEo18bNc4KOIwngiqTcmUk7uPy3rJWCxR7BOp2NEdxDb_cFZjwkSlNWp-_vn8l_9RnzxRjrhrvsZDdMlZWM6bO10ef27N5NBTQkRI6JtYHTgwxgb2U7j5iDTmTBJfomiO1r2M4kwT7QwFRzy9-3KNafg/s335/set_collision_mask.webp"
style="margin-left: 1em; margin-right: 1em;"><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfOKbCqtGo4sTI2vd1Hh5LvVtZaDrTkNUJn0kEo18bNc4KOIwngiqTcmUk7uPy3rJWCxR7BOp2NEdxDb_cFZjwkSlNWp-_vn8l_9RnzxRjrhrvsZDdMlZWM6bO10ef27N5NBTQkRI6JtYHTgwxgb2U7j5iDTmTBJfomiO1r2M4kwT7QwFRzy9-3KNafg/s320/set_collision_mask.webp"
data-border="0" data-original-height="335" data-original-width="296"
width="283" height="320" /></a>

  

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHTNmDVHSG6Gd0girHieJLusoA_iJJcXJ8Fjm5bO-q8Ml-uMMA-_NprWRgdrnnGf4By0KQ1M8-Hz5_Blxijgwwq0HVtCzeOyyuzEftp6LhGUPy9T6Z67Yj8-3AVQk_yIrEU2nIzbzz9sCkq26ZN9-dSjHQ71bRvhk8rChyphenhyphenx7rIU5OiXtYy7QvEx1b9Ww/s1107/mob_animations.webp"
style="margin-left: 1em; margin-right: 1em;"><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHTNmDVHSG6Gd0girHieJLusoA_iJJcXJ8Fjm5bO-q8Ml-uMMA-_NprWRgdrnnGf4By0KQ1M8-Hz5_Blxijgwwq0HVtCzeOyyuzEftp6LhGUPy9T6Z67Yj8-3AVQk_yIrEU2nIzbzz9sCkq26ZN9-dSjHQ71bRvhk8rChyphenhyphenx7rIU5OiXtYy7QvEx1b9Ww/s320/mob_animations.webp"
data-border="0" data-original-height="352" data-original-width="1107"
width="320" height="102" /></a>

  

  

### <span style="background-color: white;">3. Düşman Davranışı (Kod)</span>

<span style="background-color: white;">Düşmanımız rastgele üreyecek ve
rasgele bir animasyon tipiyle ekranda süzülecek. `mob.gd` isimli bir
script ekleyin.</span>

    extends RigidBody2D

    func _ready():
        var mob_types = Array($AnimatedSprite2D.sprite_frames.get_animation_names())
        $AnimatedSprite2D.animation = mob_types.pick_random() # Animasyonu rastgele seç
        $AnimatedSprite2D.play()

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `extends RigidBody2D`: Düşmanımızın fizikli bir cisim (`RigidBody2D`)
  özelliklerini taşıdığını gösterir.

- `$AnimatedSprite2D.sprite_frames.get_animation_names()`: Düşmanların
  içindeki “fly, swim, walk” isimli animasyon isimlerini doğrudan Godot
  sisteminden çeker.

- `var mob_types = Array(...)`: Çektiği o animasyon isimlerini
  (`["fly", "swim", "walk"]`) yazılımsal bir diziye (Array) dönüştürür.

- `.pick_random()`: Bu nesne her yaratıldığında (`_ready`), tanımlanan o
  3 animasyondan rastgele herhangi birini seçer ve atar. Böylece her
  düşman birbirinden farklı görünür.

- `play()`: Seçilen animasyonu oynatmaya başlar.

<span style="background-color: white;">Ekranda gereksiz yer kaplamaması
için, `VisibleOnScreenNotifier2D` düğümünün `screen_exited` (ekrandan
çıktı) sinyalini `mob.gd` belgesine bağlayın ve içine alttaki kodu
yazın:</span>

    func _on_visible_on_screen_notifier_2d_screen_exited():
        queue_free() # Düğümü güvenlice sahneden sil.

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `_on_..._screen_exited()`: Düğüm (Mob) kamera açısının dışına, yani
  telefonumuzun/bilgisayarımızın ekranın dışına çıktığında tetiklenen
  fonksiyondur.

- `queue_free()`: İlgili nesneyi (düşmanı) Godot’un silinme kuyruğuna
  (çöp tenekesine) gönderir ve ilk fırsatta RAM’den siler. Bu işlem
  olmazsa, kenarlara kaçan düşmanlar oyun arka planında milyonlara
  ulaşıp cihazın hafızasını dondururdu.

### <span style="background-color: white;">4. Ana Sahneyi Kurmak</span>

<span style="background-color: white;">Farklı sahnelerde oluşturduğunuz
objeleri tek bir ana kurguya oturtma zamanı. `Node` tipli yeni bir sahne
oluşturup adını `Main` yapın.</span>

- <span style="background-color: white;">`player.tscn` dosyasını zincir
  (“Instance Child Scene”) butonuyla sahnenize çağırın.</span>

- <span style="background-color: white;">3 adet `Timer` yaratın:
  Adları `MobTimer` (0.5), `ScoreTimer` (1), `StartTimer` (2 saniye
  bekleme süresi, “One Shot” aktif olacak)</span>

- <span style="background-color: white;">Oyuncunun başlayacağı noktayı
  belirlemek için 1 adet `Marker2D` ekleyin ve
  adını `StartPosition` (G:240, Y:450) yapın.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiHdu-LEW8VIljlue3509LJST5TQwJRVblHa5enQWZtsMijL9HcWjyjED1AHxvGC34znsTxmiMs3cV3wYt5pW3zA26JAqAS_Iep23MYI1LLSEadpW2yHcO7vRq_HK2M47KwCnoF9k4TubHd7APZj7YtwVTmq6QfaRaL80cTD_DAZfBeYCyZCB5UZMlXyA/s286/instance_scene.webp"
style="margin-left: 1em; margin-right: 1em;"><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiHdu-LEW8VIljlue3509LJST5TQwJRVblHa5enQWZtsMijL9HcWjyjED1AHxvGC34znsTxmiMs3cV3wYt5pW3zA26JAqAS_Iep23MYI1LLSEadpW2yHcO7vRq_HK2M47KwCnoF9k4TubHd7APZj7YtwVTmq6QfaRaL80cTD_DAZfBeYCyZCB5UZMlXyA/s1600/instance_scene.webp"
data-border="0" data-original-height="271" data-original-width="286"
width="286" height="271" /></a>

  

### <span style="background-color: white;">5. Spawn Sistemi İçin Path2D</span>

<span style="background-color: white;">Düşmanların ekranın neresinden
geleceğini belirlemek bazen çok kod gerektirir. Godot’nun mucizevi
düğümlerinden biri olan `Path2D` bu işi mükemmel yapar.</span>

<span style="background-color: white;">Main
düğümüne `Path2D` (`MobPath`) ekleyin ve ekranın hemen dış sınırlarını
köşe noktalardan seçerek kare çizin. Yolun “saat yönünde” olmasına
dikkat edin, böylece düşmanlar ekranın içine bakarak spamlanacaktır.
İçine  de `PathFollow2D` (`MobSpawnLocation`) düğümü atın.</span>

<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPupCBeOaVrquWYM0NMYxRwiquwByYaervAk_LVe2jB6DtL5eM0rqkWj49V6oMQvKJDdRDhnXLiEoMd-XINB2pUnaq65DsHbBIaT8ImDOswVVfm_9LbMxizm_JVAtAzPCVVU6k6EYH8NiqXXSaCEAqRV2TcplzgvXJtH1WBQyah5pQCEth6OFdHUH4dA/s879/path2d_buttons.webp"
style="margin-left: 1em; margin-right: 1em;"><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPupCBeOaVrquWYM0NMYxRwiquwByYaervAk_LVe2jB6DtL5eM0rqkWj49V6oMQvKJDdRDhnXLiEoMd-XINB2pUnaq65DsHbBIaT8ImDOswVVfm_9LbMxizm_JVAtAzPCVVU6k6EYH8NiqXXSaCEAqRV2TcplzgvXJtH1WBQyah5pQCEth6OFdHUH4dA/s320/path2d_buttons.webp"
data-border="0" data-original-height="73" data-original-width="879"
width="320" height="27" /></a>

  

*<a
href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPjIojZQtp7MBJM96YHC8sfq1vI2YgXY6LBpyIeR2HGRyFAxUHgQqmf0bXuSkkjZkqx10-qIjtO-oLs0wOZNQu0cqjPFAxD4omkP_4fICBujejPclcWHXfeNJr_rRLEIRkVLGK9_2BpoqbFoN5iWwmYDlXU2RfafGhxI6dOUnkusPY2suU9TUXvGr4ow/s630/draw_path2d.gif"
style="margin-left: 1em; margin-right: 1em;"><img
src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPjIojZQtp7MBJM96YHC8sfq1vI2YgXY6LBpyIeR2HGRyFAxUHgQqmf0bXuSkkjZkqx10-qIjtO-oLs0wOZNQu0cqjPFAxD4omkP_4fICBujejPclcWHXfeNJr_rRLEIRkVLGK9_2BpoqbFoN5iWwmYDlXU2RfafGhxI6dOUnkusPY2suU9TUXvGr4ow/s320/draw_path2d.gif"
data-border="0" data-original-height="630" data-original-width="406"
width="206" height="320" /></a>*

*  
  *

### <span style="background-color: white;">6. Ana Kod Dosyası</span>

<span style="background-color: white;">`Main` düğümüne `main.gd` scriptini
atın.</span>

<span style="background-color: white;">`@export var mob_scene: PackedScene` (Mob.tscn’yi
inspector’dan bu değişkene sürükleyip bırakmayı kesinlikle
unutmayın!)</span>

<span style="background-color: white;">Şimdi `Player`'ın “hit” sinyalini
ve üç Timer’ın “timeout” sinyallerini bu scripte bağlayın:</span>

    extends Node

    @export var mob_scene: PackedScene
    var score

    func game_over(): # Player "hit" olduğunda
        $ScoreTimer.stop()
        $MobTimer.stop()

    func new_game():
        score = 0
        $Player.start($StartPosition.position)
        $StartTimer.start()

    func _on_start_timer_timeout():
        $MobTimer.start()
        $ScoreTimer.start()

    func _on_score_timer_timeout():
        score += 1

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `@export var mob_scene: PackedScene`: Ana sahnemizde oluşturacağımız
  düşman nesnelerinin şablon dosyasını (Paketlenmiş Sahne `mob.tscn`)
  inspector panelinden sürüklemek için tanımlanan değişkendir. Oyun
  motoruna “Buraya bir Sahne Paketi atacağım” demektedir.

- `game_over()`: Oyuncu düşmana çarptığında (hit sinyali tetiklenince)
  çalışacak fonksiyondur. Skor artış döngüsünü (`ScoreTimer.stop()`) ve
  düşman yaratma döngüsünü (`MobTimer.stop()`) anında kapatır.

- `new_game()`: Oyunu başlattığımızda, Skoru 0’lar, Oyuncuyu tam
  belirlediğimiz merkeze geri taşır (`StartPosition.position`) ve 2
  saniyelik başlama bekleme süresini (`StartTimer`) tetikler.

- `_on_start_timer_timeout()`: O en başta beklenen 2 saniyelik hazırlık
  süresi bitince burası tetiklenir ve artık düşmanları (`MobTimer`) ile
  skoru saymaya (`ScoreTimer`) otomatik başlatır.

- `_on_score_timer_timeout()`: Skor sayacımız her saniye sıfırlandığında
  (`timeout` olduğunda) bu fonk. tetiklenir ve Skoru 1 artırır
  (`score += 1`).

<span style="background-color: white;">MobTimer için düşmanı
yarattığımız kritik kodumuz:</span>

    func _on_mob_timer_timeout():
        # 1. Yeni bir Mob (Düşman) Örneği Oluştur.
        var mob = mob_scene.instantiate()

        # 2. Yolda rastgele bir yer seç
        var mob_spawn_location = $MobPath/MobSpawnLocation
        mob_spawn_location.progress_ratio = randf()

        # 3. Yönü ayarla (dışarıya dik) ve biraz rastgelelik kat
        var direction = mob_spawn_location.rotation + PI / 2
        mob.position = mob_spawn_location.position
        direction += randf_range(-PI / 4, PI / 4)
        mob.rotation = direction

        # 4. Hızı belirle (vektörü açıyla döndür)
        var velocity = Vector2(randf_range(150.0, 250.0), 0.0)
        mob.linear_velocity = velocity.rotated(direction)

        # 5. Sahneye nesneyi çocuk olarak ekle
        add_child(mob)

<span style="background-color: white; box-sizing: border-box; font-weight: bolder;">Kod
Açıklaması:</span>

- `.instantiate()`: Yukarıda değişkende tuttuğumuz o Şablon Sahnede
  (mob\_scene) bir tane klon üretir (`mob` yapıcı değişkeni).

- `.progress_ratio = randf()`: Saat yönünde çizdiğimiz Path2D yolu 0.0
  (başlangıç) ile 1.0 (bitiş) arasında bir değer
  alır. `randf()` fonksiyonu 0 ile 1 arasında rastgele bir yer (örneğin
  0.35 yani yolun %35’i) seçer ve düşmanı oraya koyar.

- `direction = mob_spawn_location.rotation + PI / 2`: Çizilen yolun o
  anki çizgisi kime dikse (1/4 tur), nesneyi içeriye doğru tam 90
  derecelik açıya döndürür.

- `randf_range(-PI / 4, PI / 4)`: Hedeflenen yönden her zaman dümdüz
  çıkmasın diye açıyı hafif sağa veya sola -45 ile +45 aralıklarında
  kaydırarak sürpriz katar.

- `linear_velocity = velocity.rotated(direction)`: RigidBody2D
  objelerinin ilerleme hızı (`linear_velocity`) değerine rastgele 150
  ile 250 ağırlığında bir kuvvet, yukardaki açısında gönderilir.

- `add_child(mob)`: Klonlanmış nesneyi (`mob`) tamamen görünür kalıcı
  şekilde `Main` sahnesinin bir çocuğu olarak eklendiğini bildirir ve
  oyun akışına koyar.

<span style="background-color: white;">Eğer test etmek isterseniz
hemen `_ready` fonksiyonuna `new_game()` fonksiyonunu çağırıp ekleyin ve
F5’e basıp oyununuzun tadını çıkarın! Düşman yaratıp yok
edebiliyorsunuz! Sıradaki ve son menümüz artık Ana menü, skor ve arayüz
detayları olacak.</span>
