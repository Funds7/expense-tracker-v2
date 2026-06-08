let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateReports() {
  const now = new Date();

  let monthly = [];
  let weekly = [];

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return;

    // MONTH FILTER
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      monthly.push(t);
    }

    // WEEK FILTER
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff <= 7) {
      weekly.push(t);
    }
  });

  let mInc = 0, mExp = 0;
  let wInc = 0, wExp = 0;

  let mExpenses = [];
  let wExpenses = [];

  // MONTHLY CALC
  monthly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      mInc += amt;
    } else {
      mExp += amt;
      mExpenses.push(amt);
    }
  });

  // WEEKLY CALC
  weekly.forEach(t => {
    let amt = Number(t.amount);

    if (t.type === "income") {
      wInc += amt;
    } else {
      wExp += amt;
      wExpenses.push(amt);
    }
  });

  // BIGGEST EXPENSE
  const biggestM = mExpenses.length ? Math.max(...mExpenses) : 0;
  const biggestW = wExpenses.length ? Math.max(...wExpenses) : 0;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  // MONTHLY UI
  set("m-income", mInc);
  set("m-expense", mExp);
  set("m-net", mInc - mExp);
  set("m-count", monthly.length);
  set("m-biggest", biggestM);

  // WEEKLY UI
  set("w-income", wInc);
  set("w-expense", wExp);
  set("w-net", wInc - wExp);
  set("w-count", weekly.length);
  set("w-biggest", biggestW);
}

document.addEventListener("DOMContentLoaded", updateReports);
