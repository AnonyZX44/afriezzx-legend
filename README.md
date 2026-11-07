# AFRIEZZX

Situs arsip satu halaman tentang legenda yang tidak pernah menandatangani karyanya.

## Isi

- `index.html` — struktur dan teks
- `style.css` — tata letak, warna, animasi
- `app.js` — hujan glyph, scramble judul, reveal, terminal, kursor

Tanpa build step. Tanpa framework. Tanpa dependency.

## Jalankan lokal

```sh
python -m http.server 8088
```

Buka `http://127.0.0.1:8088`.

## Deploy

Repo ini terhubung ke Vercel. Setiap push ke `main` memicu deploy produksi.

## Catatan

- Animasi dimatikan otomatis saat `prefers-reduced-motion: reduce`.
- Canvas hujan glyph dibatasi 30fps dan DPR maksimal 1.5 di layar kecil.
- Tidak ada emoji, tidak ada gambar, tidak ada font yang di-host sendiri.
