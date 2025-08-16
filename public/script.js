const fileInput = document.getElementById("fileInput");
const transcriptEl = document.getElementById("transcript");
const promptEl = document.getElementById("prompt");
const summaryEl = document.getElementById("summary");
const recipientsEl = document.getElementById("recipients");
const subjectEl = document.getElementById("subject");
const generateBtn = document.getElementById("generateBtn");
const sendBtn = document.getElementById("sendBtn");
const copyBtn = document.getElementById("copyBtn");
const summStatus = document.getElementById("summStatus");
const emailStatus = document.getElementById("emailStatus");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".txt")) {
    alert("Please upload a .txt file.");
    e.target.value = "";
    return;
  }
  const text = await file.text();
  transcriptEl.value = text;
});

generateBtn.addEventListener("click", async () => {
  summStatus.textContent = "";
  const transcript = transcriptEl.value.trim();
  const prompt = promptEl.value.trim();

  if (!transcript) {
    alert("Transcript is required.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  summStatus.textContent = "Calling AI…";

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, prompt })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Failed to summarize");
    }

    summaryEl.value = data.summary;
    summStatus.textContent = "Done.";
  } catch (err) {
    console.error(err);
    alert("Failed to generate summary. Check console/server logs.");
    summStatus.textContent = "Failed.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Summary";
  }
});

sendBtn.addEventListener("click", async () => {
  emailStatus.textContent = "";
  const to = recipientsEl.value.trim();
  const subject = subjectEl.value.trim();
  const editable = summaryEl.value.trim();

  if (!editable) {
    alert("Summary is empty.");
    return;
  }
  if (!to) {
    alert("Please enter recipient email(s).");
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";
  emailStatus.textContent = "Sending…";

  // Provide both text and a minimal HTML version
  const summaryText = editable;
  const summaryHtml =
    "<pre style='white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace'>" +
    escapeHtml(editable) +
    "</pre>";

  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, summaryText, summaryHtml })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Failed to send email");
    }
    emailStatus.textContent = "Email sent ✅";
  } catch (err) {
    console.error(err);
    emailStatus.textContent = "Failed to send ❌";
    alert("Failed to send email. Check SMTP settings in .env and server logs.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send Email";
  }
});

copyBtn.addEventListener("click", async () => {
  const text = summaryEl.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Summary"), 1000);
  } catch (e) {
    alert("Copy failed");
  }
});

function escapeHtml(s) {
  return s.replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}
