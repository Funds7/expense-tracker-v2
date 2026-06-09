document.addEventListener("DOMContentLoaded", () => {

  console.log("SETTINGS JS LOADED");

  // =========================
  // 🌙 DARK MODE
  // =========================
  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark", isDark);

    themeToggle.addEventListener("click", () => {
      const newState = !document.body.classList.contains("dark");
      document.body.classList.toggle("dark", newState);
      localStorage.setItem("darkMode", newState);
    });
  }

  // =========================
  // 💰 BUDGET SYSTEM
  // =========================
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

      checkBudgetWarning();
    });
  }

  function checkBudgetWarning() {
    const budget = Number(localStorage.getItem("monthlyBudget") || 0);
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    let expense = 0;

    transactions.forEach(t => {
      if (t.type === "expense") {
        expense += Number(t.amount);
      }
    });

    if (budget > 0 && expense > budget) {
      alert("🚨 You exceeded your monthly budget!");
    }
  }

  checkBudgetWarning();

  // =========================
  // 🧹 CLEAR DATA
  // =========================
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

  // =========================
  // 💎 PRO STATUS DISPLAY
  // =========================
  const proStatus = document.getElementById("proStatus");

  function updateProUI() {
    const isPro = localStorage.getItem("pro") === "true";

    if (proStatus) {
      proStatus.textContent = isPro
        ? "💎 PRO ACTIVE"
        : "Free Plan (Upgrade Available)";
    }
  }

  updateProUI();

  // =========================
  // 💳 PAYSTACK PRO UNLOCK HANDLER
  // =========================
  window.unlockProPlan = function(reference) {

    fetch("https://your-backend.onrender.com/verify/" + reference)
      .then(res => res.json())
      .then(data => {

        if (data.success) {
          localStorage.setItem("pro", "true");

          alert("🎉 Payment successful! PRO unlocked!");

          updateProUI();

          // optional refresh
          location.reload();
        } else {
          alert("❌ Payment verification failed");
        }

      })
      .catch(err => {
        console.error(err);
        alert("Server error verifying payment");
      });
  };

});
