
require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));

// Serve files from the public directory.
app.use(express.static(PUBLIC_DIR));

// Explicit homepage route with a clear diagnostic if the file is missing.
app.get("/", (_req, res) => {
  const indexPath = path.join(PUBLIC_DIR, "index.html");

  if (!fs.existsSync(indexPath)) {
    return res.status(500).send(
      "Captain Bot setup error: public/index.html is missing."
    );
  }

  res.sendFile(indexPath);
});

// Health check.
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// API status.
app.get("/api/status", (_req, res) => {
  res.json({
    name: "Captain Bot",
    status: "setup_required",
    message: "Website is online. Configure a supported WhatsApp integration separately."
  });
});

const requests = [];
const requestLimit = new Map();

function rateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const recent = (requestLimit.get(key) || []).filter(
    timestamp => now - timestamp < 10 * 60 * 1000
  );

  if (recent.length >= 5) {
    return res.status(429).json({
      error: "Too many requests. Try again later."
    });
  }

  recent.push(now);
  requestLimit.set(key, recent);
  next();
}

app.post("/api/connect-request", rateLimit, (req, res) => {
  const raw = String(req.body?.phone || "").trim();
  const digits = raw.replace(/[^\d]/g, "");

  if (digits.length < 8 || digits.length > 15) {
    return res.status(400).json({
      error: "Enter a valid phone number with country code."
    });
  }

  const id = crypto.randomUUID();

  requests.push({
    id,
    phoneLast4: digits.slice(-4),
    createdAt: new Date().toISOString()
  });

  if (requests.length > 100) requests.shift();

  res.status(202).json({
    ok: true,
    requestId: id,
    message: "Request received. The bot owner must complete the integration setup."
  });
});

// Unknown routes return a clear JSON 404.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Captain Bot listening on port ${PORT}`);
  console.log(`Serving website files from: ${PUBLIC_DIR}`);
  console.log(
    `Homepage file exists: ${fs.existsSync(path.join(PUBLIC_DIR, "index.html"))}`
  );
});
