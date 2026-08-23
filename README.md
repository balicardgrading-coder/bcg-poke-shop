# PokéMart Pro — Website Jualan Pokémon

Struktur **sama seperti contoh GitHub** (data di file JSON terpisah).

```
pokemon-shop/
├── index.html
├── styles.css
├── script.js
├── products.json   ← EDIT STOK DI SINI
└── README.md
```

---

## Cara Update Stok (Paling Mudah)

1. Buka file **`products.json`**
2. Cari produk yang mau diubah, contoh:

```json
"PKM-001": {
  "name": "Pikachu VMAX",
  "category": "kartu",
  "price": 185000,
  "stock": 12,        ← ubah angka ini saja
  "desc": "...",
  "image": "..."
}
```

3. Ubah `stock`:
   - `"stock": 0` → Habis
   - `"stock": 3` → Stok menipis (badge kuning)
   - `"stock": 25` → Tersedia

4. Simpan → refresh browser. **Selesai!**

---

## Menambah Produk Baru

Tambah object baru di `products.json`:

```json
"PKM-013": {
  "name": "Nama Produk",
  "category": "kartu",
  "price": 150000,
  "stock": 10,
  "desc": "Deskripsi singkat.",
  "image": "https://url-gambar.com/..."
}
```

ID harus unik (contoh: `PKM-013`, `PKM-014`, dst).

---

## Cara Menjalankan

Karena pakai `fetch("products.json")`, **jangan buka langsung file://**.

Gunakan salah satu cara:

### Opsi 1 — Live Server (VS Code)
Install extension **Live Server** → klik kanan `index.html` → Open with Live Server.

### Opsi 2 — Python
```bash
cd pokemon-shop
python -m http.server 8000
```
Lalu buka: http://localhost:8000

### Opsi 3 — Node
```bash
npx serve .
```

### Opsi 4 — Upload ke GitHub Pages / Netlify / Vercel
Cukup upload folder ini, otomatis jalan.

---

## Ganti Nomor WhatsApp

Di `script.js` cari:

```js
const waNumber = "6281234567890";
```

Dan di `index.html` bagian link WhatsApp di section kontak.

---

## Fitur

- Data produk di **products.json** (mirip cards.json)
- Filter kategori + pencarian
- Badge stok otomatis
- Keranjang + checkout WhatsApp
- Desain profesional & responsive
