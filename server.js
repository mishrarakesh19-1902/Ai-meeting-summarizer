import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" })); // transcripts are text; bump if needed

// Serve static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- AI Summarization (Groq - OpenAI-compatible endpoint) ---
app.post("/api/summarize", async (req, res) => {
  try {
    const { transcript, prompt } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }
    const userPrompt = prompt?.trim() || "Summarize the transcript in clear bullet points.";

    // Safety: limit extremely long inputs to avoid token overflow in demos
    const MAX_CHARS = 18000; // adjust as needed
    const inputTranscript =
      transcript.length > MAX_CHARS
        ? transcript.slice(0, MAX_CHARS) + "\n\n[Truncated for length in demo.]"
        : transcript;

    const systemMsg =
      "You are an expert meeting assistant. Read the transcript and produce a structured, concise output. Obey the user's instruction. Include sections when appropriate (Overview, Key Decisions, Action Items with owners & due dates, Risks/Blockers). Keep it clean and scannable.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemMsg },
          {
            role: "user",
            content:
              `INSTRUCTION:\n${userPrompt}\n\nTRANSCRIPT:\n${inputTranscript}`
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Groq error:", text);
      return res.status(response.status).json({ error: "Groq API error", details: text });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(500).json({ error: "No summary returned by AI." });
    }

    res.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- Email sending (Nodemailer) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, summaryHtml, summaryText } = req.body;

    // Accept comma- or space-separated, or array
    let recipients = [];
    if (Array.isArray(to)) recipients = to;
    else if (typeof to === "string")
      recipients = to.split(/[, ]/).map(s => s.trim()).filter(Boolean);

    if (!recipients.length) {
      return res.status(400).json({ error: "Recipient email(s) required." });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: recipients.join(", "),
      subject: subject?.trim() || "Meeting Summary",
      text: summaryText?.trim() || "No text version provided.",
      html:
        summaryHtml?.trim() ||
        `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre-wrap">${(summaryText || "").replace(/[<&>]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]))}</pre>`
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
