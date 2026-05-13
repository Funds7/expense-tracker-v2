let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

function updateDashboard() {
  let inc = 0;
  let exp = 0;

  transactions.forEach(t => {
    if (t.type === "income") inc += t.amount;
    else exp += t.amount;
  });

  if (balance) balance.textContent = `₦${inc - exp}`;
  if (income) income.textContent = `₦${inc}`;
  if (expense) expense.textContent = `₦${exp}`;
}

function renderList() {
  if (!list) return;

  list.innerHTML = "";

  transactions.slice().reverse().forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b>${t.category}</b> ${t.title} - ₦${t.amount}
      <small>${t.date}</small>
    `;

    list.appendChild(li);
  });
}

function init() {
  updateDashboard();
  renderList();
}

init();
