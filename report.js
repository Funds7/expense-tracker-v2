let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function isThisMonth(t) {
  const d = new Date(t.date);
  const now = new Date();
  if (isNaN(d)) return false;

  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(t) {
  const d = new Date(t.date);
  if (isNaN(d)) return false;

  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);

  return diff <= 7;
}

function updateReports() {

  const monthly = transactions.filter(isThisMonth);
  const weekly = transactions.filter(isThisWeek);

  let mIncome = 0, mExpense = 0;
  let wIncome = 0, wExpense = 0;

  let categoryMap = {};

  // MONTHLY
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

  // WEEKLY
  weekly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      wIncome += amt;
    } else {
      wExpense += amt;
    }
  });

  // TOP CATEGORY
  let topCategory = "";
  let max = 0;

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

  // MONTHLY UI
  set("m-income", mIncome);
  set("m-expense", mExpense);
  set("m-net", mIncome - mExpense);
  set("m-count", monthly.length);
  set("m-biggest", max);

  // WEEKLY UI
  set("w-income", wIncome);
  set("w-expense", wExpense);
  set("w-net", wIncome - wExpense);
  set("w-count", weekly.length);
  set("w-biggest", wExpense);

  // INSIGHT
  const insight = document.getElementById("insight");
  if (insight) {
    insight.textContent =
      monthly.length === 0
        ? "No data yet 📊"
        : `You spend most on ${topCategory || "various categories"} 💡`;
  }
}

document.addEventListener("DOMContentLoaded", updateReports);



// ================================
// 📤 PDF EXPORT (PRO FEATURE)
// ================================
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("exportPDF");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault(); // 🛑 STOP ANY DEFAULT BEHAVIOR

    const isPro = localStorage.getItem("pro") === "true";

    if (!isPro) {
      alert("Upgrade to PRO to export PDF reports 💰");
      return; // 🛑 HARD STOP (VERY IMPORTANT)
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
    doc.text("Total Income: ₦" + income, 10, 30);
    doc.text("Total Expense: ₦" + expense, 10, 40);
    doc.text("Net Balance: ₦" + net, 10, 50);
    doc.text("Total Transactions: " + transactions.length, 10, 60);

    doc.save("expense-report.pdf");
  });

});