# Hermes Connect — Product Vision & Marketing Reference

Recorded 2026-08-04. Source: owner-provided product/marketing brief (drafted with ChatGPT), consolidated here as the reference document for future work and copy. This file separates **what is actually live today** from **what is planned**, per the owner's own rule: *"отдельно обозначать уже доступные функции и возможности, которые находятся в разработке"* — never let marketing imply an unbuilt feature is live.

## Positioning

**Hermes Connect — ваш бизнес, расписание и клиенты в одной системе.**

A booking + client-management platform for anyone who works by appointment: replaces scattered messenger chats, phone calls, paper notebooks, and disconnected tools with one workspace, accessible from phone, tablet, or computer.

**Target industries** (beauty is the current build focus — see [[Multi-vertical business categories]] task): fitness trainers/coaches/studios, beauty salons and private masters, consultants/experts (business, marketing, legal, financial, psychology, coaching), medical/wellness (subject to applicable privacy/legal requirements), education (tutors, language schools, mentors), general appointment-based service companies.

## What's actually live — 2026-08-11

Verified working in production at `connect.hermeslogisticsus.com`:

- Specialist account (email + password), profile with name/role/location/bio
- **Telegram Login Widget** as an alternative to email/password sign-in for specialists (built and verified by the Telegram-bots workstream — ask that chat for anything Telegram-bot related)
- **Custom services per specialist**: each account can add its own services (name + duration) on top of the shared starter catalog, private to that account (and its own staff) unless shared globally. This is the actual foundation for supporting verticals beyond consulting-flavored placeholders — a nail artist can add "Gel manicure," a trainer can add "Personal training session," etc. Availability time-slot labels are still a fixed shared catalog (real calendar/date picking is a separate, larger piece of work, not done)
- **Public booking page**, no client account needed — share one link anywhere (site, Instagram, Telegram, WhatsApp, QR code, email)
- Client picks service + time, submits name/email, and identifies themselves via a WhatsApp/Telegram/Instagram handle instead of a phone number
- Double-booking the same slot is blocked automatically
- Client gets a token-based link to view/cancel their own booking, no login
- Specialist dashboard shows and copies their shareable public link
- **Personal 1:1 meeting mode** at a separate `/meet/` link: client states a topic instead of picking a service; returning clients (matched by email) auto-confirm, first-time requesters go to pending-approval; specialist confirms/declines from the dashboard and manually attaches the meeting link (Meet/Zoom/whatever) — no auto-generated video links, since that needs paid Google Meet API access
- **Language selector** on the public booking/meeting/manage pages — en/uk/ru/es/it/fr, same codes and names as the main Hermes site, detected from the browser and persisted per visitor
- **PWA installability**: web app manifest + service worker, so the specialist dashboard can be installed to a phone/desktop home screen
- **Business analytics** on the dashboard: total/confirmed/cancelled/pending bookings, repeat-client rate, meeting confirm rate, top services — computed live from the specialist's own booking data, no external service
- **Basic CRM**: a "Your clients" list aggregated from booking history (visit count, last visit, contact handle) with a private per-client note the specialist can save
- **Team / staff**: a business account can add staff members, each with their own services and availability; once staff exist, `/book` and `/meet` show a "choose your specialist" step and book against that staff member's own schedule. Solo specialists with no staff added are unaffected — behavior is identical to before. Removing a staff member keeps their past bookings on record (just detaches the staff link).

Everything else in this document is **planned or aspirational** — do not present it as available in current marketing copy.

## Planned — near term (tracked as tasks in this project)

- Vertical-specific flow polish (fitness, consulting, education, etc.): tailored copy/fields per industry, now that custom services unblock it at the data level
- Real availability (actual calendar dates/times per specialist/staff, not a shared fixed slot-label catalog) — needed before this can scale past a handful of businesses sharing 5 slot labels
- AI chat intake (client describes their request in plain language instead of filling a form) — **explicitly blocked on budget**: owner's rule is zero paid API spend until the business earns its first $3,000/month

## Planned — later / requires real infrastructure decisions

Automated reminders (confirmation, pre-visit, reschedule, cancellation, post-visit, rebooking prompts) — needs a paid email/SMS provider; calendar sync (Google Calendar and others) — needs a Google Cloud project and OAuth setup; payments/deposits/packages/subscriptions (provider and country-dependent, not started, involves real money); native iOS/Android apps, once the PWA is proven.

## Long-term vision: the personal digital assistant / "one AI brain"

This is the most ambitious part of the brief and the furthest from being built — recorded here so it isn't lost, not as a near-term commitment.

**The idea**: each business gets a digital assistant trained on that business's own material — website, service descriptions, social posts, past replies to customer questions/comments, booking/payment/cancellation policies, staff info, uploaded documents. One shared knowledge base and communication style, reused across every channel (in-app, website chat, Instagram, Facebook, WhatsApp, Telegram, future mobile apps) — a client can start a conversation on Instagram and finish booking on the site without repeating themselves, *where the underlying integrations support carrying that context*.

**What the assistant would do**: answer service/pricing/availability questions, help pick a specialist, take a booking request, handle common objections, send reminders, help reschedule/cancel, prompt rebooking, re-engage lapsed clients, escalate to a human for anything sensitive.

**Owner control is explicit and non-negotiable in the brief itself**: the business owner decides what gets answered automatically vs. what needs human sign-off, what the assistant is allowed to say, when a conversation escalates to a person, and what information it may never disclose. Financial, medical, legal, and conflict-sensitive exchanges route to a human per the owner's configured rules.

**Why this isn't started**: it needs, at minimum, a funded LLM API (blocked by the zero-budget rule above), real messenger platform integrations (Meta/WhatsApp Business API, Telegram Bot API — feasible but real setup work), and a knowledge-base/training pipeline that doesn't exist yet. Treat every bullet in this section as a future task to scope properly, not a spec to start building.

## Marketing copy on file (for reuse, not yet published anywhere)

**Main pitch:**
> Ваши услуги, расписание, клиенты и записи — в одной системе. Hermes Connect помогает предпринимателям и специалистам принимать онлайн-записи, показывать клиентам свободное время и управлять ежедневной работой бизнеса без бесконечных звонков, переписок и таблиц.

**Short pitch:**
> Вы всё ещё записываете клиентов через сообщения, звонки и блокнот? С Hermes Connect ваши клиенты смогут самостоятельно увидеть услуги, свободное время и отправить заявку на запись.

**Line worth reusing directly** (owner flagged this one as strong): *«Один клиент, одна история общения и один цифровой помощник во всех каналах»* — explains the multi-channel-continuity value without technical jargon.

Before publishing any of this copy externally, re-check it against the "what's actually live" section above — the brief itself warns against implying CRM, payments, AI, and native apps are already shipped.
