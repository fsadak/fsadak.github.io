---
title: "Godot Engine Eğitim Serisi - Bölüm 4: Nesneler Arası İletişim: Sinyaller (Signals)"
date: 2026-03-07 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, signals, sinyaller, gdscript, node]
---

Tekrar merhaba! Godot serimizin dördüncü bölümüne hoş geldiniz. Geçen derste ilk script'imizi yazıp Godot ikonumuzu ekranda hareket ettirmeyi başarmıştık. Peki ya bu ikon, bir butona bastığımızda dursun veya hareket etsin isteseydik bunu nasıl yapardık?

İşte burada devreye Godot'un **Sinyaller (Signals)** sistemi giriyor. Sinyaller, oyun içindeki düğümlerin (nodes) birbirlerine "Hey, bana bir şey oldu!" deme şeklidir. Örneğin bir buton, kendisine tıklandığında etrafına "Bana basıldı!" diye bağırır (emit). Başka bir düğüm bu bağırmayı duyup (listen) buna göre bir eylem gerçekleştirebilir.

Hadi bunu pratikte nasıl yapacağımıza bakalım!

---

## Sahnemizi Hazırlayalım

Sinyalleri test etmek için bir "Buton" ve hareket eden bir "Sprite2D"ye ihtiyacımız var.

1. Yeni bir "2D Scene" (Node2D tabanlı) oluşturalım.

2. Önceki derste yaptığımız `sprite_2d.tscn` sahnemizi sürükleyip bu yeni sahnenin içine bırakalım. (Evet, sahneleri başka sahnelerin içine koyabiliyoruz!)

3. Node2D kök düğümümüze sağ tıklayıp "Add Child Node" diyerek bir **Button** düğümü ekleyelim.

4. Butonun boyutunu ayarlayıp içine Inspector panelindeki "Text" kısmından "Hareketi Başlat/Durdur" yazalım.

![2D Sahne](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlUd7cKIsEOvGrkB_vVPpKAo3W2gU1o9POBiKSxXq51b96X6xy2NOd5-sdZgq2dRJR6icvjwajZo4AuABDql6oaIsOhlmzEeHoWht3-M71Ip5SNutcBNvAuHI0VUee6G-sWiFkMmkinQY9B11NbGO2inSU514CfIBhq9Qpdzm163j7YX_7O1HAsyNOBw/s271/signals_02_2d_scene.webp)

![Button Ekleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEislvP9p2kRC4LpeTgHZbJ6n6Rg60zljEz79StRzsOJCZYNovjfHhmwK9eDOKYJK-Oe48wdmpTR9yFhyphenhyphenkwkuP0cUcKdXDCsDXqTeiVD9Rle4f1JV8QPuwyuxNU2YRhrSIMDdioFDRZldp6LDZbEcPyVerKagDspAKQHnlBu6sSd_NzOzEAj-o-MuYJI3g/s900/signals_05_add_button.webp)

![Sahne Kurulumu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrOSPdaLcE6fSmCoZQuQ4l-W5kt9_cnoofXYYEQgeMzyOnNqIdfm2jp6rheSR73qSOjsovN8nZyzU8BguVle9gWxjjqwsjpztHW1oflEsgEuEbWI-ZIzWMU44u9zRaWBnGMpIkXLq9ziXVrciMKHs0c69uT4nIOqvQMXwNMT26e_4n1lmMKDkCc6O1Rg/s1165/signals_09_scene_setup.webp)

Sahnemizi `node_2d.tscn` olarak kaydedelim. Oyunu çalıştırdığımızda butonu göreceğiz ama tıklasak bile henüz hiçbir şey yapmayacak.

---

## Editör Üzerinden Sinyal Bağlamak

Butonumuzun "Bana tıklandı!" diye bağırmasını (sinyal yaymasını) istiyoruz.

1. Buton düğümünü seçin ve sağ taraftaki panelde "Inspector" sekmesinin hemen yanındaki **Signals (Sinyaller)** sekmesine geçin. Burada butonun yayabileceği onlarca farklı sinyali göreceksiniz.

2. Bizim işimize yarayacak olan sinyal: **`pressed()`** (Tıklandı)

3. `pressed()` sinyaline çift tıklayın. Karşınıza **Node Connection (Düğüm Bağlama)** penceresi çıkacak.

![Pressed Sinyali](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3-DhJm16U-tN4KqyY6wHFw7kNjXrE4Z4v_4F4LnDBu6suzPtVW_RjkGKUC7-c_jTtL38Wvsmj_tz5WxJZ0SsxQAtlS0eYiVNns4FcpX4vtQKr2YtN4KMQViIu7rhGVoTWIBGRTXYvghD5DDD4EyEmGutUGgINTolvb27gJAHSnKqTXSnUfK_nGTuNjw/s298/signals_11_pressed_signals.webp)

![Node Connection Penceresi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGJ3p1ZqeiUvJf957hfDRG4fOyTiSt0Py2EzBruQCA_NRBrNutwhUU-sZcZiS_0bppTNdIBWvmgk9bsT0Lt1y0UjybpqFTp0H1sojz_GDTw7R99BD1qp-ZVzfjDK8O0LMrgQ5H4MFlEw8enVs4pNk7HTKeborK9ZsqpuY9MMKtf5Y89sCPrcpRsuGzWA/s524/signals_12_node_connection.webp)

Bu pencerede sinyalin **kime** gönderileceğini seçiyoruz. Bizim script'imiz `Sprite2D` üzerindeydi. Sahnemizin içindeki `Sprite2D`yi seçip alttaki "Connect (Bağla)" butonuna basalım.

**Sihir başlıyor!** Godot otomatik olarak kod sayfanıza geçecek ve en alta şöyle bir fonksiyon ekleyecek:

```gdscript
func _on_button_pressed():
    pass
```

**Kod Açıklaması:**

- `func _on_button_pressed():`: Bu, buton tıklandığında (pressed sinyali tetiklendiğinde) Godot tarafından otomatik çağrılacak olan fonksiyondur. İsimlendirmesi tipik olarak `_on_` ile başlar.
- `pass`: İçi boş bir fonksiyon bırakmak yerine, Godot'un hata vermemesi için konulan yer tutucu (hiçbir şey yapma) komutudur. Godot içi boş fonksiyon, if-else veya for döngüsünden hiç hoşlanmaz.

Eklenen fonksiyonun sol tarafında yeşil bir bağlantı ikonu göreceksiniz. Bu, "Bu fonksiyon bir sinyale bağlı" demektir. Şimdi bu `pass` yazısını silip butonun ne yapacağını söyleyelim.

```gdscript
func _on_button_pressed():
    set_process(not is_processing())
```

**Kod Açıklaması:**

- `is_processing()`: O an `_process(delta)` fonksiyonunun (yani hareket döngüsünün) aktif mi (true) yoksa kapalı mı (false) olduğunu kontrol eder.
- `not`: Bir mantıksal değerin tam tersini alır (true ise false, false ise true yapar).
- `set_process(...)`: İşleme döngüsünü açıp kapatır. Yani buton her tıklandığında mevcut duruma bakılır ve tam tersi uygulanır (hareket ediyorsa durdurur, duruyorsa hareket ettirir).

Bu komut şunu der: "`_process` fonksiyonunun (yani her karede çalışan hareket kodumuzun) çalışma durumunu tersine çevir." Çalışıyorsa durdur, duruyorsa çalıştır.

F6 ile oyunu başlatıp butona tıkladığınızda ikon hareketinin durduğunu, tekrar tıkladığınızda çalışmaya başladığını göreceksiniz! Muhteşem, değil mi? Neredeyse hiç kod yazmadık ve Godot bizim yerimize her şeyi yaptı.

---

## Kod ile Sinyal Bağlamak

Editörden sinyal bağlamak çok kolaydır ama bazen oyundaki düşmanlar veya nesneler oyun kodu içinden yaratılır. Bu tip durumlarda sinyalleri **Kod üzerinden** bağlamamız gerekir.

Bunu test etmek için sahnemizdeki Sprite2D düğümüne bir **Timer (Zamanlayıcı)** düğümü ekleyelim ve Timer'ın `Autostart` (Otomatik başla) özelliğini aktif edelim.

![Sahne Ağacı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEge8ckk-R2ShzxNhZdpqmVMUjnV6ZUBw3f0YmdOwj-jD2um4fREI-xMYWwVVQevhivMd2gVKuP0JXZEpxwOev3S1kRo0eppHe2Q51GAiF1DthmlFE-mfYCJ_ApIxaKKhmkTbQLQ74Ow93vl0U5EE8kgAD6wBAGY2qtS1eUUNvtURZp7As80c2wnHMSa1g/s258/signals_15_scene_tree.webp)

Tekrar kodumuza `sprite_2d.gd` içine dönüyoruz. Oyun ilk başladığında (`_ready` fonksiyonu içinde) Timer'ı bulup onun sinyalini dinlememiz gerekiyor:

```gdscript
func _ready():
    var timer = get_node("Timer")
    timer.timeout.connect(_on_timer_timeout)

func _on_timer_timeout():
    visible = not visible
```

**Kod Açıklaması:**

- `var timer = get_node("Timer")`: "Timer" isimli child (alt) düğümü bulur ve `timer` isimli değişkene atar.
- `timer.timeout.connect(_on_timer_timeout)`: Bulduğu `timer` düğümünün kendi içindeki `timeout` (süre bitimi) sinyalini alır ve kodumuzdaki `_on_timer_timeout()` fonksiyonuna bağlar (`connect`).
- `visible = not visible`: Görünürlük (visible) özelliğini mevcut durumunun tam tersi yapar. Görünüyorsa saklar, saklıysa görünür kılar.

**Bu iki adımda ne yaptık?**

1. Sahnemizdeki `Timer` düğümünü `get_node("Timer")` ile bulduk.
2. Timer'ın süresi bittiğinde yaydığı `timeout` sinyalini, `.connect()` komutuyla bizim yazacağımız `_on_timer_timeout` fonksiyonuna bağladık.

Alt kısımda da fonksiyonu oluşturup `visible` değerini ters çevirdik. Eğlenceli bir sonuç: Oyunu oynattığınızda Godot simgesinin her saniye yanıp söndüğünü (görünmez/görünür olduğunu) fark edeceksiniz.

---

## Kendi Özel Sinyallerimizi (Custom Signals) Oluşturalım

Peki ya canımız sıfıra indiğinde veya bir bölümü bitirdiğimizde tamamen bize özel bir sinyal yaymak istiyorsak?

Bunu Godot'da yapmak inanılmaz derecede basittir: Kodun en üstüne, `extends` satırının hemen altına kendi sinyalinizi tanımlarsınız!

```gdscript
signal can_tuketildi # Bu bizim özel sinyalimiz!
var can = 10

func hasar_al(miktar):
    can -= miktar
    if can <= 0:
        can_tuketildi.emit() # Sinyali ateşle!
```

**Kod Açıklaması:**

- `signal can_tuketildi`: `can_tuketildi` adında tamamen bize ait (özel) yeni bir sinyal tanımlar. Bu sinyal henüz kimse tarafından dinlenmiyor bile olsa artık var.
- `can -= miktar`: Karakterin mevcut can değerinden kendisine gelen hasar (miktar) kadar eksiltme yapar.
- `if can <= 0:`: Eğer canımız sıfıra veya sıfırın altına düştüyse aşağıdaki işlemi yap…
- `can_tuketildi.emit()`: Yukarıda tanımladığımız özel sinyalimizi (can_tuketildi) yayınlar (`emit()`). Artık bu sinyali dinleyen her Game Manager, UI veya ses sistemi harekete geçebilir.

Gördüğünüz gibi, bir koşul gerçekleştiğinde (can sıfıra düştüğünde) `.emit()` komutunu kullanarak kendi sinyalimizi etrafa haber verdik. Bu özel sinyaliniz de aynı butonlarda olduğu gibi Inspector panelinde "Signals" sekmesinde gözükecek ve editörden bağlanabilecektir!

Bu derste Game Development (Oyun Geliştirme) dünyasının en önemli paternlerinden biri olan Observer paterninin Godot'taki karşılığı olan **Sinyaller**'i öğrendik. Sinyaller, oyununuz karmaşıklaştıkça hayat kurtaracak. Kodlarınızın birbirine sarmaşık gibi dolaşmasını (Spaghetti Code) engeller!

Artık Godot'un temel yapı taşları olan Sahneler, Düğümler, Scriptler ve Sinyalleri cebimize koyduğumuza göre bir sonraki derste ilk tamamen çalışan mini oyunumuzu yapmaya geçebiliriz! Takipte kalın, hoşça kalın!
