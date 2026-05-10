let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart = null;
let editId = null;

/* ================= SAVE ================= */
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* ================= ELEMENTS ================= */
const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const chartCanvas = document.getElementById("expenseChart");
const submitBtn = document.getElementById("submit-btn");
const status = document.getElementById("edit-status");

/* ================= DARK MODE ================= */
const toggle = document.getElementById("darkToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* ================= BALANCE ================= */
function updateBalance() {
  if (!balance || !income || !expense) return;

  let inc = 0, exp = 0;

  transactions.forEach(t => {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  });

  balance.textContent = `₦${inc - exp}`;
  income.textContent = `₦${inc}`;
  expense.textContent = `₦${exp}`;

  const warning = document.getElementById("budget-warning");
  if (!warning) return;

  if (exp > inc) {
    warning.textContent = "⚠️ Overspending!";
    warning.style.color = "red";
  } else if (exp > inc * 0.7) {
    warning.textContent = "⚠️ Near limit";
    warning.style.color = "orange";
  } else {
    warning.textContent = "✅ Healthy budget";
    warning.style.color = "limegreen";
  }
}

/* ================= DELETE ================= */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  renderTransactions();
}

/* ================= EDIT ================= */
function editTransaction(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;

  const titleEl = document.getElementById("title");
  const amountEl = document.getElementById("amount");
  const typeEl = document.getElementById("type");
  const categoryEl = document.getElementById("category");
  const dateEl = document.getElementById("date");

  if (titleEl) titleEl.value = t.title;
  if (amountEl) amountEl.value = t.amount;
  if (typeEl) typeEl.value = t.type;
  if (categoryEl) categoryEl.value = t.category;
  if (dateEl) dateEl.value = t.date;

  editId = id;

  if (submitBtn) submitBtn.textContent = "Update Transaction";
  if (status) status.textContent = "✏️ Editing mode active";
}

/* ================= RENDER ================= */
function renderTransactions() {
  if (!list) return;

  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = `<p class="empty">No transactions yet</p>`;
  }

  transactions.slice().reverse().forEach(t => {
    const li = document.createElement("li");
    li.className = t.type;

    li.innerHTML = `
      <div>
        <b>${t.category}</b> ${t.title} - ₦${t.amount}
        <br><small>${t.date}</small>
      </div>

      <div class="actions">
        <button onclick="editTransaction(${t.id})">Edit</button>
        <button onclick="deleteTransaction(${t.id})">X</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateBalance();
  renderChart();
  updateReports();
}

/* ================= CHART ================= */
function renderChart() {
  if (!chartCanvas) return;

  const inc = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const exp = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "doughnut",

    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [inc, exp],
        backgroundColor: [
          "#22c55e",
          "#ef4444"
        ],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },

    options: {
      responsive: true,
      cutout: "70%",

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

/* ================= REPORTS ================= */
function updateReports() {
  const now = new Date();

  const monthly = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  });

  const weekly = transactions.filter(t => {
    const d = new Date(t.date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  let mInc = 0, mExp = 0, wInc = 0, wExp = 0;

  monthly.forEach(t => {
    if (t.type === "income") mInc += t.amount;
    else mExp += t.amount;
  });

  weekly.forEach(t => {
    if (t.type === "income") wInc += t.amount;
    else wExp += t.amount;
  });

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  set("m-income", mInc);
  set("m-expense", mExp);
  set("m-net", mInc - mExp);
  set("m-count", monthly.length);

  set("w-income", wInc);
  set("w-expense", wExp);
  set("w-net", wInc - wExp);
  set("w-count", weekly.length);
}

/* ================= FORM ================= */
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      id: editId || Date.now(),
      title: document.getElementById("title").value,
      amount: Number(document.getElementById("amount").value),
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      date: document.getElementById("date").value
    };

    if (editId) {
      transactions = transactions.map(t =>
        t.id === editId ? data : t
      );

      editId = null;

      if (submitBtn) submitBtn.textContent = "Add Transaction";
      if (status) status.textContent = "";
    } else {
      transactions.push(data);
    }

    save();
    form.reset();
    renderTransactions();
  });
}

/* ================= INIT ================= */
renderTransactions();

/* ================= SPLASH ================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.style.display = "none";
  }, 2500);
});

/* ================= SERVICE WORKER ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.log("SW error:", err));
  });
}
