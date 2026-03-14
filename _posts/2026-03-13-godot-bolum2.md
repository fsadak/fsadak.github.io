---
title: "Godot Engine Eğitim Serisi - Bölüm 2: Node'lar ve Sahneler: İlk Sahneyi Oluşturalım"
date: 2026-03-13 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, 2d, hud, canvaslayer, ui, ses]
permalink: /godot-egitim-serisi-bolum-2/
published: true
---

Daha önce Godot'nun temel yapı taşlarına genel bir bakış atmıştık. Şimdi biraz daha derine inme ve **ilk sahnemizi oluşturma** zamanı. Bu yazıda node'ların ve sahnelerin ne olduğunu pekiştireceğiz, ardından adım adım ilk Godot sahnemizi birlikte oluşturacağız.

---

## Node Nedir?

Node'lar oyunun **temel yapı taşlarıdır** — tıpkı bir tarifin malzemeleri gibi. Onlarca farklı türde node vardır: ekranda görüntü çizen, ses çalayan, kamerayı temsil eden ve çok daha fazlasını yapan node türleri mevcuttur.

Tüm node'ların şu ortak özellikleri vardır:

- Bir **ismi** vardır
- **Düzenlenebilir özelliklere** (properties) sahiptir
- Her **kare (frame)** güncellenmek için geri çağrı (callback) alırlar
- Yeni özellikler ve fonksiyonlarla **genişletilebilirler**
- Başka bir node'un **alt öğesi (child)** olarak eklenebilirler

![Node Türleri Listesi](/assets/images/nodes_and_scenes_nodes.webp)
*Godot'nun sunduğu node türlerinden bazıları — liste oldukça uzun!*

Bu son özellik çok önemli: Node'lar bir araya gelerek **ağaç (tree)** yapısı oluşturur. Farklı görevlere sahip node'ları birleştirerek karmaşık davranışlar elde edebilirsiniz.

Örneğin oynatılabilir bir karakter şu node'lardan oluşabilir:

- `CharacterBody2D` — fizik ve hareket
- `Sprite2D` — karakterin görseli
- `Camera2D` — karakteri takip eden kamera
- `CollisionShape2D` — çarpışma alanı

![Karakter Node Yapısı](/assets/images/nodes_and_scenes_character_nodes.webp)
*Bir oyuncu karakterini oluşturan node ağacı*

---

## Sahne Nedir?

Node'ları bir ağaç yapısında düzenlediğinizde — tıpkı yukarıdaki karakter örneğinde olduğu gibi — buna **sahne (scene)** denir.

Bir sahne kaydedildiğinde editörde yeni bir node türü gibi davranır. Başka bir node'un alt öğesi olarak ekleyebilirsiniz; editörde iç yapısı gizlenerek tek bir node olarak görünür.

Sahneler şu ek özelliklere sahiptir:

- Her zaman **tek bir kök node'u (root node)** vardır
- Yerel diske **kaydedilebilir** ve sonradan yüklenebilir
- **İstediğin kadar örnek (instance)** oluşturabilirsiniz — Character sahneninden on farklı karakter yaratabilirsiniz

![3D Sahne Örneği](/assets/images/nodes_and_scenes_3d_scene_example.webp)
*Sahneler iç içe geçerek büyük ve karmaşık oyun dünyaları oluşturur*

Godot editörü özünde bir **sahne editörüdür**. 2D, 3D ve kullanıcı arayüzü için zengin araçlar sunar. Bir Godot projesi istediğin kadar sahne içerebilir; ancak motorun başlatmak için **tek bir ana sahneye (main scene)** ihtiyacı vardır.

---

## İlk Sahneyi Oluşturalım

Yeterince teori! Şimdi pratiğe geçelim ve ilk sahnemizi birlikte oluşturalım.

> Bunun için önce yeni bir Godot projesi oluşturmanız gerekiyor. Projeyi açtıktan sonra aşağıdaki adımları takip edebilirsiniz.

### Adım 1: Boş Editörü Tanı

Projeyi açtığınızda boş bir editörle karşılaşırsınız. Sol taraftaki **Scene doku** kök node hızlıca eklemek için birkaç seçenek sunar:

![Boş Editör Görünümü](/assets/images/nodes_and_scenes_01_empty_editor.webp)
*Yeni projeyi açtığınızda sizi boş bir editör karşılar*

![Scene Doku Seçenekleri](/assets/images/nodes_and_scenes_02_scene_dock.webp)
*Scene doku — kök node eklemek için hızlı seçenekler sunar*

Scene doku'daki seçenekler:

- **2D Scene** → `Node2D` ekler
- **3D Scene** → `Node3D` ekler
- **User Interface** → `Control` ekler
- **Other Node** → istediğin herhangi bir node'u seçmeni sağlar

Bu presetler sadece kolaylık için var; zorunlu değil.

### Adım 2: Label Node Ekle

Sahneye bir **Label** node'u ekleyeceğiz. Label'ın görevi ekrana metin çizmektir.

Scene doku'daki **"Add Child Node"** butonuna ya da **"Other Node"** seçeneğine tıklayın. **Create New Node** penceresi açılır:

![Node Oluşturma Penceresi](/assets/images/nodes_and_scenes_03_create_node_window.webp)
*Create New Node penceresi — yüzlerce node türü arasından seçim yapabilirsiniz*

Arama kutusuna `Label` yazıp, listede filtreleyin. **Label** node'una tıklayın ve pencerenin altındaki **Create** butonuna basın.

![Label Node Seçimi](/assets/images/nodes_and_scenes_04_create_label_window.webp)
*Label node'unu seçip Create'e tıklıyoruz*

### Adım 3: Sahneyi İncele

Label node'u eklediğinizde birkaç şey aynı anda gerçekleşir:

- Editör **2D çalışma alanına** geçer (çünkü Label bir 2D node'udur)
- Label, viewport'un sol üst köşesinde **seçili olarak** belirir
- Sol taraftaki **Scene doku**'nda node görünür
- Sağ taraftaki **Inspector doku**'nda node'un özellikleri listelenir

![Label Eklenmiş Editör](/assets/images/nodes_and_scenes_05_editor_with_label.webp)
*Label node'u eklendikten sonra editör bu hâle gelir*

### Adım 4: Text Özelliğini Değiştir

Şimdi Label'ın **Text** özelliğini değiştireceğiz. Sağdaki **Inspector doku**'na git, `Text` alanını bulun ve içine `Hello World` yazın.

Yazdıkça metnin viewport'ta belirdiğini göreceksiniz.

![Label Text Özelliği](/assets/images/nodes_and_scenes_06_label_text.webp)
*Inspector'da Text özelliğine "Hello World" yazıyoruz*

> **İpucu:** Inspector'da listelenen herhangi bir özelliği bu şekilde düzenleyebilirsiniz. Text sadece başlangıç için iyi bir örnek.

### Adım 5: Label'ı Ortaya Taşı

Araç çubuğundan **taşıma (move) aracını** seçerek Label'ı viewport'ta istediğiniz yere sürükleyebilirsiniz. Onu görünür dikdörtgenin ortasına taşıyın.

![Taşıma Aracı](/assets/images/nodes_and_scenes_07_move_tool.webp)
*Taşıma aracıyla Label'ı viewport'un ortasına konumlandırıyoruz*

Editörde sahne bu şekilde görünmeli:

![Hello World Metni Viewport'ta](/assets/images/nodes_and_scenes_08_hello_world_text.webp)
*"Hello World" metni viewport'ta ortada konumlandırılmış hâlde*

---

## Sahneyi Çalıştır

Her şey hazır! Sahneyi çalıştırma zamanı.

Ekranın sağ üst köşesindeki **Run Current Scene** butonuna tıklayın ya da **F6** tuşuna basın.

![Sahne Çalıştırma Butonu](/assets/images/nodes_and_scenes_09_play_scene_button.webp)
*"Run Current Scene" butonu — sahneyi test etmek için kullanılır*

Çalıştırmadan önce sahneyi kaydetmeniz gerektiğini söyleyen bir pencere açılacak. **Save** butonuna tıklayın ve dosyayı `label.tscn` olarak kaydedin.

![Sahneyi Kaydetme Penceresi](/assets/images/nodes_and_scenes_10_save_scene_as.webp)
*Sahneyi kaydetmeden çalıştıramazsın — `label.tscn` olarak kaydediyoruz*

> **Not:** Godot'nun dosya diyaloğu yalnızca proje klasörü içine kaydetmenize izin verir. Üstteki `res://` yolu projenin kök dizinini temsil eder ve "resource path" (kaynak yolu) anlamına gelir.

Uygulama yeni bir pencerede açılır ve ekranda `Hello World` metnini göstermelidir. Pencereyi kapatın ya da **F8** tuşuna basarak çalışan sahneden çıkın.

![Çalışan Sahnenin Sonucu](/assets/images/nodes_and_scenes_11_final_result.webp)
*İlk Godot sahnesi başarıyla çalışıyor — "Hello World!" ekranda görünüyor 🎉*

---

## Ana Sahneyi Ayarla

Test için **Run Current Scene** butonunu kullandık. Yanındaki **Run Project** butonu ise projenin **ana sahnesini** ayarlayıp çalıştırmanızı sağlar. Bunun için **F5** kısayolunu da kullanabilirsiniz.

![Run Project Butonu](/assets/images/nodes_and_scenes_12_play_button.webp)
*"Run Project" butonu — projenin ana sahnesini başlatır*

> **Dikkat:** "Run Current Scene" ile "Run Project" farklı şeylerdir. Beklenmedik bir davranışla karşılaşırsanız hangi butona bastığınızı kontrol edin.

Butona ilk kez tıkladığınızda ana sahneyi seçmenizi isteyen bir pencere açılır:

![Ana Sahne Seçim Popup'ı](/assets/images/nodes_and_scenes_13_main_scene_popup.webp)
*Ana sahne ilk kez ayarlanıyor*

**Select** butonuna tıklayın ve açılan dosya diyaloğunda `label.tscn` dosyasına çift tıklayın:

![Ana Sahne Dosya Seçimi](/assets/images/nodes_and_scenes_14_select_main_scene.webp)
*`label.tscn` dosyasını ana sahne olarak seçiyoruz*

Artık projeyi her çalıştırdığınızda Godot bu sahneyi başlangıç noktası olarak kullanacak.

> **Not:** Ana sahnenin yolu `project.godot` dosyasına kaydedilir. Bu dosyayı doğrudan düzenleyebilir ya da `Project > Project Settings` menüsünden değiştirebilirsiniz.

---

## Özet

Bu bölümde şunları yaptık:

- Node'ların ve sahnelerin ne olduğunu pekiştirdik
- Boş bir projede ilk node'umuzu (**Label**) ekledik
- Inspector'dan node özelliğini (**Text**) düzenledik
- Sahneyi kaydettik ve çalıştırdık
- Projenin ana sahnesini ayarladık

| Kavram | Açıklama |
|---|---|
| **Node** | Oyunun en küçük yapı taşı, belirli bir görevi var |
| **Sahne (Scene)** | Node ağacından oluşan, kaydedilebilir ve tekrar kullanılabilir birim |
| **Inspector** | Seçili node'un özelliklerini düzenlediğin panel |
| **Run Current Scene** | Sadece açık sahneyi çalıştırır (F6) |
| **Run Project** | Ana sahneyi başlatır (F5) |

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='iC5vizYDzeY' %}

---

## Sıradaki Adım

İlk sahnemizi başarıyla oluşturduk! Bir sonraki bölümde **sahne örneklemesi (scene instancing)** konusunu ele alacağız — bir sahneyi birden fazla kez nasıl kullanırsınız? Bu, Godot'nun en güçlü özelliklerinden biri.

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html) esas alınarak Türkçe olarak hazırlanmıştır.*
