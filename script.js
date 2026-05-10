let currentFilter = "all";

// DOM
const form = document.getElementById("transaction-form");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const search = document.getElementById("search");
const toggle = document.getElementById("darkToggle");

const chartCanvas = document.getElementById("expenseChart");

// DATA
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;
let chart = null;

// FILTER BUTTONS
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentFilter = btn.dataset.filter;

    renderTransactions();
  });
});

// DARK MODE
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// SAVE
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// BALANCE
function updateBalance() {
  let total = 0, inc = 0, exp = 0;

  transactions.forEach(t => {
    if (t.type === "income") {
      total += t.amount;
      inc += t.amount;
    } else {
      total -= t.amount;
      exp += t.amount;
    }
  });

  balance.textContent = `₦${total}`;
  income.textContent = `₦${inc}`;
  expense.textContent = `₦${exp}`;
}

// CHART
function renderChart() {
  const inc = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const exp = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [inc, exp] }]
    }
  });
}

// RENDER
function renderTransactions() {
  list.innerHTML = "";

  let filtered = [...transactions].reverse();

  if (currentFilter !== "all") {
    filtered = filtered.filter(t => t.type === currentFilter);
  }

  if (search?.value) {
    const q = search.value.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty">No transactions found</p>`;
  } else {
    filtered.forEach(t => {
      const li = document.createElement("li");
      li.classList.add(t.type);

      li.innerHTML = `
        <span>
          ${t.category} ${t.title} - ₦${t.amount}
          <small>(${t.date})</small>
        </span>
        <div class="actions">
          <button class="edit-btn" onclick="edit(${t.id})">Edit</button>
          <button class="delete-btn" onclick="remove(${t.id})">X</button>
        </div>
      `;

      list.appendChild(li);
    });
  }

  updateBalance();
  renderChart();
  updateMonthlyReport();
  updateWeeklyReport();
}

// DELETE
function remove(id) {
  if (!confirm("Delete this transaction?")) return;
  transactions = transactions.filter(t => t.id !== id);
  save();
  renderTransactions();
}

// EDIT
function edit(id) {
  const t = transactions.find(t => t.id === id);
  if (!t) return;

  title.value = t.title;
  amount.value = t.amount;
  type.value = t.type;
  category.value = t.category;
  date.value = t.date;

  editId = id;
  form.querySelector("button").textContent = "Update Transaction";
}

// ADD / UPDATE
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amt = Number(amount.value);
  if (!amt || amt <= 0) return alert("Invalid amount");

  const transaction = {
    id: editId ?? Date.now(),
    title: title.value || category.value,
    amount: amt,
    type: type.value,
    category: category.value,
    date: date.value || new Date().toISOString().split("T")[0]
  };

  if (editId === null) {
    transactions.push(transaction);
  } else {
    transactions = transactions.map(t =>
      t.id === editId ? transaction : t
    );
    editId = null;
    form.querySelector("button").textContent = "Add Transaction";
  }

  save();
  renderTransactions();
  form.reset();
});

// SEARCH
search?.addEventListener("input", renderTransactions);

// MONTHLY REPORT
function updateMonthlyReport() {
  const now = new Date();

  const monthly = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  });

  let inc = 0, exp = 0, big = 0;

  monthly.forEach(t => {
    if (t.type === "income") inc += t.amount;
    else {
      exp += t.amount;
      if (t.amount > big) big = t.amount;
    }
  });

  const net = inc - exp;

  set("m-income", inc);
  set("m-expense", exp);
  set("m-net", net);
  set("m-count", monthly.length);
  set("m-biggest", big);
}

// WEEKLY REPORT
function updateWeeklyReport() {
  const now = new Date();

  const weekly = transactions.filter(t => {
    const d = new Date(t.date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  let inc = 0, exp = 0, big = 0;

  weekly.forEach(t => {
    if (t.type === "income") inc += t.amount;
    else {
      exp += t.amount;
      if (t.amount > big) big = t.amount;
    }
  });

  const net = inc - exp;

  set("w-income", inc);
  set("w-expense", exp);
  set("w-net", net);
  set("w-count", weekly.length);
  set("w-biggest", big);
}

// HELPER
function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = `₦${value}`;
}

// INIT
renderTransactions();
