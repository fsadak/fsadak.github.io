---
title: "Godot Engine Eğitim Serisi - Bölüm 2: Godot'un Kalbi - Düğümler ve Sahneler"
date: 2026-03-05 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, node, scene, düğüm, sahne]
---

Herkese merhaba! Godot Engine eğitim serimizin ikinci bölümüne hoş geldiniz. Geçen bölümde Godot'un felsefesinden ve neden harika bir motor olduğundan bahsetmiştik. Bu bölümde ise Godot'un kalbine, motorun çalışma mantığının özüne iniyoruz: **Düğümler (Nodes)** ve **Sahneler (Scenes)** kavramlarını öğreneceğiz. Bu iki kavramı anladığınızda, Godot'da yapamayacağınız hiçbir şey kalmayacak!

## Düğümler (Nodes) Nedir?

Godot oyun motorunda her şeyin temel yapı taşı "Düğüm" yani İngilizce adıyla **Node**'dur. Onları bir yemeğin malzemeleri veya legonun parçaları gibi düşünebilirsiniz. Görsel göstermek, ses çalmak, kamerayı hareket ettirmek gibi aklınıza gelebilecek her türlü işlem için farklı bir düğüm çeşidi vardır.

![Godot Nodes](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgZkuhMjETXgjb7t4vZAKtclC_PwFC6RoYgEvmJdUimYMUqkM3tU6XH1N_hk5PR6RN2jZUqSGMMOlvfQv7qZsTzeabYfZPSeFbpRurIX75ik6KHrPitn7CzqQK4fDe4MhkWFSCIZ838d3mSBOgdIKKQ4_rY1W_mjrkIsZyc4dkmHLxQu849vWiAW5tkg/s389/nodes_and_scenes_nodes.webp)

**Tüm düğümlerin ortak bazı özellikleri vardır:**

1. **İsimleri:** Her düğüme farklı bir isim verebiliriz.
2. **Düzenlenebilir özellikleri (Properties):** Boyut, renk, pozisyon gibi.
3. **Her karede (frame) çalışabilirler:** Oyun akarken saniyede 60 kez güncellenebilirler.
4. **Kod ile genişletilebilirler:** Kendi özelliklerimizi onlara ekleyebiliriz.
5. Ve en önemlisi: **Birbirlerinin çocuğu (Child) olabilirler!**

Son özellik çok kritik. Düğümler bir araya gelerek bir **Ağaç (Tree)** yapısı oluştururlar. Tıpkı gerçek bir ağacın dallanması gibi. Örneğin; oyun içindeki karakterinizi tasarlarken bir hareket düğümünü ana gövde yapar, resmini göstermek için bir Sprite düğümünü ona çocuk olarak bağlar ve çarpışmaları yönetmek için bir Collision (çarpışma) düğümü ekleyebilirsiniz.

![Karakter Düğümleri](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj6PKwzjeaqx7qPRqeBXUl5hLG6aGZbRZJgqk00qu1VvJ0uqNSDTL3TS0_TL22Vz95lK5PC7zYg4vzf81ifjMoidIQ9Btmw1eG86A3LKnuU14Tri7L7KsS2Kv5iCyql9nPVOsgKlUQAwceheb5O_Uoc1l5eTCHtGXHUXbrHfs2iJWMcvs7HJxh5PxUWqw/s558/nodes_and_scenes_character_nodes.webp)

## Sahneler (Scenes) Nedir?

Düğümleri mantıklı bir şekilde bir araya getirip grupladığımızda ortaya çıkan bu yapıya **Sahne (Scene)** diyoruz. Sahneleri kaydettiğinizde, sanki yepyeni bir "özel düğüm" yaratmış gibi olursunuz.

Örneğin, "Oyuncu" adında bir sahne yaratıp, bunu oyunun 5 farklı yerinde çoğaltarak kullanabilirsiniz (Instancing). Godot'nun editörü aslında başlı başına büyük bir "Sahne Editörü"dür.

![3D Sahne Örneği](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBGak1QpEIRfHL5H14Cph5ETK8fME10aAf8CyRr2mvjguN_Yx0N8rqkesaoW2QN5AEmX4b58lXeeSxj5bY2y-Fm1eYisRWZj5JdGjP6D8M-T0ez8V2wE6qaduCYW7GU29olEWj_Yu5VNcDUBKXsStUIGEcsv1Vm13BBXq7uXEAa7Kcn6GLv9KoMGcETQ/s695/nodes_and_scenes_3d_scene_example.webp)

**Sahnelerin temel kuralları şunlardır:**

- Her sahnenin sadece **BİR** tane kök (root) düğümü vardır. (Tüm diğer düğümler onun çocuğu veya torunudur).
- Bilgisayarınıza **`.tscn`** uzantısıyla kaydedilirler.
- Sahnelerden dilediğiniz kadar kopyalayıp (instance) çoğaltabilirsiniz.

Oyununuz birden fazla sahneden oluşabilir ancak motor, oyun açıldığında ilk olarak hangisini oynatması gerektiğini bilmelidir. Buna "Ana Sahne" (Main Scene) adını veriyoruz.

---

## Birlikte Yapalım: İlk Sahnemizi Oluşturuyoruz

Şimdi çok basit bir "Merhaba Dünya!" (Hello World) sahnesi yapalım.

1. Boş bir proje başlattığınızda editörün sol tarafında **Scene (Sahne) paneli** göreceksiniz.

2. Sahneyi başlatmak için bize kısa yollar sunar: "2D Scene", "3D Scene" veya "User Interface". Biz tamamen kendi özel düğümümüzü seçeceğimiz için **Other Node (Diğer Düğüm)** seçeneğine veya hemen üstteki "Add Child Node" (artı işareti) ikonuna tıklıyoruz.

![Boş Editör](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNu_bc30Av4CSsx14XVBqIrkLXYXPdQxWef5PijzC1h8nfo4D64LZ0v8kdsAUtswLXnQ1aA_Ja9ALDWSMC6ZfdeM9932tuuwSwr6MGMU5keAOexqWzqUF3q0kCj3YZWxi-3yPoPfUBQkYWTYSDwNRVAFfrmcDMd56aMi-JiXX9LHiuWkUPYhsSdlH7zQ/s1320/nodes_and_scenes_01_empty_editor.webp)

![Scene Dock](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh99sX_tXK9aqs63qpAhVQoD2xAi6LoJp66bajf4_Q75b9RbVZ0xv9bzorROcr9jdSrdAtrfOMFtaplV1yvnOVi1-8zwNz1oX5MjLYtiGGwCOG-mdK8TcvVbzI-jm_wUVhyphenhyphenHfsidGHnYCuPRWPvBALzAT0DEsG6IpOuAQZiXpnzOVIdthwcFhItj6RvaQ/s280/nodes_and_scenes_02_scene_dock.webp)

3. Açılan büyük menü, Godot'daki tüm düğümlerin listesidir. Arama kısmına **Label** yazıyoruz ve seçip "Create" butonuna basıyoruz. Label düğümü ekrana yazı yazdırmamızı sağlar.

![Düğüm Oluşturma Penceresi](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgKDt44MnPr9QdiH-AWTmisQ179DDVyxy-rBL3b-fdKNhSytTAFDpIU4k6-IXvHVrwi1k-0jtTfI-1YYBUgBulyK1nFWti0iAfUhZhzlYApTjNohbUsoOjbFQenp9bVmcV32x2wSq9lbZ54AbqFPuQWow_RixYiQhq8OSFgHA25XjaICY9p3IW91rfeAQ/s900/nodes_and_scenes_03_create_node_window.webp)

![Label Oluşturma](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAhtY94Eh8gPELEesEwgpyjGO9nAtpApPXJ-sQt8tBykV_LdnGbMUoKE0ZeuPrHoyigj4mToGaq5n8fyssXVRsbm08UHwpQIUPVnQvoUIK3rMEm55xiD2Y6ldZuhOsdr95n_CtX_AbRJ7wBs2zUHwyN9Yu6QRMddkiv7Uqi6i0gvWo1SZV4y2YfQqduQ/s900/nodes_and_scenes_04_create_label_window.webp)

4. Sağ taraftaki **Inspector (Denetçi) panelinde**, Label'ın özelliklerini görüyoruz. `Text` özelliğinin içine "Merhaba Dünya" (veya Hello World) yazalım.

![Label Text](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEho3Cfrw3BlgWr2bZWz_H3XqSDk3xV2f92Flzk27nyZpPgD78EdrTcKwwq6TEP26M_uE7zvw4hZPXx1KpfgMfVFxLq8VTIPkiWG582MKM-0fvaZig2urtBlg2D8zHqnhhTuq4wbmzNfou2u05CUFpWUvFXy3PRw_-4XLS6k2T0qpkQ5xBf6Ow65BZx4gw/s337/nodes_and_scenes_06_label_text.webp)

5. Yukarıdaki taşıma aracıyla yazıyı tutup ekranın ortasına getirebilirsiniz.

![Taşıma Aracı](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiDOLNzXzKSeqZC0My5nsESSqu2vipVodXF8it3-K1_9GdcOOtCwUFsIqXOad0cTEZZRbmd9WAoPGd1ERl5yLdwMUKtgJdp7wv7DrMl3Wus2ZFPK_k09eCr3YJb85WoHlrSxcv39ZPO2EqAr-W0ZOmxFKtC24OiPU4Vx6zv3AZTrm-B5XUT4EaxGx71Xg/s763/nodes_and_scenes_07_move_tool.webp)

![Hello World Ekranda](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiihglYmeJwGjteJDF-BmhKQYz5yCteH1qzSQZGJgVF3kOHBb_KPEliZgLRDaYTN8s1zSuHmNlFg02LBqUctAgIEqTO1y8Mp6Ir88VZycYQxc_YNsPSbYnCMLtx8Btd4gDpctwRWGSk-EfzR_i1Tdfkdj0QsnaRwy3vE4zbcixREIo7AgrTC1vXPEwJ5g/s1203/nodes_and_scenes_08_hello_world_text.webp)

---

## Oyunu Çalıştırmak ve Ana Sahne Ayarlamak

Artık her şey hazır! Ekranın sağ üst köşesindeki **Play (Current Scene / Mevcut Sahneyi Çalıştır)** butonuna basalım veya F6 tuşuna basalım.

![Play Butonu](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhL2el_9fcbeQpvoqhpmgKMsDcB0I2cclHwneqmhnR8thYextdQRQr4F_AhAlaBxCeOsCuPETrSc4OUbg4G23wnkfanxUfDK1gfTswSlZ3utGcUB-vKOc5q0IEmliyX6c0iHs3vMATQlCRG0rv6jRuioOLBNJw8WUVZCg6LN241kLb0X3ecBJ9lBP2oCg/s335/nodes_and_scenes_09_play_scene_button.webp)

6. Bize henüz bu sahneyi kaydetmediğimizi söyleyecek. `Save` diyerek sahneyi **label.tscn** olarak kaydedelim. Karşımıza içinde "Merhaba Dünya" yazan oyun penceremiz açılacaktır! İstediğimizde pencereyi kapatıp veya F8 tuşuyla durdurabiliriz.

![Sahneyi Kaydet](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3bodAzJW6IT88PUfwweCELPQerRvK95IZ4OzTt1Cq5VB6n97elTvSvMEWYbHtNCQmgVDY0xj_bE9EOmHxheQ8YZaIvdeHrDow60XaU9bwbTXqEJx6SNVHEJU95P3745Sc-B3lnB22M8J7UKnX1F-9BwQ85ohIS_ofc0ROEYa6RIlrCaoSCGuvFXcyGw/s791/nodes_and_scenes_10_save_scene_as.webp)

**Ana Sahneyi Belirlemek:**

7. Sağ üstten **Run Project (Projeyi Çalıştır)** yani genel "Play" tuşuna (F5) bastığımızda, Godot "Lütfen bir Ana Sahne seç" (Please Select a Main Scene) diye bizden bir seçim isteyecektir. "Select" diyerek az önce kaydettiğimiz `label.tscn` dosyasını seçtiğimizde artık oyunumuzun ana menüsü/merkezi burası olur.

![Ana Sahne Popup](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgk_hy7lKIqHU_nPKWpU9zLK3eIztNeQ8Wn3Er1Qxce8Bh6eakqXpvpU-i36fBpCg-VtutVqL2PqXZrDa7y89DRFTI87RHemw30hQ-PDLNO0alGUTUe57WmGnL_OvIi_YgEVz-GaW34I_8FjrG96c3AI-9jw5yGHmMrRrEta4Z6cbWALVy4OA4Lx2188g/s541/nodes_and_scenes_13_main_scene_popup.webp)

![Ana Sahne Seç](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSi58wnj8G1vOu568wo1dXsTwUtYwdBK-l5LlNiff1auYvqJmsPAZXwgj4xgKWoc2gMfrEc_I9HscxiE0c31NKxrfBLQDY_a3RncdqxBO0RYGbLzY7ONdB-oH6NGLqab6A_7Vn5fu5VIwRou8tf07UfxgH9PnjNt8QvLqUH4toyWdmXc5JD2OhLf87KQ/s853/nodes_and_scenes_14_select_main_scene.webp)

Tebrikler! Godot motorunda ilk sahnenizi oluşturdunuz ve Nodes ile Scenes kavramlarının çalışma mantığını çözdünüz. Gelecek dersimizde işleri biraz daha ileri taşıyıp yazdığımız bu yapıyı kodlamaya (scripting) ve kopyalamaya (instancing) geçeceğiz. Takipte kalın, görüşmek üzere!
