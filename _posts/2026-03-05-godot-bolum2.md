---
title: "Godot Engine Eğitim Serisi - Bölüm 2: Godot’un Kalbi - Düğümler ve Sahneler"
date: 2026-03-05 12:00:00 +0300
categories: [Godot Eğitim Serisi, Godot Temelleri]
tags: [godot, nodes, scenes, scene tree, instancing, label]
image:
  path: /_images/nodes_and_scenes_nodes.webp
  alt: Godot Nodes ve Scenes Kavramları
---

# Godot Engine Eğitim Serisi - Bölüm 2: Godot’un Kalbi - Düğümler ve Sahneler

Herkese merhaba! Godot Engine eğitim serimizin ikinci bölümüne hoş geldiniz. Geçen bölümde Godot’un felsefesinden ve neden harika bir motor olduğundan bahsetmiştik. Bu bölümde ise Godot’un kalbine, motorun çalışma mantığının özüne iniyoruz: **Düğümler (Nodes)** ve **Sahneler (Scenes)** kavramlarını öğreneceğiz. Bu iki kavramı anladığınızda, Godot’da yapamayacağınız hiçbir şey kalmayacak!

### Düğümler (Nodes) Nedir?

Godot oyun motorunda her şeyin temel yapı taşı “Düğüm” yani İngilizce adıyla **Node**’dur. Onları bir yemeğin malzemeleri veya legonun parçaları gibi düşünebilirsiniz. Görsel göstermek, ses çalmak, kamerayı hareket ettirmek gibi aklınıza gelebilecek her türlü işlem için farklı bir düğüm çeşidi vardır.

![Düğümler Örneği](/_images/nodes_and_scenes_nodes.webp)

**Tüm düğümlerin ortak bazı özellikleri vardır:**

1. **İsimleri:** Her düğüme farklı bir isim verebiliriz.
2. **Düzenlenebilir özellikleri (Properties):** Boyut, renk, pozisyon gibi.
3. **Her karede (frame) çalışabilirler:** Oyun akarken saniyede 60 kez güncellenebilirler.
4. **Kod ile genişletilebilirler:** Kendi özelliklerimizi onlara ekleyebiliriz.
5. Ve en önemlisi: **Birbirlerinin çocuğu (Child) olabilirler!**

Son özellik çok kritik. Düğümler bir araya gelerek bir **Ağaç (Tree)** yapısı oluştururlar. Tıpkı gerçek bir ağacın dallanması gibi. Örneğin; oyun içindeki karakterinizi tasarlarken bir hareket düğümünü ana gövde yapar, resmini göstermek için bir Sprite düğümünü ona çocuk olarak bağlar ve çarpışmaları yönetmek için bir Collision (çarpışma) düğümü ekleyebilirsiniz.

![Karakter Düğümleri Şeması](/_images/nodes_and_scenes_character_nodes.webp)

### Sahneler (Scenes) Nedir?

Düğümleri mantıklı bir şekilde bir araya getirip grupladığımızda ortaya çıkan bu yapıya **Sahne (Scene)** diyoruz. Sahneleri kaydettiğinizde, sanki yepyeni bir “özel düğüm” yaratmış gibi olursunuz.

Örneğin, “Oyuncu” adında bir sahne yaratıp, bunu oyunun 5 farklı yerinde çoğaltarak kullanabilirsiniz (Instancing). Godot’nun editörü aslında başlı başına büyük bir "Sahne Editörü"dür.

![Sahne Örneği](/_images/nodes_and_scenes_3d_scene_example.webp)

**Sahnelerin temel kuralları şunlardır:**

* Her sahnenin sadece **BİR** tane kök (root) düğümü vardır. (Tüm diğer düğümler onun çocuğu veya torunudur).
* Bilgisayarınıza `.tscn` uzantısıyla kaydedilirler.
* Sahnelerden dilediğiniz kadar kopyalayıp (instance) çoğaltabilirsiniz.

Oyununuz birden fazla sahneden oluşabilir ancak motor, oyun açıldığında ilk olarak hangisini oynatması gerektiğini bilmelidir. Buna “Ana Sahne” (Main Scene) adını veriyoruz.

---

### Birlikte Yapalım: İlk Sahnemizi Oluşturuyoruz

Şimdi çok basit bir “Merhaba Dünya!” (Hello World) sahnesi yapalım.

1. Boş bir proje başlattığınızda editörün sol tarafında **Scene (Sahne) paneli** göreceksiniz.
2. Sahneyi başlatmak için bize kısa yollar sunar: “2D Scene”, “3D Scene” veya “User Interface”. Biz tamamen kendi özel düğümümüzü seçeceğimiz için **Other Node (Diğer Düğüm)** seçeneğine veya hemen üstteki “Add Child Node” (artı işareti) ikonuna tıklıyoruz.

![Boş Editör](/_images/nodes_and_scenes_01_empty_editor.webp)
![Sahne Paneli](/_images/nodes_and_scenes_02_scene_dock.webp)

3. Açılan büyük menü, Godot’daki tüm düğümlerin listesidir. Arama kısmına **Label** yazıyoruz ve seçip “Create” butonuna basıyoruz. Label düğümü ekrana yazı yazdırmamızı sağlar.

![Node Seçimi](/_images/nodes_and_scenes_03_create_node_window.webp)
![Label Oluşturma](/_images/nodes_and_scenes_04_create_label_window.webp)

4. Sağ taraftaki **Inspector (Denetçi) panelinde**, Label’ın özelliklerini görüyoruz. `Text` özelliğinin içine “Merhaba Dünya” (veya Hello World) yazalım.

![Label Text Özelliği](/_images/nodes_and_scenes_06_label_text.webp)

5. Yukarıdaki taşıma aracıyla yazıyı tutup ekranın ortasına getirebilirsiniz.

![Taşıma Aracı](/_images/nodes_and_scenes_07_move_tool.webp)
![Merhaba Dünya Yazısı](/_images/nodes_and_scenes_08_hello_world_text.webp)

---

### Oyunu Çalıştırmak ve Ana Sahne Ayarlamak

Artık her şey hazır! Ekranın sağ üst köşesindeki **Play (Current Scene / Mevcut Sahneyi Çalıştır)** butonuna basalım veya F6 tuşuna basalım.

![Sahneyi Oynat Butonu](/_images/nodes_and_scenes_09_play_scene_button.webp)

6. Bize henüz bu sahneyi kaydetmediğimizi söyleyecek. `Save` diyerek sahneyi **label.tscn** olarak kaydedelim. Karşımıza içinde “Merhaba Dünya” yazan oyun penceremiz açılacaktır! İstediğimizde pencereyi kapatıp veya F8 tuşuyla durdurabiliriz.

![Sahneyi Kaydet Penceresi](/_images/nodes_and_scenes_10_save_scene_as.webp)

**Ana Sahneyi Belirlemek:**

7. Sağ üstten **Run Project (Projeyi Çalıştır)** yani genel “Play” tuşuna (F5) bastığımızda, Godot “Lütfen bir Ana Sahne seç” (Please Select a Main Scene) diye bizden bir seçim isteyecektir. “Select” diyerek az önce kaydettiğimiz `label.tscn` dosyasını seçtiğimizde artık oyunumuzun ana menüsü/merkezi burası olur.

![Ana Sahne Seçim Uyarısı](/_images/nodes_and_scenes_13_main_scene_popup.webp)
![Ana Sahne Seçim Penceresi](/_images/nodes_and_scenes_14_select_main_scene.webp)

Tebrikler! Godot motorunda ilk sahnenizi oluşturdunuz ve Nodes ile Scenes kavramlarının çalışma mantığını çözdünüz. Gelecek dersimizde işleri biraz daha ileri taşıyıp yazdığımız bu yapıyı kodlamaya (scripting) ve kopyalamaya (instancing) geçeceğiz. Takipte kalın, görüşmek üzere!
