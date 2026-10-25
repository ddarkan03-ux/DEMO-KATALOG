/* PANDUAN PEMULA
   1. Ubah teks di antara tanda kutip "..." dengan data undangan yang benar.
   2. Jangan hapus tanda kutip, kurung kurawal, kurung siku, atau koma.
      Setiap baris biasanya diakhiri koma, kecuali baris terakhir dalam kelompok.
   3. Tanggal memakai format TAHUN-BULAN-TANGGAL, contoh "2026-12-20".
      Jam memakai format 24 jam, contoh "09:00".
   4. Simpan file ini setelah diedit, lalu unggah bersama folder foto dan musik.

   FOTO: Nama file di bagian "foto" dan "galeri" harus sama persis dengan file
   di folder foto. Ganti juga file contoh dengan foto milik klien.
   UCAPAN: Contoh ucapan di bawah ini tampil di undangan. Ganti atau hapus
   ucapan contoh agar tidak dianggap sebagai ucapan tamu sebenarnya.
   Jika membuat undangan dari ZIP klien, ikuti petunjuk pada PETUNJUK.txt. */
const DATA_UNDANGAN = {
  // Identitas undangan. "kode" harus unik dan huruf kecil tanpa spasi.
  "kategori": "khitan",
  "kode": "dar123",
  // Ganti dengan alamat undangan setelah dipasang di hosting.
  "siteUrl": "https://ddarkan03-ux.github.io/Khitan-Raka-V2/",
  // Firebase diperlukan untuk menyimpan dan berbagi ucapan secara online.
  // Jika belum memakai Firebase, biarkan apiKey dan projectId kosong.
  "firebase": { "apiKey": "AIzaSyBEA92p-xAjSyvDTWT09-zsuEDyjZg2dZw", "projectId": "undangan-saya" },
  // true = ucapan dapat dilihat tamu lain; false = tidak ditampilkan untuk umum.
  "ucapanPublik": true,
  // Informasi pemesan undangan; nomor WhatsApp gunakan kode negara tanpa tanda +.
  "model": "Khitan 2 - Mahkota Emas",
  "pemesan": { "nama": "Dede Iskandar", "whatsapp": "6285716300907" },
  // Ganti nama file foto sesuai file yang ada di folder foto.
  "foto": {
    "sampul": "foto/sampul.jpg",
    "latarUtama": "foto/latar-utama.jpg",
    "bingkai": "foto/bingkai.jpg",
    "penutup": "foto/penutup.jpg",
    "pratinjau": ""
  },
  // Data anak dan orang tua.
  "putra": { "nama": "Muhammad Raka Pratama", "panggilan": "Raka", "ayah": "Dede Iskandar", "ibu": "Siti Nurmilawati Salmah", "putraKe": "" },
  // Acara khitan. Isi tanggal YYYY-MM-DD dan jam HH:MM.
  // "maps" adalah tautan Google Maps; "alamat" adalah alamat yang ditampilkan.
  "khitan": { "tanggal": "2028-12-20", "jamMulai": "09:00", "jamSelesai": "12:00", "tempat": "GOR Serbaguna", "alamat": "Kp. Sindang Baru, Desa Ciasmara", "maps": "https://www.google.com/maps/search/?api=1&query=GOR%20Serbaguna%2C%20Kp.%20Sindang%20Baru%2C%20Desa%20Ciasmara" },
  // Isi dengan data syukuran jika ada, atau tetap null untuk menyembunyikannya.
  "syukuran": null,
  // Daftar foto galeri. Boleh kurangi/tambah nama file foto di dalam [ ... ].
  "galeri": ["foto/galeri-1.jpg", "foto/galeri-2.jpg", "foto/galeri-3.jpg", "foto/galeri-4.jpg", "foto/galeri-5.jpg", "foto/galeri-6.jpg"],
  // Maksimal dua rekening. Ubah bank, nomor, dan nama pemilik dengan teliti.
  "hadiah": [],
  // true = tampilkan daftar turut mengundang; false = sembunyikan.
  "turutMengundangTampil": false,
  "turutMengundang": [],
  // Lokasi musik relatif dari folder undangan; kosongkan "" jika tanpa musik.
  // Contoh: "musik/lagu.mp3" berarti file lagu.mp3 ada di folder musik.
  "musik": "musik/musik.mp3",
  // Catatan tambahan (boleh dikosongkan).
  "catatan": "",
  // Ucapan contoh. Ganti dengan ucapan sungguhan atau gunakan [] jika belum ada.
  "ucapan": []
};
