---
title: "Godot Engine Eğitim Serisi - Bölüm 3: Kodlamaya Giriş ve İlk Script’imiz"
date: 2026-03-06 12:00:00 +0300
categories: [Godot Eğitim Serisi, Skript ve Programlama]
tags: [godot, gdscript, scripting, hello world, movement, process]
image:
  path: /_images/scripting_camera_shake.gif
  alt: Godot Scripting ve Kodlama
---

# Godot Engine Eğitim Serisi - Bölüm 3: Kodlamaya Giriş ve İlk Script’imiz

Herkese merhaba! Godot eğitim serimizin üçüncü bölümüyle karşınızdayız. Geçen bölümde Sahneler ve Düğümler (Nodes & Scenes) ile oyunumuzun iskeletini oluşturduk. Ama bu iskelet henüz hiçbir şey yapmıyor, etkiye tepki vermiyor. Bir oyunun canlı hissettirmesi için **Mantığa (Logic)**, yani koda ihtiyacı vardır.

Bugün Godot’nun desteklediği programlama dillerine bakacak, ardından ilk script’imizi yazıp ekrandaki bir karakteri hareket ettireceğiz. Hadi başlayalım!

---

### Godot Hangi Dilleri Destekler?

Godot oyun motorunda bir düğüme (Node) yeni davranışlar eklemek veya var olanları değiştirmek için **Script** (Betik/Kod) yazarız. Scriptler eklendikleri düğümün özelliklerini miras alırlar. Örneğin kameranın titremesini istiyorsak, kameraya bir script ekler ve o kodu yazarız.

![Kamera Titremesi](/_images/scripting_camera_shake.gif)

Godot resmi olarak şu dilleri destekler:

1. **GDScript:** Godot’un kendi özel, Python benzeri dili. Oyun geliştiricileri için sıfırdan yapılmıştır. Çok hızlı derlenir, editöre tam entegredir ve öğrenmesi en kolay dildir. **Yeni başlayanlara her zaman GDScript öneriyorum.**
2. **C# (.NET):** Özellikle Unity’den gelenlerin veya kurumsal yazılımcıların sevdiği güçlü bir dil.
3. **C ve C++ (GDExtension):** Performansın arttırmak istediğiniz çok ağır algoritmalar için kullanılır.

Biz bu eğitim serisinde **GDScript** kullanacağız çünkü Godot’un gerçek gücü ve hızı GDScript ile tam uyumunda yatar.

![GDScript Kodu](/_images/scripting_gdscript.webp)
![C# Kodu](/_images/scripting_csharp.png)

---

### Proje Hazırlığı: Oyuncumuzu Sahnemize Ekleyelim

Hemen yeni bir projede “Hello World” kodumuzu yazalım.

Öncelikle ekranda hareket ettireceğimiz bir şeye ihtiyacımız var. Godot’da projeyi ilk açtığımızda içinde gelen meşhur Godot ikonunu (`icon.svg`) oyuncumuz yapacağız.

1. Sol taraftan **Other Node** (Diğer Düğüm) seçeneğine tıklayalım ve bir **Sprite2D** düğümü ekleyelim. Bu düğüm, 2 boyutlu resimleri göstermeye yarar.

![Other Node Secimi](/_images/scripting_first_script_click_other_node.webp)
![Sprite Node Eklenmesi](/_images/scripting_first_script_add_sprite_node.webp)
![Scene Tree Gorunumu](/_images/scripting_first_script_scene_tree.webp)

2. Sağdaki Inspector paneline baktığımızda `Texture` (Doku) kısmının boş olduğunu görüyoruz. Sol alt köşedeki dosya sisteminden (FileSystem) `icon.svg` dosyasını sürükleyip bu Texture kutusunun içine bırakalım. Artık sahnemizde Godot logomuz var!

![Godot İkonu](/_images/icon.png)
![Doku Ayarlama](/_images/scripting_first_script_setting_texture.webp)
![Sprite Ekran Ortasında](/_images/scripting_first_script_centering_sprite.webp)

---

### İlk Script’i Oluşturmak

Şimdi logomuza beynini, yani kod dosyasını verelim.

Sahne panelindeki Sprite2D düğümüne sağ tıklayıp **Attach Script (Script Ekle)** diyoruz.

![Script Ekleme Kısmı](/_images/scripting_first_script_attach_script.webp)

Gelen ekranda her şeyi varsayılan bırakıp “Create” (Oluştur) butonuna basalım. Hemen karşımıza Godot’un kendi kod editörü (Script panel) açılacak.

![Node Script Ayarları](/_images/scripting_first_script_attach_node_script.webp)

Kod sayfasında şunu göreceksiniz:

```gdscript
extends Sprite2D

func _ready():
	pass

func _process(delta):
	pass
```

**Kod Açıklaması:**

* `extends Sprite2D`: Bu scriptin bir Sprite2D düğümüne ait olduğunu ve onun tüm özelliklerini miras aldığını (kullanabileceğini) belirtir.
* `func _ready():`: Oyun başladığında o düğüm sahneye yüklendiği an **sadece bir kere** çalışan fonksiyondur.
* `pass`: “Burada şimdilik bir şey yok, hata verme, alt satıra geç” anlamına gelen bir yer tutucudur.
* `func _process(delta):`: Oyun çalıştığı sürece sürekli, her bir karede (frame) tekrar tekrar çalışan fonksiyondur. Delta süresini parametre olarak alır.

Hadi `_ready()` fonksiyonunun içine `print("Merhaba Dünya!")` yazalım. Kod şuna benzeyecek:

```gdscript
extends Sprite2D

func _ready():
	print("Merhaba Dünya!")
```

**Kod Açıklaması:**

* `print("Merhaba Dünya!")`: Tırnak işaretleri içindeki metni oyun motorunun alt panelindeki Output (Çıktı) ekranına yazdırır. Hata ayıklama veya kodun çalışıp çalışmadığını kontrol etmek için sıkça kullanılır.

Oyunu (F6 ile) çalıştırdığımızda, en alttaki **Output (Çıktı)** panelinde “Merhaba Dünya!” yazdığını göreceksiniz. Kodumuz çalışıyor!

![Output Konsolunda Merhaba Dünya](/_images/scripting_first_script_print_hello_world.webp)

---

### Oyuncuyu Kodla Döndürmek ve Hareket Ettirmek

Print yazmak güzel ama biz karakterimizin hareket etmesini istiyoruz. Bunun için `_process` fonksiyonunu kullanacağız çünkü hareket “sürekli” olan bir eylemdir.

Script dosyamızın en üstüne iki değişken (variable) tanımlayalım:

```gdscript
var hiz = 400
var donme_hizi = PI
```

**Kod Açıklaması:**

* `var hiz = 400`: `hiz` adında bir değişken tanımlar ve 400 değerini atar. Bu karakterimizin ileri gitme hızı olacaktır (saniyede 400 piksel).
* `var donme_hizi = PI`: `donme_hizi` adında bir değişken tanımlar ve `PI` (yaklaşık 3.14) matematiksel sabitini atar. Godot’ta PI değeri 180 dereceye dönmeye karşılık gelir (radyan cinsinden).

Sırada bu değerleri kullanarak kodumuzu yazmak var. `_process` içine şu kodu ekleyelim:

```gdscript
func _process(delta):
	rotation += donme_hizi * delta
```

**Kod Açıklaması:**

* `rotation += donme_hizi * delta`: Düğümün kendi etrafındaki dönme açısına (rotation), `donme_hizi` ile geçen sürenin (delta) çarpımını her karede ekler (`+=`). Bu sayede bilgisayarın hızından bağımsız olarak saniyede PI kadar (yarım tur) döner.

*Not: Kodun girintili (indent) olmasına dikkat edin! Aksi halde hata alırsınız. Her fonksiyon, if-else veya for döngüsü tanımlanırken ona ait altında kodlar mutlaka bir TAB tuşu içeride olmalıdır.*

Bu kod her saniye dönme (rotation) açısını günceller. `delta` süresi, bilgisayar hızından bağımsız olarak hareketin akıcı olmasını sağlayan sihirli bir çarpandır.

Oyunu başlattığınızda ikonun fırıldak gibi kendi etrafında döndüğünü göreceksiniz!

![Godot İkonu Fırıldak Gibi Dönüyor](/_images/scripting_first_script_godot_turning_in_place.gif)

Biraz da ileri gidelim! Sadece dönmesi yetmez, uzay gemisi gibi ileri gitsin! `_process` fonksiyonumuzun altına şu satırları da ekleyelim:

```gdscript
func _process(delta):
	rotation += donme_hizi * delta
	var yon = Vector2.UP.rotated(rotation)
	position += yon * hiz * delta
```

**Kod Açıklaması:**

* `var yon = Vector2.UP.rotated(rotation)`: `yon` adında geçici bir değişken oluşturur. Sabit olan “Yukarı” (`Vector2.UP`, yani Y: -1) yönünü alır ve bunu karakterin o anki dönüş açısı (`rotation`) kadar döndürür. Böylece karakterin “kendi baktığı yöne” giden bir vektör (ok) elde ederiz.
* `position += yon * hiz * delta`: Düğümün ekrandaki pozisyonuna (`position`); bulduğumuz o yönü, belirlediğimiz `hiz` (400) ve geçen süreyi (`delta`) çarparak ekler. Bu da görselin kendi etrafında dönerken aynı yöne doğru akıcı bir şekilde uçar gibi hareket etmesini sağlar.

Bu kodla birlikte yukarı doğru olan yönümüzü (Vector2.UP), karakterin dönüşüne göre ayarladık ve saniyede 400 piksellik bir (hiz) ile pozisyona ekledik. Oyunu çalıştırdığınızda Godot ikonunun ekranda çember çizerek uçtuğunu göreceksiniz!

![Godot İkonu Uçuyor](/_images/scripting_first_script_rotating_godot.gif)

İşte bu kadar! İlk Godot scriptini yazdık ve ekrandaki bir objeyi canlandırdık. Ancak dikkat ederseniz karakter kendi kendine uçuyor, biz kontrol etmiyoruz. Gelecek dersimizde **Klavye ve Fare Kontrolleriyle (Player Input)** karakterimizi kendi isteğimize göre hareket ettirmeyi öğreneceğiz. Sonraki derste görüşmek üzere, hoşça kalın!
