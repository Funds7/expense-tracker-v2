document.addEventListener("DOMContentLoaded", () => {

  console.log("SETTINGS JS LOADED");

  const themeToggle = document.getElementById("themeToggle");

  // 🌙 DARK MODE (IMPROVED)
  if (themeToggle) {
    const isDark = localStorage.getItem("darkMode") === "true";

    if (isDark) {
      document.body.classList.add("dark");
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
      );
    });
  }

  // 💰 BUDGET SYSTEM (SAFE FIX)
  const budgetInput = document.getElementById("budgetInput");
  const saveBudget = document.getElementById("saveBudget");
  const budgetStatus = document.getElementById("budgetStatus");

  const savedBudget = localStorage.getItem("monthlyBudget");

  if (budgetInput && savedBudget) {
    budgetInput.value = savedBudget;
  }

  if (saveBudget) {
    saveBudget.addEventListener("click", () => {
      const value = Number(budgetInput?.value);

      if (!value || value <= 0) {
        if (budgetStatus) budgetStatus.textContent = "Enter valid budget amount";
        return;
      }

      localStorage.setItem("monthlyBudget", value);

      if (budgetStatus) {
        budgetStatus.textContent = `Budget saved: ₦${value}`;
      }
    });
  }

  // 🧹 CLEAR DATA (SAFE VERSION)
  const clearDataBtn = document.getElementById("clearDataBtn");

  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      const confirmDelete = confirm("Delete all transactions? This cannot be undone.");

      if (!confirmDelete) return;

      localStorage.removeItem("transactions");

      alert("All data cleared successfully");

      window.location.href = "index.html";
    });
  }

});
