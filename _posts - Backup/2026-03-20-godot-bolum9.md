---
title: "Godot Engine Eğitim Serisi - Bölüm 9: Dodge the Creeps! — Bölüm 1: Projeyi Kuralım"
date: 2026-03-20 12:00:00 +0300
categories: [Godot Eğitim Serisi, İpuçları]
tags: [godot, troubleshooting, debug, export_issues]
permalink: /godot-egitim-serisi-bolum-9/
published: true
---

"Dodge the Creeps!" oyununu yapmaya başlıyoruz. Bu kısa ilk bölümde projeyi oluşturacak, gerekli varlıkları ekleyecek ve oyun penceresini doğru şekilde yapılandıracağız. Sağlam bir temel olmadan sağlam bir oyun olmaz!

---

## Yeni Proje Oluştur

Godot'yu başlat ve **yeni bir proje** oluştur. Proje oluştururken yalnızca geçerli bir **Project Path** (proje klasörü) seçmen yeterli — diğer varsayılan ayarları olduğu gibi bırakabilirsin.

![Yeni Proje Butonu](/assets/images/new-project-button.webp)
*Project Manager'da "New Project" butonuyla yeni proje oluşturuyoruz*

---

## Oyun Varlıklarını İndir ve Ekle

Oyun için gerekli grafik ve ses dosyalarını hazırladık. Aşağıdaki bağlantıdan indir:

🔗 [dodge_the_creeps_2d_assets.zip](https://docs.godotengine.org/en/stable/_downloads/dodge_the_creeps_2d_assets.zip)

Arşivi çıkart ve içindeki **`art/`** ile **`fonts/`** klasörlerini **doğrudan proje klasörüne** taşı.

İşlem tamamlandığında proje klasörün şöyle görünmeli:

![Proje Klasörü İçeriği](/assets/images/folder-content.webp)
*Proje klasöründe art/ ve fonts/ klasörleri yerli yerinde*

---

## Pencere Boyutunu Ayarla

Bu oyun **dikey (portrait) mod** için tasarlandı. Bu nedenle oyun penceresinin boyutunu ayarlamamız gerekiyor.

`Project > Project Settings` menüsünü aç. Sol sütundan `Display > Window` sekmesine git.

**Viewport Width** ve **Viewport Height** değerlerini şu şekilde ayarla:

- **Viewport Width:** `480`
- **Viewport Height:** `720`

![Viewport Genişlik ve Yükseklik Ayarı](/assets/images/setting-project-width-and-height.webp)
*Viewport boyutlarını 480x720 olarak ayarlıyoruz — dikey oyun penceresi*

---

## Ölçekleme (Stretch) Ayarları

Aynı pencerede biraz aşağıya in ve **Stretch** seçeneklerini bul. Şu değerleri ayarla:

- **Mode:** `canvas_items`
- **Aspect:** `keep`

![Stretch Modu Ayarı](/assets/images/setting-stretch-mode.webp)
*Stretch ayarları — oyunun farklı ekran boyutlarında tutarlı görünmesini sağlar*

Bu ayarlar, oyunun **farklı ekran boyutlarında ve çözünürlüklerde tutarlı bir şekilde ölçeklenmesini** sağlar. Hem küçük hem büyük ekranlarda oyun doğru orantıda görünür.

---

## Projeyi Düzenleyelim

Bu projede **3 bağımsız sahne** oluşturacağız:

- **Player** — oyuncu karakteri
- **Mob** — düşmanlar (yaratıklar)
- **HUD** — ekran bilgileri (skor, mesajlar)

Bu üç sahneyi daha sonra oyunun **Main** (ana) sahnesinde bir araya getireceğiz.

Daha büyük projelerde sahneleri ve scriptleri ayrı klasörlerde tutmak mantıklıdır. Ama bu nispeten küçük oyun için tüm dosyaları **projenin kök klasörüne** (`res://`) kaydedebiliriz.

Proje klasörünü editörün sol alt köşesindeki **FileSystem doku**'ndan görebilirsin:

![FileSystem Doku](/assets/images/filesystem_dock.webp)
*FileSystem doku — projenin tüm dosyaları burada listelenir*

---

## Özet

Bu bölümde yaptıklarımız:

| Adım | Açıklama |
|---|---|
| Yeni proje oluşturma | Godot'da boş proje başlattık |
| Varlıkları ekleme | `art/` ve `fonts/` klasörlerini projeye taşıdık |
| Viewport ayarı | 480×720 dikey pencere boyutu belirlendi |
| Stretch ayarı | `canvas_items` + `keep` ile tutarlı ölçekleme sağlandı |
| Proje yapısı | 3 sahne (Player, Mob, HUD) + Main sahne planlandı |

---

## Sıradaki Adım

Proje kurulumu tamamlandı! Bir sonraki bölümde **oyuncu sahnesini** tasarlayacağız — karakterin görselini, çarpışma alanını ve animasyonlarını oluşturacağız. 🎮

---

*Bu yazı, [Godot Engine resmi dokümantasyonu](https://docs.godotengine.org/en/stable/getting_started/first_2d_game/01.project_setup.html) esas alınarak Türkçe olarak hazırlanmıştır.*
