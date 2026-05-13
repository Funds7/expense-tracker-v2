let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

if (dateInput) {
  dateInput.value = new Date().toISOString().split("T")[0];
}

function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      id: Date.now(),
      title: titleInput.value,
      amount: Number(amountInput.value),
      type: typeInput.value,
      category: categoryInput.value,
      date: dateInput.value
    };

    transactions.push(data);
    save();

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];

    alert("Transaction saved!");
  });
}
