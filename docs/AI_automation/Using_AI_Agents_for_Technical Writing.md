---
layout: docs
title: API Setup and Automation Guide
description: A guide for building and automating API documentation in the Fried Notes project.
---

# Using AI agents for technical writing: a practical guide

> A working guide for technical writers on integrating AI agents into the documentation lifecycle—from research and drafting to review, localization, and maintenance.

---

## Table of contents

- [Why This Guide Exists](#why-this-guide-exists)
- [What "AI Agents" Means in a Docs Context](#what-ai-agents-means-in-a-docs-context)
- [Where AI Agents Fit in the Documentation Lifecycle](#where-ai-agents-fit-in-the-documentation-lifecycle)
- [Core Use Cases](#core-use-cases)
- [Setting Up an AI-Assisted Workflow](#setting-up-an-ai-assisted-workflow)
- [Prompting Patterns for Technical Content](#prompting-patterns-for-technical-content)
- [Quality Control: What AI Gets Wrong](#quality-control-what-ai-gets-wrong)
- [Governance and Review Checklist](#governance-and-review-checklist)
- [Tooling Landscape](#tooling-landscape)
- [Metrics to Track](#metrics-to-track)
- [FAQ](#faq)

---

## Why this guide exists

Technical writers are increasingly expected to produce more content, in more formats, faster without sacrificing accuracy. AI agents (LLM-based assistants that can read source material, generate drafts, and in some cases take multi-step actions) can absorb a meaningful share of the repetitive work, freeing writers to focus on structure, accuracy, and information architecture —the parts of the job that still require human judgment.

This guide is written for writers who work with structured content (DITA/XML, Markdown, or similar), publish to a Git-based repo, and want a repeatable, low-risk way to bring AI into their process.

---

## What "AI Agents" Means in a Docs Context

There's a spectrum, and it matters which point on it you're using:

| Type | What it does | Example use |
|---|---|---|
| **Chat assistant** | Answers one prompt at a time; no memory of your repo unless you paste content in | Rewriting a paragraph for clarity |
| **IDE/CLI-integrated assistant** | Reads your local files, can propose edits, runs in your terminal or editor | Generating a first draft of a new topic from source code comments |
| **Agent** | Can plan multi-step tasks, call tools (search docs, run scripts, open files), and iterate without a prompt for every step | Auditing an entire docs folder for broken cross-references and fixing them |
| **CI/CD-integrated agent** | Runs automatically on a trigger (for example a pull request) to check or generate content | Flagging outdated screenshots or version strings on every PR |

Most technical writing teams start with the first two and graduate to the third and fourth as trust and process maturity increase.

---

## Where AI Agents Fit in the Documentation Lifecycle

```
Research → Outline → Draft → Technical Review → Edit → Publish → Maintain
   ●          ●         ●            ○              ●        ○         ●
```
● = strong AI fit &nbsp;&nbsp; ○ = human-led, AI-assisted at most

- **Research**: Summarizing source code, API specs, release notes, or existing tickets into a working outline.
- **Outline**: Proposing information architecture (task vs. reference vs. concept) based on a rough brief.
- **Draft**: Generating first-pass prose for procedures, API references, release notes, and troubleshooting guides.
- **Technical Review**: AI can flag inconsistencies, but subject-matter accuracy still needs a human SME sign-off.
- **Edit**: Style/tone conformance, terminology consistency, readability scoring.
- **Publish**: Agent tools can open pull requests, run linters, and check links as part of CI.
- **Maintain**: Detecting drift between docs and source (a code sample referencing a deprecated flag).

---

## Core Use Cases

### 1. Drafting from source material
Feed an AI agent your source code, API schema (OpenAPI/Swagger), or engineering design doc and ask for a first-draft topic in your house style. Treat the output as a **skeleton**, not a final draft — verify every claim against the actual source.

### 2. Converting between formats
Agents are effective at mechanical conversions: DITA to Markdown, Markdown to structured JSON for a component library, or restructuring a wall of prose into a numbered procedure with prerequisites and expected results.

### 3. Release notes and changelogs
Point an agent at a diff, a set of merged pull requests, or a changelog file, and ask it to draft categorized release notes (Added / Changed / Fixed / Deprecated). This is one of the highest-ROI, lowest-risk use cases because the source of truth (the diff) is unambiguous.

### 4. Consistency and terminology audits
Agents can scan an entire docs repo for inconsistent terminology ("sign in" vs. "log in"), inconsistent heading capitalization, or divergence from a style guide, and propose a diff.

### 5. Localization prep and readability
Agents can flag idioms, culturally specific references, or overly complex sentence structures that will complicate translation — before the content goes to a localization vendor.

### 6. Troubleshooting content generation
Given a set of support tickets or error logs, an agent can draft candidate troubleshooting entries (symptom → cause → resolution), which a writer then verifies and slots into the existing troubleshooting guide.

### 7. PR-based documentation checks
An agent wired into your CI pipeline can review a pull request that changes docs and check for broken links, missing alt text, inconsistent code block languages, or outdated version numbers —commenting directly on the PR.

---

## Setting Up an AI-Assisted Workflow

A minimal, low-risk setup for a GitHub-hosted docs repo:

1. **Keep source of truth in the repo.** Style guide, terminology list, and templates should live as Markdown files in the repo itself (`/docs/contributing/style-guide.md`). This lets you feed them directly to an agent as context.
2. **Use a scratch branch for AI-generated drafts.** Never let an agent commit directly to `main`. A common pattern:
   ```
   git checkout -b ai-draft/release-notes-v2.4
   ```
3. **Chunk the work.** Ask for one topic or one section at a time rather than "write the whole docs site." Smaller units are easier to fact-check and produce more consistent quality.
4. **Require citations from source.** When asking an agent to draft from code or specs, explicitly instruct it to reference the specific function, endpoint, or file it drew from, so review is faster.
5. **Route through the same PR review process as human-authored content.** AI-generated content is not exempt from technical review, editorial review, and link/build checks.
6. **Log what was AI-assisted.** A simple convention — a front-matter flag `ai_assisted: true` or a note in the PR description — helps track quality over time and target audits.

---

## Prompting Patterns for Technical Content

**Give role, format, and constraints up front:**
```
You are drafting a task-based topic for a developer audience, following the
Google Developer Documentation Style Guide. Output in Markdown with this
structure: Title (H1), one-sentence intro, "Before you begin" (prerequisites
list), numbered steps, "Verify" section, "Troubleshooting" section.

Source material: [paste API spec / code / ticket]
```

**Ask for gaps, not just prose:**
```
Based on this source material, list any information you need to write this
topic accurately but that isn't provided (default values, error codes,
minimum permissions). Don't guess — flag it.
```

**Use it as a reviewer, not just a drafter:**
```
Review this topic against our style guide (attached) and terminology list
(attached). List every deviation with the line number and suggested fix.
Don't rewrite the whole topic — just list the issues.
```

**Constrain scope explicitly** to avoid an agent silently expanding or narrowing a task — "Only edit the 'Troubleshooting' section; do not modify any other section."

---

## Quality Control: What AI Gets Wrong

Be deliberate about where you place trust:

- **Fabricated specifics** — invented flag names, made-up default values, or plausible-but-wrong CLI output. Always verify against the actual source (code, API response, or a real terminal session), especially for anything with exact version numbers or command syntax.
- **Confident wrong sequencing** — an agent may reorder steps in a procedure in a way that reads fine but breaks a real dependency (suggesting a config step before a required install step).
- **Style drift over long documents** — quality and voice consistency can degrade across a very long single output; chunking mitigates this.
- **Stale training knowledge** — an agent's built-in knowledge of a specific product or API can be outdated; always ground it in the current source material rather than letting it draw from memory alone.
- **Over-confident troubleshooting content** — causal claims ("this error is always caused by X") should be checked against actual support data, not accepted at face value.

A reasonable working rule: **AI can generate the first 70%, but a human is accountable for the last 30% — the technical accuracy, the edge cases, and the final sign-off.**

---

## Governance and Review Checklist

Before merging any AI-assisted content:

- [ ] Every command, flag, and code sample tested or verified against the actual source/environment
- [ ] Terminology matches the repo's style guide / terminology list
- [ ] No fabricated defaults, version numbers, or error messages
- [ ] Technical SME has reviewed for accuracy (not just an editor)
- [ ] Links, cross-references, and anchors resolve correctly
- [ ] Content is scoped to only the intended topic/section
- [ ] Any AI-assistance is logged per your team's convention

---

## Tooling Landscape

This list is illustrative, not exhaustive, and the landscape moves quickly — evaluate against your team's security and data-handling requirements before adopting any tool:

- **Chat/IDE assistants**: general-purpose LLM chat interfaces; IDE-integrated coding/docs assistants
- **CLI/agentic coding tools**: terminal-based agents that can read a repo, propose diffs, and open pull requests
- **CI-integrated bots**: GitHub Actions-based bots that review PR for docs-specific issues (broken links, style violations, missing alt text)
- **Structured-authoring plugins**: AI features embedded in DITA/CCMS tools or static-site generators (docs-as-code frameworks)

---

## Metrics to Track

To justify and refine an AI-assisted workflow, track:

- **Time-to-first-draft** per topic type, before and after AI assistance
- **Review cycle count** (does AI-assisted content need more or fewer review rounds?)
- **Defect rate** — factual errors caught in review per 1,000 words, AI-assisted vs. fully human-authored
- **Terminology/style consistency score** (automate via linting)
- **Coverage** — number of topics kept up to date per release cycle

---

## FAQ

**Does AI replace the technical writer role?**
No — it shifts the role toward architecture, verification, and editorial judgment. The bottleneck in technical writing has rarely been "typing speed"; it's understanding the product, structuring information correctly, and knowing what's true. AI accelerates production but doesn't substitute for that understanding.

**Should AI-generated content be labeled as such in published docs?**
Generally, no — published docs should read as maintained by the team, and quality is the team's responsibility regardless of how a draft originated. Internal tracking (in PRs/commits) is more useful than a public label.

**What's the safest place to start?**
Release notes and changelogs generated from a diff or merged PR list — the source of truth is unambiguous, the risk of fabrication is low, and it's easy to verify.

---

*This guide is intended as a living document. Suggested location in a repo: `/docs/contributing/ai-agents-for-technical-writing.md`, linked from the main contributing guide.*
