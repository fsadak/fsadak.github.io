---
title: "Godot Engine Eğitim Serisi - Bölüm 1: Godot'a Giriş — Motor, Kavramlar, Editör ve Felsefe"
date: 2026-03-12 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, engine, giriş, başlangıç, oyun motoru, gdscript, node, scene, signals, editör]
permalink: /godot-egitim-serisi-bolum-1/
published: true
---

Sıfırdan başlayarak profesyonel düzeyde oyunlar geliştirmeyi öğreneceğimiz Godot Engine eğitim serimizin ilk bölümüne hoş geldiniz. Bu yazıda Godot'un ne olduğunu, temel kavramlarını, editör arayüzünü, tasarım felsefesini ve öğrenme kaynaklarını tek bir rehberde ele alacağız.

---

## Godot Nedir?

Godot, hem 2D hem de 3D oyun geliştirmek için tasarlanmış, genel amaçlı bir oyun motorudur. Geliştirdiğiniz oyunları ya da uygulamaları masaüstü, mobil ve web platformlarında yayınlayabilirsiniz. Konsol desteği de mevcut, ancak bunun için güçlü bir programlama alt yapısı gerektiğini belirtmem lazım.

> Konsollar hakkında daha fazla bilgi için [Godot'nun resmi web sitesini](https://godotengine.org) inceleyebilirsin.

---

## Godot ile Neler Yapıldı?

Godot, ilk olarak 2001 yılında Arjantinli bir oyun stüdyosu tarafından iç kullanım için geliştirildi. 2014'te açık kaynak olarak yayınlandıktan bu yana sürekli yeniden yazılıp geliştirildi.

Bu motorla geliştirilmiş oyunlara ve uygulamalara birkaç örnek:

- 🎮 **Cassette Beasts** — yaratıkları kasetlere dönüştürdüğün RPG
- 🎮 **PVKK: Planetenverteidigungskanonenkommandant** — top-down savaş oyunu
- 🎮 **Usagi Shima** — tavşan adası simülasyonu
- 🖼️ **Pixelorama** — açık kaynaklı piksel sanat çizim programı
- 🗺️ **RPG in a Box** — voxel RPG oluşturma aracı

Daha fazlasını görmek istersen Godot'nun resmi [Showcase sayfasına](https://godotengine.org/showcase/) göz atabilirsin.

![Usagi Shima oyununun ekran görüntüsü](/assets/images/introduction_usagi_shima.webp)
*Godot ile geliştirilmiş oyunlardan biri: Usagi Shima*

![Cassette Beasts oyununun ekran görüntüsü](/assets/images/introduction_cassette_beasts.webp)
*Cassette Beasts — Godot ile geliştirilmiş popüler bir RPG*

![PVKK oyununun ekran görüntüsü](/assets/images/introduction_pvkk.webp)
*PVKK: Planetenverteidigungskanonenkommandant*

![RPG in a Box uygulamasının ekran görüntüsü](/assets/images/introduction_rpg_in_a_box.webp)
*RPG in a Box — Godot ile yazılmış bir uygulama örneği*

---

## Programlama Dilleri: Hangisini Seçmeliyim?

Godot'da üç programlama seçeneği var:

### GDScript

Godot'ya özgü, Python'a benzer sözdizimiyle hafif ve öğrenmesi kolay bir dildir. Godot ile sıkı sıkıya entegre olduğu için performanslı çalışır. **Yeni başlayanlar için kesinlikle önerilen seçenektir.**

Neden GDScript ile başlamalısınız:

- **Godot için tasarlandı** — motorun yapısına doğal olarak uyum sağlar, gereksiz karmaşıklık yok
- **Sözdizimi sade ve okunabilir** — süslü parantez ormanına girmeniz gerekmiyor
- **Öğrenme hızı yüksek** — oyun yapmaya odaklanabilirsiniz
- **Girinti tabanlı sözdizimi**, `Vector` ve `Color` gibi oyun geliştirmeye özel **yerleşik tipler** ve statik dil kalitesinde **otomatik tamamlama** sunar

```gdscript
extends CharacterBody2D

const SPEED = 200.0

func _physics_process(delta):
    var direction = Input.get_axis("ui_left", "ui_right")
    velocity.x = direction * SPEED
    move_and_slide()
```

### C#

Oyun sektöründe yaygın olarak kullanılan, daha büyük ve karmaşık projelere uygun bir dildir. Daha önce Unity gibi bir motor kullandıysanız C# size tanıdık gelecektir. Performans odaklı kritik sistemler yazacaksanız da avantaj sağlayabilir.

Ama başlangıç için GDScript ile gidin. Sonradan C#'a geçmek isterseniz, kazandığınız programlama mantığı büyük ölçüde geçerli olacak.

### GDExtension

C++ ya da diğer dillerle (Rust, D, Haxe, Swift) yüksek performanslı algoritmalar veya oyun mekanikleri yazmanızı sağlar. Üstelik motoru yeniden derlemeye gerek yoktur. Üçüncü taraf kütüphaneleri ve SDK'ları Godot'ya entegre etmek için de kullanılabilir.

> Bir programcının birden fazla dil bilmesi son derece normaldir — hatta beklenendir. GDScript'le attığınız her adım, ileride farklı diller öğrenmenizi de kolaylaştıracak.

**Bu eğitim serisinde biz GDScript kullanacağız.**

---

## Temel Kavramlar: Node (Düğüm), Scene (Sahne), Scene Tree (Sahne Ağacı) ve Signal (Sinyal)

Her oyun motoru, oyunlarını oluştururken kullandığınız soyutlamalar etrafında döner. Godot'da bu modelin dört temel taşı var.

### Büyük Resim

Godot'da bir oyun, iç içe geçmiş sahnelerden oluşan bir ağaçtır. Bu sahneler node'lardan meydana gelir. Node'lar ise birbiriyle sinyal sistemi aracılığıyla konuşur.

![Godot Ana Menü Örneği](/assets/images/key_concepts_main_menu.webp)
*Bir oyunun ana menüsü bile sahneler ve node'lardan oluşur*

### Sahne (Scene) Nedir?

Godot'da oyununuzu **yeniden kullanılabilir sahnelere** bölebilirsiniz. Bir sahne şunlardan herhangi biri olabilir:

- Oyuncunun karakteri
- Bir silah
- Kullanıcı arayüzündeki bir menü
- Tek bir ev ya da oda
- Bir seviyenin tamamı

Godot'nun sahneleri, diğer motorlardaki hem **prefab** hem de **scene** kavramının rolünü üstlenirler. Sahneler iç içe geçebilir (nested) — bir karakter sahnesini alıp bir seviye sahnesinin içine yerleştirebilirsiniz ve istediğiniz kadar farklı seviyede kullanabilirsiniz.

![Godot Sahne Örneği](/assets/images/key_concepts_scene_example.webp)
*Sahneler iç içe yerleştirilebilir; karakter sahnesi seviye sahnesinin bir parçası olabilir*

#### Sahne Kompozisyonu ve Kalıtım

Sahneleri **birleştirebilir ya da iç içe geçirebilirsiniz**. Örneğin:

- Bir `BlinkingLight` (yanıp sönen ışık) sahnesi oluştur
- `BlinkingLight`'ı kullanan bir `BrokenLantern` (kırık fener) sahnesi oluştur
- Sonra bu `BrokenLantern`'larla dolu bir şehir yarat

Şimdi `BlinkingLight`'ın rengini değiştir ve kaydet — şehirdeki tüm `BrokenLantern`'lar anında güncellenir.

![Godot Tasarım Örneği 1](/assets/images/engine_design_01.png)
*Sahneler iç içe geçebilir; bir sahneyi değiştirmek, onu kullanan tüm sahneleri etkiler*

Ayrıca herhangi bir sahneden **kalıtım** alabilirsiniz. Örneğin `Character` adında bir temel karakter sahnesi oluşturup, ondan kalıtım alarak `Magician` (büyücü) sahnesi yapabilirsiniz. `Character` sahnesinde bir değişiklik yaptığınızda, `Magician` da otomatik olarak güncellenir.

![Godot Tasarım Örneği 2](/assets/images/engine_design_02.webp)
*Sahnelerden kalıtım almak, karakterler arasında ortak özellikleri kolayca paylaşmanızı sağlar*

### Node (Düğüm) Nedir?

Bir sahne, bir ya da daha fazla **node**'dan oluşur. Node'lar, oyununun en küçük yapı taşlarıdır. Bunları bir ağaç yapısında (tree) düzenlersiniz.

Bir karakter için örnek bir node yapısı:

- `CharacterBody2D` — **"Player"** olarak adlandırılmış, fizik ve hareketten sorumlu ana node
  - `Camera2D` — oyuncuyu takip eden kamera
  - `Sprite2D` — karakterin görseli
  - `CollisionShape2D` — çarpışma alanı

![Karakter Node Yapısı](/assets/images/key_concepts_character_nodes.webp)
*Bir karakter sahnesinin node yapısı — her node'un farklı bir sorumluluğu var*

> **Not:** Node isimlerinin sonundaki "2D" bu örneklerin 2D sahnelerine ait olduğunu gösterir. 3D sahnelerde aynı kavramlar "3D" son ekiyle gelir. Godot 4 ile birlikte eski "Spatial" yani uzay-zaman çizgisine sahip node'ları artık **"Node3D"** olarak adlandırılıyor.

Editörde bir sahneyi kaydettiğinizde, içindeki tüm node ağacı tek bir node gibi görünür. İç yapı gizlenir. Godot, binlerce farklı node türü içeren kapsamlı bir kütüphane sunar.

Node'lar bileşen (component) değildir — **birbirinden bağımsız** çalışır. Örneğin `Sprite2D`, aynı zamanda bir `Node2D`, bir `CanvasItem` ve bir `Node`'dur. Üç üst sınıfının tüm özelliklerini miras alır.

![Godot Node Menüsü](/assets/images/key_concepts_node_menu.webp)
*Godot'nun sahneye node ekleme menüsü — çok sayıda hazır node türü sizi bekliyor*

### Sahne Ağacı (Scene Tree) Nedir?

Oyunundaki tüm sahneler bir araya geldiğinde **sahne ağacını (scene tree)** oluştururlar. Teknik olarak bakıldığında, sahnelerin kendisi de node'lardan oluşan birer ağaçtır — yani scene tree devasa bir node ağacıdır.

Ama pratikte **sahne** bazında düşünmek çok daha kolaydır. Çünkü sahneler somut kavramları temsil eder: bir karakter, bir düşman, bir kapı, bir menü.

![Godot Sahne Ağacı](/assets/images/key_concepts_scene_tree.webp)
*Godot editöründe sahne ağacı — oyunun tüm yapısı burada görünür hale gelir*

### Sinyal (Signal) Nedir?

Node'lar belirli bir olay gerçekleştiğinde **sinyal yayarlar (emit)**. Bu sistem, tasarım dünyasındaki **Observer Pattern**'ın Godot'daki karşılığıdır. Node'ları birbiriyle kodda doğrudan bağlamak zorunda kalmadan haberdar edebilirsiniz.

Örneğin bir buton, tıklandığında `pressed` adlı bir sinyal yayar:

```gdscript
func _ready():
    $Button.pressed.connect(_on_button_pressed)

func _on_button_pressed():
    get_tree().change_scene_to_file("res://game.tscn")
```

Yerleşik sinyal örnekleri:

- İki nesnenin çarpışması
- Bir karakterin belirli bir alana girmesi veya çıkması
- Animasyonun bitmesi
- Zamanlayıcının (Timer) dolması

Bunlara ek olarak, oyununuzun ihtiyaçlarına özel **kendi sinyallerinizi** de tanımlayabilirsiniz. Bu, node'lar arasındaki bağımlılığı minimuma indirir ve kodunuzu modüler tutar.

![Godot Sinyal Sistemi](/assets/images/key_concepts_signals.webp)
*Godot editöründe sinyal bağlantıları — node'lar arası iletişim görsel olarak yönetilebilir*

### Dört Kavramın Özeti

| Kavram | Ne İşe Yarar? |
|---|---|
| **Node (Düğüm)** | Oyunun en küçük yapı taşı. Her node'un belirli bir görevi vardır. |
| **Sahne (Scene)** | Node'ların bir araya gelmesiyle oluşan, yeniden kullanılabilir birim. |
| **Sahne Ağacı (Scene Tree)** | Oyundaki tüm sahnelerin oluşturduğu bütünsel yapı. |
| **Sinyal (Signal)** | Node'ların olay bazlı iletişim kurma sistemi. |

---

## Godot Editörüne İlk Bakış

### Proje Yöneticisi (Project Manager)

Godot'yu başlattığınızda karşınıza ilk çıkan pencere **Proje Yöneticisi**'dir.

![Godot Proje Yöneticisi](/assets/images/editor_intro_project_manager.webp)
*Godot'yu ilk açtığınızda bu ekranla karşılaşırsınız*

Varsayılan **Projects** sekmesinde mevcut projeleri yönetebilir, yeni proje oluşturabilir veya dışarıdan proje içe aktarabilirsiniz.

Pencerenin üst kısmındaki **Asset Library** sekmesinde topluluk tarafından geliştirilen demo projeleri ve varlıkları indirebilirsiniz. Godot, gizlilik nedeniyle varsayılan olarak internete bağlanmaz — **"Go Online"** butonuyla çevrimiçi moda geçebilirsiniz.

![Asset Library Sekme Görünümü](/assets/images/editor_intro_project_templates.webp)
*Asset Library'de topluluk projeleri ve şablonları bulabilirsiniz*

**Settings** menüsünden editör dilini, arayüz temasını, görüntü ölçeğini ve ağ modunu değiştirebilirsiniz:

![Proje Yöneticisi Ayarları](/assets/images/editor_intro_settings.webp)
*Ayarlar menüsünden dil, tema ve ağ modunu değiştirebilirsiniz*

### Editör Arayüzü

Bir projeyi açtığınızda editör arayüzü karşınıza çıkar:

![Godot Editörü Genel Görünüm](/assets/images/editor_intro_editor_empty.webp)
*Godot editörünün boş hâli — her şey burada sizi bekliyor*

#### Üst Menü Çubuğu

Pencerenin üst kenarında soldan sağa: ana menü, çalışma alanı geçiş butonları ve oyun test etme (playtest) butonları yer alır.

![Üst Menü Çubuğu](/assets/images/editor_intro_top_menus.webp)
*Üst menü — menüler, çalışma alanları ve oynatma kontrolleri burada*

#### Sahne Sekmeleri

Çalışma alanı butonlarının altında açık sahneler sekme olarak görünür. Sekmelerin yanındaki **(+)** butonu yeni sahne ekler. En sağdaki buton **dikkat dağıtmaz modu (distraction-free mode)** açıp kapatır.

![Sahne Sekmesi Görünümü](/assets/images/editor_intro_scene_selector.webp)
*Sahne sekmeleri ve dikkat dağıtmaz mod butonu*

#### Görüntü Alanı (Viewport) ve Araç Çubuğu

Pencerenin ortasında **görüntü alanı (viewport)** yer alır. Üstündeki araç çubuğunda node'ları taşıma, ölçekleme veya kilitleme araçları bulunur. Araç çubuğu, seçilen node'a ve bağlama göre değişir.

![3D Viewport Görünümü](/assets/images/editor_intro_3d_viewport.webp)
*3D viewport — sahnenizi burada inşa edersiniz*

![2D Araç Çubuğu](/assets/images/editor_intro_toolbar_2d.webp)

![3D Araç Çubuğu](/assets/images/editor_intro_toolbar_3d.webp)

#### Paneller (Docks)

Görüntü alanının iki yanında en sık kullandığınız paneller bulunur:

**FileSystem Paneli** — Projenin dosyalarını listeler: script'ler, görseller, ses dosyaları ve daha fazlası.

![FileSystem Paneli](/assets/images/editor_intro_filesystem_dock.webp)
*FileSystem paneli — tüm proje dosyalarınız burada*

**Scene Paneli** — Aktif sahnedeki node'ları ağaç yapısında gösterir.

![Scene Paneli](/assets/images/editor_intro_scene_dock.webp)
*Scene paneli — sahnendeki node hiyerarşisini buradan yönetirsiniz*

**Inspector Paneli** — Seçili node'un özelliklerini (properties) düzenlemenizi sağlar.

![Inspector Paneli](/assets/images/editor_intro_inspector_dock.webp)
*Inspector paneli — seçili node'un her özelliğini buradan değiştirebilirsiniz*

> **Not:** Paneller özelleştirilebilir; konumlarını ve boyutlarını ihtiyacınıza göre değiştirebilirsiniz.

#### Alt Panel (Bottom Panel)

Viewport'un altında hata ayıklama konsolu, animasyon editörü, ses mikseri ve daha fazlası bulunur. Varsayılan olarak kapalıdır; birine tıkladığınızda açılır.

![Alt Panel Kapalı Hâl](/assets/images/editor_intro_bottom_panels.webp)
*Alt panel — ihtiyaç duyduğunuzda açılır, kullanmadığınızda gizlenir*

![Animasyon Editörü Açık](/assets/images/editor_intro_bottom_panel_animation.webp)
*Animasyon editörü açıkken alt panel böyle görünür*

### Beş Ana Ekran

Editörün üst kısmında **5 ana ekran butonu** bulunur: **2D, 3D, Script, Game** ve **Asset Library**.

**2D Ekranı** — 2D oyunlar ve kullanıcı arayüzleri için kullandığınız ekrandır.

![2D Çalışma Alanı](/assets/images/editor_intro_workspace_2d.webp)
*2D ekranı — 2D oyunlar ve kullanıcı arayüzleri için*

**3D Ekranı** — Kameralar, ışıklar ve 3D objelerle çalışıp 3D oyun seviyelerini tasarladığınız ekrandır.

![3D Çalışma Alanı](/assets/images/editor_intro_workspace_3d.webp)
*3D ekranı — 3D dünya inşa etmek için*

**Game Ekranı** — Projeyi editörden çalıştırdığınızda oyununuz burada görünür. Gerçek zamanlı olarak test edebilir, duraklatabilir ve ince ayar yapabilirsiniz.

> **Dikkat:** Game ekranında yapılan değişiklikler oyun durdurulduğunda kaydedilmez. Bu ekran sadece test amaçlıdır.

![Game Çalışma Alanı](/assets/images/editor_intro_workspace_game.webp)
*Game ekranı — oyununu burada test edersiniz*

**Script Ekranı** — Hata ayıklayıcı, zengin otomatik tamamlama ve yerleşik kod referansıyla tam donanımlı bir kod editörüdür.

![Script Çalışma Alanı](/assets/images/editor_intro_workspace_script.webp)
*Script ekranı — kodlarınızı yazdığınız yer*

**Asset Library** — Ücretsiz ve açık kaynaklı eklentiler, script'ler ve varlıkların bulunduğu kütüphane.

![Asset Library Çalışma Alanı](/assets/images/editor_intro_workspace_assetlib.webp)
*Asset Library — topluluğun hazırladığı varlıklara buradan ulaşırsınız*

### Yerleşik Sınıf Referansı

Godot, kapsamlı bir **yerleşik sınıf referansı** sunar. Erişim yolları:

- Editörde herhangi bir yerde **F1** tuşuna basmak
- Script ekranının sağ üst köşesindeki **"Search Help"** butonuna tıklamak
- **Help > Search Help** menüsüne gitmek
- Script editöründe bir sınıf adına, fonksiyon adına veya yerleşik değişkene **Ctrl + Click** yapmak

![Search Help Butonu](/assets/images/editor_intro_search_help_button.webp)
*Script ekranındaki "Search Help" butonu*

![Yardım Arama Penceresi](/assets/images/editor_intro_search_help.webp)
*Yardım arama penceresi — istediğiniz sınıfı veya metodu buradan bulabilirsiniz*

![Sınıf Referans Arama](/assets/images/manual_class_reference_search.webp)
*Editör içindeki sınıf referansı arama — tam ihtiyaç duyduğunuz anda yanı başınızda*

Bir sınıf referans sayfası size şunları söyler:

- **Kalıtım hiyerarşisi:** Sınıfın hangi üst sınıftan türediği
- **Sınıfın özeti:** Ne işe yaradığı ve kullanım senaryoları
- **Özellikler, metodlar, sinyaller, enum'lar ve sabitler:** Her birinin açıklaması
- **Manuel sayfalara bağlantılar:** Daha ayrıntılı ele alan sayfalara yönlendirme

![Sınıf Referans Sayfası Örneği](/assets/images/editor_intro_help_class_animated_sprite.webp)
*AnimatedSprite2D sınıfının yerleşik dokümantasyon sayfası*

![Sınıf Referans Kalıtım Hiyerarşisi](/assets/images/manual_class_reference_inheritance.webp)
*Bir sınıfın kalıtım hiyerarşisi — hangi özelliklerin nereden geldiğini buradan takip edebilirsiniz*

---

## Godot'nun Tasarım Felsefesi

### Her Şey Dahil Paket

Godot, en yaygın ihtiyaçları karşılamak için kendi araçlarını sunar: kod editörü, animasyon editörü, tilemap editörü, shader editörü, hata ayıklayıcı, profilleyici ve yerel/uzak cihazlarda **hot-reload**. Amaç, oyun geliştirmek için eksiksiz bir paket ve kesintisiz bir deneyim sunmaktır.

![Godot Editörünün genel görünümü](/assets/images/introduction_editor.webp)
*Godot editörü — kod, animasyon, sahne ve daha fazlası tek çatı altında*

Dışarıdan araç kullanmak isterseniz Godot buna da izin verir. Resmi olarak desteklenenler:

- **Blender** ile tasarlanmış 3D sahnelerin içe aktarılması
- **VSCode** ve **Emacs** ile GDScript ve C# yazmak için eklentiler
- **Visual Studio** ile Windows üzerinde C# geliştirme

![VSCode ile Godot entegrasyonu](/assets/images/introduction_vscode.png)
*VSCode üzerinden Godot ile kod yazabilirsiniz*

> **Uyarı:** 3D çalışma alanı, 2D'ye kıyasla daha az yerleşik araca sahip. Karmaşık karakter animasyonları veya arazi düzenleme gibi işler için harici programlara ya da eklentilere ihtiyaç duyabilirsiniz.

### Açık Kaynak (MIT Lisansı)

Godot, **MIT lisansı** altında tamamen açık kaynaklıdır:

- Kaynak kodunu ücretsiz indirebilir, kullanabilir, değiştirebilir ve paylaşabilirsiniz
- Lisans dosyası korunduğu sürece hiçbir kısıtlama yok
- Godot ile birlikte gelen tüm teknolojiler açık kaynak lisansıyla uyumlu olmak zorunda

Bu yüzden Google AdMob veya FMOD gibi özel araçlar motora dahil edilmez; bunlar üçüncü taraf eklentiler olarak kullanılabilir.

> **Önemli Not:** MIT lisansı, yaptığınız işi hiçbir şekilde etkilemez. Motora ya da Godot ile yaptığın şeylere herhangi bir hak iddiası yoktur. Kazandığınız para tamamen sizindir.

### Topluluk Odaklı

Godot, topluluğu tarafından, topluluk için ve tüm oyun yapımcıları için geliştirilir. Birkaç tam zamanlı çekirdek geliştirici olsa da, projenin binlerce katkıcısı bulunmaktadır. Gönüllü programcılar kendilerinin de ihtiyaç duyduğu özellikleri geliştirdiğinden, her büyük sürümde motorun farklı köşelerinde iyileştirmeler görürsünüz.

### Editör Bir Godot Oyunudur

Godot'nun en ilginç tasarım kararlarından biri: **editörün kendisi Godot motoruyla çalışır.** Editör, motorun kendi UI sistemini kullanır. Projeyi test ederken kod ve sahneleri **hot-reload** edebilir, hatta oyun kodunu editör içinde doğrudan çalıştırabilirsiniz.

**`@tool`** ek açıklamasını herhangi bir GDScript dosyasının başına eklerseniz, o kod editör içinde çalışır. Bu sayede import/export eklentileri, özel seviye editörleri ve editör scriptleri oluşturabilirsiniz.

![RPG in a Box uygulaması](/assets/images/introduction_rpg_in_a_box.webp)
*RPG in a Box, Godot ile yapılmış bir voxel RPG editörüdür — Godot'nun UI araçlarını node tabanlı programlama sistemi için kullanır*

### Ayrı 2D ve 3D Motorları

Godot, ayrı **2D ve 3D render motorları** sunar. Motorlar ayrı olsa da 3D ortamda 2D render edebilir, 2D ortamda 3D render edebilir ve 3D dünyanın üzerine 2D sprite ve arayüzler yerleştirebilirsiniz.

![Godot Tasarım Örneği 3](/assets/images/engine_design_03.png)
*2D ve 3D motorlar ayrı ama birlikte kullanılabilir*

Bu ayrımın avantajı: 2D projelerde gereksiz 3D hesaplama yükü olmaz; her ikisi de kendi alanında optimize çalışır.

---

## Kaynaklar ve Topluluk

### Resmi Kılavuz (User Manual)

Yeni bir konu öğrenmek istediğinizde:

- **Sol menüden** geniş konulara göz atabilirsiniz
- **Arama çubuğunu** kullanarak özgün sayfalara ulaşabilirsiniz
- Konu sayfaları genellikle ilgili diğer sayfalara bağlantı içerir

![Godot Dokümantasyon Arama](/assets/images/manual_search.png)
*Godot dokümantasyonunda arama çubuğuyla istediğiniz konuyu hızlıca bulabilirsiniz*

🔗 [Godot resmi dökümantasyon adresi](https://docs.godotengine.org/en/stable/)

### Programlama Temelleri

Godot dokümantasyonu programlama temellerini öğretmeyi hedeflemez. Eğer programlamaya yeni başlıyorsanız **Automate The Boring Stuff With Python** kitabını öneririm — Python tabanlı olmakla birlikte, genel programlama mantığını sağlam bir şekilde öğretir. GDScript Python'a benzediği için bu kitaptan edindiğiniz alışkanlıklar doğrudan işe yarar.

🔗 [automatetheboringstuff.com](https://automatetheboringstuff.com)

### Godot Forumu

Soru sormak ve daha önce sorulmuş cevapları bulmak için en iyi yer **resmi Godot Forumu**dur. Forum yanıtları arama motorlarında da çıktığı için topluluğun tamamına fayda sağlar.

🔗 [forum.godotengine.org](https://forum.godotengine.org)

### Etkili Soru Sormanın Sırları

İyi bir soru şunları içermelidir:

1. **Hedefinizi açıklayın** — Ne yapmaya çalıştığınızı anlatın
2. **Hata mesajının tamamını paylaşın** — Debugger panelinden kopyalayıp yapıştırın
3. **İlgili kod parçasını paylaşın** — Uzun dosyalar için [Pastebin](https://pastebin.com) kullanın
4. **Scene Dock'un ekran görüntüsünü ekleyin** — Bağlamı netleştirir
5. **Oyunundan video paylaşın** — [OBS Studio](https://obsproject.com) veya [ScreenToGIF](https://www.screentogif.com) kullanın
6. **Godot sürümünü belirtin** — Özellikler sürümden sürüme değişir

> **İpucu:** Kılavuzda veya sınıf referansında eksik bilgi bulursanız, [godot-docs GitHub deposuna](https://github.com/godotengine/godot-docs) Issue açarak bildirebilirsiniz.

### Topluluk Eğitimleri

Belirli oyun türlerine (RPG, platform, bulmaca) özel eğitimler için: [Tutorials and Resources](https://docs.godotengine.org/en/stable/community/tutorials.html)

---

## Genel Özet

| Özellik | Açıklama |
|---|---|
| **Fiyat** | Tamamen ücretsiz |
| **Lisans** | MIT (ticari kullanım serbestir) |
| **2D Desteği** | Mükemmel, kendine özgü motor |
| **3D Desteği** | Güçlü ve gelişmeye devam ediyor |
| **Script Dili** | GDScript, C#, GDExtension (C++) |
| **Platform Desteği** | Masaüstü, Mobil, Web, Konsol |
| **Editör** | Yerleşik, tam donanımlı — kod, animasyon, shader, debugger dahil |
| **Yapı Taşları** | Node, Scene, Scene Tree, Signal |
| **Topluluk** | Aktif, büyüyen ve açık kaynak odaklı |

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='DhBRf5KU_hM' %}

## Sıradaki Adım

Bu yazıda Godot'nun ne olduğunu, programlama dillerini, temel kavramlarını, editör arayüzünü, tasarım felsefesini ve öğrenme kaynaklarını ele aldık. **Giriş bölümü tamamlandı!**

Bir sonraki bölümde Godot'yu kuracak ve **ilk projemizi** oluşturmaya başlayacağız. Heyecanlı kısım başlıyor!

Görüşmek üzere...

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/) esas alınarak Türkçe olarak hazırlanmıştır.*
