let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function getMonth(t) {
  const d = new Date(t.date);
  const now = new Date();
  if (isNaN(d)) return false;
  return d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
}

function updateReports() {

  const monthly = transactions.filter(getMonth);

  let income = 0;
  let expense = 0;

  let categoryMap = {};

  monthly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      income += amt;
    } else {
      expense += amt;

      // CATEGORY TRACKING
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += amt;
    }
  });

  // FIND TOP CATEGORY
  let topCategory = "";
  let max = 0;

  for (let key in categoryMap) {
    if (categoryMap[key] > max) {
      max = categoryMap[key];
      topCategory = key;
    }
  }

  // UPDATE UI
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  set("m-income", income);
  set("m-expense", expense);
  set("m-net", income - expense);
  set("m-count", monthly.length);

  // INSIGHTS (IMPORTANT)
  const insightBox = document.getElementById("insight");

  if (insightBox) {
    if (monthly.length === 0) {
      insightBox.textContent = "No data yet to analyze 📊";
    } else {
      insightBox.textContent =
        `You spend most on ${topCategory || "various categories"} 💡`;
    }
  }

  // CATEGORY BREAKDOWN (if you add later UI)
  console.log("Category Data:", categoryMap);
}

document.addEventListener("DOMContentLoaded", updateReports);
