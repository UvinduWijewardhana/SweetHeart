/* site.js - language switch, mobile menu panel and falling petals (home + account pages) */
(function () {
  var BRAND = (window.SH && SH.brand) || "SweetHeart";   /* the site name is set in js/config.js */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- language ---------- */
  function load() { try { return localStorage.getItem("lang"); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem("lang", v); } catch (e) {} }
  var lang = load() || ((navigator.language || "").toLowerCase().indexOf("si") === 0 ? "si" : "en");
  if (!I18N[lang]) lang = "en";
  function t(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k; }
  var listeners = [];
  window.SHI = { t: t, lang: function () { return lang; }, on: function (f) { listeners.push(f); } };
  function apply() {
    root.lang = lang;
    $$("[data-i18n]").forEach(function (e) { e.textContent = t(e.getAttribute("data-i18n")); });
    $$("[data-i18n-aria]").forEach(function (e) { e.setAttribute("aria-label", t(e.getAttribute("data-i18n-aria"))); });
    $$("[data-brand]").forEach(function (e) { e.textContent = BRAND; });
    var tt = document.body.getAttribute("data-title");
    if (tt) document.title = t(tt) + " | " + BRAND;
    listeners.forEach(function (f) { f(); });
  }
  $$(".lang").forEach(function (b) {
    b.addEventListener("click", function () { lang = lang === "en" ? "si" : "en"; save(lang); apply(); });
  });
  apply();

  /* ---------- menu panel (phone) ---------- */
  var burger = $("#burger"), panel = $("#panel"), scrim = $("#scrim");
  function openMenu() { root.classList.add("menu-open"); burger.setAttribute("aria-expanded", "true"); panel.setAttribute("aria-hidden", "false"); }
  function closeMenu() { root.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); panel.setAttribute("aria-hidden", "true"); }
  burger.addEventListener("click", openMenu);
  $("#xbtn").addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  $$("#panel a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1080) closeMenu(); });

  /* little number on the cart icon */
  function cartCount() { try { var c = JSON.parse(localStorage.getItem("sh_cart") || "{}"), n = 0; for (var k in c) n += c[k]; return n; } catch (e) { return 0; } }
  window.SHI.badge = function () { var n = cartCount(); $$(".cnt").forEach(function (e) { e.textContent = n; e.hidden = !n; }); };
  window.SHI.badge();

  /* highlight the current page in the top menu */
  var page = document.body.getAttribute("data-page");
  $$(".nav a[data-nav]").forEach(function (a) { if (a.getAttribute("data-nav") === page) a.classList.add("on"); });

  /* ---------- falling sakura petals in the hero ---------- */
  var box = $(".petals");
  if (box && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var h = box.offsetHeight + 140;
    for (var i = 0; i < 12; i++) {
      var p = document.createElement("div"), s = 18 + Math.pow(Math.random(), 1.6) * 40, d = 9 + Math.random() * 9;
      p.className = "pt"; p.style.width = p.style.height = s + "px"; p.style.left = Math.random() * 100 + "%";
      p.style.opacity = 0.55 + Math.random() * 0.4; p.style.animationDuration = d + "s"; p.style.animationDelay = "-" + (Math.random() * d) + "s";
      p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      p.style.setProperty("--dy", h + "px");
      p.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
      box.appendChild(p);
    }
  }
})();
