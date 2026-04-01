---
title: "Godot Engine Oyun Mekanikleri - Bölüm 10: Candy Blast — Patlama Efekti: Spritesheet Animasyonu"
date: 2026-03-31 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Mekanikleri - Candy Blast]
tags: [godot, gdscript, 2d, match-3, candy-blast, animasyon, spritesheet, efekt]
description: "Godot'da spritesheet ile patlama efekti animasyonu: AnimatedSprite2D, kare hızı ve şekerlerin yok olma efekti. Türkçe eğitim."
permalink: /godot-oyun-mekanikleri-bolum-10/
published: true
---

# Bölüm 10: Patlama Efekti — Spritesheet Animasyonu

Oyunumuzu şu ana kadar test ettiyseniz fark etmişsinizdir: şekerler eşleştiğinde aniden yok oluyor. Bir kare önce orada duran şekerler, bir sonraki kare yerçekimiyle aşağı kayıyor. Oyuncu neyin eşleştiğini, neyin patladığını fark edemiyor. Bu bölümde bu sorunu çözeceğiz.

**Ne yapacağız?** Her şeker patladığında o şekerin bulunduğu pozisyonda bir patlama animasyonu oynatacağız. Üstelik **tüm patlamalar bitmeden yerçekimi başlamayacak** — yani oyuncu önce patlamaları izleyecek, sonra şekerler aşağı düşecek.

Bunun için projemizde zaten bulunan `explosion.png` dosyasını kullanacağız. Bu dosya tek bir görselmiş gibi görünse de aslında içinde 8 farklı animasyon karesi barındıran bir **spritesheet**'tir.

**Bu bölümde öğrenecekleriniz:**

- Spritesheet nedir, neden kullanılır ve nasıl çalışır
- `AtlasTexture` ile büyük bir görselden istediğimiz bölgeyi nasıl keseriz
- `SpriteFrames` kaynağını kod tarafında nasıl oluştururuz
- `AnimatedSprite2D` node'u ile runtime sırasında animasyon nasıl oynatılır
- `animation_finished` sinyali ile animasyon bittiğinde nasıl aksiyon alınır
- Oyun akışını animasyona nasıl bağlarız (yerçekimini animasyon bitene kadar bekletme)

---

## 10.1 — Spritesheet Nedir?

Oyun geliştirmede animasyon oluşturmanın en yaygın yollarından biri **spritesheet** kullanmaktır. Spritesheet, bir animasyonun tüm karelerini tek bir görsel dosyasında yan yana (veya alt alta) dizen bir tekniktir.

Neden her kareyi ayrı dosya olarak kaydetmek yerine tek dosyada birleştiriyoruz? Bunun iki önemli sebebi var:

1. **Performans:** GPU tek bir büyük texture'ı yükleyip farklı bölgelerini çizmek konusunda çok verimlidir. 8 ayrı dosya yüklemek yerine 1 dosya yüklemek hem bellek hem de işlem gücü açısından avantajlıdır.
2. **Organizasyon:** 8 ayrı dosya yerine tek dosya yönetmek çok daha pratiktir. Özellikle onlarca animasyonun olduğu projelerde dosya sayısı kontrolden çıkabilir.

Bizim `explotion.png` dosyamızın yapısı şöyle:

- **Toplam boyut:** 560×280 piksel
- **Düzen:** 4 sütun × 2 satır = **8 kare**
- **Her karenin boyutu:** 560÷4 = **140px** genişlik, 280÷2 = **140px** yükseklik

Bunu bir tablo gibi düşünebilirsiniz:

```
          Sütun 0   Sütun 1   Sütun 2   Sütun 3
        ┌─────────┬─────────┬─────────┬─────────┐
Satır 0 │ Kare 0  │ Kare 1  │ Kare 2  │ Kare 3  │
        │ (0,0)   │ (140,0) │ (280,0) │ (420,0) │
        ├─────────┼─────────┼─────────┼─────────┤
Satır 1 │ Kare 4  │ Kare 5  │ Kare 6  │ Kare 7  │
        │ (0,140) │(140,140)│(280,140)│(420,140)│
        └─────────┴─────────┴─────────┴─────────┘
          140px     140px     140px     140px
```

Her karenin sol üst köşesinin koordinatı parantez içinde gösterilmiştir. Kare 0 görselin sol üst köşesinden başlar `(0, 0)`, Kare 1 bir sütun sağda `(140, 0)`, Kare 4 bir satır aşağıda `(0, 140)` şeklinde devam eder.

Oyunda bu 8 kareyi sırayla çok hızlı gösterdiğimizde (saniyede 14 kare), gözümüz bunu akıcı bir patlama animasyonu olarak algılar. Bu, flip book (yaprak çevirme) animasyonu prensibiyle aynıdır.

---

## 10.2 — Planda Ne Değişecek?

Şu anda oyunumuzdaki eşleşme akışı şöyle çalışıyor:

```
1. Eşleşme bulunur
2. Eşleşen şekerler anında silinir
3. Yerçekimi uygulanır (şekerler aşağı düşer)
4. Yeni şekerler yukarıdan gelir
```

2. adımdan 3. adıma geçiş anlık olduğu için oyuncu patlamayı göremez. Yeni akışımız şöyle olacak:

```
1. Eşleşme bulunur
2. Eşleşen şekerler silinir
3. ★ HER ŞEKERİN POZİSYONUNDA PATLAMA ANİMASYONU OYNAR ★
4. Tüm patlamalar bitene kadar beklenir
5. Yerçekimi uygulanır (şekerler aşağı düşer)
6. Yeni şekerler yukarıdan gelir
```

Bunu başarmak için şu stratejiyi izleyeceğiz:

- Her şeker silindiğinde, o şekerin piksel pozisyonunu bir listeye kaydedeceğiz
- Silme işlemi tamamlandıktan sonra, listedeki her pozisyonda bir patlama animasyonu başlatacağız
- Tüm animasyonlar bittiğinde, yerçekimi fonksiyonunu **callback** olarak çağıracağız

---

## 10.3 — Yeni Sabit ve Değişkenler

Kodumuzun başında birkaç yeni tanımlama yapmamız gerekiyor.

**Sabitler bölümüne** (`SAVE_PATH` satırının altına) şu satırı ekleyin:

```gdscript
const EXPLOSION_SCALE := 0.5
```

Bu sabit patlama animasyonunun ekrandaki boyutunu belirler. Spritesheet'teki her kare 140×140 pikseldir. `0.5` ölçeğiyle 140 × 0.5 = **70 piksel** olur. Bu, hücre boyutu olan 64 pikselden biraz büyüktür — patlamanın şekerin biraz dışına taşması görsel olarak daha etkileyici olur. Eğer daha büyük veya küçük patlama isterseniz bu değeri değiştirebilirsiniz (örneğin `0.4` daha küçük, `0.7` daha büyük patlama verir).

**Değişkenler bölümüne** (`high_score` satırının altına) şu dört satırı ekleyin:

```gdscript
var explosion_spritesheet: Texture2D
var explosion_frames: SpriteFrames
var pending_explosions := []
var active_explosions := 0
```

Her birinin ne işe yaradığını açıklayalım:

- **`explosion_spritesheet`** — `explosion.png` dosyasının bellekteki hali. Tip olarak `Texture2D` kullanıyoruz çünkü Godot'ta tüm 2D görseller bu sınıftan türer. Bu değişkeni doğrudan ekrana çizmeyeceğiz — bundan kare kare parçalar keseceğiz.

- **`explosion_frames`** — `SpriteFrames` tipinde bir kaynak. Bu, Godot'un animasyon sistemi için hazırlanmış bir veri yapısıdır. İçinde "explode" adında bir animasyon olacak ve bu animasyon 8 kareden oluşacak. `AnimatedSprite2D` node'u bu kaynağı kullanarak animasyonu oynatacak.

- **`pending_explosions`** — Patlama oynatılacak pozisyonların listesi. Şekerler silinirken her şekerin piksel pozisyonu bu listeye eklenir. Silme işlemi tamamlandıktan sonra bu listedeki her pozisyonda bir patlama animasyonu başlatılır. Tip olarak boş `Array` (`[]`) ile başlatıyoruz çünkü içine `Vector2` değerleri ekleyeceğiz.

- **`active_explosions`** — Şu anda ekranda kaç patlama animasyonunun oynadığını takip eden bir sayaç. Her animasyon başladığında bu sayaç artar, bittiğinde azalır. **Sayaç sıfıra düştüğünde** tüm patlamalar bitmiş demektir ve yerçekimi başlatılır. Bu mekanizma, farklı zamanlarda biten birden fazla animasyonu koordine etmemizi sağlar.

---

## 10.4 — Spritesheet'i Yükleme

Patlama görselini oyun başladığında belleğe yüklememiz gerekiyor. Daha sonra bu görselden animasyon kareleri oluşturacağız.

**`_load_textures()` fonksiyonunun sonuna** şu iki satırı ekleyin:

```gdscript
	explosion_spritesheet = load("res://assets/images/explosion.png")
	explosion_frames = _create_explosion_frames()
```

İlk satır `explosion.png` dosyasını diskten okuyup `Texture2D` olarak belleğe yükler. `load()` fonksiyonu Godot'un kaynak yükleme sistemidir — dosya yolunu verirsiniz, o da uygun tipte bir kaynak döner.

İkinci satır birazdan yazacağımız `_create_explosion_frames()` fonksiyonunu çağırır. Bu fonksiyon spritesheet'i 8 kareye bölüp bir `SpriteFrames` kaynağı oluşturur. Fonksiyonun dönüş değerini `explosion_frames` değişkeninde saklıyoruz çünkü her patlama animasyonu için aynı `SpriteFrames` kaynağını yeniden kullanacağız — her seferinde yeniden oluşturmak gereksiz olurdu.

---

## 10.5 — SpriteFrames Oluşturma (Spritesheet'ten Animasyon Karelerini Kesme)

Bu bölümün en kritik fonksiyonu budur. Spritesheet'teki 560×280 piksellik görseli 8 adet 140×140 piksellik kareye bölüp, bunlardan bir animasyon oluşturacağız.

**`_load_textures()` fonksiyonunun hemen altına** şu fonksiyonu ekleyin:

```gdscript
func _create_explosion_frames() -> SpriteFrames:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("explode")
	frames.set_animation_speed("explode", 14)
	frames.set_animation_loop("explode", false)

	for row in 2:
		for col in 4:
			var atlas := AtlasTexture.new()
			atlas.atlas = explosion_spritesheet
			atlas.region = Rect2(col * 140, row * 140, 140, 140)
			frames.add_frame("explode", atlas)

	return frames
```

Bu fonksiyon biraz karmaşık göründüğü için her satırı teker teker açıklayalım:

**`var frames := SpriteFrames.new()`** — Yeni bir `SpriteFrames` kaynağı oluşturuyoruz. `SpriteFrames`, Godot'un animasyonlu sprite'lar için kullandığı veri yapısıdır. Bir `SpriteFrames` birden fazla animasyon barındırabilir (örneğin "walk", "run", "idle" gibi). Her animasyon kendi kare listesine, hızına ve döngü ayarına sahiptir. Biz sadece bir animasyon kullanacağız: "explode".

**`frames.remove_animation("default")`** — Her yeni `SpriteFrames` otomatik olarak "default" adında boş bir animasyonla oluşturulur. Biz kendi animasyonumuzu oluşturacağımız için bu varsayılan animasyonu siliyoruz. Silmezsek de bir şey bozulmaz ama gereksiz bir animasyon kalır.

**`frames.add_animation("explode")`** — "explode" adında yeni bir animasyon ekliyoruz. Bu isim önemli çünkü animasyonu oynatırken `anim.play("explode")` şeklinde bu ismi kullanacağız.

**`frames.set_animation_speed("explode", 14)`** — Animasyonun hızını **saniyede 14 kare** (14 FPS) olarak ayarlıyoruz. 8 karemiz olduğuna göre toplam süre 8 ÷ 14 ≈ **0.57 saniye** olur. Bu, bir patlama için ideal bir süre — çok kısa olursa oyuncu göremez, çok uzun olursa oyunu yavaşlatır. İsterseniz bu değeri değiştirebilirsiniz: 10 FPS ile ~0.8 saniye (daha dramatik), 20 FPS ile ~0.4 saniye (daha hızlı).

**`frames.set_animation_loop("explode", false)`** — Döngüyü kapatıyoruz. Yani animasyon Kare 0'dan Kare 7'ye kadar bir kez oynar ve durur. `true` yaparsanız patlama sonsuza kadar tekrar eder ki bu istenmeyen bir davranış olur.

**İç içe döngü (`for row in 2: for col in 4:`)** — Bu döngü spritesheet'teki 8 kareyi sırasıyla dolaşır. `row` değişkeni 0 ve 1 değerlerini, `col` değişkeni 0, 1, 2 ve 3 değerlerini alır. Döngü sırası: (0,0), (0,1), (0,2), (0,3), (1,0), (1,1), (1,2), (1,3) — yani önce üst satır soldan sağa, sonra alt satır soldan sağa.

**`var atlas := AtlasTexture.new()`** — Her kare için bir `AtlasTexture` oluşturuyoruz. `AtlasTexture`, Godot'ta büyük bir texture'ın belirli bir dikdörtgen bölgesine referans tutan özel bir texture tipidir. Onu bir "pencere" gibi düşünebilirsiniz: büyük görselin üzerine bir pencere koyuyorsunuz ve sadece pencereden görünen kısmı kullanıyorsunuz.

**`atlas.atlas = explosion_spritesheet`** — Pencereyi hangi görselin üzerine koyacağımızı belirtiyoruz. Tüm kareler aynı spritesheet'ten kesileceği için hepsi aynı kaynağı referans alır.

**`atlas.region = Rect2(col * 140, row * 140, 140, 140)`** — Pencenin konumunu ve boyutunu belirliyoruz. `Rect2` dört parametre alır: `(x, y, genişlik, yükseklik)`. Örneğin:
  - Kare 0 (row=0, col=0): `Rect2(0, 0, 140, 140)` → sol üst köşe
  - Kare 1 (row=0, col=1): `Rect2(140, 0, 140, 140)` → üst satır, ikinci sütun
  - Kare 4 (row=1, col=0): `Rect2(0, 140, 140, 140)` → alt satır, ilk sütun
  - Kare 7 (row=1, col=3): `Rect2(420, 140, 140, 140)` → sağ alt köşe

**`frames.add_frame("explode", atlas)`** — Kestiğimiz kareyi "explode" animasyonuna ekliyoruz. Kareler eklenme sırasıyla oynatılır, yani döngümüz sırasıyla Kare 0'dan Kare 7'ye kadar tüm kareleri doğru sırada ekler.

**`return frames`** — Hazırlanan `SpriteFrames` kaynağını döndürüyoruz. Bu kaynak `explosion_frames` değişkeninde saklanacak ve her patlama animasyonunda yeniden kullanılacak.

---

## 10.6 — Patlama Efektini Oynatma Fonksiyonu

Şimdi toplanan pozisyonlarda patlama animasyonlarını başlatan fonksiyonu yazacağız. Bu fonksiyon bir **callback** parametresi alır — tüm patlamalar bittiğinde bu callback çağrılır (bizim durumumuzda yerçekimi fonksiyonu).

**`_clear_cell()` fonksiyonunun altına** şu fonksiyonu ekleyin:

```gdscript
func _play_explosions(callback: Callable) -> void:
	if pending_explosions.is_empty():
		callback.call()
		return

	active_explosions = pending_explosions.size()
	for pos in pending_explosions:
		var anim := AnimatedSprite2D.new()
		anim.sprite_frames = explosion_frames
		anim.position = pos
		anim.scale = Vector2(EXPLOSION_SCALE, EXPLOSION_SCALE)
		add_child(anim)
		anim.play("explode")
		anim.animation_finished.connect(func() -> void:
			anim.queue_free()
			active_explosions -= 1
			if active_explosions <= 0:
				callback.call()
		)
	pending_explosions.clear()
```

Bu fonksiyonu satır satır inceleyelim:

**`func _play_explosions(callback: Callable) -> void:`** — Fonksiyon bir `Callable` parametresi alır. `Callable`, Godot'ta "çağrılabilir" anlamına gelir — bir fonksiyona referanstır. Biz bu fonksiyonu `_play_explosions(_apply_gravity_and_fill)` şeklinde çağıracağız, yani `callback` değişkeni `_apply_gravity_and_fill` fonksiyonunu temsil edecek. Bu pattern'e programlamada **callback pattern** denir: "şunu yap, bitince bunu çağır".

**`if pending_explosions.is_empty():`** — Patlama listesi boşsa hiç animasyon oynatmaya gerek yoktur. Bu durum, eşleşme bulunamadığında veya tüm hücreler zaten temizlenmiş olduğunda ortaya çıkabilir. Boş listeyle devam edersek sayaç sıfırda kalır ve callback asla çağrılmaz — oyun donar.

**`callback.call()`** — Callback fonksiyonunu çağırır. `callback` değişkeni `_apply_gravity_and_fill` fonksiyonuna referans tutuyorsa, bu satır `_apply_gravity_and_fill()` çağırmakla aynı şeydir. `return` ile fonksiyondan çıkıyoruz çünkü patlama yoksa animasyon oluşturmaya gerek yok.

**`active_explosions = pending_explosions.size()`** — Sayacı ayarlıyoruz. Diyelim listede 5 pozisyon var — sayaç 5 olur. Her animasyon bittiğinde sayaç 1 azalacak. Sayaç 0'a düştüğünde tüm patlamalar bitmiş demektir.

**`for pos in pending_explosions:`** — Listedeki her pozisyon için döngü başlatıyoruz. Her pozisyon bir `Vector2` değeridir (piksel koordinatı). Her bir pozisyonda bir patlama animasyonu oluşturacağız.

**`var anim := AnimatedSprite2D.new()`** — Yeni bir `AnimatedSprite2D` node'u oluşturuyoruz. `AnimatedSprite2D`, Godot'ta kare kare animasyon oynatmak için kullanılan temel node'dur. Normal `Sprite2D`'den farkı, tek bir texture göstermek yerine `SpriteFrames` kaynağından sırayla kareleri göstermesidir.

**`anim.sprite_frames = explosion_frames`** — Daha önce oluşturduğumuz `SpriteFrames` kaynağını bu node'a atıyoruz. Önemli bir detay: tüm patlama animasyonları **aynı** `SpriteFrames` kaynağını paylaşır. Bu, bellekte tek bir animasyon tanımının tutulması anlamına gelir — 10 patlama için 10 ayrı `SpriteFrames` oluşturmuyoruz.

**`anim.position = pos`** — Patlama animasyonunu, silinen şekerin bulunduğu piksel pozisyonuna yerleştiriyoruz. Böylece patlama tam olarak şekerin olduğu yerde görünür.

**`anim.scale = Vector2(EXPLOSION_SCALE, EXPLOSION_SCALE)`** — Patlama boyutunu ayarlıyoruz. `EXPLOSION_SCALE` değeri `0.5` olduğundan, 140 piksellik kare 70 piksele küçülür. Bu, 64 piksellik hücre boyutundan biraz büyüktür — patlama şekeri biraz aşar ama abartılı görünmez.

**`add_child(anim)`** — Oluşturduğumuz `AnimatedSprite2D` node'unu sahneye ekliyoruz. Godot'ta bir node sahneye eklenmedikçe ekranda görünmez. `add_child()` çağrıldığı anda node sahne ağacına dahil olur ve çizilmeye başlar.

**`anim.play("explode")`** — "explode" animasyonunu başlatıyoruz. Bu, `_create_explosion_frames()` fonksiyonunda oluşturduğumuz 8 karelik animasyonun Kare 0'dan oynatılmaya başlaması demektir. Animasyon saniyede 14 kare hızıyla ilerler ve Kare 7'de durur (döngü kapalı olduğu için).

**`anim.animation_finished.connect(func() -> void:`** — Bu satır çok önemli. `animation_finished`, `AnimatedSprite2D`'nin yerleşik bir **sinyalidir** (signal). Animasyon son karesini oynatıp durduğunda bu sinyal otomatik olarak tetiklenir. Biz bu sinyale anonim bir fonksiyon (lambda) bağlıyoruz. Yani: "animasyon bittiğinde şu kodu çalıştır" demiş oluyoruz.

**`anim.queue_free()`** — Animasyon biten sprite'ı sahneden siliyoruz. `queue_free()`, node'u bir sonraki frame'de güvenli bir şekilde kaldırır. Animasyon bitmiş patlama efektinin ekranda kalmasını istemeyiz.

**`active_explosions -= 1`** — Sayacı 1 azaltıyoruz. Her animasyon bağımsız çalıştığı için farklı zamanlarda bitebilir. Sayaç bize kaçının hâlâ oynadığını söyler.

**`if active_explosions <= 0: callback.call()`** — Bu satır tüm sistemi bir arada tutan kilit noktadır. Sayaç sıfıra düştüğünde, yani ekrandaki **son** patlama da bittiğinde, callback fonksiyonunu çağırıyoruz. Callback `_apply_gravity_and_fill` olduğu için yerçekimi ancak bu noktada başlar. Böylece oyuncu önce tüm patlamaları görür, sonra şekerler düşmeye başlar.

**`pending_explosions.clear()`** — Döngü bittikten sonra listeyi temizliyoruz. Pozisyonlar artık `AnimatedSprite2D` node'larına dönüştüğü için listede tutmaya gerek yoktur.

---

## 10.7 — Patlama Pozisyonlarını Toplama

Patlama pozisyonlarını toplamak için en doğal yer `_clear_cell()` fonksiyonudur. Bu fonksiyon her şeker silindiğinde çağrılır — ister normal eşleşmeden, ister bonus aktivasyonundan, ister zincirleme reaksiyondan olsun. Dolayısıyla burada pozisyon kaydedersek tüm senaryoları tek noktada yakalarız.

**`_clear_cell()` fonksiyonunu** şu şekilde güncelleyin:

```gdscript
func _clear_cell(cell: Vector2i) -> void:
	if not _is_valid_cell(cell):
		return
	if grid[cell.x][cell.y] == "":
		return

	var cell_type: String = grid[cell.x][cell.y]

	# Patlama pozisyonunu kaydet
	pending_explosions.append(_grid_to_pixel(cell.x, cell.y))

	# Önce hücreyi temizle (sonsuz döngüyü önler)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

	# Silinen hücre bonus ise → zincirleme tetikle
	if BONUS_TYPES.has(cell_type):
		_add_bonus_score(cell_type)
		match cell_type:
			"arrow_h":
				_activate_arrow_h(cell)
			"arrow_v":
				_activate_arrow_v(cell)
			"bomb":
				_activate_bomb(cell)
			"rainbow":
				_activate_rainbow()
```

**Eklenen satır:** `pending_explosions.append(_grid_to_pixel(cell.x, cell.y))`

Bu tek satır, silinen **her** şekerin piksel pozisyonunu listeye ekler. `_grid_to_pixel()` fonksiyonu grid koordinatını (satır, sütun) piksel koordinatına (x, y) çevirir — yani şekerin ekranda göründüğü noktayı döner.

Neden bu satırı hücre temizlenmeden **önce** ekliyoruz? Çünkü hücre temizlendikten sonra `grid[cell.x][cell.y]` boş string olur ve fonksiyonun başındaki `""` kontrolü ikinci bir çağrıda erken çıkmaya neden olur. Ama pozisyon kaydı herhangi bir veri değişikliğinden önce yapılmalıdır — şekerin orada olduğunu biliyoruz, pozisyonunu kaydetmemiz yeterli.

Bu yaklaşımın güzelliği şudur: `_clear_cell()` fonksiyonu hem normal eşleşmelerde, hem bonus zincirleme reaksiyonlarında, hem de bonus efektleri sırasında (arrow, bomb, rainbow) çağrılır. Dolayısıyla tek bir noktada pozisyon toplamak, tüm senaryolarda patlama efekti gösterilmesini sağlar.

---

## 10.8 — Oyun Akışını Güncelleme

Şimdi mevcut akışı değiştireceğiz. Üç fonksiyonda düzenleme yapacağız: `_on_swap_finished()`, `_check_chain_matches()` ve `_activate_bonus()`.

### `_on_swap_finished()` Güncelleme

Bu fonksiyon, iki şeker yer değiştirdikten sonra çağrılır. Eşleşme varsa şekerleri siler ve yerçekimini başlatır. Şimdi araya patlama animasyonunu ekliyoruz.

**Fonksiyonu şu şekilde değiştirin:**

```gdscript
func _on_swap_finished() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		pending_explosions.clear()
		_remove_matches(matches)
		_play_explosions(_apply_gravity_and_fill)
	else:
		_reverse_swap()
```

**Öncekinden farkı** iki satırdır:

1. **`pending_explosions.clear()`** — Yeni bir eşleşme turu başlıyor, bu yüzden önceki turdan kalma patlama pozisyonlarını temizliyoruz. Bu adım önemlidir çünkü listede eski pozisyonlar kalırsa yerçekiminden sonra yanlış yerlerde patlama görülebilir.

2. **`_play_explosions(_apply_gravity_and_fill)`** — Eskiden `_apply_gravity_and_fill()` doğrudan çağrılıyordu. Şimdi ise `_play_explosions()` fonksiyonuna **callback olarak** geçiriyoruz. Dikkat edin: `_apply_gravity_and_fill` yazıyoruz, `_apply_gravity_and_fill()` değil — parantez yok. Parantez koymak fonksiyonu **çağırır**, parantez koymamak fonksiyona **referans** verir. Biz fonksiyonu şimdi çağırmak istemiyoruz, patlamalar bittiğinde çağrılmasını istiyoruz.

### `_check_chain_matches()` Güncelleme

Bu fonksiyon yerçekimi ve doldurma sonrası tekrar eşleşme kontrolü yapar (zincirleme eşleşmeler). Aynı pattern'i burada da uyguluyoruz.

**Fonksiyonu şu şekilde değiştirin:**

```gdscript
func _check_chain_matches() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		pending_explosions.clear()
		_remove_matches(matches)
		_play_explosions(_apply_gravity_and_fill)
	else:
		is_animating = false
		_check_level_status()
```

Buradaki değişiklik `_on_swap_finished()` ile aynıdır: `pending_explosions.clear()` ile listeyi temizle, ardından `_play_explosions(_apply_gravity_and_fill)` ile patlamaları oynat. Zincirleme eşleşmelerde de oyuncu patlamaları görecek.

### `_activate_bonus()` Güncelleme

Bu fonksiyon oyuncu bir bonus şekere doğrudan tıkladığında çağrılır. Bonus şekerin kendisi `_clear_cell()` üzerinden silinmez (manuel olarak temizlenir), bu yüzden bonus pozisyonunu burada ayrıca eklememiz gerekiyor.

**Fonksiyonu şu şekilde değiştirin:**

```gdscript
func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true
	pending_explosions.clear()
	pending_explosions.append(_grid_to_pixel(cell.x, cell.y))

	_add_bonus_score(bonus_type)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		"arrow_v":
			_activate_arrow_v(cell)
		"bomb":
			_activate_bomb(cell)
		"rainbow":
			_activate_rainbow()

	_play_explosions(_apply_gravity_and_fill)
```

**Değişiklikler:**

1. **`pending_explosions.clear()`** — Yeni bir bonus aktivasyonu başlıyor, listeyi temizliyoruz.
2. **`pending_explosions.append(_grid_to_pixel(cell.x, cell.y))`** — Bonus şekerin kendi pozisyonunu ekliyoruz. Bonus şeker `_clear_cell()` üzerinden geçmediği için (manuel siliniyor) burada açıkça eklememiz gerekiyor.
3. **`_play_explosions(_apply_gravity_and_fill)`** — Eskiden `_apply_gravity_and_fill()` doğrudan çağrılıyordu, şimdi patlamalar üzerinden callback olarak geçiriliyor.

Bonus efektleri (`_activate_arrow_h/v`, `_activate_bomb`, `_activate_rainbow`) etkiledikleri hücreleri `_clear_cell()` aracılığıyla temizler. Ve artık `_clear_cell()` her çağrıda pozisyon kaydettiği için, bonusun etkilediği tüm hücrelerde de patlama efekti görünecektir. Örneğin bir arrow bonusu 8 hücreyi temizlerse, o satırdaki her hücrede ayrı patlama animasyonu oynar.

---

## 10.9 — Tam Kod (game.gd)

İşte `game.gd` dosyasının bu bölüm sonundaki tam hali:

```gdscript
extends Node2D

# --- Sabitler ---
const GRID_SIZE := 8
const CELL_SIZE := 64.0
const CANDY_SCALE := 0.63

const GRID_OFFSET := Vector2(24, 225)

const CANDY_TYPES := ["red", "yellow", "blue", "green", "purple"]
const BONUS_TYPES := ["arrow_h", "arrow_v", "bomb", "rainbow"]

const BASE_MOVES := 20
const BASE_TARGET := 1000
const TARGET_INCREMENT := 500
const SAVE_PATH := "user://save_data.json"
const EXPLOSION_SCALE := 0.5

# --- Değişkenler ---
var grid := []
var candy_sprites := []
var candy_textures := {}
var selected_cell := Vector2i(-1, -1)
var is_animating := false
var last_swap := [Vector2i(-1, -1), Vector2i(-1, -1)]

var score := 0
var moves_left := BASE_MOVES
var level := 1
var target_score := BASE_TARGET
var chain_count := 0
var popup_overlay: ColorRect = null
var total_score := 0
var high_score := 0
var explosion_spritesheet: Texture2D
var explosion_frames: SpriteFrames
var pending_explosions := []
var active_explosions := 0

func _ready() -> void:
	_load_textures()
	_load_game()
	_init_grid()
	_draw_candies()
	_setup_ui()

func _load_textures() -> void:
	for candy_name in CANDY_TYPES:
		var path: String = "res://assets/images/" + candy_name + ".png"
		candy_textures[candy_name] = load(path)
	for bonus_name in BONUS_TYPES:
		var path: String = "res://assets/images/" + bonus_name + ".png"
		candy_textures[bonus_name] = load(path)
	explosion_spritesheet = load("res://assets/images/explosion.png")
	explosion_frames = _create_explosion_frames()

func _create_explosion_frames() -> SpriteFrames:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("explode")
	frames.set_animation_speed("explode", 14)
	frames.set_animation_loop("explode", false)

	for row in 2:
		for col in 4:
			var atlas := AtlasTexture.new()
			atlas.atlas = explosion_spritesheet
			atlas.region = Rect2(col * 140, row * 140, 140, 140)
			frames.add_frame("explode", atlas)

	return frames

func _init_grid() -> void:
	grid.clear()
	for row in GRID_SIZE:
		var grid_row := []
		for col in GRID_SIZE:
			grid_row.append("")
		grid.append(grid_row)

	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var available := CANDY_TYPES.duplicate()
			if col >= 2 and grid[row][col - 1] == grid[row][col - 2]:
				available.erase(grid[row][col - 1])
			if row >= 2 and grid[row - 1][col] == grid[row - 2][col]:
				available.erase(grid[row - 1][col])
			grid[row][col] = available[randi() % available.size()]

func _draw_candies() -> void:
	candy_sprites.clear()
	for child in get_children():
		if child.name != "Grid" and child is not Label:
			child.queue_free()

	for row in GRID_SIZE:
		var sprite_row := []
		for col in GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				sprite_row.append(null)
				continue

			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
			sprite.position = _grid_to_pixel(row, col)
			add_child(sprite)
			sprite_row.append(sprite)
		candy_sprites.append(sprite_row)

func _setup_ui() -> void:
	var score_label: Label = $ScoreLabel
	score_label.position = Vector2(20, 10)
	score_label.size = Vector2(260, 40)
	score_label.add_theme_font_size_override("font_size", 24)
	score_label.add_theme_color_override("font_color", Color.WHITE)

	var moves_label: Label = $MovesLabel
	moves_label.position = Vector2(296, 10)
	moves_label.size = Vector2(260, 40)
	moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	moves_label.add_theme_font_size_override("font_size", 24)
	moves_label.add_theme_color_override("font_color", Color.WHITE)

	var level_label: Label = $LevelLabel
	level_label.position = Vector2(20, 50)
	level_label.size = Vector2(260, 35)
	level_label.add_theme_font_size_override("font_size", 20)
	level_label.add_theme_color_override("font_color", Color.YELLOW)

	var target_label: Label = $TargetLabel
	target_label.position = Vector2(296, 50)
	target_label.size = Vector2(260, 35)
	target_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	target_label.add_theme_font_size_override("font_size", 20)
	target_label.add_theme_color_override("font_color", Color.YELLOW)

	var total_label: Label = $TotalScoreLabel
	total_label.position = Vector2(20, 750)
	total_label.size = Vector2(260, 30)
	total_label.add_theme_font_size_override("font_size", 18)
	total_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))

	var high_label: Label = $HighScoreLabel
	high_label.position = Vector2(296, 750)
	high_label.size = Vector2(260, 30)
	high_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	high_label.add_theme_font_size_override("font_size", 18)
	high_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))

	_update_ui()

func _update_ui() -> void:
	$ScoreLabel.text = "Skor: " + str(score)
	$MovesLabel.text = "Hamle: " + str(moves_left)
	$LevelLabel.text = "Seviye: " + str(level)
	$TargetLabel.text = "Hedef: " + str(target_score)
	$TotalScoreLabel.text = "Toplam: " + str(total_score)
	$HighScoreLabel.text = "Rekor: " + str(high_score)

func _add_match_score(match_size: int) -> void:
	var base_score := 0
	match match_size:
		3:
			base_score = 30
		4:
			base_score = 60
		_:
			base_score = 100

	var multiplier := pow(1.5, chain_count)
	score += int(base_score * multiplier)
	_update_ui()

func _add_bonus_score(bonus_type: String) -> void:
	var base_score := 0
	match bonus_type:
		"arrow_h", "arrow_v":
			base_score = 80
		"bomb":
			base_score = 120
		"rainbow":
			base_score = 200
	score += base_score
	_update_ui()

func _grid_to_pixel(row: int, col: int) -> Vector2:
	var x := GRID_OFFSET.x + col * CELL_SIZE + CELL_SIZE / 2
	var y := GRID_OFFSET.y + row * CELL_SIZE + CELL_SIZE / 2
	return Vector2(x, y)

func _pixel_to_grid(pixel: Vector2) -> Vector2i:
	var col := int((pixel.x - GRID_OFFSET.x) / CELL_SIZE)
	var row := int((pixel.y - GRID_OFFSET.y) / CELL_SIZE)
	return Vector2i(row, col)

func _is_valid_cell(cell: Vector2i) -> bool:
	return cell.x >= 0 and cell.x < GRID_SIZE and cell.y >= 0 and cell.y < GRID_SIZE

func _input(event: InputEvent) -> void:
	if is_animating:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var cell := _pixel_to_grid(event.position)
		if _is_valid_cell(cell):
			_on_cell_clicked(cell)

func _on_cell_clicked(cell: Vector2i) -> void:
	if grid[cell.x][cell.y] == "":
		return

	# Bonus şekere tıklandıysa → aktive et
	if BONUS_TYPES.has(grid[cell.x][cell.y]):
		if selected_cell != Vector2i(-1, -1):
			_highlight_cell(selected_cell, false)
			selected_cell = Vector2i(-1, -1)
		_activate_bonus(cell)
		return

	if selected_cell == Vector2i(-1, -1):
		selected_cell = cell
		_highlight_cell(cell, true)
		return

	if selected_cell == cell:
		_highlight_cell(cell, false)
		selected_cell = Vector2i(-1, -1)
		return

	if _is_adjacent(selected_cell, cell):
		_highlight_cell(selected_cell, false)
		_swap_candies(selected_cell, cell)
		selected_cell = Vector2i(-1, -1)
	else:
		_highlight_cell(selected_cell, false)
		selected_cell = cell
		_highlight_cell(cell, true)

func _is_adjacent(cell_a: Vector2i, cell_b: Vector2i) -> bool:
	var diff := (cell_a - cell_b).abs()
	return (diff.x == 1 and diff.y == 0) or (diff.x == 0 and diff.y == 1)

func _highlight_cell(cell: Vector2i, highlight: bool) -> void:
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite == null:
		return
	if highlight:
		sprite.scale = Vector2(CANDY_SCALE * 1.2, CANDY_SCALE * 1.2)
		sprite.modulate = Color(1.2, 1.2, 1.2, 1.0)
	else:
		sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
		sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

func _swap_candies(cell_a: Vector2i, cell_b: Vector2i) -> void:
	is_animating = true
	last_swap = [cell_a, cell_b]
	moves_left -= 1
	chain_count = 0
	_update_ui()

	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(_on_swap_finished)

func _on_swap_finished() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		pending_explosions.clear()
		_remove_matches(matches)
		_play_explosions(_apply_gravity_and_fill)
	else:
		_reverse_swap()

func _find_matches() -> Array:
	var matches := []

	for row in GRID_SIZE:
		var col := 0
		while col < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				col += 1
				continue
			if not CANDY_TYPES.has(candy_type):
				col += 1
				continue
			var match_length := 1
			while col + match_length < GRID_SIZE and grid[row][col + match_length] == candy_type:
				match_length += 1
			if match_length >= 3:
				var match_group := []
				for i in match_length:
					match_group.append(Vector2i(row, col + i))
				matches.append(match_group)
			col += match_length

	for col in GRID_SIZE:
		var row := 0
		while row < GRID_SIZE:
			var candy_type: String = grid[row][col]
			if candy_type == "":
				row += 1
				continue
			if not CANDY_TYPES.has(candy_type):
				row += 1
				continue
			var match_length := 1
			while row + match_length < GRID_SIZE and grid[row + match_length][col] == candy_type:
				match_length += 1
			if match_length >= 3:
				var match_group := []
				for i in match_length:
					match_group.append(Vector2i(row + i, col))
				matches.append(match_group)
			row += match_length

	return matches

func _remove_matches(matches: Array) -> void:
	var cells_to_remove := {}
	var bonuses_to_create := []

	# 1. Kesişen eşleşmeleri bul (L/T şekli → bomb)
	var used_in_intersection := {}
	for i in matches.size():
		for j in range(i + 1, matches.size()):
			var intersection := _get_intersection(matches[i], matches[j])
			if intersection != Vector2i(-1, -1):
				var unique := {}
				for c: Vector2i in matches[i]:
					unique[c] = true
				for c: Vector2i in matches[j]:
					unique[c] = true
				if unique.size() >= 5:
					bonuses_to_create.append({cell = intersection, type = "bomb"})
					used_in_intersection[i] = true
					used_in_intersection[j] = true

	# 2. Kesişmeye dahil olmayan grupları kontrol et
	for i in matches.size():
		if used_in_intersection.has(i):
			continue
		var group: Array = matches[i]
		if group.size() >= 5:
			bonuses_to_create.append({cell = group[group.size() / 2], type = "rainbow"})
		elif group.size() == 4:
			var arrow_type: String = ["arrow_h", "arrow_v"][randi() % 2]
			bonuses_to_create.append({cell = group[2], type = arrow_type})

	# 3. Puan hesapla
	for i in matches.size():
		if not used_in_intersection.has(i):
			_add_match_score(matches[i].size())
	chain_count += 1

	# 4. Tüm eşleşen hücreleri topla
	for match_group in matches:
		for cell in match_group:
			cells_to_remove[cell] = true

	# 5. Bonus pozisyonlarını belirle
	var bonus_positions := {}
	for b in bonuses_to_create:
		bonus_positions[b.cell] = b.type

	# 6. Hücreleri sil (bonus hücreleri hariç)
	for cell: Vector2i in cells_to_remove:
		if bonus_positions.has(cell):
			continue
		_clear_cell(cell)

	# 7. Bonusları yerleştir
	for b in bonuses_to_create:
		_place_bonus(b.cell, b.type)

func _get_intersection(group_a: Array, group_b: Array) -> Vector2i:
	for cell_a: Vector2i in group_a:
		for cell_b: Vector2i in group_b:
			if cell_a == cell_b:
				return cell_a
	return Vector2i(-1, -1)

func _place_bonus(cell: Vector2i, bonus_type: String) -> void:
	var old_sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if old_sprite != null:
		old_sprite.queue_free()

	grid[cell.x][cell.y] = bonus_type
	var sprite := Sprite2D.new()
	sprite.texture = candy_textures[bonus_type]
	sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
	sprite.position = _grid_to_pixel(cell.x, cell.y)
	add_child(sprite)
	candy_sprites[cell.x][cell.y] = sprite

func _activate_bonus(cell: Vector2i) -> void:
	var bonus_type: String = grid[cell.x][cell.y]
	is_animating = true
	pending_explosions.clear()
	pending_explosions.append(_grid_to_pixel(cell.x, cell.y))

	_add_bonus_score(bonus_type)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

	match bonus_type:
		"arrow_h":
			_activate_arrow_h(cell)
		"arrow_v":
			_activate_arrow_v(cell)
		"bomb":
			_activate_bomb(cell)
		"rainbow":
			_activate_rainbow()

	_play_explosions(_apply_gravity_and_fill)

func _activate_arrow_h(cell: Vector2i) -> void:
	for col in GRID_SIZE:
		_clear_cell(Vector2i(cell.x, col))

func _activate_arrow_v(cell: Vector2i) -> void:
	for row in GRID_SIZE:
		_clear_cell(Vector2i(row, cell.y))

func _activate_bomb(cell: Vector2i) -> void:
	for dr in range(-1, 2):
		for dc in range(-1, 2):
			var target := Vector2i(cell.x + dr, cell.y + dc)
			if _is_valid_cell(target):
				_clear_cell(target)

func _activate_rainbow() -> void:
	var color_count := {}
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var ct: String = grid[row][col]
			if CANDY_TYPES.has(ct):
				color_count[ct] = color_count.get(ct, 0) + 1

	var max_type := ""
	var max_count := 0
	for ct: String in color_count:
		if color_count[ct] > max_count:
			max_count = color_count[ct]
			max_type = ct

	if max_type != "":
		for row in GRID_SIZE:
			for col in GRID_SIZE:
				if grid[row][col] == max_type:
					_clear_cell(Vector2i(row, col))

func _clear_cell(cell: Vector2i) -> void:
	if not _is_valid_cell(cell):
		return
	if grid[cell.x][cell.y] == "":
		return

	var cell_type: String = grid[cell.x][cell.y]

	# Patlama pozisyonunu kaydet
	pending_explosions.append(_grid_to_pixel(cell.x, cell.y))

	# Önce hücreyi temizle (sonsuz döngüyü önler)
	var sprite: Sprite2D = candy_sprites[cell.x][cell.y]
	if sprite != null:
		sprite.queue_free()
		candy_sprites[cell.x][cell.y] = null
	grid[cell.x][cell.y] = ""

	# Silinen hücre bonus ise → zincirleme tetikle
	if BONUS_TYPES.has(cell_type):
		_add_bonus_score(cell_type)
		match cell_type:
			"arrow_h":
				_activate_arrow_h(cell)
			"arrow_v":
				_activate_arrow_v(cell)
			"bomb":
				_activate_bomb(cell)
			"rainbow":
				_activate_rainbow()

func _play_explosions(callback: Callable) -> void:
	if pending_explosions.is_empty():
		callback.call()
		return

	active_explosions = pending_explosions.size()
	for pos in pending_explosions:
		var anim := AnimatedSprite2D.new()
		anim.sprite_frames = explosion_frames
		anim.position = pos
		anim.scale = Vector2(EXPLOSION_SCALE, EXPLOSION_SCALE)
		add_child(anim)
		anim.play("explode")
		anim.animation_finished.connect(func() -> void:
			anim.queue_free()
			active_explosions -= 1
			if active_explosions <= 0:
				callback.call()
		)
	pending_explosions.clear()

func _reverse_swap() -> void:
	var cell_a: Vector2i = last_swap[0]
	var cell_b: Vector2i = last_swap[1]

	var temp: String = grid[cell_a.x][cell_a.y]
	grid[cell_a.x][cell_a.y] = grid[cell_b.x][cell_b.y]
	grid[cell_b.x][cell_b.y] = temp

	var sprite_a: Sprite2D = candy_sprites[cell_a.x][cell_a.y]
	var sprite_b: Sprite2D = candy_sprites[cell_b.x][cell_b.y]
	candy_sprites[cell_a.x][cell_a.y] = sprite_b
	candy_sprites[cell_b.x][cell_b.y] = sprite_a

	var pos_a := _grid_to_pixel(cell_a.x, cell_a.y)
	var pos_b := _grid_to_pixel(cell_b.x, cell_b.y)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(sprite_a, "position", pos_b, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(sprite_b, "position", pos_a, 0.2).set_ease(Tween.EASE_IN_OUT)
	tween.set_parallel(false)
	tween.tween_callback(func() -> void: is_animating = false)

# --- Yerçekimi ve Doldurma ---

func _apply_vertical_gravity() -> bool:
	var moved := false
	for col in GRID_SIZE:
		var write_row := GRID_SIZE - 1
		for read_row in range(GRID_SIZE - 1, -1, -1):
			if grid[read_row][col] != "":
				if read_row != write_row:
					grid[write_row][col] = grid[read_row][col]
					grid[read_row][col] = ""
					candy_sprites[write_row][col] = candy_sprites[read_row][col]
					candy_sprites[read_row][col] = null
					moved = true
				write_row -= 1
	return moved

func _apply_diagonal_slide() -> bool:
	for row in range(GRID_SIZE - 1, 0, -1):
		for col in GRID_SIZE:
			if grid[row][col] != "":
				continue
			if grid[row - 1][col] != "":
				continue
			if col > 0 and grid[row - 1][col - 1] != "":
				grid[row][col] = grid[row - 1][col - 1]
				grid[row - 1][col - 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col - 1]
				candy_sprites[row - 1][col - 1] = null
				return true
			if col < GRID_SIZE - 1 and grid[row - 1][col + 1] != "":
				grid[row][col] = grid[row - 1][col + 1]
				grid[row - 1][col + 1] = ""
				candy_sprites[row][col] = candy_sprites[row - 1][col + 1]
				candy_sprites[row - 1][col + 1] = null
				return true
	return false

func _settle_candies() -> void:
	var changed := true
	while changed:
		changed = _apply_vertical_gravity()
		if not changed:
			changed = _apply_diagonal_slide()

func _fill_empty_cells() -> void:
	for col in GRID_SIZE:
		var empty_count := 0
		for row in GRID_SIZE:
			if grid[row][col] == "":
				empty_count += 1
			else:
				break

		for i in empty_count:
			var candy_type: String = CANDY_TYPES[randi() % CANDY_TYPES.size()]
			grid[i][col] = candy_type

			var sprite := Sprite2D.new()
			sprite.texture = candy_textures[candy_type]
			sprite.scale = Vector2(CANDY_SCALE, CANDY_SCALE)
			sprite.position = _grid_to_pixel(i - empty_count, col)
			sprite.modulate.a = 0.0
			add_child(sprite)
			candy_sprites[i][col] = sprite

func _animate_board(callback: Callable) -> void:
	var tween := create_tween()
	tween.set_parallel(true)

	var has_animation := false
	for row in GRID_SIZE:
		for col in GRID_SIZE:
			var sprite: Sprite2D = candy_sprites[row][col]
			if sprite == null:
				continue
			var target := _grid_to_pixel(row, col)
			if not sprite.position.is_equal_approx(target):
				tween.tween_property(sprite, "position", target, 0.3) \
					.set_ease(Tween.EASE_IN) \
					.set_trans(Tween.TRANS_QUAD)
				has_animation = true
			if sprite.modulate.a < 1.0:
				tween.tween_property(sprite, "modulate:a", 1.0, 0.15)
				has_animation = true

	if has_animation:
		tween.set_parallel(false)
		tween.tween_callback(callback)
	else:
		callback.call()

func _apply_gravity_and_fill() -> void:
	_settle_candies()
	_fill_empty_cells()
	_animate_board(_check_chain_matches)

func _check_chain_matches() -> void:
	var matches := _find_matches()
	if matches.size() > 0:
		pending_explosions.clear()
		_remove_matches(matches)
		_play_explosions(_apply_gravity_and_fill)
	else:
		is_animating = false
		_check_level_status()

# --- Seviye ve Popup Sistemi ---

func _check_level_status() -> void:
	if score >= target_score:
		_level_complete()
	elif moves_left <= 0:
		_game_over()

func _level_complete() -> void:
	is_animating = true
	var next_level := level + 1
	var info: String = "Skor: " + str(score) + "\nSeviye " + str(next_level) + " hazır!"
	_show_popup(
		"TEBRİKLER!",
		info,
		"Sonraki Seviye",
		_start_next_level,
		"Çıkış",
		_quit_game
	)

func _game_over() -> void:
	is_animating = true
	var info: String = "Skor: " + str(score) + "\nSeviye: " + str(level)
	_show_popup(
		"OYUN BİTTİ!",
		info,
		"Tekrar Oyna",
		_restart_game,
		"Çıkış",
		_quit_game
	)

func _show_popup(title: String, info: String, button1_text: String, button1_action: Callable, button2_text: String, button2_action: Callable) -> void:
	is_animating = true

	# --- Karartma Katmanı ---
	popup_overlay = ColorRect.new()
	popup_overlay.color = Color(0, 0, 0, 0.6)
	popup_overlay.position = Vector2.ZERO
	popup_overlay.size = Vector2(576, 1024)
	add_child(popup_overlay)

	# --- Panel Arka Planı ---
	var panel := ColorRect.new()
	panel.color = Color(0.15, 0.15, 0.25, 0.95)
	panel.size = Vector2(400, 320)
	panel.position = Vector2(88, 340)
	popup_overlay.add_child(panel)

	# --- Başlık ---
	var title_label := Label.new()
	title_label.text = title
	title_label.position = Vector2(0, 20)
	title_label.size = Vector2(400, 50)
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 32)
	title_label.add_theme_color_override("font_color", Color.YELLOW)
	panel.add_child(title_label)

	# --- Bilgi ---
	var info_label := Label.new()
	info_label.text = info
	info_label.position = Vector2(0, 80)
	info_label.size = Vector2(400, 80)
	info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info_label.add_theme_font_size_override("font_size", 22)
	info_label.add_theme_color_override("font_color", Color.WHITE)
	panel.add_child(info_label)

	# --- Buton 1 ---
	var btn1 := Button.new()
	btn1.text = button1_text
	btn1.position = Vector2(75, 180)
	btn1.size = Vector2(250, 50)
	btn1.add_theme_font_size_override("font_size", 20)
	btn1.pressed.connect(button1_action)
	panel.add_child(btn1)

	# --- Buton 2 ---
	var btn2 := Button.new()
	btn2.text = button2_text
	btn2.position = Vector2(75, 245)
	btn2.size = Vector2(250, 50)
	btn2.add_theme_font_size_override("font_size", 20)
	btn2.pressed.connect(button2_action)
	panel.add_child(btn2)

func _close_popup() -> void:
	if popup_overlay != null:
		popup_overlay.queue_free()
		popup_overlay = null

func _start_next_level() -> void:
	_close_popup()
	total_score += score
	if score > high_score:
		high_score = score
	level += 1
	score = 0
	moves_left = BASE_MOVES
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
	chain_count = 0
	_save_game()
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _restart_game() -> void:
	_close_popup()
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	score = 0
	moves_left = BASE_MOVES
	chain_count = 0
	_init_grid()
	_draw_candies()
	_update_ui()
	is_animating = false

func _quit_game() -> void:
	total_score += score
	if score > high_score:
		high_score = score
	_save_game()
	get_tree().quit()

# --- Kayıt / Yükleme ---

func _save_game() -> void:
	var save_data := {
		"level": level,
		"total_score": total_score,
		"high_score": high_score,
	}

	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		print("Kayıt hatası: ", FileAccess.get_open_error())
		return
	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return

	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return

	var json_text: String = file.get_as_text()
	file.close()

	var json := JSON.new()
	var error := json.parse(json_text)
	if error != OK:
		print("JSON parse hatası: ", json.get_error_message())
		return

	var data: Dictionary = json.data
	level = data.get("level", 1)
	total_score = data.get("total_score", 0)
	high_score = data.get("high_score", 0)
	target_score = BASE_TARGET + (level - 1) * TARGET_INCREMENT
```

---

---

## Konuyla ilgili Youtube videosu aşağıdadır...

{% include embed/youtube.html id='FaEXfjo4BjA' %}

---

## 10.10 — Test

1. **Ctrl+S** ile kaydedin
2. **F5** ile çalıştırın

**Test senaryoları:**

| Test | Beklenen Sonuç |
|------|----------------|
| 3'lü eşleşme yap | Her şekerin pozisyonunda ayrı patlama animasyonu (toplam 3 patlama) |
| Patlama sırasında | Yerçekimi patlama bitene kadar başlamaz |
| 4'lü eşleşme | 3 şekerde patlama + 1 bonus oluşur (bonus hücrede patlama olmaz) |
| Zincirleme eşleşme | Her turda ayrı patlama efektleri oynar |
| Arrow bonusu aktive et | Bonus pozisyonunda + satırdaki/sütundaki her hücrede patlama |
| Bomb bonusu aktive et | Bonus pozisyonunda + 3×3 alandaki her hücrede patlama |
| Zincirleme bonus tetikleme | Her tetiklenen bonusta ayrı patlama efektleri |

**Animasyon hızı ayarı:** Patlama çok hızlı veya yavaş geliyorsa `_create_explosion_frames()` içindeki `set_animation_speed` değerini değiştirin:
- **10 FPS** → ~0.8 saniye (daha yavaş, dramatik)
- **14 FPS** → ~0.57 saniye (varsayılan)
- **20 FPS** → ~0.4 saniye (daha hızlı, akıcı)

**Patlama boyutu ayarı:** `EXPLOSION_SCALE` değerini değiştirin:
- **0.4** → 56px (hücreden küçük, minimal efekt)
- **0.5** → 70px (varsayılan, hücreden biraz büyük)
- **0.7** → 98px (büyük, dramatik patlama)
