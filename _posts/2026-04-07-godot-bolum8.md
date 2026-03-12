---
title: "Godot Engine Eğitim Serisi - Bölüm 8: Sahne Örneklemesi (Instancing): Şablondan Nesne Üretmek"
date: 2026-04-07 12:05:00 +0300
categories: [Godot Eğitim Serisi, 3D Oyun Geliştirme]
tags: [godot, 3d, character_controller, pivot, inputmap]
permalink: /godot-egitim-serisi-bolum-8/
published: true
---

Önceki bölümde bir sahnenin, ağaç yapısında düzenlenmiş node'lardan oluştuğunu öğrendik. Şimdi bu sahneleri nasıl bir şablon gibi kullanabileceğimizi — yani **örnekleme (instancing)** kavramını — ele alacağız. Bu, Godot'nun en güçlü ve en sık kullanılan özelliklerinden biridir.

---

## Packed Scene Nedir?

Projeyi istediğin kadar sahneye bölebilirsin. Her sahne `.tscn` uzantılı bir dosyaya kaydedilir — bu, "text scene" (metin sahne) anlamına gelir. Önceki bölümde oluşturduğumuz `label.tscn` bunun bir örneğiydi.

Bu dosyalara **Packed Scene** denir, çünkü sahnenin içeriğine dair tüm bilgiyi paketlenmiş hâlde saklarlar.

---

## Instancing Nedir?

Bir sahneyi kaydettikten sonra, onu bir **şablon (blueprint)** gibi kullanabilirsin: başka sahnelerde istediğin kadar çoğaltabilirsin. Bu işleme **instancing (örnekleme)**, üretilen her kopyaya ise **instance (örnek)** denir.

Somutlaştırmak için bir örnek düşünelim: **Top (Ball) sahnesi.**

Bu sahne şu node'lardan oluşuyor:
- `RigidBody2D` (kök node, "Ball" adında) — topun düşmesini ve duvarlara çarpmasını sağlar
- `Sprite2D` — topun görseli
- `CollisionShape2D` — çarpışma alanı

![Top Sahnesi Yapısı](/assets/images/instancing_ball_scene.webp)
*ball.tscn — bir topu temsil eden sahne. Kök node RigidBody2D.*

Bu sahneyi kaydettikten sonra başka sahnelere defalarca ekleyebilirsin. Her instance editörde tek bir node gibi görünür; iç yapısı gizlenir. Her kopya benzersiz bir isme sahip olur.

![Birden Fazla Top Instance'ı](/assets/images/instancing_ball_instances_example.webp)
*Aynı ball.tscn sahnesinden üretilen birden fazla instance — her biri bağımsız davranır*

Her instance, kaynak sahnedeki yapı ve özellikleri miras alır. Ancak her birini **bağımsız olarak** değiştirebilirsin: zıplama kuvveti, ağırlık veya sahne tarafından sunulan herhangi bir özellik.

---

## Pratik: Starter Projeyi İnceleyelim

Instancing'i pratikte görmek için Godot'nun hazırladığı örnek projeyi kullanacağız.

🔗 Projeyi şu adresten indir: [instancing_starter.zip](https://docs.godotengine.org/en/stable/_downloads/instancing_starter.zip)

Arşivi bilgisayarına çıkart. Ardından Godot'yu aç ve **Project Manager**'dan **Import** butonuna tıkla.

![Import Butonu](/assets/images/instancing_import_button.webp)
*Project Manager'daki Import butonu*

Açılan pencerede çıkarttığın klasöre git ve `project.godot` dosyasına çift tıkla.

![project.godot Dosyası Seçimi](/assets/images/instancing_import_project_file.webp)
*project.godot dosyasını seç*

Son olarak **Import & Edit** butonuna tıkla:

![Import & Edit Butonu](/assets/images/instancing_import_and_edit_button.webp)
*Import & Edit ile proje açılır*

> ℹ️ Projenin daha eski bir Godot sürümünde açıldığına dair bir uyarı görürsen sorun değil. **OK** tıkla.

Proje iki packed scene içeriyor: topun çarptığı duvarları içeren `main.tscn` ve `ball.tscn`. Main sahnesi otomatik açılmalı. Boş bir 3D sahne görüyorsan ekranın üst kısmındaki **2D** butonuna tıkla.

![2D Ekranı Seç](/assets/images/instancing_2d_scene_select.webp)
*3D yerine 2D görünümünü seç*

Sahne şöyle görünmelidir:

![Main Sahnesi](/assets/images/instancing_main_scene.webp)
*main.tscn — topun zıplayacağı duvarlar hazır*

---

## Top Instance'ı Ekle

Main node'a bir top ekleyelim.

**Scene doku**'nda `Main` node'una tıklayarak seç. Ardından Scene doku'nun üst kısmındaki **zincir simgesi (link icon)** butonuna tıkla. Bu buton, seçili node'a bir sahne instance'ı eklemeyi sağlar.

![Sahne Bağlantı Butonu](/assets/images/instancing_scene_link_button.webp)
*Zincir simgesi — bir sahneyi instance olarak ekleme butonu*

Açılan pencerede `ball` sahnesine çift tıkla:

![Instance Penceresi](/assets/images/instancing_instance_child_window.webp)
*ball.tscn sahnesini instance olarak seçiyoruz*

Top viewport'un sol üst köşesinde belirir:

![Top Eklendi](/assets/images/instancing_ball_instanced.webp)
*Top instance'ı sahneye eklendi*

Topa tıkla ve görünümün ortasına sürükle:

![Top Ortalandı](/assets/images/instancing_ball_moved.webp)
*Topu sahnenin ortasına taşıyoruz*

**F5** (macOS'ta Cmd + B) ile oyunu çalıştır. Topun düştüğünü görmelisin!

---

## Birden Fazla Instance Oluştur

Şimdi daha fazla top ekleyelim. Top hâlâ seçiliyken **Ctrl + D** (macOS'ta Cmd + D) kısayoluyla **duplicate (kopyala)** komutunu çalıştır. Yeni topu farklı bir konuma sürükle.

![Top Kopyalandı](/assets/images/instancing_ball_duplicated.webp)
*Ctrl+D ile top kopyalandı — yeni bir instance oluştu*

Bu işlemi istediğin kadar tekrarlayarak birden fazla top ekleyebilirsin:

![Birden Fazla Top](/assets/images/instancing_main_scene_with_balls.webp)
*Sahneye birden fazla top instance'ı eklendi*

Oyunu tekrar çalıştır. Her topun **birbirinden bağımsız** düştüğünü göreceksin. İşte instancing tam olarak budur: her biri şablon sahneden üretilmiş, ama birbirinden bağımsız çalışan kopyalar.

---

## Sahneleri ve Instance'ları Düzenlemek

Instancing'in iki farklı düzenleme katmanı var:

**1. Tek bir instance'ı değiştir:**
Inspector'dan herhangi bir instance'ın özelliğini değiştirebilirsin — bu değişiklik yalnızca o instance'ı etkiler, diğerlerini etkilemez.

**2. Tüm instance'ları aynı anda güncelle:**
Kaynak sahneyi (`ball.tscn`) açıp orada bir değişiklik yaptığında, projedeki tüm Ball instance'ları otomatik olarak güncellenir.

### Tüm Topların Zıplama Kuvvetini Artır

FileSystem'de `ball.tscn` dosyasına çift tıklayarak aç:

![ball.tscn Açıldı](/assets/images/instancing_ball_scene_open.webp)
*ball.tscn dosyasını açıyoruz*

Scene doku'nda **Ball** node'unu seç. Sağdaki Inspector'da **PhysicsMaterial** özelliğini bul ve üzerine tıklayarak genişlet:

![PhysicsMaterial Genişletildi](/assets/images/instancing_physics_material_expand.webp)
*PhysicsMaterial özelliğini genişletiyoruz*

**Bounce** değerini `0.5` olarak ayarla (alana tıkla, `0.5` yaz, Enter'a bas):

![Bounce Değeri Güncellendi](/assets/images/instancing_property_bounce_updated.webp)
*Bounce değeri 0.5 olarak ayarlandı*

Kaydet ve **F5** ile oyunu çalıştır. Tüm topların çok daha fazla zıpladığını göreceksin — çünkü kaynak sahnedeki değişiklik tüm instance'lara yansıdı.

### Tek Bir Topu Farklılaştır

Şimdi viewport üstündeki sekme çubuğundan **Main sahnesine** geri dön:

![Sahne Sekmeleri](/assets/images/instancing_scene_tabs.webp)
*Sekme çubuğundan Main sahnesine dönüyoruz*

Instance'lardan birini seç ve Inspector'da **Gravity Scale** değerini `10` olarak ayarla:

![Gravity Scale Değeri](/assets/images/instancing_property_gravity_scale.webp)
*Tek bir instance'ın Gravity Scale değeri 10'a yükseltildi*

Özelliğin yanında **gri bir "revert" butonu** belirir:

![Revert Simgesi](/assets/images/instancing_property_revert_icon.webp)
*Revert ikonu — bu özelliğin kaynak sahnedeki değerin üzerine yazıldığını gösterir*

Bu ikon, instance'da **kaynak sahnedeki değerin üzerine yazıldığını** gösterir. Kaynak sahnede bu özelliği değiştirsen bile bu instance'taki değer korunur. Revert ikonuna tıklarsan değer, kaynak sahnedeki hâline geri döner.

Oyunu yeniden çalıştır. Bu topun diğerlerinden çok daha hızlı düştüğünü göreceksin.

> 💡 **Not:** PhysicsMaterial değerlerini tek bir instance için değiştirmek istersen, Inspector'da PhysicsMaterial'e sağ tıklayıp **Make Unique** seçeneğini kullanman gerekir. Kaynaklar (Resources), Godot'nun önemli bir konseptidir ve ilerleyen derslerde ele alacağız.

---

## Tasarım Dili Olarak Instancing

Instance'lar ve sahneler, Godot'yu diğer motorlardan ayıran bir **tasarım dili** sunar. Godot sıfırdan bu konsept etrafında inşa edilmiştir.

Godot ile oyun geliştirirken **MVC (Model-View-Controller)** veya **Entity-Relationship** gibi mimari kod kalıplarını bir kenara bırakmanı öneririz. Bunlar yerine şu soruyu sor: **"Oyuncunun göreceği elemanlar neler?"** Kodunu bu elemanlara göre yapılandır.

Örneğin bir top-down shooter oyununu şöyle bölebilirsin:

![Shooter Oyun Diyagramı](/assets/images/instancing_diagram_shooter.png)
*Basit bir shooter oyunun sahne diyagramı — her kutu bir sahneye karşılık gelir*

Bu tür diyagramı neredeyse her oyun türü için çıkarabilirsin. Oklarlar hangi sahnenin hangisini instance ettiğini gösterir.

Daha karmaşık bir örnek — tonlarca varlık ve iç içe geçmiş elemanlara sahip açık dünya oyunu:

![Açık Dünya Diyagramı](/assets/images/instancing_diagram_open_world.png)
*Açık dünya oyunu sahne diyagramı — her eleman bir sahne, instance'lar hiyerarşiyi oluşturur*

Bu yaklaşımın avantajı: **Sahne tabanlı tasarım geliştirmeyi hızlandırır.** Çoğu oyun bileşeni doğrudan bir sahneye karşılık geldiğinden, soyut mimari kodlara çok az ihtiyaç duyarsın. Oyun mantığına odaklanabilirsin.

Godot editörü programcılar, tasarımcılar ve sanatçılar için eşit derecede erişilebilir olacak şekilde tasarlanmıştır. Tipik bir ekipte 2D/3D sanatçılar, seviye tasarımcıları, oyun tasarımcıları ve animatörler hepsi aynı editörde çalışabilir.

---

## Özet

| Kavram | Açıklama |
|---|---|
| **Packed Scene (.tscn)** | Bir sahnenin paketlenmiş hâli; şablon işlevi görür |
| **Instance** | Bir packed scene'den üretilen bağımsız kopya |
| **Duplicate (Ctrl+D)** | Mevcut instance'ı kopyalayarak yeni instance üretir |
| **Kaynak sahnede değişiklik** | Tüm instance'ları günceller |
| **Instance'da değişiklik** | Yalnızca o instance'ı etkiler, revert ile geri alınabilir |

Instancing ile şunları elde edersin:
- Oyunu **yeniden kullanılabilir bileşenlere** bölme
- Karmaşık sistemleri **yapılandırma ve kapsülleme**
- Oyun projesinin yapısını **doğal biçimde düşünme** dili

---

## Sıradaki Adım

Instancing kavramını kavradık. Bir sonraki bölümde **GDScript ile scripting**'e giriş yapacağız — node'lara nasıl davranış kazandırılır, bunu keşfedeceğiz! 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/instancing.html) esas alınarak Türkçe olarak hazırlanmıştır.*
