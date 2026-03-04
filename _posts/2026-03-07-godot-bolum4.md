---
title: "Godot Eğitim Serisi - Bölüm 4: Nesneler Arası İletişim: Sinyaller"
date: 2026-03-07 12:00:00 +0300
categories: [Godot Eğitim Serisi, GDScript]
tags: [godot, signals, sinyaller, iletişim, ders, observer pattern]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGJ3p1ZqeiUvJf957hfDRG4fOyTiSt0Py2EzBruQCA_NRBrNutwhUU-sZcZiS_0bppTNdIBWvmgk9bsT0Lt1y0UjybpqFTp0H1sojz_GDTw7R99BD1qp-ZVzfjDK8O0LMrgQ5H4MFlEw8enVs4pNk7HTKeborK9ZsqpuY9MMKtf5Y89sCPrcpRsuGzWA/s320/signals_12_node_connection.webp
  alt: Godot Sinyal Bağlantı Ekranı
---

Tekrar merhaba! Godot serimizin dördüncü bölümüne hoş geldiniz. Geçen derste ilk script’imizi yazıp Godot ikonumuzu ekranda hareket ettirmeyi başarmıştık. Peki ya bu ikon, bir butona bastığımızda dursun veya hareket etsin isteseydik bunu nasıl yapardık?

İşte burada devreye Godot’un **Sinyaller (Signals)** sistemi giriyor. Sinyaller, oyun içindeki düğümlerin (nodes) birbirlerine “Hey, bana bir şey oldu!” deme şeklidir. Örneğin bir buton, kendisine tıklandığında etrafına “Bana basıldı!” diye bağırır (emit). Başka bir düğüm bu bağırmayı duyup (listen) buna göre bir eylem gerçekleştirebilir.

Hadi bunu pratikte nasıl yapacağımıza bakalım!

---

## Sahnemizi Hazırlayalım

Sinyalleri test etmek için bir “Buton” ve hareket eden bir "Sprite2D"ye ihtiyacımız var.

1.  Yeni bir “2D Scene” (Node2D tabanlı) oluşturalım.
2.  Önceki derste yaptığımız `sprite_2d.tscn` sahnemizi sürükleyip bu yeni sahnenin içine bırakalım. (Evet, sahneleri başka sahnelerin içine koyabiliyoruz!)
3.  Node2D kök düğümümüze sağ tıklayıp “Add Child Node” diyerek bir **Button** düğümü ekleyelim.
4.  Butonun boyutunu ayarlayıp içine Inspector panelindeki “Text” kısmından “Hareketi Başlat/Durdur” yazalım.

![Yeni Sahne](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlUd7cKIsEOvGrkB_vVPpKAo3W2gU1o9POBiKSxXq51b96X6xy2NOd5-sdZgq2dRJR6icvjwajZo4AuABDql6oaIsOhlmzEeHoWht3-M71Ip5SNutcBNvAuHI0VUee6G-sWiFkMmkinQY9B11NbGO2inSU514CfIBhq9Qpdzm163j7YX_7O1HAsyNOBw/s1600/signals_02_2d_scene.webp)
![Buton Ekleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEislvP9p2kRC4LpeTgHZbJ6n6Rg60zljEz79StRzsOJCZYNovjfHhmwK9eDOKYJK-Oe48wdmpTR9yFhyphenhyphenkwkuP0cUcKdXDCsDXqTeiVD9Rle4f1JV8QPuwyuxNU2YRhrSIMDdioFDRZldp6LDZbEcPyVerKagDspAKQHnlBu6sSd_NzOzEAj-o-MuYJI3g/s320/signals_05_add_button.webp)
![Sahne Düzeni](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrOSPdaLcE6fSmCoZQuQ4l-W5kt9_cnoofXYYEQgeMzyOnNqIdfm2jp6rheSR73qSOjsovN8nZyzU8BguVle9gWxjjqwsjpztHW1oflEsgEuEbWI-ZIzWMU44u9zRaWBnGMpIkXLq9ziXVrciMKHs0c69uT4nIOqvQMXwNMT26e_4n1lmMKDkCc6O1Rg/s320/signals_09_scene_setup.webp)

Sahnemizi `node_2d.tscn` olarak kaydedelim. Oyunu çalıştırdığımızda butonu göreceğiz ama tıklasak bile henüz hiçbir şey yapmayacak.

---

## Editör Üzerinden Sinyal Bağlamak

Butonumuzun “Bana tıklandı!” diye bağırmasını (sinyal yaymasını) istiyoruz.

1.  Buton düğümünü seçin ve sağ taraftaki panelde “Inspector” sekmesinin hemen yanındaki **Signals (Sinyaller)** sekmesine geçin. Burada butonun yayabileceği onlarca farklı sinyali göreceksiniz.
2.  Bizim işimize yarayacak olan sinyal: **`pressed()`** (Tıklandı)
3.  `pressed()` sinyaline çift tıklayın. Karşınıza **Node Connection (Düğüm Bağlama)** penceresi çıkacak.

![Sinyaller Paneli](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3-DhJm16U-tN4KqyY6wHFw7kNjXrE4Z4v_4F4LnDBu6suzPtVW_RjkGKUC7-c_jTtL38Wvsmj_tz5WxJZ0SsxQAtlS0eYiVNns4FcpX4vtQKr2YtN4KMQViIu7rhGVoTWIBGRTXYvghD5DDD4EyEmGutUGgINTolvb27gJAHSnKqTXSnUfK_nGTuNjw/s1600/signals_11_pressed_signals.webp)
![Bağlantı Penceresi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGJ3p1ZqeiUvJf957hfDRG4fOyTiSt0Py2EzBruQCA_NRBrNutwhUU-sZcZiS_0bppTNdIBWvmgk9bsT0Lt1y0UjybpqFTp0H1sojz_GDTw7R99BD1qp-ZVzfjDK8O0LMrgQ5H4MFlEw8enVs4pNk7HTKeborK9ZsqpuY9MMKtf5Y89sCPrcpRsuGzWA/s320/signals_12_node_connection.webp)

Bu pencerede sinyalin **kime** gönderileceğini seçiyoruz. Bizim script’imiz `Sprite2D` üzerindeydi. Sahnemizin içindeki `Sprite2D`yi seçip alttaki “Connect (Bağla)” butonuna basalım.

**Sihir başlıyor!** Godot otomatik olarak kod sayfanıza geçecek ve en alta şöyle bir fonksiyon ekleyecek:

```gdscript
func _on_button_pressed():
	pass
