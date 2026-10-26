/* =========================================================================
   SAMBALAKU — script.js
   Berisi: data produk, keranjang (localStorage), katalog & filter, checkout
   simulasi, navigasi mobile, toast, dan tautan WhatsApp.

   CARA CEPAT MENGUBAH DATA:
   - Nomor WhatsApp, email, dan ongkir ada di objek TOKO.
   - Nama, deskripsi, harga, foto, dan level pedas ada di array PRODUK.
   - Harga ditulis tanpa titik (32000 = Rp 32.000).
   ========================================================================= */

(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     1. PENGATURAN TOKO — ganti sebelum situs dipakai
     ----------------------------------------------------------------------- */
  const TOKO = {
    whatsapp: "6281234567890", // format internasional, tanpa + dan spasi
    pesanWhatsapp: "Halo Sambalaku! Saya mau tanya soal sambal dan pengiriman.",
    email: "halo@sambalaku.id",
    ongkir: 18000,
    gratisOngkir: 150000
  };

  /* -----------------------------------------------------------------------
     2. DATA PRODUK
     id       : dipakai untuk keranjang (jangan ada spasi)
     foto     : ganti dengan foto asli, mis. assets/img/sambal-bawang.jpg
     pedas    : 1–5
     kategori : Pedas | Gurih | Segar (dipakai filter)
     ----------------------------------------------------------------------- */
  const PRODUK = [
    {
      id: "sambal-bawang",
      nama: "Sambal Bawang Klasik",
      deskripsi:
        "Cabai rawit merah, bawang putih, dan minyak kelapa dimasak perlahan sampai harum. Pedasnya nendang, gurihnya bikin sulit berhenti.",
      harga: 32000,
      foto: "assets/img/sambal-bawang.svg",
      pedas: 3,
      kategori: "Pedas",
      asal: "Resep keluarga",
      berat: "180 g",
      badge: "Terlaris",
      badgeEmas: true
    },
    {
      id: "sambal-ijo",
      nama: "Sambal Ijo Padang",
      deskripsi:
        "Cabai hijau, tomat muda, dan terasi bakar khas Padang. Segar, smoky, dan pas disendokkan ke nasi panas.",
      harga: 38000,
      foto: "assets/img/sambal-ijo.svg",
      pedas: 3,
      kategori: "Pedas",
      asal: "Padang",
      berat: "180 g",
      badge: "Khas Padang"
    },
    {
      id: "sambal-terasi",
      nama: "Sambal Terasi Bakar",
      deskripsi:
        "Terasi bakar pilihan berpadu tomat dan gula aren. Gurihnya dalam, pedasnya hangat—jiwa masakan rumahan.",
      harga: 35000,
      foto: "assets/img/sambal-terasi.svg",
      pedas: 4,
      kategori: "Gurih",
      asal: "Cirebon",
      berat: "180 g",
      badge: "",
      badgeEmas: false
    },
    {
      id: "sambal-mangga",
      nama: "Sambal Mangga Muda",
      deskripsi:
        "Serutan mangga muda yang crispy dengan cabai rawit dan perasan jeruk limau. Asam, pedas, segar untuk lauk berkuah.",
      harga: 42000,
      foto: "assets/img/sambal-mangga.svg",
      pedas: 2,
      kategori: "Segar",
      asal: "Jawa Timur",
      berat: "180 g",
      badge: "Baru",
      badgeEmas: true
    },
    {
      id: "sambal-petai",
      nama: "Sambal Petai Bawang",
      deskripsi:
        "Petai segar, bawang merah, dan cabai rawit dalam minyak kelapa. Aroma khasnya berani, rasanya bikin nagih.",
      harga: 45000,
      foto: "assets/img/sambal-petai.svg",
      pedas: 4,
      kategori: "Pedas",
      asal: "Sumatera",
      berat: "180 g",
      badge: "Favorit"
    },
    {
      id: "sambal-cumi",
      nama: "Sambal Cumi Pedas Manis",
      deskripsi:
        "Cumi empuk dan cabai merah dalam saus pedas manis. Manjakan lidah, cocok untuk nasi, mi, atau roti.",
      harga: 50000,
      foto: "assets/img/sambal-cumi.svg",
      pedas: 3,
      kategori: "Gurih",
      asal: "Pesisir",
      berat: "180 g",
      badge: "Premium"
    }
  ];

  const KUNCI_KERANJANG = "sambalaku-keranjang-v1";
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* -----------------------------------------------------------------------
     3. KERANJANG (localStorage)
     Struktur data: { "sambal-bawang": 2, "sambal-ijo": 1 }
     ----------------------------------------------------------------------- */
  let keranjangMemori = {};

  function bacaKeranjang() {
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(KUNCI_KERANJANG) || "{}");
    } catch (error) {
      data = keranjangMemori;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      data = {};
    }

    const bersih = {};
    Object.keys(data).forEach((id) => {
      const produk = PRODUK.find((item) => item.id === id);
      const jumlah = Math.min(99, Math.max(0, parseInt(data[id], 10) || 0));
      if (produk && jumlah > 0) bersih[id] = jumlah;
    });
    keranjangMemori = bersih;
    return bersih;
  }

  function simpanKeranjang(data) {
    keranjangMemori = data;
    try {
      localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(data));
    } catch (error) {
      // Mode privat / storage penuh: keranjang tetap jalan di memori.
    }
    perbaruiBadge();
  }

  function totalItem(data) {
    return Object.values(data).reduce((total, jumlah) => total + jumlah, 0);
  }

  function perbaruiBadge(bump) {
    const jumlah = totalItem(bacaKeranjang());
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = String(jumlah);
      el.hidden = jumlah === 0;
    });

    $$(".cart-link").forEach((link) => {
      link.setAttribute(
        "aria-label",
        jumlah > 0 ? "Keranjang belanja, " + jumlah + " item" : "Keranjang belanja, kosong"
      );
    });

    if (bump) {
      $$("[data-cart-count]").forEach((el) => {
        el.classList.remove("is-bump");
        void el.offsetWidth; // memicu ulang animasi
        el.classList.add("is-bump");
        window.setTimeout(() => el.classList.remove("is-bump"), 250);
      });
    }
  }

  function tambahKeKeranjang(id, jumlah, tombol) {
    const produk = PRODUK.find((item) => item.id === id);
    if (!produk) return;

    const data = bacaKeranjang();
    data[id] = Math.min(99, (data[id] || 0) + (jumlah || 1));
    simpanKeranjang(data);
    perbaruiBadge(true);

    if (tombol) {
      const label = $("[data-add-label]", tombol);
      if (label) {
        const teksAsli = label.textContent;
        label.textContent = "Ditambahkan";
        tombol.classList.add("is-added");
        window.setTimeout(() => {
          label.textContent = teksAsli;
          tombol.classList.remove("is-added");
        }, 1400);
      }
    }

    tampilkanToast(produk.nama + " masuk keranjang.", {
      label: "Lihat keranjang",
      href: "keranjang.html"
    });
  }

  function ubahJumlah(id, selisih) {
    const data = bacaKeranjang();
    if (!data[id]) return;

    const jumlahBaru = data[id] + selisih;
    if (jumlahBaru <= 0) {
      delete data[id];
    } else {
      data[id] = Math.min(99, jumlahBaru);
    }
    simpanKeranjang(data);
    renderKeranjang();
  }

  function hapusItem(id) {
    const data = bacaKeranjang();
    const produk = PRODUK.find((item) => item.id === id);
    delete data[id];
    simpanKeranjang(data);
    renderKeranjang();
    if (produk) tampilkanToast(produk.nama + " dihapus dari keranjang.");
  }

  /* -----------------------------------------------------------------------
     4. TOAST NOTIFIKASI
     ----------------------------------------------------------------------- */
  let elemenToast = null;
  let timerToast = null;

  function siapkanToast() {
    if (elemenToast) return elemenToast;

    elemenToast = document.createElement("div");
    elemenToast.className = "toast";
    elemenToast.setAttribute("role", "status");
    elemenToast.setAttribute("aria-live", "polite");
    elemenToast.innerHTML =
      '<span class="toast-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="m5 12 4.5 4.5L19 7"/></svg></span>' +
      '<span class="toast-message"></span>';
    document.body.appendChild(elemenToast);
    return elemenToast;
  }

  function tampilkanToast(pesan, tautan) {
    const toast = siapkanToast();
    const pesanEl = $(".toast-message", toast);
    pesanEl.textContent = pesan;

    if (tautan) {
      const link = document.createElement("a");
      link.href = tautan.href;
      link.textContent = tautan.label;
      pesanEl.append(" ", link);
    }

    toast.classList.add("is-visible");
    window.clearTimeout(timerToast);
    timerToast = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
  }

  /* -----------------------------------------------------------------------
     5. KARTU PRODUK
     ----------------------------------------------------------------------- */
  function titikPedas(level) {
    let html = "";
    for (let i = 1; i <= 5; i += 1) {
      html += '<i class="' + (i <= level ? "on" : "") + '"></i>';
    }
    return html;
  }

  function kartuProduk(produk) {
    const badge = produk.badge
      ? '<span class="product-badge ' +
        (produk.badgeEmas ? "product-badge--gold" : "") +
        '">' +
        produk.badge +
        "</span>"
      : "";

    return (
      '<article class="product-card" id="' + produk.id + '">' +
      '<div class="product-media">' +
      '<img src="' + produk.foto + '" alt="Toples ' + produk.nama + '" width="800" height="800" loading="lazy">' +
      badge +
      '<span class="heat-pill" aria-label="Tingkat pedas ' + produk.pedas + ' dari 5">' +
      '<span class="heat-dots" aria-hidden="true">' + titikPedas(produk.pedas) + "</span>" +
      "<span>Pedas " + produk.pedas + "/5</span></span>" +
      "</div>" +
      '<div class="product-body">' +
      '<p class="product-kicker">' + produk.asal + " &middot; " + produk.berat + "</p>" +
      '<h3 class="product-title"><a href="produk.html#' + produk.id + '">' + produk.nama + "</a></h3>" +
      '<p class="product-desc">' + produk.deskripsi + "</p>" +
      '<div class="product-foot">' +
      '<p class="price">' + rupiah.format(produk.harga) + "<small>per toples " + produk.berat + "</small></p>" +
      '<button class="add-btn" type="button" data-add="' + produk.id + '" aria-label="Tambah ' + produk.nama + ' ke keranjang">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M12 5v14M5 12h14"/></svg>' +
      '<span data-add-label>Tambah</span></button>' +
      "</div></div></article>"
    );
  }

  /* Mengisi produk unggulan di beranda */
  function renderProdukUnggulan() {
    const wadah = $("[data-featured]");
    if (!wadah) return;
    const batas = parseInt(wadah.dataset.limit || "3", 10);
    wadah.innerHTML = PRODUK.slice(0, batas).map(kartuProduk).join("");
  }

  /* -----------------------------------------------------------------------
     6. KATALOG PRODUK (filter, pencarian, urutan)
     ----------------------------------------------------------------------- */
  const stateKatalog = {
    kategori: "semua",
    cari: "",
    urutan: "unggulan"
  };

  function renderKatalog() {
    const wadah = $("[data-product-list]");
    const kosong = $("[data-catalog-empty]");
    if (!wadah) return;

    const kata = stateKatalog.cari.toLowerCase();
    let hasil = PRODUK.filter((produk) => {
      const cocokKategori =
        stateKatalog.kategori === "semua" ||
        produk.kategori.toLowerCase() === stateKatalog.kategori.toLowerCase();
      const cocokCari =
        !kata ||
        produk.nama.toLowerCase().includes(kata) ||
        produk.deskripsi.toLowerCase().includes(kata) ||
        produk.asal.toLowerCase().includes(kata);
      return cocokKategori && cocokCari;
    });

    if (stateKatalog.urutan === "harga-naik") {
      hasil = hasil.sort((a, b) => a.harga - b.harga);
    } else if (stateKatalog.urutan === "harga-turun") {
      hasil = hasil.sort((a, b) => b.harga - a.harga);
    } else if (stateKatalog.urutan === "pedas") {
      hasil = hasil.sort((a, b) => b.pedas - a.pedas || a.harga - b.harga);
    }

    wadah.innerHTML = hasil.map(kartuProduk).join("");
    if (kosong) kosong.hidden = hasil.length > 0;

    const jumlah = $("[data-result-count]");
    if (jumlah) jumlah.textContent = hasil.length + " produk";
  }

  function inisialisasiKatalog() {
    if (!$("[data-product-list]")) return;

    $$("[data-filter]").forEach((tombol) => {
      const aktif = tombol.dataset.filter === stateKatalog.kategori;
      tombol.classList.toggle("is-active", aktif);
      tombol.setAttribute("aria-pressed", aktif ? "true" : "false");

      tombol.addEventListener("click", () => {
        stateKatalog.kategori = tombol.dataset.filter;
        $$("[data-filter]").forEach((lain) => {
          const pilih = lain === tombol;
          lain.classList.toggle("is-active", pilih);
          lain.setAttribute("aria-pressed", pilih ? "true" : "false");
        });
        renderKatalog();
      });
    });

    const pencarian = $("[data-search]");
    if (pencarian) {
      pencarian.addEventListener("input", (event) => {
        stateKatalog.cari = event.target.value.trim();
        renderKatalog();
      });
    }

    const urutan = $("[data-sort]");
    if (urutan) {
      urutan.addEventListener("change", (event) => {
        stateKatalog.urutan = event.target.value;
        renderKatalog();
      });
    }

    const reset = $$("[data-reset-filter]");
    reset.forEach((tombol) => {
      tombol.addEventListener("click", () => {
        stateKatalog.kategori = "semua";
        stateKatalog.cari = "";
        stateKatalog.urutan = "unggulan";
        if (pencarian) pencarian.value = "";
        if (urutan) urutan.value = "unggulan";
        $$("[data-filter]").forEach((lain) => {
          const pilih = lain.dataset.filter === "semua";
          lain.classList.toggle("is-active", pilih);
          lain.setAttribute("aria-pressed", pilih ? "true" : "false");
        });
        renderKatalog();
      });
    });

    renderKatalog();
    fokusProdukDariHash();
  }

  /** Membuka produk tertentu saat datang dari tautan produk.html#id */
  function fokusProdukDariHash() {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!PRODUK.some((produk) => produk.id === id)) return;

    const kartu = document.getElementById(id);
    if (!kartu) return;

    window.setTimeout(() => {
      kartu.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  }

  /* -----------------------------------------------------------------------
     7. HALAMAN KERANJANG
     ----------------------------------------------------------------------- */
  function barisKeranjang(produk, jumlah) {
    return (
      '<article class="cart-item">' +
      '<a class="cart-thumb" href="produk.html#' + produk.id + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + produk.foto + '" alt="" width="800" height="800" loading="lazy">' +
      "</a>" +
      '<div class="cart-item-main">' +
      '<div class="cart-item-head">' +
      '<h3 class="cart-item-title"><a href="produk.html#' + produk.id + '">' + produk.nama + "</a></h3>" +
      '<button class="remove-btn" type="button" data-cart-action="hapus" data-id="' + produk.id + '" aria-label="Hapus ' + produk.nama + ' dari keranjang">Hapus</button>' +
      "</div>" +
      '<p class="cart-meta">' + produk.berat + " &middot; Pedas " + produk.pedas + "/5</p>" +
      '<div class="cart-item-foot">' +
      '<div class="qty" role="group" aria-label="Jumlah ' + produk.nama + '">' +
      '<button class="qty-btn" type="button" data-cart-action="kurangi" data-id="' + produk.id + '" aria-label="Kurangi jumlah ' + produk.nama + '"' + (jumlah <= 1 ? " disabled" : "") + ">&minus;</button>" +
      '<span class="qty-value" aria-live="polite">' + jumlah + "</span>" +
      '<button class="qty-btn" type="button" data-cart-action="tambah" data-id="' + produk.id + '" aria-label="Tambah jumlah ' + produk.nama + '"' + (jumlah >= 99 ? " disabled" : "") + ">+</button>" +
      "</div>" +
      '<p class="cart-line-price">' + rupiah.format(produk.harga * jumlah) + "</p>" +
      "</div></div></article>"
    );
  }

  function renderKeranjang() {
    const layout = $("[data-cart-layout]");
    if (!layout) return;

    const data = bacaKeranjang();
    const item = Object.keys(data)
      .map((id) => ({ produk: PRODUK.find((p) => p.id === id), jumlah: data[id] }))
      .filter((baris) => baris.produk);

    const kosong = item.length === 0;
    const panelKosong = $("[data-cart-empty]");
    const checkout = $("[data-checkout]");

    layout.hidden = kosong;
    if (panelKosong) panelKosong.hidden = !kosong;
    if (checkout) checkout.hidden = kosong;

    if (kosong) {
      const label = $("[data-cart-count-label]");
      if (label) label.textContent = "0 item";
      return;
    }

    const daftar = $("[data-cart-items]");
    if (daftar) daftar.innerHTML = item.map((baris) => barisKeranjang(baris.produk, baris.jumlah)).join("");

    const subtotal = item.reduce((total, baris) => total + baris.produk.harga * baris.jumlah, 0);
    const ongkir = subtotal >= TOKO.gratisOngkir ? 0 : TOKO.ongkir;
    const total = subtotal + ongkir;

    const label = $("[data-cart-count-label]");
    if (label) label.textContent = totalItem(data) + " item";

    const elSubtotal = $("[data-summary-subtotal]");
    if (elSubtotal) elSubtotal.textContent = rupiah.format(subtotal);

    const elOngkir = $("[data-summary-shipping]");
    if (elOngkir) {
      elOngkir.textContent = ongkir === 0 ? "Gratis" : rupiah.format(ongkir);
      const baris = elOngkir.closest(".summary-row");
      if (baris) baris.classList.toggle("summary-row--free", ongkir === 0);
    }

    const elTotal = $("[data-summary-total]");
    if (elTotal) elTotal.textContent = rupiah.format(total);

    const sisa = Math.max(0, TOKO.gratisOngkir - subtotal);
    const bar = $("[data-meter-bar]");
    const teksMeter = $("[data-meter-text]");
    if (bar) {
      bar.style.width = Math.min(100, (subtotal / TOKO.gratisOngkir) * 100) + "%";
      const meter = bar.closest(".meter");
      if (meter) meter.setAttribute("aria-valuenow", String(Math.min(subtotal, TOKO.gratisOngkir)));
    }
    if (teksMeter) {
      teksMeter.innerHTML =
        sisa === 0
          ? "<strong>Selamat, pesananmu gratis ongkir!</strong>"
          : "Tambah <strong>" + rupiah.format(sisa) + "</strong> lagi untuk gratis ongkir.";
    }
  }

  function inisialisasiKeranjang() {
    if (!$("[data-cart-layout]")) return;

    // Tombol +, −, dan hapus di daftar keranjang
    const daftar = $("[data-cart-items]");
    if (daftar) {
      daftar.addEventListener("click", (event) => {
        const tombol = event.target.closest("[data-cart-action]");
        if (!tombol) return;

        const id = tombol.dataset.id;
        const aksi = tombol.dataset.cartAction;
        if (aksi === "tambah") ubahJumlah(id, 1);
        if (aksi === "kurangi") ubahJumlah(id, -1);
        if (aksi === "hapus") hapusItem(id);
      });
    }

    const form = $("[data-checkout-form]");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const data = bacaKeranjang();
        if (Object.keys(data).length === 0) {
          tampilkanToast("Keranjangmu masih kosong.");
          return;
        }

        const subtotal = Object.keys(data).reduce((total, id) => {
          const produk = PRODUK.find((p) => p.id === id);
          return produk ? total + produk.harga * data[id] : total;
        }, 0);
        const ongkir = subtotal >= TOKO.gratisOngkir ? 0 : TOKO.ongkir;
        const total = subtotal + ongkir;
        const nama = ($("[name=nama]", form) || {}).value || "";
        const kode = "SBK-" + String(Date.now()).slice(-6);

        const kodeEl = $("[data-order-code]");
        const totalEl = $("[data-order-total]");
        const namaEl = $("[data-order-name]");
        if (kodeEl) kodeEl.textContent = kode;
        if (totalEl) totalEl.textContent = rupiah.format(total);
        if (namaEl) namaEl.textContent = nama.trim().split(" ")[0] || "Kak";

        // Cantumkan kode pesanan pada tautan WhatsApp di layar konfirmasi.
        const waSukses = $("[data-checkout-success] [data-wa]");
        if (waSukses) {
          const pesanWa =
            "Halo Sambalaku! Saya baru membuat pesanan di website dengan kode " +
            kode +
            " (" +
            rupiah.format(total) +
            "). Mohon dibantu konfirmasi pembayaran dan pengirimannya. Terima kasih!";
          waSukses.href = "https://wa.me/" + TOKO.whatsapp + "?text=" + encodeURIComponent(pesanWa);
        }

        // Simulasi: kosongkan keranjang lalu tampilkan konfirmasi.
        simpanKeranjang({});
        const checkout = $("[data-checkout]");
        const sukses = $("[data-checkout-success]");
        const layout = $("[data-cart-layout]");
        const kosong = $("[data-cart-empty]");
        if (checkout) checkout.hidden = true;
        if (layout) layout.hidden = true;
        if (kosong) kosong.hidden = true;
        if (sukses) {
          sukses.classList.add("is-visible");
          sukses.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      });
    }

    renderKeranjang();
  }

  /* -----------------------------------------------------------------------
     8. NAVIGASI MOBILE & HEADER
     ----------------------------------------------------------------------- */
  function inisialisasiNavigasi() {
    const header = $("[data-header]");
    const tombol = $("[data-nav-toggle]");
    if (!header || !tombol) return;

    const tutup = () => {
      header.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      tombol.setAttribute("aria-expanded", "false");
      tombol.setAttribute("aria-label", "Buka menu navigasi");
    };

    tombol.addEventListener("click", () => {
      const buka = !header.classList.contains("nav-open");
      header.classList.toggle("nav-open", buka);
      document.body.classList.toggle("nav-open", buka);
      tombol.setAttribute("aria-expanded", buka ? "true" : "false");
      tombol.setAttribute("aria-label", buka ? "Tutup menu navigasi" : "Buka menu navigasi");
    });

    $$(".main-nav a", header).forEach((link) => {
      link.addEventListener("click", tutup);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") tutup();
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) return;
      if (header.contains(event.target)) return;
      tutup();
    });

    const layar = window.matchMedia("(min-width: 860px)");
    const saatLayarBerubah = (event) => {
      if (event.matches) tutup();
    };
    if (typeof layar.addEventListener === "function") {
      layar.addEventListener("change", saatLayarBerubah);
    } else {
      layar.addListener(saatLayarBerubah);
    }

    const bayangan = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    bayangan();
    window.addEventListener("scroll", bayangan, { passive: true });
  }

  /* -----------------------------------------------------------------------
     9. FAQ, TAHUN, DAN TAUTAN TOKO
     ----------------------------------------------------------------------- */
  function inisialisasiFaq() {
    const items = $$(".faq-item");
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((lain) => {
          if (lain !== item) lain.open = false;
        });
      });
    });
  }

  function inisialisasiTautan() {
    $$("[data-wa]").forEach((link) => {
      const pesan = link.dataset.waPesan || TOKO.pesanWhatsapp;
      link.href = "https://wa.me/" + TOKO.whatsapp + "?text=" + encodeURIComponent(pesan);
      link.target = "_blank";
      link.rel = "noopener";
    });

    $$("[data-email]").forEach((link) => {
      link.href = "mailto:" + TOKO.email;
    });

    $$("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* -----------------------------------------------------------------------
     10. TOMBOL TAMBAH KE KERANJANG (delegasi seluruh halaman)
     ----------------------------------------------------------------------- */
  function inisialisasiTambahProduk() {
    document.addEventListener("click", (event) => {
      const tombol = event.target.closest("[data-add]");
      if (!tombol) return;
      tambahKeKeranjang(tombol.dataset.add, 1, tombol);
    });
  }

  /* -----------------------------------------------------------------------
     11. Jalankan
     ----------------------------------------------------------------------- */
  function mulai() {
    renderProdukUnggulan();
    inisialisasiKatalog();
    inisialisasiKeranjang();
    inisialisasiNavigasi();
    inisialisasiFaq();
    inisialisasiTautan();
    inisialisasiTambahProduk();
    perbaruiBadge();

    // Sinkronkan jumlah keranjang antar-tab
    window.addEventListener("storage", (event) => {
      if (event.key !== KUNCI_KERANJANG) return;
      perbaruiBadge();
      renderKeranjang();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
