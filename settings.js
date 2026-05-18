document.addEventListener("DOMContentLoaded", () => {

  console.log("SETTINGS JS LOADED");

  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark");
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", document.body.classList.contains("dark"));
    });
  }

  const budgetInput = document.getElementById("budgetInput");
  const saveBudget = document.getElementById("saveBudget");
  const budgetStatus = document.getElementById("budgetStatus");

  const savedBudget = localStorage.getItem("monthlyBudget");

  if (budgetInput && savedBudget) {
    budgetInput.value = savedBudget;
  }

  if (saveBudget) {
    saveBudget.addEventListener("click", () => {
      const value = budgetInput?.value;

      if (!value) {
        if (budgetStatus) budgetStatus.textContent = "Enter a valid amount";
        return;
      }

      localStorage.setItem("monthlyBudget", value);
      if (budgetStatus) budgetStatus.textContent = `Budget saved: ₦${value}`;
    });
  }

  const clearDataBtn = document.getElementById("clearDataBtn");

  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (!confirm("Are you sure?")) return;

      localStorage.removeItem("transactions");
      alert("All transactions deleted");
      window.location.href = "index.html";
    });
  }

});
