let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateReports() {
  const now = new Date();

  const monthly = transactions.filter(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return false;

    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const weekly = transactions.filter(t => {
    const d = new Date(t.date);
    if (isNaN(d)) return false;

    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  let mInc = 0, mExp = 0, wInc = 0, wExp = 0;

  monthly.forEach(t => {
    if (t.type === "income") mInc += t.amount;
    else mExp += t.amount;
  });

  weekly.forEach(t => {
    if (t.type === "income") wInc += t.amount;
    else wExp += t.amount;
  });

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `₦${val}`;
  };

  set("m-income", mInc);
  set("m-expense", mExp);
  set("m-net", mInc - mExp);
  set("m-count", monthly.length);

  set("w-income", wInc);
  set("w-expense", wExp);
  set("w-net", wInc - wExp);
  set("w-count", weekly.length);
}

document.addEventListener("DOMContentLoaded", updateReports);
