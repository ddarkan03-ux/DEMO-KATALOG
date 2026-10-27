/* ==========================================================
   DATA KATALOG - ini satu-satunya file yang Anda edit rutin
   ----------------------------------------------------------
   A. PENGATURAN HALAMAN  -> bagian KATALOG_INFO
   B. DAFTAR MODEL        -> bagian KATALOG

   MENAMBAH MODEL BARU (versi terbaru):
     1. Upload undangan versi baru ke repo GitHub-nya sendiri.
     2. Salin satu blok { ... } di bawah, tempel di akhir daftar
        (sebelum tanda ]), lalu ubah isinya.
     3. Simpan, upload file ini ke GitHub (commit). Selesai.

   ISI TIAP MODEL:
     kategori  : "pernikahan" atau "khitan" (menentukan di menu mana model tampil
                 dan formulir mana yang dipakai klien)
     nama      : nama model yang tampil
     deskripsi : keterangan singkat
     warna     : warna cadangan sebelum pratinjau termuat (contoh "#33804E")
     demo      : alamat undangan contoh yang sudah online (wajib)
     cover     : (opsional) gambar cover statis, mis. "assets/img/katalog/versi-8.jpg"
                 Jika diisi, katalog memuat gambar (lebih cepat), bukan pratinjau langsung.
     baru      : true  -> tampil label "BARU" (hapus atau false bila tidak perlu)
   ========================================================== */

window.KATALOG_INFO = {
  judul: "Katalog Undangan Digital",
  subjudul: "Pilih model favorit Anda. Klik cover untuk membuka contoh undangan lengkap. Gunakan HP untuk tampilan terbaik.",
  baseUrl: "https://ddarkan03-ux.github.io/DEMO-KATALOG",   // alamat katalog ini (dari GitHub: Settings > Pages), tanpa garis miring di akhir
  whatsapp: "6285716300907",                                 // nomor WhatsApp Anda, contoh "6281234567890". Kosong = tombol Pesan disembunyikan
  pesanWA: "Halo, saya tertarik dengan undangan digital model {nama}. Boleh minta info lebih lanjut?",
  contohTamu: "Tamu Undangan"                   // nama tamu yang tampil di contoh undangan
};

window.KATALOG = [
  { kategori: "pernikahan", nama: "Versi 1 - Krem Minimalis",   deskripsi: "Krem dan taupe, foto garis offset, kartu acara dua kolom", warna: "#B9B09F", demo: "https://ddarkan03-ux.github.io/Wedding-Budi-Aap/",              cover: "" },
  { kategori: "pernikahan", nama: "Versi 2 - Emerald & Gold",   deskripsi: "Hijau zaitun dan emas, foto bulat bercincin, kartu terpusat", warna: "#1F3A33", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-2.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 3 - Sakura Blush",     deskripsi: "Pink lembut, kelopak jatuh, foto bentuk organik", warna: "#F8C0CF", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-3.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 4 - Midnight Starlight", deskripsi: "Biru malam mewah, bintang berkelip, kartu tiket", warna: "#0B1230", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-4.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 5 - Rustic Boho",      deskripsi: "Kertas kraft, foto polaroid bertape, animasi memantul", warna: "#B5603C", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-5.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 6 - Alam Indah",       deskripsi: "Hijau segar dan matahari, foto bentuk daun, bukit dan kupu-kupu", warna: "#33804E", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-6.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 7 - Airmail Seaside",  deskripsi: "Kartu pos pantai, foto perangko, tepi ombak, pesawat kertas", warna: "#1E6FA8", demo: "https://ddarkan03-ux.github.io/undangan-katalog-darkan/versi-7.html", cover: "" },
  { kategori: "pernikahan", nama: "Versi 10 - Sage & Emas",  deskripsi: "", warna: "#1E6FA8", demo: "https://ddarkan03-ux.github.io/Pernikahan-V10/", cover: "" }
  // CONTOH MODEL KHITAN (hapus tanda // di awal baris, lalu ubah isinya; ingat koma di akhir baris sebelumnya):
  // , { kategori: "khitan", nama: "Khitan 1 - Biru Ceria", deskripsi: "Keterangan singkat", warna: "#2B6CB0", demo: "https://ddarkan03-ux.github.io/NAMA-REPO/", cover: "" }
     , { kategori: "khitan", nama: "Khitan 1 - Langit Biru", deskripsi: "balon udara, awan, bintang berkelip", warna: "#2B6CB0", demo: "https://ddarkan03-ux.github.io/Khitan-Gibran-V1/", cover: "" }
     , { kategori: "khitan", nama: "Khitan 2 - Mahkota Emas", deskripsi: "royal, biru malam + emas, debu emas, sampul membuka seperti tirai", warna: "#191970", demo: "https://ddarkan03-ux.github.io/Khitan-Raka-V2/", cover: "" }
     , { kategori: "khitan", nama: "Khitan 3 - Lentera Zamrud", deskripsi: "hijau zamrud, lentera berayun, siluet masjid, kartu berbentuk kubah", warna: "#00674F", demo: "https://ddarkan03-ux.github.io/Khitan-V3/", cover: "" }
];
