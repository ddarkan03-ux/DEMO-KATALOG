#!/usr/bin/env python3
"""Sinkronkan pratinjau link (judul, teks, foto) di index.html dengan data/data-undangan.js.

Jalankan SEKALI setiap selesai mengganti data & foto klien, sebelum upload:
    python3 tools/sinkron-meta.py

Yang dilakukan:
  1. Membuat foto/og.jpg (1200x630) dari foto pratinjau/bingkai/sampul, untuk gambar pratinjau di WhatsApp.
  2. Menulis ulang tag <meta property="og:..."> di index.html.
Butuh:  pip install pillow
"""
import json, re, sys, os
from datetime import date
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'data' / 'data-undangan.js').read_text(encoding='utf-8')
m = re.search(r'DATA_UNDANGAN\s*=\s*(\{.*\})\s*;', src, re.S)
D = json.loads(m.group(1))
P, A = D.get('putra') or {}, D.get('khitan') or {}
HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

try:
    d = date.fromisoformat(A.get('tanggal', ''))
    tgl = f"{HARI[d.weekday()]}, {d.day} {BLN[d.month - 1]} {d.year}"
except ValueError:
    tgl = ''
nama = P.get('panggilan') or 'Putra'
judul = f"Undangan Khitanan {nama}"
desk = f"Kami mengundang Anda ke khitanan {P.get('nama') or nama}" + (f", {tgl}" if tgl else '') + (f", {A['tempat']}" if A.get('tempat') else '') + '.'
site = (D.get('siteUrl') or '').rstrip('/') + '/' if D.get('siteUrl') else ''
if not site or 'NAMAANDA' in site:
    print('PERINGATAN: "siteUrl" di data-undangan.js belum diisi alamat asli. '
          'WhatsApp butuh alamat lengkap agar foto pratinjau muncul.', file=sys.stderr)

# gambar pratinjau 1200x630 (crop tengah, condong ke atas supaya wajah tidak terpotong)
FT = D.get('foto') or {}
foto = next((root / f for f in (FT.get('pratinjau'), FT.get('bingkai'), P.get('foto'), FT.get('sampul'), D.get('cover')) if f and (root / f).exists()), None)
if foto:
    from PIL import Image, ImageOps
    im = ImageOps.exif_transpose(Image.open(foto)).convert('RGB')
    im = ImageOps.fit(im, (1200, 630), Image.LANCZOS, centering=(0.5, 0.3))
    im.save(root / 'foto' / 'og.jpg', quality=82, optimize=True, progressive=True)
else:
    print('PERINGATAN: tidak ada foto untuk pratinjau.', file=sys.stderr)

def esc(s): return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
blok = f'''<!--OG-->
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(judul)}">
<meta property="og:description" content="{esc(desk)}">
<meta property="og:image" content="{esc(site)}foto/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{esc(site)}">
<meta property="og:locale" content="id_ID">
<meta name="twitter:card" content="summary_large_image">
<meta name="description" content="{esc(desk)}">
<!--/OG-->'''
h = (root / 'index.html').read_text(encoding='utf-8')
h = re.sub(r'<!--OG-->.*?<!--/OG-->', lambda _: blok, h, flags=re.S)
h = re.sub(r'<title>.*?</title>', lambda _: f'<title>{esc(judul)}</title>', h, count=1)
(root / 'index.html').write_text(h, encoding='utf-8')
print('OK:', judul, '|', desk)
