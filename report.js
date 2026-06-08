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

  // FILTERS
  const monthly = transactions.filter(isThisMonth);
  const weekly = transactions.filter(isThisWeek);

  // MONTHLY CALC
  let mIncome = 0, mExpense = 0;
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

  // WEEKLY CALC (FIXED)
  let wIncome = 0, wExpense = 0;

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

  // SAFE SET FUNCTION
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

  // WEEKLY UI (NOW FIXED)
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
