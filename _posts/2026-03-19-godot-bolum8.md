---
title: "Godot Engine Eğitim Serisi - Bölüm 8: İlk 2D Oyunun: Dodge the Creeps! — Seriye Giriş"
date: 2026-03-19 12:00:00 +0300
categories: [Godot Eğitim Serisi, İpuçları]
tags: [godot, troubleshooting, debug, export_issues]
permalink: /godot-egitim-serisi-bolum-8/
published: true
---

Step by Step serisinde Godot'nun temel yapıtaşlarını öğrendik: node'lar, sahneler, script'ler, girdi ve sinyaller. Artık tüm bu bilgileri bir araya getirip **gerçek bir oyun** yapma zamanı!

Bu yazı serisinde adım adım eksiksiz bir 2D oyun geliştireceğiz: **"Dodge the Creeps!"** (Yaratıklardan Kaç!)

![Dodge the Creeps Oyununun Önizlemesi](/assets/images/dodge_preview.webp)
*Serinin sonunda bu oyunu yapmış olacaksın — hem de sıfırdan!*

---

## Oyun Nedir?

**Dodge the Creeps!** adı üzerinde, düşmanlardan kaçmaya dayalı basit ama eksiksiz bir 2D oyundur. Oyunun mekaniği şu şekilde:

- Karakterin sürekli farklı yönlerden gelen düşmanların (creep) arasında hareket eder
- Hiçbir düşmana çarpmadan ne kadar süre hayatta kalabilirsin?
- Hayatta kaldıkça **skor artar**

Basit ama bağımlılık yapan bir döngü. Ve öğrenmek için mükemmel bir proje.

---

## Bu Seride Ne Öğreneceksin?

Bu oyunu geliştirirken şunları öğreneceksin:

- Godot editörüyle **eksiksiz bir 2D oyun** oluşturmak
- Basit bir oyun projesini **yapılandırmak**
- Oyuncu karakterini hareket ettirmek ve **sprite'ını değiştirmek**
- **Rastgele düşman** üretmek
- **Skor saymak**
- Ve daha fazlası...

---

## Neden 2D ile Başlamalısın?

Oyun geliştirmeye yeni başlıyorsan veya Godot'ya alışıyorsan, **2D ile başlamanı öneririz.** 3D oyunlar genellikle daha karmaşıktır; 2D'de hem Godot editörünü hem de oyun geliştirme prensiplerini kavramak çok daha kolaydır.

Bu seriyi tamamladıktan sonra benzer bir oyunu 3D olarak yapma serisi de mevcut. Ama önce bu seriyi bitir!

---

## Kaynak Koda Nereden Ulaşabilirsin?

Serinin tamamlanmış oyun koduna şuradan ulaşabilirsin:

- 🔗 [Dodge the Creeps — GDScript kaynak kodu](https://github.com/godotengine/godot-demo-projects/tree/master/2d/dodge_the_creeps)
- 🔗 [Dodge the Creeps — C# kaynak kodu](https://github.com/godotengine/godot-demo-projects/tree/master/2d/dodge_the_creeps_csharp)

Takılırsın, incele — ama önce kendi başına yazmayı dene!

---

## Ön Koşullar

Bu seri, **Step by Step serisini tamamlamış** başlangıç seviyesi geliştiriciler için hazırlanmıştır. Deneyimli bir programcıysan doğrudan başlayabilirsin, ancak Godot'ya yeniysen Step by Step serisini önce bitirmeni öneririz.

---

## Oyun Varlıklarını İndir

Oyun için gereken grafik ve ses dosyalarını hazırladık. Kodlamaya doğrudan geçebilmek için bu dosyaları önceden indirip hazır tutman gerekiyor:

🔗 [dodge_the_creeps_2d_assets.zip](https://docs.godotengine.org/en/stable/_downloads/dodge_the_creeps_2d_assets.zip)

Arşivi çıkart ve ilerleyen adımlarda projeye ekleyeceğiz.

---

## Serinin İçeriği

Bu yazı serisi şu bölümlerden oluşuyor:

1. **Projeyi Kurma** — Godot projesini oluşturuyoruz ve varlıkları ekliyoruz
2. **Oyuncu Sahnesi Oluşturma** — Karakterin sahnesini hazırlıyoruz
3. **Oyuncuyu Kodlama** — Hareket ve animasyon scriptini yazıyoruz
4. **Düşmanı Oluşturma** — Rastgele hareket eden düşman sahnesi
5. **Ana Oyun Sahnesi** — Tüm parçaları bir araya getiriyoruz
6. **Heads-Up Display (HUD)** — Skor ve arayüz
7. **Son Rötuşlar** — Oyunu tamamlıyoruz

Her bölüm bir öncekinin üzerine inşa edilir. Adımları sırayla takip etmeni öneririz.

---

## Hazır mısın?

O zaman ilk adımla başlayalım: **Projeyi kurmak.** 🚀

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/first_2d_game/index.html) esas alınarak Türkçe olarak hazırlanmıştır.*
