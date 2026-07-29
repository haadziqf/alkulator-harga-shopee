"use client";

import { useMemo, useState, useEffect } from "react";

function formatNumber(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const formatted = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return isNegative ? `-${formatted}` : formatted;
}

const number = {
  format: (value: number) => formatNumber(value),
};

const rupiah = {
  format: (value: number) => `Rp${formatNumber(value)}`,
};

type Platform = "shopee" | "tokopedia" | "tiktok";

interface PlatformConfig {
  id: Platform;
  name: string;
  badge: string;
  icon: string;
  themeColor: string;
  adminRateDefault: number;
  shippingRateDefault: number;
  shippingCapDefault: number;
  shippingLabel: string;
  shippingDesc: string;
  promoLabel: string;
  promoRateDefault: number;
  sources: { title: string; desc: string; url: string }[];
}

const PLATFORMS: Record<Platform, PlatformConfig> = {
  shopee: {
    id: "shopee",
    name: "Shopee Indonesia",
    badge: "Shopee",
    icon: "🧡",
    themeColor: "#ee4d2d",
    adminRateDefault: 10,
    shippingRateDefault: 5.5,
    shippingCapDefault: 40000,
    shippingLabel: "Gratis Ongkir XTRA",
    shippingDesc: "Tarif & batas maksimal sesuai kategori toko Shopee",
    promoLabel: "Promo XTRA",
    promoRateDefault: 4.5,
    sources: [
      {
        title: "Biaya Administrasi Penjual Shopee",
        desc: "Rumus & tarif final berdasarkan kategori",
        url: "https://seller.shopee.co.id/edu/article/7187",
      },
      {
        title: "Rincian Biaya per Kategori Shopee",
        desc: "Daftar kategori dan persentase biaya",
        url: "https://seller.shopee.co.id/edu/article/15965",
      },
      {
        title: "Gratis Ongkir XTRA Shopee",
        desc: "Persentase kategori dan batas maksimal",
        url: "https://seller.shopee.co.id/edu/article/7216",
      },
      {
        title: "Biaya Jualan di Shopee",
        desc: "Biaya proses Rp1.250 per pesanan selesai",
        url: "https://seller.shopee.co.id/edu/article/16055",
      },
    ],
  },
  tokopedia: {
    id: "tokopedia",
    name: "Tokopedia",
    badge: "Tokopedia",
    icon: "💚",
    themeColor: "#03ac0e",
    adminRateDefault: 8,
    shippingRateDefault: 4,
    shippingCapDefault: 10000,
    shippingLabel: "Bebas Ongkir Tokopedia",
    shippingDesc: "Program Bebas Ongkir Tokopedia (Power Shop / Regular)",
    promoLabel: "Promo Tokopedia",
    promoRateDefault: 3.5,
    sources: [
      {
        title: "Biaya Layanan Tokopedia 2025/2026",
        desc: "Skema Power Shop dan Seller Regular",
        url: "https://seller.tokopedia.com/edu/",
      },
      {
        title: "Ketentuan Program Bebas Ongkir Tokopedia",
        desc: "Persentase biaya & batas maksimal potongan",
        url: "https://seller.tokopedia.com/edu/",
      },
      {
        title: "Komisi Platform Tokopedia",
        desc: "Komisi platform & diskon program GMV Max",
        url: "https://seller.tokopedia.com/edu/",
      },
    ],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Shop by Tokopedia",
    badge: "TikTok Shop",
    icon: "🖤",
    themeColor: "#121212",
    adminRateDefault: 7,
    shippingRateDefault: 4.5,
    shippingCapDefault: 40000,
    shippingLabel: "Gratis Ongkir / Komisi Dinamis",
    shippingDesc: "Komisi dinamis pendanaan gratis ongkir pembeli",
    promoLabel: "Promo TikTok Shop",
    promoRateDefault: 3,
    sources: [
      {
        title: "Panduan Biaya Komisi TikTok Shop",
        desc: "Komisi platform & komisi dinamis per kategori",
        url: "https://seller-id.tiktok.com/university/",
      },
      {
        title: "Biaya Pemrosesan TikTok Shop",
        desc: "Biaya pemrosesan transaksi Rp1.250",
        url: "https://seller-id.tiktok.com/university/",
      },
      {
        title: "Program Growth Xtra TikTok Shop",
        desc: "Diskon komisi platform dengan GMV Max",
        url: "https://seller-id.tiktok.com/university/",
      },
    ],
  },
};

interface CategoryPreset {
  id: string;
  name: string;
  rates: Record<Platform, number>;
}

const CATEGORIES: CategoryPreset[] = [
  { id: "fashion", name: "👗 Fashion, Pakaian & Aksesoris", rates: { shopee: 10, tokopedia: 8, tiktok: 8 } },
  { id: "elektronik", name: "📱 Elektronik, Gadget & Komputer", rates: { shopee: 4, tokopedia: 4, tiktok: 4.5 } },
  { id: "skincare", name: "💄 Skincare, Kecantikan & Kesehatan", rates: { shopee: 9, tokopedia: 7.5, tiktok: 7 } },
  { id: "fmcg", name: "🍔 Makanan, Minuman & Supermarket", rates: { shopee: 8, tokopedia: 6.5, tiktok: 6 } },
  { id: "home", name: "🏠 Rumah Tangga, Dapur & Ibu-Bayi", rates: { shopee: 9, tokopedia: 7, tiktok: 7 } },
  { id: "hobby", name: "🚗 Otomotif, Olahraga & Hobi", rates: { shopee: 8.5, tokopedia: 7, tiktok: 6.5 } },
  { id: "custom", name: "⚙️ Atur Manual / Kategori Lainnya", rates: { shopee: 10, tokopedia: 8, tiktok: 7 } },
];

const AFFILIATE_PRODUCTS = [
  {
    icon: "🖨️",
    title: "Printer Thermal Resi Bluetooth",
    desc: "Cetak resi Shopee/Tokped tanpa tinta hemat waktu.",
    link: "https://s.shopee.co.id/9zwVusYu0M",
  },
  {
    icon: "📜",
    title: "Kertas Sticker Thermal 100x150",
    desc: "Sticker resi tinggal tempel, anti air & goresan.",
    link: "https://s.shopee.co.id/8pkYWdJ9Mq",
  },
  {
    icon: "📦",
    title: "Plastik Polymailer & Bubble Wrap",
    desc: "Bubble wrap & plastik packing tebal anti bocor.",
    link: "https://s.shopee.co.id/qiH05JVm4",
  },
  {
    icon: "🏷️",
    title: "Lakban Fragile & Bening Grosir",
    desc: "Lakban perekat kuat untuk keamanan paket seller.",
    link: "https://s.shopee.co.id/qiH05JVm4",
  },
];

type Inputs = {
  platform: Platform;
  category: string;
  targetMode: "profit" | "net";
  targetNetRevenue: number;
  hpp: number;
  packing: number;
  operational: number;
  buffer: number;
  profitPercent: number;
  sellerDiscount: number;
  adminRate: number;
  adsRate: number;
  shippingOn: boolean;
  shippingRate: number;
  shippingCap: number;
  promoOn: boolean;
  promoRate: number;
  affiliateOn: boolean;
  affiliateRate: number;
  affiliateVat: number;
  preorder: boolean;
  mallPayment: boolean;
  orderFee: number;
  quantity: number;
};

const initialInputs: Inputs = {
  platform: "shopee",
  category: "fashion",
  targetMode: "profit",
  targetNetRevenue: 900000,
  hpp: 700000,
  packing: 20000,
  operational: 0,
  buffer: 0,
  profitPercent: 25,
  sellerDiscount: 0,
  adminRate: 10,
  adsRate: 0,
  shippingOn: true,
  shippingRate: 5.5,
  shippingCap: 40000,
  promoOn: false,
  promoRate: 4.5,
  affiliateOn: false,
  affiliateRate: 5,
  affiliateVat: 11,
  preorder: false,
  mallPayment: false,
  orderFee: 1250,
  quantity: 1,
};

function clamp(value: number, min = 0, max = 1000000000) {
  return Math.min(Math.max(Number.isFinite(value) ? value : 0, min), max);
}

function calcAtPrice(listingPrice: number, input: Inputs) {
  const quantity = Math.max(1, input.quantity);
  const transactionBase = listingPrice * (1 - input.sellerDiscount / 100);
  const admin = transactionBase * (input.adminRate / 100);
  const ads = transactionBase * (input.adsRate / 100);
  const shipping = input.shippingOn
    ? Math.min(transactionBase * (input.shippingRate / 100), input.shippingCap)
    : 0;
  const promo = input.promoOn
    ? transactionBase * (input.promoRate / 100)
    : 0;
  const affiliate = input.affiliateOn
    ? transactionBase *
      (input.affiliateRate / 100) *
      (1 + input.affiliateVat / 100)
    : 0;
  const preorder = input.preorder ? transactionBase * 0.03 : 0;
  const mallPayment = input.mallPayment ? transactionBase * 0.018 : 0;
  const processOrder = input.orderFee / quantity;
  const variableFees =
    admin + ads + shipping + promo + affiliate + preorder + mallPayment;
  const productCosts =
    input.hpp + input.packing + input.operational + input.buffer;
  const netRevenue = transactionBase - variableFees - processOrder;
  const profit = netRevenue - productCosts;

  return {
    transactionBase,
    admin,
    ads,
    shipping,
    promo,
    affiliate,
    preorder,
    mallPayment,
    processOrder,
    variableFees,
    productCosts,
    netRevenue,
    profit,
    sellerDiscountNominal: listingPrice - transactionBase,
  };
}

function solvePrice(input: Inputs) {
  const targetProfit = input.hpp * (input.profitPercent / 100);
  const targetValue =
    input.targetMode === "profit" ? targetProfit : input.targetNetRevenue;
  let low = 0;
  let high = Math.max(
    10000,
    (input.targetMode === "profit"
      ? input.hpp +
        input.packing +
        input.operational +
        input.buffer +
        targetProfit
      : input.targetNetRevenue) * 3,
  );

  const metricAt = (price: number) => {
    const calculation = calcAtPrice(price, input);
    return input.targetMode === "profit"
      ? calculation.profit
      : calculation.netRevenue;
  };

  while (metricAt(high) < targetValue && high < 1000000000) {
    high *= 2;
  }

  for (let i = 0; i < 80; i += 1) {
    const middle = (low + high) / 2;
    if (metricAt(middle) >= targetValue) high = middle;
    else low = middle;
  }

  const rounded = Math.ceil(high / 100) * 100;
  return {
    price: rounded,
    targetProfit,
    targetNetRevenue: input.targetNetRevenue,
    ...calcAtPrice(rounded, input),
  };
}

function MoneyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="money-input">
        <b>Rp</b>
        <input
          inputMode="numeric"
          aria-label={label}
          value={number.format(value)}
          onChange={(event) =>
            onChange(clamp(Number(event.target.value.replace(/\D/g, ""))))
          }
        />
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function PercentInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="percent-input">
        <input
          type="number"
          min="0"
          max="99"
          step="0.1"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value), 0, 99))}
        />
        <b>%</b>
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
}

export default function Home() {
  const [input, setInput] = useState(initialInputs);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((reg) => {
        reg.update();
      }).catch(() => {});
    }
  }, []);

  const activePlatform = PLATFORMS[input.platform];
  const result = useMemo(() => solvePrice(input), [input]);

  const totalFees =
    result.variableFees +
    result.processOrder +
    result.sellerDiscountNominal;
  const feePercent = result.price ? (totalFees / result.price) * 100 : 0;

  // Comparison logic across all 3 platforms
  const comparison = useMemo(() => {
    const list = (Object.keys(PLATFORMS) as Platform[]).map((platKey) => {
      const cfg = PLATFORMS[platKey];
      const categoryConfig = CATEGORIES.find((c) => c.id === input.category);
      const adminRate = categoryConfig && categoryConfig.id !== "custom"
        ? categoryConfig.rates[platKey]
        : cfg.adminRateDefault;

      const platInput: Inputs = {
        ...input,
        platform: platKey,
        adminRate: adminRate,
        shippingRate: cfg.shippingRateDefault,
        shippingCap: cfg.shippingCapDefault,
        promoRate: cfg.promoRateDefault,
      };
      const res = solvePrice(platInput);
      const fees = res.variableFees + res.processOrder + res.sellerDiscountNominal;
      const pct = res.price ? (fees / res.price) * 100 : 0;
      return {
        key: platKey,
        config: cfg,
        res,
        totalFees: fees,
        feePercent: pct,
      };
    });

    const sorted = [...list].sort((a, b) => b.res.netRevenue - a.res.netRevenue);
    const best = sorted[0];
    const second = sorted[1];
    const diff = best.res.netRevenue - second.res.netRevenue;

    return { list, best, second, diff };
  }, [input]);

  // Wholesale simulation for 1, 3, 5, 10 pcs
  const wholesaleSimulations = useMemo(() => {
    return [1, 3, 5, 10].map((qty) => {
      const res = solvePrice({ ...input, quantity: qty });
      return { qty, res };
    });
  }, [input]);

  const patch = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  const changePlatform = (newPlatform: Platform) => {
    const config = PLATFORMS[newPlatform];
    const categoryConfig = CATEGORIES.find((c) => c.id === input.category);
    const adminRate = categoryConfig && categoryConfig.id !== "custom"
      ? categoryConfig.rates[newPlatform]
      : config.adminRateDefault;

    setInput((prev) => ({
      ...prev,
      platform: newPlatform,
      adminRate: adminRate,
      shippingRate: config.shippingRateDefault,
      shippingCap: config.shippingCapDefault,
      promoRate: config.promoRateDefault,
    }));
  };

  const changeCategory = (catId: string) => {
    const categoryConfig = CATEGORIES.find((c) => c.id === catId);
    if (categoryConfig && catId !== "custom") {
      const rate = categoryConfig.rates[input.platform];
      setInput((prev) => ({
        ...prev,
        category: catId,
        adminRate: rate,
      }));
    } else {
      setInput((prev) => ({ ...prev, category: catId }));
    }
  };

  const copySummary = () => {
    const text = `📊 RINGKASAN HARGA JUAL (${activePlatform.name.toUpperCase()})
-----------------------------------------
HPP Modal: ${rupiah.format(input.hpp)}
Packing: ${rupiah.format(input.packing)}
Target Profit: ${input.targetMode === 'profit' ? input.profitPercent + '%' : rupiah.format(input.targetNetRevenue)}
-----------------------------------------
💡 HARGA JUAL DISARANKAN: ${rupiah.format(result.price)}
-----------------------------------------
• Uang Bersih Diterima: ${rupiah.format(result.netRevenue)}
• Profit Bersih: ${rupiah.format(result.profit)}
• Total Potongan Komisi: ${rupiah.format(totalFees)} (${feePercent.toFixed(1).replace(".", ",")}%)

Dihitung via HitungJual (${activePlatform.name})`;

    navigator.clipboard.writeText(text);
    setToastMessage("📋 Ringkasan perhitungan berhasil disalin!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const printSummary = () => {
    window.print();
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const yOffset = -90;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const triggerSponsorContact = () => {
    setToastMessage("📩 Kontak Sponsor: Silakan hubungi admin@hitungjual.id / WA: 0812-3456-7890");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main data-theme={input.platform}>
      <div className="nav-container">
        <nav className="nav shell">
          <a className="brand" href="#kalkulator" onClick={(e) => scrollToSection(e, "kalkulator")} aria-label="Hitung Jual">
            <span className="brand-icon" aria-hidden="true">
              <b>+</b><b>−</b><b>×</b><b>=</b>
            </span>
            <span>Hitung<span>.Jual</span></span>
          </a>
          <div className="nav-links">
            <a href="#kalkulator" onClick={(e) => scrollToSection(e, "kalkulator")}>Kalkulator</a>
            <a href="#perbandingan" onClick={(e) => scrollToSection(e, "perbandingan")}>Perbandingan Untung</a>
            <a href="#grosir" onClick={(e) => scrollToSection(e, "grosir")}>Simulasi Grosir</a>
            <a href="#perlengkapan" onClick={(e) => scrollToSection(e, "perlengkapan")}>Perlengkapan Seller</a>
            <a href="#cara-hitung" onClick={(e) => scrollToSection(e, "cara-hitung")}>Cara hitung</a>
          </div>
          <a className="checked-date" href="#sumber" onClick={(e) => scrollToSection(e, "sumber")}>
            <span aria-hidden="true">▣</span> Aturan diperiksa 2026
          </a>
        </nav>
      </div>

      <section className="hero shell" id="kalkulator">
        <p className="eyebrow">Kalkulator harga jual & perbandingan profit Shopee, Tokopedia & TikTok Shop</p>
        <h1>Harga Jualnya Berapa?</h1>
        <p>Hitung harga jual tanpa nebak margin—sudah memperhitungkan komisi admin & program potongan masing-masing marketplace.</p>
      </section>

      <section className="calculator shell">
        <div className="input-card">
          <div className="card-heading">
            <div>
              <p className="step">Langkah 1</p>
              <h2>Pilih Marketplace & Masukkan Angka</h2>
            </div>
            <button className="reset" onClick={() => setInput(initialInputs)}>
              Reset
            </button>
          </div>

          {/* Marketplace Platform Selector */}
          <div className="platform-selector" aria-label="Pilih Marketplace">
            {(Object.keys(PLATFORMS) as Platform[]).map((platKey) => {
              const p = PLATFORMS[platKey];
              return (
                <button
                  key={platKey}
                  type="button"
                  className={`platform-btn ${platKey} ${input.platform === platKey ? "active" : ""}`}
                  onClick={() => changePlatform(platKey)}
                >
                  <span>{p.icon}</span>
                  <span>{p.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Category Preset Dropdown */}
          <div className="category-select-wrapper">
            <label htmlFor="category-select">Pilih Kategori Produk (Preset Komisi Admin)</label>
            <select
              id="category-select"
              className="category-select"
              value={input.category}
              onChange={(e) => changeCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.id !== "custom" ? `(${cat.rates[input.platform]}% Admin)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="target-mode" aria-label="Pilih target perhitungan">
            <button
              type="button"
              className={input.targetMode === "profit" ? "active" : ""}
              onClick={() => patch("targetMode", "profit")}
              aria-pressed={input.targetMode === "profit"}
            >
              <span>Target profit</span>
              <small>Tentukan laba yang ingin didapat</small>
            </button>
            <button
              type="button"
              className={input.targetMode === "net" ? "active" : ""}
              onClick={() => patch("targetMode", "net")}
              aria-pressed={input.targetMode === "net"}
            >
              <span>Uang bersih diterima</span>
              <small>Tentukan saldo yang ingin masuk</small>
            </button>
          </div>

          <div className="input-grid">
            <MoneyInput
              label="HPP produk"
              value={input.hpp}
              onChange={(value) => patch("hpp", value)}
            />
            {input.targetMode === "profit" ? (
              <PercentInput
                label="Target profit dari HPP"
                value={input.profitPercent}
                onChange={(value) => patch("profitPercent", value)}
                hint={`Target laba ${rupiah.format(result.targetProfit)}`}
              />
            ) : (
              <MoneyInput
                label="Uang bersih ingin diterima"
                value={input.targetNetRevenue}
                onChange={(value) => patch("targetNetRevenue", value)}
                hint="Saldo setelah diskon dan biaya komisi, sebelum dikurangi modal"
              />
            )}
            <MoneyInput
              label="Packing per produk"
              value={input.packing}
              onChange={(value) => patch("packing", value)}
            />
            <PercentInput
              label={`Biaya admin kategori (${activePlatform.badge})`}
              value={input.adminRate}
              onChange={(value) => patch("adminRate", value)}
              hint="Otomatis terisi dari kategori atau atur manual"
            />
          </div>

          <div className="program-box">
            <Toggle
              checked={input.shippingOn}
              onChange={(value) => patch("shippingOn", value)}
              label={activePlatform.shippingLabel}
              description={activePlatform.shippingDesc}
            />
            {input.shippingOn && (
              <div className="program-fields">
                <PercentInput
                  label="Tarif program gratis ongkir"
                  value={input.shippingRate}
                  onChange={(value) => patch("shippingRate", value)}
                />
                <MoneyInput
                  label="Batas maksimal per produk"
                  value={input.shippingCap}
                  onChange={(value) => patch("shippingCap", value)}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            className="advanced-button"
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
          >
            <span>Biaya lanjutan & Ads</span>
            <small>Iklan, Affiliate, promo, pre-order, diskon, dan biaya operasional</small>
            <b>{showAdvanced ? "−" : "+"}</b>
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="input-grid">
                <PercentInput
                  label={`Biaya Iklan (${activePlatform.badge} Ads %)`}
                  value={input.adsRate}
                  onChange={(value) => patch("adsRate", value)}
                  hint="Estimasi budget iklan dari omzet"
                />
                <PercentInput
                  label="Diskon/voucher seller"
                  value={input.sellerDiscount}
                  onChange={(value) => patch("sellerDiscount", value)}
                  hint="Tidak termasuk voucher yang ditanggung marketplace"
                />
                <MoneyInput
                  label="Operasional per produk"
                  value={input.operational}
                  onChange={(value) => patch("operational", value)}
                />
                <MoneyInput
                  label="Buffer retur/after-sales"
                  value={input.buffer}
                  onChange={(value) => patch("buffer", value)}
                />
                <MoneyInput
                  label="Biaya proses per pesanan"
                  value={input.orderFee}
                  onChange={(value) => patch("orderFee", value)}
                  hint="Default resmi: Rp1.250"
                />
                <label className="field">
                  <span>Rata-rata produk per pesanan</span>
                  <div className="percent-input plain">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={input.quantity}
                      onChange={(event) =>
                        patch("quantity", clamp(Number(event.target.value), 1, 100))
                      }
                    />
                    <b>pcs</b>
                  </div>
                </label>
              </div>

              <div className="toggle-list">
                <Toggle
                  checked={input.promoOn}
                  onChange={(value) => patch("promoOn", value)}
                  label={activePlatform.promoLabel}
                />
                {input.promoOn && (
                  <PercentInput
                    label={`Tarif ${activePlatform.promoLabel}`}
                    value={input.promoRate}
                    onChange={(value) => patch("promoRate", value)}
                  />
                )}
                <Toggle
                  checked={input.affiliateOn}
                  onChange={(value) => patch("affiliateOn", value)}
                  label="Komisi Affiliate"
                  description="PPN dihitung terpisah sesuai ketentuan program"
                />
                {input.affiliateOn && (
                  <div className="program-fields">
                    <PercentInput
                      label="Tarif komisi"
                      value={input.affiliateRate}
                      onChange={(value) => patch("affiliateRate", value)}
                    />
                    <PercentInput
                      label="PPN komisi"
                      value={input.affiliateVat}
                      onChange={(value) => patch("affiliateVat", value)}
                    />
                  </div>
                )}
                <Toggle
                  checked={input.preorder}
                  onChange={(value) => patch("preorder", value)}
                  label="Produk Pre-order"
                  description="Biaya layanan 3% per kuantitas produk"
                />
                <Toggle
                  checked={input.mallPayment}
                  onChange={(value) => patch("mallPayment", value)}
                  label="Biaya Toko Official / Mall"
                  description="Tambahan biaya transaksi toko Mall/Official"
                />
              </div>
            </div>
          )}

          <p className="live-note"><span /> Hasil dihitung otomatis setiap angka berubah</p>
        </div>

        <aside className="result-card" aria-live="polite">
          <p className="step light">Rekomendasi ({activePlatform.badge})</p>
          <h2>Harga jual disarankan</h2>
          <strong className="big-price">{rupiah.format(result.price)}</strong>
          <p className="rounding">Sudah dibulatkan ke atas ke kelipatan Rp100</p>

          <div className="result-summary">
            <div>
              <span>Profit bersih</span>
              <b>{rupiah.format(result.profit)}</b>
            </div>
            <div>
              <span>Total potongan</span>
              <b>{rupiah.format(totalFees)}</b>
            </div>
            <div>
              <span>Persentase potongan</span>
              <b>{feePercent.toFixed(1).replace(".", ",")}%</b>
            </div>
            <div>
              <span>Uang bersih diterima</span>
              <b>{rupiah.format(result.netRevenue)}</b>
            </div>
          </div>

          <details className="breakdown">
            <summary>Lihat rincian potongan ({activePlatform.badge}) <span>⌄</span></summary>
            <div>
              {result.sellerDiscountNominal > 0 && <p><span>Diskon seller</span><b>{rupiah.format(result.sellerDiscountNominal)}</b></p>}
              <p><span>Biaya admin ({activePlatform.badge})</span><b>{rupiah.format(result.admin)}</b></p>
              {result.ads > 0 && <p><span>Biaya Iklan ({activePlatform.badge} Ads)</span><b>{rupiah.format(result.ads)}</b></p>}
              {result.shipping > 0 && <p><span>{activePlatform.shippingLabel}</span><b>{rupiah.format(result.shipping)}</b></p>}
              {result.promo > 0 && <p><span>{activePlatform.promoLabel}</span><b>{rupiah.format(result.promo)}</b></p>}
              {result.affiliate > 0 && <p><span>Affiliate + PPN</span><b>{rupiah.format(result.affiliate)}</b></p>}
              {result.preorder > 0 && <p><span>Pre-order</span><b>{rupiah.format(result.preorder)}</b></p>}
              {result.mallPayment > 0 && <p><span>Fitur Mall/Official</span><b>{rupiah.format(result.mallPayment)}</b></p>}
              <p><span>Proses pesanan per produk</span><b>{rupiah.format(result.processOrder)}</b></p>
            </div>
          </details>

          {/* Action Buttons: Copy & Print */}
          <div className="action-buttons">
            <button type="button" className="btn-action primary" onClick={copySummary}>
              📋 Salin Ringkasan
            </button>
            <button type="button" className="btn-action" onClick={printSummary}>
              🖨️ Cetak / PDF
            </button>
          </div>

          <p className="result-footnote">
            {input.targetMode === "profit"
              ? `Profit dihitung setelah HPP, packing, operasional, buffer, dan seluruh biaya ${activePlatform.name}.`
              : `Harga dihitung agar uang bersih minimal ${rupiah.format(input.targetNetRevenue)} setelah seluruh potongan ${activePlatform.name}.`}
          </p>
        </aside>
      </section>

      {/* Multi-Marketplace Comparison Section ("Perbandingan Mana Paling Untung") */}
      <section className="comparison-section shell" id="perbandingan">
        <div className="comparison-header">
          <h2>📊 Perbandingan 3 Marketplace (Mana Paling Untung?)</h2>
          <p>Bandingkan harga jual & hasil uang bersih jika kamu menjual produk ini di Shopee, Tokopedia, dan TikTok Shop.</p>
        </div>

        {/* Best Recommendation Banner */}
        <div className="best-banner">
          <div className="best-banner-icon">🏆</div>
          <div className="best-banner-text">
            <strong>
              Rekomendasi Paling Untung: {comparison.best.config.name} {comparison.best.config.icon}
            </strong>
            <p>
              Menjual di {comparison.best.config.name} menghasilkan uang bersih tertinggi ({rupiah.format(comparison.best.res.netRevenue)}) dengan harga jual Rp{formatNumber(comparison.best.res.price)}. Berpotensi untung lebih banyak dibanding platform lain!
            </p>
          </div>
        </div>

        <div className="comparison-grid">
          {comparison.list.map((item) => {
            const isBest = item.key === comparison.best.key;
            return (
              <div key={item.key} className={`comparison-card ${isBest ? "is-best" : ""}`}>
                {isBest && <span className="best-tag">🏆 PALING UNTUNG</span>}
                <div className="comparison-card-badge">
                  <span>{item.config.icon}</span>
                  <span>{item.config.name}</span>
                </div>

                <div className="comp-price-box">
                  <span>Harga Jual Disarankan</span>
                  <strong>{rupiah.format(item.res.price)}</strong>
                </div>

                <div className="comp-metrics">
                  <div>
                    <span>Uang Bersih Diterima</span>
                    <b>{rupiah.format(item.res.netRevenue)}</b>
                  </div>
                  <div>
                    <span>Profit Bersih</span>
                    <b>{rupiah.format(item.res.profit)}</b>
                  </div>
                  <div>
                    <span>Total Potongan</span>
                    <b>{rupiah.format(item.totalFees)} ({item.feePercent.toFixed(1).replace(".", ",")}%)</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Wholesale Simulation Section */}
      <section className="wholesale-section shell" id="grosir">
        <div className="wholesale-header">
          <h2>📦 Simulasi Pembelian Paket Grosir ({activePlatform.badge})</h2>
          <p>Perbandingan harga jual & profit jika pembeli membeli produk dalam jumlah banyak sekaligus dalam 1 pesanan (biaya proses Rp1.250 terbagi rata).</p>
        </div>

        <div className="wholesale-grid">
          {wholesaleSimulations.map((sim) => (
            <div key={sim.qty} className="wholesale-card">
              <span className="wholesale-qty">Paket {sim.qty} pcs</span>
              <div className="wholesale-price">{rupiah.format(sim.res.price)}</div>
              <div className="wholesale-sub">Uang bersih: {rupiah.format(sim.res.netRevenue)}</div>
              <div className="wholesale-sub">Profit: {rupiah.format(sim.res.profit)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Monetization Section 1: Perlengkapan Seller Terlaris (Affiliate Products) */}
      <section className="monetize-section shell" id="perlengkapan">
        <div className="monetize-header">
          <h2>📦 Rekomendasi Perlengkapan Jualan Seller (Harga Supplier)</h2>
          <p>Peralatan packing & operasional terlaris yang paling banyak dipakai seller Shopee, Tokopedia, dan TikTok Shop.</p>
        </div>

        <div className="affiliate-grid">
          {AFFILIATE_PRODUCTS.map((prod, idx) => (
            <div key={idx} className="affiliate-card">
              <div>
                <div className="affiliate-icon">{prod.icon}</div>
                <div className="affiliate-title">{prod.title}</div>
                <div className="affiliate-desc">{prod.desc}</div>
              </div>
              <a href={prod.link} target="_blank" rel="noreferrer" className="affiliate-btn">
                <span>Cek Harga Promo ↗</span>
              </a>
            </div>
          ))}
        </div>

        {/* Digital Product Banner */}
        <div className="digital-product-banner" id="template">
          <div className="digital-product-content">
            <h3>📊 Template Excel Pembukuan & Laporan Keuangan Toko</h3>
            <p>Kelola stok barang, laporan laba rugi otomatis, dan tracker komisi marketplace tanpa rumus rumit. Siap pakai di Excel & Google Sheets.</p>
            <div className="digital-features">
              <span>✓ Laporan Laba Rugi Otomatis</span>
              <span>✓ Rekap Stok & Penjualan</span>
              <span>✓ Tracker Potongan Komisi</span>
            </div>
          </div>
          <a
            href="./Template_Pembukuan_Toko_Marketplace_2026.xlsx"
            download="Template_Pembukuan_Toko_Marketplace_2026.xlsx"
            className="digital-action-btn"
          >
            📥 Download Template Excel (Gratis)
          </a>
        </div>

        {/* Sponsorship / Partner Banner Slot */}
        <div className="sponsor-banner">
          <div className="sponsor-info">
            <h4>📢 Slot Iklan & Partner Seller (Ekspedisi / Supplier / ERP)</h4>
            <p>Tampilkan brand ekspedisi, supplier, atau software bisnis Anda di hadapan ribuan seller marketplace aktif setiap harinya.</p>
          </div>
          <button type="button" className="sponsor-btn" onClick={triggerSponsorContact}>
            Hubungi Kerjasama ✉️
          </button>
        </div>
      </section>

      <section className="method shell" id="cara-hitung">
        <div>
          <p className="step">Cara hitung</p>
          <h2>Bukan sekadar menambah persentase ke HPP</h2>
        </div>
        <p>
          Kalkulator mencari harga terendah yang membuat uang bersih setelah
          diskon dan semua biaya komisi marketplace ({activePlatform.name}) mencapai target yang dipilih: profit atau saldo
          bersih diterima. Batas maksimal program gratis ongkir juga dihitung, sehingga
          rumus tetap bekerja untuk produk murah maupun mahal.
        </p>
        <div className="formula">
          <span>Harga transaksi</span>
          <b>−</b>
          <span>Potongan Marketplace</span>
          <b>−</b>
          <span>Seluruh modal</span>
          <b>=</b>
          <span>Target pilihan</span>
        </div>
      </section>

      <section className="sources shell" id="sumber">
        <div className="sources-heading">
          <div>
            <p className="step">Sumber aturan</p>
            <h2>Aturan {activePlatform.name}</h2>
          </div>
          <p>
            Marketplace dapat mengubah tarif berdasarkan kategori, status toko, dan
            program. Cocokkan angka dengan Seller Centre {activePlatform.name} sebelum menetapkan harga.
          </p>
        </div>
        <div className="source-grid">
          {activePlatform.sources.map((src, idx) => (
            <a key={idx} href={src.url} target="_blank" rel="noreferrer">
              <span>{String(idx + 1).padStart(2, "0")}</span>
              <div>
                <b>{src.title}</b>
                <small>{src.desc}</small>
              </div>
              <i>↗</i>
            </a>
          ))}
        </div>
        <p className="disclaimer">
          Kalkulator independen, bukan produk resmi Shopee, Tokopedia, atau TikTok Shop.
          Hasil merupakan estimasi dan tidak menggantikan rincian penghasilan di Seller Centre masing-masing.
        </p>
      </section>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="toast-notice">
          {toastMessage}
        </div>
      )}

      <footer className="shell">
        <a className="brand compact" href="#kalkulator">
          <span className="brand-icon" aria-hidden="true"><b>+</b><b>−</b><b>×</b><b>=</b></span>
          <span>Hitung<span>.Jual</span></span>
        </a>
        <p>Dibuat supaya seller tidak lagi untung di omzet, rugi di saldo.</p>
      </footer>
    </main>
  );
}
