# Project Overview


Build a lightweight web application. Each feature does one thing, the code is easy to follow, and the app is easy to run locally and deploy.


---


# Design


Build premium, modern, elegant interfaces. Use subtle animations, proper spacing, and clear visual hierarchy. No emoji icons. No generic gradients.


---


# How to Respond


Always explain like you're talking to a 15 year old with no coding background.


For every response, include:
- **What I just did** — plain English, no jargon
- **What you need to do** — step by step, assume they've never seen this before
- **Why** — one sentence explaining what it does or why it matters
- **Next step** — one clear action
- **Errors** — if something went wrong, explain it simply and say exactly how to fix it


When a task involves external tools (deployment, hosting, third-party services, localhost:3000, etc.):
- Walk through exactly where to find what they need (e.g. "go to your dashboard → Settings → API")
- Describe what each key or setting does in one plain sentence
- If there's a config or folder to create manually, explain what it is and why it exists
- Be as concise as possible. Do not ramble. Less is more


---


# Development Rules


**Rule 1: Always read first** — before any action, read `CLAUDE.md` and the relevant files in the codebase.


**Rule 2: Define before you build** — no code before the spec is clear. If unsure what's being asked, ask first.


**Rule 3: Look before you create** — check existing files before creating new ones. Don't duplicate what already exists.


**Rule 4: Test before you respond** — run `npm run build` and verify in the browser before saying "done".


**Core Rule** — do exactly what is asked. Nothing more, nothing less. If something is unclear, ask before starting.


---


# Tech Stack


- **Language:** TypeScript
- **Framework:** Next.js (App Router) — must be Next.js, not a static HTML site, unless explicitly requested otherwise
- **Styling:** Tailwind CSS
- **Deployment:** Vercel


Add a database, auth provider, payment processor, analytics, or any other third-party service ONLY when the project actually needs it. Do not pre-install integrations that aren't required.


---


# Running the Project


1. `npm install`
2. If the project uses environment variables, copy `.env.example` to `.env.local` and fill in any required keys
3. `npm run dev` — opens on `http://localhost:3000`
4. To ship: `npm run build`


---


# File Structure


- `/app` — pages users see
- `/components` — reusable UI building blocks
- `/lib` — shared helper code
- `/public` — images and other static files
- `.env.local` — secret keys — never commit to GitHub
- `CLAUDE.md` — these instructions


**Organisation rules:**
- One component per file
- Co-locate page-specific components with the page they belong to
- Don't create new top-level folders without asking first


---


# How to Write Code


- Write simple, readable code — clarity beats cleverness
- Make one change at a time
- Don't touch code unrelated to the current task
- Don't over-engineer — build exactly what's needed, nothing more
- Add a `console.log` at the start and end of each API route so the flow is easy to follow


If a large structural change is needed, explain why before making it.


---


# Secrets & Safety


- Never put API keys or passwords directly in the code
- Never commit `.env.local` to GitHub
- Ask before deleting or renaming any important files


---


# Testing


Before marking any task as done:
- Run `npm run build` and fix any TypeScript or build errors
- Start the dev server with `npm run dev` and check the browser console for errors
- Manually verify the feature works end-to-end in the browser
- Check that existing features weren't broken by the change


When building a new page or feature:
- Test the happy path (everything works as expected)
- Test the error path (what happens when something goes wrong)


Never say "done" if:
- The build is failing
- There are console errors
- The feature hasn't been tested in the browser


---


# Scope


Only build what is requested. If anything is unclear, ask before starting.



