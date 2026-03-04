---
title: "Godot Eğitim Serisi - Bölüm 7: Arayüz (HUD) ve Oyunu Tamamlama"
date: 2026-03-10 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, ui, hud, canvaslayer, arayüz, ses efektleri, oyun bitti]
image:
  path: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhywkkpWOxy-FBflzOQWikOQ_YJfUoNQCg_nLHLULtFRAyD-BYD7kxAqbDILYwDZvP-W4mrKrZv-LwdjwkvETlXpx2GA2hN18RCMJHWQ7l6IC_RvUzRUMkzJzfNgaFFjSP3QBKAqVQrCuUKZG9GGW0siCo4zHEzJUab_jiT9fYUSEsTTwVDTdaLX1Lt1w/s320/custom_font_load_font.webp
  alt: Godot Font Yükleme
---

Godot Engine ile adım adım yaptığınız oyunumuzun son aşamasına geldik! Bir oyunun tamamen fonksiyonel olabilmesi için bir Kullanıcı Arayüzü (User Interface - UI) şart. Oyuncuya skorunu ve durumu iletmek zorundayız.

## 1. CanvasLayer ve HUD Sahnesi

Oyun elemanları çizilirken Arayüz elemanlarının hep en üst katmanda, silinmez şekilde görünmesini isteriz. Bunu Godot ile sağlamanın en iyi yolu, kök nesnesi **CanvasLayer** olan bir sistem kurmaktır.

1.  Yeni bir Sahne oluşturun, kök düğüm olarak **CanvasLayer** ekleyin ve adına `HUD` diyin.
2.  Daha sonra şu UI alt düğümlerini ekleyin:
    * İki adet **Label** (Biri `ScoreLabel`, biri `Message`)
    * Bir adet **Button** (`StartButton`)
    * Bir zamanlayıcı için **Timer** (`MessageTimer` adında)

Sahneyi `hud.tscn` olarak kaydedin.

---

## 2. Arayüz Görsel Ayarları ve Fontlar

Arayüz elemanlarında `.ttf` formatında kendi fontlarımızı atayabiliriz. Bu projede Xolonium fontunu kullanıyoruz. ([Fontu buradan indirebilirsiniz](https://www.dafont.com/xolonium.font)). Fontu indirip proje klasörüne koymanız gerekir.

Her etiketin Inspector (Sağ) paneline gidin, **Theme Overrides -> Fonts** kısmından font dosyanızı “Load” diyerek yükleyin ve yine Theme Overrides altındaki **Font Sizes**’ı `64` yapın.

* **ScoreLabel:** Metne “0” girin. Horizontal ve Vertical Alignment ayarlarını Center (Orta) yapın. Üst çubuktaki “Anchor Preset” (Çıpa) aracıyla “Center Top” (Üst Orta) olarak hizalayın.
* **Message Labal:** Metne “Dodge the Creeps!” yazın, Autowrap Mode ayarını “Word” yaparak satır atlamasını sağlayın, Layout kısmında Size X’i 480 vererek ortalayın (Anchor=Center).
* **StartButton:** Anchor ayarını Center Bottom (Alt Orta) yapıp, position Y eksenini 580’e oturtun. Daha tok görünmesi için Size kutularına 200’e 100 yazabilirsiniz.

<!--![Font Yükleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhywkkpWOxy-FBflzOQWikOQ_YJfUoNQCg_nLHLULtFRAyD-BYD7kxAqbDILYwDZvP-W4mrKrZv-LwdjwkvETlXpx2GA2hN18RCMJHWQ7l6IC_RvUzRUMkzJzfNgaFFjSP3QBKAqVQrCuUKZG9GGW0siCo4zHEzJUab_jiT9fYUSEsTTwVDTdaLX1Lt1w/s320/custom_font_load_font.webp)
![Font Boyutu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgnidWq0fBek72WKd-6NyOwVekidIMt96oXp2ABWqLMJtOG1gSKnl0cyjiro6lmAp9IPLXMlQ9PQ2AG0_yjB98N2Zb-EFg4kcDCTunbzoUq5FirrrlCYR-zMbdBuWuVbs5FhpK3SLkWutzQ2Rl28gh_zP0PIS6xn002zUK4dJjH5yG3rd0JP-9hyphenhyphennvDyQ/s1600/custom_font_size.webp)-->

---

## 3. HUD Yazılımları

HUD üzerinden mesaj yollamak, skoru yenilemek ve butonu kontrol etmek için `hud.gd` scripti yaratın. Bunun için HUD kök düğümüne sağ tıklayıp "Attach Script" seçin. Eğer Start butonuna basılırsa, dışarı yollanması (emit) için bir özel sinyal oluşturmalıyız.

```gdscript
extends CanvasLayer

signal start_game

func show_message(text):
	$Message.text = text
	$Message.show()
	$MessageTimer.start() # MessageTimer'ı 2 saniyelik 'One-Shot' olarak düzeltin.

func show_game_over():
	show_message("Game Over")
	await $MessageTimer.timeout # Timer bitene kadar kod burada duraklar (Async)
	$Message.text = "Dodge the Creeps!"
	$Message.show()
	await get_tree().create_timer(1.0).timeout # Kod ile anlık timer oluşturup bekletme tekniği
	$StartButton.show()

func update_score(score):
	$ScoreLabel.text = str(score)

func _on_start_button_pressed():
	$StartButton.hide()
	start_game.emit() # Özel Sinyal Fırlatıldı

func _on_message_timer_timeout(): # Node'dan Timer'ı bağlamayı unutmayın
	$Message.hide()
