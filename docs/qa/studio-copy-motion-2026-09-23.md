# Revisi copy dan motion Pika-Xu — 23 September 2026

Basis: `c5ad77ae060a39be7dad25e4da2377aadb4b8109` (main setelah PR #32). Perubahan hanya mencakup halaman studio dan produk, simulasi Sisa, serta pemeriksaan terkait. Pekerjaan lokal lain dan arsip prototype tidak dimasukkan ke PR.

## Hasil

- Label preview yang terlihat, deskripsi di kanan atas, intro beranda, dan slogan copyright dihapus. Copyright menjadi `© 2026 Pika-Xu`. Warna dash kedua wordmark memakai token cobalt yang sama.
- Seluruh tipografi halaman publik memakai Manrope; headline tidak lagi memakai serif/italic. Headline Sisa di beranda menjadi “Catat. Teratur.”, dan Kertas Kecil menjadi “Buku kecil, ide besar.”
- Simulasi menyediakan makan siang Rp35.000 dan kopi Rp18.000, bisa dicatat dalam urutan apa pun. Saldo awal Rp120.000 menjadi Rp67.000 setelah keduanya. Pengeluaran tidak bisa dicatat dua kali; reset memulihkan kedua tombol. Disclosure: “ini hanya simulasi”.
- “Kenalan dengan tim” menggunakan disclosure native yang tertutup saat halaman dibuka. Chandra Gumelar (Founder), Ivani Dewi (Cofounder), dan Nasuha Ali (Cofounder) tampil dengan avatar monogram geometris setelah dibuka. Tetap berfungsi tanpa JavaScript.
- Nama Kertas Kecil Project, kategori buku/worksheet/digital invitation, serta penawaran buku anak custom dibuat eksplisit. Logo KKP dihapus. Simbol kurung kurawal Coding Books diganti jalur bentuk geometris.
- Deskripsi BagiBill membahas patungan saja. Deskripsi Sisa diperbarui dari [halaman Gumroad](https://pikaxustudio.gumroad.com/l/sisa-app?layout=profile), dibaca pada 23 September 2026: saldo setelah tagihan dan tabungan, pemasukan, batas harian, What-if, dompet, laporan, instalasi browser, penyimpanan lokal, serta kebutuhan internet untuk pengingat dan kurs.
- Headline mendapat gerakan huruf berurutan dengan perpindahan 42 px, rotasi, dan overshoot. Gerakan selesai paling lambat sekitar 1,6 detik, diputar saat headline masuk layar, dibatalkan saat keluar layar atau dokumen tersembunyi, dan dinonaktifkan oleh reduced motion. Tidak menambah dependency.
- Konten Indonesia dan Inggris memakai perubahan yang sama.

## Verifikasi

Build bersih dibuat dari file main ditambah patch PR, tanpa file source lokal yang tidak dilacak. Dependency memakai instalasi yang sudah ada.

- `npm test`: 34 tes lulus pada salinan bersih. Workspace lengkap memiliki 39 tes, termasuk lima tes motion historis yang tidak masuk PR.
- `npm run build`: berhasil, 12 halaman pada salinan bersih.
- `python3 scripts/check-output.py`: tidak ada error pada salinan bersih.
- `scripts/check-copy-motion.py`: Chrome 153.0.8010.53, delapan halaman Indonesia/Inggris, lebar 320/360/390/768/1024/1280/1440 px. Tidak ada overflow horizontal atau page error. Kedua urutan pengeluaran, klik berulang, reset, pengumuman saldo, keyboard tab produk, disclosure tim, deep link custom, reduced motion dinamis, akhir animasi, dan fallback tanpa JavaScript diperiksa.
- Screenshot beranda, Sisa, Kertas Kecil, dan disclosure tim/custom ditinjau. Pemeriksaan visual menemukan fill transparan pada huruf yang bergerak; fill diperbaiki dan regresinya diperiksa di browser.

Pemeriksaan ini bukan audit lintas browser, screen reader, Lighthouse, atau uji lapangan baru. Gate publikasi lama masih melaporkan 24 blocker; label visual dihapus tanpa mengubah gate atau metadata noindex preview. Tidak ada deployment atau merge dalam tugas ini.

## Screenshot

- [Beranda desktop](studio-copy-motion/home-desktop.png)
- [Beranda mobile](studio-copy-motion/home-mobile.png)
- [Sisa mobile](studio-copy-motion/sisa-mobile.png)
- [Kertas Kecil mobile](studio-copy-motion/kertas-kecil-mobile.png)
- [Tim terbuka](studio-copy-motion/team-mobile.png)
- [Buku custom terbuka](studio-copy-motion/custom-mobile.png)
