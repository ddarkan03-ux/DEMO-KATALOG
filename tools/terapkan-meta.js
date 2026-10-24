/* Menerapkan judul & alamat katalog ke meta tag index.html (dibaca WhatsApp untuk kartu pratinjau).
   Jalankan di terminal VS Code, di folder proyek:  node tools/terapkan-meta.js
   Jalankan lagi setiap kali mengubah baseUrl / judul di assets/js/katalog-data.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/katalog-data.js'), 'utf8'), ctx);
const I = ctx.window.KATALOG_INFO || {};
const base = String(I.baseUrl || '').replace(/\/+$/, '');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const judul = I.judul || 'Katalog Undangan Digital';
const desk = (I.subjudul || '').split('. ')[0].replace(/\.$/, '') + '.';
function setMeta(h, key, val) {
  const attr = (key === 'description' || key.startsWith('twitter')) ? 'name' : 'property';
  const tag = `<meta ${attr}="${key}" content="${esc(val)}">`;
  const re = new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="[^"]*">`);
  return re.test(h) ? h.replace(re, () => tag) : h.replace('</head>', () => tag + '\n</head>');
}
const f = path.join(root, 'index.html');
let h = fs.readFileSync(f, 'utf8');
h = h.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(judul)}</title>`);
h = setMeta(h, 'description', desk);
h = setMeta(h, 'og:site_name', judul);
h = setMeta(h, 'og:title', judul);
h = setMeta(h, 'og:description', desk);
h = setMeta(h, 'og:image', base + '/assets/img/og.jpg');
h = setMeta(h, 'og:url', base + '/');
fs.writeFileSync(f, h);
console.log('OK  index.html  ->  ' + base + '/');
