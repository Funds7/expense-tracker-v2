const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 🟢 HOME ROUTE
app.get("/", (req, res) => {
  res.send("Paystack backend is running 🚀");
});

// 🟢 HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🟢 PAYSTACK VERIFY ROUTE (MOCK FOR NOW)
app.get("/verify/:reference", async (req, res) => {
  const reference = req.params.reference;

  try {
    // TODO: later we connect real Paystack API here

    console.log("Verifying payment:", reference);

    // MOCK SUCCESS RESPONSE
    return res.json({
      success: true,
      message: "Payment verified",
      reference: reference
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Verification failed"
    });
  }
});

// 🟢 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
