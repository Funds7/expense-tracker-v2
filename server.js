const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Health check
app.get("/", (req, res) => {
  res.send("Paystack backend is running 🚀");
});

// Verify payment
app.get("/verify/:reference", async (req, res) => {
  const reference = req.params.reference;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status === "success") {
      return res.json({
        success: true,
        message: "Payment verified",
        email: data.customer.email,
        amount: data.amount,
        reference: data.reference,
      });
    }

    return res.json({
      success: false,
      message: "Payment not successful",
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
