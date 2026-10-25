/* FORM PEMESANAN: isi data > ringkasan (Preview / Edit / Kirim) > ZIP + WhatsApp.
   Daftar isian ada di SECT (bagian bawah baris "var SECT"). Tidak perlu diedit rutin. */
(function () {
  'use strict';
  var S = {resepsiOn: true}, P = {cover: null, pria: null, wanita: null, galeri: []}, K, box, bd, ft, ttl, lastZip, lastName;
  var BLN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'], HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function v(k) { return String(S[k] || '').trim(); }
  function tgl(s) { if (!s) return ''; var d = new Date(s + 'T00:00:00'); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear(); }
  function jam(p) { var a = v(p + '.jam'), b = v(p + '.selesai'); return a ? a.replace(':', '.') + (b ? ' - ' + b.replace(':', '.') : ' - selesai') + ' WIB' : ''; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'klien'; }
  function lum(h) { var n = parseInt(String(h || '').replace('#', ''), 16); if (isNaN(n)) n = 0x888888; return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }

  function ORG(p) { return [['nama','Nama lengkap + gelar'],['panggilan','Nama panggilan'],['ayah','Nama ayah'],['ibu','Nama ibu']].map(function (a) { return {k: p + '.' + a[0], l: a[1], t: 'text', r: 1}; }); }
  function ACARA(p) { return [['tanggal','Tanggal','date',1],['jam','Jam mulai','time',1],['selesai','Jam selesai (opsional)','time'],['tempat','Nama tempat','text',1],['alamat','Alamat lengkap','area',1],['maps','Link Google Maps (opsional)','url']].map(function (a) { return {k: p + '.' + a[0], l: a[1], t: a[2], r: a[3]}; }); }
  var SECT = [
    {t: 'Data Pemesan', f: [{k: 'pemesan', l: 'Nama Anda', t: 'text', r: 1}, {k: 'wa', l: 'No. WhatsApp Anda', t: 'tel', r: 1}]},
    {t: 'Mempelai Pria', f: ORG('pria')},
    {t: 'Mempelai Wanita', f: ORG('wanita')},
    {t: 'Akad Nikah', f: ACARA('akad')},
    {t: 'Resepsi', opt: 'resepsiOn', f: ACARA('resepsi')},
    {t: 'Foto', foto: 1},
    {t: 'Hadiah / Rekening (opsional)', rek: 1},
    {t: 'Tambahan (opsional)', f: [{k: 'musik', l: 'Lagu latar (judul / link)', t: 'text'}, {k: 'catatan', l: 'Catatan untuk kami', t: 'area'}]}
  ];
  var FOTO = [['cover', 'Foto cover (wajib)', 0], ['pria', 'Foto mempelai pria', 0], ['wanita', 'Foto mempelai wanita', 0], ['galeri', 'Galeri (maks. 8 foto)', 1]];
  var FNAME = {cover: 'cover.jpg', pria: 'mempelai-pria.jpg', wanita: 'mempelai-wanita.jpg'};

  /* ---------- validasi ---------- */
  function kurang() {
    var m = [];
    SECT.forEach(function (s) { if (s.opt && !S[s.opt]) return; (s.f || []).forEach(function (f) { if (f.r && !v(f.k)) m.push(f.k); }); });
    ['rek1', 'rek2'].forEach(function (p) { if (v(p + '.bank') || v(p + '.no') || v(p + '.an')) { if (!v(p + '.bank')) m.push(p + '.bank'); else { if (v(p + '.bank') === 'Bank lainnya' && !v(p + '.bank2')) m.push(p + '.bank2'); if (lens(p).indexOf(v(p + '.no').length) < 0) m.push(p + '.no'); } if (!v(p + '.an')) m.push(p + '.an'); } });
    var n = v('wa').replace(/\D/g, ''); if (v('wa') && (n.length < 9 || n.length > 15) && m.indexOf('wa') < 0) m.push('wa');
    if (!P.cover) m.push('cover');
    return m;
  }

  /* ---------- foto (dengan animasi proses upload) ---------- */
  var BUSY = 0;
  function proses(file, cb) {
    var u = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var r = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * r); c.height = Math.round(im.height * r); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      c.toBlob(function (b) { b.arrayBuffer().then(function (ab) { URL.revokeObjectURL(u); cb({bytes: new Uint8Array(ab), url: URL.createObjectURL(b)}); }); }, 'image/jpeg', 0.85);
    };
    im.onerror = function () { URL.revokeObjectURL(u); alert('Foto tidak bisa dibaca: ' + file.name); cb(null); };
    im.src = u;
  }
  function fotoField(key, label, multi) {
    var w = el('div', 'pf'), lb = el('label', 'pl', label), th = el('div', 'th'), st = el('div', 'st'), inp = el('input'), btn = el('label', 'pbtn', 'Pilih foto'), pend = 0, tot = 0, dn = 0;
    w.id = 'f-' + key; inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = !!multi; inp.hidden = true; btn.appendChild(inp);
    st.hidden = true; st.appendChild(el('span')); var bar = el('div', 'bar'), bi = el('i'); bar.appendChild(bi); st.appendChild(bar);
    function items() { return multi ? P.galeri : (P[key] ? [P[key]] : []); }
    function draw() {
      th.textContent = '';
      items().forEach(function (p, i) {
        var t = el('div', 'tm pop'), im = el('img'), x = el('button', 'tx', '×'); im.src = p.url; x.type = 'button'; x.title = 'Hapus';
        x.onclick = function () { if (multi) P.galeri.splice(i, 1); else P[key] = null; draw(); };
        t.appendChild(im); t.appendChild(x); th.appendChild(t);
      });
      for (var j = 0; j < pend; j++) { var l = el('div', 'tm ld'); l.appendChild(el('i', 'sp')); th.appendChild(l); }
    }
    function stat() {
      if (pend) { st.hidden = false; st.className = 'st'; st.firstChild.textContent = 'Mengunggah foto... ' + dn + ' / ' + tot; bi.style.width = Math.max(10, dn / tot * 100) + '%'; }
      else if (tot) { st.className = 'st ok'; st.firstChild.textContent = '\u2713 ' + dn + ' foto siap'; bi.style.width = '100%'; setTimeout(function () { if (!pend) st.hidden = true; }, 2500); }
    }
    inp.onchange = function () {
      var fs = [].slice.call(inp.files); inp.value = '';
      if (multi) { var sisa = 8 - P.galeri.length - pend; if (sisa <= 0) { alert('Maksimal 8 foto galeri.'); return; } fs = fs.slice(0, sisa); }
      if (!fs.length) return;
      tot = fs.length; dn = 0; pend = fs.length; BUSY += fs.length; draw(); stat();
      fs.forEach(function (f) {
        proses(f, function (r) {
          pend--; BUSY--; dn++;
          if (r) { if (multi) P.galeri.push(r); else P[key] = r; w.classList.remove('err'); }
          draw(); stat();
        });
      });
    };
    w.appendChild(lb); w.appendChild(btn); w.appendChild(st); w.appendChild(th); draw(); return w;
  }

  /* ---------- rekening: jumlah digit mengikuti bank ---------- */
  var EW = [10, 11, 12, 13], LAIN = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  var BANK = [['BCA', [10]], ['BRI', [15]], ['Mandiri', [13]], ['BNI', [10]], ['BSI', [10]], ['BTN', [16]], ['CIMB Niaga', [13]], ['Danamon', [10]], ['OCBC', [12]], ['Muamalat', [10]], ['Permata', [10]], ['DANA', EW], ['OVO', EW], ['GoPay', EW], ['ShopeePay', EW], ['Bank lainnya', LAIN]];
  function lens(p) { var b = v(p + '.bank'), r = BANK.filter(function (x) { return x[0] === b; })[0]; return r ? r[1] : []; }
  function rng(a) { return a.length === 1 ? a[0] + ' digit' : a[0] + '-' + a[a.length - 1] + ' digit'; }
  function bn(p) { return v(p + '.bank') === 'Bank lainnya' ? v(p + '.bank2') : v(p + '.bank'); }
  function rekBlock(p, title) {
    var c = el('div', 'rk'), wb = el('div', 'pf'), sel = el('select'), wn = el('div', 'pf'), inp = el('input'), hn = el('small', 'hn');
    c.appendChild(el('b', '', title)); wb.id = 'f-' + p + '-bank'; wb.appendChild(el('label', 'pl', 'Bank / E-wallet'));
    sel.appendChild(new Option('- Tidak ada / pilih -', '')); BANK.forEach(function (b) { sel.appendChild(new Option(b[0], b[0])); }); sel.value = S[p + '.bank'] || ''; wb.appendChild(sel); c.appendChild(wb);
    var w2 = field({k: p + '.bank2', l: 'Nama bank', t: 'text'}); c.appendChild(w2);
    wn.id = 'f-' + p + '-no'; wn.appendChild(el('label', 'pl', 'Nomor rekening / HP e-wallet')); inp.type = 'tel'; inp.inputMode = 'numeric'; inp.value = S[p + '.no'] || ''; wn.appendChild(inp); wn.appendChild(hn); c.appendChild(wn);
    c.appendChild(field({k: p + '.an', l: 'Atas nama (sesuai buku tabungan)', t: 'text'}));
    function hint() {
      if (!v(p + '.bank')) { hn.textContent = 'Pilih bank terlebih dahulu'; hn.className = 'hn'; inp.disabled = true; return; }
      var a = lens(p), mx = a[a.length - 1]; inp.disabled = false; inp.maxLength = mx; inp.value = inp.value.slice(0, mx); S[p + '.no'] = inp.value;
      var n = inp.value.length, ok = a.indexOf(n) >= 0; hn.textContent = n + ' / ' + rng(a) + (ok ? ' \u2713' : ''); hn.className = 'hn' + (ok ? ' ok' : '');
    }
    sel.onchange = function () { S[p + '.bank'] = sel.value; w2.hidden = sel.value !== 'Bank lainnya'; wb.classList.remove('err'); hint(); };
    inp.oninput = function () { inp.value = inp.value.replace(/\D/g, ''); wn.classList.remove('err'); hint(); };
    w2.hidden = sel.value !== 'Bank lainnya'; hint(); return c;
  }

  /* ---------- tampilan form ---------- */
  function field(f) {
    var w = el('div', 'pf'), lb = el('label', 'pl', f.l + (f.r ? ' *' : '')), i = f.t === 'area' ? el('textarea') : el('input');
    w.id = 'f-' + f.k.replace('.', '-'); if (f.t !== 'area') i.type = f.t; else i.rows = 2;
    if (f.t === 'tel') i.inputMode = 'tel'; i.value = S[f.k] || '';
    i.oninput = function () { S[f.k] = i.value; w.classList.remove('err'); };
    w.appendChild(lb); w.appendChild(i); return w;
  }
  function viewForm() {
    ttl.textContent = 'Isi Data Undangan - ' + K.nama; bd.textContent = ''; ft.textContent = '';
    bd.appendChild(el('p', 'pn', 'Isi data di bawah. Tanda * wajib diisi. Setelah lengkap, Anda bisa melihat pratinjau sebelum mengirim.'));
    SECT.forEach(function (s) {
      var c = el('section', 'ps'), h = el('h3', '', s.t); c.appendChild(h);
      if (s.opt) { var lab = el('label', 'ck'), cb = el('input'); cb.type = 'checkbox'; cb.checked = !!S[s.opt]; lab.appendChild(cb); lab.appendChild(document.createTextNode(' Ada acara resepsi (terpisah dari akad)')); c.appendChild(lab); }
      var g = el('div', 'pg');
      if (s.foto) FOTO.forEach(function (a) { g.appendChild(fotoField(a[0], a[1], a[2])); });
      else if (s.rek) { g.appendChild(rekBlock('rek1', 'Rekening 1')); g.appendChild(rekBlock('rek2', 'Rekening 2 (opsional)')); }
      else (s.f || []).forEach(function (f) { g.appendChild(field(f)); });
      c.appendChild(g);
      if (s.opt) { g.hidden = !S[s.opt]; cb.onchange = function () { S[s.opt] = cb.checked; g.hidden = !cb.checked; }; }
      bd.appendChild(c);
    });
    var b = el('button', 'pb main', 'Lanjut'); b.type = 'button';
    b.onclick = function () {
      if (BUSY) { msg.textContent = 'Tunggu, foto masih diproses...'; return; }
      var m = kurang();
      if (m.length) { [].forEach.call(bd.querySelectorAll('.err'), function (n) { n.classList.remove('err'); }); m.forEach(function (k) { var n = bd.querySelector('#f-' + k.replace('.', '-')); if (n) n.classList.add('err'); }); var f1 = bd.querySelector('.err'); if (f1) f1.scrollIntoView({behavior: 'smooth', block: 'center'}); msg.textContent = m.length + ' data wajib belum lengkap / belum sesuai.'; return; }
      viewRingkas();
    };
    var msg = el('span', 'pm2'); ft.appendChild(msg); ft.appendChild(b); bd.scrollTop = 0;
  }

  /* ---------- ringkasan: Preview / Edit / Kirim ---------- */
  var IC = {
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4 18-7z"/></svg>'
  };
  function ib(cls, ic, txt, fn) { var b = el('button', 'pb ' + cls); b.type = 'button'; b.innerHTML = IC[ic] + '<span></span>'; b.lastChild.textContent = txt; b.onclick = fn; return b; }
  function viewRingkas() {
    ttl.textContent = 'Data sudah lengkap'; bd.textContent = ''; ft.textContent = '';
    bd.appendChild(el('p', 'pn', 'Periksa ringkasan ini. Klik Preview untuk melihat hasilnya, Edit untuk mengubah data, atau Kirim bila sudah benar.'));
    var rows = [['Pemesan', v('pemesan') + ' (' + v('wa') + ')'], ['Model', K.nama], ['Mempelai pria', v('pria.nama') + ' (' + v('pria.panggilan') + ')'], ['Mempelai wanita', v('wanita.nama') + ' (' + v('wanita.panggilan') + ')'], ['Akad', tgl(v('akad.tanggal')) + ', ' + jam('akad') + ' - ' + v('akad.tempat')]];
    if (S.resepsiOn) rows.push(['Resepsi', tgl(v('resepsi.tanggal')) + ', ' + jam('resepsi') + ' - ' + v('resepsi.tempat')]);
    rows.push(['Foto', 1 * !!P.cover + 1 * !!P.pria + 1 * !!P.wanita + P.galeri.length + ' file']);
    var c = el('div', 'ps'); rows.forEach(function (r) { var d = el('div', 'rw'); d.appendChild(el('b', '', r[0])); d.appendChild(el('span', '', r[1])); c.appendChild(d); }); bd.appendChild(c);
    var a = el('div', 'acts3');
    a.appendChild(ib('', 'eye', 'Preview', viewPreview)); a.appendChild(ib('', 'edit', 'Edit', viewForm)); a.appendChild(ib('wa', 'send', 'Kirim', kirim));
    ft.appendChild(a); bd.scrollTop = 0;
  }

  /* ---------- preview ---------- */
  function viewPreview() {
    ttl.textContent = 'Preview'; bd.textContent = ''; ft.textContent = '';
    var acc = K.warna || '#8B6B58', on = lum(acc) > 0.6 ? '#2b2420' : '#fff';
    bd.appendChild(el('p', 'pn', 'Pratinjau sederhana dari data & foto Anda dengan warna model ini. Tata letak akhir mengikuti desain ' + K.nama + '.'));
    var iv = el('div', 'iv'); iv.style.setProperty('--a', acc); iv.style.setProperty('--on', on);
    var h = el('div', 'ivh'); if (P.cover) h.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.55)),url(' + P.cover.url + ')';
    h.appendChild(el('small', '', 'THE WEDDING OF')); h.appendChild(el('h2', '', v('pria.panggilan') + ' & ' + v('wanita.panggilan'))); h.appendChild(el('small', '', tgl(v('akad.tanggal')))); iv.appendChild(h);
    var cp = el('div', 'ivs');
    [['pria', 'Putra dari'], ['wanita', 'Putri dari']].forEach(function (a) {
      var d = el('div', 'cp'); if (P[a[0]]) { var im = el('img'); im.src = P[a[0]].url; d.appendChild(im); }
      d.appendChild(el('b', '', v(a[0] + '.nama'))); d.appendChild(el('small', '', a[1] + ' Bpk. ' + v(a[0] + '.ayah') + ' & Ibu ' + v(a[0] + '.ibu'))); cp.appendChild(d);
    }); iv.appendChild(cp);
    [['akad', 'Akad Nikah'], ['resepsi', 'Resepsi']].forEach(function (a) {
      if (a[0] === 'resepsi' && !S.resepsiOn) return;
      var d = el('div', 'ev'); d.appendChild(el('h4', '', a[1])); d.appendChild(el('p', '', tgl(v(a[0] + '.tanggal')) + '\n' + jam(a[0]))); d.appendChild(el('b', '', v(a[0] + '.tempat'))); d.appendChild(el('p', '', v(a[0] + '.alamat'))); if (v(a[0] + '.maps')) d.appendChild(el('span', 'mp', 'Lihat Lokasi')); iv.appendChild(d);
    });
    if (P.galeri.length) { var gl = el('div', 'gl'); P.galeri.forEach(function (p) { var im = el('img'); im.src = p.url; gl.appendChild(im); }); iv.appendChild(gl); }
    ['rek1', 'rek2'].forEach(function (p) { if (!v(p + '.bank')) return; var d = el('div', 'ev'); d.appendChild(el('h4', '', 'Hadiah - ' + bn(p))); d.appendChild(el('b', '', v(p + '.no'))); d.appendChild(el('p', '', 'a.n. ' + v(p + '.an'))); iv.appendChild(d); });
    iv.appendChild(el('p', 'ivf', 'Terima kasih atas doa dan restu Anda.')); bd.appendChild(iv);
    var a = el('div', 'acts3 two'); a.appendChild(ib('', 'edit', 'Kembali', viewRingkas)); a.appendChild(ib('wa', 'send', 'Kirim', kirim)); ft.appendChild(a); bd.scrollTop = 0;
  }

  /* ---------- data, ZIP, WhatsApp ---------- */
  function acara(p) { return {tanggal: v(p + '.tanggal'), tanggalLengkap: tgl(v(p + '.tanggal')), jamMulai: v(p + '.jam'), jamSelesai: v(p + '.selesai'), tempat: v(p + '.tempat'), alamat: v(p + '.alamat'), maps: v(p + '.maps')}; }
  function dataObj() {
    function org(p) { return {nama: v(p + '.nama'), panggilan: v(p + '.panggilan'), ayah: v(p + '.ayah'), ibu: v(p + '.ibu'), foto: P[p] ? 'foto/' + FNAME[p] : ''}; }
    var rek = []; ['rek1', 'rek2'].forEach(function (p) { if (v(p + '.bank')) rek.push({bank: bn(p), nomor: v(p + '.no'), atasNama: v(p + '.an')}); });
    return {model: K.nama, pemesan: {nama: v('pemesan'), whatsapp: v('wa')}, cover: P.cover ? 'foto/cover.jpg' : '', mempelai: {pria: org('pria'), wanita: org('wanita')}, akad: acara('akad'), resepsi: S.resepsiOn ? acara('resepsi') : null, galeri: P.galeri.map(function (_, i) { return 'foto/galeri-' + (i + 1) + '.jpg'; }), hadiah: rek, musik: v('musik'), catatan: v('catatan')};
  }
  function teks(d) {
    var L = ['DATA UNDANGAN DIGITAL', 'Model: ' + d.model, 'Pemesan: ' + d.pemesan.nama + ' (' + d.pemesan.whatsapp + ')', '', 'MEMPELAI PRIA', d.mempelai.pria.nama + ' (' + d.mempelai.pria.panggilan + ')', 'Putra dari Bpk. ' + d.mempelai.pria.ayah + ' & Ibu ' + d.mempelai.pria.ibu, '', 'MEMPELAI WANITA', d.mempelai.wanita.nama + ' (' + d.mempelai.wanita.panggilan + ')', 'Putri dari Bpk. ' + d.mempelai.wanita.ayah + ' & Ibu ' + d.mempelai.wanita.ibu];
    [['AKAD NIKAH', d.akad], ['RESEPSI', d.resepsi]].forEach(function (a) { if (!a[1]) return; L.push('', a[0], a[1].tanggalLengkap + ', ' + a[1].jamMulai + (a[1].jamSelesai ? ' - ' + a[1].jamSelesai : ' - selesai') + ' WIB', a[1].tempat, a[1].alamat); if (a[1].maps) L.push('Maps: ' + a[1].maps); });
    if (d.hadiah.length) { L.push('', 'REKENING HADIAH'); d.hadiah.forEach(function (r) { L.push(r.bank + ' ' + r.nomor + ' a.n. ' + r.atasNama); }); }
    if (d.musik) L.push('', 'LAGU LATAR: ' + d.musik); if (d.catatan) L.push('', 'CATATAN: ' + d.catatan);
    return L.join('\r\n');
  }
  var CT = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CT[n] = c >>> 0; }
  function crc(b) { var c = -1; for (var i = 0; i < b.length; i++) c = CT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
  function zip(fs) {
    var en = new TextEncoder(), out = [], cd = [], off = 0, d = new Date(), dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    fs.forEach(function (f) {
      var nm = en.encode(f.name), cr = crc(f.data), sz = f.data.length, h = new DataView(new ArrayBuffer(30)), c = new DataView(new ArrayBuffer(46));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(10, tm, true); h.setUint16(12, dt, true); h.setUint32(14, cr, true); h.setUint32(18, sz, true); h.setUint32(22, sz, true); h.setUint16(26, nm.length, true);
      out.push(new Uint8Array(h.buffer), nm, f.data);
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(12, tm, true); c.setUint16(14, dt, true); c.setUint32(16, cr, true); c.setUint32(20, sz, true); c.setUint32(24, sz, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cd.push(new Uint8Array(c.buffer), nm); off += 30 + nm.length + sz;
    });
    var cs = 0; cd.forEach(function (x) { cs += x.length; });
    var e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, fs.length, true); e.setUint16(10, fs.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob(out.concat(cd, [new Uint8Array(e.buffer)]), {type: 'application/zip'});
  }
  var lastZip, lastName;
  function unduh() { var a = document.createElement('a'), u = URL.createObjectURL(lastZip); a.href = u; a.download = lastName + '.zip'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000); setTimeout(function () { URL.revokeObjectURL(u); }, 120000); }
  function waLink() {
    var no = String((window.KATALOG_INFO || {}).whatsapp || '').replace(/\D/g, ''); if (no.indexOf('0') === 0) no = '62' + no.slice(1);
    var t = 'Halo, saya ' + v('pemesan') + ' ingin memesan undangan digital model ' + K.nama + '.\n\nMempelai: ' + v('pria.nama') + ' & ' + v('wanita.nama') + '\nAkad: ' + tgl(v('akad.tanggal')) + ', ' + jam('akad') + (S.resepsiOn ? '\nResepsi: ' + tgl(v('resepsi.tanggal')) + ', ' + jam('resepsi') : '') + '\n\nData & foto saya kirim dalam file ZIP (' + lastName + '.zip) yang saya lampirkan di chat ini.';
    return 'https://wa.me/' + no + '?text=' + encodeURIComponent(t);
  }
  function kirim() {
    if (BUSY) { alert('Tunggu sebentar, foto masih diproses.'); return; }
    var d = dataObj(), en = new TextEncoder(), fs = [], root = 'undangan-' + slug(d.mempelai.pria.panggilan) + '-' + slug(d.mempelai.wanita.panggilan);
    function add(n, b) { fs.push({name: root + '/' + n, data: b}); }
    add('data/data-undangan.js', en.encode('/* Data undangan (dibuat otomatis dari katalog). Salin ke VS Code; sesuaikan nama properti dengan template bila perlu. */\r\nconst DATA_UNDANGAN = ' + JSON.stringify(d, null, 2) + ';\r\n'));
    add('data/data-klien.txt', en.encode(teks(d)));
    ['cover', 'pria', 'wanita'].forEach(function (k) { if (P[k]) add('foto/' + FNAME[k], P[k].bytes); });
    P.galeri.forEach(function (p, i) { add('foto/galeri-' + (i + 1) + '.jpg', p.bytes); });
    lastName = root; lastZip = zip(fs); unduh(); hasil();
  }
  function hasil() {
    ttl.textContent = 'Kirim ke WhatsApp'; bd.textContent = ''; ft.textContent = '';
    var mb = (lastZip.size / 1048576).toFixed(1), c = el('div', 'ps');
    c.appendChild(el('h3', '', 'File ' + lastName + '.zip siap (' + mb + ' MB)'));
    c.appendChild(el('p', 'pn', 'Isi ZIP: folder foto (semua foto) dan folder data (data-undangan.js & data-klien.txt).'));
    c.appendChild(el('p', 'pn', 'Langkah 1: ZIP otomatis terunduh. Jika belum, tekan Unduh ZIP.'));
    c.appendChild(el('p', 'pn', 'Langkah 2: tekan Buka WhatsApp, klik ikon klip / lampiran di chat, pilih file ZIP dari folder Unduhan, lalu kirim.')); bd.appendChild(c);
    var a = el('div', 'acts3'); a.appendChild(ib('', 'down', 'Unduh ZIP', unduh)); a.appendChild(ib('wa', 'send', 'Buka WhatsApp', function () { window.open(waLink(), '_blank'); }));
    var zf = window.File ? new File([lastZip], lastName + '.zip', {type: 'application/zip'}) : null;
    if (zf && navigator.canShare && navigator.canShare({files: [zf]})) a.appendChild(ib('', 'send', 'Bagikan', function () { navigator.share({files: [zf], title: 'Data undangan'}).catch(function () {}); }));
    ft.appendChild(a);
  }

  /* ---------- modal ---------- */
  var CSS = '[hidden]{display:none!important}.pm{position:fixed;inset:0;z-index:99;background:rgba(30,24,20,.55);display:flex;align-items:flex-end;justify-content:center}.pd{background:#fff;width:100%;max-width:560px;height:94vh;border-radius:20px 20px 0 0;display:flex;flex-direction:column;overflow:hidden}@media(min-width:600px){.pm{align-items:center}.pd{height:90vh;border-radius:20px}}'
  + '.ph{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eee}.ph b{font-size:1rem}.px{border:0;background:#F1ECE6;width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer;color:#8B6B58}'
  + '.pb0{flex:1;overflow:auto;padding:14px 16px}.pf0{padding:12px 16px;border-top:1px solid #eee;display:flex;gap:10px;align-items:center;justify-content:flex-end;background:#fff}'
  + '.pn{font-size:.85rem;opacity:.75;margin:0 0 12px}.ps{background:#FAF8F5;border-radius:14px;padding:12px;margin-bottom:12px}.ps h3{margin:0 0 8px;font-size:.95rem}.pg{display:grid;gap:10px}'
  + '.pl{display:block;font-size:.78rem;font-weight:600;margin-bottom:3px}.pf input:not([type=file]),.pf textarea{width:100%;padding:10px;border:1px solid #ddd5cc;border-radius:10px;font:inherit;background:#fff}.pf.err input,.pf.err textarea,.pf.err .pbtn{border-color:#d6336c}.pf.err .pl{color:#d6336c}'
  + '.ck{display:block;font-size:.85rem;margin-bottom:8px}.pbtn{display:inline-block;padding:8px 14px;border:1px dashed #8B6B58;border-radius:10px;color:#8B6B58;font-size:.85rem;cursor:pointer}.th{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}'
  + '.tm{position:relative;width:64px;height:64px}.tm img{width:100%;height:100%;object-fit:cover;border-radius:10px}.tx{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:0;background:#d6336c;color:#fff;cursor:pointer;line-height:1}'
  + '.pb{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:44px;padding:0 16px;border:0;border-radius:12px;background:#F1ECE6;color:#8B6B58;font:600 .9rem system-ui,sans-serif;cursor:pointer}.pb svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'
  + '.pb.main{background:#8B6B58;color:#fff}.pb.wa{background:#1f9d55;color:#fff}.pm2{flex:1;font-size:.78rem;color:#d6336c}.acts3{display:flex;gap:8px;width:100%}.acts3 .pb{flex:1}.rw{display:flex;gap:8px;font-size:.85rem;padding:5px 0;border-bottom:1px solid #eee}.rw b{min-width:105px}'
  + '.iv{border-radius:14px;overflow:hidden;background:#fff;border:1px solid #eee;text-align:center;color:#3a302a}.ivh{padding:60px 20px;background:var(--a) center/cover;color:#fff}.ivh h2{font:600 2rem Georgia,serif;margin:8px 0}.ivh small{letter-spacing:.15em;font-size:.72rem}.ivs{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px 14px}'
  + '.cp img{width:92px;height:92px;border-radius:50%;object-fit:cover;border:3px solid var(--a)}.cp b{display:block;margin-top:6px;font-size:.9rem}.cp small{display:block;font-size:.72rem;opacity:.7}.ev{margin:12px 14px;padding:14px;border-radius:14px;background:var(--a);color:var(--on);white-space:pre-line}.ev h4{margin:0 0 6px;font:600 1.1rem Georgia,serif}.ev p{margin:4px 0;font-size:.85rem}.mp{display:inline-block;margin-top:6px;padding:5px 12px;border:1px solid currentColor;border-radius:99px;font-size:.78rem}'
  + '.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px 14px}.gl img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px}.ivf{padding:18px;font-size:.8rem;opacity:.7}'
  + '.pf select{width:100%;padding:10px;border:1px solid #ddd5cc;border-radius:10px;font:inherit;background:#fff}.pf.err select{border-color:#d6336c}.rk{background:#fff;border:1px solid #eee;border-radius:12px;padding:10px;margin-bottom:10px;display:grid;gap:8px}.hn{display:block;margin-top:3px;font-size:.75rem;color:#999}.hn.ok{color:#1f9d55;font-weight:600}'
  + '.st{margin-top:8px;font-size:.78rem;color:#8B6B58}.st.ok{color:#1f9d55;font-weight:600}.bar{height:6px;background:#eee;border-radius:99px;overflow:hidden;margin-top:4px}.bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#8B6B58,#e0bfa8,#8B6B58);background-size:200% 100%;animation:pfs 1s linear infinite;transition:width .3s}.st.ok .bar i{background:#1f9d55;animation:none}'
  + '.tm.ld{background:linear-gradient(90deg,#f1ece6,#fff,#f1ece6);background-size:200% 100%;animation:pfs 1.2s linear infinite;border-radius:10px;display:flex;align-items:center;justify-content:center}.sp{width:22px;height:22px;border:3px solid #e7ddd3;border-top-color:#8B6B58;border-radius:50%;animation:pfr .7s linear infinite}.pop{animation:pfp .35s ease}'
  + '@keyframes pfs{to{background-position:-200% 0}}@keyframes pfr{to{transform:rotate(360deg)}}@keyframes pfp{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}';
  window.PesanForm = {
    buka: function (k) {
      K = k; if (!document.getElementById('pf-css')) { var s = el('style'); s.id = 'pf-css'; s.textContent = CSS; document.head.appendChild(s); }
      if (box) box.remove(); box = el('div', 'pm'); var d = el('div', 'pd'), h = el('div', 'ph'), x = el('button', 'px', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Tutup');
      ttl = el('b'); bd = el('div', 'pb0'); ft = el('div', 'pf0'); h.appendChild(ttl); h.appendChild(x); d.appendChild(h); d.appendChild(bd); d.appendChild(ft); box.appendChild(d); document.body.appendChild(box);
      x.onclick = function () { if (confirm('Tutup formulir? Data yang sudah diisi tetap tersimpan selama halaman ini belum ditutup.')) box.hidden = true; };
      box.hidden = false; viewForm();
    }
  };
})();
