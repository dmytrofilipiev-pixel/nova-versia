import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_, res) => res.json({ status: "ok" }));

// Proxy to Anthropic
app.post("/api/chat", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set on server" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
