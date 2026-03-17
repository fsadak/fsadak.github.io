/**
 * AdSense In-Content Ad Injector
 *
 * Sayfa yuklendiginde post icerigini tarar ve her ~350 kelimede bir,
 * baslik (h2/h3) veya <hr> oncesine reklam blogu ekler.
 * Okuma akisini bozmadan, dogal kesme noktalarinda reklam yerlestirir.
 */
(function () {
  "use strict";

  // --- Ayarlar ---
  var AD_INTERVAL = 350; // Reklamlar arasi minimum kelime sayisi
  var MIN_GAP = 200; // Iki reklam arasi mutlak minimum kelime
  var MAX_ADS = 5; // Sayfa basina maksimum ara reklam
  var AD_CLIENT = "ca-pub-7025916496705120";
  var AD_SLOT = "1908261118";

  // Reklam yerlestirilebilecek break-point elementleri
  var BREAK_TAGS = ["H2", "H3", "HR"];

  // Post icerigini bulacak selektor (Chirpy theme)
  var CONTENT_SELECTOR = "article div.content";

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(function (w) {
      return w.length > 0;
    }).length;
  }

  function createAdElement() {
    var wrapper = document.createElement("div");
    wrapper.className = "adsense-area-middle";
    wrapper.style.cssText = "margin: 40px 0; text-align: center;";

    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", AD_CLIENT);
    ins.setAttribute("data-ad-slot", AD_SLOT);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");

    wrapper.appendChild(ins);
    return wrapper;
  }

  function pushAd() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense blocker veya hata durumunda sessizce devam et
    }
  }

  function injectAds() {
    var container = document.querySelector(CONTENT_SELECTOR);
    if (!container) return;

    var children = Array.prototype.slice.call(container.children);
    if (children.length === 0) return;

    var wordCount = 0;
    var lastAdWordCount = 0;
    var adsInserted = 0;
    var insertions = []; // {element, wordCountAtPoint}

    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var tag = el.tagName;

      // Break-point'e ulastigimizda reklam eklemeyi degerlendir
      if (BREAK_TAGS.indexOf(tag) !== -1) {
        var gap = wordCount - lastAdWordCount;
        if (gap >= AD_INTERVAL && adsInserted < MAX_ADS) {
          insertions.push({ element: el, position: "before" });
          lastAdWordCount = wordCount;
          adsInserted++;
        }
      }

      // Elementin kelime sayisini topla
      wordCount += countWords(el.textContent);
    }

    // Ekleme islemlerini gerceklestir (DOM'u sondan basa degistir ki index kaymasin)
    for (var j = insertions.length - 1; j >= 0; j--) {
      var insertion = insertions[j];
      var adEl = createAdElement();
      insertion.element.parentNode.insertBefore(adEl, insertion.element);
    }

    // Eklenen reklamlari aktive et
    var adElements = container.querySelectorAll(".adsense-area-middle ins.adsbygoogle");
    for (var k = 0; k < adElements.length; k++) {
      pushAd();
    }
  }

  // Sayfa yuklenmesini bekle
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectAds);
  } else {
    injectAds();
  }
})();
