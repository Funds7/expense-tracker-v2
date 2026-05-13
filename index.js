let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

/* ================= DASHBOARD ================= */
function updateDashboard() {
  let inc = 0;
  let exp = 0;

  transactions.forEach(t => {
    if (t.type === "income") {
      inc += Number(t.amount);
    } else {
      exp += Number(t.amount);
    }
  });

  if (balance) balance.textContent = `₦${inc - exp}`;
  if (income) income.textContent = `₦${inc}`;
  if (expense) expense.textContent = `₦${exp}`;
}

/* ================= RENDER LIST ================= */
function renderList() {
function renderList() {
  if (!list) return;

  list.innerHTML = "";

  transactions.slice().reverse().forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <b>${t.category}</b> ${t.title} - ₦${t.amount}
        <br>
        <small>${t.date}</small>
      </div>

      <div style="margin-top:5px;">
        <button class="edit-btn" data-id="${t.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${t.id}">🗑️ Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}
/* ================= EDIT ================= */
function editTransaction(id) {
  localStorage.setItem("editId", id);
  window.location.href = "add.html";
}

/* IMPORTANT: make function clickable from HTML */
window.editTransaction = editTransaction;

/* ================= DELETE ================= */
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  refresh();
}

/* ================= REFRESH ================= */
function refresh() {
  updateDashboard();
  renderList();
}

/* ================= INIT ================= */
refresh();
