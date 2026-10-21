---
layout: docs
permalink: /blog/index.html
title: "Testing a User Guide with Claude Desktop: A Joplin Pilot"
date: 2026-10-21
category: AI-assisted docs
categories: [ai-assisted-docs]
tags: [claude, computer-use, joplin, vale, docs-as-code]
difficulty: Intermediate
description: "I used Claude Desktop's Computer use to test one section of the Joplin user guide against the real app, fix the steps, and replace the screenshots."
---

I always wanted to use Claude Desktop. For some time I put it off, and then I finally bought the Claude subscription.

What does it do? It works like a human. It can open an app, click through it, and look at the screen the way I would.

## The problem with chat-only AI

For some time I was using ChatGPT, Claude, and Rovo (free versions) in chat and in the terminal. They had two big limitations for documentation work:

1. They could not update screenshots in a document.
2. They could generate documents, but they could not keep them up to date.

A guide that was correct at release slowly drifts away from the product. Keeping it current means opening the app, following every step, and retaking screenshots. That is exactly the part chat tools could not do.

## The test case

I wanted to see whether an AI could test a user guide for me. I already had a [user guide](https://venkat4real.github.io/Documentation-Portfolio/Joplin_User_guide.html) for [Joplin](https://joplinapp.org/), an open-source note-taking app, so I asked Claude to read the guide and verify it against the current app.

> **Note:** The Joplin user guide is a work in progress and is not complete yet.

It did.

Claude tested the "Create your first note" section of the Joplin user guide against Joplin 3.6.14 on Windows using Computer use. It fixed the steps, replaced 2 screenshots, passed Vale, and the change went out as a pull request.

This is only a pilot.

## Workflow

1. **Scope.** I set the scope (one section, two screenshots), the branch name, privacy rules, and limits: no push, no sign-ins, no settings changes.
2. **Access.** Claude turned on Computer use for the Joplin app and connected the repo folder. The OneDrive copy of the repo was confirmed as the right folder.
3. **Read the guide.** Claude read the section, the two old screenshots and the Vale config.
4. **Test in Joplin.** Claude dismissed an update prompt, clicked New note, and typed a neutral "Meeting notes" sample.
5. **Capture.** Windows key + Print Screen could not be sent, so Claude used its own screen capture for both screens.
6. **Crop and redact.** Both images were cropped to the Joplin window, a personal note title was blurred, and the PNGs replaced the old files.
7. **Edit and check.** Claude rewrote steps 2 and 3 and the alt text, then ran Vale: no new alerts.
8. **Commit.** Claude created `joplin-pilot` and committed locally.

## Findings

- **Cost:** about 13 million raw tokens (about 1.7 million effective) over 74 replies. Fewer, larger steps would cut this most.

<img src="{{ '/image-2.png' | relative_url }}" alt="Claude usage statistics" />
- **Screenshots:** Computer use cannot press Print Screen. Its own captures are 1456 px JPEGs saved as PNG: fine at width 600, but less sharp than native screenshots.
- **Commit:** Claude committed without asking first. For the full run, state whether Claude should commit or leave changes uncommitted.

## What's next

The pilot answered the main question: an AI can now do the hands-on part of doc maintenance, not just the writing. The next step is a full run across more sections of the guide, with clearer instructions on commits and larger steps to bring the token cost down.
