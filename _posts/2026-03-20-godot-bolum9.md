---
title: "Godot Engine Eğitim Serisi - Bölüm 9: 3D Dünyaya Geçiş ve Oyuncu Kontrolü"
date: 2026-03-20 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 3d, characterbody3d, fizik, squash-the-creeps]
permalink: /godot-egitim-serisi-bolum-9/
published: true
---

2D oyun projemizi başarıyla tamamladıktan sonra artık bir adım ileriye geçme ve ilk **3D oyunumuzu ("Squash the Creeps!")** geliştirme zamanı!

![Squash the Creeps Önizleme](/assets/images/squash-the-creeps-final.webp)
*Serinin sonunda bu oyunu yapmış olacaksın — zıplayarak düşmanların üstüne bas!*

3D oyun geliştirmek, 2D'ye kıyasla bazı yeni zorlukları beraberinde getirir: Artık derinliği ifade eden bir **Z ekseni** vardır, 2D'de olduğu gibi ekranın tamamı oyun sahneniz değildir (kamerayı özel olarak yönetmeniz gerekir) ve fizik motoru biraz daha farklı çalışır. Ancak endişelenmeyin, hepsini adım adım çözeceğiz!

Bu projede ihtiyacınız olacak bazı görsel ve animasyon içeriklerini [buradan](https://github.com/godotengine/godot-docs-project-starters/releases/download/latest-4.x/3d_squash_the_creeps_starter.zip) indirebilirsiniz.

---

## 3D Oyun Alanını Hazırlama

Oyun mantığını barındıracak ana sahneyi oluşturarak başlayalım. Yeni bir sahne oluşturun ve kök node olarak sıradan bir `Node` (isim: `Main`) ekleyin.

Karakterlerin boşluğa düşmemesi için 3D uzayda fiziksel bir zemin inşa etmeliyiz. 3D'de zemin veya duvar gibi hareketsiz çarpışma objeleri için `StaticBody3D` kullanılır.

1. `Main` node'una bir `StaticBody3D` çocuğu ekleyin ve adını `Ground` yapın.
2. Fiziksel sınırları belirlemek için `Ground` node'una bir `CollisionShape3D` ekleyin ve Inspector'dan şeklini (Shape) `BoxShape3D` olarak seçin. Bu kutunun boyutlarını (Size) **X: 60, Y: 2, Z: 60** olarak ayarlayın.

![BoxShape3D Oluştur](/assets/images/08.create_box_shape3D.webp)
*Zemin için en uygun şekil BoxShape3D — düz ve güvenilir*

![Kutu Boyutu](/assets/images/09.box_size.webp)
*BoxShape3D boyutu 60×2×60 olarak ayarlandı*

3. Çarpışma kutuları oyun içinde görünmez. Zemini gözle görebilmek için `Ground` node'una bir `MeshInstance3D` ekleyin, Mesh özelliğini `BoxMesh` yapın ve onun da boyutlarını **60, 2, 60** olarak belirleyin.

![BoxMesh](/assets/images/11.box_mesh.webp)
*Görsel zemin için BoxMesh kaynağı oluşturuyoruz*

![Küp Yeniden Boyutlandırıldı](/assets/images/12.cube_resized.webp)
*Görsel zemin tam ekranı kaplar hâlde*

Sahneyi biraz aydınlatmak için `Main` node'una bir `DirectionalLight3D` ekleyin. Gerçekçi bir görünüm için Inspector'dan **Shadow** (Gölge) özelliğini aktif hale getirmeyi unutmayın.

![Gölgeleri Aç](/assets/images/16.turn_on_shadows.webp)
*Shadow açıldığında sahne çok daha gerçekçi görünür*

---

## Oyuncu (Player) Sahnesini Kurmak

Şimdi oyuncu karakterini ayrı bir sahne olarak oluşturmalıyız. 

1. **Scene > New Scene** ile yeni bir sahne oluşturun ve kök node olarak `CharacterBody3D` ekleyip adını `Player` yapın. 

> 💡 **Bilgilendirme:** `CharacterBody3D`, fizik motoru tarafından değil, tamamen sizin kodlarınızla hareket ettirilen ama çevreyle fiziksel çarpışmalara girebilen bir yapıdır.

2. Oyuncu modelini kodla kolayca kendi etrafında döndürebilmek için bir `Node3D` çocuğu ekleyin ve adını `Pivot` yapın.
3. 3D model dosyanızı (`player.glb`) sürükleyerek bu `Pivot` node'unun çocuğu yapın.

![Sahne Yapısı](/assets/images/scene_structure.webp)
*Player > Pivot > Character (player.glb instance'ı)*

4. Karakterin dünya ile çarpışabilmesi için `Player` node'una bir `CollisionShape3D` ekleyin, şeklini `SphereShape3D` (Küre) yapın ve modeli saracak şekilde (yaklaşık 0.8 metre yarıçap) boyutlandırıp zemine hizalayın.

![Küre Şekli](/assets/images/sphere_shape.webp)
*Karakterin altında bir küre tel kafes görünür*

![Küreyi Yukarı Taşı](/assets/images/moving_the_sphere_up.webp)
*Çarpışma şeklini zemin düzlemiyle hizalayacak şekilde yukarı taşıyoruz*


### Girdi (Input) Eylemlerini Tanımlamak

Karakteri hareket ettirmek için 3D eksenlere karşılık gelen tuş atamalarını yapmalıyız. **Project > Project Settings > Input Map** yolunu izleyerek şu eylemleri ekleyin ve ok tuşlarını atayın:

![Input Map Sekmesi](/assets/images/input_map_tab.webp)
*Input Map — üstten eylem ekleyip alttan tuş atayabilirsin*


* `move_left` (Sol Ok)
* `move_right` (Sağ Ok)
* `move_forward` (Yukarı Ok / Z ekseninde ileri)
* `move_back` (Aşağı Ok / Z ekseninde geri)

![Hareket Tuşları Bağlandı](/assets/images/move_inputs_mapped.webp)
*Dört yön eylemi klavye ve joystick ile eşleştirildi*

---

## 3D Hareket Kodunu Yazmak

`Player` node'una bir script ekleyin. 3D fizikle ilgili işlemler için Godot'nun sabit zaman aralıklarıyla çalışan `_physics_process()` fonksiyonunu kullanacağız.

Aşağıdaki GDScript kodunu dosyanıza yapıştırın:

```gdscript
extends CharacterBody3D

@export var speed = 14
@export var fall_acceleration = 75
var target_velocity = Vector3.ZERO

func _physics_process(delta):
    var direction = Vector3.ZERO

    # Girdileri 3D eksenlere göre dinliyoruz (X yatay, Z derinlik)
    if Input.is_action_pressed("move_right"):
        direction.x += 1
    if Input.is_action_pressed("move_left"):
        direction.x -= 1
    if Input.is_action_pressed("move_back"):
        direction.z += 1
    if Input.is_action_pressed("move_forward"):
        direction.z -= 1

    # Çapraz harekette hızı normalleştirmek için
    if direction != Vector3.ZERO:
        direction = direction.normalized()
        $Pivot.basis = Basis.looking_at(direction)

    # Yerden Yüksekteyse Yerçekimi Uygula
    if not is_on_floor():
        target_velocity.y = target_velocity.y - (fall_acceleration * delta)

    # X ve Z eksenlerinde yatay hız hesaplaması
    target_velocity.x = direction.x * speed
    target_velocity.z = direction.z * speed

    # Hızı karaktere aktar ve hareket ettir
    velocity = target_velocity
    move_and_slide()
```

**Kodun Satır Satır Açıklaması:**
*   `extends CharacterBody3D`: 3D dünyada fiziksel etkileşimlere girebilen (duvarlara çarpan) bir karakter gövdesi düğümü kullandığımızı belirtir.
*   `@export var speed = 14`: Editörden (Inspector'dan) değiştirilebilir, hareket hızımızı 14 olarak ayarlayan değişken.
*   `@export var fall_acceleration = 75`: Yine editörden değiştirilebilen, yerçekiminin (aşağı düşüşün) ivme hızını belirleyen değişken.
*   `var target_velocity = Vector3.ZERO`: Hedef hızımızı tutan değişken. X (sağ/sol), Y (yukarı/aşağı) ve Z (ileri/geri) olmak üzere üç değeri de 0 olarak başlatıyoruz.
*   `func _physics_process(delta):`: 3D fizikle ilgili her türlü hareket ve çarpışma kontrolünü, oyunun o anki kare hızından (`delta`) bağımsız ve sabit adımlarla yapmamızı sağlayan ana motor fonksiyonumuzdur.
*   `var direction = Vector3.ZERO`: Her yeni karede (çalışmada) oyuncunun gitmek istediği yönü geçici olarak sıfırlar.
*   `if Input.is_action_pressed("move_right"):` vb.: Oyuncunun klavyesini dinliyoruz. 2D bölümünden farklı olarak burada yukarı/aşağı gitmek Y değil, kameradan uzaklaşıp yakınlaşmak, yani Z eksenidir. Z ekseni derine doğru gittiği için, `move_forward` (ileri git) dendiğinde yönün Z eksenini küçültürüz (`-1`), `move_back` ile Z eksenini büyütürüz (`+1`). Sağa sola gitmek ise yine eskisi gibi X eksenidir.
*   `if direction != Vector3.ZERO:`: Eğer oyuncu bir tuşa basıp yön değiştirdiyse...
*   `direction = direction.normalized()`: Çapraz giderken çok hızlı gitmesini kes, hızı 1 birime sabitle.
*   `$Pivot.basis = Basis.looking_at(direction)`: Bu satır, karakterin modelini döndürmek içindir. Node3D altındaki "Pivot" objemizi buluruz. `Basis` yapısı 3D dünyadaki çevirmeleri yönetir. `.looking_at(direction)` diyerek, o an yürünen yöne doğru bu objenin yüzünü döndürürüz. (Artık oyuncu sağa giderken modeli de sağa dönmüş olur).
*   `if not is_on_floor():`: Godot'nun müthiş kolaylıklarından biri. "Eğer karakter zeminde (floor) `değilse`" (yani havadaysa/düşüyorsa) demek.
*   `target_velocity.y = target_velocity.y - (fall_acceleration * delta)`: Hedef hızımızın Y (yukarı/aşağı) değerine, belirlediğimiz düşüş ivmesini (`75`) zamanla (`delta`) çarparak çıkart (`-`). Yani karakteri sürekli yere doğru çek.
*   `target_velocity.x = direction.x * speed`: Gitmek istediğimiz (basılan) X yönünü, son süratimizle (`14`) çarparak asıl yatay hedef hızımıza (`x`) yaz.
*   `target_velocity.z = direction.z * speed`: Gitmek istediğimiz derinlik (Z) yönünü hızımızla çarpıp hedef derinlik hızına (`z`) yaz. 
*   `velocity = target_velocity`: Matematiksel tüm hesaplamalar (yerçekimi + sağ/sol + ileri/geri yönler) bitti. Kendi hesapladığımız bu hedef hızı, CharacterBody3D'nin asıl motoruna (`velocity`) teslim et.
*   `move_and_slide()`: Nihayet tüm bu hız bilgilerini alarak, 3D dünyadaki duvarları ve engelleri hesaba katarak karakteri pürüzsüzce kaydırarak hareket ettir (duvara takılmadan yanından kayıp gitmesini sağlar).


**Bu kodda neler yaptık?**
* 3D ortamda yer düzlemi X ve Z eksenlerinden oluşur (Y ekseni yukarı/aşağıdır). Hareketleri bu eksenlerde hesapladık.
* `$Pivot.basis = Basis.looking_at(direction)` ile 3D modelimizin (Pivot üzerinden) her zaman gittiği yöne doğru bakmasını sağladık.
* `is_on_floor()` metoduyla karakterin havada olup olmadığını algılayıp, havadaysa `fall_acceleration` değerimizle onu aşağı (Y ekseninde eksiye) çektik.
* En sonunda `move_and_slide()` ile 3D hareketi güvenli ve pürüzsüz bir şekilde gerçekleştirdik.

---

## Kamerayı Yerleştirmek (Ortografik)

3D dünyada bir kameranız yoksa siyah bir ekrandan başka bir şey göremezsiniz.

1. `Main` sahnesine geri dönün ve `Player` sahnenizi bir "Instance" (Örnek) olarak oyun alanına ekleyin.
2. Sahneye bir `Camera3D` node'u ekleyip yukarıdan oyuncuya bakacak şekilde konumlandırın.
3. Bu tür oyunlar için "Perspektif" yerine Ortografik (Orthogonal) kamera kullanmak mesafeleri okumayı kolaylaştırır. Kamerayı seçip Inspector'dan **Projection** ayarını `Orthogonal` yapın ve **Size** değerini `19` olarak ayarlayın.

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='sP5ZefVN4xg' %}

---

## Bölüm Özeti

Tebrikler, artık 3D dünyada hareket eden ve nesnelere çarpan bir karakteriniz var! Bir sonraki bölümde, oyun alanına düşmanları spawn etmeyi (oluşturmayı) öğreneceğiz.