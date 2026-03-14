---
title: "Godot Engine Eğitim Serisi - Bölüm 8: Skor, Yeniden Oynama ve Kullanıcı Arayüzü (HUD)"
date: 2026-03-19 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, dodge-the-creeps, hud, ui, ses]
permalink: /godot-egitim-serisi-bolum-8/
published: true
---

Oyunumuz mekanik olarak çalışıyor ve oynanabilir durumda. Ancak skor göstergesi, oyun bittiğinde "Yeniden Oyna" seçeneği (Game Over mesajı) ve bir başlangıç butonu olmadan oyun tam bir deneyim sunmaz. Bu bölümde, HUD (Heads-Up Display) sahnesiyle kullanıcı arayüzünü oluşturacak, eski düşmanları temizleyerek yeniden oynama mantığını kuracak ve son olarak ses efektleriyle oyunumuza ruh katacağız.

---

## HUD (Kullanıcı Arayüzü) Sahnesini Kurmak

Arayüz elemanlarının oyun dünyasındaki nesnelerin (oyuncu veya düşmanlar) altında kalmaması için onları ayrı bir katmanda çizmemiz gerekir.

1. Yeni bir sahne oluşturun, "Other Node" butonuna tıklayın ve kök node olarak `CanvasLayer` ekleyip adını `HUD` olarak değiştirin.

2. `HUD` node'unun altına şu çocuk node'ları ekleyin:
   * **ScoreLabel (Label):** Skoru gösterecek.
   * **Message (Label):** "Game Over" veya "Get Ready!" gibi mesajları gösterecek.
   * **StartButton (Button):** Oyunu başlatacak.
   * **MessageTimer (Timer):** Mesajların ekranda ne kadar süre kalacağını yönetecek (Wait Time: 2, One Shot: On).

### Özel Font ve Konumlandırma Ayarları

Varsayılan fontları daha şık bir fontla değiştireceğiz.

1. `ScoreLabel` node'unu seçin, Inspector panelinden **Theme Overrides > Fonts** sekmesindeki "Load" seçeneği ile oyun varlıklarındaki `Xolonium-Regular.ttf` dosyasını yükleyin.
2. Hemen altındaki **Theme Overrides > Font Sizes** değerini `64` olarak ayarlayın. (Aynı işlemi `Message` ve `StartButton` için de tekrarlayın).

**Konumlandırma (Anchor Presets):**

* **ScoreLabel:** Text alanına `0` yazın. Horizontal/Vertical Alignment ayarlarını **Center** yapın. Anchor Preset'i **Center Top** olarak seçin.
* **Message:** Text alanına `Dodge the Creeps!` yazın. Alignment ayarlarını **Center** yapın. Autowrap Mode'u **Word** olarak ayarlayın (uzun metinlerin alt satıra inmesi için). Anchor Preset'i **Center** yapın.
* **StartButton:** Text alanına `Start` yazın. Anchor Preset'i **Center Bottom** olarak seçin ve Y pozisyonunu biraz yukarı (örneğin `580`) taşıyın.

---

## HUD Scripti ve Sinyaller

`HUD` node'una bir script ekleyin. Bu script, mesajları göstermek ve skoru güncellemekten sorumlu olacaktır.

Öncelikle oyun başladığında butonun gizlenmesi ve ana sahneye haber verilmesi için kendi özel sinyalimizi tanımlamalıyız:

```gdscript
signal start_game
```

**Kodun Satır Satır Açıklaması:**
*   `signal`: Godot'ya yeni bir sinyal tanımladığımızı belirtir.
*   `start_game`: Bu bizim özel sinyalimize verdiğimiz isimdir. Adından da anlaşılabileceği gibi "oyunu başlat" emrini ifade edecek. Arayüzde (HUD) START butonuna basıldığında bu sinyali yayacağız (emit) ve ana oyun sahnesi (Main) bu sinyali duyduğu anda kargaşayı, düşmanları vs. sıfırlayıp pırıl pırıl yeni bir oyun başlatacak.


Sonrasında şu üç temel fonksiyonu yazabilirsiniz:

* **`show_message(text)`:** `Message` etiketinin metnini günceller, görünür yapar ve `MessageTimer`'ı başlatır.
* **`update_score(score)`:** `ScoreLabel`'ın metnini (`Text`) string formatında oyuncunun anlık skoruna eşitler.
* **`show_game_over()`:** Bu fonksiyon, 2 saniye boyunca "Game Over" yazısını gösterir. Süre bitiminde `await get_tree().create_timer(1.0).timeout` komutunu kullanarak 1 saniyelik bir gecikme ekler ve ardından `StartButton`'ı tekrar görünür hale getirerek başlık ekranına ("Dodge the Creeps!") geri döner.

**Sinyalleri Bağlamak:** `StartButton`'ın `pressed` sinyalini HUD scriptinize bağlayarak içinde `start_game.emit()` çağrısını yapın ve butonu gizleyin. Aynı şekilde `MessageTimer`'ın `timeout` sinyalini bağlayarak süresi dolduğunda `Message` etiketini gizleyin.

---

## Main Sahnesiyle Entegrasyon ve Yeniden Oynama (Replay)

Arayüzümüz hazır olduğuna göre `main.tscn` sahnesini açıp `HUD` sahnenizi bir instance (örnek) olarak ana sahneye ekleyin.

1. `HUD` instance'ını seçin ve sağ paneldeki **Signals** sekmesinden yeni oluşturduğunuz `start_game` sinyalini, Main scriptinizdeki `new_game()` fonksiyonuna bağlayın.

2. Main scriptinizdeki `_ready()` fonksiyonunun içinde bulunan `new_game()` çağrısını silin. Böylece oyun siz "Start" butonuna basana kadar başlamayacaktır.
3. `game_over()` fonksiyonunuzun içine `show_game_over()` çağrısını ekleyin ve `_on_score_timer_timeout()` içerisinde `update_score(score)` çağrısı yaparak skoru güncelleyin.

### Eski Düşmanları Temizlemek (Grup Sistemi)

Oyun bitip yeniden başlatıldığında, ekrandaki eski düşmanlar (mob'lar) kalmaya devam eder. Bunları tek bir komutla temizlemek için Godot'nun grup (group) sistemini kullanmalıyız.

1. `mob.tscn` sahnesini açın, kök node'u seçip **Groups** sekmesinden `mobs` adında yeni bir grup oluşturup node'u bu gruba dahil edin.

2. Main scriptindeki `new_game()` fonksiyonunun içine şu satırı ekleyin: 

```gdscript
get_tree().call_group("mobs", "queue_free")
```

**Kodun Satır Satır Açıklaması:**
*   `get_tree()`: Tüm oyun ağacını yani sahnedeki her şeyi kapsayan ana yöneticiye ulaşırız.
*   `.call_group(...)`: "Bir gruba ait olan herkesi bul ve onlara şu komutu ver / çağır" anlamına gelir.
*   `"mobs"`: İlk parametre aradığımız grubun adıdır. Hatırlarsan az önce düşmanları "mobs" (kalabalıklar/yaratıklar) grubuna dahil etmiştik.
*   `"queue_free"`: İkinci parametre ise gruptaki node'lara gönderilen emirdir. `queue_free`, Godot'da "kendini yavaşça bellekten sil ve yok ol" demektir. Yani oyun alanındaki 10 tane düşman varsa, bu tek satır kod hepsini bulur ve aynı anda "yok olun" emri vererek ekranı yeni oyun için tertemiz yapar.

---

## Son Dokunuşlar: Ses, Arka Plan ve Dışa Aktarma

Oyun deneyimini tamamlamak için birkaç estetik dokunuş yapalım:

* **Arka Plan Rengi:** `Main` sahnesine bir `ColorRect` node'u ekleyin ve sahne ağacında en üste taşıyarak (diğer node'ların arkasında çizilmesi için) Inspector'dan istediğiniz bir rengi seçin. Anchor ayarlarından **Full Rect**'i seçerek tüm ekranı kaplamasını sağlayın.
* **Ses Efektleri ve Müzik:** `Main` sahnesine iki adet `AudioStreamPlayer` node'u ekleyip isimlerini `Music` ve `DeathSound` yapın. Oyun varlıklarındaki `House In a Forest Loop.ogg` dosyasını müziğe, `gameover.wav` dosyasını ölüm sesine atayın. `new_game()` çağrıldığında müziği başlatın, `game_over()` çağrıldığında müziği durdurup ölüm sesini oynatın.


> 💡 **Bilgilendirme:** Müziğin kesintisiz çalması için Stream dosyanızın yanındaki oka tıklayıp "Make Unique" dedikten sonra **Loop** kutusunu işaretlemeyi unutmayın.

* **Klavye Kısayolu:** Oyuna her seferinde fareyle tıklamak yerine "Enter" tuşuyla başlamak için; **Project Settings > Input Map** üzerinden `start_game` adında yeni bir eylem oluşturup Enter tuşunu atayın. Ardından `StartButton` node'unun Inspector panelindeki **Shortcut** özelliğine bu eylemi bağlayın.

---

## Tebrikler!

2D eğitim serisini ve ilk oyununuzu tamamen bitirdiniz. Oyununuzu dışa aktarmak (Export) ve arkadaşlarınızla paylaşmak için projenizi çalıştırılabilir dosya (.exe, vb.) olarak ayarlayabilirsiniz.

Bir sonraki rehberimizde 3D dünyanın kapılarını aralayacak ve "Squash the Creeps!" oyununa başlayacağız!