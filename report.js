let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// ================= DATE FILTERS =================
function isThisMonth(t) {
  const d = new Date(t.date);
  const now = new Date();
  if (isNaN(d)) return false;

  return d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
}

function isThisWeek(t) {
  const d = new Date(t.date);
  if (isNaN(d)) return false;

  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);

  return diff >= 0 && diff <= 7;
}

// ================= AI ENGINE =================
function generateAIInsight(monthly, weekly, categoryMap, mExpense, budget) {

  let insights = [];

  // TOP CATEGORY
  let topCategory = "";
  let max = 0;

  for (let key in categoryMap) {
    if (categoryMap[key] > max) {
      max = categoryMap[key];
      topCategory = key;
    }
  }

  if (topCategory) {
    insights.push(`You spend most on ${topCategory} 📊`);
  }

  // SPENDING TREND
  let wExpense = 0;
  weekly.forEach(t => {
    if (t.type === "expense") wExpense += Number(t.amount);
  });

  if (wExpense > mExpense / 4) {
    insights.push("Your weekly spending is high 📈");
  } else {
    insights.push("Your spending is stable 💰");
  }

  // SAVINGS CHECK
  let income = 0;

  monthly.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
  });

  if (income > mExpense) {
    insights.push("Good job! You are saving money 💰");
  } else {
    insights.push("Warning: You are spending more than you earn ⚠️");
  }

  // BUDGET CHECK
  if (budget && mExpense > budget) {
    insights.push("You exceeded your monthly budget 🚨");
  }

  return insights.join(" | ");
}

// ================= MAIN REPORT =================
function updateReports() {

  const monthly = transactions.filter(isThisMonth);
  const weekly = transactions.filter(isThisWeek);

  let mIncome = 0, mExpense = 0;
  let wIncome = 0, wExpense = 0;
  let categoryMap = {};

  let biggestExpense = 0;

  // MONTHLY
  monthly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      mIncome += amt;
    } else {
      mExpense += amt;

      if (amt > biggestExpense) {
        biggestExpense = amt;
      }

      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += amt;
    }
  });

  // WEEKLY
  weekly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      wIncome += amt;
    } else {
      wExpense += amt;
    }
  });

  // SAFE UI SET
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  set("m-income", mIncome);
  set("m-expense", mExpense);
  set("m-net", mIncome - mExpense);
  set("m-count", monthly.length);
  set("m-biggest", biggestExpense);

  set("w-income", wIncome);
  set("w-expense", wExpense);
  set("w-net", wIncome - wExpense);
  set("w-count", weekly.length);
  set("w-biggest", wExpense);

  // ================= AI OUTPUT =================
  const ai = document.getElementById("ai-insight");
  const budget = Number(localStorage.getItem("monthlyBudget")) || 0;

  if (ai) {
    ai.textContent =
      monthly.length === 0
        ? "No data yet 📊"
        : generateAIInsight(monthly, weekly, categoryMap, mExpense, budget);
  }

  // ================= BUDGET WARNING =================
  const warn = document.getElementById("budget-warning");

  if (warn && budget > 0) {
    if (mExpense > budget) {
      warn.textContent = "⚠️ You exceeded your budget!";
      warn.style.color = "red";
    } else {
      warn.textContent = "✅ You are within budget";
      warn.style.color = "green";
    }
  }
}

// ================= RUN =================
document.addEventListener("DOMContentLoaded", updateReports);

// ================= PDF EXPORT (PRO FEATURE) =================
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("exportPDF");
  if (!btn) return;

  btn.addEventListener("click", () => {

    const isPro = localStorage.getItem("pro") === "true";

    if (!isPro) {
      alert("Upgrade to PRO to export PDF reports 💰");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === "income") income += Number(t.amount);
      else expense += Number(t.amount);
    });

    let net = income - expense;

    doc.setFontSize(16);
    doc.text("Expense Tracker Report", 10, 10);

    doc.setFontSize(12);
    doc.text("Income: ₦" + income, 10, 30);
    doc.text("Expense: ₦" + expense, 10, 40);
    doc.text("Net: ₦" + net, 10, 50);
    doc.text("Transactions: " + transactions.length, 10, 60);

    doc.save("expense-report.pdf");
  });

});