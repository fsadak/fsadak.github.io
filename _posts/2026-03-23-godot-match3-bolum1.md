---
title: "Godot Engine Oyun Mekanikleri - Bölüm 1: Candy Blast — Proje Kurulumu ve Sahne Yapısı"
date: 2026-03-23 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri]
tags: [godot, gdscript, 2d, match-3, candy-blast, proje-kurulumu]
permalink: /godot-oyun-mekanikleri-bolum-1/
published: true
---

Bu bölümde Godot'da projenin temel ayarlarını yapacak, ana sahneyi oluşturacak ve grid arka planını ekrana yerleştireceğiz.

---

## 1.1 — Proje Ayarları

Godot Editor'de projeniz zaten açık. Önce ekran çözünürlüğünü ve ölçekleme ayarlarını yapalım.

**Adımlar:**

1. Üst menüden **Project → Project Settings** açın
2. Sol taraftaki listeden **Display → Window** seçin
3. Şu değerleri girin:

| Ayar | Değer |
|------|-------|
| **Viewport Width** | `576` |
| **Viewport Height** | `1024` |
| **Window Width Override** | `576` |
| **Window Height Override** | `1024` |

4. Aynı sayfada aşağı kaydırın, **Stretch** bölümünü bulun:

| Ayar | Değer |
|------|-------|
| **Mode** | `canvas_items` |
| **Aspect** | `keep` |

**Bu ayarlar ne yapıyor?**

- **Viewport Width/Height:** Oyununuzun tasarım çözünürlüğü. Tüm koordinatları bu boyuta göre yazacaksınız.
- **Window Width/Height Override:** Godot Editor'de "Play" dediğinizde açılan test penceresinin boyutu.
- **Stretch Mode = canvas_items:** Oyun farklı boyutta bir ekranda açılırsa Godot tüm görselleri otomatik olarak ölçekler. Yani siz 576x1024'e göre tasarlarsınız, 1080x1920 ekranda otomatik büyür.
- **Stretch Aspect = keep:** En-boy oranını korur. Ekran oranı farklıysa kenarlara siyah bant (letterbox) koyar, görseller bozulmaz.

5. Project Settings penceresini kapatın.

---

## 1.2 — Ana Sahneyi Oluşturma

Şimdi oyunun ana sahnesini oluşturacağız. Godot'da her şey **sahne (scene)** ve **düğüm (node)** yapısıyla çalışır. Bir sahne, bir ağaç gibi iç içe düğümlerden oluşur.

**Adımlar:**

1. Sol üstteki **Scene** panelinde **"+ Other Node"** butonuna tıklayın (veya Ctrl+A)
2. Açılan pencerede arama kutusuna `Node2D` yazın
3. **Node2D** seçin ve **Create** butonuna basın

> **Node2D nedir?** Godot'da 2D oyunlar için temel düğüm tipidir. Bir pozisyonu (x, y) vardır ve altına başka düğümler ekleyerek sahnenizi inşa edersiniz. Kendi başına görsel bir şey çizmez ama diğer tüm 2D düğümlerin atasıdır.

4. Sol panelde oluşan **Node2D** düğümüne çift tıklayın ve ismini **Game** olarak değiştirin

5. **Ctrl+S** ile sahneyi kaydedin. Kayıt yerini proje kök dizini olarak bırakın, dosya adı `game.tscn` olsun.

---

## 1.3 — Grid Arka Planını Ekleme

Şimdi grid görselini sahneye ekleyeceğiz. Grid oyun tahtamızın arka planı olacak.

**Adımlar:**

1. Sol panelde **Game** düğümünü seçin
2. **Ctrl+A** ile yeni düğüm ekleyin
3. Arama kutusuna `Sprite2D` yazın, **Sprite2D** seçin ve **Create** butonuna basın

> **Sprite2D nedir?** Ekrana bir görsel (texture) çizen düğümdür. Bir PNG dosyası verirsiniz, o görseli sahneye koyar.

4. Oluşan düğümün ismini **Grid** olarak değiştirin (çift tıklayarak)

5. Sol panelde **Grid** düğümü seçiliyken, sağ taraftaki **Inspector** paneline bakın
6. **Texture** özelliğinin yanındaki boş alana, **FileSystem** panelinden (sol alt) `res://assets/images/grid.png` dosyasını **sürükle-bırak** yapın

Şimdi grid görseli sahnenizde görünecek ama pozisyonu yanlış olacak. Onu ekranın ortasına hizalayalım.

---

## 1.4 — Grid'i Konumlandırma

Grid'i ekranın tam ortasına, ama biraz yukarıda (üstte skor alanı için yer bırakarak) konumlandıracağız.

**Inspector** panelinde **Grid** düğümü seçiliyken:

1. **Transform → Position** bölümünü bulun
2. Şu değerleri girin:
   - **x:** `288`
   - **y:** `480`

**Bu sayılar nereden geliyor?**

- Ekran genişliği 576px, yarısı **288** → grid yatayda tam ortalanır
- Grid'i dikeyde biraz yukarı kaydırdık. Ekranın tam ortası 512 olurdu ama üstte skor/hamle bilgisi göstereceğimiz için 480 iyi bir değer.
- Sprite2D varsayılan olarak görseli **merkezinden** konumlandırır. Yani 288,480 dediğinizde grid'in merkezi o noktaya gelir.

---

## 1.5 — Arka Plan Rengini Ayarlama

Varsayılan gri arka plan oyunumuza uymaz. Koyu bir arka plan yapalım.

1. **Project → Project Settings** açın
2. Sol listeden **Rendering → Environment** seçin
3. **Default Clear Color** ayarını bulun ve tıklayın
4. Renk seçiciden koyu bir renk seçin. Önerim: `#1a1a2e` (koyu lacivert)
5. Pencereyi kapatın

---

## 1.6 — İlk Test

Sahneyi test etmeden önce, bu sahneyi ana sahne olarak ayarlamanız gerekiyor.

1. **Ctrl+S** ile kaydedin
2. **F5** tuşuna basın (veya üstteki ▶ butonu)
3. Godot size "ana sahne seçili değil" diyecek → **Select Current** butonuna basın

Şimdi 576x1024 boyutunda bir pencere açılacak. Koyu arka plan üzerinde grid görselini ortalanmış olarak görmelisiniz.

---

## Bölüm 1 Sonucu

Bu noktada şunu görüyor olmalısınız:

```
┌──────────────────────┐
│                      │
│   (skor alanı için   │
│    boş alan)         │
│                      │
│   ┌───────────────┐  │
│   │ 8x8 Grid      │  │
│   │ (mor çizgili  │  │
│   │  kare ızgara) │  │
│   │               │  │
│   └───────────────┘  │
│                      │
│      (alt boşluk)    │
│                      │
└──────────────────────┘
```

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='iP-YtOrW-4g' %}

---

Grid ortalanmış ve koyu arka plan üzerinde görünüyorsa **Bölüm 1 tamamdır!**

> **Sonraki bölümde:** Grid'in arkasındaki veri yapısını (8x8 dizi) oluşturacak ve şekerleri rastgele yerleştireceğiz.
