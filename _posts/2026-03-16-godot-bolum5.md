---
title: "Godot Engine Eğitim Serisi - Bölüm 5: Node'lar Arası İletişim: Sinyaller"
date: 2026-03-16 12:00:00 +0300
categories: [Godot Eğitim Serisi, Oyun Geliştirme]
tags: [godot, gdscript, kodlama, node, sinyaller, signals]
permalink: /godot-egitim-serisi-bolum-5/
published: true
---

Bu bölümde Godot'nun en güçlü özelliklerinden biri olan sinyal (signal) sistemini ele alacağız. Önceki yazılarımızda oluşturduğumuz temel hareket mekaniklerini bir adım öteye taşıyarak, farklı nesnelerin birbirleriyle nasıl haberleştiğini öğreneceksiniz.

---

## Sinyal (Signal) Nedir?

Sinyaller, bir node'da belirli bir şey olduğunda yayılan mesajlardır. Diğer node'lar bu sinyale bağlanarak olay gerçekleştiğinde önceden belirlenmiş bir fonksiyonu çağırabilirler. Bu sistem, yazılım tasarım dünyasındaki Observer Pattern'ın Godot'daki karşılığıdır.

Örneğin bir buton, tıklandığında `pressed` adlı bir sinyal yayar. Bu yapı sayesinde, oyun nesnelerinin birbirini doğrudan referans almadan tepki vermesini sağlayabilirsiniz. Sinyaller kod bağımlılığını (coupling) ciddi ölçüde azaltır ve projenizi çok daha esnek tutar.

> 💡 **Bilgilendirme:** Ekranda oyuncunun canını gösteren bir can çubuğunuz olduğunu hayal edin. Oyuncu hasar aldığında veya iyileştirme kullandığında çubuğun güncellenmesini istiyorsanız, Godot'da bunun için doğrudan sinyal sistemini kullanırsınız. Ayrıca Godot 4.0'dan itibaren sinyaller, birinci sınıf tip (first-class type) olarak tanımlanmıştır; bu da onları doğrudan metod argümanı olarak kullanabilmenizi sağlayarak kod yazarken otomatik tamamlama desteği sunar ve hataları azaltır.

---

## Sahne Kurulumu

Konuyu pratikte görmek için, önceki bölümlerde kodladığımız Godot ikonunu bir butona basarak durdurup harekete geçireceğiz. Bunun için hem bir `Button` node'unu hem de `sprite_2d.tscn` sahnenizi içeren yeni bir sahne oluşturmanız gerekiyor.

1. **Scene > New Scene** menüsüne gidin ve **2D Scene** butonuna tıklayarak kök node olarak bir `Node2D` ekleyin.
2. Alt sol kısımdaki FileSystem panelinden `sprite_2d.tscn` dosyasını bulup `Node2D`'nin üzerine sürükleyerek sahnenize instance (örnek) olarak ekleyin.
3. Scene (Sahne) panelinde `Node2D`'ye sağ tıklayıp **Add Child Node** seçeneğini seçin ve bir `Button` node'u ekleyin.
4. Eklediğiniz butonu seçip sağdaki Inspector (Denetçi) panelinden **Text** özelliğine `Toggle motion` yazın.
5. Viewport (Görüntü Alanı) üzerinden butonu sürükleyerek sprite'a (ikon) yakın bir konuma getirin ve bu yeni sahneyi `node_2d.tscn` olarak kaydedin.

Oyununuzu **F6** tuşu ile çalıştırdığınızda buton ekranda görünecektir ancak henüz hiçbir işlevi yoktur.

---

## Editör Üzerinden Sinyal Bağlamak

Şimdi butonun `pressed` (tıklandı) sinyalini `Sprite2D` node'una bağlayacağız; böylece butona basıldığında ikonun hareketi duracak veya devam edecektir.

1. `Button` node'unu seçin ve sağ panelde Inspector'ın hemen yanındaki **Signals** sekmesine tıklayın.
2. Bu sekmede seçili node için kullanılabilir tüm sinyallerin listesini göreceksiniz; `pressed` sinyaline çift tıklayın.
3. Karşınıza Node Connection (Node Bağlantısı) penceresi açılacaktır. Burada sinyali bağlayacağımız alıcı node olarak `Sprite2D`'yi seçin.

> ⚠️ **Uyarı:** Sinyali alacak node'un, sinyal tetiklendiğinde çalıştıracağı bir alıcı metoda (receiver method) ihtiyacı vardır ve editör bunu sizin için otomatik olarak oluşturur. Kural gereği bu callback (geri çağırma) metodları `_on_node_adı_sinyal_adı` formatında adlandırılır, bu örneğimizde metodun adı `_on_button_pressed` olacaktır.

**Connect** butonuna tıkladığınızda editör sizi otomatik olarak script çalışma alanına götürür ve sol kenarında yeşil bir bağlantı simgesi olan yeni fonksiyonunuzu görürsünüz. Bu fonksiyonun içeriğini aşağıdaki gibi güncelleyin:

```gdscript
func _on_button_pressed():
	set_process(not is_processing())
```

Bu kodda yer alan `set_process()` fonksiyonu, node'un `_process()` döngüsünün çalışıp çalışmamasını kontrol eder. `is_processing()` ise bu işlemin aktif olup olmadığını (true veya false olarak) döndürür. Başındaki `not` ifadesi mevcut durumu tersine çevirerek, butona her tıkladığınızda ikonun hareketini durdurmanızı veya başlatmanızı sağlar.

---

## Kod ile Sinyal Bağlamak

Sinyalleri editör üzerinden bağlamanın yanı sıra tamamen kod aracılığıyla dinamik olarak da bağlayabilirsiniz. Bu yöntem, özellikle oyun oynanırken kod içinden yeni bir node oluşturduğunuzda oldukça gereklidir.

Bunu deneyimlemek için sahnemize bir `Timer` (Zamanlayıcı) node'u ekleyelim:

1. 2D çalışma alanına geri dönün, `Sprite2D` node'una sağ tıklayın ve bir `Timer` node'u ekleyin.
2. `Timer` node'u seçiliyken Inspector panelinden **Autostart** özelliğini aktif hale getirin. Bu ayar sayesinde Timer, oyun başlar başlamaz otomatik olarak çalışmaya başlayacaktır.
3. Şimdi `Sprite2D`'nin yanındaki script simgesine tıklayarak tekrar kod editörüne dönün. Bağlantıyı script içindeki `_ready()` fonksiyonunda kuracağız. `_ready()` fonksiyonu, ilgili node bellekte tamamen oluşturulduğunda motor tarafından sadece bir kez otomatik olarak çağrılır.

Scriptinizi şu şekilde düzenleyin:

```gdscript
func _ready():
	var timer = get_node("Timer")
	timer.timeout.connect(_on_timer_timeout)

func _on_timer_timeout():
	visible = not visible
```

Bu kodda `get_node("Timer")` komutu, mevcut node'un çocukları arasından "Timer" adındaki node'u bularak referans alır. `timer.timeout.connect(...)` satırı ise, Timer'ın `timeout` sinyali tetiklendiğinde `_on_timer_timeout` fonksiyonunun çalıştırılmasını sağlar.

Oluşturduğumuz `_on_timer_timeout()` fonksiyonunun içindeki `visible` ise, node'un ekranda görünürlüğünü kontrol eden mantıksal (boolean) bir özelliktir. Sahneyi çalıştırdığınızda, kodla bağladığınız bu sinyal sayesinde ikonunuzun saniyede bir yanıp söndüğünü görebilirsiniz!

---

## Kendi Özel Sinyallerinizi (Custom Signals) Oluşturmak

Godot'nun sunduğu yerleşik sinyallerin yanı sıra, oyununuzun mantığına uygun kendi özel sinyallerinizi de tanımlayabilirsiniz.

Örneğin oyuncunun canı sıfıra düştüğünde bir "Game Over" ekranı göstermek istediğinizi varsayalım. Bunun için scriptinizin en üst kısmına şu satırı ekleyerek kendi sinyalinizi tanımlayabilirsiniz:

```gdscript
signal health_depleted
```

Oluşturduğunuz bu özel sinyaller tamamen yerleşik sinyaller gibi davranır; editörün Signals sekmesinde görünürler ve aynı yöntemlerle diğer node'lara bağlanabilirler. Sinyali oyun içinde tetiklemek (yaymak) istediğinizde ise `emit()` metodunu kullanmanız yeterlidir:

```gdscript
health_depleted.emit()
```

> 💡 **Bilgilendirme:** Dilerseniz sinyallerinize parametre/argüman da ekleyebilirsiniz. Örneğin `signal health_depleted(damage_amount)` şeklinde tanımladığınız bir sinyali, `health_depleted.emit(50)` şeklinde fırlatarak diğer node'lara veri gönderebilirsiniz.

---

## Bölüm Özeti

Bu bölümde öğrendiğiniz temel yapı taşları şunlardır:

* **Sinyal (Signal):** Belirli bir olay gerçekleştiğinde node tarafından yayılan mesajdır.
* **connect():** Bir sinyali, tetiklendiğinde çalışacak bir callback fonksiyonuna bağlar.
* **emit():** İlgili sinyali tetikler ve bağlı olan tüm fonksiyonların çağrılmasını sağlar.
* **get_node():** Node ismine göre çocuk node'a script içerisinden referans almanızı sağlar.

Sinyaller; iki nesnenin çarpışması, oyuncunun bir alana girmesi veya bir animasyonun bitmesi gibi sayısız senaryoda en büyük yardımcınız olacaktır.

---

## Sıradaki Adım

Tebrikler, Godot Engine temellerini attığımız giriş serisini tamamladınız! Bir sonraki büyük adımımızda, şimdiye kadar öğrendiğiniz node'lar, sahneler, script'ler, girdiler ve sinyaller konularının hepsini bir araya getireceğiniz İlk 2D Oyununuzu (Dodge the Creeps!) geliştirmeye başlayacaksınız.

Hazırsanız bir sonraki bölümde görüşmek üzere!