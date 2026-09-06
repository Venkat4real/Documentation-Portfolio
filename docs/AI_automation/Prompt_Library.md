---
layout: docs
title: API Setup and Automation Guide
description: A guide for building and automating API documentation in the Fried Notes project.
---
# Prompt library for technical writers: a DDLC-based approach

> A companion article to [Using AI Agents for Technical Writing](./Using_AI_Agents_for_Technical%20Writing.html), providing ready-to-use prompts mapped to each stage of the Documentation Development Life Cycle (DDLC).

---

## Table of contents

- [Why Map Prompts to the DDLC](#why-map-prompts-to-the-ddlc)
- [The DDLC at a Glance](#the-ddlc-at-a-glance)
- [Stage 1: Planning & Research](#stage-1-planning--research)
- [Stage 2: Drafting](#stage-2-drafting)
- [Stage 3: Self-Review](#stage-3-self-review)
- [Stage 4: QA / BA Review](#stage-4-qa--ba-review)
- [Stage 5: Technical/Peer Review](#stage-5-technicalpeer-review)
- [Stage 6: Publish & Maintain](#stage-6-publish--maintain)
- [Prompt Design Principles](#prompt-design-principles)
- [Quick-Reference Table](#quick-reference-table)

---

## Why map prompts to the DDLC

Most prompting advice treats AI as a single-purpose drafting tool. In practice, the highest-leverage use of AI in documentation work comes from switching its **role** at each stage of the lifecycle—sometimes it's the drafter, sometimes it's an adversarial reviewer, sometimes it's a stand-in for a persona you don't have easy access to (like a QA engineer or business analyst).

Treating each DDLC stage as a distinct prompt—with its own role, inputs, and constraints—produces far more reliable output than one long, multi-purpose prompt.

---

## The DDLC at a glance

```
Plan → Draft → Self-Review → QA/BA Review → Technical/Peer Review → Publish → Maintain
  1       2          3              4                   5               6         7
```

Each stage below includes:
- **Purpose** — what this stage is for
- **AI's role** — the persona it should adopt
- **Example prompt** — copy-paste starting point
- **What to watch for** — where the output still needs a human check

---

## Stage 1: Planning and research

**Purpose:** turn a rough brief, ticket, or source artifact into a scoped outline before any prose is written.

**AI's role:** research assistant / information architect.

**Example prompt:**
```
You are helping plan a new documentation topic. I'll give you a source
artifact (an API spec, code diff, or feature ticket). Based on it:

1. Propose a topic type: concept, task, or reference (per the Diátaxis model).
2. Propose an outline with H2-level headings only.
3. List any information gaps — things you'd need from an engineer or PM
   to write this accurately, that aren't in the source material.
4. Do not write any prose yet. Outline and gap list only.

Source material:
[paste API spec / diff / ticket]
```

**What to watch for:** verify the proposed topic type actually matches your audience's need—AI tends to default to "task" topics even when a concept explanation is what's missing.

---

## Stage 2: Drafting

**Purpose:** generate a first-pass draft from an approved outline and verified source material.

**AI's role:** drafting assistant, writing in your house style.

**Example prompt:**
```
You are drafting a task-based documentation topic for a developer audience,
following [style guide name, e.g., Google Developer Documentation Style Guide].

Structure:
- H1 title
- One-sentence introduction
- "Before you begin" (prerequisite list)
- Numbered steps (imperative mood, one action per step)
- "Verify" section (how the reader confirms success)
- "Troubleshooting" section (2-3 likely failure points)

Constraints:
- Do not invent flag names, defaults, or output examples. If something isn't
  in the source material, write [NEEDS INPUT: describe what's missing]
  instead of guessing.
- Match the terminology in the attached glossary exactly.

Source material:
[paste verified spec/code/ticket]

Glossary:
[paste terminology list]
```

**What to watch for:** scan for any `[NEEDS INPUT: ...]` markers before moving on—don't let the next stage's reviewer waste a pass catching something the drafter already flagged as missing.

---

## Stage 3: Self-review

**Purpose:** Have the AI critique its own (or your own) draft before it goes to a human reviewer, catching the cheap, mechanical issues so human review time is spent on substance.

**AI's role:** your own harshest editor—style and structure only, not a technical authority.

**Example prompt:**
```
Review the following draft against our style guide and terminology list
(both attached). Do not rewrite the topic. Instead, output a numbered list
of issues, each with:
- Line/section reference
- Issue category (style / terminology / structure / clarity / passive voice)
- Suggested fix (one sentence)

Also flag:
- Any sentence over 25 words
- Any step that isn't in imperative mood
- Any place where a term from the glossary is used inconsistently

Draft:
[paste draft]

Style guide:
[paste or reference style guide]

Glossary:
[paste terminology list]
```

**What to watch for:** this stage is deliberately scoped to style/structure, not technical accuracy—an AI reviewing its own technical claims tends to rubber-stamp them. Save accuracy checking for Stage 5.

---

## Stage 4: QA / BA review

**Purpose:** simulate the perspective of a QA engineer or business analyst—someone who might try to follow the steps, or who cares whether the documented behavior matches the intended requirement—before it reaches a real reviewer with limited time.

**AI's role:** a skeptical QA engineer or BA, not a writer.

**Example prompt (QA persona):**
```
You are a QA engineer who has never seen this feature before. Follow these
instructions exactly as written, step by step, and narrate what you would
do and what you would expect to see at each step.

Flag anything where:
- A step assumes knowledge or a prior action that wasn't stated
- The expected result isn't specified, so you wouldn't know if it worked
- Two steps could be interpreted as being in the wrong order
- An edge case or error path is unaddressed

Do not fix the draft. Just narrate your attempt and list blocking issues.

Draft:
[paste draft]
```

**Example prompt (BA persona):**
```
You are a business analyst validating that this documentation matches the
original requirement/acceptance criteria. Compare the draft against the
requirements below and list:

1. Any documented behavior that isn't in the requirements (possible scope
   creep or an undocumented feature that should be flagged to the PM)
2. Any requirement that isn't reflected in the documentation (a gap)
3. Any place where the documented behavior appears to contradict the
   stated requirement

Requirements/acceptance criteria:
[paste requirements or user story]

Draft:
[paste draft]
```

**What to watch for:** this is a simulation, not a substitute for real QA or BA sign-off on anything customer-facing or safety-relevant—treat its output as a pre-check that reduces (not eliminates) the burden on the actual reviewer.

---

## Stage 5: Technical/peer review

**Purpose:** a close, adversarial read for factual accuracy and completeness—the step immediately before a subject-matter expert's review, meant to reduce the number of round trips with a busy engineer.

**AI's role:** a skeptical technical reviewer, explicitly instructed to distrust unverified claims—including its own, if it was the drafter.

**Example prompt:**
```
You are a senior technical reviewer. Review this draft as if you do not
trust any claim that isn't directly supported by the attached source
material (code, API spec, or logs).

For each claim in the draft:
- If it's directly supported by the source, mark it ✅
- If it's plausible but not directly confirmed by the source, mark it ⚠️
  and explain what would need to be verified
- If it contradicts the source, mark it ❌ and explain the contradiction

Also check:
- Every command/flag/parameter name against the source, character-for-character
- Every claimed default value against the source
- Whether any step sequence in the draft could break a real dependency

Draft:
[paste draft]

Source material:
[paste verified spec/code/logs]
```

**What to watch for:** this prompt only reduces risk if the source material you attach is itself authoritative and current—garbage in, confident garbage out.

---

## Stage 6: Publish and maintain

**Purpose:** Catch drift between published docs and the current state of the product, and keep release notes and changelogs current.

**AI's role:** auditor / diff-summarizer.

**Example prompt (drift check):**
```
Compare this published documentation topic against the current API
response / CLI output / config schema below. List every place where the
documentation is out of date, including:
- Renamed or removed parameters
- Changed default values
- New required steps not reflected in the docs

Published topic:
[paste current doc]

Current source of truth:
[paste current API response / schema / CLI output]
```

**Example prompt (release notes from a diff):**
```
Draft categorized release notes (Added / Changed / Fixed / Deprecated) from
the following list of merged pull requests. Use plain, user-facing language
— not commit-message shorthand. If a PR's purpose is unclear from its title
and description alone, list it under "Needs clarification" instead of
guessing.

Merged PRs:
[paste PR titles + descriptions, or a diff]
```

**What to watch for:** drift-check prompts are only as good as the "current source of truth" you provide—pull it live from the actual system, not from memory or an old snapshot.

---

## Prompt design principles

A few patterns worth carrying across every stage above:

1. **One role per prompt.** Don't ask the same prompt to draft and review—the model tends to under-critique work it just produced in the same context. Separate the persona clearly, ideally in separate sessions.
2. **Forbid guessing, explicitly.** Every prompt above includes an instruction to flag gaps rather than fill them—this single line does more to reduce fabrication than almost anything else.
3. **Constrain output format.** Asking for a structured list of issues (not a rewritten draft) at review stages keeps the AI from silently making decisions that should be yours.
4. **Attach the actual source, every time.** Prompts that rely on the model's background knowledge of a product/API will drift from reality; prompts that require it to cite the attached source stay grounded.
5. **Scope the ask.** "Only check the Troubleshooting section" produces a more useful result than "review this doc," especially for long topics.

---

## Quick-reference table

| Stage | AI role | Primary output | Human accountable for |
|---|---|---|---|
| Plan | Research assistant | Outline + gap list | Confirming scope and topic type |
| Draft | Drafting assistant | First-pass prose | Verifying every technical claim |
| Self-Review | Style/structure editor | Issue list | Deciding which fixes to apply |
| QA/BA Review | QA engineer / BA persona | Blocking issues + requirement gaps | Real QA/BA sign-off |
| Technical/Peer Review | Skeptical technical reviewer | Claim-by-claim verification | Final technical accuracy |
| Publish/Maintain | Auditor / diff-summarizer | Drift report / release notes | Confirming source of truth is current |

---

*Suggested location in a repo: `/docs/contributing/prompt-library-for-technical-writing.md`, linked from [ai-agents-for-technical-writers.md](./ai-agents-for-technical-writers.md).*
