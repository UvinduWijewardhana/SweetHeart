/* auth.js - sign up, log in, log out, password reset and Google sign-in through Supabase Auth.
   It only runs when js/config.js has the Supabase address and key. The password never reaches our own code
   except on its way to Supabase, and it is never saved anywhere in this site. */
var Auth = (function () {
  var KEY = "sh_session";
  function base() { return BE.base() + "/auth/v1"; }
  function plainHeaders(token) {
    var h = { "Content-Type": "application/json", "apikey": SH.supabaseKey };
    if (token) h["Authorization"] = "Bearer " + token; else if (/^eyJ/.test(SH.supabaseKey)) h["Authorization"] = "Bearer " + SH.supabaseKey;
    return h;
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(s) { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch (e) {} }
  function toSession(j) {
    return { access_token: j.access_token, refresh_token: j.refresh_token,
             expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)), user: j.user || null };
  }
  function req(path, opts) {
    return fetch(base() + path, opts).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = JSON.parse(t); } catch (e) {}
        if (!r.ok) {
          var e = new Error((j && (j.msg || j.error_description || j.message || j.error)) || ("error " + r.status));
          e.status = r.status; e.code = j && (j.error_code || j.code); throw e;
        }
        return j;
      });
    });
  }
  function page(name) { return location.origin + location.pathname.replace(/[^\/]*$/, "") + name; }
  function rnd(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a); }
  function b64url(bytes) { var s = ""; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

  var A = {
    on: function () { return BE.on(); },
    session: function () { return load(); },
    user: function () { var s = load(); return s && s.user ? s.user : null; },

    /* a fresh access token, or null when nobody is signed in */
    token: function () {
      var s = load(); if (!s) return Promise.resolve(null);
      if (s.expires_at - Math.floor(Date.now() / 1000) > 60) return Promise.resolve(s.access_token);
      return req("/token?grant_type=refresh_token", { method: "POST", headers: plainHeaders(), body: JSON.stringify({ refresh_token: s.refresh_token }) })
        .then(function (j) { var n = toSession(j); save(n); return n.access_token; })
        .catch(function () { save(null); return null; });
    },

    signUp: function (email, password, name) {
      return req("/signup?redirect_to=" + encodeURIComponent(page("account.html")), { method: "POST", headers: plainHeaders(),
        body: JSON.stringify({ email: email, password: password, data: { full_name: name || "" } }) })
        .then(function (j) { if (j && j.access_token) { save(toSession(j)); return { signedIn: true }; } return { signedIn: false }; });
    },
    signIn: function (email, password) {
      return req("/token?grant_type=password", { method: "POST", headers: plainHeaders(), body: JSON.stringify({ email: email, password: password }) })
        .then(function (j) { save(toSession(j)); return true; });
    },
    signOut: function () {
      var s = load();
      var done = function () { save(null); };
      if (!s) return Promise.resolve();
      return req("/logout", { method: "POST", headers: plainHeaders(s.access_token) }).then(done, done);
    },
    /* the 6-digit code that arrives by email (type "signup" to confirm a new account, "recovery" to reset a password) */
    verifyOtp: function (type, email, code) {
      return req("/verify", { method: "POST", headers: plainHeaders(), body: JSON.stringify({ type: type, email: email, token: code }) })
        .then(function (j) { if (!j || !j.access_token) throw new Error("That code is wrong or has expired."); save(toSession(j)); return true; });
    },
    resendSignup: function (email) {
      return req("/resend", { method: "POST", headers: plainHeaders(), body: JSON.stringify({ type: "signup", email: email }) });
    },
    recover: function (email) {
      return req("/recover?redirect_to=" + encodeURIComponent(page("reset-password.html")), { method: "POST", headers: plainHeaders(), body: JSON.stringify({ email: email }) });
    },
    updatePassword: function (password) {
      return A.token().then(function (t) {
        if (!t) throw new Error("Your reset link has expired. Please ask for a new one.");
        return req("/user", { method: "PUT", headers: plainHeaders(t), body: JSON.stringify({ password: password }) });
      });
    },

    /* Google: the safer "PKCE" way. A secret is made here, only its fingerprint travels in the address. */
    google: function () {
      var verifier = rnd(48);
      try { sessionStorage.setItem("sh_pkce", verifier); } catch (e) {}
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)).then(function (h) {
        location.href = base() + "/authorize?provider=google&redirect_to=" + encodeURIComponent(page("account.html")) +
          "&code_challenge=" + b64url(new Uint8Array(h)) + "&code_challenge_method=s256";
      });
    },
    /* coming back from Google (?code=...) */
    exchange: function (code) {
      var v = null; try { v = sessionStorage.getItem("sh_pkce"); sessionStorage.removeItem("sh_pkce"); } catch (e) {}
      if (!v) return Promise.reject(new Error("Sign-in could not be completed. Please try again."));
      return req("/token?grant_type=pkce", { method: "POST", headers: plainHeaders(), body: JSON.stringify({ auth_code: code, code_verifier: v }) })
        .then(function (j) { save(toSession(j)); return true; });
    },
    /* coming back from an email link (#access_token=...&type=signup or recovery) */
    fromHash: function (hash) {
      var p = new URLSearchParams(String(hash || "").replace(/^#/, "")), at = p.get("access_token");
      if (!at) return Promise.resolve(null);
      var type = p.get("type") || "";
      var s = { access_token: at, refresh_token: p.get("refresh_token") || "", expires_at: Math.floor(Date.now() / 1000) + (+p.get("expires_in") || 3600), user: null };
      return req("/user", { headers: plainHeaders(at) }).then(function (u) { s.user = u; save(s); return type || "login"; });
    },

    me: function () { return BE.call("me", {}); },
    updateName: function (name) {
      var u = A.user(); if (!u) return Promise.reject(new Error("Please log in first."));
      return A.token().then(function (t) {
        return fetch(BE.base() + "/rest/v1/profiles?id=eq." + encodeURIComponent(u.id), { method: "PATCH",
          headers: Object.assign(plainHeaders(t), { "Prefer": "return=minimal" }), body: JSON.stringify({ display_name: name || null }) })
          .then(function (r) { if (!r.ok) throw new Error("Could not save the name."); });
      });
    },
    deleteAccount: function () { return BE.call("delete_my_account", {}).then(function () { save(null); }); },

    /* turns a Supabase message into a kind sentence (never says whether an email is registered) */
    explain: function (e) {
      var m = String((e && e.message) || ""), s = e && e.status;
      if (s === 429 || /rate limit|too many/i.test(m)) return "Too many attempts. Please wait a few minutes and try again.";
      if (/invalid login/i.test(m)) return "Wrong email or password.";
      if (/otp|token/i.test(m) && /(expired|invalid)/i.test(m)) return "That code is wrong or has expired.";
      if (/not confirmed/i.test(m)) return "Please confirm your email first. Check your inbox (and spam).";
      if (/password/i.test(m) && /(short|least|weak|characters)/i.test(m)) return "That password is too weak. Use at least 8 characters.";
      if (/expired|invalid/i.test(m) && /link|token|jwt/i.test(m)) return "This link has expired. Please ask for a new one.";
      return m ? m.slice(0, 140) : "Something went wrong. Please try again.";
    }
  };
  return A;
})();
