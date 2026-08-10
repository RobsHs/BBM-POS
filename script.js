const products = [
  {
    id: "pertalite",
    name: "Pertalite",
    price: 10000,
  },
  {
    id: "pertamax",
    name: "Pertamax",
    price: 17000,
  },
  {
    id: "pertamax-turbo",
    name: "Pertamax Turbo",
    price: 13200,
  },
  {
    id: "solar",
    name: "Solar",
    price: 20000,
  },
  {
    id: "dexlite",
    name: "Dexlite",
    price: 13500,
  },
  {
    id: "pertamina-dex",
    name: "Pertamina Dex",
    price: 13800,
  },
];

let selectedProduct = null;
let paymentMethod = "Tunai";
let transactions = JSON.parse(localStorage.getItem("bbm_transactions")) || [];

const productGrid = document.getElementById("productGrid");
const priceList = document.getElementById("priceList");
const literInput = document.getElementById("literInput");
const cashInput = document.getElementById("cashInput");
const orderList = document.getElementById("orderList");
const pricePerLiter = document.getElementById("pricePerLiter");
const totalLiter = document.getElementById("totalLiter");
const grandTotal = document.getElementById("grandTotal");
const changeAmount = document.getElementById("changeAmount");
const transactionNumber = document.getElementById("transactionNumber");
const transactionTable = document.getElementById("transactionTable");
const toast = document.getElementById("toast");

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function generateTransactionNumber() {
  const date = new Date();

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  const count = transactions.length + 1;

  return `TRX-${y}${m}${d}-${String(count).padStart(4, "0")}`;
}

function updateTransactionNumber() {
  transactionNumber.textContent = generateTransactionNumber();
}

function renderProducts() {
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("button");

    card.className = "product-card";

    if (selectedProduct && selectedProduct.id === product.id) {
      card.classList.add("selected");
    }

    card.innerHTML = `
            <div class="product-icon">⛽</div>
            <h3>${product.name}</h3>
            <p>Harga per liter</p>
            <div class="product-price">
                ${rupiah(product.price)}
            </div>
        `;

    card.addEventListener("click", () => {
      selectedProduct = product;
      renderProducts();
      updateOrder();
    });

    productGrid.appendChild(card);
  });
}

function renderPrices() {
  priceList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");

    card.className = "price-card";

    card.innerHTML = `
            <div class="fuel">${product.name}</div>
            <div class="price">${rupiah(product.price)}</div>
            <small>per liter</small>
        `;

    priceList.appendChild(card);
  });
}

function updateOrder() {
  if (!selectedProduct) {
    orderList.innerHTML = `
            <div class="empty">
                <div>⛽</div>
                <p>Belum ada BBM</p>
                <small>Pilih produk untuk memulai transaksi</small>
            </div>
        `;

    pricePerLiter.textContent = "Rp 0";
    totalLiter.textContent = "0 L";
    grandTotal.textContent = "Rp 0";
    changeAmount.textContent = "Rp 0";

    return;
  }

  const liters = Number(literInput.value) || 0;

  const total = liters * selectedProduct.price;

  orderList.innerHTML = `
        <div class="order-item">
            <div>
                <strong>${selectedProduct.name}</strong>
                <small>
                    ${liters.toFixed(2)} Liter ×
                    ${rupiah(selectedProduct.price)}
                </small>
            </div>

            <div class="item-total">
                ${rupiah(total)}
            </div>
        </div>
    `;

  pricePerLiter.textContent = rupiah(selectedProduct.price);

  totalLiter.textContent = `${liters.toFixed(2)} L`;

  grandTotal.textContent = rupiah(total);

  calculateChange();
}

function calculateChange() {
  if (!selectedProduct) return;

  const liters = Number(literInput.value) || 0;

  const total = liters * selectedProduct.price;

  const cash = Number(cashInput.value) || 0;

  const change = cash - total;

  changeAmount.textContent = rupiah(Math.max(change, 0));

  if (change < 0 && paymentMethod === "Tunai") {
    changeAmount.style.color = "#e51b23";
  } else {
    changeAmount.style.color = "#168c4b";
  }
}

literInput.addEventListener("input", updateOrder);

cashInput.addEventListener("input", calculateChange);

document.querySelectorAll(".quick-liter").forEach((container) => {
  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      literInput.value = button.dataset.liter;

      updateOrder();
    });
  });
});

document.querySelectorAll(".payment-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".payment-btn")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");

    paymentMethod = button.dataset.method;

    document.getElementById("cashField").style.display =
      paymentMethod === "Tunai" ? "block" : "none";

    calculateChange();
  });
});

document.getElementById("clearCart").addEventListener("click", () => {
  selectedProduct = null;

  literInput.value = 1;

  cashInput.value = "";

  renderProducts();

  updateOrder();
});

document.getElementById("payButton").addEventListener("click", () => {
  if (!selectedProduct) {
    showToast("Pilih BBM terlebih dahulu");
    return;
  }

  const liters = Number(literInput.value);

  if (!liters || liters <= 0) {
    showToast("Jumlah liter tidak valid");
    return;
  }

  const total = liters * selectedProduct.price;

  const cash = Number(cashInput.value) || 0;

  if (paymentMethod === "Tunai" && cash < total) {
    showToast("Uang pembayaran kurang");
    return;
  }

  const now = new Date();

  const transaction = {
    id: generateTransactionNumber(),
    product: selectedProduct.name,
    liters,
    price: selectedProduct.price,
    total,
    payment: paymentMethod,
    cash: paymentMethod === "Tunai" ? cash : total,
    change: paymentMethod === "Tunai" ? cash - total : 0,
    time: now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: now.toLocaleDateString("id-ID"),
  };

  transactions.unshift(transaction);

  localStorage.setItem("bbm_transactions", JSON.stringify(transactions));

  showReceipt(transaction);

  selectedProduct = null;

  literInput.value = 1;
  cashInput.value = "";

  renderProducts();
  updateOrder();
  renderTransactions();
  updateTransactionNumber();
});

function showReceipt(transaction) {
  const receiptContent = document.getElementById("receiptContent");

  receiptContent.innerHTML = `
        <div class="receipt-info">

            <div class="receipt-row">
                <span>No. Transaksi</span>
                <strong>${transaction.id}</strong>
            </div>

            <div class="receipt-row">
                <span>Tanggal</span>
                <strong>${transaction.date}</strong>
            </div>

            <div class="receipt-row">
                <span>Waktu</span>
                <strong>${transaction.time}</strong>
            </div>

            <div class="receipt-row">
                <span>BBM</span>
                <strong>${transaction.product}</strong>
            </div>

            <div class="receipt-row">
                <span>Harga/Liter</span>
                <strong>${rupiah(transaction.price)}</strong>
            </div>

            <div class="receipt-row">
                <span>Volume</span>
                <strong>${transaction.liters.toFixed(2)} L</strong>
            </div>

            <div class="receipt-row receipt-total">
                <span>Total</span>
                <strong>${rupiah(transaction.total)}</strong>
            </div>

            <div class="receipt-row">
                <span>Pembayaran</span>
                <strong>${transaction.payment}</strong>
            </div>

            ${
              transaction.payment === "Tunai"
                ? `
                    <div class="receipt-row">
                        <span>Dibayar</span>
                        <strong>${rupiah(transaction.cash)}</strong>
                    </div>

                    <div class="receipt-row">
                        <span>Kembalian</span>
                        <strong>${rupiah(transaction.change)}</strong>
                    </div>
                `
                : ""
            }

        </div>
    `;

  document.getElementById("receiptModal").classList.add("show");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("receiptModal").classList.remove("show");
});

function renderTransactions() {
  if (!transactions.length) {
    transactionTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:#999">
                    Belum ada transaksi
                </td>
            </tr>
        `;

    return;
  }

  transactionTable.innerHTML = transactions
    .map(
      (transaction) => `
            <tr>
                <td>
                    <strong>${transaction.id}</strong>
                </td>

                <td>${transaction.product}</td>

                <td>${transaction.liters.toFixed(2)} L</td>

                <td>
                    <strong>${rupiah(transaction.total)}</strong>
                </td>

                <td>${transaction.payment}</td>

                <td>${transaction.time}</td>
            </tr>
        `,
    )
    .join("");
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;

    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));

    button.classList.add("active");

    document
      .querySelectorAll(".page")
      .forEach((section) => section.classList.remove("active"));

    document.getElementById(page).classList.add("active");

    const titles = {
      kasir: "Kasir",
      transaksi: "Transaksi",
      produk: "Harga BBM",
    };

    document.getElementById("pageTitle").textContent = titles[page];
  });
});

function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

document.getElementById("exportBtn").addEventListener("click", () => {
  if (!transactions.length) {
    showToast("Belum ada transaksi");
    return;
  }

  const headers = [
    "No Transaksi",
    "BBM",
    "Liter",
    "Harga/Liter",
    "Total",
    "Pembayaran",
    "Uang Dibayar",
    "Kembalian",
    "Tanggal",
    "Waktu",
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.product,
    t.liters,
    t.price,
    t.total,
    t.payment,
    t.cash,
    t.change,
    t.date,
    t.time,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `transaksi-bbm-${Date.now()}.csv`;

  link.click();

  URL.revokeObjectURL(url);
});

function updateDate() {
  const now = new Date();

  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

renderProducts();
renderPrices();
renderTransactions();
updateTransactionNumber();
updateDate();

document.getElementById("clearHistory").addEventListener("click", () => {
  if (!transactions.length) {
    showToast("Riwayat transaksi sudah kosong");
    return;
  }

  const confirmDelete = confirm("Hapus semua riwayat transaksi?");

  if (!confirmDelete) return;

  transactions = [];

  localStorage.removeItem("bbm_transactions");

  renderTransactions();
  updateTransactionNumber();

  showToast("Semua riwayat berhasil dihapus");
});
