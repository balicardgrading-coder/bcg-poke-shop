/**
 * ============================================================
 *  PokéMart Pro — Script
 *  Data produk diambil dari products.json
 *  Cukup edit products.json untuk ubah stok / harga / produk
 * ============================================================
 */

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(n);

let PRODUCTS = [];          // diisi dari products.json
let cart = JSON.parse(localStorage.getItem("pokemart_cart") || "[]");
let currentFilter = "all";
let searchQuery = "";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Load data dari JSON (seperti cards.json di contoh) ---------- */
async function loadProducts() {
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("Gagal load products.json");
    const data = await res.json();

    // Ubah object { "PKM-001": {...} } menjadi array dengan id
    PRODUCTS = Object.entries(data).map(([id, item]) => ({
      id,
      ...item
    }));

    renderProducts();
    updateCartUI();
  } catch (err) {
    console.error(err);
    $("#productsGrid").innerHTML = `
      <p style="grid-column:1/-1;text-align:center;color:#ef4444;padding:40px">
        Gagal memuat data produk.<br>
        Pastikan file <strong>products.json</strong> ada di folder yang sama
        dan website dijalankan lewat server (bukan file://).
      </p>`;
  }
}

function getStockStatus(stock) {
  if (stock <= 0) return { label: "Habis", class: "out-of-stock" };
  if (stock <= 5) return { label: `Sisa ${stock}`, class: "low-stock" };
  return { label: "Tersedia", class: "in-stock" };
}

function renderProducts() {
  const grid = $("#productsGrid");
  const empty = $("#emptyState");

  let filtered = PRODUCTS.filter((p) => {
    const matchCat = currentFilter === "all" || p.category === currentFilter;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery));
    return matchCat && matchSearch;
  });

  $("#totalProducts").textContent = PRODUCTS.filter((p) => p.stock > 0).length;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = filtered
    .map((p) => {
      const status = getStockStatus(p.stock);
      const disabled = p.stock <= 0 ? "disabled" : "";
      const btnText = p.stock <= 0 ? "Habis" : "+ Keranjang";
      return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-img-wrap">
          <span class="stock-badge ${status.class}">${status.label}</span>
          <img src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.src='https://via.placeholder.com/150?text=Pokemon'">
        </div>
        <div class="product-body">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc || ""}</p>
          <div class="product-footer">
            <span class="product-price">${formatRupiah(p.price)}</span>
            <button class="add-btn" data-id="${p.id}" ${disabled}>${btnText}</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  $$(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product || product.stock <= 0) return;

  const existing = cart.find((c) => c.id === id);
  const currentQty = existing ? existing.qty : 0;

  if (currentQty >= product.stock) {
    alert("Stok tidak mencukupi!");
    return;
  }

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart();
  updateCartUI();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;

  const product = PRODUCTS.find((p) => p.id === id);
  const newQty = item.qty + delta;

  if (newQty <= 0) {
    cart = cart.filter((c) => c.id !== id);
  } else if (product && newQty > product.stock) {
    alert("Stok tidak mencukupi!");
    return;
  } else {
    item.qty = newQty;
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("pokemart_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $("#cartCount").textContent = count;

  const container = $("#cartItems");
  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Keranjang masih kosong.<br>Yuk pilih produk!</p>`;
    $("#cartTotal").textContent = formatRupiah(0);
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id);
      if (!p) return "";
      total += p.price * c.qty;
      return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatRupiah(p.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="minus" data-id="${c.id}">−</button>
            <span>${c.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${c.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${c.id}">Hapus</button>
        </div>
      </div>`;
    })
    .join("");

  $("#cartTotal").textContent = formatRupiah(total);

  $$(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = btn.dataset.action === "plus" ? 1 : -1;
      changeQty(btn.dataset.id, delta);
    });
  });

  $$(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  let message = "Halo admin PokéMart Pro! Saya ingin order:%0A%0A";
  let total = 0;

  cart.forEach((c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    if (!p) return;
    const sub = p.price * c.qty;
    total += sub;
    message += `• ${p.name} x${c.qty} = ${formatRupiah(sub)}%0A`;
  });

  message += `%0A*Total: ${formatRupiah(total)}*%0A%0AMohon info ketersediaan & ongkir ya. Terima kasih!`;

  // Ganti nomor WhatsApp di bawah ini
  const waNumber = "628117070168";
  window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadProducts(); // ambil data dari products.json

  // Filter
  $$(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  // Search
  $("#searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderProducts();
  });

  // Cart
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#cartOverlay").addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", checkoutWhatsApp);

  // Mobile menu
  const menuToggle = $("#menuToggle");
  const navLinks = $(".nav-links");
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  $$(".nav-links a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });
});
