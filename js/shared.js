/* shared.js - used by both index.html (link maker) and one-little-question.html
   Want to add or change the ready-made places? Edit the list below. */

var PLACES = {
  coffee: { title: "Coffee",  sub: "Warm cups & long chats",              value: "Coffee Date", img: "img/coffee.svg", bg: "rgba(190,140,100,.25)" },
  galle:  { title: "Galle",   sub: "Fort walks, lighthouse & golden hour", value: "Galle",       img: "img/galle.svg",  bg: "var(--lav)" },
  movie:  { title: "Movie",   sub: "Popcorn + you + me",                  value: "Movie Night", img: "img/movie.svg",  bg: "var(--peach)" },
  beach:  { title: "Beach",   sub: "Sea breeze, waves & you",             value: "Beach Day",   img: "img/beach.svg",  bg: "rgba(110,180,230,.25)" },
  ride:   { title: "Ride & Spend Time With Me", sub: "Just us, the open road & good vibes", value: "Ride & Spend Time With Me", img: "img/ride.svg", bg: "rgba(247,199,100,.28)" }
};
var PLACE_ORDER = ["coffee", "galle", "movie", "beach", "ride"];
var CUSTOM_BG = ["rgba(247,199,100,.28)", "rgba(150,200,170,.28)", "rgba(200,170,230,.3)"];
/* Places per invitation. Free = 3. Up to 5 will need a small payment later (set PAYMENTS_LIVE to true when payments work). */
var FREE_PLACES = 3, MIN_PLACES = 3, PAID_PLACES = 5, PAYMENTS_LIVE = false;
var MAX_PLACES = PAID_PLACES;   /* the invitation page can read up to 5 */

/* turns the settings into a short text that fits inside a link, and back */
function encodeCfg(o) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeCfg(s) {
  try {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  } catch (e) { return null; }
}

/* WhatsApp number -> digits only, with country code. 077... becomes 9477... (Sri Lanka) */
function cleanWa(n) {
  var d = String(n || "").replace(/\D/g, "");
  if (d.charAt(0) === "0") d = "94" + d.slice(1);
  return /^\d{8,15}$/.test(d) ? d : "";
}

/* one place from the link: ["coffee"]  or  ["x", "My title", "My little line"] */
function makePlace(e, i) {
  if (Object.prototype.hasOwnProperty.call(PLACES, e[0])) {
    var p = PLACES[e[0]];
    return { title: p.title, sub: p.sub, value: p.value, img: p.img, bg: p.bg };
  }
  var t = String(e[1] || "").slice(0, 40), s = String(e[2] || "").slice(0, 60);
  if (!t) return null;
  return { title: t, sub: s, value: t, img: "img/custom.svg", bg: CUSTOM_BG[i % CUSTOM_BG.length] };
}

/* The WhatsApp message she sends (plain text, no emojis) */
function buildMsg(name, place, date, time) {
  return "Yes! I'd love to go on a date with you.\n\nPlace: " + place + "\nDate: " + date + "\nTime: " + time + "\n\n- " + name;
}

/* ---------- photos: square crop, 1 MB limit, tiny thumbnail that travels inside the link ---------- */
var MAX_PHOTO = 1048576;   /* 1 MB */
function squareJpeg(file, size, quality, ok, fail, mode) {   /* mode "contain" = keep the whole picture with white around it (for logos) */
  if (!file) return;
  if (!/^image\/(jpeg|png|webp|gif|bmp)$/i.test(file.type)) { fail("Please choose a JPG or PNG photo."); return; }
  if (file.size > MAX_PHOTO) { fail("That photo is over 1 MB. Please choose a smaller one."); return; }
  var url = URL.createObjectURL(file), im = new Image();
  im.onload = function () {
    URL.revokeObjectURL(url);
    var side = Math.min(im.width, im.height), c = document.createElement("canvas"), x = c.getContext("2d");
    c.width = c.height = size; x.fillStyle = "#fff"; x.fillRect(0, 0, size, size);
    if (mode === "contain") {                       /* logos: nothing is cut off */
      var k = size / Math.max(im.width, im.height), dw = im.width * k, dh = im.height * k;
      x.drawImage(im, (size - dw) / 2, (size - dh) / 2, dw, dh);
    } else {
      x.drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, 0, 0, size, size);   /* photos: centre square crop */
    }
    ok(c.toDataURL("image/jpeg", quality));
  };
  im.onerror = function () { URL.revokeObjectURL(url); fail("Sorry, that photo could not be opened."); };
  im.src = url;
}
/* photos go after the # of the link (a list of data URLs in, a "#i0=...&i2=..." text out) */
function packImgs(arr) {
  var parts = [];
  arr.forEach(function (d, i) {
    if (d) parts.push("i" + i + "=" + d.replace(/^data:image\/jpeg;base64,/, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
  });
  return parts.length ? "#" + parts.join("&") : "";
}
function unpackImgs(hash) {
  var out = {};
  String(hash || "").replace(/^#/, "").split("&").forEach(function (kv) {
    var m = /^i(\d)=([A-Za-z0-9_-]{20,20000})$/.exec(kv);
    if (!m) return;
    var b = m[2].replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    if (b.indexOf("/9j/") === 0) out[m[1]] = "data:image/jpeg;base64," + b;   /* only real JPEG data is accepted */
  });
  return out;
}

/* ---------- a small popup in the middle of the screen ---------- */
function showModal(o) {
  var ov = document.createElement("div"); ov.className = "mdl";
  var box = document.createElement("div"); box.className = "mbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  var x = document.createElement("button"); x.type = "button"; x.className = "mx"; x.setAttribute("aria-label", "Close"); x.textContent = "\u00D7";
  var ic = document.createElement("div"); ic.className = "mic " + (o.kind || "info");
  ic.innerHTML = o.kind === "ok"
    ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 21.5C5 16 2 12.4 2 8.6 2 5.9 4.1 4 6.6 4c1.9 0 3.7 1 5.4 3.1C13.7 5 15.5 4 17.4 4 19.9 4 22 5.9 22 8.6c0 3.8-3 7.4-10 12.9z"/></svg>';
  var h = document.createElement("h3"); h.textContent = o.title;
  var p = document.createElement("p"); p.textContent = o.text;
  var acts = document.createElement("div"); acts.className = "macts";
  function close() { ov.classList.add("out"); setTimeout(function () { ov.remove(); }, 180); document.removeEventListener("keydown", esc); }
  function esc(e) { if (e.key === "Escape") close(); }
  (o.buttons || []).forEach(function (b) {
    var el = document.createElement("button"); el.type = "button"; el.className = "mb " + (b.kind || "fill"); el.textContent = b.label;
    el.addEventListener("click", function () { close(); if (b.onClick) b.onClick(); });
    acts.appendChild(el);
  });
  x.addEventListener("click", close);
  ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  document.addEventListener("keydown", esc);
  box.appendChild(x); box.appendChild(ic); box.appendChild(h); box.appendChild(p); box.appendChild(acts); ov.appendChild(box);
  document.body.appendChild(ov);
  var first = acts.querySelector("button"); if (first) first.focus();
  return close;
}
