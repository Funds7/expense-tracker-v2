let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart = null;
let editId = null;

// ================= SAVE =================
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ================= ELEMENT CHECKS =================
const form = document.getElementById("transaction-form");
const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const chartCanvas = document.getElementById("expenseChart");

// ================= DARK MODE =================
const toggle = document.getElementById("darkToggle");

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

// ================= BALANCE =================
function updateBalance() {
  if (!balance) return;

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

// ================= DELETE =================
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);

  save();
  renderTransactions();
}

// ================= EDIT =================
function editTransaction(id) {
  const transaction = transactions.find(
    t => t.id === id
  );

  if (!transaction) return;

  document.getElementById("title").value =
    transaction.title;

  document.getElementById("amount").value =
    transaction.amount;

  document.getElementById("type").value =
    transaction.type;

  document.getElementById("category").value =
    transaction.category;

  document.getElementById("date").value =
    transaction.date;

  editId = id;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ================= RENDER LIST =================
function renderTransactions() {
  if (!list) return;

  list.innerHTML = "";

  transactions.slice().reverse().forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        ${t.category} ${t.title} - ₦${t.amount}
        <br>
        <small>${t.date}</small>
      </div>

      <div class="actions">
        <button onclick="editTransaction(${t.id})">
          Edit
        </button>

        <button onclick="deleteTransaction(${t.id})">
          X
        </button>
      </div>
    `;

    list.appendChild(li);
  });

  updateBalance();
  renderChart();
  updateReports();
}

// ================= CHART =================
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
    type: "pie",

    data: {
      labels: ["Income", "Expense"],

      datasets: [
        {
          data: [inc, exp]
        }
      ]
    }
  });
}

// ================= REPORTS =================
function updateReports() {
  const set = (id, val) => {
    const el = document.getElementById(id);

    if (el) el.textContent = `₦${val}`;
  };

  const now = new Date();

  const monthly = transactions.filter(t => {
    const d = new Date(t.date + "T00:00:00");

    return d.getMonth() === now.getMonth();
  });

  const weekly = transactions.filter(t => {
    const d = new Date(t.date + "T00:00:00");

    const diff =
      (now - d) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= 7;
  });

  let mInc = 0;
  let mExp = 0;
  let wInc = 0;
  let wExp = 0;

  monthly.forEach(t => {
    if (t.type === "income") mInc += t.amount;
    else mExp += t.amount;
  });

  weekly.forEach(t => {
    if (t.type === "income") wInc += t.amount;
    else wExp += t.amount;
  });

  set("m-income", mInc);
  set("m-expense", mExp);
  set("m-net", mInc - mExp);
  set("m-count", monthly.length);

  set("w-income", wInc);
  set("w-expense", wExp);
  set("w-net", wInc - wExp);
  set("w-count", weekly.length);
}

// ================= FORM =================
if (form) {

  form.addEventListener("submit", e => {

    e.preventDefault();

    const title =
      document.getElementById("title");

    const amount =
      document.getElementById("amount");

    const type =
      document.getElementById("type");

    const category =
      document.getElementById("category");

    const date =
      document.getElementById("date");

    const transactionData = {
      id: editId || Date.now(),
      title: title.value.trim(),
      amount: Number(amount.value),
      type: type.value,
      category: category.value,
      date: date.value
    };

    // EDIT MODE
    if (editId) {

      transactions = transactions.map(t =>
        t.id === editId ? transactionData : t
      );

      editId = null;

    } else {

      // ADD MODE
      transactions.push(transactionData);
    }

    save();

    form.reset();

    renderTransactions();
  });

}
// ================= INIT =================
renderTransactions();
