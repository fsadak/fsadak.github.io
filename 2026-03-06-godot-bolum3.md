---
title: "Godot Eğitim Serisi - Bölüm 3: Kodlamaya Giriş ve İlk Script’imiz"
date: 2026-03-06 12:00:00 +0300
categories: [Godot Eğitim Serisi, GDScript]
tags: [godot, gdscript, kodlama, script, ders, programlama]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmVIqSIHizg_OPyy-XzmwTWaXLTywRhAbcODGh1BVp4Dr_7nnzIM80mS3n0eFusX2CJRDZZAgdyTFJW1yJSQYjIlPDH8GffsF12E2eRWK_OwcwDWrf6j_8deOwhRdTXNhznO9y087v9WUpNVf_dVHETSwF9m5Cow-5tfbC3pvmNHqfxU2fi-xzZpzlZg/s320/scripting_gdscript.webp
  alt: GDScript Logosu
---

Herkese merhaba! Godot eğitim serimizin üçüncü bölümüyle karşınızdayız. Geçen bölümde Sahneler ve Düğümler (Nodes & Scenes) ile oyunumuzun iskeletini oluşturduk. Ama bu iskelet henüz hiçbir şey yapmıyor, etkiye tepki vermiyor. Bir oyunun canlı hissettirmesi için **Mantığa (Logic)**, yani koda ihtiyacı vardır.

Bugün Godot’nun desteklediği programlama dillerine bakacak, ardından ilk script’imizi yazıp ekrandaki bir karakteri hareket ettireceğiz. Hadi başlayalım!

## Godot Hangi Dilleri Destekler?

Godot oyun motorunda bir düğüme (Node) yeni davranışlar eklemek veya var olanları değiştirmek için **Script** (Betik/Kod) yazarız. Scriptler eklendikleri düğümün özelliklerini miras alırlar. Örneğin kameranın titremesini istiyorsak, kameraya bir script ekler ve o kodu yazarız.

![Kamera Titreşimi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjr5-3FvKO56RUGg_2NonNfDN9lblmctCsHAbl2_2pGAyUuL3jjX4nVBXh-y3oQ_I-JfMpfdpnmn4cWfJ7TvFfL3UjivV8k6mpRwatF9rMdzQmDwyfhkV08jAZCuY6OfSpLoy655PeOcb3qGLX_mGYxfPsZ9_kKkahF_NhINHUQ36eFdj6M3dM7M_FO8Q/s320/scripting_camera_shake.gif)

Godot resmi olarak şu dilleri destekler:

1.  **GDScript:** Godot’un kendi özel, Python benzeri dili. Oyun geliştiricileri için sıfırdan yapılmıştır. Çok hızlı derlenir, editöre tam entegredir ve öğrenmesi en kolay dildir. **Yeni başlayanlara her zaman GDScript öneriyorum.**
2.  **C# (.NET):** Özellikle Unity’den gelenlerin veya kurumsal yazılımcıların sevdiği güçlü bir dil.
3.  **C ve C++ (GDExtension):** Performansın arttırmak istediğiniz çok ağır algoritmalar için kullanılır.

Biz bu eğitim serisinde **GDScript** kullanacağız çünkü Godot’un gerçek gücü ve hızı GDScript ile tam uyumunda yatar.

![GDScript](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmVIqSIHizg_OPyy-XzmwTWaXLTywRhAbcODGh1BVp4Dr_7nnzIM80mS3n0eFusX2CJRDZZAgdyTFJW1yJSQYjIlPDH8GffsF12E2eRWK_OwcwDWrf6j_8deOwhRdTXNhznO9y087v9WUpNVf_dVHETSwF9m5Cow-5tfbC3pvmNHqfxU2fi-xzZpzlZg/s320/scripting_gdscript.webp)
![C#](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjZS7R-o_ZHRVxH4rI5hjZpk-DaxjNBtG3o7wsbevMjjy9KZqm2_iydkrzNwzlYUd4ujTwo1UEnSdxHn-ArGUzyGlm6KGNEjDQgrqaG26XRY8xoWalOJXEY4VaXb4-NvOko9RcgVQK-EcVMkM4cxHQb4DsBV10P7k_hG0gCFI-qwNm9MgNhouFdQp388g/s320/scripting_csharp.png)

---

## Proje Hazırlığı: Oyuncumuzu Sahnemize Ekleyelim

Hemen yeni bir projede “Hello World” kodumuzu yazalım.

Öncelikle ekranda hareket ettireceğimiz bir şeye ihtiyacımız var. Godot’da projeyi ilk açtığımızda içinde gelen meşhur Godot ikonunu (`icon.svg`) oyuncumuz yapacağız.

1.  Sol taraftan **Other Node** (Diğer Düğüm) seçeneğine tıklayalım ve bir **Sprite2D** düğümü ekleyelim. Bu düğüm, 2 boyutlu resimleri göstermeye yarar.

    ![Other Node Seçimi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjyESXeCMAS43PZ9VzTmQuH0wZ1hAcPF4Oj8AbVj6TE6grBu-EXO0WOPv-f6mRlG5WFCpNvYw4tgtsTE0kve5ishiSgX3JP655Tl1GABRekjfa1GlNAEQjYMWWNnwQg90HibboxVOuAQxFPdidQHLP21dBsbtCoCk1MjCQrhfM7_aiIkxosP7DRJSK3aQ/s1600/scripting_first_script_click_other_node.webp)
    ![Sprite2D Ekleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7-k3RsEuqdFhWpKPKCLsv7FMff8XUJeetLKmpu-oMf6-5MBkKa5WxAmeBWo5mBV9EaSGLV9GWhLIdTNmg-5JgzKrkPdeB-IoehBVgVXBIo_1HAVBJGT-DSgma4mfHNTq3m7ToTj48xBJfgM_CRehB8iX0T0QgXLlzxcm5j8TljrteNJgVu-sJBtWauA/s320/scripting_first_script_add_sprite_node.webp)
    ![Sahne Ağacı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjF2KB1HMzdOLzM1JrNS2Yui7lCQTYJGMVpE57Yo2sKYQzv8IW2ZPRdw9b3XP4H-XR2se9GfJbg7UKH-2HhWkA-iitoO0glgpLhd0Ol4ikhjuD3h0H8A4h9Nv0YMm7aaK64pCazVsy6ok8dhgrimlLdIhzVsdVlwlFiY5ZxkKzC3Dsu7He4iMPvXLRug/s1600/scripting_first_script_scene_tree.webp)

2.  Sağdaki Inspector paneline baktığımızda `Texture` (Doku) kısmının boş olduğunu görüyoruz. Sol alt köşedeki dosya sisteminden (FileSystem) `icon.svg` dosyasını sürükleyip bu Texture kutusunun içine bırakalım. Artık sahnemizde Godot logomuz var!

    ![Icon Dosyası](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgPyVgjB73GoaMUKHMYYIdzpFb5dGiJrF8lrlCWXNi7aCR-pKMvKJCcwWwphcxIKYtXNiR31cgyJhYdeZq_aVC5Z2EUiP2rl3_cn1XcX8e4iU11uUMX0nC2BHSSI-kxrhvjcb4jgFwKoCDVj0mQkHbkCF_RvTb0kRdZimgo4dcPvOSUBzQAuJEJUNDSwA/s1600/icon.png)
    ![Texture Ayarlama](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjRffyU0BTQHdP1ysLrtC0Zrc_LuA1XKAjmYnNB-nl1KPLJBmBNuRF9n_FpYo67HxMycokuim15RXJNJYFuU6_LFpkQ54Lz7GvZ82BDkm43Y33u9Rm_ioSBqtqe6bbkx8T5NAhldab6ugAQEfkZXsZ5RMWnQ-GKZV2h0FRpLXHH_K1S4PrcBV1sWDnfjw/s1600/scripting_first_script_setting_texture.webp)
    ![Sprite Ortalama](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEis6Y8b_x4TAIZpYCtnsojkO1UTCJ99XatCehQhr4OsujCA2E-ljkUGAAFJO7Rvn8PoPOZjbIeElTMrDOZkoDXWLyKBevP-RF4ImvGkLnXoHCl1FKv0ke3kwhKpu-ZiiNL0Q15_ghSH0GITAcCLiPKLZV4m7BCSYBKGMr3_fyHOuOeiohLIGnUeuFgXIw/s320/scripting_first_script_centering_sprite.webp)

---

## İlk Script’i Oluşturmak

Şimdi logomuza beynini, yani kod dosyasını verelim.

Sahne panelindeki Sprite2D düğümüne sağ tıklayıp **Attach Script (Script Ekle)** diyoruz.

![Attach Script](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjpKCMXyjSDqNvvnWQf2JaJPN1eO3iN9tooBx5iNzzXjVg8QnPD4GN7JfdMujQMezio0hQMXangFhsHa042Sa9fgvq-KEU22ge328k9tH-44s7pz5NXHYAkZ_oH2sujHBVHd3Fot5rN8mHg2i6D0SrXhK2tR6ZDVW_CSe6Yc638O3pWGwLmSGdf21EhQQ/s320/scripting_first_script_attach_script.webp)

Gelen ekranda her şeyi varsayılan bırakıp “Create” (Oluştur) butonuna basalım. Hemen karşımıza Godot’un kendi kod editörü (Script panel) açılacak.

![Kod Editörü](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjP4jziXW5NYsUCQXYg4rvdfq7tNLxOXEE3XW76MJRQsFuhx-dvOnMvcj5ZznrF1WbO3Cf5aR7VccUCOjqEbNGBXiGDANOpnr2mjDPF8g8zucvoFROH6ja5mE_7KT0DY2XRJPNgKp9E-_q9Q5G_arqIobeC2aguKvFhy5L01Va90t6Z95zWwRwHpzKrfw/s320/scripting_first_script_attach_node_script.webp)

Kod sayfasında şunu göreceksiniz:

```gdscript
extends Sprite2D

func _ready():
	pass

func _process(delta):
	pass
