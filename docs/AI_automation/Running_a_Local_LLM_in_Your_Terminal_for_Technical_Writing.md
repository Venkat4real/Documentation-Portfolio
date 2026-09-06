---
layout: docs
title: API Setup and Automation Guide
description: A guide for building and automating API documentation in the Fried Notes project.
---
# Running a local LLM in your terminal for technical writing

> A companion guide to [Using AI Agents for Technical Writing](./Using_AI_Agents_for_Technical%20Writing.html) and the [DDLC Prompt Library](./Prompt_Library.html). This guide covers installing a local LLM via [Ollama](https://ollama.com) and using it, entirely from the terminal, across the same DDLC stages.

---

## Table of contents

- [Why Run an LLM Locally](#why-run-an-llm-locally)
- [Prerequisites](#prerequisites)
- [Step 1: Install Ollama](#step-1-install-ollama)
- [Step 2: Pull a Model](#step-2-pull-a-model)
- [Step 3: Verify It Works](#step-3-verify-it-works)
- [Step 4: Feed It Files, Not Just Chat](#step-4-feed-it-files-not-just-chat)
- [Using the DDLC Stages from the Terminal](#using-the-ddlc-stages-from-the-terminal)
- [Scripting It: A Simple Review Pipeline](#scripting-it-a-simple-review-pipeline)
- [Choosing a Model](#choosing-a-model)
- [Local vs. hosted: when to use each](#local-vs-hosted-when-to-use-each)
- [Troubleshooting](#troubleshooting)

---

## Why run an LLM locally

Running a model on your own machine, instead of a hosted chat interface, matters for a few practical reasons specific to documentation work:

- **Confidential source material.** If you're drafting from unreleased API specs, internal tickets, or proprietary code, a local model never sends that content off your machine.
- **Scriptability.** A terminal LLM can be piped, chained, and dropped straight into a shell script or CI job—the same review prompts from the [prompt library](./Prompt_Library.html) can run unattended.
- **No per-call cost.** Once downloaded, a local model runs for free, which matters if you're batch-processing an entire docs folder (for example, running Stage 3 self-review across 40 topics).
- **Offline capability.** Useful for writers working with air-gapped or restricted environments.

The tradeoff: local models (especially ones that fit on a laptop) are generally less capable than the largest hosted models, so treat this as a good fit for high-volume, mechanical passes (style checks, drift detection, first-pass drafts) rather than the final accuracy pass on critical content.

---

## Prerequisites

- macOS, Linux, or Windows (Ollama supports all three)
- At least 8 GB RAM (16 GB+ recommended if you plan to run a 7 B+ parameter model comfortably)
- ~10 GB free disk space per model
- A terminal (Terminal.app, iTerm2, WSL, PowerShell, or your standard Linux shell)

---

## Step 1: install Ollama

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download the installer from [ollama.com/download](https://ollama.com/download) and run it—this adds the `ollama` command to your PATH automatically.

**Verify the install:**
```bash
ollama --version
```
You should see a version number printed back.

On Linux, Ollama typically runs as a background service after install. On macOS/Windows, the app runs in the background (menu bar / system tray) and starts the API automatically.

---

## Step 2: Pull a Model

Ollama's library includes general-purpose and coding-focused models. For technical writing work, a solid general-purpose starting point:

```bash
ollama pull qwen3
```

Or, for a smaller footprint on modest hardware:
```bash
ollama pull llama3.2:3b
```

This downloads the model weights to `~/.ollama/models` (or `%USERPROFILE%\.ollama\models` on Windows). You only need to do this once per model.

**Check what's installed:**
```bash
ollama list
```

---

## Step 3: Verify It Works

Start an interactive session:
```bash
ollama run qwen3
```

Type a prompt and press Enter. Exit with `/bye` or `Ctrl+C`.

For non-interactive, single-shot use—the pattern you'll use most for documentation work—pipe input directly:
```bash
echo "Summarize the purpose of a REST API rate limiter in two sentences." | ollama run qwen3
```

---

## Step 4: Feed it files, not just chat

The real value for documentation work is piping actual files into the model rather than typing prompts by hand. A few patterns:

**Pipe a file as context, with an instruction prepended:**
```bash
cat installation.md | ollama run qwen3 "Review the following Markdown doc for passive voice and sentences over 25 words. List issues only, don't rewrite:"
```

**Use a heredoc to combine an instruction with a longer prompt cleanly:**
```bash
ollama run qwen3 << 'EOF'
You are reviewing a documentation draft for terminology consistency.
Terminology list: sign in (not "log in"), workspace (not "org" or "team").

Draft:
$(cat draft.md)
EOF
```

**Save the output to a file instead of printing to screen:**
```bash
cat draft.md | ollama run qwen3 "Rewrite this in active voice, imperative mood for steps:" > draft-reviewed.md
```

---

## Using the DDLC stages from the terminal

Each stage from the [prompt library](./Prompt_Library.html) works the same way locally—the prompt content doesn't change, only how you invoke it.

### Plan
```bash
cat feature-ticket.txt | ollama run qwen3 "You are helping plan a new documentation topic. Propose an outline (H2 headings only) and list any information gaps. Do not write prose yet."
```

### Draft
```bash
cat api-spec.yaml | ollama run qwen3 "Draft a task-based topic from this API spec. Structure: H1, intro, Before you begin, numbered steps, Verify, Troubleshooting. Do not invent flag names or defaults not present in the spec — mark gaps as [NEEDS INPUT]." > draft.md
```

### Self-review
```bash
cat draft.md | ollama run qwen3 "Review this draft for style and structure only. Output a numbered issue list with line reference, category, and suggested fix. Do not rewrite." > self-review.md
```

### QA/BA review
```bash
cat draft.md | ollama run qwen3 "You are a QA engineer who has never seen this feature. Follow the steps exactly as written and narrate what you'd expect at each point. Flag any assumed knowledge or missing expected results." > qa-review.md
```

### Technical/peer review
```bash
cat draft.md source-code.py | ollama run qwen3 "Review every technical claim in the draft against the attached source. Mark each claim ✅ (confirmed), ⚠️ (unverifiable from source), or ❌ (contradicts source)." > tech-review.md
```

### Publish/maintain
```bash
git log --since="2 weeks ago" --pretty=format:"%s" | ollama run qwen3 "Draft categorized release notes (Added/Changed/Fixed/Deprecated) from these commit messages. Use plain, user-facing language." > release-notes.md
```

---

## Scripting it: a simple review pipeline

Because it's just a terminal command, you can wrap the self-review stage into a script that runs across an entire docs folder—the same kind of audit described in the [broken cross-reference example](./Using_AI_Agents_for_Technical%20Writing.html#core-use-cases), but for style and terminology instead of links:

```bash
#!/usr/bin/env bash
# review-all.sh — runs a self-review pass over every Markdown file in /docs

MODEL="qwen3"
PROMPT="Review this documentation file for style and structure issues only. Output a short numbered list. Do not rewrite the file."

find ./docs -name "*.md" | while read -r file; do
  echo "Reviewing: $file"
  output_file="${file%.md}.review.md"
  cat "$file" | ollama run "$MODEL" "$PROMPT" > "$output_file"
done

echo "Done. Review files written alongside each source file."
```

Run it with:
```bash
chmod +x review-all.sh
./review-all.sh
```

This is the same principle the CI-integrated agent pattern uses—it's just running on your machine instead of in a GitHub Action, which makes it a reasonable first step before wiring it into a pipeline.

---

## Choosing a model

| Use case | Suggested starting model | Notes |
|---|---|---|
| General drafting/review, modest hardware | `llama3.2:3b` | Runs comfortably on 8 GB RAM |
| General drafting/review, better hardware | `qwen3` | Stronger general reasoning, larger download |
| Code-heavy content (API docs, SDKs) | a coding-oriented model such as `qwen2.5-coder` or similar from `ollama.com/library` | Better at reading source code accurately |
| Very large context (long specs/whole repos) | check `ollama.com/library` for current large-context models, or use a `-cloud` tagged model if your hardware can't fit it locally | Hosted models run on Ollama's infrastructure rather than your machine—verify your organization's data policy before sending source material this way |

Check `ollama.com/library` for the current catalog, since available models change frequently.

---

## Local vs. hosted: when to use each

| | Local (Ollama, on your machine) | Hosted chat/API |
|---|---|---|
| Confidential source material | ✅ Stays on your machine | ⚠️ Depends on provider's data policy |
| Raw capability | Good, improving fast | Generally stronger, especially for long/complex reasoning |
| Cost at scale | Free after download | Per-token cost |
| Setup effort | One-time install + pull | None |
| Best fit in the DDLC | High-volume mechanical passes: self-review, drift checks, batch terminology audits | Technical/peer review on critical content, complex drafting where accuracy matters most |

A practical split many writers land on: run the mechanical, high-volume stages (Self-Review, batch link/terminology audits) locally, and reserve a hosted model for the stages where raw reasoning quality matters most (Draft on complex topics, Technical/Peer Review).

---

## Troubleshooting

- **`ollama: command not found`** — the install didn't add it to your PATH. On Linux it typically installs to `/usr/local/bin`; on macOS, `/usr/local/bin` or `/opt/homebrew/bin`. Run `which ollama` to check, or add the directory to your shell profile (`~/.zshrc`, `~/.bashrc`).
- **Model runs very slowly / falls back to CPU**—run `ollama ps` and check the `PROCESSOR` column. If it's not 100% GPU, the model likely doesn't fit in your available VRAM; try a smaller model size (for example, `:3b` instead of `:8b`).
- **Ran out of disk space mid-download** — models are large; check free space with `du -sh ~/.ollama/models` and remove unused models with `ollama rm <model-name>`.
- **Want it accessible to a script or another app rather than typed interactively** — run `ollama serve` (usually automatic) and call the local API directly:
  ```bash
  curl http://localhost:11434/api/generate -d '{
    "model": "qwen3",
    "prompt": "Summarize this changelog entry.",
    "stream": false
  }'
  ```

---

*Suggested location in a repo: `/docs/contributing/local-llm-terminal-setup.md`, linked from [ai-agents-for-technical-writers.md](./ai-agents-for-technical-writers.md) and [prompt-library-for-technical-writers.md](./prompt-library-for-technical-writers.md).*
