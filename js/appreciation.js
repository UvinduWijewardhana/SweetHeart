/* appreciation.js - the thank-you gift page an employee receives.
   The date and time were chosen by the company; the employee just sees them and confirms. */
function boot(cfg, PH) {
  var $ = function (i) { return document.getElementById(i); };
  var GIFTS = { stay: "One night hotel stay", dinner: "Dinner for two", spa: "Spa day", voucher: "Gift voucher", trip: "Weekend getaway" };
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var WDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function str(v, n) { return String(v || "").slice(0, n); }

  /* ---------- settings from the link ---------- */
  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  var C = { co: "Your Company", emp: "Alex", role: "Team Member", g: "stay", gt: "", gd: "", msg: "Thank you for everything you do. We are proud to have you on our team.", from: "", wa: "",
            dt: tomorrow.getFullYear() + "-" + pad(tomorrow.getMonth() + 1) + "-" + pad(tomorrow.getDate()), tm: "15:30" };
  if (cfg && typeof cfg === "object") {
    C.co = str(cfg.c, 50) || C.co; C.emp = str(cfg.e, 40) || C.emp; C.role = str(cfg.r, 50) || C.role;
    C.g = GIFTS[cfg.g] ? cfg.g : ""; C.gt = str(cfg.gt, 60); C.gd = str(cfg.gd, 90);
    C.msg = cfg.m === undefined ? C.msg : str(cfg.m, 220); C.from = str(cfg.s, 60); C.wa = cleanWa(cfg.w);
    C.dt = str(cfg.dt, 10); C.tm = str(cfg.tm, 5);
  }
  var giftTitle = C.gt || GIFTS[C.g] || "A special gift";
  function iconKey(t) {                       /* picks the little picture from the words: the keyword that comes first wins */
    t = t.toLowerCase();
    var rules = { spa: /spa|massage|wellness|salon/, dinner: /dinner|lunch|meal|restaurant|buffet|breakfast|brunch|cafe|coffee/,
                  voucher: /voucher|coupon|cash|bonus|gift card/, trip: /trip|getaway|holiday|tour|travel|vacation|flight|beach|safari/,
                  stay: /room|stay|night|hotel|resort|villa|suite/ };
    var best = "other", at = 1e9;
    Object.keys(rules).forEach(function (k) { var m = rules[k].exec(t); if (m && m.index < at) { at = m.index; best = k; } });
    return best;
  }
  document.title = "A thank-you gift for " + C.emp + " from " + C.co;

  /* ---------- fill the page (text only, never HTML) ---------- */
  $("apco").textContent = C.co;
  if (PH["0"]) { var li = document.createElement("img"); li.src = PH["0"]; li.alt = C.co; $("aplogo").appendChild(li); $("aplogo").classList.add("has"); }
  else $("aplogo").textContent = C.co.charAt(0).toUpperCase();
  $("apname").textContent = "Congratulations, " + C.emp.split(" ")[0] + "!";
  $("aprole").textContent = C.role + " at " + C.co;
  $("apmsg").textContent = C.msg ? "\u201C" + C.msg + "\u201D" : "";
  $("apsig").textContent = C.from ? "- " + C.from : "";
  $("apic").innerHTML = GIFT_ICONS[iconKey(giftTitle)] || GIFT_ICONS.other;
  $("apgift").textContent = giftTitle; $("apgd").textContent = C.gd;

  /* ---------- falling petals ---------- */
  var pet = $("pet");
  if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    for (var i = 0; i < 10; i++) {
      var p = document.createElement("div"), s = 18 + Math.pow(Math.random(), 1.6) * 38, dd = 10 + Math.random() * 9;
      p.className = "pt"; p.style.width = p.style.height = s + "px"; p.style.left = Math.random() * 100 + "%"; p.style.opacity = 0.5 + Math.random() * 0.4;
      p.style.animationDuration = dd + "s"; p.style.animationDelay = "-" + (Math.random() * dd) + "s";
      p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px"); p.style.setProperty("--dy", (innerHeight + 140) + "px"); p.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
      pet.appendChild(p);
    }
  }

  /* ---------- the day and time the company booked ---------- */
  var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(C.dt), tmm = /^(\d{2}):(\d{2})$/.exec(C.tm), when = "";
  var date = dm ? new Date(+dm[1], +dm[2] - 1, +dm[3]) : null, ok = !!(date && !isNaN(date) && tmm && +tmm[1] < 24 && +tmm[2] < 60);
  if (ok) {
    var h24 = +tmm[1], mi = +tmm[2], h12 = h24 % 12 || 12, ap = h24 >= 12 ? "PM" : "AM", timeTxt = h12 + ":" + pad(mi) + " " + ap;
    $("bwk").textContent = WDAYS[date.getDay()]; $("bday").textContent = date.getDate(); $("bmon").textContent = MONTHS[date.getMonth()] + " " + date.getFullYear();
    $("btime").textContent = timeTxt;
    $("hh").setAttribute("transform", "rotate(" + (((h24 % 12) + mi / 60) * 30) + " 50 50)");
    $("mh").setAttribute("transform", "rotate(" + (mi * 6) + " 50 50)");
    var t = $("ticks"); for (var k = 0; k < 12; k++) { var ln = document.createElementNS("http://www.w3.org/2000/svg", "line"), a = k * Math.PI / 6;
      ln.setAttribute("x1", 50 + 39 * Math.sin(a)); ln.setAttribute("y1", 50 - 39 * Math.cos(a)); ln.setAttribute("x2", 50 + 43 * Math.sin(a)); ln.setAttribute("y2", 50 - 43 * Math.cos(a)); t.appendChild(ln); }
    when = WDAYS[date.getDay()] + ", " + MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + timeTxt;
  } else {
    $("book").hidden = true; $("bhead").textContent = "Your day will be confirmed soon";
    $("aphint").textContent = C.co + " will let you know the date and time."; $("apgo").hidden = true; $("apalt").hidden = true;
  }

  /* ---------- confirm with the company on WhatsApp ---------- */
  var who = C.emp + " (" + C.role + ")";
  function link(text) { return C.wa ? "https://wa.me/" + C.wa + "?text=" + encodeURIComponent(text) : ""; }
  if (ok) {
    var ok1 = link("Hello! This is " + who + ". Thank you so much for the gift: " + giftTitle + ". I confirm I will be there on " + when + ".\n\n- " + C.emp);
    var alt = link("Hello! This is " + who + ". Thank you so much for the gift: " + giftTitle + ". The time you booked (" + when + ") does not work for me. Could we choose another time?\n\n- " + C.emp);
    if (ok1) $("apgo").href = ok1; if (alt) $("apalt").href = alt; else $("apalt").hidden = true;
    $("apgo").addEventListener("click", function (e) {
      if (!C.wa) e.preventDefault();
      $("apdonetxt").textContent = C.wa ? "WhatsApp has opened with your confirmation. Press send there: " + when + "." : "Booked for " + when + ".";
      $("apsel").hidden = true; $("apdone").hidden = false;
    });
  }
  $("apchange").addEventListener("click", function () { $("apdone").hidden = true; $("apsel").hidden = false; });
}

(function () {
  var q = new URLSearchParams(location.search), code = q.get("c"), raw = q.get("d");
  function missing() {
    document.documentElement.style.visibility = "";
    document.body.innerHTML = '<p style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#7a5565">This link is not valid, or it has expired.</p>';
  }
  if (code) {
    document.documentElement.style.visibility = "hidden";
    if (!BE.on()) { missing(); return; }
    BE.get(code).then(function (r) {
      if (!r || !r.data) { missing(); return; }
      boot(r.data, BE.cleanImgs(r.images)); document.documentElement.style.visibility = "";
    }).catch(missing);
  } else {
    boot(raw ? decodeCfg(raw) : null, unpackImgs(location.hash));
  }
})();
