/* appreciation-create.js - the form a company fills in to make an employee appreciation link.
   The company (not the employee) chooses the date and the time. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var logo = null;
  function say(m) { $("err").textContent = m; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var d = new Date(); var todayStr = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  $("date").min = todayStr;

  /* ---------- logo: tap (gallery on a phone) or drag and drop. Square crop, max 1 MB ---------- */
  var drop = $("drop"), file = $("pfile");
  function setLogo(x) { logo = x; $("dprev").hidden = !x; $("dtxt").hidden = !!x; if (x) $("dprev").src = x; }
  function take(f) { say(""); squareJpeg(f, 128, 0.7, setLogo, function (m) { setLogo(null); say(m); }, "contain"); }
  drop.addEventListener("click", function () { file.click(); });
  drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
  file.addEventListener("change", function () { take(file.files[0]); file.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { take(e.dataTransfer && e.dataTransfer.files[0]); });

  /* ---------- the clock: move the hand to choose the hour, then the minutes ---------- */
  var T = { h: null, m: null, ap: "AM", mode: "h" }, face = $("face");
  function render() {
    face.querySelectorAll(".num").forEach(function (e) { e.remove(); });
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180, n = document.createElement("span"); n.className = "num";
      var val = T.mode === "h" ? (i === 0 ? 12 : i) : i * 5;
      n.textContent = T.mode === "h" ? val : pad(val);
      n.style.left = (50 + 40 * Math.sin(a)) + "%"; n.style.top = (50 - 40 * Math.cos(a)) + "%";
      if (T.mode === "h" ? T.h === val : T.m === val) n.classList.add("sel");
      face.appendChild(n);
    }
    var ang = null;
    if (T.mode === "h" && T.h !== null) ang = (T.h % 12) * 30;
    if (T.mode === "m" && T.m !== null) ang = T.m * 6;
    $("hand").hidden = ang === null;
    if (ang !== null) $("hand").style.transform = "rotate(" + ang + "deg)";
    $("ch").textContent = T.h === null ? "--" : T.h; $("cm").textContent = T.m === null ? "--" : pad(T.m);
    $("ch").classList.toggle("on", T.mode === "h"); $("cm").classList.toggle("on", T.mode === "m");
    $("cam").classList.toggle("on", T.ap === "AM"); $("cpm").classList.toggle("on", T.ap === "PM");
    if (T.h !== null && T.m !== null) $("tin").value = pad((T.h % 12) + (T.ap === "PM" ? 12 : 0)) + ":" + pad(T.m);
  }
  var drag = false;
  function at(e) {
    var r = face.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    if (T.mode === "h") { var h = Math.round(deg / 30) % 12; T.h = h === 0 ? 12 : h; } else { T.m = Math.round(deg / 6) % 60; }
    render();
  }
  face.addEventListener("pointerdown", function (e) { drag = true; try { face.setPointerCapture(e.pointerId); } catch (x) {} at(e); e.preventDefault(); });
  face.addEventListener("pointermove", function (e) { if (drag) at(e); });
  face.addEventListener("pointerup", function () { if (!drag) return; drag = false; if (T.mode === "h") { T.mode = "m"; render(); } });
  face.addEventListener("pointercancel", function () { drag = false; });
  $("ch").addEventListener("click", function () { T.mode = "h"; render(); });
  $("cm").addEventListener("click", function () { T.mode = "m"; render(); });
  $("cam").addEventListener("click", function () { T.ap = "AM"; render(); });
  $("cpm").addEventListener("click", function () { T.ap = "PM"; render(); });
  $("tin").addEventListener("change", function () {            /* typing the time works too */
    var m = /^(\d{1,2}):(\d{2})$/.exec($("tin").value); if (!m) return;
    var h24 = +m[1]; T.ap = h24 >= 12 ? "PM" : "AM"; T.h = h24 % 12 || 12; T.m = +m[2]; render();
  });
  render();

  /* ---------- make the link ---------- */
  $("mk").addEventListener("click", function () {
    say("");
    var wa = cleanWa($("wa").value), co = $("co").value.trim(), emp = $("emp").value.trim(), role = $("role").value.trim(), gt = $("gift").value.trim(), dt = $("date").value;
    if (!wa) return say("Please enter your WhatsApp number (digits only, e.g. 0771234567).");
    if (!co) return say("Please enter the company name.");
    if (!emp) return say("Please enter the employee's name.");
    if (!role) return say("Please enter the employee's job role.");
    if (!gt) return say("Please type what the gift is.");
    if (!dt) return say("Please choose the date of the gift.");
    if (dt < todayStr) return say("That date has already passed. Please choose today or a later day.");
    if (T.h === null || T.m === null) return say("Please set the time on the clock: tap the hour, then the minutes.");
    var tm = pad((T.h % 12) + (T.ap === "PM" ? 12 : 0)) + ":" + pad(T.m);
    var cfg = { w: wa, c: co, e: emp, r: role, gt: gt, gd: $("gd").value.trim(), m: $("msg").value.trim(), s: $("from").value.trim(), dt: dt, tm: tm };
    var base = location.href.split(/[?#]/)[0].replace(/[^\/]*$/, "");
    function show(link) {
      $("out").value = link; $("prev").href = link;
      if (link.length > 1800) { $("send").hidden = true; $("longtip").hidden = false; }
      else { $("send").hidden = false; $("longtip").hidden = true; $("send").href = "https://wa.me/?text=" + encodeURIComponent("A thank-you gift for you from " + co + ": " + link); }
      $("res").hidden = false; $("res").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    var longLink = function () { return base + "appreciation.html?d=" + encodeCfg(cfg) + packImgs([logo]); };
    if (!BE.on()) { show(longLink()); return; }
    var btn = $("mk"), label = btn.textContent; btn.disabled = true; btn.textContent = "Making your link...";
    BE.create("appreciation", cfg, logo ? { "0": logo } : {})
      .then(function (code) { show(base + "appreciation.html?c=" + code); })
      .catch(function (e) { var m = BE.explain(e); if (m.fatal) say(m.text); else { say(m.text + " Making the long link instead."); show(longLink()); } })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
  $("copy").addEventListener("click", function () {
    var out = $("out"); out.select();
    var done = function () { $("copy").textContent = "Copied \u2713"; setTimeout(function () { $("copy").textContent = "Copy link"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { document.execCommand("copy"); done(); });
    else { document.execCommand("copy"); done(); }
  });
})();
