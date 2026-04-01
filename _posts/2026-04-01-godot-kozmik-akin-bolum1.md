---
title: "Godot Engine Oyun Mekanikleri - Kozmik Akın Bölüm 1: Projeyi Kuralım"
date: 2026-04-01 09:15:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Kozmik Akın]
tags: [godot, proje kurulumu, godot 4, klasör yapısı, sahne, viewport, renderer, başlangıç]
description: "Godot Engine ile Kozmik Akın uzay nişancı oyununu sıfırdan yapıyoruz. İlk bölümde proje kurulumu, ekran boyutu ayarları ve ilk sahne oluşturma adım adım anlatılıyor."
permalink: /godot-kozmik-akin-bolum-1/
published: true
---

# Kozmik Akın — Bölüm 1: Projeyi Kuralım

Merhaba! Bu serinin ilk bölümüne hoş geldiniz. "Kozmik Akın" adını verdiğimiz bu uzay nişancı oyununu sıfırdan birlikte yapacağız. Godot 4 ile daha önce hiç proje oluşturmadıysanız sorun değil — her adımı birlikte atacağız.

Bu bölümün sonunda elimizde şunlar olacak:
- Düzgün ayarlanmış bir Godot 4 projesi
- Temiz ve düzenli bir klasör yapısı
- İlk sahnemiz: boş ama hazır bir oyun ekranı

---

## Godot 4'ü İndirin ve Kurun

Henüz Godot 4 yüklemediyseniz [godotengine.org](https://godotengine.org) adresine gidin ve **Godot Engine 4.x** sürümünü indirin. Bu seride **4.6.1 stable** kullanıyoruz.

> 💡 ".NET" yazan sürümü değil, düz "Godot Engine" yazan sürümü indirin. .NET sürümü C# için gerekli, biz GDScript kullanacağız.

Godot kurulum gerektirmiyor — indirdiğiniz .zip dosyasını açıp çalıştırabilirsiniz.

---

## Yeni Proje Oluşturalım

Godot'u açtığınızda **Project Manager** karşınıza çıkar. Buradan yeni bir proje oluşturacağız.

1. Sol üstteki **"+ Create"** butonuna tıklayın
2. Project Name olarak `kozmik-akin` yazın
3. Projenin kaydedileceği klasörü seçin (masaüstü ya da belgeler klasörü olabilir)
4. Renderer olarak **"Compatibility"** seçin

> 💡 **Renderer nedir?** Godot 4'te üç farklı grafik motoru seçeneği var: Forward+, Mobile ve Compatibility. Biz 2D bir oyun yapıyoruz ve mümkün olduğunca geniş bir cihaz yelpazesini hedefliyoruz, bu yüzden Compatibility en doğru seçim.

5. **"Create & Edit"** butonuna tıklayın.

Godot editörü açıldı! 🎉

---

## Proje Ayarlarını Yapılandıralım

Oyunun ekran boyutunu ve bazı temel ayarlarını belirleyelim. Üst menüden **Project → Project Settings** yolunu izleyin.

### Ekran Boyutu

**Display → Window** sekmesine gelin:

| Ayar | Değer |
|------|-------|
| Viewport Width | `480` |
| Viewport Height | `720` |
| Window Width Override | `480` |
| Window Height Override | `720` |

> 💡 Uzay nişancı oyunları klasik olarak dikey (portrait) ekran düzeninde olur. Gemimiz aşağıda, düşmanlar yukarıdan aşağı iner. 480×720 bu tür oyunlar için dengeli bir çözünürlük.

### Pencere Modu

Aynı sekme içinde:
- **Mode** → `windowed`
- **Stretch → Mode** → `canvas_items`
- **Stretch → Aspect** → `keep`

> 💡 Bu ayarlar sayesinde oyun farklı ekran boyutlarında orantılı görünür, uzar ya da sıkışmaz.

Ayarları kaydedip pencereyi kapatın.

---

## Klasör Yapısını Oluşturalım

Proje büyüdükçe dosyalar karmaşıklaşabilir. Şimdiden düzenli bir yapı kurmak ileride çok işimize yarayacak.

Godot editörünün sol alt köşesinde **FileSystem** paneli var. Burada `res://` kök klasörünü görürsünüz.

Aşağıdaki klasörleri oluşturun. Bunun için `res://` üzerine sağ tıklayın ve **"New Folder"** seçeneğini kullanın:
```
res://
├── scenes/         # Tüm .tscn sahne dosyaları
├── scripts/        # Tüm .gd script dosyaları
├── assets/
│   ├── sprites/    # Görseller (.png, .svg)
│   ├── sounds/     # Ses dosyaları (.wav, .ogg)
│   └── fonts/      # Yazı tipleri
```

> 💡 Şu an bu klasörler boş, sorun değil. Proje ilerledikçe dolacaklar. Ama yapıyı baştan kurmak, ileride "bu dosyayı nereye koydum?" derdini ortadan kaldırır.

---

## İlk Sahneyi Oluşturalım

Şimdi oyunun ana sahnesini oluşturacağız. Bu sahne tüm oyunun "kabı" olacak.

1. Üst menüden **Scene → New Scene** seçin
2. **"2D Scene"** seçeneğine tıklayın

Scene hiyerarşisi panelinde `Node2D` adlı bir kök node oluştu.

### Kök Node'u Yeniden Adlandırın

`Node2D` üzerine çift tıklayın ve adını `Main` olarak değiştirin.

> 💡 Kök node'un adı hem sahnenizi tanımlar hem de ileride script yazarken referans olur. `Main` adı "bu oyunun ana sahnesi" mesajını açıkça veriyor.

### Sahneyi Kaydedin

`Ctrl + S` ile sahneyi kaydedin. Kayıt konumu olarak `res://scenes/` klasörünü seçin ve dosya adını `main.tscn` yapın.

---

## Arka Plan Rengini Ayarlayalım

Şu an sahne tamamen gri görünüyor. Uzay teması için siyah bir arka plan daha uygun olur.

Üst menüden **Project → Project Settings → Rendering → Environment** sekmesine gelin:

- **Default Clear Color** → Siyah (`#000000`) seçin

Artık sahneniz siyah bir arka planla görünüyor. Uzayın ilk adımı atıldı! 🌌

---

## Ana Sahneyi Belirleyelim

Godot'a "oyun başladığında hangi sahneyi aç?" dememiz gerekiyor.

**Project → Project Settings → Application → Run** sekmesine gelin:

- **Main Scene** → `res://scenes/main.tscn` dosyasını seçin

Artık `F5` tuşuna bastığınızda Godot otomatik olarak bu sahneyi açacak.

---

## Test Edelim

`F5` tuşuna basın. Siyah bir pencere açılmalı — bu tamamen normal ve doğru! Henüz sahnede hiçbir şey yok ama proje çalışıyor.

Pencereyi kapatın.

---

## Bölüm Özeti

Bu bölümde şunları yaptık:

- Godot 4 projesi oluşturduk
- Ekran boyutunu ve stretch ayarlarını yapılandırdık
- Düzenli bir klasör yapısı kurduk
- Ana sahneyi (`main.tscn`) oluşturduk ve kaydettik
- Projeyi başarıyla çalıştırdık

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='zL44OM_wC0s' %}

---

## Sıradaki Bölüm

**Bölüm 2'de** uzay gemimizi oluşturacak ve klavyeyle hareket ettireceğiz. Godot'un input sistemi ve `CharacterBody2D` node'u ile tanışacaksınız.

Görüşmek üzere! 🚀
