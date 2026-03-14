---
title: "Godot Engine Eğitim Serisi - Bölüm 6: 2D Oyun Projesine Hazırlık ve Oyuncu Karakteri"
date: 2026-03-17 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, dodge-the-creeps, player]
permalink: /godot-egitim-serisi-bolum-6/
published: true
---

Önceki bölümlerde Godot'nun temel yapı taşlarını öğrendiniz. Artık tüm bu bilgileri bir araya getirip "Dodge the Creeps!" adlı tam teşekküllü bir 2D oyun geliştirme zamanı! Bu oyunun temel mantığı oldukça basittir: Karakterinizi kontrol ederek rastgele yönlerden gelen düşmanlardan kaçmalı ve ekranda olabildiğince uzun süre hayatta kalarak skorunuzu artırmalısınız.

Bu ilk büyük adımımızda proje ayarlarını yapacak, oyuncu sahnesini inşa edecek ve hareket mekaniklerini kodlayacağız.

---

## Proje Kurulumu ve Ekran Ayarları

Öncelikle yeni bir Godot projesi oluşturun ve daha önce indirdiğiniz oyun varlıkları arşivindeki `art/` ve `fonts/` klasörlerini proje dizininizin (`res://`) içine sürükleyip bırakın.

Oyunumuz dikey (portrait) modda oynanacak şekilde tasarlandığı için ekran boyutunu buna göre ayarlamanız gerekiyor:

1. Menüden **Project > Project Settings** yolunu izleyin ve sol sütundan **Display > Window** sekmesini açın.

2. **Viewport Width** (Genişlik) değerini `480`, **Viewport Height** (Yükseklik) değerini ise `720` olarak ayarlayın.
3. Aynı sayfada aşağı inerek **Stretch** (Ölçekleme) ayarlarını bulun. **Mode** ayarını `canvas_items`, **Aspect** ayarını ise `keep` yapın.

> 💡 **Bilgilendirme:** Bu stretch (ölçekleme) ayarları sayesinde oyun pencereniz farklı monitörlerde veya mobil cihazlarda yeniden boyutlandırıldığında oyun alanınızın orantısı bozulmadan tutarlı bir şekilde büyüyüp küçülecektir.

---

## Oyuncu Sahnesini (Player) İnşa Etmek

Oyununuzun en önemli parçasını, yani oyuncu karakterini ayrı bir sahne olarak oluşturacağız. Böylece oyunun diğer parçaları hazır olmasa bile oyuncuyu bağımsız olarak test edebilirsiniz.

1. **Scene > New Scene** ile yeni bir sahne oluşturun ve kök node olarak `Area2D` ekleyin. Node'un adını `Player` olarak değiştirin. Neden `Area2D`? Çünkü bu node, diğer nesnelerle (düşmanlarla) olan çarpışmaları ve üst üste gelmeleri algılamak için özel olarak tasarlanmıştır.

2. `Player` node'una bir `AnimatedSprite2D` çocuk node'u ekleyin. Bu node görseli ve animasyonları yönetecektir.
3. Inspector panelinden **Animation > Sprite Frames** alanına tıklayıp **New SpriteFrames** seçeneğini işaretleyin. Açılan panelde `walk` ve `up` adında iki farklı animasyon oluşturun.
4. `art/` klasöründeki görsellerden `playerGrey_walk1` ve `playerGrey_walk2` dosyalarını `walk` animasyonuna, `playerGrey_up1` ve `playerGrey_up2` dosyalarını ise `up` animasyonuna sürükleyin.
5. Görseller oyun alanımız için biraz büyük kalacağından, Inspector'da `Node2D` altındaki **Scale** değerini `(0.5, 0.5)` yaparak karakteri yarı yarıya küçültün.

### Çarpışma Şeklini Eklemek

`Area2D` node'u, fiziksel sınırlarını bilmek için bir çarpışma şekline ihtiyaç duyar.

1. `Player` node'una bir `CollisionShape2D` node'u ekleyin.
2. Inspector'dan **Shape** özelliğini `CapsuleShape2D` olarak seçin.

3. Kapsülü, ekrandaki sprite'ı (karakter görselini) tam olarak saracak şekilde boyutlandırın.
4. Sahneyi `player.tscn` olarak kaydedin.

---

## Girdi (Input) Haritasını Ayarlamak

Karakteri klavye ile kontrol edebilmek için Godot'nun Input Map sistemini kullanacağız.

1. **Project > Project Settings > Input Map** menüsünü açın.

2. Üstteki çubuğa sırasıyla `move_right`, `move_left`, `move_up` ve `move_down` yazıp **Add** butonuna tıklayarak yeni eylemler oluşturun.
3. Her bir eylemin yanındaki **"+"** ikonuna tıklayarak klavyenizdeki ok tuşlarını (veya dilerseniz W, A, S, D tuşlarını) bu eylemlere atayın.

---

## Oyuncuyu Kodlamak: Hareket ve Animasyon

Sahne ve tuşlar hazır, şimdi onlara hayat verelim! `Player` node'una sağ tıklayıp bir Script ekleyin.

### Değişkenler ve Hazırlık

Scriptinizin en üst kısmına karakterin hızını ve ekran boyutunu tutacak değişkenleri tanımlayın:

```gdscript
extends Area2D

@export var speed = 400
var screen_size
```

**Kodun Satır Satır Açıklaması:**
*   `extends Area2D`: Bu kod dosyasının sahnemizin kökü olan `Area2D` node'u için yazıldığını belirtir. Fiziksel örtüşmeleri (çarpışmaları) yakalayacağımız asıl yapı taşı budur.
*   `@export var speed = 400`: `speed` (hız) adında bir değişken tanımlar ve saniyede 400 piksel gitmesi için değerini `400` yapar. Başındaki `@export` anahtar kelimesi, bu değişkeni Godot editörünün sağ tarafındaki "Inspector" paneline taşır. Böylece oyunu test ederken kodu açmadan hızı kolayca değiştirip deneyebilirsiniz.
*   `var screen_size`: Ekranın çözünürlük bilgisini hafızada tutmak için oluşturduğumuz başıboş bir değişkendir. Oyun motoru çalışınca ekran boyutunu öğrenip bu kutunun içine koyacağız.


Oyun başladığında ekran sınırlarını öğrenmek için `_ready()` fonksiyonunu kullanalım:

```gdscript
func _ready():
	screen_size = get_viewport_rect().size
```

**Kodun Satır Satır Açıklaması:**
*   `func _ready():`: Script (yani oyuncu karakterimiz) oyuna ilk eklendiğinde Godot tarafından bir kere çağrılan açılış/hazırlık fonksiyonumuzdur.
*   `screen_size = get_viewport_rect().size`: `get_viewport_rect()` kodu, oyunun oynandığı asıl pencerenin (viewport) dikdörtgen boyutlarını getirir. `.size` diyerek bunun sadece x (genişlik) ve y (yükseklik) değerlerini alırız ve bunu yukarıda boş olarak oluşturduğumuz `screen_size` adlı değişkenin içine kaydederiz. Artık oyun ekranının ne kadar büyük olduğunu biliyoruz.


### Hareket Döngüsü

Şimdi her karede çalışacak olan `_process(delta)` fonksiyonunu yazarak karakteri hareket ettireceğiz.

```gdscript
func _process(delta):
	var velocity = Vector2.ZERO # Varsayılan olarak oyuncu hareketsizdir
	
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

	position += velocity * delta
	position = position.clamp(Vector2.ZERO, screen_size)
```

**Kodun Satır Satır Açıklaması:**
*   `func _process(delta):`: Oyun boyunca sürekli çalışan ana döngü fonksiyonumuz. Hareket gibi sürekli tekrarlanması gereken eylemler burada yapılır.
*   `var velocity = Vector2.ZERO # Varsayılan olarak oyuncu hareketsizdir`: Karakterimizin baktığı yönü ve miktarını belirten hız (velocity) değişkenini başta sıfırlıyoruz. Hiçbir tuşa basılmıyorsa karakter durur.
*   `if Input.is_action_pressed("move_right"):` ve sonrası: Eğer kullanıcı "move_right" (bizim atadığımız sağ ok tuşu) tuşuna basılı tutuyorsa `velocity`'nin x (yatay) eksenini `1` artır (sağa git); "move_left" (sol ok) tuşuna basıyorsa x eksenini `1` azalt (sola git) diyoruz. Aynı mantıkla aşağı "move_down" basılınca y (dikey) eksenini `1` artırır, yukarı "move_up" basılınca y eksenini `1` azaltır.
*   `if velocity.length() > 0:`: "Eğer hız vektörünün uzunluğu sıfırdan büyükse" yani oyuncu herhangi bir tuşa basıp harekete geçtiyse bu bloğa girer.
*   `velocity = velocity.normalized() * speed`: `normalized()` çarpraz (hem üst hem sağ) gidildiğinde oyuncunun düz gitmesine göre 1.4 kat daha hızlı gitmesi hatasını düzeltir. Yönü bozmadan uzunluğu 1'e eşitler. Ardından bunu kalıcı hızımız olan `speed` (400) ile çarparız.
*   `$AnimatedSprite2D.play()`: Karakter hareket ettiğine göre, ona eklediğimiz `AnimatedSprite2D` animasyon oynatıcısını çalıştır (`play()`) diyoruz ki yürüme taklidi yapsın.
*   `else:`: Yukarıdaki "eğer karakter hızlandıysa" durumunun tersidir. "Hayır, hiç hızı yoksa / duruyorsa" bu bloğa girer.
*   `$AnimatedSprite2D.stop()`: Karakter durduğu için oynayan animasyonu durdurur.
*   `position += velocity * delta`: Oyuncunun şu anki bulunduğu konuma (`position`), ulaştığımız nihai hızı (`velocity`) geçen zamanla (`delta`) çarparak ekleriz.
*   `position = position.clamp(Vector2.ZERO, screen_size)`: Bu son derece kritik bir satırdır. Karakterin `position`'ını alır ve onu iki değer arasına hapseder (`clamp`). İlk değer `Vector2.ZERO` yani x:0, y:0 olan ekranın en sol-üst köşesi. İkinci değer en başta belirlediğimiz `screen_size` değişkeni, yani ekranın en sağ-alt köşesi. Böylece oyuncu sınırlar dışına çıkamaz.


**Bu kodda ne yaptık?**
* Tüm basılan tuşlara göre `velocity` (hız) vektörünü hesapladık.
* Çapraz giderken (örneğin aynı anda sağa ve yukarı) karakterin %41 daha hızlı gitmesini önlemek için `velocity.normalized()` kullanarak vektörü 1 birime sabitledik ve hızımızla çarptık.
* `position += velocity * delta` satırıyla saniyedeki kare hızından (FPS) bağımsız bir hareket sağladık.
* En önemlisi, `clamp()` fonksiyonunu kullanarak karakterin pozisyonunun ekran sınırları dışına çıkmasını engelledik.

### Animasyonları Yöne Göre Değiştirmek

Karakterimiz hareket ediyor ancak animasyonları hep aynı yöne bakıyor. `_process()` fonksiyonunun en sonuna şu kod bloğunu ekleyin:

```gdscript
	if velocity.x != 0:
		$AnimatedSprite2D.animation = "walk"
		$AnimatedSprite2D.flip_v = false
		$AnimatedSprite2D.flip_h = velocity.x < 0
	elif velocity.y != 0:
		$AnimatedSprite2D.animation = "up"
		$AnimatedSprite2D.flip_v = velocity.y > 0
```

**Kodun Satır Satır Açıklaması:**
*   `if velocity.x != 0:`: Eğer x (yatay) ekseninde bir hız varsa `(!= 0)` sıfıra eşit değilse, yani oyuncu sağa ya da sola gidiyorsa.
*   `$AnimatedSprite2D.animation = "walk"`: Animasyon oynatıcıya yukarıda tasarladığımız "walk" yani yan yürüyüş animasyonuna geçmesini söyler.
*   `$AnimatedSprite2D.flip_v = false`: Animasyonun dikey (vertical) olarak ters dönmemesi / düz olması gerektiğini kesinleştirir. 
*   `$AnimatedSprite2D.flip_h = velocity.x < 0`: Animasyon sağ tarafa doğru bakarak çizilmiştir. Eğer karakter `velocity.x < 0` ise yani hızı sıfırın altında (eksiye/sola) doğru gidiyorsa `flip_h` yatay çevirme (horizontal) değerini `true` yaparız. Sağa gidiyorsa (hızı pozitifse) bu şart sağlanmaz ve `false` dönerek görseli çevirmez. 
*   `elif velocity.y != 0:`: Eğer yatayda hareket yoksa ama dikeyde (y ekseni) hareket varsa bu sefer bu bloğa girer.
*   `$AnimatedSprite2D.animation = "up"`: Karakter yukarı veya aşağı gittiği için onu arkasından gördüğümüz "up" isimli animasyona geçer.
*   `$AnimatedSprite2D.flip_v = velocity.y > 0`: Dikeydeki animasyonlarımızın ikisi de yukarı doğru yürüyecek şekilde çizilmiş halde. Eğer oyuncu aşağıya doğru gidiyorsa (`velocity.y > 0` şartı "aşağı" gidişi temsil eder ve `true` döndürür) animasyonu `flip_v` ile dikeyde takla attırarak ters (aşağı) bakmasını sağlar.


Bu kod sayesinde; karakter sağa veya sola giderken "walk" animasyonu çalışacak ve sola gidiyorsa `flip_h` ile yatayda ters çevrilecektir. Yukarı veya aşağı giderken ise "up" animasyonu çalışacak, aşağı gidiyorsa `flip_v` ile dikeyde ters dönecektir.

---

## Bölüm Özeti

Harika bir iş çıkardınız! Bu bölümde;
* Dikey bir oyun için ekran ve ölçekleme ayarlarını yapılandırdınız.
* `Area2D`, `AnimatedSprite2D` ve `CollisionShape2D` kullanarak kendi oyuncu sahnenizi inşa ettiniz.
* Godot'nun Input Map sistemini kullanarak kontrolleri bağladınız.
* GDScript ile pürüzsüz bir 8 yönlü hareket kodu yazıp, ekrandan çıkmayı engelleyen matematiksel fonksiyonları (`normalized`, `clamp`) kullandınız.

---

## Sıradaki Adım

Bir sonraki bölümde oyununuza asıl heyecanı katacak olan **Düşman Yapay Zekası ve Spawner (Oluşturucu)** sistemini kuracağız. Görüşmek üzere!