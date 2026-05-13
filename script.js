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

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

/* ================= DEFAULT DATE ================= */
if (dateInput) {
  dateInput.value = new Date().toISOString().split("T")[0];
}

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

  let inc = 0;
  let exp = 0;

  transactions.forEach(t => {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  });

  balance.textContent = `₦${inc - exp}`;
  income.textContent = `₦${inc}`;
  expense.textContent = `₦${exp}`;
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

  titleInput.value = t.title;
  amountInput.value = t.amount;
  typeInput.value = t.type;
  categoryInput.value = t.category;
  dateInput.value = t.date;

  editId = id;

  if (submitBtn) submitBtn.textContent = "Update Transaction";
  if (status) status.textContent = "✏️ Editing mode active";

  window.scrollTo({ top: 0, behavior: "smooth" });
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
        <br>
        <small>${t.date}</small>
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

  const inc = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const exp = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [inc, exp],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ================= REPORTS (FIXED CORE) ================= */
function updateReports() {
  const data = JSON.parse(localStorage.getItem("transactions")) || [];

  const now = new Date();

  const monthly = data.filter(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return false;

    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  });

  const weekly = data.filter(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return false;

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
      title: titleInput.value,
      amount: Number(amountInput.value),
      type: typeInput.value,
      category: categoryInput.value,
      date: dateInput.value
    };

    if (editId) {
      transactions = transactions.map(t =>
        t.id === editId ? data : t
      );
      editId = null;
      if (submitBtn) submitBtn.textContent = "Add Transaction";
    } else {
      transactions.push(data);
    }

    save();
    renderTransactions();

    form.reset();
    if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }
  });
}

/* ================= GLOBAL ================= */
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;

/* ================= INIT ================= */
renderTransactions();

/* ================= SAFE AUTO REPORT LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  updateReports();
});
