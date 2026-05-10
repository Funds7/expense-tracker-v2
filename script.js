let currentFilter = "all";

// DOM
const date = document.getElementById("date");
const form = document.getElementById("transaction-form");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const toggle = document.getElementById("darkToggle");
const search = document.getElementById("search");
const chartCanvas = document.getElementById("expenseChart");

// FILTER BUTTONS
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTransactions();
  });
});

// DARK MODE
if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark")
    );
  });
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// DATA
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;
let chart;

// SAVE
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// BALANCE
function updateBalance() {
  let total = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      total += t.amount;
      incomeTotal += t.amount;
    } else {
      total -= t.amount;
      expenseTotal += t.amount;
    }
  });

  balance.textContent = `₦${total}`;
  income.textContent = `₦${incomeTotal}`;
  expense.textContent = `₦${expenseTotal}`;
}

// CHART
function renderChart() {
  const incomeData = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [incomeData, expenseData] }]
    }
  });
}

// RENDER
function renderTransactions() {
  list.innerHTML = "";

  let filtered = [...transactions].reverse();

  if (currentFilter !== "all") {
    filtered = filtered.filter((t) => t.type === currentFilter);
  }

  if (search) {
    const searchValue = search.value.toLowerCase();
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchValue)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty">No transactions found</p>`;
    updateBalance();
    renderChart();
    updateMonthlyReport();
    updateWeeklyReport();
    return;
  }

  filtered.forEach((transaction) => {
    const li = document.createElement("li");
    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>
        ${transaction.category} ${transaction.title}
        - ₦${transaction.amount}
        <small>(${transaction.date})</small>
      </span>

      <div class="actions">
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateBalance();
  renderChart();
  updateMonthlyReport();
  updateWeeklyReport();
}

// DELETE
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderTransactions();
}

// EDIT
function editTransaction(id) {
  const t = transactions.find((t) => t.id === id);
  if (!t) return;

  title.value = t.title;
  amount.value = t.amount;
  type.value = t.type;
  date.value = t.date;
  category.value = t.category;

  editId = id;
  form.querySelector("button").textContent = "Update Transaction";
}

// ADD / UPDATE
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amt = Number(amount.value);
  if (!amt || amt <= 0) return alert("Enter valid amount");

  const transaction = {
    id: editId ?? Date.now(),
    title: title.value || category.value,
    amount: amt,
    type: type.value,
    date: date.value || new Date().toISOString().split("T")[0],
    category: category.value
  };

  if (editId === null) {
    transactions.push(transaction);
  } else {
    transactions = transactions.map((t) =>
      t.id === editId ? transaction : t
    );
    editId = null;
    form.querySelector("button").textContent = "Add Transaction";
  }

  saveTransactions();
  renderTransactions();
  form.reset();
});

// SEARCH
if (search) {
  search.addEventListener("input", renderTransactions);
}

// MONTHLY REPORT
function updateMonthlyReport() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthly = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  let incomeTotal = 0;
  let expenseTotal = 0;
  let biggestExpense = 0;

  monthly.forEach((t) => {
    if (t.type === "income") {
      incomeTotal += t.amount;
    } else {
      expenseTotal += t.amount;
      if (t.amount > biggestExpense) biggestExpense = t.amount;
    }
  });

  const net = incomeTotal - expenseTotal;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${value}`;
  };

  set("m-income", incomeTotal);
  set("m-expense", expenseTotal);
  set("m-net", net);
  set("m-count", monthly.length);
  set("m-biggest", biggestExpense);
}

// WEEKLY REPORT (FIXED)
function updateWeeklyReport() {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 7);

  const weekly = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= now;
  });

  let incomeTotal = 0;
  let expenseTotal = 0;
  let biggestExpense = 0;

  weekly.forEach((t) => {
    if (t.type === "income") {
      incomeTotal += t.amount;
    } else {
      expenseTotal += t.amount;
      if (t.amount > biggestExpense) biggestExpense = t.amount;
    }
  });

  const net = incomeTotal - expenseTotal;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${value}`;
  };

  set("w-income", incomeTotal);
  set("w-expense", expenseTotal);
  set("w-net", net);
  set("w-count", weekly.length);
  set("w-biggest", biggestExpense);
}

// INIT (IMPORTANT)
renderTransactions();
updateMonthlyReport();
updateWeeklyReport();

form.querySelector("button").textContent = "Add Transaction";
