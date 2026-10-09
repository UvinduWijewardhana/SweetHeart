/* account.js - Log in / Sign up screen. The real sign-in is not connected yet. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var q = new URLSearchParams(location.search);
  var mode = q.get("mode") === "signup" ? "signup" : "login";
  var next = q.get("next") || "";
  if (!/^[a-z0-9-]+\.html(\?[\w=&%.-]*)?$/i.test(next)) next = "";   /* only allow pages of this site */
  function setMode(m) {
    mode = m;
    $("#tl").classList.toggle("on", m === "login");
    $("#ts").classList.toggle("on", m === "signup");
    $$(".only-login").forEach(function (e) { e.hidden = m !== "login"; });
    $$(".only-signup").forEach(function (e) { e.hidden = m !== "signup"; });
    $("#nt").hidden = true;
  }
  $("#tl").addEventListener("click", function () { setMode("login"); });
  $("#ts").addEventListener("click", function () { setMode("signup"); });
  /* nothing is sent anywhere: the form only shows the "not live yet" notice */
  $("#f").addEventListener("submit", function (e) { e.preventDefault(); $("#nt").hidden = false; });
  $$(".soc button").forEach(function (b) { b.addEventListener("click", function () { $("#nt").hidden = false; }); });
  if (next) $("#need").hidden = false;
  /* preview-only login so the cart and checkout can be tried. Turn it off in js/config.js */
  var demo = $("#demo");
  if (window.SH && SH.demoLogin) {
    demo.hidden = false;
    demo.addEventListener("click", function () {
      try { localStorage.setItem("sh_user", JSON.stringify({ demo: true })); } catch (e) {}
      location.href = next || "gifts.html";
    });
  }
  setMode(mode);
})();
