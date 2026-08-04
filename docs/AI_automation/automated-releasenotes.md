---
layout: docs
title: GitHub Actions workflow
description: This page describes the GitHub Actions release notes workflow.
---

## GitHub Actions workflow: release notes automation

The source files for automated release notes are located at:

#### YAML file

Repository > .github > workflows > release-notes-cycle.yml

#### JavaScript file

Repository > .github > scripts > update-release-notes.js

This workflow automatically updates the repository's release notes file. It coordinates with the Node.js script.

### Triggers

The workflow runs in three scenarios:

- PR merge—when a pull request is merged to main.
- Weekly schedule—every Tuesday at 9:00 AM UTC.
- Manual trigger—via the manual workflow dispatch event from the Actions tab.

## What it does

### Step 1: Check out code

Clones the repository's main branch with full history.

### Step 2: Set up Node.js

Installs Node.js v24 and enables npm caching for faster builds.

### Step 3: Run the update script

If a PR is merged, the workflow runs in PR mode and adds the PR to the release notes. If scheduled or manually triggered, it runs in weekly mode, archives the week's PRs in a dated section, and resets the auto section.

### Step 4: Commit and push

Configures Git as the GitHub Actions bot, stages the updated `docs/internal_release_notes.md`, commits the changes, and pushes them to main. The workflow silently skips this step when no changes occur.

## The flow

PR merged > workflow triggers > adds entry to auto section > commits and pushes

Tuesday 9 AM > weekly mode triggers > rotates auto section into dated entry > commits and pushes

The workflow collects all PRs accumulated in the auto section over the past week, archives them in a dated section such as "Release update—week of 2024-01-15 to 2024-01-22," and resets the auto section.

![Weekly automated release notes](image-1.png)

### Run the workflow manually

Users can manually trigger the automation from GitHub. Access this screen from the following path:

Repository > Actions > All workflows > Release Notes Cycle > Run workflow

![Manual trigger](image-2.png)
