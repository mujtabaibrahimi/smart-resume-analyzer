# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Resume Analyzer — an AI-powered career tool that analyzes resumes using **Groq API** (Llama 3.3 70B). Features: ATS scoring, improvement suggestions, job matching, LinkedIn-style job search simulation, and cover letter generation.

## Tech Stack

- **Frontend:** React 18 + Vite
- **AI Backend:** Groq API (OpenAI-compatible endpoint) — client-side calls, no server
- **Model:** `llama-3.3-70b-versatile` via `https://api.groq.com/openai/v1/chat/completions`
- **Styling:** Inline CSS-in-JS (no CSS framework)
- **Fonts:** Google Fonts loaded via `<link>` (Instrument Sans, DM Mono)

## Project Setup

The project must be scaffolded from the source files using Vite:

```bash
npm create vite@latest smart-resume-analyzer -- --template react
cd smart-resume-analyzer
npm install
```

Then: copy `smart-resume-analyzer.jsx` → `src/App.jsx`, update `src/index.css` with the minimal reset from SETUP-GUIDE.md, and delete `src/App.css`.

## Common Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

## Architecture

**Single-component app** — the entire UI lives in one file (`smart-resume-analyzer.jsx` → becomes `src/App.jsx`):

- **`callGroq(sys, msg)`** — Core API function. Sends system+user messages to Groq with `response_format: { type: "json_object" }`. Uses `window.__GROQ_KEY__` set at runtime (never persisted).
- **`run(key, sys, msg)`** — Wrapper that manages loading state (`ld`), calls `callGroq`, parses JSON response, and stores results in `res` state.
- **Tab-based UI** with 6 tabs: Upload, ATS Score, Improve, Job Match, LinkedIn, Cover Letter. Each tab is a function component defined inside the main component.
- **State management** — all via `useState` hooks in the root component. Key state: `resume` (text), `res` (analysis results keyed by tab), `ld` (loading flags keyed by tab), `ak`/`akOk` (API key).
- **AI prompt pattern** — each feature (`doATS`, `doImprove`, `doMatch`, `doLin`, `doCover`) sends a system prompt that demands JSON-only output with a specific schema, then parses the response.

## Key Design Decisions

- **No routing library** — tab navigation is state-driven (`tab` state variable)
- **No state management library** — plain React state, all local to root component
- **API key in memory only** — stored in `window.__GROQ_KEY__`, never written to localStorage or disk
- **All AI responses are JSON** — Groq's `response_format: { type: "json_object" }` is used; responses are parsed with a ````json` fence fallback strip
- **No backend required for dev** — Groq API supports CORS; for production, a proxy server (`server.js` with Express) is recommended per SETUP-GUIDE.md

## Groq API Details

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Auth:** `Authorization: Bearer <key>` header
- **Response path:** `data.choices[0].message.content`
- **Free tier limits:** ~30 req/min, 14,400 req/day
- **Alternative models:** `llama-3.1-8b-instant` (faster), `meta-llama/llama-4-scout-17b-16e-instruct`, `compound-beta` (web search)
