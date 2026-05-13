document.getElementById("transaction-form").addEventListener("submit", function (e) {
  e.preventDefault();

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editId = Number(localStorage.getItem("editId"));

  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;

  if (editId) {
    transactions = transactions.map(t => {
      if (t.id === editId) {
        return {
          ...t,
          title,
          amount,
          category,
          date,
          type
        };
      }
      return t;
    });

    localStorage.removeItem("editId");
    alert("Transaction updated successfully ✏️");

  } else {
    transactions.push({
      id: Date.now(),
      title,
      amount,
      category,
      date,
      type
    });

    alert("Transaction added successfully ✅");
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));

  this.reset();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
});

/* ================= AUTO FILL WHEN EDITING ================= */
window.addEventListener("load", function () {
  const editId = Number(localStorage.getItem("editId"));

  if (!editId) return;

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const transaction = transactions.find(t => t.id === editId);

  if (!transaction) return;

  document.getElementById("title").value = transaction.title;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("category").value = transaction.category;
  document.getElementById("date").value = transaction.date;
  document.getElementById("type").value = transaction.type;
});
