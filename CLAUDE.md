# CLAUDE.md

## Purpose
This repository is a **production-oriented OTT web application**. Always make changes while **preserving existing behavior**, and consider the user app, admin, and backend API contract together.

## Stack
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Backend: Spring Boot 4 / Java 24 / PostgreSQL

## Core Principles
1. Prefer **server components by default**.
2. Use `"use client"` only when browser interaction is required.
3. Prefer **`app/api/*` proxy routes** over calling the backend directly from the client.
4. Choose **scalable structure** over temporary fixes.
5. Do not break the existing home / playback / upload flows.
6. Avoid `any`; define types explicitly.
7. Always consider loading / error / empty states.
8. If you add environment variables, also update `.env.example`.

## Main Structure
- `app/`: user-facing pages
- `app/api/`: Next Route Handler proxies
- `app/watch/[id]/page.tsx`: playback
- `app/contents/[id]/page.tsx`: content detail
- `app/categories/[slug]/page.tsx`: category detail
- `app/search/page.tsx`: search
- `app/my-list/page.tsx`: my list
- `app/admin/page.tsx`: admin screen

## Data / Integration Rules
- The UI should call internal proxy routes whenever possible.
- Parse backend response shapes defensively.
- Normalize snake_case / camelCase differences in adapters.
- Proxy routes should preserve backend status/message as much as possible.

## UI Rules
- Keep using Tailwind.
- Extract repeated cards / sections / badges into components.
- Maintain consistency in OTT-specific hero, rail, metadata, and CTA patterns.
- Treat accessibility (focus, alt, aria) and responsiveness as defaults.

## Work Priorities
1. Preserve behavior
2. Improve information architecture
3. Stabilize API contracts
4. Improve production readiness
5. Ensure scalability

## Prohibited
- Do not convert whole pages into client components unnecessarily
- Do not call backend remote URLs directly from the client
- Do not regress back to Pages Router patterns
- Do not add new libraries without clear justification

## When Backend Changes Are Required
Do not solve these only in the frontend; explicitly note that backend changes are needed when:
- New sort / filter / search conditions are required
- Response fields are insufficient
- Personalization / authorization / playback policies change
- Admin curation / operational features are added

## Git Workflow
- 작업이 완료되면 항상 `git commit` + `git push`까지 수행한다.
- 커밋 메시지는 conventional commits 형식을 따른다 (feat, fix, refactor 등).

## Completion Report Format
After each task, report in the following format:
- Changed files
- User impact
- Backend impact
- Remaining risks
- Recommended next steps