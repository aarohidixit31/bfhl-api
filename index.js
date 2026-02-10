require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "aarohi0173.be23@chitkara.edu.in";

/* =========================
   HELPER FUNCTIONS
========================= */

const fibonacci = (n) => {
  const num = parseInt(n);
  if (isNaN(num) || num <= 0) return [];
  const series = [0, 1];
  for (let i = 2; i < num; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return series.slice(0, num);
};

const isPrime = (num) => {
  const n = parseInt(num);
  if (isNaN(n) || n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const hcf = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a, b) => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / hcf(a, b);
};

/* =========================
   GEMINI AI
========================= */

const askAI = async (question) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Unknown";
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [
          {
            parts: [{ text: `${question}. Answer in one word only.` }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY },
        timeout: 8000
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text ? text.trim().split(/\s+/)[0] : "Unknown";

  } catch (err) {
    // 🚨 DO NOT THROW
    return "Unknown";
  }
};


/* =========================
   ROUTES
========================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body || {});

    if (keys.length !== 1) {
      return res.status(422).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    const val = body[key];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacci(val);
        break;
      case "prime":
        if (!Array.isArray(val)) throw new Error("Prime expects an array");
        data = val.filter(isPrime);
        break;
      case "lcm":
        if (!Array.isArray(val) || val.length < 2) throw new Error("LCM needs array");
        data = val.reduce((a, b) => lcm(a, b));
        break;
      case "hcf":
        if (!Array.isArray(val) || val.length < 2) throw new Error("HCF needs array");
        data = val.reduce((a, b) => hcf(a, b));
        break;
      case "AI":
        data = await askAI(val);
        break;
      default:
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: err.message
    });
  }
});
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
}


module.exports = app;