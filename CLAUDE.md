# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- openwolf:begin -->
# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.
<!-- openwolf:end -->

## Project Status

**No application code exists yet.** This repo currently contains only product docs (PRD, onboarding flow) and AI-tooling scaffolding (OpenWolf, graphify, Codex/OpenCode configs). The Next.js app has not been scaffolded. When a session's task is to start implementation, treat the PRD below as the spec to scaffold against — there is no existing code convention to match yet, so establish one consistent with the stack decisions below.

Source docs (read these for full detail; this file is the condensed operating summary):
- `Product Requirements Document (PRD).md` — full MVP spec, user stories, schema, risks, timeline
- `Flow Onboarding & Alur Produk Listingku (MVP — Landing per Primary Property).md` — step-by-step UX flow (Fase 0–9)

## Product Concept

**Listingku** — an AI-powered property marketing SaaS for independent Indonesian real estate agents ("Property Marketing Operating System"). North Star metric: **Time to Publish** — an agent should go from entering project data to a live, professional landing page in **under 10 minutes**.

**Key product decision (v3.0, the revision that supersedes earlier docs):** the landing page is generated **per Primary Property (Project)**, not per house type/unit. A project like "ParkSpring Gading" with 3 house types (Villa, Midea, Grand) produces **one landing page** at `listingku.app/{project-slug}`, with all house types rendered as sections/cards inside that single page — not as separate landing pages.

MVP scope = two pillars:
1. **Website Generator** — the core: Project → House Types → AI content → templated landing page → publish.
2. **Website Profil Agen** — a one-time agent profile microsite at `{subdomain}.listingku.app`, added to MVP scope in v3.0.

Design principles to preserve in any implementation:
- **Guided editor, not free-form** — no drag-and-drop, no manual CSS/padding. Users click a block, edit fields in a side panel. This is intentional, not a missing feature.
- **AI is optional and never blocks publish.** If Gemini fails or is skipped, manual content entry must still allow publishing.
- One AI call per Primary Property (not per house type) — keeps AI cost low regardless of how many unit types a project has.

## Planned Architecture

**Stack (MVP — deliberately simplified from the long-term Turborepo/Prisma/R2 vision to ship fast; entity schema is kept consistent with that long-term model so migration stays open):**
- Next.js 15 App Router, single monolith (dashboard + public SSR pages in one app), deployed on Vercel
- Supabase: Postgres + Auth (magic link + Google OAuth) + Storage + Realtime — replaces Prisma/Auth.js/R2 for MVP
- shadcn/ui + Tailwind CSS
- Gemini 2.5 Flash via REST with `responseSchema` (structured JSON output) for AI content generation
- Zod for validation (client + server)
- `qrcode` library for server-side QR generation on publish

**Routing model:**
- `listingku.app/{project-slug}` — one public landing page per Primary Property (all house types as sections within it)
- `{subdomain}.listingku.app` — one public agent profile microsite per agent, detected via Next.js middleware reading the `Host` header
- Everything else on the main domain is the authenticated dashboard (`/app/*` conceptually)

**Data model (Supabase/Postgres) — see PRD "Skema Database" for full field list:**
```
users             -- Supabase Auth
agent_profiles    (user_id, site_name, subdomain UNIQUE, theme, logo_url, color_scheme,
                   about, stats JSONB, services JSONB[], is_published, ...)
projects          (user_id, name, slug UNIQUE, location, developer, description,
                   facilities JSONB[], status, ...)          -- = "Primary Property"
house_types       (project_id, name, slug UNIQUE, price, land_area, building_area,
                   bedrooms, bathrooms, carport, status, ai_content JSONB,
                   template, blocks JSONB, seo JSONB, ...)
media             (user_id, project_id, house_type_id, type, url, size, ...)
leads             (house_type_id, name, phone, email, message, source, status, ...)
events            (house_type_id, type: visitor|whatsapp_click|form_submit, date, count)
ai_usage          (user_id, model, prompt_tokens, completion_tokens, latency_ms, success, ...)
```
Note: `landing_pages` is not a separate table in MVP — a project's landing is represented by `projects`/`house_types` content + `blocks` JSONB + `seo` JSONB. Split it out only if block versioning becomes necessary.

**Critical architectural rules:**
- **RLS is the primary security boundary.** Public `select` policies must only expose `status = 'published'` rows; the dashboard uses an authenticated Supabase client. Any schema change must be paired with an RLS policy review.
- Media uploads go directly from client to Supabase Storage (bucket `media`).
- AI output must be sanitized before render — avoid `dangerouslySetInnerHTML`; render AI Markdown through a controlled Markdown→RichText path.
- Subdomain middleware renders the agent profile only when `agent_profiles.is_published = true`.

## User Flow (Fase 0–9, from the onboarding doc)

Login (Supabase Auth) → **one-time** 5-step profile wizard (skippable at every step; never blocks the dashboard) → agent profile live at `{subdomain}.listingku.app` → Dashboard → per-project loop, target **<10 min end to end**:

`+ Create Project (3-step wizard)` → `+ Add House Type` (repeatable — one project holds 1..N house types) → `Generate AI` (single Gemini call covering the whole project + all its house types) → `Block Editor` (guided review/edit of Hero → Gallery → Highlights → House Types → Specs → Facilities → Floor Plans → Location → FAQ → CTA → Form) → `Publish` (one click, URL auto-copied, QR + share captions available) → Leads/Analytics (visitor, WhatsApp-click, form-submit events feed the dashboard).

Landing page default block order: **Hero → Gallery → Highlights → House Types → Specifications per Type → Facilities → Floor Plans → Location → FAQ → Agent CTA → Contact Form.** 3 landing themes (Modern, Showcase, Luxury) share identical block/content JSON and differ only in layout/style — never build a theme that requires different content shape.

## Out of Scope for MVP

Do not build these unless explicitly asked — they're deferred by product decision, not oversight: custom domains, full Brand Kit, global Media Library / AI Image Studio, standalone Projects/Testimonials pages on the profile site, billing/payment/quota enforcement (usage is only *logged* via `ai_usage`), advanced CRM/Open House/blog, multi-agent/team workspaces, free-form drag-and-drop editing, per-house-type landing pages/subdomains.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
