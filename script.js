let currentFilter = "all";

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTransactions();
  });
});

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

// DATA
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;

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

// RENDER
function renderTransactions() {
  list.innerHTML = "";

  let filtered = transactions;

  if (currentFilter !== "all") {
    filtered = transactions.filter(t => t.type === currentFilter);
  }

  filtered.forEach((transaction) => {
    const li = document.createElement("li");

    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>
        ${transaction.title} - ₦${transaction.amount}
        <small>(${transaction.date})</small>
      </span>

      <div>
        <button onclick="editTransaction(${transaction.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateBalance();
}

// DELETE
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);

  saveTransactions();
  renderTransactions();
}

// EDIT
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);

  title.value = transaction.title;
  amount.value = transaction.amount;
  type.value = transaction.type;
  date.value = transaction.date;

  editId = id;

  form.querySelector("button").textContent = "Update Transaction";
}

// SUBMIT
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTransaction = {
    id: editId ? editId : Date.now(),
    title: title.value,
    amount: Number(amount.value),
    type: type.value,
    date: date.value
  };

  if (editId === null) {
    transactions.push(newTransaction);
  } else {
    transactions = transactions.map(t =>
      t.id === editId ? newTransaction : t
    );

    editId = null;
    form.querySelector("button").textContent = "Add Transaction";
  }

  saveTransactions();
  renderTransactions();
  form.reset();
});

// INIT
renderTransactions();
