require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "aarohi0173.be23@chitkara.edu.in";

/* =========================
   HEALTH CHECK API
========================= */
app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

/* =========================
   MAIN BFHL API
========================= */
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Invalid JSON body"
      });
    }

    const keys = Object.keys(body);
    if (keys.length !== 1) {
      return res.status(422).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    const value = body[key];
    let result;

    switch (key) {
      case "fibonacci":
        result = fibonacci(value);
        break;
      case "prime":
        result = filterPrimes(value);
        break;
      case "lcm":
        result = lcmArray(value);
        break;
      case "hcf":
        result = hcfArray(value);
        break;
      case "AI":
        result = await getAIResponse(value);
        break;
      default:
        return res.status(400).json({
          is_success: false,
          official_email: OFFICIAL_EMAIL,
          error: "Invalid key provided"
        });
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    return res.status(500).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: "Internal server error"
    });
  }
});

/* =========================
   LOGIC FUNCTIONS
========================= */

// Fibonacci
function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error();
  const arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
}

// Prime
function isPrime(num) {
  if (!Number.isInteger(num) || num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function filterPrimes(arr) {
  if (!Array.isArray(arr)) throw new Error();
  return arr.filter(isPrime);
}

// HCF
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcfArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error();
  return arr.reduce((a, b) => gcd(a, b));
}

// LCM
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function lcmArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error();
  return arr.reduce((a, b) => lcm(a, b));
}

// Gemini AI
async function getAIResponse(question) {
  if (typeof question !== "string" || question.trim() === "") throw new Error();

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: `${question}. Answer in ONE WORD only.` }
          ]
        }
      ]
    }
  );

  return response.data.candidates[0].content.parts[0].text.trim();
}

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
