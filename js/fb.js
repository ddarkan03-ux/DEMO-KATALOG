/* Lapisan tipis ke Firebase (Firestore + Auth) lewat REST. Tanpa SDK, tanpa build.
   Dipakai oleh index.html (tamu) dan admin.html (tuan rumah).
   Data tersimpan di:  undangan/{kode}/ucapan, undangan/{kode}/tamu, undangan/{kode}/pengaturan/utama */
(function (w) {
  'use strict';
  var FB = {};

  FB.ok = function (D) { var f = D && D.firebase; return !!(f && f.apiKey && f.projectId && D.kode); };
  FB.adminEmail = function (D) { return D.kode + '@admin.undangan'; };

  function root(D) { return 'https://firestore.googleapis.com/v1/projects/' + D.firebase.projectId + '/databases/(default)/documents/undangan/' + encodeURIComponent(D.kode); }
  function key(D, extra) { return '?key=' + encodeURIComponent(D.firebase.apiKey) + (extra || ''); }

  function enc(o) {
    var f = {};
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'boolean') f[k] = { booleanValue: v };
      else if (k === 'waktu') f[k] = { timestampValue: v };
      else f[k] = { stringValue: String(v == null ? '' : v) };
    });
    return f;
  }
  function dec(doc) {
    var o = { id: doc.name.split('/').pop() }, f = doc.fields || {};
    Object.keys(f).forEach(function (k) {
      var v = f[k];
      o[k] = 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'timestampValue' in v ? v.timestampValue : 'integerValue' in v ? Number(v.integerValue) : '';
    });
    return o;
  }
  function call(url, method, body, token) {
    var h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = 'Bearer ' + token;
    return fetch(url, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      return r.text().then(function (t) {
        var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (x) {}
        if (!r.ok) { var e = new Error((j.error && j.error.message) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function query(D, coll, token, limit) {
    return call(root(D) + ':runQuery' + key(D), 'POST', {
      structuredQuery: { from: [{ collectionId: coll }], orderBy: [{ field: { fieldPath: 'waktu' }, direction: 'DESCENDING' }], limit: limit || 300 }
    }, token).then(function (rows) {
      return rows.filter(function (r) { return r.document; }).map(function (r) { return dec(r.document); });
    });
  }
  function add(D, coll, obj, token) {
    obj.waktu = new Date().toISOString();
    return call(root(D) + '/' + coll + key(D), 'POST', { fields: enc(obj) }, token).then(dec);
  }
  function patch(D, path, obj, token) {
    var mask = Object.keys(obj).map(function (k) { return '&updateMask.fieldPaths=' + encodeURIComponent(k); }).join('');
    return call(root(D) + '/' + path + key(D, mask), 'PATCH', { fields: enc(obj) }, token);
  }
  function del(D, path, token) { return call(root(D) + '/' + path + key(D), 'DELETE', null, token); }

  /* publik */
  FB.listUcapan = function (D, token) { return query(D, 'ucapan', token, 300); };
  FB.addUcapan = function (D, u) { return add(D, 'ucapan', { nama: u.nama, pesan: u.pesan, hadir: u.hadir }); };
  FB.getPengaturan = function (D) {
    return call(root(D) + '/pengaturan/utama' + key(D), 'GET').then(dec).catch(function (e) { if (e.status === 404) return {}; throw e; });
  };

  /* admin (perlu token) */
  FB.login = function (D, password) {
    return call('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(D.firebase.apiKey), 'POST',
      { email: FB.adminEmail(D), password: password, returnSecureToken: true }).then(function (r) {
      return { token: r.idToken, refresh: r.refreshToken, exp: Date.now() + (Number(r.expiresIn) - 120) * 1000 };
    });
  };
  FB.refresh = function (D, refreshToken) {
    return fetch('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(D.firebase.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken)
    }).then(function (r) { return r.json(); }).then(function (r) {
      if (!r.id_token) throw new Error('Sesi habis');
      return { token: r.id_token, refresh: r.refresh_token, exp: Date.now() + (Number(r.expires_in) - 120) * 1000 };
    });
  };
  FB.listTamu = function (D, t) { return query(D, 'tamu', t, 500); };
  FB.addTamu = function (D, o, t) { return add(D, 'tamu', o, t); };
  FB.updateTamu = function (D, id, o, t) { return patch(D, 'tamu/' + id, o, t); };
  FB.delTamu = function (D, id, t) { return del(D, 'tamu/' + id, t); };
  FB.delUcapan = function (D, id, t) { return del(D, 'ucapan/' + id, t); };
  FB.setPengaturan = function (D, o, t) { return patch(D, 'pengaturan/utama', o, t); };

  w.FB = FB;
})(window);
