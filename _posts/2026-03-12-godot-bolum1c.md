---
title: "Godot Engine Eğitim Serisi - Bölüm 3: Godot'nun Temel Kavramları: Sahne (Scene), Node (Düğüm), Scene Tree (Sahne Ağacı) ve Sinyaller (Signals)"
date: 2026-03-12 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, script, kodlama, başlangıç]
permalink: /godot-egitim-serisi-bolum-1c/
published: true
---

Her oyun motoru, oyunlarını oluştururken kullandığın soyutlamalar etrafında döner. Yani bir motoru öğrenmek demek, aslında o motorun dünyayı nasıl modellediğini anlamak demektir. Godot'da bu modelin dört temel taşı var: **Node (Düğüm)**, **Sahne (Scene)**, **Sahne Ağacı (Scene Tree)** ve **Sinyal (Signal)**.

Bu dört kavramı anlamak, Godot ile yaptığın her şeyin mantığını kavramak anlamına geliyor. Hadi inceleyelim.

---

## Büyük Resim: Oyunun Yapısı

Godot'da bir oyun, iç içe geçmiş sahnelerden oluşan bir ağaçtır. Bu sahneler node'lardan meydana gelir. Node'lar ise birbiriyle sinyal sistemi aracılığıyla konuşur.

![Godot Ana Menü Örneği](/assets/images/key_concepts_main_menu.webp)
*Bir oyunun ana menüsü bile sahneler ve node'lardan oluşur*

Kulağa soyut gelebilir. Ama birazdan göreceksin ki bu yapı aslında son derece mantıklı ve esnek.

---

## Sahne (Scene) Nedir?

Godot'da oyununu **yeniden kullanılabilir sahnelere** bölersin. Bir sahne şunlardan herhangi biri olabilir:

- Oyuncunun karakteri
- Bir silah
- Kullanıcı arayüzündeki bir menü
- Tek bir ev ya da oda
- Bir seviyenin tamamı
- Aklına gelebilecek herhangi bir şey

Godot'nun sahneleri son derece esnektir. Diğer oyun motorlarındaki hem **prefab** hem de **scene** kavramının rolünü üstlenirler.

Üstelik sahneler iç içe geçebilir (nested). Yani bir karakter sahnesini alıp bir seviye sahnesinin içine yerleştirebilirsin. Ve bu karakteri istediğin kadar farklı seviyede kullanabilirsin — her seferinde sıfırdan yazmana gerek yoktur.

![Godot Sahne Örneği](/assets/images/key_concepts_scene_example.webp)
*Sahneler iç içe yerleştirilebilir; karakter sahnesi seviye sahnesinin bir parçası olabilir*

---

## Node (Düğüm) Nedir?

Bir sahne, bir ya da daha fazla **node**'dan oluşur. Node'lar, oyununun en küçük yapı taşlarıdır. Bunları bir ağaç yapısında (tree) düzenlersin.

Bir karakter için örnek bir node yapısı şöyle görünebilir:

- `CharacterBody2D` — **"Player"** olarak adlandırılmış, fizik ve hareketten sorumlu ana node
  - `Camera2D` — oyuncuyu takip eden kamera
  - `Sprite2D` — karakterin görsel temsili
  - `CollisionShape2D` — çarpışma alanı

![Karakter Node Yapısı](/assets/images/key_concepts_character_nodes.webp)
*Bir karakter sahnesinin node yapısı — her node'un farklı bir sorumluluğu var*

> 💡 **Not:** Node isimlerinin sonundaki "2D" bu örneklerin 2D sahnelerine ait olduğunu gösterir. 3D sahnelerde aynı kavramlar "3D" son ekiyle gelir. Godot 4 ile birlikte eski "Spatial" node'ları artık **"Node3D"** olarak adlandırılıyor.

Editörde bir sahnéyi kaydettiğinde, içindeki tüm node ağacı tek bir node gibi görünür. İç yapı gizlenir. Bu sayede karmaşık sahneleri bile sade bir şekilde yönetebilirsin.

Godot, binlerce farklı node türü içeren kapsamlı bir kütüphane sunar. 2D, 3D ya da kullanıcı arayüzü — ne yapmak istersen yap, büyük ihtimalle ihtiyacın olan node türü zaten mevcuttur.

![Godot Node Menüsü](/assets/images/key_concepts_node_menu.webp)
*Godot'nun sahneye node ekleme menüsü — çok sayıda hazır node türü seni bekliyor*

---

## Sahne Ağacı (Scene Tree) Nedir?

Oyunundaki tüm sahneler bir araya geldiğinde **sahne ağacını (scene tree)** oluştururlar. Bu kelimenin tam anlamıyla bir ağaçtır — sahnelerin sahnelerden oluştuğu, dallanıp büyüyen bir yapı.

Teknik olarak bakıldığında, sahnelerin kendisi de node'lardan oluşan birer ağaçtır. Yani scene tree aynı zamanda devasa bir node ağacıdır.

Ama pratikte **sahne** bazında düşünmek çok daha kolaydır. Çünkü sahneler somut kavramları temsil eder: bir karakter, bir düşman, bir kapı, bir menü.

![Godot Sahne Ağacı](/assets/images/key_concepts_scene_tree.webp)
*Godot editöründe sahne ağacı — oyunun tüm yapısı burada görünür hale gelir*

---

## Sinyal (Signal) Nedir?

Node'lar belirli bir olay gerçekleştiğinde **sinyal yayarlar (emit)**. Bu sistem sayesinde node'ları birbiriyle kodda doğrudan bağlamak zorunda kalmadan haberdar edebilirsin.

Sinyal sistemi, tasarım desenlerinden **Observer Pattern**'ın Godot'daki karşılığıdır.

### Nasıl Çalışır?

Örneğin bir buton, tıklandığında `pressed` adlı bir sinyal yayar. Sen bu sinyale bir fonksiyon bağlarsın. Buton her tıklandığında o fonksiyon otomatik olarak çalışır — oyunu başlatmak ya da bir menü açmak gibi.

```gdscript
# Buton sinyalini bir fonksiyona bağlamak
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

Bunlara ek olarak, oyununun ihtiyaçlarına özel **kendi sinyallerini** de tanımlayabilirsin. Bu, node'lar arasındaki bağımlılığı minimuma indirir ve kodunu modüler tutar.

![Godot Sinyal Sistemi](/assets/images/key_concepts_signals.webp)
*Godot editöründe sinyal bağlantıları — node'lar arası iletişim görsel olarak yönetilebilir*

---

## Dört Kavramın Özeti

| Kavram | Ne İşe Yarar? |
|---|---|
| **Node** | Oyunun en küçük yapı taşı. Her node'un belirli bir görevi vardır. |
| **Sahne (Scene)** | Node'ların bir araya gelmesiyle oluşan, yeniden kullanılabilir birim. |
| **Sahne Ağacı (Scene Tree)** | Oyundaki tüm sahnelerin oluşturduğu bütünsel yapı. |
| **Sinyal (Signal)** | Node'ların olay bazlı iletişim kurma sistemi. |

---

## Kafanda Soru İşaretleri Birikmesi Normal

Bu dört kavramı ilk duyduğunda tam oturmayabilir. "Peki sahne mi node mi?" ya da "Sinyal ne zaman kullanılır?" gibi sorular kafanda dönüyor olabilir.

Bu tamamen normal. Bu kavramlar asıl anlamını **pratik yaparken** kazanıyor. Serinin ilerleyen bölümlerinde bu yapıları bizzat kullanacak ve her birinin ne işe yaradığını elle tutulur şekilde göreceksin.

---

## Sıradaki Adım

Temel kavramlara genel bir bakış attık. Bir sonraki bölümde Godot'yu bilgisayarına kuracak ve editörü ilk kez açacağız. İşin heyecan verici kısmına yaklaşıyoruz!

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/key_concepts_overview.html) esas alınarak Türkçe olarak hazırlanmıştır.*
