# AI Council

**One Question. Multiple Minds. One Better Answer.**

AI Council is a hackathon-ready full-stack platform that routes a user question through specialized AI agents, runs multiple model providers in parallel, compares responses, and synthesizes a final answer with an AI Judge.

## Architecture

```text
User → Orchestrator → Agents (Analyst, Creative, Critic, …) → Comparison → Judge → Final Result
```

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Provider abstraction (OpenAI, Gemini, Anthropic, Groq, OpenRouter)

## Features

- Multi-agent orchestration with deterministic routing by task type
- Parallel model execution with partial failure tolerance
- Judge synthesis with consensus, disagreements, caveats, and model-estimated confidence
- Demo Mode with clearly labeled simulated responses (no API keys required)
- File uploads (PDF/text/code/image) with safe validation
- Dashboard, history, models catalog, protected routes

## Project structure

```text
client/          React app
server/          Express API + orchestrator
supabase/        SQL migrations + RLS
```

## Requirements

- Node.js 20+
- npm 10+
- Supabase project (for production auth/persistence)
- At least one AI provider API key (for live analysis)

## Installation

```bash
cp .env.example .env
npm install
```

## Development

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start client + server |
| `npm run build` | Build both packages |
| `npm run start` | Start production API |
| `npm run lint` | Lint client + server |
| `npm run typecheck` | TypeScript checks |
| `npm run test` | Unit tests |

## Supabase setup

1. Create a Supabase project.
2. Run migration: `supabase/migrations/20260330000000_init.sql`
3. Enable Email auth (optional Google OAuth).
4. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Without Supabase, the app runs in **local demo mode** (in-memory analyses + `x-demo-user` header).

## AI provider setup

Set any of:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`

## Demo Mode

Use **Try Demo** on the landing page or enable Demo Mode on `/analyze`.

Demo scenarios include:

1. College Electricity Optimization
2. Scalable AI Chatbot Architecture
3. Document/Image Analysis (simulated)

Demo responses are simulated and labeled **DEMO MODE**.

## Security

- Server-only secrets (never `VITE_` prefixed)
- Supabase RLS policies per user
- Server-side ownership checks on analysis routes
- Rate limiting, Helmet, CORS, upload validation

## Reliability disclaimer

Multi-model consensus can improve robustness, but agreement does not guarantee correctness. Verify important information independently.

## Troubleshooting

- **No providers configured:** use Demo Mode or add API keys to `.env`
- **401 on API routes:** sign in via Supabase or use local demo mode
- **Upload failures:** check `MAX_FILE_SIZE_MB` and allowed extensions
