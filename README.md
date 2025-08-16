📌 AI Meeting Summarizer

An AI-powered full-stack application that allows users to upload meeting transcripts, generate structured summaries using AI, edit them, and share via email.

Deployed on Render with a Node.js + Express backend and simple frontend.



🚀 Features

📂 Upload Transcript – Upload meeting notes or call transcripts (text).

✍️ Custom Prompt – Add custom instructions (e.g., "Summarize in bullet points for executives").

🤖 AI Summarization – Uses Groq LLM API (Llama-3.1 models) to generate summaries.

📝 Editable Output – Users can edit the generated summary.

📧 Email Sharing – Share final summaries via email.

⚡ Deployed on Render – Easy one-click deployment.



🛠️ Tech Stack

Frontend: HTML, CSS, Vanilla JS (basic UI)

Backend: Node.js, Express

AI Service: Groq API (Llama-3.1 models)

Email Service: Nodemailer

Deployment: Render



📂 Project Structure

ai-meeting-summarizer/
├─ server.js          # Backend (Express + AI + Email)
├─ package.json       # Project dependencies & scripts
├─ public/            # Frontend files
│   ├─ index.html
│   └─ script.js
├─ .env               # Environment variables (ignored in Git)
└─ node_modules/      # Dependencies (ignored in Git)


⚙️ Installation & Setup (Local)

Clone the repository

git clone https://github.com/<your-username>/Ai-meeting-summarizer.git
cd Ai-meeting-summarizer


Install dependencies

npm install


Create .env file

GROQ_API_KEY=your_groq_api_key_here
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password



Run the server

npm start


or

node server.js


Open in browser:

http://localhost:5000




🚀 Deployment on Render

1. Push your project to GitHub.

2. Go to Render Dashboard.

3. Create a New Web Service → Connect your repo.

4. Set:

       Build Command: npm install

        Start Command: npm start



5. Add environment variables in Render settings.

6. Deploy 🎉





📧 Email Sharing Setup

Uses Nodemailer for sending emails.

You need to provide your email credentials in .env.

For Gmail, enable App Passwords (recommended) instead of normal password.




📝 Example Usage

1. Upload a transcript file (meeting.txt).

2. Enter a custom prompt like:

3. "Summarize in bullet points and highlight action items."

4. Click Generate Summary.

5. Edit the summary if needed.

6. Share via email 🎯
