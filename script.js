localStorage.clear();
const form = document.getElementById("transaction-form");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const list = document.getElementById("list");
const balance = document.getElementById("balance");

const income = document.getElementById("income");
const expense = document.getElementById("expense");

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

function updateBalance() {

  let total = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach((transaction) => {

    if (transaction.type === "income") {

      total += transaction.amount;
      incomeTotal += transaction.amount;

    } else {

      total -= transaction.amount;
      expenseTotal += transaction.amount;
    }

  });

  balance.textContent = `₦${total}`;
  income.textContent = `₦${incomeTotal}`;
  expense.textContent = `₦${expenseTotal}`;
}

function renderTransactions() {
  list.innerHTML = "";

  transactions.forEach((transaction, index) => {

    const li = document.createElement("li");

    li.classList.add(transaction.type);

    li.innerHTML = `
      <span>
        ${transaction.title} - ₦${transaction.amount}
      </span>

      <button class="delete-btn" onclick="deleteTransaction(${index})">
        X
      </button>
    `;

    list.appendChild(li);
  });

  updateBalance();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);

  saveTransactions();
  renderTransactions();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTransaction = {
    title: title.value,
    amount: Number(amount.value),
    type: type.value
  };

  transactions.push(newTransaction);

  saveTransactions();

  renderTransactions();

  form.reset();
});

renderTransactions();
