let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let chart; // chart instance

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

  /* ================= BUDGET WARNING ================= */
  const budget = Number(localStorage.getItem("monthlyBudget")) || 0;
  const warningBox = document.getElementById("budget-warning");

  if (warningBox && budget > 0) {
    if (exp >= budget) {
      warningBox.textContent = "⚠️ Budget exceeded!";
      warningBox.style.color = "red";
    } 
    else if (exp >= budget * 0.8) {
      warningBox.textContent = "⚠️ You are close to your budget limit!";
      warningBox.style.color = "orange";
    } 
    else {
      warningBox.textContent = "";
    }
  }
}
/* ================= CHART ================= */
function updateChart() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach(t => {
    if (t.type === "income") {
      incomeTotal += Number(t.amount);
    } else {
      expenseTotal += Number(t.amount);
    }
  });

  const canvas = document.getElementById("expenseChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [incomeTotal, expenseTotal],
        backgroundColor: ["#16a34a", "#dc2626"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* ================= RENDER LIST ================= */
function renderList() {
  if (!list) return;

  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = `<p class="empty">No transactions yet 💰</p>`;
    return;
  }

  transactions.slice().reverse().forEach(t => {
    const li = document.createElement("li");

    li.classList.add(t.type); // income / expense styling

    li.innerHTML = `
      <div>
        <b>${t.category}</b> ${t.title} - ₦${t.amount}
        <br>
        <small>${t.date}</small>
      </div>

      <div class="actions">
        <button class="edit-btn" data-id="${t.id}">✏️</button>
        <button class="delete-btn" data-id="${t.id}">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  });
}

/* ================= CLICK HANDLER ================= */
document.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    localStorage.setItem("editId", id);
    window.location.href = "add.html";
  }

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);

    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    refresh();
  }
});

/* ================= REFRESH ================= */
function refresh() {
  updateDashboard();
  renderList();
  updateChart();
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  refresh();

  // hide splash screen after loading
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
    }, 1500);
  }
});
