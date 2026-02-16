# 🚀 Smart Resume Analyzer — Setup Guide (Groq API)

## Overview

**Smart Resume Analyzer** is an AI-powered career tool for job seekers, powered by **Groq's ultra-fast LPU inference** running **Llama 3.3 70B**. It analyzes resumes, scores ATS compatibility, suggests improvements, matches jobs, simulates LinkedIn searches, and generates cover letters.

---

## Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18 + Vite                           |
| AI Engine   | **Groq API** (OpenAI-compatible endpoint) |
| Model       | `llama-3.3-70b-versatile`                 |
| Styling     | Inline CSS-in-JS                          |
| Fonts       | Google Fonts (Instrument Sans, DM Mono)   |

---

## Prerequisites

1. **Node.js v18+** — [nodejs.org](https://nodejs.org)
2. **Groq API Key** (free) — [console.groq.com/keys](https://console.groq.com/keys)
3. **Code Editor** — VS Code recommended

Verify:
```bash
node --version   # v18+
npm --version    # 9+
```

---

## Step 1: Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card required)
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)
5. Save it somewhere safe

> **Groq Free Tier:** ~30 requests/minute, 14,400 requests/day — more than enough for personal use.

---

## Step 2: Create the Project

```bash
npm create vite@latest smart-resume-analyzer -- --template react
cd smart-resume-analyzer
npm install
```

---

## Step 3: Add the App Code

### 3a. Replace `src/App.jsx`

Copy the entire contents of the `smart-resume-analyzer.jsx` file into `src/App.jsx`.

### 3b. Update `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 3c. Replace `src/index.css`

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a0f; -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::selection { background: rgba(249,115,22,0.3); color: #fff; }
```

### 3d. Delete `src/App.css`

Remove the file or empty it.

---

## Step 4: Run the App

```bash
npm run dev
```

Open **http://localhost:5173** — you'll see the API key entry screen.

Enter your Groq API key → click **Start Analyzing** → you're in!

---

## Step 5: API Configuration

### How It Works (Client-Side — Good for Development)

The app calls Groq directly from the browser. Groq's API supports CORS, so it works out of the box during development:

```
Browser → https://api.groq.com/openai/v1/chat/completions
```

The key stays in memory only (never saved to disk or sent elsewhere).

### Production Setup: Proxy Server (Recommended)

For production, hide your API key behind a backend proxy.

**Create `server.js`:**

```javascript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/groq', async (req, res) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Proxy on http://localhost:3001'));
```

**Install & run:**

```bash
npm install express cors
GROQ_API_KEY=gsk_your_key_here node server.js
```

**Update the fetch URL in App.jsx:**

```javascript
// Change:
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// To:
const GROQ_URL = "http://localhost:3001/api/groq";
```

---

## Step 6: How to Use

| Tab | What It Does |
|-----|-------------|
| **Upload** | Drag & drop or paste your resume text |
| **ATS Score** | Scores resume 0-100, shows category breakdown, keywords found/missing, format issues |
| **Improve** | Critical fixes, recommended changes, quick wins, power words |
| **Job Match** | 5 matching roles with %, salary ranges, skill gaps, career paths |
| **LinkedIn** | AI-simulated job listings with match scores |
| **Cover Letter** | Full personalized letter with copy button |

---

## Step 7: Switch Groq Models (Optional)

Change the model in your code:

```javascript
const GROQ_MODEL = "llama-3.3-70b-versatile";  // Default - best quality
```

**Available alternatives:**

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama-3.3-70b-versatile` | Fast | Best | Default choice |
| `llama-3.1-8b-instant` | Ultra-fast | Good | Quick analysis, lower rate limits |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Fast | Great | Newer model, multimodal |
| `compound-beta` | Medium | Best | Has web search built-in |

---

## Step 8: Build for Production

```bash
npm run build
```

Deploy the `dist/` folder:

| Platform | Command |
|----------|---------|
| Vercel | `npx vercel` |
| Netlify | Drag `dist/` to dashboard |
| GitHub Pages | Use `gh-pages` plugin |

**Important:** Always use the proxy server approach for production to keep your API key secure.

---

## Step 9: LangChain + Groq Integration (Advanced)

Since you know LangChain, here's how to build a Python backend with Groq:

### Install

```bash
pip install langchain langchain-groq langchain-community
```

### Basic Chain

```python
import os
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import JsonOutputParser

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.environ["GROQ_API_KEY"],
    temperature=0.7,
)

# ATS Analysis Chain
ats_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an ATS expert. Analyze the resume and return JSON:
    {{"score": <0-100>, "breakdown": [...], "keywords_found": [...], "keywords_missing": [...]}}"""),
    ("human", "Analyze:\n\n{resume}")
])

ats_chain = ats_prompt | llm | JsonOutputParser()
result = ats_chain.invoke({"resume": resume_text})
print(f"ATS Score: {result['score']}")
```

### Full Pipeline Chain

```python
from langchain.chains import SequentialChain

# Chain 1: ATS Analysis
ats_chain = ats_prompt | llm | JsonOutputParser()

# Chain 2: Improvements (receives ATS output)
improve_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a career coach. Based on the ATS analysis, suggest improvements. Return JSON."),
    ("human", "ATS Result: {ats_result}\n\nResume: {resume}")
])
improve_chain = improve_prompt | llm | JsonOutputParser()

# Chain 3: Job Matching
match_prompt = ChatPromptTemplate.from_messages([
    ("system", "Match jobs based on the resume and improvements. Return JSON."),
    ("human", "Resume: {resume}\nImprovements: {improvements}")
])
match_chain = match_prompt | llm | JsonOutputParser()

# Run sequentially
ats = ats_chain.invoke({"resume": text})
improvements = improve_chain.invoke({"ats_result": str(ats), "resume": text})
matches = match_chain.invoke({"resume": text, "improvements": str(improvements)})
```

### Serve with FastAPI

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ResumeRequest(BaseModel):
    resume: str
    job_description: str = ""

@app.post("/analyze")
async def analyze(req: ResumeRequest):
    ats = ats_chain.invoke({"resume": req.resume})
    improvements = improve_chain.invoke({"ats_result": str(ats), "resume": req.resume})
    return {"ats": ats, "improvements": improvements}

# Run: uvicorn main:app --reload --port 8000
```

Then call from your React frontend:

```javascript
const response = await fetch("http://localhost:8000/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume: resumeText }),
});
const data = await response.json();
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `401 Unauthorized` | Check your Groq API key is correct |
| `429 Rate Limited` | Wait a minute, Groq free tier: ~30 req/min |
| `CORS error` | Groq supports CORS; try the proxy approach |
| `JSON parse error` | Model sometimes returns invalid JSON; the app has fallback handling |
| Resume not parsing | Use `.txt` files for best results |
| Blank screen | Check browser console; ensure default export in App.jsx |

---

## Groq vs Claude API — Key Differences

| Feature | Groq API | Claude API |
|---------|----------|------------|
| Endpoint | `api.groq.com/openai/v1/chat/completions` | `api.anthropic.com/v1/messages` |
| Format | OpenAI-compatible | Anthropic format |
| Auth Header | `Authorization: Bearer KEY` | `x-api-key: KEY` |
| Response | `data.choices[0].message.content` | `data.content[0].text` |
| JSON Mode | `response_format: {type: "json_object"}` | Prompt-based |
| Free Tier | Yes (generous) | No |
| Speed | Ultra-fast (LPU) | Fast |
| Models | Llama, Mixtral, Qwen, GPT-OSS | Claude family |

---

*Built with ⚡ Groq + Llama 3.3 + React*
