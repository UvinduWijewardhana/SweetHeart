/* backend.js - talks to the Supabase database (js/config.js has the address and the public key).
   If they are empty, nothing here runs and the site keeps using the long links. */
var BE = {
  on: function () { return !!(window.SH && SH.supabaseUrl && SH.supabaseKey); },
  call: function (fn, body) {
    return fetch(SH.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SH.supabaseKey, "Authorization": "Bearer " + SH.supabaseKey },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = JSON.parse(t); } catch (e) {}
        if (!r.ok) throw new Error((j && j.message) || ("error " + r.status));
        return j;
      });
    });
  },
  create: function (kind, data, images) { return BE.call("create_invitation", { p_kind: kind, p_data: data, p_images: images || {} }); },
  get: function (code) { return BE.call("get_invitation", { p_code: code }); },
  /* only real JPEG pictures are accepted from the server */
  cleanImgs: function (o) {
    var out = {};
    Object.keys(o || {}).forEach(function (k) {
      if (/^[0-4]$/.test(k) && typeof o[k] === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(o[k])) out[k] = o[k];
    });
    return out;
  },
  /* turns a server error into a message. fatal = stop, otherwise we fall back to the long link */
  explain: function (e) {
    var m = String((e && e.message) || "");
    if (m.indexOf("upgrade_required") >= 0) return { fatal: true, text: "Free invitations can have up to 3 places." };
    if (m.indexOf("too_many") >= 0) return { fatal: true, text: "Too many invitations were made from this connection. Please try again in a while." };
    if (m.indexOf("bad_data") >= 0) return { fatal: true, text: "Something in the form is not allowed. Please check it and try again." };
    return { fatal: false, text: "We could not reach the server." };
  }
};
