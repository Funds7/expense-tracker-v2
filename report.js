let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

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

  return diff <= 7;
}

// ================= AI ENGINE =================
function generateAIInsight(monthly, weekly, categoryMap) {

  let insights = [];

  let topCategory = "";
  let max = 0;

  for (let key in categoryMap) {
    if (categoryMap[key] > max) {
      max = categoryMap[key];
      topCategory = key;
    }
  }

  if (topCategory) {
    insights.push(`You spend most on ${topCategory}`);
  }

  let mExpense = 0;
  monthly.forEach(t => {
    if (t.type === "expense") mExpense += Number(t.amount);
  });

  let wExpense = 0;
  weekly.forEach(t => {
    if (t.type === "expense") wExpense += Number(t.amount);
  });

  if (wExpense > mExpense / 4) {
    insights.push("Your weekly spending is high 📈");
  } else {
    insights.push("Your spending is stable 💰");
  }

  let income = 0;
  let expense = 0;

  monthly.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  if (income > expense) {
    insights.push("Good job! You are saving money 💰");
  } else {
    insights.push("Warning: Spending more than income ⚠️");
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

  monthly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      mIncome += amt;
    } else {
      mExpense += amt;

      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += amt;
    }
  });

  weekly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      wIncome += amt;
    } else {
      wExpense += amt;
    }
  });

  let max = 0;
  let topCategory = "";

  for (let key in categoryMap) {
    if (categoryMap[key] > max) {
      max = categoryMap[key];
      topCategory = key;
    }
  }

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  set("m-income", mIncome);
  set("m-expense", mExpense);
  set("m-net", mIncome - mExpense);
  set("m-count", monthly.length);
  set("m-biggest", max);

  set("w-income", wIncome);
  set("w-expense", wExpense);
  set("w-net", wIncome - wExpense);
  set("w-count", weekly.length);
  set("w-biggest", wExpense);

  // AI OUTPUT FIXED
  const ai = document.getElementById("ai-insight");
  if (ai) {
    ai.textContent = monthly.length === 0
      ? "No data yet 📊"
      : generateAIInsight(monthly, weekly, categoryMap);
  }
}

document.addEventListener("DOMContentLoaded", updateReports);

// ================= PDF EXPORT =================
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