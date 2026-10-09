/* create.js - the date invitation link maker (date-invite.html) */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var customs = [];        /* places you add yourself: {t: title, s: line, img: square photo or null} */
  var photo = null;        /* photo chosen for the place being added */
  var told = false;        /* the "free is 3 places" popup is shown only once while ticking */
  var box = $("pl");

  /* ready-made places: nothing is ticked at the start, you choose */
  PLACE_ORDER.forEach(function (k) {
    var p = PLACES[k], row = document.createElement("label"); row.className = "prow";
    var im = document.createElement("img"); im.src = p.img; im.alt = "";
    var tx = document.createElement("span"), b = document.createElement("b"), s = document.createElement("small");
    b.textContent = p.title; s.textContent = p.sub; tx.appendChild(b); tx.appendChild(s);
    var cb = document.createElement("input"); cb.type = "checkbox"; cb.dataset.k = k;
    cb.addEventListener("change", function () {
      if (cb.checked && count() > PAID_PLACES) { cb.checked = false; say("You can have up to " + PAID_PLACES + " places."); return; }
      say(""); heads();
    });
    row.appendChild(im); row.appendChild(tx); row.appendChild(cb); box.appendChild(row);
  });
  function count() { return box.querySelectorAll("input:checked").length + customs.length; }
  function say(m) { $("err").textContent = m; }
  $("plimit").textContent = "Choose at least " + MIN_PLACES + " places. " + FREE_PLACES + " places are free (places you add yourself count too). 4 or 5 places need a small fee, about LKR 100.";

  /* friendly popup the first time you go past the free 3 */
  function heads() {
    if (count() > FREE_PLACES && !told) {
      told = true;
      showModal({
        title: "Free invitations have 3 places",
        text: "You can still pick up to " + PAID_PLACES + " places. Anything over " + FREE_PLACES + " is a small paid upgrade (about LKR 100), and you will see the payment page when you create the link. Places you add yourself count too.",
        buttons: [{ label: "Got it", kind: "fill" }]
      });
    }
  }

  /* places you add yourself */
  function drawCustoms() {
    box.querySelectorAll(".mine").forEach(function (e) { e.remove(); });
    customs.forEach(function (c, i) {
      var row = document.createElement("div"); row.className = "prow mine";
      var im = document.createElement("img"); im.src = c.img || "img/custom.svg"; im.alt = ""; im.className = "cust";
      var tx = document.createElement("span"), b = document.createElement("b"), s = document.createElement("small");
      b.textContent = c.t; s.textContent = c.s; tx.appendChild(b); tx.appendChild(s);
      var x = document.createElement("button"); x.type = "button"; x.className = "btn ghost"; x.textContent = "Remove"; x.style.marginLeft = "auto";
      x.onclick = function () { customs.splice(i, 1); drawCustoms(); say(""); };
      row.appendChild(im); row.appendChild(tx); row.appendChild(x); box.appendChild(row);
    });
  }

  /* photo box: tap to choose (opens the gallery on a phone), or drag a photo onto it on a computer */
  var drop = $("drop"), file = $("pfile");
  function setPhoto(d) {
    photo = d;
    $("dprev").hidden = !d; $("dtxt").hidden = !!d;
    if (d) $("dprev").src = d;
  }
  function takeFile(f) {
    say("");
    squareJpeg(f, 96, 0.6, function (d) { setPhoto(d); }, function (m) { setPhoto(null); say(m); });
  }
  drop.addEventListener("click", function () { file.click(); });
  drop.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
  file.addEventListener("change", function () { takeFile(file.files[0]); file.value = ""; });
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { takeFile(e.dataTransfer && e.dataTransfer.files[0]); });

  $("add").onclick = function () {
    var t = $("ct").value.trim(), s = $("cs").value.trim();
    say("");
    if (!t) { say("Type a place name first."); return; }
    if (count() >= PAID_PLACES) { say("You can have up to " + PAID_PLACES + " places."); return; }
    customs.push({ t: t, s: s, img: photo });
    $("ct").value = ""; $("cs").value = ""; setPhoto(null);
    drawCustoms(); heads();
  };

  /* make the link */
  var pending = null;
  function build() {
    var p = [], imgs = [];
    box.querySelectorAll("input:checked").forEach(function (c) { p.push([c.dataset.k]); imgs.push(null); });
    customs.forEach(function (c) { p.push(["x", c.t, c.s]); imgs.push(c.img || null); });
    return { cfg: { n: $("nm").value.trim(), k: $("nk").value.trim(), w: cleanWa($("wa").value), p: p }, imgs: imgs };
  }
  function showLink(link) {
    $("out").value = link; $("prev").href = link;
    var wa = $("send");
    if (link.length > 1800) { wa.style.display = "none"; $("longtip").style.display = "block"; }
    else { wa.style.display = ""; $("longtip").style.display = "none"; wa.href = "https://wa.me/?text=" + encodeURIComponent("I made something for you: " + link); }
    $("res").style.display = "block";
    $("res").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function makeLink(o) {
    var base = location.href.split(/[?#]/)[0].replace(/[^\/]*$/, "");
    var longLink = function () { return base + "one-little-question.html?d=" + encodeCfg(o.cfg) + packImgs(o.imgs); };
    if (!BE.on()) { showLink(longLink()); return; }
    var btn = $("mk"), label = btn.textContent; btn.disabled = true; btn.textContent = "Making your link...";
    var imgs = {}; o.imgs.forEach(function (d, i) { if (d) imgs[i] = d; });
    BE.create("date", o.cfg, imgs)
      .then(function (code) { showLink(base + "one-little-question.html?c=" + code); })
      .catch(function (e) { var m = BE.explain(e); if (m.fatal) say(m.text); else { say(m.text + " Making the long link instead."); showLink(longLink()); } })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  }
  $("mk").onclick = function () {
    say("");
    if (!cleanWa($("wa").value)) { say("Please enter your WhatsApp number (digits only, e.g. 0771234567)."); return; }
    if (!$("nm").value.trim()) { say("Please enter her name."); return; }
    var n = count();
    if (n < MIN_PLACES) { say("Please choose at least " + MIN_PLACES + " places. Tick the ready-made ones or add your own."); return; }
    var o = build();
    if (n <= FREE_PLACES) { makeLink(o); return; }
    /* 4 or 5 places: the paid upgrade */
    try { sessionStorage.setItem("sh_pending", JSON.stringify({ n: n, cfg: o.cfg })); } catch (e) {}
    showModal({
      title: "This one is a paid upgrade",
      text: "You picked " + n + " places. Free invitations include " + FREE_PLACES + ". The extra places are a small one-time fee (about LKR 100).",
      buttons: [
        { label: "Continue to payment", kind: "fill", onClick: function () { location.href = "payment.html?n=" + n; } },
        { label: "Keep it free (choose 3)", kind: "ghost" }
      ]
    });
  };

  $("copy").onclick = function () {
    var out = $("out"); out.select();
    var done = function () { $("copy").textContent = "Copied \u2713"; setTimeout(function () { $("copy").textContent = "Copy link"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { document.execCommand("copy"); done(); });
    else { document.execCommand("copy"); done(); }
  };
})();
