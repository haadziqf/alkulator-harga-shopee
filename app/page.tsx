"use client";

import { useMemo, useState } from "react";

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


type Inputs = {
  targetMode: "profit" | "net";
  targetNetRevenue: number;
  hpp: number;
  packing: number;
  operational: number;
  buffer: number;
  profitPercent: number;
  sellerDiscount: number;
  adminRate: number;
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
  targetMode: "profit",
  targetNetRevenue: 900000,
  hpp: 700000,
  packing: 20000,
  operational: 0,
  buffer: 0,
  profitPercent: 25,
  sellerDiscount: 0,
  adminRate: 10,
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
    admin + shipping + promo + affiliate + preorder + mallPayment;
  const productCosts =
    input.hpp + input.packing + input.operational + input.buffer;
  const netRevenue = transactionBase - variableFees - processOrder;
  const profit = netRevenue - productCosts;

  return {
    transactionBase,
    admin,
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
  const result = useMemo(() => solvePrice(input), [input]);
  const totalFees =
    result.variableFees +
    result.processOrder +
    result.sellerDiscountNominal;
  const feePercent = result.price ? (totalFees / result.price) * 100 : 0;

  const patch = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#kalkulator" aria-label="Hitung Jual">
          <span className="brand-icon" aria-hidden="true">
            <b>+</b><b>−</b><b>×</b><b>=</b>
          </span>
          <span>Hitung<span>.Jual</span></span>
        </a>
        <div className="nav-links">
          <a className="active" href="#kalkulator">Kalkulator</a>
          <a href="#cara-hitung">Cara hitung</a>
          <a href="#sumber">Sumber aturan</a>
        </div>
        <a className="checked-date" href="#sumber">
          <span aria-hidden="true">▣</span> Aturan diperiksa 27 Jul 2026
        </a>
      </nav>

      <section className="hero shell" id="kalkulator">
        <p className="eyebrow">Kalkulator harga jual Shopee Indonesia</p>
        <h1>Harga Jualnya Berapa?</h1>
        <p>Hitung harga jual tanpa nebak margin—sudah memperhitungkan potongan yang kamu pilih.</p>
      </section>

      <section className="calculator shell">
        <div className="input-card">
          <div className="card-heading">
            <div>
              <p className="step">Langkah 1</p>
              <h2>Masukkan angka</h2>
            </div>
            <button className="reset" onClick={() => setInput(initialInputs)}>
              Reset
            </button>
          </div>

          <div className="target-mode" aria-label="Pilih target perhitungan">
            <button
              className={input.targetMode === "profit" ? "active" : ""}
              onClick={() => patch("targetMode", "profit")}
              aria-pressed={input.targetMode === "profit"}
            >
              <span>Target profit</span>
              <small>Tentukan laba yang ingin didapat</small>
            </button>
            <button
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
                hint="Saldo setelah diskon dan biaya Shopee, sebelum dikurangi modal"
              />
            )}
            <MoneyInput
              label="Packing per produk"
              value={input.packing}
              onChange={(value) => patch("packing", value)}
            />
            <PercentInput
              label="Biaya admin kategori"
              value={input.adminRate}
              onChange={(value) => patch("adminRate", value)}
              hint="Cek tarif kategori produkmu di Seller Centre"
            />
          </div>

          <div className="program-box">
            <Toggle
              checked={input.shippingOn}
              onChange={(value) => patch("shippingOn", value)}
              label="Gratis Ongkir XTRA"
              description="Tarif dan batas maksimal berbeda menurut kategori"
            />
            {input.shippingOn && (
              <div className="program-fields">
                <PercentInput
                  label="Tarif Gratis Ongkir"
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
            className="advanced-button"
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
          >
            <span>Biaya lanjutan</span>
            <small>Affiliate, promo, pre-order, diskon, dan biaya operasional</small>
            <b>{showAdvanced ? "−" : "+"}</b>
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="input-grid">
                <PercentInput
                  label="Diskon/voucher seller"
                  value={input.sellerDiscount}
                  onChange={(value) => patch("sellerDiscount", value)}
                  hint="Tidak termasuk voucher yang ditanggung Shopee"
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
                  label="Promo XTRA"
                />
                {input.promoOn && (
                  <PercentInput
                    label="Tarif Promo XTRA"
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
                  label="Biaya pembayaran Shopee Mall"
                  description="Tambahan 1,8%; aktifkan hanya untuk toko Mall"
                />
              </div>
            </div>
          )}

          <p className="live-note"><span /> Hasil dihitung otomatis setiap angka berubah</p>
        </div>

        <aside className="result-card" aria-live="polite">
          <p className="step light">Rekomendasi</p>
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
            <summary>Lihat rincian potongan <span>⌄</span></summary>
            <div>
              {result.sellerDiscountNominal > 0 && <p><span>Diskon seller</span><b>{rupiah.format(result.sellerDiscountNominal)}</b></p>}
              <p><span>Biaya admin</span><b>{rupiah.format(result.admin)}</b></p>
              {result.shipping > 0 && <p><span>Gratis Ongkir XTRA</span><b>{rupiah.format(result.shipping)}</b></p>}
              {result.promo > 0 && <p><span>Promo XTRA</span><b>{rupiah.format(result.promo)}</b></p>}
              {result.affiliate > 0 && <p><span>Affiliate + PPN</span><b>{rupiah.format(result.affiliate)}</b></p>}
              {result.preorder > 0 && <p><span>Pre-order</span><b>{rupiah.format(result.preorder)}</b></p>}
              {result.mallPayment > 0 && <p><span>Pembayaran Mall</span><b>{rupiah.format(result.mallPayment)}</b></p>}
              <p><span>Proses pesanan per produk</span><b>{rupiah.format(result.processOrder)}</b></p>
            </div>
          </details>
          <p className="result-footnote">
            {input.targetMode === "profit"
              ? "Profit dihitung setelah HPP, packing, operasional, buffer, dan seluruh biaya aktif."
              : `Harga dihitung agar uang bersih minimal ${rupiah.format(input.targetNetRevenue)} setelah seluruh potongan aktif.`}
          </p>
        </aside>
      </section>

      <section className="method shell" id="cara-hitung">
        <div>
          <p className="step">Cara hitung</p>
          <h2>Bukan sekadar menambah persentase ke HPP</h2>
        </div>
        <p>
          Kalkulator mencari harga terendah yang membuat uang bersih setelah
          diskon dan semua biaya mencapai target yang dipilih: profit atau saldo
          bersih diterima. Batas maksimal Gratis Ongkir juga dihitung, sehingga
          rumus tetap bekerja untuk produk murah maupun mahal.
        </p>
        <div className="formula">
          <span>Harga transaksi</span>
          <b>−</b>
          <span>Potongan Shopee</span>
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
            <h2>Diperiksa 27 Juli 2026</h2>
          </div>
          <p>
            Shopee dapat mengubah tarif berdasarkan kategori, status toko, dan
            program. Cocokkan angka dengan Seller Centre sebelum menetapkan harga.
          </p>
        </div>
        <div className="source-grid">
          <a href="https://seller.shopee.co.id/edu/article/7187" target="_blank" rel="noreferrer">
            <span>01</span><div><b>Biaya Administrasi Penjual</b><small>Rumus dan tarif final berdasarkan kategori</small></div><i>↗</i>
          </a>
          <a href="https://seller.shopee.co.id/edu/article/15965" target="_blank" rel="noreferrer">
            <span>02</span><div><b>Rincian Biaya per Kategori</b><small>Daftar kategori dan persentase biaya</small></div><i>↗</i>
          </a>
          <a href="https://seller.shopee.co.id/edu/article/7216" target="_blank" rel="noreferrer">
            <span>03</span><div><b>Gratis Ongkir XTRA</b><small>Persentase kategori dan batas maksimal</small></div><i>↗</i>
          </a>
          <a href="https://seller.shopee.co.id/edu/article/16055" target="_blank" rel="noreferrer">
            <span>04</span><div><b>Biaya Jualan di Shopee</b><small>Biaya proses Rp1.250 per pesanan selesai</small></div><i>↗</i>
          </a>
          <a href="https://seller.shopee.co.id/edu/article/26517" target="_blank" rel="noreferrer">
            <span>05</span><div><b>Produk Pre-order</b><small>Biaya layanan 3% per kuantitas</small></div><i>↗</i>
          </a>
          <a href="https://help.shopee.co.id/portal/4/article/73983-SYARAT-DAN-KETENTUAN-PROGRAM-AFFILIATE-MARKETING-SOLUTION-%E2%80%93-PENJUAL-YANG-BERPARTISIPASI" target="_blank" rel="noreferrer">
            <span>06</span><div><b>Komisi Affiliate</b><small>Dasar komisi dan ketentuan PPN</small></div><i>↗</i>
          </a>
        </div>
        <p className="disclaimer">
          Kalkulator independen, bukan produk resmi atau bagian dari Shopee.
          Hasil merupakan estimasi dan tidak menggantikan rincian penghasilan di Seller Centre.
        </p>
      </section>

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
