---
title: "Godot Engine Eğitim Serisi - Bölüm 1.4: Godot Editörüne İlk Bakış: Arayüzü Tanıyalım"
date: 2026-03-12 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, signals, sinyaller, gdscript, node]
permalink: /godot-egitim-serisi-bolum-1_4/
published: true
---

Godot'yu ilk kez açtığında karşına pek çok panel, buton ve sekme çıkabilir. "Nereden başlayacağım?" diye düşünmek çok normal — hepimiz oradaydık. Bu yazıda editörün temel alanlarını ve doklarını tanıyacak, kendini rahat hissedene kadar her şeyi birlikte gezeceğiz.

---

## Proje Yöneticisi (Project Manager)

Godot'yu başlattığında karşına ilk çıkan pencere **Proje Yöneticisi**'dir.

![Godot Proje Yöneticisi](/assets/images/editor_intro_project_manager.webp)
*Godot'yu ilk açtığında bu ekranla karşılaşırsın*

Varsayılan **Projects** sekmesinde şunları yapabilirsin:

- Mevcut projeleri yönetmek
- Yeni proje oluşturmak
- Dışarıdan proje içe aktarmak (import)

Pencerenin üst kısmında bir de **Asset Library** sekmesi bulunur. Bu sekmeye ilk gittiğinde **"Go Online"** butonu göreceksin. Godot, gizlilik nedeniyle varsayılan olarak internete bağlanmaz. Bu butona tıklayarak ağ modunu çevrimiçi yapabilirsin.

Çevrimiçi moda geçtikten sonra topluluk tarafından geliştirilen demo projelerini ve varlıkları açık kaynak kütüphanesinden arayıp indirebilirsin:

![Asset Library Sekme Görünümü](/assets/images/editor_intro_project_templates.webp)
*Asset Library'de topluluk projeleri ve şablonları bulabilirsin*

### Proje Yöneticisi Ayarları

**Settings** menüsünden Proje Yöneticisi ayarlarına ulaşabilirsin:

![Proje Yöneticisi Ayarları](/assets/images/editor_intro_settings.webp)
*Ayarlar menüsünden dil, tema ve ağ modunu değiştirebilirsin*

Buradan değiştirebileceklerin:
- Editör dili (varsayılan olarak sistem dilini kullanır)
- Arayüz teması
- Görüntü ölçeği
- Ağ modu
- Dizin adlandırma kuralı

---

## Godot Editörüne İlk Bakış

Yeni ya da mevcut bir projeyi açtığında editör arayüzü karşına çıkar. Gelin ana alanları birlikte inceleyelim:

![Godot Editörü Genel Görünüm](/assets/images/editor_intro_editor_empty.webp)
*Godot editörünün boş hâli — her şey burada seni bekliyor*

---

## Üst Menü Çubuğu

Pencerenin üst kenarında soldan sağa şunlar yer alır:

- **Sol:** Ana menü
- **Orta:** Çalışma alanı geçiş butonları (aktif olan vurgulanmış olarak görünür)
- **Sağ:** Oyun test etme (playtest) butonları ve Movie Maker Modu

![Üst Menü Çubuğu](/assets/images/editor_intro_top_menus.webp)
*Üst menü — menüler, çalışma alanları ve oynatma kontrolleri burada*

---

## Sahne Sekmesi ve Dikkat Dağıtmaz Mod

Çalışma alanı butonlarının hemen altında açık sahneler sekme olarak görünür. Sekmelerin yanındaki **(+)** butonu projeye yeni sahne ekler. En sağdaki buton ise **dikkat dağıtmaz modu (distraction-free mode)** açıp kapatır — bu mod, doklarını gizleyerek görüntü alanını maksimuma çıkarır.

![Sahne Sekmesi Görünümü](/assets/images/editor_intro_scene_selector.webp)
*Sahne sekmeleri ve dikkat dağıtmaz mod butonu*

---

## Görüntü Alanı (Viewport) ve Araç Çubuğu

Pencerenin ortasında, sahne seçicinin altında **görüntü alanı (viewport)** yer alır. Üstündeki araç çubuğunda sahnedeki node'ları taşıma, ölçekleme veya kilitleme araçları bulunur.

Aşağıda aktif olan **3D çalışma alanının** görüntü alanını görebilirsin:

![3D Viewport Görünümü](/assets/images/editor_intro_3d_viewport.webp)
*3D viewport — sahneni burada inşa edersin*

Araç çubuğu içeriği seçilen node'a ve bağlama göre değişir. İşte **2D araç çubuğu**:

![2D Araç Çubuğu](/assets/images/editor_intro_toolbar_2d.webp)

Ve **3D araç çubuğu**:

![3D Araç Çubuğu](/assets/images/editor_intro_toolbar_3d.webp)

---

## Doklar (Docks)

Görüntü alanının iki yanında **doklar** bulunur. Bunlar editördeki en sık kullandığın panellerdir.

### FileSystem Doku

Projenin dosyalarını listeler: script'ler, görseller, ses dosyaları ve daha fazlası.

![FileSystem Doku](/assets/images/editor_intro_filesystem_dock.webp)
*FileSystem doku — tüm proje dosyaların burada*

### Scene Doku

Aktif sahnedeki node'ları ağaç yapısında gösterir.

![Scene Doku](/assets/images/editor_intro_scene_dock.webp)
*Scene doku — sahnendeki node hiyerarşisini buradan yönetirsin*

### Inspector Doku

Seçili node'un özelliklerini (properties) düzenlemeni sağlar. Bir node'a tıkladığında tüm ayarları burada belirir.

![Inspector Doku](/assets/images/editor_intro_inspector_dock.webp)
*Inspector doku — seçili node'un her özelliğini buradan değiştirebilirsin*

> 💡 **Not:** Doklar özelleştirilebilir; konumlarını ve boyutlarını ihtiyacına göre değiştirebilirsin.

---

## Alt Panel (Bottom Panel)

Pencerenin altında, viewport'un hemen altında **alt panel** bulunur. Burada şunlar yer alır:

- Hata ayıklama konsolu (debug console)
- Animasyon editörü
- Ses mikseri (audio mixer)
- Ve daha fazlası...

Değerli yer kapladıkları için varsayılan olarak kapalıdır. Birine tıkladığında dikey olarak açılır:

![Alt Panel Kapalı Hâl](/assets/images/editor_intro_bottom_panels.webp)
*Alt panel — ihtiyaç duyduğunda açılır, kullanmadığında gizlenir*

![Animasyon Editörü Açık](/assets/images/editor_intro_bottom_panel_animation.webp)
*Animasyon editörü açıkken alt panel böyle görünür*

---

## Beş Ana Ekran

Editörün üst kısmında ortalanmış **5 ana ekran butonu** bulunur: **2D, 3D, Script, Game** ve **Asset Library**.

### 2D Ekranı

Her tür oyun için kullandığın ekrandır. 2D oyunlara ek olarak kullanıcı arayüzlerini de burada tasarlarsın.

![2D Çalışma Alanı](/assets/images/editor_intro_workspace_2d.webp)
*2D ekranı — 2D oyunlar ve kullanıcı arayüzleri için*

### 3D Ekranı

Mesh'lerle, ışıklarla çalışıp 3D oyun seviyelerini tasarladığın ekrandır.

![3D Çalışma Alanı](/assets/images/editor_intro_workspace_3d.webp)
*3D ekranı — 3D dünya inşa etmek için*

### Game Ekranı

Projeyi editörden çalıştırdığında oyunun burada görünür. Gerçek zamanlı olarak test edebilir, duraklatabilir ve ince ayar yapabilirsin.

> ⚠️ **Dikkat:** Game ekranında yapılan değişiklikler oyun durdurulduğunda kaydedilmez. Bu ekran sadece test amaçlıdır.

![Game Çalışma Alanı](/assets/images/editor_intro_workspace_game.webp)
*Game ekranı — oyununu burada test edersin*

### Script Ekranı

Hata ayıklayıcı (debugger), zengin otomatik tamamlama (auto-completion) ve yerleşik kod referansıyla tam donanımlı bir kod editörüdür.

![Script Çalışma Alanı](/assets/images/editor_intro_workspace_script.webp)
*Script ekranı — kodlarını yazdığın yer*

### Asset Library

Projelerinde kullanabileceğin ücretsiz ve açık kaynaklı eklentiler, script'ler ve varlıkların bulunduğu kütüphane.

![Asset Library Çalışma Alanı](/assets/images/editor_intro_workspace_assetlib.webp)
*Asset Library — topluluğun hazırladığı varlıklara buradan ulaşırsın*

---

## Yerleşik Sınıf Referansı

Godot, içinde arama yapabileceğin kapsamlı bir **yerleşik sınıf referansı** sunar. Bir sınıf, metod, özellik, sabit veya sinyal hakkında bilgi almak için şu yollardan birini kullanabilirsin:

- Editörde herhangi bir yerde **F1** tuşuna basmak (macOS'ta Opt + Space)
- Script ekranının sağ üst köşesindeki **"Search Help"** butonuna tıklamak
- **Help > Search Help** menüsüne gitmek
- Script editöründe bir sınıf adına, fonksiyon adına veya yerleşik değişkene **Ctrl + Click** (macOS'ta Cmd + Click) yapmak

![Search Help Butonu](/assets/images/editor_intro_search_help_button.webp)
*Script ekranındaki "Search Help" butonu*

Bunlardan birini yaptığında bir arama penceresi açılır:

![Yardım Arama Penceresi](/assets/images/editor_intro_search_help.webp)
*Yardım arama penceresi — istediğin sınıfı veya metodu buradan bulabilirsin*

Bir öğeye çift tıklayarak Script ekranında ilgili dokümantasyon sayfasını açabilirsin. Script editöründe bir sınıf adına sağ tıklayarak **"Open Documentation"** seçeneğini de kullanabilirsin.

![Sınıf Referans Sayfası Örneği](/assets/images/editor_intro_help_class_animated_sprite.webp)
*AnimatedSprite2D sınıfının yerleşik dokümantasyon sayfası*

---

## Özet

| Alan | Görevi |
|---|---|
| **Proje Yöneticisi** | Projeleri oluştur, aç veya içe aktar |
| **Üst Menü** | Çalışma alanları arası geçiş ve oynatma kontrolleri |
| **Viewport** | Sahneyi görsel olarak düzenlediğin alan |
| **FileSystem Doku** | Tüm proje dosyalarına erişim |
| **Scene Doku** | Node hiyerarşisini yönetme |
| **Inspector Doku** | Seçili node'un özelliklerini düzenleme |
| **Alt Panel** | Animasyon editörü, konsol, ses mikseri |
| **5 Ana Ekran** | 2D, 3D, Script, Game, Asset Library |

---

## Sıradaki Adım

Artık editörün genel yapısına aşina oldun. Bir sonraki bölümde Godot'yu bilgisayarına kuracak ve ilk projeni oluşturacağız. Gerçek iş başlıyor! 🎮

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html) esas alınarak Türkçe olarak hazırlanmıştır.*
