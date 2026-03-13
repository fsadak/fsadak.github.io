---
title: "Godot Engine Eğitim Serisi - Bölüm 9: 3D Dünyaya Geçiş ve Oyuncu Kontrolü"
date: 2026-03-20 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 3d, characterbody3d, fizik, squash-the-creeps]
permalink: /godot-egitim-serisi-bolum-9/
published: true
---

2D oyun projemizi başarıyla tamamladıktan sonra artık bir adım ileriye geçme ve ilk **3D oyunumuzu ("Squash the Creeps!")** geliştirme zamanı! 

3D oyun geliştirmek, 2D'ye kıyasla bazı yeni zorlukları beraberinde getirir: Artık derinliği ifade eden bir **Z ekseni** vardır, 2D'de olduğu gibi ekranın tamamı oyun sahneniz değildir (kamerayı özel olarak yönetmeniz gerekir) ve fizik motoru biraz daha farklı çalışır. Ancak endişelenmeyin, hepsini adım adım çözeceğiz!

---

## 3D Oyun Alanını Hazırlama

Oyun mantığını barındıracak ana sahneyi oluşturarak başlayalım. Yeni bir sahne oluşturun ve kök node olarak sıradan bir `Node` (isim: `Main`) ekleyin.

Karakterlerin boşluğa düşmemesi için 3D uzayda fiziksel bir zemin inşa etmeliyiz. 3D'de zemin veya duvar gibi hareketsiz çarpışma objeleri için `StaticBody3D` kullanılır.

1. `Main` node'una bir `StaticBody3D` çocuğu ekleyin ve adını `Ground` yapın.
2. Fiziksel sınırları belirlemek için `Ground` node'una bir `CollisionShape3D` ekleyin ve Inspector'dan şeklini (Shape) `BoxShape3D` olarak seçin. Bu kutunun boyutlarını (Size) **X: 60, Y: 2, Z: 60** olarak ayarlayın.

3. Çarpışma kutuları oyun içinde görünmez. Zemini gözle görebilmek için `Ground` node'una bir `MeshInstance3D` ekleyin, Mesh özelliğini `BoxMesh` yapın ve onun da boyutlarını **60, 2, 60** olarak belirleyin.


Sahneyi biraz aydınlatmak için `Main` node'una bir `DirectionalLight3D` ekleyin. Gerçekçi bir görünüm için Inspector'dan **Shadow** (Gölge) özelliğini aktif hale getirmeyi unutmayın.

---

## Oyuncu (Player) Sahnesini Kurmak

Şimdi oyuncu karakterini ayrı bir sahne olarak oluşturmalıyız. 

1. **Scene > New Scene** ile yeni bir sahne oluşturun ve kök node olarak `CharacterBody3D` ekleyip adını `Player` yapın. 

> 💡 **Bilgilendirme:** `CharacterBody3D`, fizik motoru tarafından değil, tamamen sizin kodlarınızla hareket ettirilen ama çevreyle fiziksel çarpışmalara girebilen bir yapıdır.

2. Oyuncu modelini kodla kolayca kendi etrafında döndürebilmek için bir `Node3D` çocuğu ekleyin ve adını `Pivot` yapın.
3. 3D model dosyanızı (`player.glb`) sürükleyerek bu `Pivot` node'unun çocuğu yapın.
4. Karakterin dünya ile çarpışabilmesi için `Player` node'una bir `CollisionShape3D` ekleyin, şeklini `SphereShape3D` (Küre) yapın ve modeli saracak şekilde (yaklaşık 0.8 metre yarıçap) boyutlandırıp zemine hizalayın.


### Girdi (Input) Eylemlerini Tanımlamak

Karakteri hareket ettirmek için 3D eksenlere karşılık gelen tuş atamalarını yapmalıyız. **Project > Project Settings > Input Map** yolunu izleyerek şu eylemleri ekleyin ve ok tuşlarını atayın:


* `move_left` (Sol Ok)
* `move_right` (Sağ Ok)
* `move_forward` (Yukarı Ok / Z ekseninde ileri)
* `move_back` (Aşağı Ok / Z ekseninde geri)

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

## Bölüm Özeti

Tebrikler, artık 3D dünyada hareket eden ve nesnelere çarpan bir karakteriniz var! Bir sonraki bölümde, oyun alanına düşmanları spawn etmeyi (oluşturmayı) öğreneceğiz.