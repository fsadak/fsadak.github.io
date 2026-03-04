---
title: "Godot Engine Eğitim Serisi - Bölüm 7: Arayüz (HUD) ve Oyunu Tamamlama"
date: 2026-03-10 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, hud, canvaslayer, ui, ses]
---

Godot Engine ile adım adım yaptığınız oyunumuzun son aşamasına geldik! Bir oyunun tamamen fonksiyonel olabilmesi için bir Kullanıcı Arayüzü (User Interface - UI) şart. Oyuncuya skorunu ve durumu iletmek zorundayız.

## 1. CanvasLayer ve HUD Sahnesi

Oyun elemanları çizilirken arayüz elemanlarının hep en üst katmanda, silinmez şekilde görünmesini isteriz. Bunu Godot ile sağlamanın en iyi yolu, kök nesnesi `CanvasLayer` olan bir sistem kurmaktır.

Yeni bir sahne oluşturun, kök düğüm olarak `CanvasLayer` ekleyin ve adına `HUD` diyin.

Daha sonra şu UI alt düğümlerini ekleyin:

1. İki adet `Label` (Biri `ScoreLabel`, biri `Message`)
2. Bir adet `Button` (`StartButton`)
3. Bir zamanlayıcı için `Timer` (`MessageTimer` adında)

Sahneyi `hud.tscn` olarak kaydedin.

## 2. Arayüz Görsel Ayarları ve Fontlar

Arayüz elemanlarında `ttf` formatında kendi fontlarımızı atayabiliriz. Bu projede Xolonium fontunu kullanıyoruz. ([https://www.dafont.com/xolonium.font](https://www.dafont.com/xolonium.font)) Fontu indirip proje klasörüne koymanız gerekir.

Her etiketin Inspector (Sağ) paneline gidin, **Theme Overrides -> Fonts** kısmından font dosyanızı "Load" diyerek yükleyin ve yine Theme Overrides altındaki **Font Sizes**'ı `64` yapın.

- **ScoreLabel:** Metne "0" girin. Horizontal ve Vertical Alignment ayarlarını Center (Orta) yapın. Üst çubuktaki "Anchor Preset" (Çıpa) aracıyla "Center Top" (Üst Orta) olarak hizalayın.
- **Message Label:** Metne "Dodge the Creeps!" yazın, Autowrap Mode ayarını "Word" yaparak satır atlamasını sağlayın, Layout kısmında Size X'i 480 vererek ortalayın (Anchor=Center).
- **StartButton:** Anchor ayarını Center Bottom (Alt Orta) yapıp, position Y eksenini 580'e oturtun. Daha tok görünmesi için Size kutularına 200x100 yazabilirsiniz.

![Font Yükleme](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhywkkpWOxy-FBflzOQWikOQ_YJfUoNQCg_nLHLULtFRAyD-BYD7kxAqbDILYwDZvP-W4mrKrZv-LwdjwkvETlXpx2GA2hN18RCMJHWQ7l6IC_RvUzRUMkzJzfNgaFFjSP3QBKAqVQrCuUKZG9GGW0siCo4zHEzJUab_jiT9fYUSEsTTwVDTdaLX1Lt1w/s320/custom_font_load_font.webp)

![Font Boyutu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgnidWq0fBek72WKd-6NyOwVekidIMt96oXp2ABWqLMJtOG1gSKnl0cyjiro6lmAp9IPLXMlQ9PQ2AG0_yjB98N2Zb-EFg4kcDCTunbzoUq5FirrrlCYR-zMbdBuWuVbs5FhpK3SLkWutzQ2Rl28gh_zP0PIS6xn002zUK4dJjH5yG3rd0JP-9hyphenhyphennvDyQ/s1600/custom_font_size.webp)

## 3. HUD Yazılımları

HUD üzerinden mesaj yollamak, skoru yenilemek ve butonu kontrol etmek için `hud.gd` scripti yaratın. Bunun için HUD kök düğümüne sağ tıklayıp "Attach Script" seçin. Eğer Start butonuna basılırsa dışarıya yollanması (emit) için bir özel sinyal oluşturmalıyız.

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
```

**Kod Açıklaması:**

- `extends CanvasLayer`: Bu HUD scriptinin, sahne objelerinin üzerine çizen CanvasLayer türünden olduğunu belirtir.
- `signal start_game`: "Başlama tuşuna basıldı" bilgisini Main sahnesine iletmek için özel sinyal tanımlar.
- `show_message(text)`: Ekrana kısa süreli bildirimler basmak için yazılmış özel fonksiyondur. Metni yazar, label'ı gösterir ve geri sayımı başlatır.
- `await $MessageTimer.timeout`: Fonksiyonun bir alt satıra geçmeden önce `MessageTimer` süresinin bitmesini beklemesini söyler. Gecikme işlemlerinde hayat kurtarır.
- `await get_tree().create_timer(1.0).timeout`: Sahnemde hazır bir timer düğümü yoksa, sadece o an için 1 saniyelik geçici bir zamanlayıcı yaratır ve bitmesini bekler.
- `str(score)`: Gelen skor değeri bir sayı (Integer) tipindedir ancak etiketler (Label) sadece metin (String) yazar. `str()` komutuyla bu sayıyı metne dönüştürür.
- `start_game.emit()`: Butona basıldığında butonu saklayıp ardından dışarıya özel tanımladığımız `start_game` sinyalini ateşler.

## 4. Bağlantı Zamanı!

HUD sahnemizi bitirdik. Şimdi `main.tscn` içerisine `player.tscn`'yi getirdiğimiz gibi HUD sahnesini Instance (Zincir butonu) ederek getirelim.

Sonra HUD objesini seçip sağdaki **Node > Signals** kısmından kendi hazırladığımız `start_game` sinyaline çift tıklayarak Main scriptindeki mevcut `new_game()` fonksiyonuna bağlayalım! Neden? Çünkü StartButton'a basıldığında oyunun `new_game` döngüsü devreye girmeli. (Start tuşumuz olduğuna göre Main scriptin `_ready` bölümündeki `new_game()` denemesini silin, yoksa Start diyemeden oyun başlar!)

Main içindeki skor yenilemelerini ve sinyal iletişimini de aşağıdaki gibi tamamlayın:

```gdscript
func new_game():
    # ... Önceki yazılan kodlar
    $HUD.update_score(score)
    $HUD.show_message("Get Ready")

func game_over():
    # ... Önceki yazılan kodlar
    $HUD.show_game_over()

func _on_score_timer_timeout():
    # score += 1
    $HUD.update_score(score)
```

**Kod Açıklaması:**

- `$HUD.update_score(score)`: Main sahnesinden HUD'a o anki skoru gönderir ve arayüzü günceller.
- `$HUD.show_message(...)`: Ekrandaki etiketi doğrudan yazmak yerine, HUD içinde tanımladığımız fonksiyona "Get Ready" veya benzeri metinleri yollayarak onun halletmesini sağlar.

**Temizlik Önemlidir (Groups Kullanımı):**

Yeni bir oyun başlatsak bile eski düşmanlar sahnede süzülmeye devam eder. Her yeni oyunda sahneyi düşmanlardan temizlememiz lazım. Mob sahnesine gidin, Node sekmesinin hemen solundaki **Groups** (Gruplar) sekmesini açın ve "mobs" adında grubunuzu yaratın. Artık üretilen her düşman klonu bu grubun üyesidir.

Bir gruba hitap etmek için Node aramamıza gerek yok. Main scriptindeki `new_game` içerisine şu kodu ekleyin:

`get_tree().call_group("mobs", "queue_free")` (Sahnede kim "mobs" grubundaysa `queue_free` yani ölme emrini yolla demektir!)

![Groups Sekmesi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhVhGbUAYdeN-SzScS9-E-ShYQA3H8nOg-MlZQ2cUoGWNi1AywVtYsKTRocIo1R9ySX6fUCSD8qA22O2x-m5QErypMgxMLXjgb5rn5wtyiH2fwxtDBxU2lC5HktYPLv35KnJAg7S9ky4Ccv3gqy0tivV4MkxMrHtzVc2UHKBQ2I1Hwh5V-eCE2JgKTynA/s1600/group_tab.webp)

## 5. Ses Efektleri, Arkaplan Rengi ve Oyun Tamam!

Arkaplan için `Main` düğümüne çocuk olarak `ColorRect` atın ve listelendiğinde diğer düğümlerden en üstte durduğuna emin olun çünkü arkada olması gerekir! Rengini inspector'dan değiştirebilir ve Anchor'ı "Full Rect" yapabilirsiniz.

Ses için Main düğümüne iki adet `AudioStreamPlayer` yükleyin: isimleri `Music` ve `DeathSound`. Müzik dosyalarını ekleyin. Müziğin sonsuz döngüde ("Loop") olması için dosyaya sağ tık "Make Unique" deyin ve Stream altındaki ticki açın.

Ve işte son satırlar! Seslerin çalması için `main.gd` içindeki yerlerine eklentileri yapın:

```gdscript
func new_game():
    $Music.play()

func game_over():
    $Music.stop()
    $DeathSound.play()
```

**Kod Açıklaması:**

- `$Music.play()`: Yeni oyun başladığında müzik dosyasını en baştan oynatmaya başlar.
- `$Music.stop()`: Oyuncu düşmana çarpıp `game_over` olduğunda arkaplan müziğini anında keser.
- `$DeathSound.play()`: Müzik durduğu saniye "Ölüm" ses efektini anlık olarak tek sefer çalar.

> **Not:** Ses dosyası olarak wav, mp3 veya ogg kullanabilirsiniz. Zevkinize göre istediğiniz müzik ve efekti proje klasörüne koyup kullanabilirsiniz.

İşte hepsi bu! 2D alanında kusursuz mini bir eğitim oyununu baştan sona yazdınız. Kendinizi tebrik edebilirsiniz. Bir sonraki bölümde buluşuncaya dek Godot Engine dünyasında güzel yolculuklar!
