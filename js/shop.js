/* shop.js - sign-in state, the cart, and the gifts / cart / checkout pages */
var Shop = (function () {
  var $ = function (s) { return document.querySelector(s); };
  function jget(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function user() { return jget("sh_user", null); }
  function cart() { return jget("sh_cart", {}); }
  function saveCart(c) { jset("sh_cart", c); SHI.badge(); }
  function money(n) { return SH.currency + " " + n.toLocaleString("en-US"); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function pname(p) { return SHI.lang() === "si" && p.si ? p.si : p.name; }
  function toast(msg) {
    var e = $("#toast"); if (!e) return;
    e.textContent = msg; e.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove("show"); }, 1800);
  }
  /* people must be logged in to use the cart: otherwise they are sent to the login page */
  function needLogin() {
    if (user()) return false;
    var here = location.pathname.split("/").pop() + location.search;
    location.href = "account.html?mode=login&next=" + encodeURIComponent(here);
    return true;
  }

  /* ---------- gifts page ---------- */
  function initGifts() {
    var grid = $("#pgrid"), chips = $("#chips"), chips2 = $("#chips2"), sortSel = $("#sort"), more = $("#more"), PAGE = 12, shown = PAGE;
    var cat = new URLSearchParams(location.search).get("cat") || "all";
    if (cat !== "all" && CATEGORIES.indexOf(cat) < 0) cat = "all";
    var FORS = ["women", "men", "girls", "boys"], who = new URLSearchParams(location.search).get("for") || "all";
    if (who !== "all" && FORS.indexOf(who) < 0) who = "all";
    function href(c, w) { var q = []; if (c !== "all") q.push("cat=" + c); if (w !== "all") q.push("for=" + w); return "gifts.html" + (q.length ? "?" + q.join("&") : ""); }
    function list() {
      var a = PRODUCTS.filter(function (p) { return (cat === "all" || p.cat === cat) && (who === "all" || (p.for || []).indexOf(who) >= 0); }), s = sortSel.value;
      a.sort(function (x, y) {
        if (s === "low") return x.price - y.price;
        if (s === "high") return y.price - x.price;
        if (s === "off") return (y.old ? (y.old - y.price) / y.old : 0) - (x.old ? (x.old - x.price) / x.old : 0);
        return (y.pop || 0) - (x.pop || 0);
      });
      return a;
    }
    function drawChips() {
      chips.innerHTML = ""; chips2.innerHTML = "";
      ["all"].concat(CATEGORIES).forEach(function (c) {
        var a = document.createElement("a");
        a.className = "chip" + (c === cat ? " on" : ""); a.href = href(c, who); a.textContent = SHI.t("cat." + c);
        a.addEventListener("click", function (e) { e.preventDefault(); cat = c; shown = PAGE; history.replaceState(null, "", a.getAttribute("href")); render(); });
        chips.appendChild(a);
      });
      ["all"].concat(FORS).forEach(function (w) {
        var a = document.createElement("a");
        a.className = "chip soft" + (w === who ? " on" : ""); a.href = href(cat, w); a.textContent = SHI.t("for." + w);
        a.addEventListener("click", function (e) { e.preventDefault(); who = w; shown = PAGE; history.replaceState(null, "", a.getAttribute("href")); render(); });
        chips2.appendChild(a);
      });
    }
    function card(p) {
      var imgs = p.images && p.images.length ? p.images : [artUrl(p.cat, 0), artUrl(p.cat, 1), artUrl(p.cat, 2)];
      var el = document.createElement("article"); el.className = "pc";
      var car = document.createElement("div"); car.className = "car";
      var track = document.createElement("div"); track.className = "track";
      imgs.forEach(function (src) { var im = document.createElement("img"); im.src = src; im.alt = pname(p); im.loading = "lazy"; track.appendChild(im); });
      car.appendChild(track);
      if (p.old) { var o = document.createElement("span"); o.className = "off"; o.textContent = "-" + Math.round((p.old - p.price) / p.old * 100) + "%"; car.appendChild(o); }
      if (imgs.length > 1) {
        var dots = document.createElement("div"); dots.className = "dots";
        imgs.forEach(function (_, i) { var d = document.createElement("i"); if (!i) d.className = "on"; dots.appendChild(d); });
        var go = function (dir) {
          var w = track.clientWidth, i = Math.round(track.scrollLeft / w) + dir;
          if (i >= imgs.length) i = 0; if (i < 0) i = imgs.length - 1;
          track.scrollTo({ left: i * w, behavior: "smooth" });
        };
        [["l", "\u2039", -1], ["r", "\u203A", 1]].forEach(function (a) {
          var b = document.createElement("button"); b.type = "button"; b.className = "arw " + a[0]; b.textContent = a[1];
          b.setAttribute("aria-label", a[2] < 0 ? "Previous photo" : "Next photo");
          b.addEventListener("click", function () { go(a[2]); }); car.appendChild(b);
        });
        track.addEventListener("scroll", function () {
          var i = Math.round(track.scrollLeft / track.clientWidth);
          Array.prototype.forEach.call(dots.children, function (d, k) { d.className = k === i ? "on" : ""; });
        });
        var timer; /* photos change by themselves while the mouse is over the card */
        car.addEventListener("mouseenter", function () { timer = setInterval(function () { go(1); }, 2200); });
        car.addEventListener("mouseleave", function () { clearInterval(timer); });
        car.appendChild(dots);
      }
      var b = document.createElement("div"); b.className = "pb";
      var n = document.createElement("div"); n.className = "pn"; n.textContent = pname(p);
      var pp = document.createElement("div"); pp.className = "pp";
      var pr = document.createElement("b"); pr.textContent = money(p.price); pp.appendChild(pr);
      if (p.old) { var s = document.createElement("s"); s.textContent = money(p.old); pp.appendChild(s); }
      var add = document.createElement("button"); add.type = "button"; add.className = "addb"; add.textContent = SHI.t("gifts.add");
      add.addEventListener("click", function () {
        if (needLogin()) return;
        var c = cart(); c[p.id] = (c[p.id] || 0) + 1; saveCart(c); toast(SHI.t("gifts.added"));
      });
      b.appendChild(n); b.appendChild(pp); b.appendChild(add);
      el.appendChild(car); el.appendChild(b);
      return el;
    }
    function render() {
      drawChips();
      var a = list(); grid.innerHTML = "";
      a.slice(0, shown).forEach(function (p) { grid.appendChild(card(p)); });
      more.hidden = a.length <= shown; $("#none").hidden = a.length > 0;
    }
    sortSel.addEventListener("change", function () { shown = PAGE; render(); });
    more.addEventListener("click", function () { shown += PAGE; render(); });
    SHI.on(render); render();
  }

  /* ---------- cart page ---------- */
  function initCart() {
    if (needLogin()) return;
    var wrap = $("#cartwrap");
    function render() {
      var c = cart(), ids = Object.keys(c).filter(function (id) { return byId(id) && c[id] > 0; }), sub = 0, save = 0;
      if (!ids.length) { wrap.innerHTML = '<div class="empty"><p>' + SHI.t("cart.empty") + '</p><a class="btn fill" href="gifts.html">' + SHI.t("cart.browse") + "</a></div>"; return; }
      var rows = document.createElement("div"), box = document.createElement("div"); box.className = "cartgrid";
      ids.forEach(function (id) {
        var p = byId(id), q = c[id]; sub += p.price * q; if (p.old) save += (p.old - p.price) * q;
        var r = document.createElement("div"); r.className = "crow";
        var im = document.createElement("img"); im.src = (p.images && p.images[0]) || artUrl(p.cat, 0); im.alt = "";
        var info = document.createElement("div"); info.className = "ci";
        var nm = document.createElement("div"); nm.className = "cn"; nm.textContent = pname(p);
        var bt = document.createElement("div"); bt.className = "cb";
        var qty = document.createElement("div"); qty.className = "qty";
        var mi = document.createElement("button"); mi.type = "button"; mi.textContent = "\u2212";
        var qn = document.createElement("span"); qn.textContent = q;
        var pl = document.createElement("button"); pl.type = "button"; pl.textContent = "+";
        qty.appendChild(mi); qty.appendChild(qn); qty.appendChild(pl);
        var pr = document.createElement("b"); pr.textContent = money(p.price * q);
        var rm = document.createElement("button"); rm.type = "button"; rm.className = "rm"; rm.textContent = SHI.t("cart.remove");
        mi.addEventListener("click", function () { var x = cart(); x[id] = Math.max(0, (x[id] || 1) - 1); if (!x[id]) delete x[id]; saveCart(x); render(); });
        pl.addEventListener("click", function () { var x = cart(); x[id] = (x[id] || 0) + 1; saveCart(x); render(); });
        rm.addEventListener("click", function () { var x = cart(); delete x[id]; saveCart(x); render(); });
        bt.appendChild(qty); bt.appendChild(pr); info.appendChild(nm); info.appendChild(bt); info.appendChild(rm);
        r.appendChild(im); r.appendChild(info); rows.appendChild(r);
      });
      var sum = document.createElement("div"); sum.className = "sumbox";
      sum.innerHTML = '<h3>' + SHI.t("co.summary") + '</h3><div class="r"><span>' + SHI.t("cart.sub") + '</span><span>' + money(sub + save) + '</span></div>' +
        (save ? '<div class="r sv"><span>' + SHI.t("cart.save") + '</span><span>- ' + money(save) + '</span></div>' : '') +
        '<div class="r tot"><span>' + SHI.t("cart.total") + '</span><span>' + money(sub) + '</span></div>' +
        '<a class="btn fill full" href="checkout.html">' + SHI.t("cart.checkout") + '</a>';
      box.appendChild(rows); box.appendChild(sum); wrap.innerHTML = ""; wrap.appendChild(box);
    }
    SHI.on(render); render();
  }

  /* ---------- checkout page (preview only: nothing is sent anywhere) ---------- */
  function initCheckout() {
    if (needLogin()) return;
    var c = cart(), sub = 0, lines = "";
    Object.keys(c).forEach(function (id) {
      var p = byId(id); if (!p || !c[id]) return; sub += p.price * c[id];
      lines += '<div class="r"><span>' + pname(p).replace(/</g, "&lt;") + " \u00D7 " + c[id] + "</span><span>" + money(p.price * c[id]) + "</span></div>";
    });
    $("#cosum").innerHTML = '<h3>' + SHI.t("co.summary") + "</h3>" + (lines || '<div class="r"><span>' + SHI.t("cart.empty") + "</span></div>") +
      '<div class="r tot"><span>' + SHI.t("cart.total") + "</span><span>" + money(sub) + "</span></div>";
    $("#cof").addEventListener("submit", function (e) { e.preventDefault(); });
  }
  return { initGifts: initGifts, initCart: initCart, initCheckout: initCheckout, user: user };
})();
