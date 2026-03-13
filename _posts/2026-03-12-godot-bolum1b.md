---
title: "Godot Engine Eğitim Serisi - Bölüm 1.2: GDScript ile Kod Yazmayı Öğrenmek"
date: 2026-03-12 12:05:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, node, scene, düğüm, sahne]
permalink: /godot-egitim-serisi-bolum-1_2/
published: true
---

Godot'ya adım attığınızda karşına çıkan ilk sorulardan biri şu olur: **"Hangi dili öğrenmeliyim?"** Bu yazıda Godot'da kullanabileceğiniz dillere kısaca değinecek ve özellikle yeni başlayanlar için neden GDScript'in doğru seçim olduğunu açıklayacağız.

---

## Godot'da Hangi Dillerle Kod Yazılır?

Godot'da iki ana programlama diliyle oyun yazabilirsin:

- **GDScript** — Godot'ya özgü, öğrenmesi kolay bir script dili
- **C#** — Oyun sektöründe yaygın kullanılan, genel amaçlı bir dil

Her iki dil de Godot tarafından resmi olarak destekleniyor. Peki hangisiyle başlamalısınız?

---

## Yeni Başlayanlar İçin: GDScript

Eğer programlamaya yeni başlıyorsanız **GDScript** ile başlamanızı kesinlikle öneririm. Bunun birkaç önemli nedeni var:

### 1. Godot için Tasarlandı
GDScript, doğrudan Godot'nun ihtiyaçlarına göre tasarlanmış bir dildir. Godot'nun yapısına o kadar sıkı entegre ki, motoru kullanırken her adımda doğal hissettiriyor. Gereksiz karmaşıklık yok; sadece ihtiyacınız olan şeyler var.

### 2. Sözdizimi Sade ve Okunabilir
GDScript, Python'a benzer bir sözdizimine sahip. Süslü parantez ormanına girmeniz gerekmiyor. Bir kodu okuduğunuzda ne yaptığını kolayca anlayabiliyorsunuz.

```gdscript
# Bu kadar sade:
func _ready():
    print("Merhaba, Godot!")
```

### 3. Öğrenme Hızı Yüksek
C# gibi genel amaçlı dillerle kıyaslandığında GDScript çok daha hızlı öğrenilir. Oyun geliştirmenin teknik kısımlarıyla boğuşmak yerine, oyun yapmaya odaklanabilirsiniz.

---

## C# Ne Zaman Tercih Edilmeli?

C# daha büyük ve karmaşık projelerde, ya da daha önce Unity gibi bir motorda C# kullandıysan iyi bir seçim olabilir. Ayrıca performans kritik sistemler yazacaksanız da C# avantaj sağlayabilir.

Ama başlangıç için? GDScript ile gidin. Sonradan C#'a geçmek isterseniz, zaten kazandığınız programlama mantığı büyük ölçüde geçerli olacak.

---

## Bir Dil Öğrenmek = Hepsine Kapı Açmak

Önemli bir nokta: Programlama dilleri birbirinden sandığınızdan çok daha az farklıdır. Birini gerçekten öğrendiğinizde, diğerlerine geçmek çok daha hızlı olur. GDScript'le attığınız her adım, ileride farklı diller öğrenmenizi de kolaylaştıracak.

> Bir programcının birden fazla dil bilmesi son derece normaldir — hatta beklenendir.

---

## Peki Ben Nasıl İlerlemeliyim?

Bu eğitim serisinde biz **GDScript** kullanacağız. Zaten biraz programlama geçmişiniz varsa? O zaman doğrudan devam edebiliriz. GDScript'i pratikte öğrenmek için en iyi yol, bir şeyler yapmaya başlamaktır.

---

## Özet

- Godot'da **GDScript** ve **C#** kullanılabilir
- Yeni başlayanlar için **GDScript** çok daha uygun bir seçimdir
- GDScript öğrenmek, diğer dillere geçişi de kolaylaştırır

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='DhBRf5KU_hM' %}

## Sıradaki Adım

Bir sonraki bölümde Godot'nun temel yapı taşlarını — **sahne (scene)** ve **düğüm (node)** sistemini — tanıyacağız. Godot'nun çalışma mantığını kavramak, ileride yazacağınız her kod satırını çok daha anlamlı kılacak.

Görüşmek üzere...

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/introduction/learn_to_code_with_gdscript.html) esas alınarak Türkçe olarak hazırlanmıştır.*
