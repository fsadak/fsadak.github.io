---
title: "Godot Engine Eğitim Serisi - Bölüm 3: Sahne Örneklemesi (Instancing): Şablondan Nesne Üretmek"
date: 2026-03-14 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, 3d, character_controller, pivot, inputmap]
permalink: /godot-egitim-serisi-bolum-3/
published: true
---

Önceki bölümde bir sahnenin, ağaç yapısında düzenlenmiş node'lardan oluştuğunu öğrendik. Şimdi bu sahneleri nasıl bir şablon gibi kullanabileceğimizi — yani **örnekleme (instancing)** kavramını — ele alacağız. Bu, Godot'nun en güçlü ve en sık kullanılan özelliklerinden biridir.

---

## Packed Scene Nedir?

Projeyi istediğiniz kadar sahneye bölebilirsiniz. Her sahne `.tscn` uzantılı bir dosyaya kaydedilir. Önceki bölümde oluşturduğumuz `label.tscn` bunun bir örneğiydi.

Bu dosyalara **Packed Scene** denir, çünkü sahnenin içeriğine dair tüm bilgiyi paketlenmiş hâlde saklarlar.

---

## Instancing Nedir?

Bir sahneyi kaydettikten sonra, onu bir **şablon (blueprint)** gibi kullanabilirsiniz: başka sahnelerde istediğiniz kadar çoğaltabilirsiniz. Bu işleme **instancing (örnekleme)**, üretilen her kopyaya ise **instance (örnek)** denir.

Somutlaştırmak için bir örnek düşünelim: **Top (Ball) sahnesi.**

Bu sahne şu node'lardan oluşuyor:
- `RigidBody2D` (kök node, "Ball" adında) — topun düşmesini ve duvarlara çarpmasını sağlar
- `Sprite2D` — topun görseli
- `CollisionShape2D` — çarpışma alanı

![Top Sahnesi Yapısı](/assets/images/instancing_ball_scene.webp)
*ball.tscn — bir topu temsil eden sahne. Kök node RigidBody2D.*

Bu sahneyi kaydettikten sonra başka sahnelere defalarca ekleyebilirsiniz. Her instance editörde tek bir node gibi görünür; iç yapısı gizlenir. Her kopya benzersiz bir isme sahip olur.

![Birden Fazla Top Instance'ı](/assets/images/instancing_ball_instances_example.webp)
*Aynı ball.tscn sahnesinden üretilen birden fazla instance — her biri bağımsız davranır*

Her instance, kaynak sahnedeki yapı ve özellikleri miras alır. Ancak her birini **bağımsız olarak** değiştirebilirsiniz: zıplama kuvveti, ağırlık veya sahne tarafından sunulan herhangi bir özellik.

---

## Pratik: Starter Projeyi İnceleyelim

Instancing'i pratikte görmek için Godot'nun hazırladığı örnek projeyi kullanacağız.

🔗 Projeyi şu adresten indirin: [instancing_starter.zip](https://docs.godotengine.org/en/stable/_downloads/instancing_starter.zip)

Arşivi bilgisayarınıza açın. Ardından Godot'yu açın ve **Project Manager**'dan **Import** butonuna tıklayın.

![Import Butonu](/assets/images/instancing_import_button.webp)
*Project Manager'daki Import butonu*

Açılan pencerede arşivi açtığınız klasöre gidin ve `project.godot` dosyasına çift tıklayın.

![project.godot Dosyası Seçimi](/assets/images/instancing_import_project_file.webp)
*project.godot dosyasını seçin*

Son olarak **Import & Edit** butonuna tıklayın:

![Import & Edit Butonu](/assets/images/instancing_import_and_edit_button.webp)
*Import & Edit ile proje açılır*

> ℹ️ Projenin daha eski bir Godot sürümünde açıldığına dair bir uyarı görürseniz sorun değil. **OK** tıklayın.

Proje iki packed scene içeriyor: topun çarptığı duvarları içeren `main.tscn` ve `ball.tscn`. Main sahnesi otomatik açılmalı. Boş bir 3D sahne görüyorsan ekranın üst kısmındaki **2D** butonuna tıklayın.

![2D Ekranı Seç](/assets/images/instancing_2d_scene_select.webp)
*3D yerine 2D görünümünü seçin*

Sahne şöyle görünmelidir:

![Main Sahnesi](/assets/images/instancing_main_scene.webp)
*main.tscn — topun zıplayacağı duvarlar hazır*

---

## Top Instance'ı Ekle

Main node'a bir top ekleyelim.

**Scene doku**'nda `Main` node'una tıklayarak seçin. Ardından Scene doku'nun üst kısmındaki **zincir simgesi (link icon)** butonuna tıklayın. Bu buton, seçili node'a bir sahne instance'ı eklemeyi sağlar.

![Sahne Bağlantı Butonu](/assets/images/instancing_scene_link_button.webp)
*Zincir simgesi — bir sahneyi instance olarak ekleme butonu*

Açılan pencerede `ball` sahnesine çift tıklayın:

![Instance Penceresi](/assets/images/instancing_instance_child_window.webp)
*ball.tscn sahnesini instance olarak seçiyoruz*

Top viewport'un sol üst köşesinde belirir:

![Top Eklendi](/assets/images/instancing_ball_instanced.webp)
*Top instance'ı sahneye eklendi*

Topa tıklayın ve görünümün ortasına sürükleyin:

![Top Ortalandı](/assets/images/instancing_ball_moved.webp)
*Topu sahnenin ortasına taşıyoruz*

**F5** ile oyunu çalıştırın. Topun düştüğünü görmelisiniz!

---

## Birden Fazla Instance Oluştur

Şimdi daha fazla top ekleyelim. Top hâlâ seçiliyken **Ctrl + D** kısayoluyla **duplicate (kopyala)** komutunu çalıştırın. Yeni topu farklı bir konuma sürükleyin.

![Top Kopyalandı](/assets/images/instancing_ball_duplicated.webp)
*Ctrl+D ile top kopyalandı — yeni bir instance oluştu*

Bu işlemi istediğiniz kadar tekrarlayarak birden fazla top ekleyebilirsiniz:

![Birden Fazla Top](/assets/images/instancing_main_scene_with_balls.webp)
*Sahneye birden fazla top instance'ı eklendi*

Oyunu tekrar çalıştırın. Her topun **birbirinden bağımsız** düştüğünü göreceksiniz. İşte instancing tam olarak budur: her biri şablon sahneden üretilmiş, ama birbirinden bağımsız çalışan kopyalar.

---

## Sahneleri ve Instance'ları Düzenlemek

Instancing'in iki farklı düzenleme katmanı var:

**1. Tek bir instance'ı değiştir:**
Inspector'dan herhangi bir instance'ın özelliğini değiştirebilirsiniz — bu değişiklik yalnızca o instance'ı etkiler, diğerlerini etkilemez.

**2. Tüm instance'ları aynı anda güncelle:**
Kaynak sahneyi (`ball.tscn`) açıp orada bir değişiklik yaptığınızda, projedeki tüm Ball instance'ları otomatik olarak güncellenir.

### Tüm Topların Zıplama Kuvvetini Artırmak

FileSystem'de `ball.tscn` dosyasına çift tıklayarak açın:

![ball.tscn Açıldı](/assets/images/instancing_ball_scene_open.webp)
*ball.tscn dosyasını açıyoruz*

Scene doku'nda **Ball** node'unu seçin. Sağdaki Inspector'da **PhysicsMaterial** özelliğini bulun ve üzerine tıklayarak genişletin:

![PhysicsMaterial Genişletildi](/assets/images/instancing_physics_material_expand.webp)
*PhysicsMaterial özelliğini genişletiyoruz*

**Bounce** değerini `0.5` olarak ayarlayın (alana tıklayın, `0.5` yazın, Enter'a basın):

![Bounce Değeri Güncellendi](/assets/images/instancing_property_bounce_updated.webp)
*Bounce değeri 0.5 olarak ayarlandı*

Kaydedin ve **F5** ile oyunu çalıştırın. Tüm topların çok daha fazla zıpladığını göreceksiniz — çünkü kaynak sahnedeki değişiklik tüm instance'lara yansıdı.

### Tek Bir Topu Farklılaştır

Şimdi viewport üstündeki sekme çubuğundan **Main sahnesine** geri dönün:

![Sahne Sekmeleri](/assets/images/instancing_scene_tabs.webp)
*Sekme çubuğundan Main sahnesine dönüyoruz*

Instance'lardan birini seçin ve Inspector'da **Gravity Scale** değerini `10` olarak ayarlayın:

![Gravity Scale Değeri](/assets/images/instancing_property_gravity_scale.webp)
*Tek bir instance'ın Gravity Scale değeri 10'a yükseltildi*

Özelliğin yanında **gri bir "revert" butonu** belirir:

![Revert Simgesi](/assets/images/instancing_property_revert_icon.webp)
*Revert ikonu — bu özelliğin kaynak sahnedeki değerin üzerine yazıldığını gösterir*

Bu ikon, instance'da **kaynak sahnedeki değerin üzerine yazıldığını** gösterir. Kaynak sahnede bu özelliği değiştirseniz bile bu instance'taki değer korunur. Revert ikonuna tıklarsanız değer, kaynak sahnedeki hâline geri döner.

Oyunu yeniden çalıştırın. Bu topun diğerlerinden çok daha hızlı düştüğünü göreceksiniz.

> 💡 **Not:** PhysicsMaterial değerlerini tek bir instance için değiştirmek isterseniz, Inspector'da PhysicsMaterial'e sağ tıklayıp **Make Unique** seçeneğini kullanmanız gerekir. Kaynaklar (Resources), Godot'nun önemli bir konseptidir ve ilerleyen derslerde ele alacağız.

---

## Tasarım Dili Olarak Instancing

Instance'lar ve sahneler, Godot'yu diğer motorlardan ayıran bir **tasarım dili** sunar. Godot sıfırdan bu konsept etrafında inşa edilmiştir.

Godot ile oyun geliştirirken **MVC (Model-View-Controller)** veya **Entity-Relationship** gibi mimari kod kalıplarını bir kenara bırakmanızı öneririz. Bunlar yerine şu soruyu sorun: **"Oyuncunun göreceği elemanlar neler?"** Kodunuzu bu elemanlara göre yapılandırın.

Örneğin bir top-down shooter oyununu şöyle bölebilirsiniz:

![Shooter Oyun Diyagramı](/assets/images/instancing_diagram_shooter.png)
*Basit bir shooter oyunun sahne diyagramı — her kutu bir sahneye karşılık gelir*

Bu tür diyagramı neredeyse her oyun türü için çıkarabilirsiniz. Oklar hangi sahnenin hangisini instance ettiğini gösterir.

Daha karmaşık bir örnek — tonlarca varlık ve iç içe geçmiş elemanlara sahip açık dünya oyunu:

![Açık Dünya Diyagramı](/assets/images/instancing_diagram_open_world.png)
*Açık dünya oyunu sahne diyagramı — her eleman bir sahne, instance'lar hiyerarşiyi oluşturur*

Bu yaklaşımın avantajı: **Sahne tabanlı tasarım geliştirmeyi hızlandırır.** Çoğu oyun bileşeni doğrudan bir sahneye karşılık geldiğinden, soyut mimari kodlara çok az ihtiyaç duyarsınız. Oyun mantığına odaklanabilirsiniz.

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

Instancing ile şunları elde edersiniz:
- Oyunu **yeniden kullanılabilir bileşenlere** bölme
- Karmaşık sistemleri **yapılandırma ve kapsülleme**
- Oyun projesinin yapısını **doğal biçimde düşünme** dili

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='kaoyo0wIJS0' %}


## Sıradaki Adım

Instancing mantığını kavradık. Bir sonraki bölümde **GDScript ile kodlamaya** giriş yapacağız — node'lara nasıl davranış kazandırılır, bunu keşfedeceğiz! 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/step_by_step/instancing.html) esas alınarak Türkçe olarak hazırlanmıştır.*
