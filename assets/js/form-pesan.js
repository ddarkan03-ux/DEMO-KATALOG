/* FORM PEMESANAN: isi data > ringkasan (Preview / Edit / Kirim) > ZIP + WhatsApp.
   Daftar isian ada di SECT (bagian bawah baris "var SECT"). Tidak perlu diedit rutin. */
(function () {
  'use strict';
  var S = {resepsiOn: true}, P = {cover: null, pria: null, wanita: null, anak: null, galeri: []}, curKat, K, box, bd, ft, ttl, lastZip, lastName;
  var BLN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'], HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function v(k) { return String(S[k] || '').trim(); }
  function tgl(s) { if (!s) return ''; var d = new Date(s + 'T00:00:00'); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear(); }
  function jam(p) { var a = v(p + '.jam'), b = v(p + '.selesai'); return a ? a.replace(':', '.') + (b ? ' - ' + b.replace(':', '.') : ' - selesai') + ' WIB' : ''; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'klien'; }
  function lum(h) { var n = parseInt(String(h || '').replace('#', ''), 16); if (isNaN(n)) n = 0x888888; return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }

  function ORG(p, ln) { return [['nama', ln || 'Nama lengkap + gelar'],['panggilan','Nama panggilan'],['ayah','Nama ayah'],['ibu','Nama ibu']].map(function (a) { return {k: p + '.' + a[0], l: a[1], t: 'text', r: 1}; }); }
  function ACARA(p) { return [['tanggal','Tanggal','date',1],['jam','Jam mulai','time',1],['selesai','Jam selesai (opsional)','time'],['tempat','Nama tempat','text',1],['alamat','Alamat lengkap','area',1],['maps','Link Google Maps (opsional)','url']].map(function (a) { return {k: p + '.' + a[0], l: a[1], t: a[2], r: a[3]}; }); }
  var SECT_NIKAH = [
    {t: 'Data Pemesan', f: [{k: 'pemesan', l: 'Nama Anda', t: 'text', r: 1}, {k: 'wa', l: 'No. WhatsApp Anda', t: 'tel', r: 1}]},
    {t: 'Mempelai Pria', f: ORG('pria')},
    {t: 'Mempelai Wanita', f: ORG('wanita')},
    {t: 'Akad Nikah', f: ACARA('akad')},
    {t: 'Resepsi', opt: 'resepsiOn', ol: ' Ada acara resepsi (terpisah dari akad)', f: ACARA('resepsi')},
    {t: 'Turut Mengundang (opsional)', f: [{k: 'turut', l: 'Nama yang turut mengundang (satu nama per baris)', t: 'area', rows: 4, p: 'Contoh:\nKeluarga Besar Bpk. Ahmad\nBpk. H. Slamet & Ibu Siti'}]},
    {t: 'Foto', foto: 1},
    {t: 'Hadiah / Rekening (opsional)', rek: 1},
    {t: 'Tambahan (opsional)', f: [{k: 'musik', l: 'Lagu latar (judul / link)', t: 'text'}, {k: 'catatan', l: 'Catatan untuk kami', t: 'area'}]}
  ];
  function pick(t) { return SECT_NIKAH.filter(function (s) { return s.t.indexOf(t) === 0; })[0]; }
  var SECT_KHITAN = [
    pick('Data Pemesan'),
    {t: 'Putra yang Dikhitan', f: ORG('anak', 'Nama lengkap putra').concat([{k: 'anak.ke', l: 'Putra ke- (opsional)', t: 'text'}])},
    {t: 'Acara Khitanan', f: ACARA('akad')},
    {t: 'Syukuran / Resepsi (opsional)', opt: 'resepsiOn', ol: ' Ada acara syukuran / resepsi terpisah', f: ACARA('resepsi')},
    pick('Turut'), pick('Foto'), pick('Hadiah'), pick('Tambahan')
  ];
  function KH() { return !!K && K.kategori === 'khitan'; }
  function sect() { return KH() ? SECT_KHITAN : SECT_NIKAH; }
  var FOTO_K = [['cover', 'Foto cover (wajib)', 0], ['anak', 'Foto putra', 0], ['galeri', 'Galeri (maks. 8 foto)', 1]];
  function fotoList() { return KH() ? FOTO_K : FOTO_N; }
  var FOTO_N = [['cover', 'Foto cover (wajib)', 0], ['pria', 'Foto mempelai pria', 0], ['wanita', 'Foto mempelai wanita', 0], ['galeri', 'Galeri (maks. 8 foto)', 1]];
  var FNAME = {cover: 'cover.jpg', pria: 'mempelai-pria.jpg', wanita: 'mempelai-wanita.jpg', anak: 'foto-putra.jpg'};

  /* ---------- validasi ---------- */
  function kurang() {
    var m = [];
    sect().forEach(function (s) { if (s.opt && !S[s.opt]) return; (s.f || []).forEach(function (f) { if (f.r && !v(f.k)) m.push(f.k); }); });
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
        x.onclick = function () { if (multi) P.galeri.splice(i, 1); else P[key] = null; draw(); simpanFoto(); };
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
          draw(); stat(); if (r) simpanFoto();
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
    w.id = 'f-' + f.k.replace('.', '-'); if (f.t !== 'area') i.type = f.t; else i.rows = f.rows || 2; if (f.p) i.placeholder = f.p;
    if (f.t === 'tel') i.inputMode = 'tel'; i.value = S[f.k] || '';
    i.oninput = function () { S[f.k] = i.value; w.classList.remove('err'); };
    w.appendChild(lb); w.appendChild(i); if (/\.maps$/.test(f.k)) petaTools(w, i, f); return w;
  }
  /* Link Google Maps otomatis tanpa keluar dari formulir:
     cari dari nama tempat + alamat, pilih titik di peta (OpenStreetMap), atau pakai lokasi perangkat. */
  function loadLeaflet(ok, gagal) {
    if (window.L && L.map) return ok();
    if (!document.getElementById('lf-css')) { var l = document.createElement('link'); l.id = 'lf-css'; l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(l); }
    var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; sc.onload = ok; sc.onerror = gagal; document.head.appendChild(sc);
  }
  function petaTools(w, i, f) {
    var p = f.k.split('.')[0], last = '', bar = el('div', 'mt'), st = el('small', 'hn'), pv = el('div', 'pvw'), mk = function (t) { var b = el('button', 'pbtn', t); b.type = 'button'; return b; },
      b1 = mk('Cari link otomatis'), b4 = mk('Pilih di peta'), b2 = mk('Pakai lokasi saya'), b3 = mk('Lihat di Google'), pk = el('div', 'pk'), tp = el('details', 'tp');
    pv.hidden = true; pk.hidden = true;
    function nama() { return [v(p + '.tempat'), v(p + '.alamat')].filter(Boolean).join(', '); }
    function q() { return last || nama(); }
    function isi(query, pesan) { last = query; var u = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query); i.value = u; S[f.k] = u; w.classList.remove('err'); st.textContent = pesan; st.className = 'hn ok'; simpanDraft(); if (!pv.hidden) peta(); }
    function info(t) { st.textContent = t; st.className = 'hn'; }
    function peta() {
      var t = q(); if (!t) { info('Isi nama tempat dan alamat lengkap dulu.'); pv.hidden = true; return; }
      pv.textContent = ''; var fr = el('iframe'); fr.title = 'Pratinjau lokasi'; fr.loading = 'lazy'; fr.referrerPolicy = 'no-referrer'; fr.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(t) + '&output=embed';
      pv.appendChild(fr); pv.appendChild(el('small', 'hn', 'Jika peta tidak tampil, link tetap sah dan bisa dicek setelah undangan jadi.')); pv.hidden = false;
    }
    /* peta pilih titik */
    var row = el('div', 'pkr'), inp = el('input'), go = mk('Cari'), res = el('div', 'pkl'), mp = el('div', 'pkm'), map = null, pin = null;
    inp.type = 'search'; inp.placeholder = 'Cari nama tempat atau alamat'; row.appendChild(inp); row.appendChild(go); pk.appendChild(row); pk.appendChild(res); pk.appendChild(mp);
    pk.appendChild(el('small', 'hn', 'Ketuk peta atau geser pin ke titik yang tepat. Peta: OpenStreetMap.'));
    function set(lat, lng, pesan) {
      if (!pin) {
        pin = L.marker([lat, lng], { draggable: true, icon: L.divIcon({ className: 'pin', html: '<i></i>', iconSize: [30, 30], iconAnchor: [15, 30] }) }).addTo(map);
        pin.on('dragend', function () { var c = pin.getLatLng(); isi(c.lat.toFixed(6) + ',' + c.lng.toFixed(6), 'Titik dipilih dari peta.'); });
      } else pin.setLatLng([lat, lng]);
      map.setView([lat, lng], Math.max(map.getZoom(), 17)); isi(lat.toFixed(6) + ',' + lng.toFixed(6), pesan || 'Titik dipilih dari peta.');
    }
    function cari() {
      var t = inp.value.trim(); if (!t) return; res.textContent = 'Mencari...';
      fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=id&accept-language=id&q=' + encodeURIComponent(t)).then(function (r) { return r.json(); }).then(function (list) {
        res.textContent = ''; if (!list.length) { res.textContent = 'Tidak ditemukan. Coba nama jalan atau kelurahan saja, atau ketuk peta untuk menandai titiknya sendiri.'; return; }
        list.forEach(function (x) { var b = el('button', 'pkb', x.display_name); b.type = 'button'; b.onclick = function () { res.textContent = ''; set(+x.lat, +x.lon, 'Lokasi dipilih: ' + x.display_name.split(',')[0] + '. Geser pin bila perlu.'); }; res.appendChild(b); });
      }).catch(function () { res.textContent = 'Pencarian tidak bisa dijangkau. Ketuk peta untuk menandai titik secara manual.'; });
    }
    go.onclick = cari; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); cari(); } };
    function buka() {
      pk.hidden = false; if (!inp.value) inp.value = nama(); res.textContent = 'Memuat peta...';
      loadLeaflet(function () {
        res.textContent = '';
        if (!map) {
          map = L.map(mp).setView([-2.5, 118], 5); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
          map.on('click', function (e) { set(e.latlng.lat, e.latlng.lng); });
          var m = /query=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/.exec(i.value);
          if (m) set(+m[1], +m[2], 'Titik yang sudah dipilih dimuat. Geser pin bila perlu.'); else if (inp.value) cari();
        }
        setTimeout(function () { map.invalidateSize(); }, 60);
      }, function () { res.textContent = 'Peta tidak bisa dimuat. Periksa koneksi internet, atau gunakan "Cari link otomatis".'; });
    }
    b1.onclick = function () { var t = nama(); if (!t) { info('Isi nama tempat dan alamat lengkap dulu, lalu klik lagi.'); return; } isi(t, 'Link dibuat dari nama tempat dan alamat. Klik "Pilih di peta" untuk memastikan titiknya.'); };
    b4.onclick = function () { if (pk.hidden) buka(); else pk.hidden = true; };
    b2.onclick = function () {
      if (!navigator.geolocation) { info('Perangkat ini tidak mendukung lokasi.'); return; }
      info('Mencari lokasi Anda...'); b2.disabled = true;
      navigator.geolocation.getCurrentPosition(function (r) { b2.disabled = false; isi(r.coords.latitude.toFixed(6) + ',' + r.coords.longitude.toFixed(6), 'Lokasi Anda dipakai (akurasi sekitar ' + Math.round(r.coords.accuracy) + ' m). Pastikan Anda sedang berada di lokasi acara.'); },
        function () { b2.disabled = false; info('Izin lokasi ditolak atau lokasi tidak ditemukan. Gunakan "Pilih di peta".'); }, { enableHighAccuracy: true, timeout: 12000 });
    };
    b3.onclick = function () { if (pv.hidden) peta(); else pv.hidden = true; };
    i.addEventListener('input', function () { last = ''; });
    tp.appendChild(el('summary', '', 'Tidak tahu lokasinya atau tidak sedang di tempat acara?'));
    tp.appendChild(el('p', '', 'Tidak perlu keluar dari halaman ini. Klik "Pilih di peta", ketik nama tempat atau kelurahan, ketuk hasilnya, lalu geser pin ke titik yang tepat. Rumah tanpa nama: dekatkan peta ke gangnya lalu ketuk titiknya. Kolom ini boleh dikosongkan.'));
    bar.appendChild(b1); bar.appendChild(b4); bar.appendChild(b2); bar.appendChild(b3); w.appendChild(bar); w.appendChild(st); w.appendChild(pk); w.appendChild(pv); w.appendChild(tp);
  }
  function viewForm() {
    ttl.textContent = 'Isi Data Undangan - ' + K.nama; bd.textContent = ''; ft.textContent = '';
    bd.appendChild(el('p', 'pn', 'Isi data di bawah. Tanda * wajib diisi. Setelah lengkap, Anda bisa melihat pratinjau sebelum mengirim.'));
    if (dipulihkan) { var bn = el('div', 'rst'), rb = el('button', 'pbtn', 'Mulai dari awal'); rb.type = 'button'; bn.appendChild(el('span', '', 'Data yang Anda isi sebelumnya dipulihkan. Anda bisa melanjutkan.'));
      rb.onclick = function () { if (confirm('Hapus semua data tersimpan dan mulai dari awal?')) { hapusDraft(); S = {resepsiOn: !KH()}; P = freshP(); dipulihkan = false; viewForm(); } }; bn.appendChild(rb); bd.appendChild(bn); }
    sect().forEach(function (s) {
      var c = el('section', 'ps'), h = el('h3', '', s.t); c.appendChild(h);
      if (s.opt) { var lab = el('label', 'ck'), cb = el('input'); cb.type = 'checkbox'; cb.checked = !!S[s.opt]; lab.appendChild(cb); lab.appendChild(document.createTextNode(s.ol)); c.appendChild(lab); }
      var g = el('div', 'pg');
      if (s.foto) fotoList().forEach(function (a) { g.appendChild(fotoField(a[0], a[1], a[2])); });
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
    var rows = [['Pemesan', v('pemesan') + ' (' + v('wa') + ')'], ['Model', K.nama]].concat(KH() ? [['Putra', v('anak.nama') + ' (' + v('anak.panggilan') + ')']] : [['Mempelai pria', v('pria.nama') + ' (' + v('pria.panggilan') + ')'], ['Mempelai wanita', v('wanita.nama') + ' (' + v('wanita.panggilan') + ')']]);
    rows.push([KH() ? 'Khitanan' : 'Akad', tgl(v('akad.tanggal')) + ', ' + jam('akad') + ' - ' + v('akad.tempat')]);
    if (S.resepsiOn) rows.push([KH() ? 'Syukuran' : 'Resepsi', tgl(v('resepsi.tanggal')) + ', ' + jam('resepsi') + ' - ' + v('resepsi.tempat')]);
    if (turut().length) rows.push(['Turut mengundang', turut().length + ' nama']);
    rows.push(['Foto', 1 * !!P.cover + 1 * !!P.pria + 1 * !!P.wanita + 1 * !!P.anak + P.galeri.length + ' file']);
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
    h.appendChild(el('small', '', KH() ? 'KHITANAN' : 'THE WEDDING OF')); h.appendChild(el('h2', '', KH() ? v('anak.panggilan') : v('pria.panggilan') + ' & ' + v('wanita.panggilan'))); h.appendChild(el('small', '', tgl(v('akad.tanggal')))); iv.appendChild(h);
    var cp = el('div', 'ivs'); if (KH()) cp.style.gridTemplateColumns = '1fr';
    (KH() ? [['anak', 'Putra dari']] : [['pria', 'Putra dari'], ['wanita', 'Putri dari']]).forEach(function (a) {
      var d = el('div', 'cp'); if (P[a[0]]) { var im = el('img'); im.src = P[a[0]].url; d.appendChild(im); }
      d.appendChild(el('b', '', v(a[0] + '.nama'))); d.appendChild(el('small', '', a[1] + ' Bpk. ' + v(a[0] + '.ayah') + ' & Ibu ' + v(a[0] + '.ibu'))); cp.appendChild(d);
    }); iv.appendChild(cp);
    [['akad', KH() ? 'Acara Khitanan' : 'Akad Nikah'], ['resepsi', KH() ? 'Syukuran' : 'Resepsi']].forEach(function (a) {
      if (a[0] === 'resepsi' && !S.resepsiOn) return;
      var d = el('div', 'ev'); d.appendChild(el('h4', '', a[1])); d.appendChild(el('p', '', tgl(v(a[0] + '.tanggal')) + '\n' + jam(a[0]))); d.appendChild(el('b', '', v(a[0] + '.tempat'))); d.appendChild(el('p', '', v(a[0] + '.alamat'))); if (v(a[0] + '.maps')) d.appendChild(el('span', 'mp', 'Lihat Lokasi')); iv.appendChild(d);
    });
    if (turut().length) { var tu = el('div', 'ev'); tu.appendChild(el('h4', '', 'Turut Mengundang')); tu.appendChild(el('p', '', turut().join('\n'))); iv.appendChild(tu); }
    if (P.galeri.length) { var gl = el('div', 'gl'); P.galeri.forEach(function (p) { var im = el('img'); im.src = p.url; gl.appendChild(im); }); iv.appendChild(gl); }
    ['rek1', 'rek2'].forEach(function (p) { if (!v(p + '.bank')) return; var d = el('div', 'ev'); d.appendChild(el('h4', '', 'Hadiah - ' + bn(p))); d.appendChild(el('b', '', v(p + '.no'))); d.appendChild(el('p', '', 'a.n. ' + v(p + '.an'))); iv.appendChild(d); });
    iv.appendChild(el('p', 'ivf', 'Terima kasih atas doa dan restu Anda.')); bd.appendChild(iv);
    var a = el('div', 'acts3 two'); a.appendChild(ib('', 'edit', 'Kembali', viewRingkas)); a.appendChild(ib('wa', 'send', 'Kirim', kirim)); ft.appendChild(a); bd.scrollTop = 0;
  }

  /* ---------- data, ZIP, WhatsApp ---------- */
  function acara(p) { return {tanggal: v(p + '.tanggal'), tanggalLengkap: tgl(v(p + '.tanggal')), jamMulai: v(p + '.jam'), jamSelesai: v(p + '.selesai'), tempat: v(p + '.tempat'), alamat: v(p + '.alamat'), maps: v(p + '.maps')}; }
  function turut() { return v('turut').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function dataObj() {
    function org(p) { return {nama: v(p + '.nama'), panggilan: v(p + '.panggilan'), ayah: v(p + '.ayah'), ibu: v(p + '.ibu'), foto: P[p] ? 'foto/' + FNAME[p] : ''}; }
    var rek = []; ['rek1', 'rek2'].forEach(function (p) { if (v(p + '.bank')) rek.push({bank: bn(p), nomor: v(p + '.no'), atasNama: v(p + '.an')}); });
    var o = {model: K.nama, pemesan: {nama: v('pemesan'), whatsapp: v('wa')}, cover: P.cover ? 'foto/cover.jpg' : '', mempelai: {pria: org('pria'), wanita: org('wanita')}, akad: acara('akad'), resepsi: S.resepsiOn ? acara('resepsi') : null, galeri: P.galeri.map(function (_, i) { return 'foto/galeri-' + (i + 1) + '.jpg'; }), hadiah: rek, turutMengundang: turut(), musik: v('musik'), catatan: v('catatan')};
    if (KH()) { o.kategori = 'khitan'; o.putra = org('anak'); o.putra.putraKe = v('anak.ke'); o.khitan = o.akad; o.syukuran = o.resepsi; delete o.akad; delete o.resepsi; delete o.mempelai; } else o.kategori = 'pernikahan';
    return o;
  }
  function teks(d) {
    var kh = KH(), ac = kh ? d.khitan : d.akad, rs = kh ? d.syukuran : d.resepsi, m = d.mempelai;
    var L = ['DATA UNDANGAN DIGITAL ' + (kh ? 'KHITAN' : 'PERNIKAHAN'), 'Model: ' + d.model, 'Pemesan: ' + d.pemesan.nama + ' (' + d.pemesan.whatsapp + ')', ''];
    if (kh) L.push('PUTRA YANG DIKHITAN', d.putra.nama + ' (' + d.putra.panggilan + ')', (d.putra.putraKe ? 'Putra ke-' + d.putra.putraKe + ' dari ' : 'Putra dari ') + 'Bpk. ' + d.putra.ayah + ' & Ibu ' + d.putra.ibu);
    else L.push('MEMPELAI PRIA', m.pria.nama + ' (' + m.pria.panggilan + ')', 'Putra dari Bpk. ' + m.pria.ayah + ' & Ibu ' + m.pria.ibu, '', 'MEMPELAI WANITA', m.wanita.nama + ' (' + m.wanita.panggilan + ')', 'Putri dari Bpk. ' + m.wanita.ayah + ' & Ibu ' + m.wanita.ibu);
    [[kh ? 'ACARA KHITANAN' : 'AKAD NIKAH', ac], [kh ? 'SYUKURAN' : 'RESEPSI', rs]].forEach(function (a) { if (!a[1]) return; L.push('', a[0], a[1].tanggalLengkap + ', ' + a[1].jamMulai + (a[1].jamSelesai ? ' - ' + a[1].jamSelesai : ' - selesai') + ' WIB', a[1].tempat, a[1].alamat); if (a[1].maps) L.push('Maps: ' + a[1].maps); });
    if (d.turutMengundang.length) { L.push('', 'TURUT MENGUNDANG'); d.turutMengundang.forEach(function (n) { L.push('- ' + n); }); }
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
    var t = 'Halo, saya ' + v('pemesan') + ' ingin memesan undangan digital ' + (KH() ? 'khitan' : 'pernikahan') + ' model ' + K.nama + '.\n\n' + (KH() ? 'Putra: ' + v('anak.nama') : 'Mempelai: ' + v('pria.nama') + ' & ' + v('wanita.nama')) + '\n' + (KH() ? 'Khitanan: ' : 'Akad: ') + tgl(v('akad.tanggal')) + ', ' + jam('akad') + (S.resepsiOn ? '\n' + (KH() ? 'Syukuran: ' : 'Resepsi: ') + tgl(v('resepsi.tanggal')) + ', ' + jam('resepsi') : '') + '\n\nData & foto saya kirim dalam file ZIP (' + lastName + '.zip) yang saya lampirkan di chat ini.';
    return 'https://wa.me/' + no + '?text=' + encodeURIComponent(t);
  }
  function kirim() {
    if (BUSY) { alert('Tunggu sebentar, foto masih diproses.'); return; }
    var d = dataObj(), en = new TextEncoder(), fs = [], root = 'undangan-' + (KH() ? 'khitan-' + slug(v('anak.panggilan')) : slug(v('pria.panggilan')) + '-' + slug(v('wanita.panggilan')));
    function add(n, b) { fs.push({name: root + '/' + n, data: b}); }
    add('data/data-undangan.js', en.encode('/* Data undangan (dibuat otomatis dari katalog). Salin ke VS Code; sesuaikan nama properti dengan template bila perlu. */\r\nconst DATA_UNDANGAN = ' + JSON.stringify(d, null, 2) + ';\r\n'));
    add('data/data-klien.txt', en.encode(teks(d)));
    ['cover', 'pria', 'wanita', 'anak'].forEach(function (k) { if (P[k]) add('foto/' + FNAME[k], P[k].bytes); });
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
    var hp = el('button', 'pbtn', 'Hapus data tersimpan di perangkat ini'); hp.type = 'button'; hp.onclick = function () { hapusDraft(); hp.textContent = 'Data tersimpan sudah dihapus'; hp.disabled = true; }; c.appendChild(hp);
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
  + '@keyframes pfs{to{background-position:-200% 0}}@keyframes pfr{to{transform:rotate(360deg)}}@keyframes pfp{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}'
  + '.mt{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.mt .pbtn{background:#fff;font:inherit;font-size:.8rem;border-style:solid;padding:7px 13px;border-radius:99px}.mt .pbtn:disabled{opacity:.5}.pvw{margin-top:8px;border-radius:12px;overflow:hidden;border:1px solid #ddd5cc;background:#faf8f5}.pvw iframe{width:100%;height:220px;border:0;display:block}.pvw .hn{padding:4px 10px 8px}'
  + '.pk{margin-top:8px;border:1px solid #ddd5cc;border-radius:12px;padding:8px;background:#faf8f5}.pkr{display:flex;gap:6px}.pkr input{flex:1;min-width:0}.pkr .pbtn{background:#8B6B58;color:#fff;border-style:solid;padding:8px 14px;border-radius:10px}.pkl{display:grid;gap:4px;margin:6px 0;font-size:.78rem}.pkb{text-align:left;border:1px solid #ddd5cc;background:#fff;border-radius:8px;padding:6px 8px;font:inherit;font-size:.78rem;cursor:pointer}.pkm{position:relative;z-index:0;height:260px;border-radius:10px;overflow:hidden;margin-top:6px}.pin i{display:block;width:26px;height:26px;margin:2px;background:#d6336c;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4);border:3px solid #fff}'
  + '.tp{margin-top:8px;font-size:.78rem;color:#6b5a4e}.tp summary{cursor:pointer;color:#8B6B58;font-weight:600}.tp p{margin:6px 0 0;line-height:1.5}'
  + '.rst{display:flex;gap:8px;align-items:center;justify-content:space-between;background:#E3F4EA;color:#1f7a45;border-radius:10px;padding:8px 10px;margin-bottom:10px;font-size:.82rem}.rst .pbtn{background:#fff;padding:5px 10px;font-size:.75rem;border-style:solid;color:#1f7a45;border-color:#1f7a45;flex:none}'
  + '.lj{position:fixed;left:50%;bottom:16px;translate:-50% 0;z-index:90;display:flex;background:#8B6B58;border-radius:99px;box-shadow:0 6px 18px rgba(0,0,0,.3);overflow:hidden}.ljg,.ljx{border:0;background:transparent;color:#fff;font:600 .85rem system-ui,sans-serif;padding:11px 14px;cursor:pointer}.ljx{border-left:1px solid rgba(255,255,255,.35);font-size:1.1rem;padding:8px 14px}';
  /* ---------- simpan otomatis: data tidak hilang walau halaman dimuat ulang atau klien berpindah aplikasi ---------- */
  var dipulihkan = false, tmD, DBP;
  function freshP() { return {cover: null, pria: null, wanita: null, anak: null, galeri: []}; }
  function idb() { return DBP || (DBP = new Promise(function (ok, no) { var r = indexedDB.open('pf-draft', 1); r.onupgradeneeded = function () { r.result.createObjectStore('f'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; })); }
  function dbSet(k, val) { return idb().then(function (db) { return new Promise(function (ok) { var t = db.transaction('f', 'readwrite'); t.objectStore('f').put(val, k); t.oncomplete = ok; t.onerror = ok; }); }).catch(function () {}); }
  function dbGet(k) { return idb().then(function (db) { return new Promise(function (ok) { var r = db.transaction('f').objectStore('f').get(k); r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ok(); }; }); }).catch(function () {}); }
  function dbDel(k) { return idb().then(function (db) { return new Promise(function (ok) { var t = db.transaction('f', 'readwrite'); t.objectStore('f').delete(k); t.oncomplete = ok; t.onerror = ok; }); }).catch(function () {}); }
  function adaIsi() { return Object.keys(S).some(function (k) { return k !== 'resepsiOn' && String(S[k]).trim(); }) || P.cover || P.pria || P.wanita || P.anak || P.galeri.length; }
  function simpanDraft() {
    clearTimeout(tmD); tmD = setTimeout(function () {
      try { if (!adaIsi()) { localStorage.removeItem('pf-draft'); return; } localStorage.setItem('pf-draft', JSON.stringify({kat: curKat, K: {nama: K.nama, kategori: K.kategori || 'pernikahan', warna: K.warna || ''}, S: S, ts: Date.now()})); } catch (x) {}
    }, 400);
  }
  function simpanFoto() { dbSet('draft', {cover: P.cover && P.cover.bytes, pria: P.pria && P.pria.bytes, wanita: P.wanita && P.wanita.bytes, anak: P.anak && P.anak.bytes, galeri: P.galeri.map(function (g) { return g.bytes; })}); simpanDraft(); }
  function hapusDraft() { try { localStorage.removeItem('pf-draft'); } catch (x) {} dbDel('draft'); }
  function bacaDraft() { try { var d = JSON.parse(localStorage.getItem('pf-draft') || 'null'); return d && d.K && Date.now() - d.ts < 7 * 864e5 ? d : null; } catch (x) { return null; } }
  function muatDraft(kat) {
    var d = bacaDraft(); if (!d || d.kat !== kat) return Promise.resolve();
    S = Object.assign({resepsiOn: kat !== 'khitan'}, d.S); dipulihkan = true;
    return dbGet('draft').then(function (o) {
      if (!o) return; var mkp = function (b) { return b ? {bytes: b, url: URL.createObjectURL(new Blob([b], {type: 'image/jpeg'}))} : null; };
      P.cover = mkp(o.cover); P.pria = mkp(o.pria); P.wanita = mkp(o.wanita); P.anak = mkp(o.anak); P.galeri = (o.galeri || []).map(mkp).filter(Boolean);
    });
  }
  function cssAda() { if (!document.getElementById('pf-css')) { var st = el('style'); st.id = 'pf-css'; st.textContent = CSS; document.head.appendChild(st); } }
  function pil() {
    var d = bacaDraft(); if (!d || document.getElementById('pf-lj')) return; cssAda();
    var w = el('div', 'lj'), g = el('button', 'ljg', 'Lanjutkan isi data: ' + d.K.nama), x = el('button', 'ljx', '×'); w.id = 'pf-lj'; g.type = x.type = 'button'; x.title = 'Hapus data tersimpan'; x.setAttribute('aria-label', 'Hapus data tersimpan');
    g.onclick = function () { w.remove(); window.PesanForm.buka(d.K); };
    x.onclick = function () { if (confirm('Hapus data yang tersimpan di perangkat ini?')) { hapusDraft(); w.remove(); } };
    w.appendChild(g); w.appendChild(x); document.body.appendChild(w);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pil); else setTimeout(pil, 0);

  window.PesanForm = {
    buka: function (k) {
      K = k; var kat = KH() ? 'khitan' : 'pernikahan', baru = false; if (kat !== curKat) { S = {resepsiOn: kat !== 'khitan'}; P = freshP(); curKat = kat; dipulihkan = false; baru = true; }
      cssAda(); var lj = document.getElementById('pf-lj'); if (lj) lj.remove();
      if (box) box.remove(); box = el('div', 'pm'); var d = el('div', 'pd'), h = el('div', 'ph'), x = el('button', 'px', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Tutup');
      ttl = el('b'); bd = el('div', 'pb0'); ft = el('div', 'pf0'); h.appendChild(ttl); h.appendChild(x); d.appendChild(h); d.appendChild(bd); d.appendChild(ft); box.appendChild(d); document.body.appendChild(box);
      x.onclick = function () { if (confirm('Tutup formulir? Data yang sudah diisi tetap tersimpan selama halaman ini belum ditutup.')) box.hidden = true; };
      bd.addEventListener('input', simpanDraft); bd.addEventListener('change', simpanDraft);
      if (baru) { box.hidden = false; bd.textContent = 'Memuat...'; muatDraft(kat).then(viewForm); } else { box.hidden = false; viewForm(); }
    }
  };
})();
