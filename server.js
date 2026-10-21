require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// This starter deliberately does not collect WhatsApp login/pairing codes,
// QR sessions, or session credentials. Connect a supported bot integration
// privately rather than exposing those secrets through a public website.
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
const requests = [];
const requestLimit = new Map();

function rateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const recent = (requestLimit.get(key) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ error: "Too many requests. Try again later." });
  recent.push(now);
  requestLimit.set(key, recent);
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/status", (_req, res) => {
  res.json({
    name: "Captain Bot",
    status: "setup_required",
    message: "Website is online. A supported WhatsApp integration must be configured by the owner."
  });
});

// Records a connection request without storing the full phone number or any code.
app.post("/api/connect-request", rateLimit, (req, res) => {
  const raw = String(req.body?.phone || "").trim();
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return res.status(400).json({ error: "Enter a valid phone number with country code." });
  }

  const id = crypto.randomUUID();
  requests.push({ id, phoneLast4: digits.slice(-4), createdAt: new Date().toISOString() });
  if (requests.length > 100) requests.shift();

  res.status(202).json({
    ok: true,
    requestId: id,
    message: "Request received. This starter does not send a WhatsApp login or pairing code. The bot owner must finish setup through a supported connection method."
  });
});

// Private owner-only view of request metadata. Set ADMIN_TOKEN in Render.
app.get("/api/admin/requests", (req, res) => {
  const auth = req.get("authorization") || "";
  if (!ADMIN_TOKEN || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.sendStatus(401);
  }
  res.json(requests.map(({ id, phoneLast4, createdAt }) => ({ id, phoneLast4, createdAt })));
});

app.listen(PORT, () => console.log(`Captain Bot website listening on ${PORT}`));
app.get("/debug-files", (_req, res) => {
  const fs = require("fs");

  res.json({
    directory: __dirname,
    publicExists: fs.existsSync(path.join(__dirname, "public")),
    indexExists: fs.existsSync(
      path.join(__dirname, "public", "index.html")
    )
  });
});
