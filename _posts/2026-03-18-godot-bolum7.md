---
title: "Godot Engine Eğitim Serisi - Bölüm 7: Düşman Yapay Zekası ve Spawner (Oluşturucu) Mekanizması"
date: 2026-03-18 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, dodge-the-creeps, mob, spawner, yapay-zeka]
permalink: /godot-egitim-serisi-bolum-7/
published: true
---

Oyuncu karakterimizi başarıyla tamamladık. Şimdi, karakterimizin kaçması gereken düşmanları (mob) oluşturma ve bu düşmanları ekran kenarlarından oyun alanına sürecek (spawn edecek) mekanizmayı kurma zamanı! Düşmanların davranışı basit ancak etkili olacak: Ekranın kenarlarında rastgele konumlarda belirecek, rastgele bir yön seçecek ve düz bir çizgide ilerleyecekler.

---

## Düşman (Mob) Sahnesini İnşa Etmek

Düşmanları tıpkı oyuncu gibi ayrı bir sahne olarak tasarlayacağız, böylece oyunda istediğimiz kadar bağımsız düşman üretebileceğiz.

1. **Scene > New Scene** ile yeni bir sahne oluşturun ve kök node olarak `RigidBody2D` ekleyip adını `Mob` olarak değiştirin.

2. Bu node'un altına bir `AnimatedSprite2D`, bir `CollisionShape2D` ve bir `VisibleOnScreenNotifier2D` çocuk node'ları ekleyin.
3. Düşmanların aşağı doğru düşmesini engellemek için, `Mob` node'unu seçin ve Inspector (Denetçi) panelindeki **Gravity Scale** değerini `0` olarak ayarlayın.
4. Düşmanların birbirlerini itip yollarından çıkarmalarını engellemek için, yine Inspector panelindeki **Collision** grubunu genişletip **Mask** özelliğindeki 1 numaralı katmanın işaretini kaldırın.


### Animasyonlar ve Çarpışma Şekli

1. `AnimatedSprite2D` node'u için `fly`, `swim` ve `walk` adında 3 farklı animasyon oluşturun ve her birinin **Animation Speed** değerini `3` olarak ayarlayın. Görseller oyun alanına göre büyük olacağı için, Inspector'dan **Scale** değerini `(0.75, 0.75)` yaparak mob boyutunu küçültün.

2. Son olarak, `CollisionShape2D` node'una bir `CapsuleShape2D` ekleyin ve şekli görselle hizalamak için Inspector'dan **Rotation** (Döndürme) değerini 90 derece olarak ayarlayın.
3. Sahnenizi `mob.tscn` olarak kaydetmeyi unutmayın.

---

## Düşman Yapay Zekasını Kodlamak

Düşmanlarımıza biraz çeşitlilik katalım. `Mob` node'una bir script ekleyin ve `_ready()` fonksiyonunu aşağıdaki gibi düzenleyerek her düşmanın ekrana farklı bir animasyonla gelmesini sağlayın:

```gdscript
func _ready():
	var mob_types = $AnimatedSprite2D.sprite_frames.get_animation_names()
	$AnimatedSprite2D.animation = mob_types[randi() % mob_types.size()]
	$AnimatedSprite2D.play()
```

**Kodun Satır Satır Açıklaması:**
*   `func _ready():`: Düşman sahneye ilk eklendiğinde (spamlandığında) sadece bir kere otomatik çalışan açılış animasyonumuzdur. 
*   `var mob_types = $AnimatedSprite2D.sprite_frames.get_animation_names()`: Animasyon oynatıcı düğümümüzün (`$AnimatedSprite2D`) içine giriyoruz, onun sahip olduğu görsel kareler listesine (`sprite_frames`) bakıyoruz ve buradaki tüm animasyonların isimlerini (`get_animation_names()`) getirip `mob_types` (düşman tipleri) adlı bir değişkene liste halinde kaydediyoruz. Hatırlarsan az önce 'fly', 'swim' ve 'walk' isimlerinde üç animasyon oluşturmuştuk. Burası ["fly", "swim", "walk"] şeklinde bir liste veriyor.
*   `$AnimatedSprite2D.animation = mob_types[randi() % mob_types.size()]`: Bu karmaşık görünen satır aslında basit bir kura çekimidir.
    *   `randi()`: Bize rastgele devasa bir tam sayı üretir (örneğin 1234567).
    *   `mob_types.size()`: Listemizin uzunluğunu verir (örneğin 3 animasyonumuz olduğu için cevap 3).
    *   `%`: Matematikte "modülüs" işlemidir. Bir sayının diğerine bölümünden kalanı verir. Bir sayıyı 3'e bölersek kalan ya 0, ya 1 ya da 2 olabilir. Yani `randi() % 3` her zaman rastgele 0, 1 veya 2 sayılarından birini verir.
    *   `mob_types[...]`: Listeden bu sayılara karşılık gelen elemanı seçeriz (0.'cı 'fly', 1.'ci 'swim', 2.'ci 'walk'). Seçilen bu rastgele ismi, düşmanın oynatılacak `.animation` özelliği olarak ayarlarız. Böylece her eklenen düşman farklı bir kılığa sahip olur.
*   `$AnimatedSprite2D.play()`: Ve son olarak seçilen bu animasyon tipini çalıştırarak oynatmaya başlarız.


> 💡 **Bellek Yönetimi (Çöp Toplama):** Düşmanlar ekranın dışına çıktığında onları silmemiz gerekir, aksi takdirde bellekte biriken düzinelerce görünmez düşman oyununuzu yavaşlatır. Bunun için `VisibleOnScreenNotifier2D` node'unun `screen_exited` sinyalini `Mob` scriptinize bağlayın ve oluşan fonksiyonun içine `queue_free()` komutunu yazın. Bu kod, ekrandan çıkan düşmanı karenin sonunda bellekten güvenlice silecektir.

---

## Ana Oyun Sahnesi ve Spawner (Oluşturucu)

Düşman sahnesi hazır olduğuna göre, onları oyuna dahil edecek `Main` (Ana) sahneyi kurabiliriz.

1. Yeni bir sahne oluşturun, kök node olarak `Node` ekleyin ve adını `Main` yapın. (Bu node oyun mantığını yönetecek bir konteyner olduğu için `Node2D` yerine basit bir `Node` kullanıyoruz).
2. Scene panelindeki zincir (Instance) simgesine tıklayarak `player.tscn` sahnenizi bu ana sahneye ekleyin.
3. Oyunun akışını kontrol etmek için `Main` node'unun altına 3 adet `Timer` (`MobTimer`, `ScoreTimer`, `StartTimer`) ve oyuncunun başlangıç konumu için bir `Marker2D` (`StartPosition`) ekleyin.
4. `MobTimer`'ın bekleme süresini (Wait Time) `0.5`, `ScoreTimer`'ı `1` ve `StartTimer`'ı `2` saniye (One Shot aktif) olarak ayarlayın.

### Düşman Spawn Yolunu Çizmek

Düşmanların ekranın rastgele kenarlarından çıkmasını sağlamak için bir yol çizmemiz gerekiyor.

1. `Main` node'una bir `Path2D` çocuğu ekleyin ve adını `MobPath` yapın.
2. Üstteki **Add Point** ikonunu seçerek ve **Grid Snap** özelliğini açarak ekranın sınırlarını saat yönünde çevreleyen 4 noktalı bir dikdörtgen yol çizin. İşlemi bitirmek için **Close Curve** butonuna tıklayın.

3. Çizdiğiniz bu yolun üzerinde rastgele bir konum seçebilmek için `MobPath` node'unun altına bir `PathFollow2D` çocuğu ekleyin ve adını `MobSpawnLocation` olarak belirleyin.

---

## Spawner Kodunu Yazmak ve Oyunu Birleştirmek

Şimdi `Main` node'una bir script ekleyin. En üste şu değişkenleri tanımlayın:

```gdscript
extends Node

@export var mob_scene: PackedScene
var score
```

**Kodun Satır Satır Açıklaması:**
*   `extends Node`: Bu kod dosyasının, oyunun tüm yönetimini elinde tutan `Main` adındaki kök Node'a bağlı olduğunu belirtiyoruz.
*   `@export var mob_scene: PackedScene`: Dışarıdan (`@export`) müdahaleye açık `mob_scene` (düşman sahnesi) adında bir değişken tanımlıyoruz. Yanına eklediğimiz `: PackedScene` uyarısı, bunun sıradan bir sayı veya yazı değil, paketlenmiş eksiksiz bir Godot Sahnesi (`.tscn` dosyası) olması gerektiğini belirtiyor. Editörde bu kutuya az önce kaydettiğimiz `mob.tscn` dosyasını sürükleyip bırakacağız.
*   `var score`: Oyuncunun puanını tutacağımız değişkenimiz.


> 💡 **Bilgilendirme:** `@export` değişkeni sayesinde `mob.tscn` dosyanızı sürükleyip doğrudan Inspector panelindeki **Mob Scene** alanına bırakabilirsiniz.

### Rastgele Düşman Üretimi (Spawn)

`MobTimer` node'unun `timeout` sinyalini `Main` scriptine bağlayın ve oluşan fonksiyonu şu şekilde doldurun:


```gdscript
func _on_mob_timer_timeout():
	# Yeni bir mob instance'ı oluşturun.
	var mob = mob_scene.instantiate()

	# PathFollow2D üzerinde rastgele bir nokta seçin (0.0 ile 1.0 arası).
	var mob_spawn_location = get_node("MobPath/MobSpawnLocation")
	mob_spawn_location.progress_ratio = randf()

	# Düşmanın yönünü yola dik (içe bakacak) şekilde ayarlayın.
	var direction = mob_spawn_location.rotation + PI / 2

	# Düşmanın konumunu seçilen rastgele konuma eşitleyin.
	mob.position = mob_spawn_location.position

	# Yönüne biraz rastgelelik (±45 derece) katın.
	direction += randf_range(-PI / 4, PI / 4)
	mob.rotation = direction

	# Düşmana rastgele bir hız (150 ile 250 arası) verin.
	var velocity = Vector2(randf_range(150.0, 250.0), 0.0)
	mob.linear_velocity = velocity.rotated(direction)

	# Mob'u Ana sahneye ekleyin.
	add_child(mob)
```

**Kodun Satır Satır Açıklaması:**
*   `func _on_mob_timer_timeout():`: Oyunumuzdaki `MobTimer`'ın süresi (örneğin yarım saniye) dolduğunda çağrılan, düşman üretme fonksiyonumuzdur.
*   `var mob = mob_scene.instantiate()`: Editörden sürükleyip verdiğimiz düşman şablonunu (`mob_scene`) kalıp olarak kullanıp yeni, canlı bir kopya (instance) üretiriz (`.instantiate()`) ve o an `mob` olarak adlandırırız. Düşman var, ama henüz ekranın neresinden gireceği veya hızı belli değil.
*   `var mob_spawn_location = get_node("MobPath/MobSpawnLocation")`: Ekrana çizdiğimiz yolu ve üzerinde ilerleyen çocuğu bul.
*   `mob_spawn_location.progress_ratio = randf()`: Bu yolun üzerinde rastgele bir ilerleme sağla. `progress_ratio` yolun neresinde olduğunu gösterir, 0 başı 1 sonudur. `randf()` fonksiyonu bize 0 ile 1 arasında rastgele küsüratlı bir sayı verir (örnek: 0.73). Piyonu yolun üzerinde rastgele bir kaydırma işlemidir. Kenar başlangıç konumu belirlendi.
*   `var direction = mob_spawn_location.rotation + PI / 2`: Yolda hareket eden aracın şu anki baktığı açıyı alır (`.rotation`), üzerine matematiksel olarak çeyrek tur yani 90 derece (`PI / 2`) ekler. Böylece yola paralel bakan yönü kırıp, tam oyun ekranının tam ortasına (içeri) bakması sağlanır.
*   `mob.position = mob_spawn_location.position`: Ürettiğimiz düşmanın (`mob`) pozisyonunu, yolu üzerinde rastgele duran piyonun tam o anki merkez pozisyonuna taşırız ki ekranda oradan çıksın.
*   `direction += randf_range(-PI / 4, PI / 4)`: Yönümüz ekrana dümdüz (90 derece) bakıyordu. Buna `randf_range` (rastgele aralık) diyerek ufak bir sapma ekleriz. -45 derece (`-PI / 4`) ile +45 derece (`PI / 4`) arasında bir sapma ile, sadece dümdüz aşağı değil, hafif çarpraz da gitmesi sağlanır. Eğlence katar.
*   `mob.rotation = direction`: Kesinleşmiş bu rastgele sapmalı yeni yönümüzü, düşmanın asıl bakış açısına (`.rotation`) uyguluyoruz.
*   `var velocity = Vector2(randf_range(150.0, 250.0), 0.0)`: Karakterin x eksenindeki itme hızını rastgele minimum 150 ile maksimum 250 arasında bir yer olarak belirliyoruz. (`Vector2` içine sırasıyla x ve y hızı alır).
*   `mob.linear_velocity = velocity.rotated(direction)`: Bu sadece ileri (x ekseni) olan itme gücünü, az önce karar verdiğimiz asıl şaşırtmalı yöne doğru çeviriyoruz (`.rotated()`) ve düşmanın fiziksel lineer hızına (`linear_velocity`) atıyoruz. Araba artık hareket ediyor.
*   `add_child(mob)`: Hızı, yönü ve rastgele konumu hesaplanan bu düşmanı asıl ana sahnemize (`Main`) bir çocuk olarak ekleyerek canlandırıyoruz ve görünür kılıyoruz.


Bu kod sayesinde her yarım saniyede bir, ekranın kenarından rastgele bir noktada, rastgele bir hızla ve oyuncunun bulunduğu alana doğru hareket eden bir düşman yaratılacaktır.

### Çarpışma ve Oyun Sonu (Game Over)

Son olarak oyuncu ile düşmanların etkileşimini bağlamalıyız. `Player` instance'ını seçin ve sağdaki sinyaller bölümünden, önceki bölümde oluşturduğumuz `hit` sinyalini bulun. Bunu `Main` scriptindeki yeni bir `game_over` fonksiyonuna bağlayın.

Bu fonksiyonun içinde skor timer'ını ve mob timer'ını durdurarak oyun döngüsünü sonlandırabilirsiniz:

```gdscript
func game_over():
	$ScoreTimer.stop()
	$MobTimer.stop()
```

**Kodun Satır Satır Açıklaması:**
*   `func game_over():`: Kendi hazırladığımız, oyun bitirme fonksiyonudur. Oyuncunun (Player) `.hit` sinyali buraya bağlıdır, yani oyuncu bir düşmana çarptığı an bu fonksiyon tetiklenir.
*   `$ScoreTimer.stop()`: Oyuna eklediğimiz skor sayacının timer (zamanlayıcı) düğümünü bularak tamamen durdurmasını söyleriz (`.stop()`). Böylece skor artışı biter.
*   `$MobTimer.stop()`: Yukarıdaki `_on_mob_timer_timeout` fonksiyonunu çağıran düşman doğurma (spawn) zamanlayıcısını bularak işlevden çıkarır, yani yeni düşman gelmesini tamamen durdururuz. Oyun sona erer.


---

## Bölüm Özeti

Harika bir iş çıkardınız! Bu uzun ve teknik bölümde;
* `RigidBody2D` kullanarak yerçekiminden etkilenmeyen ve kendi kendini söküp atabilen akıllı bir düşman sahnesi tasarladınız.
* `Path2D` ve `PathFollow2D` ile oyun ekranını çevreleyen dinamik bir oluşturucu (spawner) hattı çektiniz.
* Matematiksel fonksiyonlar (`randf`, `PI`, vektör rotasyonları) kullanarak düşmanların rastgele hız ve açılarda oyun alanına girmesini sağladınız.
* Oyuncunun `hit` sinyalini alarak oyunu durdurma mantığını kurdunuz.

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='u1GNQzgZOTI' %}

---

## Sıradaki Adım

Oyununuz artık oynanabilir ve sizi zorlayabilir durumda! Bir sonraki bölümde bu heyecanı taçlandıracak olan **Kullanıcı Arayüzü (HUD), ve Sesler** ekleme aşamasına geçeceğiz. Görüşmek üzere!