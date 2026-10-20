/* reset.js - the page the "reset your password" email opens */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  function msg(err, ok) { $("err").textContent = err || ""; $("ok").hidden = !ok; $("ok").textContent = ok || ""; }
  if (!BE.on()) { msg("This page needs the server, which is not set up here.", ""); return; }
  var ready = location.hash.indexOf("access_token=") >= 0
    ? Auth.fromHash(location.hash).then(function () { try { history.replaceState(null, "", location.pathname); } catch (e) {} })
    : Promise.resolve();
  ready.catch(function (e) { msg(Auth.explain(e), ""); });
  $("f").addEventListener("submit", function (e) {
    e.preventDefault(); msg("", "");
    var a = $("p1").value, b = $("p2").value;
    if (a.length < 8) return msg("Your password needs at least 8 characters.", "");
    if (a !== b) return msg("The two passwords are not the same.", "");
    ready.then(function () { return Auth.updatePassword(a); })
      .then(function () { msg("", "Your new password is saved. Taking you to your account..."); setTimeout(function () { location.href = "account.html"; }, 1500); })
      .catch(function (er) { msg(Auth.explain(er), ""); });
  });
})();
