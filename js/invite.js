/* invite.js - the page she sees (index.html)
   Order of things in this file:
   1 read the settings from the link   2 falling flowers & hearts
   3 page 1 (the runaway "No")         4 page 2 (places)
   5 page 3 (calendar & time)          6 page 4 (the WhatsApp message) */
function boot(cfg, PHOTOS) {
  var $ = function (i) { return document.getElementById(i); };
  var fx = document.createElement("div"); fx.id = "fx"; document.body.appendChild(fx);   /* petals live in a clipped layer, so they can never widen the page */

  /* ---------- 1. settings from the link (made on index.html, the link maker) ---------- */
  var C = { name: "Sweetheart", nick: "my favourite person", wa: "",
            places: PLACE_ORDER.map(function (k, i) { return makePlace([k], i); }) };
  if (cfg && typeof cfg === "object") {
    C.name = String(cfg.n || "").slice(0, 40) || C.name;
    C.nick = cfg.k === undefined ? C.nick : String(cfg.k || "").slice(0, 60);
    C.wa = cleanWa(cfg.w);
    var ps = (Array.isArray(cfg.p) ? cfg.p : []).slice(0, MAX_PLACES)
      .map(function (e, i) { var p = Array.isArray(e) ? makePlace(e, i) : null; if (p) p.idx = i; return p; })
      .filter(Boolean);
    if (ps.length) C.places = ps;
  }
  $("nm").textContent = C.name;
  $("nick").textContent = C.nick;
  if (!C.nick) document.querySelector(".sub").style.display = "none";
  document.title = "For " + C.name + " \uD83D\uDC8C";
  if (!C.wa) $("hint").style.display = "none";

  var pick = { v: "", y: 0, m: 0, d: 0, t: "" };
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function show(n) {
    ["s1", "s2", "s3", "s4"].forEach(function (s, i) { $(s).classList.toggle("hide", i !== n - 1); });
    document.querySelectorAll(".prog i").forEach(function (e, i) { e.classList.toggle("on", i === n - 1); });
    window.scrollTo(0, 0);
  }
  function pop(e, lift) {
    if (e.animate) e.animate(lift
      ? [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-16px) scale(1.06)" }, { transform: "translateY(-9px) scale(1.03)" }]
      : [{ transform: "scale(.94)" }, { transform: "scale(1.06)" }, { transform: "scale(1.02)" }],
      { duration: 300, easing: "cubic-bezier(.2,.9,.3,1.3)" });
  }

  /* ---------- 2. falling sakura flowers and small hearts ---------- */
  var HK = ["hf1", "hf2", "ho"];
  function spawn(kind, pre) {
    var e = document.createElement("div"), d = 7 + Math.random() * 7,
        size = kind ? 16 : 18 + Math.pow(Math.random(), 1.8) * 58;
    e.className = "sak" + (kind ? " hrt " + kind : "");
    e.style.width = e.style.height = size + "px";
    e.style.left = Math.random() * 100 + "vw";
    e.style.opacity = kind ? 0.9 : 0.7 + Math.random() * 0.3;
    e.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    e.style.setProperty("--r", (kind ? Math.random() * 60 - 30 : Math.random() * 720 - 360) + "deg");
    e.style.animationDuration = d + "s";
    if (pre) e.style.animationDelay = "-" + (Math.random() * d) + "s";
    fx.appendChild(e);
    setTimeout(function () { e.remove(); }, d * 1000 + 200);
  }
  function petal(pre) { spawn("", pre); }
  function heart(pre) { spawn(HK[Math.random() * 3 | 0], pre); }
  function burst(n) {
    for (var i = 0; i < n; i++) (function (k) {
      setTimeout(function () { k % 3 ? heart(false) : petal(false); }, Math.random() * 1500);
    })(i);
  }
  for (var i = 0; i < 9; i++) petal(true);
  for (var j = 0; j < 6; j++) heart(true);
  setInterval(function () { if (!document.hidden) petal(false); }, 800);
  setInterval(function () { if (!document.hidden) heart(false); }, 900);

  /* ---------- 3. page 1: the runaway "No" button ---------- */
  var no = $("no"), yes = $("yes");
  var words = ["No", "still no? \uD83E\uDD7A", "be serious \uD83D\uDE48", "really?? \uD83D\uDE2D", "pretty please \uD83C\uDF39", "just say yes \uD83D\uDC97"], wi = 0;
  no.addEventListener("click", function (e) {
    e.preventDefault();
    no.classList.add("run");
    wi = wi % (words.length - 1) + 1;
    no.textContent = words[wi];
    var r = no.parentElement, w = r.clientWidth - no.offsetWidth, h = r.clientHeight - no.offsetHeight, L, T, k = 0, ok;
    do {
      L = Math.random() * w; T = Math.random() * h; k++;
      ok = L > yes.offsetLeft + yes.offsetWidth + 6 || L + no.offsetWidth < yes.offsetLeft - 6 ||
           T > yes.offsetTop + yes.offsetHeight + 6 || T + no.offsetHeight < yes.offsetTop - 6;
    } while (!ok && k < 30);
    no.style.left = Math.max(0, L) + "px";
    no.style.top = Math.max(0, T) + "px";
  });
  yes.onclick = function () { burst(25); show(2); };

  /* ---------- 4. page 2: the places ---------- */
  var list = $("places");
  if (C.places.length > 5) list.className = "many";
  C.places.forEach(function (p) {
    var b = document.createElement("button"); b.className = "opt"; b.style.background = p.bg;
    var ic = document.createElement("span"); ic.className = "ic";
    var im = document.createElement("img"); im.src = (p.idx !== undefined && PHOTOS[p.idx]) || p.img; im.alt = ""; ic.appendChild(im);
    var tx = document.createElement("span"), t = document.createElement("b"), s = document.createElement("small");
    t.textContent = p.title; s.textContent = p.sub; tx.appendChild(t); tx.appendChild(s);
    b.appendChild(ic); b.appendChild(tx);
    b.onclick = function () {
      list.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("sel"); });
      b.classList.add("sel"); pop(b, 1);
      pick.v = p.value;
      $("fav").textContent = p.value + " it is \u2014 my favorite answer \u2728";
      $("g2").disabled = false;
    };
    list.appendChild(b);
  });
  $("g2").onclick = function () { show(3); };

  /* ---------- 5. page 3: calendar and time ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var vy = today.getFullYear(), vm = today.getMonth(), grid = $("grid");
  function drawCal() {
    grid.innerHTML = "";
    $("calTitle").textContent = MONTHS[vm] + " " + vy;
    "SUN MON TUE WED THU FRI SAT".split(" ").forEach(function (d) {
      var e = document.createElement("div"); e.textContent = d; grid.appendChild(e);
    });
    var first = new Date(vy, vm, 1).getDay(), days = new Date(vy, vm + 1, 0).getDate();
    for (var i = 0; i < first; i++) grid.appendChild(document.createElement("span"));
    for (var d = 1; d <= days; d++) (function (d) {
      var b = document.createElement("button"); b.textContent = d;
      if (new Date(vy, vm, d) < today) b.disabled = true;
      if (pick.d === d && pick.m === vm && pick.y === vy) b.classList.add("sel");
      b.onclick = function () {
        grid.querySelectorAll("button").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel"); pop(b);
        pick.y = vy; pick.m = vm; pick.d = d; upd();
      };
      grid.appendChild(b);
    })(d);
    $("prev").disabled = vy === today.getFullYear() && vm === today.getMonth();
  }
  $("prev").onclick = function () { vm--; if (vm < 0) { vm = 11; vy--; } drawCal(); };
  $("next").onclick = function () { vm++; if (vm > 11) { vm = 0; vy++; } drawCal(); };
  drawCal();

  ["9:00 AM", "11:00 AM", "3:00 PM", "5:00 PM", "7:00 PM"].forEach(function (t) {
    var b = document.createElement("button"); b.textContent = t;
    b.onclick = function () {
      document.querySelectorAll(".times button").forEach(function (x) { x.classList.remove("sel"); });
      b.classList.add("sel"); pop(b); pick.t = t; upd();
    };
    $("times").appendChild(b);
  });
  function upd() {
    $("fav3").textContent = pick.t ? pick.t + " \u2014 perfect, I'll save it and bring the butterflies \u2728" : "";
    $("g3").disabled = !(pick.d && pick.t);
  }

  /* ---------- 6. page 4: the answer + WhatsApp message ----------
     With a WhatsApp number in the link, she must send her answer before the page lets her finish:
     1) "Send my answer"  ->  2) "Did you send it?"  ->  3) the happy ending.
     (A web page can't see inside WhatsApp, so step 2 is the best check possible.) */
  var confirmed = false, warned = false;
  function dateText() { return MONTHS[pick.m] + " " + pick.d + ", " + pick.y; }
  function toast(t) {
    var e = document.createElement("div"); e.className = "toast"; e.textContent = t;
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 4200);
  }
  var HAPPY = "I can't wait to see you! \uD83C\uDF39<br>You + Me = \u2764\uFE0F";
  var lastMsg = "";
  var gateOpen = false;   // true while she still has to send the WhatsApp message
  $("g3").onclick = function () {
    $("rv").textContent = pick.v; $("rd").textContent = dateText(); $("rt").textContent = pick.t;
    if (C.wa) {
      lastMsg = buildMsg(C.name, pick.v, dateText(), pick.t);
      var link = "https://wa.me/" + C.wa + "?text=" + encodeURIComponent(lastMsg);
      $("yay").href = link; $("sendnow").href = link;
      $("gsum").textContent = pick.v + "  \u00B7  " + dateText() + "  \u00B7  " + pick.t;
      $("gate").style.display = ""; $("win").style.display = "none"; gateOpen = true;
      burst(15);
    } else {
      $("yay").removeAttribute("href");
      $("gate").style.display = "none"; $("win").style.display = "";
      burst(40);
    }
    show(4);
  };
  /* tapping "Send my answer on WhatsApp" opens WhatsApp and reveals the happy page */
  $("sendnow").onclick = function () {
    gateOpen = false; burst(60);
    $("gate").style.display = "none"; $("win").style.display = "";
  };
  /* if she tries to close the page before sending, the browser asks her to stay (some phones ignore this) */
  window.addEventListener("beforeunload", function (e) { if (gateOpen) { e.preventDefault(); e.returnValue = ""; } });
  $("yay").onclick = function () {
    burst(30);
    if (!C.wa) return;
    $("rowSend").style.display = "none"; $("rowAsk").style.display = "";
    $("finText").textContent = "Did you press send in WhatsApp? \uD83D\uDC9E";
    $("hint").style.display = "none";
  };
  $("sentYes").onclick = function () {
    confirmed = true;
    $("rowAsk").style.display = "none"; $("finText").innerHTML = HAPPY; burst(60);
  };
  /* the first "back" press on page 4 only shows a reminder; pressing back again lets her leave */
  window.addEventListener("popstate", function () {
    if (C.wa && !$("s4").classList.contains("hide") && !confirmed && !warned) {
      warned = true; history.pushState({ s: 4 }, "");
      toast("Please send your answer first \uD83D\uDC8C  (press back again if you really want to leave)");
    }
  });

  /* "Choose again" starts everything from page 1 */
  $("again").onclick = function () {
    gateOpen = false;
    pick = { v: "", y: 0, m: 0, d: 0, t: "" };
    document.querySelectorAll(".opt,.g button,.times button").forEach(function (x) { x.classList.remove("sel"); });
    $("fav").textContent = ""; $("fav3").textContent = "";
    $("g2").disabled = true; $("g3").disabled = true;
    no.classList.remove("run"); no.style.left = no.style.top = ""; wi = 0; no.textContent = words[0];
    vy = today.getFullYear(); vm = today.getMonth(); drawCal();
    show(1);
  };
}

/* start: from the long link (?d=...) or from the server (?c=...) */
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
