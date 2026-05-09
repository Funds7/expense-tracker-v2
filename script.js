let currentFilter = "all";

// DOM
const date = document.getElementById("date");
const form = document.getElementById("transaction-form");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const toggle = document.getElementById("darkToggle");
const search = document.getElementById("search");

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

// RESTORE DARK MODE
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// DATA
let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;

// SAVE
function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

// EMOJI SYSTEM
function getEmoji(title) {
  const text = title.toLowerCase();

  if (text.includes("food")) return "🍔";
  if (text.includes("salary")) return "💰";
  if (text.includes("transport")) return "🚗";
  if (text.includes("drive")) return "🚗";
  if (text.includes("shop")) return "🛒";
  if (text.includes("data")) return "📶";

  return "📌";
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

// RENDER
function renderTransactions() {
  list.innerHTML = "";

  let filtered = transactions;

  // FILTER TYPE
  if (currentFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.type === currentFilter
    );
  }

  // SEARCH
  if (search) {
    const searchValue =
      search.value.toLowerCase();

    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchValue)
    );
  }

  // EMPTY STATE
  if (filtered.length === 0) {
    list.innerHTML = `
      <p class="empty">
        No transactions found
      </p>
    `;

    updateBalance();

    return;
  }

  filtered.forEach((transaction) => {
    const li = document.createElement("li");

    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>
        ${getEmoji(transaction.title)}
        ${transaction.title}
        - ₦${transaction.amount}

        <small>
          (${transaction.date})
        </small>
      </span>

      <div class="actions">
        <button onclick="editTransaction(${transaction.id})">
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteTransaction(${transaction.id})"
        >
          X
        </button>
      </div>
    `;

    list.appendChild(li);
  });

  updateBalance();
}

// DELETE
function deleteTransaction(id) {
  const confirmDelete = confirm(
    "Delete this transaction?"
  );

  if (!confirmDelete) return;

  transactions = transactions.filter(
    (t) => t.id !== id
  );

  saveTransactions();

  renderTransactions();
}

// EDIT
function editTransaction(id) {
  const transaction = transactions.find(
    (t) => t.id === id
  );

  if (!transaction) return;

  title.value = transaction.title;
  amount.value = transaction.amount;
  type.value = transaction.type;
  date.value = transaction.date;

  editId = id;

  form.querySelector("button").textContent =
    "Update Transaction";
}

// SUBMIT
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // VALIDATION
  if (
    title.value.trim() === "" ||
    amount.value.trim() === ""
  ) {
    alert("Please fill all fields");

    return;
  }

  const newTransaction = {
    id: editId ? editId : Date.now(),
    title: title.value.trim(),
    amount: Number(amount.value),
    type: type.value,
    date: date.value
  };

  // ADD
  if (editId === null) {
    transactions.push(newTransaction);
  }

  // UPDATE
  else {
    transactions = transactions.map((t) =>
      t.id === editId ? newTransaction : t
    );

    editId = null;

    form.querySelector("button").textContent =
      "Add Transaction";
  }

  saveTransactions();

  renderTransactions();

  form.reset();
});

// SEARCH LISTENER
if (search) {
  search.addEventListener(
    "input",
    renderTransactions
  );
}

// INIT
renderTransactions();

form.querySelector("button").textContent =
  "Add Transaction";
