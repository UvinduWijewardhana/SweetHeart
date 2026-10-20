/* account.js - the Log in / Sign up / Account page.
   With the Supabase address in js/config.js this is real. Without it, the page is only a preview.
   New accounts are confirmed, and passwords are reset, with a one-time code (OTP) sent by email. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var q = new URLSearchParams(location.search);
  var mode = q.get("mode") === "signup" ? "signup" : "login";
  var next = q.get("next") || "";
  if (!/^[a-z0-9-]+\.html(\?[\w=&%.-]*)?$/i.test(next)) next = "";            /* only pages of this site */
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/, CODE = /^\d{6,10}$/;

  function msg(err, ok) { $("err").textContent = err || ""; $("ok").hidden = !ok; $("ok").textContent = ok || ""; }
  function forms(which) {                          /* show exactly one of the forms */
    ["f", "rf", "otpf", "rstf"].forEach(function (id) { $(id).hidden = id !== which; });
    $$(".soc,.or").forEach(function (e) { e.hidden = which !== "f"; });
    $$("#outview .tabs,#outview h2,#outview > .lead").forEach(function (e) { e.hidden = which !== "f" && !e.classList.contains("tabs") ? true : e.hidden; });
  }
  function setMode(m) {
    mode = m;
    $("tl").classList.toggle("on", m === "login"); $("ts").classList.toggle("on", m === "signup");
    $$(".only-login").forEach(function (e) { e.hidden = m !== "login"; });
    $$(".only-signup").forEach(function (e) { e.hidden = m !== "signup"; });
    $("ap").setAttribute("autocomplete", m === "signup" ? "new-password" : "current-password");
    $("nt").hidden = true; msg("", "");
    $$("#outview > h2.only-login,#outview > h2.only-signup,#outview > .lead").forEach(function (e) { if (e.tagName === "H2") e.hidden = e.classList.contains("only-login") ? m !== "login" : m !== "signup"; else e.hidden = false; });
    $$(".soc,.or").forEach(function (e) { e.hidden = false; });
    $("f").hidden = false; ["rf", "otpf", "rstf"].forEach(function (id) { $(id).hidden = true; });
  }
  $("tl").addEventListener("click", function () { setMode("login"); });
  $("ts").addEventListener("click", function () { setMode("signup"); });
  if (next) $("need").hidden = false;

  /* ---------- preview mode (no server set up) ---------- */
  if (!BE.on()) {
    ["f", "rf"].forEach(function (id) { $(id).addEventListener("submit", function (e) { e.preventDefault(); $("nt").hidden = false; }); });
    $("bgoogle").addEventListener("click", function () { $("nt").hidden = false; });
    $("forgot").addEventListener("click", function () { $("nt").hidden = false; });
    if (window.SH && SH.demoLogin) {
      $("demo").hidden = false;
      $("demo").addEventListener("click", function () {
        try { localStorage.setItem("sh_user", JSON.stringify({ demo: true })); } catch (e) {}
        location.href = next || "gifts.html";
      });
    }
    setMode(mode); return;
  }

  /* ---------- real mode ---------- */
  function showSignedIn() {
    var u = Auth.user();
    $("outview").hidden = !!u; $("inview").hidden = !u;
    if (!u) return;
    $("who").textContent = u.email || "";
    Auth.me().then(function (m) {
      if (m) { $("dn").value = m.display_name || ""; if (m.role === "admin" || m.role === "manager") { $("rolebadge").textContent = m.role; $("rolebadge").hidden = false; } }
    }).catch(function () {});
  }
  function done() { if (next) { location.href = next; return; } showSignedIn(); }
  function clean() { try { history.replaceState(null, "", location.pathname + (next ? "?next=" + encodeURIComponent(next) : "")); } catch (e) {} }

  /* coming back from Google (?code=) or from an email link (#access_token=) */
  var boot = Promise.resolve();
  if (q.get("code")) { boot = Auth.exchange(q.get("code")).then(clean).catch(function (e) { clean(); msg(Auth.explain(e), ""); }); }
  else if (location.hash.indexOf("access_token=") >= 0) { boot = Auth.fromHash(location.hash).then(clean).catch(function (e) { clean(); msg(Auth.explain(e), ""); }); }
  else if (q.get("error_description")) { msg(String(q.get("error_description")).slice(0, 140), ""); }

  /* a "send again" button that waits 60 seconds so nobody can flood an inbox */
  function cooldown(btn) {
    var n = 60, label = btn.getAttribute("data-label") || btn.textContent; btn.setAttribute("data-label", label); btn.disabled = true;
    var t = setInterval(function () { n--; if (n <= 0) { clearInterval(t); btn.disabled = false; btn.textContent = label; } else btn.textContent = label + " (" + n + "s)"; }, 1000);
    btn.textContent = label + " (" + n + "s)";
  }

  var pendingEmail = "";

  /* log in / sign up */
  $("f").addEventListener("submit", function (e) {
    e.preventDefault(); msg("", "");
    var email = $("ae").value.trim(), pw = $("ap").value;
    if (!EMAIL.test(email)) return msg("Please enter a valid email address.", "");
    if (pw.length < 8) return msg("Your password needs at least 8 characters.", "");
    var btn = $("fsub"); btn.disabled = true;
    var p = mode === "signup"
      ? Auth.signUp(email, pw, $("an").value.trim()).then(function (r) {
          if (r.signedIn) { done(); return; }
          pendingEmail = email; $("otptext").textContent = "We sent a code to " + email + ". Type it here to finish creating your account."; $("oc").value = ""; forms("otpf"); cooldown($("oresend")); $("oc").focus();
        })
      : Auth.signIn(email, pw).then(done);
    p.catch(function (er) { msg(Auth.explain(er), ""); }).then(function () { btn.disabled = false; $("ap").value = ""; });
  });
  $("otpf").addEventListener("submit", function (e) {
    e.preventDefault(); msg("", "");
    var code = $("oc").value.replace(/\s/g, "");
    if (!CODE.test(code)) return msg("Please type the code from the email (numbers only).", "");
    $("osub").disabled = true;
    Auth.verifyOtp("signup", pendingEmail, code).then(done).catch(function (er) { msg(Auth.explain(er), ""); }).then(function () { $("osub").disabled = false; });
  });
  $("oresend").addEventListener("click", function () {
    msg("", ""); cooldown($("oresend"));
    Auth.resendSignup(pendingEmail).then(function () { msg("", "We sent a new code."); }).catch(function (er) { msg(Auth.explain(er), ""); });
  });
  $("oback").addEventListener("click", function () { setMode("login"); });

  /* forgot password: 1) email  2) code + new password */
  $("forgot").addEventListener("click", function () { msg("", ""); forms("rf"); $("re").value = $("ae").value; $("re").focus(); });
  $("rback").addEventListener("click", function () { setMode("login"); });
  $("rf").addEventListener("submit", function (e) {
    e.preventDefault(); msg("", "");
    var email = $("re").value.trim();
    if (!EMAIL.test(email)) return msg("Please enter a valid email address.", "");
    pendingEmail = email;
    Auth.recover(email).catch(function () {}).then(function () {      /* the same answer whether or not the email is registered */
      $("rsttext").textContent = "If there is an account for " + email + ", we sent a code to it. Type the code and choose a new password."; $("rc").value = ""; $("rp1").value = ""; $("rp2").value = ""; forms("rstf"); cooldown($("rresend")); $("rc").focus();
    });
  });
  $("rstf").addEventListener("submit", function (e) {
    e.preventDefault(); msg("", "");
    var code = $("rc").value.replace(/\s/g, ""), a = $("rp1").value, b = $("rp2").value;
    if (!CODE.test(code)) return msg("Please type the code from the email (numbers only).", "");
    if (a.length < 8) return msg("Your new password needs at least 8 characters.", "");
    if (a !== b) return msg("The two passwords are not the same.", "");
    $("rsub").disabled = true;
    Auth.verifyOtp("recovery", pendingEmail, code).then(function () { return Auth.updatePassword(a); })
      .then(function () { $("rp1").value = ""; $("rp2").value = ""; done(); })
      .catch(function (er) { msg(Auth.explain(er), ""); }).then(function () { $("rsub").disabled = false; });
  });
  $("rresend").addEventListener("click", function () {
    msg("", ""); cooldown($("rresend")); Auth.recover(pendingEmail).catch(function () {}).then(function () { msg("", "If there is an account, we sent a new code."); });
  });
  $("bgoogle").addEventListener("click", function () { msg("", ""); Auth.google().catch(function (er) { msg(Auth.explain(er), ""); }); });

  /* account view */
  function msg2(err, ok) { $("err2").textContent = err || ""; $("ok2").hidden = !ok; $("ok2").textContent = ok || ""; }
  $("savename").addEventListener("click", function () {
    msg2("", ""); Auth.updateName($("dn").value.trim()).then(function () { msg2("", "Saved."); }).catch(function (er) { msg2(Auth.explain(er), ""); });
  });
  $("logout").addEventListener("click", function () { Auth.signOut().then(function () { location.href = "index.html"; }); });
  $("delacc").addEventListener("click", function () {
    msg2("", "");
    if ($("delc").value.trim() !== "DELETE") return msg2("Type DELETE (in capital letters) to confirm.", "");
    Auth.deleteAccount().then(function () { location.href = "index.html"; }).catch(function (er) { msg2(Auth.explain(er), ""); });
  });

  setMode(mode);
  boot.then(showSignedIn);
})();
