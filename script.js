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

const chartCanvas =
  document.getElementById("expenseChart");

// FILTER BUTTONS
const filterButtons =
  document.querySelectorAll(".filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) =>
      b.classList.remove("active")
    );

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

// RESTORE DARK MODE
if (
  localStorage.getItem("darkMode") === "true"
) {
  document.body.classList.add("dark");
}

// DATA
let transactions =
  JSON.parse(
    localStorage.getItem("transactions")
  ) || [];

let editId = null;

let chart;

// SAVE
function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
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
      datasets: [{
        data: [incomeData, expenseData]
      }]
    }
  });
}

// RENDER
function renderTransactions() {
  list.innerHTML = "";

  let filtered = [...transactions].reverse();

  if (currentFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.type === currentFilter
    );
  }

  if (search) {
    const searchValue =
      search.value.toLowerCase();

    filtered = filtered.filter((t) =>
      t.title
        .toLowerCase()
        .includes(searchValue)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <p class="empty">No transactions found</p>
    `;
    updateBalance();
    renderChart();
    return;
  }

  filtered.forEach((transaction) => {
    const li = document.createElement("li");

    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>
        ${transaction.category}
        ${transaction.title}
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
}

// DELETE
function deleteTransaction(id) {
  const confirmDelete = confirm("Delete this transaction?");
  if (!confirmDelete) return;

  transactions = transactions.filter(
    (t) => t.id !== id
  );

  saveTransactions();
  renderTransactions();
}

// EDIT
function editTransaction(id) {
  const transaction =
    transactions.find((t) => t.id === id);

  if (!transaction) return;

  title.value = transaction.title;
  amount.value = transaction.amount;
  type.value = transaction.type;
  date.value = transaction.date;
  category.value = transaction.category;

  editId = id;

  form.querySelector("button").textContent =
    "Update Transaction";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amt = Number(amount.value);

  if (!amt || amt <= 0) {
    alert("Enter valid amount");
    return;
  }

  const transaction = {
    id: editId === null ? Date.now() : editId,
    title: title.value || category.value,
    amount: amt,
    type: type.value,
    date: date.value || new Date().toLocaleDateString(),
    category: category.value
  };

  if (editId === null) {
    transactions.push(transaction);
  } else {
    transactions = transactions.map((t) =>
      t.id === editId ? transaction : t
    );

    editId = null;
    form.querySelector("button").textContent =
      "Add Transaction";
  }

  saveTransactions();
  renderTransactions();
  form.reset();
});

// SEARCH
if (search) {
  search.addEventListener("input", renderTransactions);
}

// INIT
renderTransactions();

form.querySelector("button").textContent =
  "Add Transaction";
