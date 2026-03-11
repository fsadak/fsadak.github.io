---
title: "Godot Engine Eğitim Serisi - Bölüm 3: Kodlamaya Giriş ve İlk Script'imiz"
date: 2026-03-19 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, script, kodlama, başlangıç]
permalink: /godot-egitim-serisi-bolum-3/
published: true
---

Herkese merhaba! Godot eğitim serimizin üçüncü bölümüyle karşınızdayız. Geçen bölümde Sahneler ve Düğümler (Nodes & Scenes) ile oyunumuzun iskeletini oluşturduk. Ama bu iskelet henüz hiçbir şey yapmıyor, etkiye tepki vermiyor. Bir oyunun canlı hissettirmesi için **Mantığa (Logic)**, yani koda ihtiyacı vardır.

Bugün Godot'nun desteklediği programlama dillerine bakacak, ardından ilk script'imizi yazıp ekrandaki bir karakteri hareket ettireceğiz. Hadi başlayalım!

---

## Godot Hangi Dilleri Destekler?

Godot oyun motorunda bir düğüme (Node) yeni davranışlar eklemek veya var olanları değiştirmek için **Script** (Betik/Kod) yazarız. Scriptler eklendikleri düğümün özelliklerini miras alırlar. Örneğin kameranın titremesini istiyorsak, kameraya bir script ekler ve o kodu yazarız.

![Kamera Titreme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjr5-3FvKO56RUGg_2NonNfDN9lblmctCsHAbl2_2pGAyUuL3jjX4nVBXh-y3oQ_I-JfMpfdpnmn4cWfJ7TvFfL3UjivV8k6mpRwatF9rMdzQmDwyfhkV08jAZCuY6OfSpLoy655PeOcb3qGLX_mGYxfPsZ9_kKkahF_NhINHUQ36eFdj6M3dM7M_FO8Q/s600/scripting_camera_shake.gif)

Godot resmi olarak şu dilleri destekler:

1. **GDScript:** Godot'un kendi özel, Python benzeri dili. Oyun geliştiricileri için sıfırdan yapılmıştır. Çok hızlı derlenir, editöre tam entegredir ve öğrenmesi en kolay dildir. **Yeni başlayanlara her zaman GDScript öneriyorum.**

2. **C# (.NET):** Özellikle Unity'den gelenlerin veya kurumsal yazılımcıların sevdiği güçlü bir dil.

3. **C ve C++ (GDExtension):** Performansı arttırmak istediğiniz çok ağır algoritmalar için kullanılır.

Biz bu eğitim serisinde **GDScript** kullanacağız çünkü Godot'un gerçek gücü ve hızı GDScript ile tam uyumunda yatar.

![GDScript Editörü](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmVIqSIHizg_OPyy-XzmwTWaXLTywRhAbcODGh1BVp4Dr_7nnzIM80mS3n0eFusX2CJRDZZAgdyTFJW1yJSQYjIlPDH8GffsF12E2eRWK_OwcwDWrf6j_8deOwhRdTXNhznO9y087v9WUpNVf_dVHETSwF9m5Cow-5tfbC3pvmNHqfxU2fi-xzZpzlZg/s1119/scripting_gdscript.webp)

![C# Editörü](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjZS7R-o_ZHRVxH4rI5hjZpk-DaxjNBtG3o7wsbevMjjy9KZqm2_iydkrzNwzlYUd4ujTwo1UEnSdxHn-ArGUzyGlm6KGNEjDQgrqaG26XRY8xoWalOJXEY4VaXb4-NvOko9RcgVQK-EcVMkM4cxHQb4DsBV10P7k_hG0gCFI-qwNm9MgNhouFdQp388g/s900/scripting_csharp.png)

---

## Proje Hazırlığı: Oyuncumuzu Sahnemize Ekleyelim

Hemen yeni bir projede "Hello World" kodumuzu yazalım.

Öncelikle ekranda hareket ettireceğimiz bir şeye ihtiyacımız var. Godot'da projeyi ilk açtığımızda içinde gelen meşhur Godot ikonunu (`icon.svg`) oyuncumuz yapacağız.

1. Sol taraftan **Other Node** (Diğer Düğüm) seçeneğine tıklayalım ve bir **Sprite2D** düğümü ekleyelim. Bu düğüm, 2 boyutlu resimleri göstermeye yarar.

![Other Node Seçimi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjyESXeCMAS43PZ9VzTmQuH0wZ1hAcPF4Oj8AbVj6TE6grBu-EXO0WOPv-f6mRlG5WFCpNvYw4tgtsTE0kve5ishiSgX3JP655Tl1GABRekjfa1GlNAEQjYMWWNnwQg90HibboxVOuAQxFPdidQHLP21dBsbtCoCk1MjCQrhfM7_aiIkxosP7DRJSK3aQ/s280/scripting_first_script_click_other_node.webp)

![Sprite2D Ekleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7-k3RsEuqdFhWpKPKCLsv7FMff8XUJeetLKmpu-oMf6-5MBkKa5WxAmeBWo5mBV9EaSGLV9GWhLIdTNmg-5JgzKrkPdeB-IoehBVgVXBIo_1HAVBJGT-DSgma4mfHNTq3m7ToTj48xBJfgM_CRehB8iX0T0QgXLlzxcm5j8TljrteNJgVu-sJBtWauA/s900/scripting_first_script_add_sprite_node.webp)

![Sahne Ağacı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjF2KB1HMzdOLzM1JrNS2Yui7lCQTYJGMVpE57Yo2sKYQzv8IW2ZPRdw9b3XP4H-XR2se9GfJbg7UKH-2HhWkA-iitoO0glgpLhd0Ol4ikhjuD3h0H8A4h9Nv0YMm7aaK64pCazVsy6ok8dhgrimlLdIhzVsdVlwlFiY5ZxkKzC3Dsu7He4iMPvXLRug/s258/scripting_first_script_scene_tree.webp)

2. Sağdaki Inspector paneline baktığımızda `Texture` (Doku) kısmının boş olduğunu görüyoruz. Sol alt köşedeki dosya sisteminden (FileSystem) `icon.svg` dosyasını sürükleyip bu Texture kutusunun içine bırakalım. Artık sahnemizde Godot logomuz var!

![Godot İkonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPyVgjB73GoaMUKHMYYIdzpFb5dGiJrF8lrlCWXNi7aCR-pKMvKJCcwWwphcxIKYtXNiR31cgyJhYdeZq_aVC5Z2EUiP2rl3_cn1XcX8e4iU11uUMX0nC2BHSSI-kxrhvjcb4jgFwKoCDVj0mQkHbkCF_RvTb0kRdZimgo4dcPvOSUBzQAuJEJUNDSwA/s128/icon.png)

![Texture Ayarı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjRffyU0BTQHdP1ysLrtC0Zrc_LuA1XKAjmYnNB-nl1KPLJBmBNuRF9n_FpYo67HxMycokuim15RXJNJYFuU6_LFpkQ54Lz7GvZ82BDkm43Y33u9Rm_ioSBqtqe6bbkx8T5NAhldab6ugAQEfkZXsZ5RMWnQ-GKZV2h0FRpLXHH_K1S4PrcBV1sWDnfjw/s301/scripting_first_script_setting_texture.webp)

![Sprite Ortalama](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEis6Y8b_x4TAIZpYCtnsojkO1UTCJ99XatCehQhr4OsujCA2E-ljkUGAAFJO7Rvn8PoPOZjbIeElTMrDOZkoDXWLyKBevP-RF4ImvGkLnXoHCl1FKv0ke3kwhKpu-ZiiNL0Q15_ghSH0GITAcCLiPKLZV4m7BCSYBKGMr3_fyHOuOeiohLIGnUeuFgXIw/s1092/scripting_first_script_centering_sprite.webp)

---

## İlk Script'i Oluşturmak

Şimdi logomuza beynini, yani kod dosyasını verelim.

Sahne panelindeki Sprite2D düğümüne sağ tıklayıp **Attach Script (Script Ekle)** diyoruz.

![Script Ekle](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjpKCMXyjSDqNvvnWQf2JaJPN1eO3iN9tooBx5iNzzXjVg8QnPD4GN7JfdMujQMezio0hQMXangFhsHa042Sa9fgvq-KEU22ge328k9tH-44s7pz5NXHYAkZ_oH2sujHBVHd3Fot5rN8mHg2i6D0SrXhK2tR6ZDVW_CSe6Yc638O3pWGwLmSGdf21EhQQ/s446/scripting_first_script_attach_script.webp)

Gelen ekranda her şeyi varsayılan bırakıp "Create" (Oluştur) butonuna basalım. Hemen karşımıza Godot'un kendi kod editörü (Script panel) açılacak.

![Script Paneli](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjP4jziXW5NYsUCQXYg4rvdfq7tNLxOXEE3XW76MJRQsFuhx-dvOnMvcj5ZznrF1WbO3Cf5aR7VccUCOjqEbNGBXiGDANOpnr2mjDPF8g8zucvoFROH6ja5mE_7KT0DY2XRJPNgKp9E-_q9Q5G_arqIobeC2aguKvFhy5L01Va90t6Z95zWwRwHpzKrfw/s485/scripting_first_script_attach_node_script.webp)

Kod sayfasında şunu göreceksiniz:

```gdscript
extends Sprite2D

func _ready():
    pass

func _process(delta):
    pass
```

**Kod Açıklaması:**

- `extends Sprite2D`: Bu scriptin bir Sprite2D düğümüne ait olduğunu ve onun tüm özelliklerini miras aldığını (kullanabileceğini) belirtir.
- `func _ready():`: Oyun başladığında o düğüm sahneye yüklendiği an **sadece bir kere** çalışan fonksiyondur.
- `pass`: "Burada şimdilik bir şey yok, hata verme, alt satıra geç" anlamına gelen bir yer tutucudur.
- `func _process(delta):`: Oyun çalıştığı sürece sürekli, her bir karede (frame) tekrar tekrar çalışan fonksiyondur. Delta süresini parametre olarak alır.

Hadi `_ready()` fonksiyonunun içine `print("Merhaba Dünya!")` yazalım. Kod şuna benzeyecek:

```gdscript
extends Sprite2D

func _ready():
    print("Merhaba Dünya!")
```

**Kod Açıklaması:**

- `print("Merhaba Dünya!")`: Tırnak işaretleri içindeki metni oyun motorunun alt panelindeki Output (Çıktı) ekranına yazdırır. Hata ayıklama veya kodun çalışıp çalışmadığını kontrol etmek için sıkça kullanılır.

Oyunu (F6 ile) çalıştırdığımızda, en alttaki **Output (Çıktı)** panelinde "Merhaba Dünya!" yazdığını göreceksiniz. Kodumuz çalışıyor!

![Merhaba Dünya Çıktısı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi59Sv7k1X6TznLjSkcbnj6Qlc4BFFEPUHAeXgo5l__sIqO0UZ2I4gslJEiQzLyXiEIcCsuy47DaiRsM8Hm93YuWwQT42ynpd4mUkhJd0ib4_-okCX-p2PftxRS-ir5mIVH7nvm-wNfe4g70zDPQm3amWyZo2qft_RCg0NhHQXkqe3dAAWbBPr8pjcmBA/s238/scripting_first_script_print_hello_world.webp)

---

## Oyuncuyu Kodla Döndürmek ve Hareket Ettirmek

Print yazmak güzel ama biz karakterimizin hareket etmesini istiyoruz. Bunun için `_process` fonksiyonunu kullanacağız çünkü hareket "sürekli" olan bir eylemdir.

Script dosyamızın en üstüne iki değişken (variable) tanımlayalım:

```gdscript
var hiz = 400
var donme_hizi = PI
```

**Kod Açıklaması:**

- `var hiz = 400`: `hiz` adında bir değişken tanımlar ve 400 değerini atar. Bu karakterimizin ileri gitme hızı olacaktır (saniyede 400 piksel).
- `var donme_hizi = PI`: `donme_hizi` adında bir değişken tanımlar ve `PI` (yaklaşık 3.14) matematiksel sabitini atar. Godot'ta PI değeri 180 dereceye dönmeye karşılık gelir (radyan cinsinden).

Sırada bu değerleri kullanarak kodumuzu yazmak var. `_process` içine şu kodu ekleyelim:

```gdscript
func _process(delta):
    rotation += donme_hizi * delta
```

**Kod Açıklaması:**

- `rotation += donme_hizi * delta`: Düğümün kendi etrafındaki dönme açısına (rotation), `donme_hizi` ile geçen sürenin (delta) çarpımını her karede ekler (`+=`). Bu sayede bilgisayarın hızından bağımsız olarak saniyede PI kadar (yarım tur) döner.

> **Not:** Kodun girintili (indent) olmasına dikkat edin! Aksi halde hata alırsınız. Her fonksiyon, if-else veya for döngüsü tanımlanırken ona ait altında kodlar mutlaka bir TAB tuşu içeride olmalıdır.

Bu kod her saniye dönme (rotation) açısını günceller. `delta` süresi, bilgisayar hızından bağımsız olarak hareketin akıcı olmasını sağlayan sihirli bir çarpandır.

Oyunu başlattığınızda ikonun fırıldak gibi kendi etrafında döndüğünü göreceksiniz!

![Dönen Godot İkonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgDi0RgdvAutJUln92_JMlDZsQuEqbx6PdzeOS0jwdnNEspiU44uBWUhKoqPQ8wpPDsH1J3b-KyjnW0Vz1GWR31o2X0MX-3N_NFD17QliT04xi0LbiqQYJOBBJa6L9GU8qQRfeICX3rmgdyJjm-uEffgFl962DHuluZALTJlCmm3zFGuZOI70-wUvELg/s334/scripting_first_script_godot_turning_in_place.gif)

**Biraz da ileri gidelim!** Sadece dönmesi yetmez, uzay gemisi gibi ileri gitsin! `_process` fonksiyonumuzun altına şu satırları da ekleyelim:

```gdscript
func _process(delta):
    rotation += donme_hizi * delta
    var yon = Vector2.UP.rotated(rotation)
    position += yon * hiz * delta
```

**Kod Açıklaması:**

- `var yon = Vector2.UP.rotated(rotation)`: `yon` adında geçici bir değişken oluşturur. Sabit olan "Yukarı" (`Vector2.UP`, yani Y: -1) yönünü alır ve bunu karakterin o anki dönüş açısı (`rotation`) kadar döndürür. Böylece karakterin "kendi baktığı yöne" giden bir vektör (ok) elde ederiz.
- `position += yon * hiz * delta`: Düğümün ekrandaki pozisyonuna (`position`); bulduğumuz o yönü, belirlediğimiz `hiz` (400) ve geçen süreyi (`delta`) çarparak ekler. Bu da görselin kendi etrafında dönerken aynı yöne doğru akıcı bir şekilde uçar gibi hareket etmesini sağlar.

Bu kodla birlikte yukarı doğru olan yönümüzü (Vector2.UP), karakterin dönüşüne göre ayarladık ve saniyede 400 piksellik bir hız ile pozisyona ekledik. Oyunu çalıştırdığınızda Godot ikonunun ekranda çember çizerek uçtuğunu göreceksiniz!

![Uçan Godot İkonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiaXkPS955SJ6OBMJeBAQN3qxfhyphenhyphensnyojfbGsCew4jcNf5i_PcCnwd1XNtt21iATTYA0oWtpJYwf7UhUdOXwpjFt1n_sgZtQQSU7g2sh38jupca26ypuijjMIzLyQT3gHdZ_w08raK7rX58Xoc7d2xY7HZu5RZx_t9BzjrYuqv6jJ9BFVrBfpopPh8Uxg/s370/scripting_first_script_rotating_godot.gif)

İşte bu kadar! İlk Godot scriptini yazdık ve ekrandaki bir objeyi canlandırdık. Ancak dikkat ederseniz karakter kendi kendine uçuyor, biz kontrol etmiyoruz. Gelecek dersimizde **Klavye ve Fare Kontrolleriyle (Player Input)** karakterimizi kendi isteğimize göre hareket ettirmeyi öğreneceğiz. Sonraki derste görüşmek üzere, hoşça kalın!
