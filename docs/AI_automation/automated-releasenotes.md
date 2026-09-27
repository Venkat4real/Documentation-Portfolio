---
layout: docs

title: Automated internal release notes

description: This document explains how the automated internal release notes works.

---

## Automated internal release notes

This Repository uses GitHub Actions to generate and update the [internal release notes](../internal_release_notes.html). When a pull request (PR) is merged into `main`, the workflow creates a summary (release notes) from the PR. The **PR title** is the summary. One summary is added for each PR merge and every Tuesday, system groups the collected release notes for the week into a weekly section.

The result is a lightweight Internal release notes that is generated from the work already reviewed and merged in GitHub.

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| GitHub Actions workflow | `.github/workflows/release-notes-cycle.yml` | Starts the automation, runs the script, and commits an updated Internal release notes file. |
| Update script | `.github/scripts/update-release-notes.js` | Formats PR details, adds entries, and creates the weekly archive. |
| Release-notes file | `docs/internal_release_notes.md` | Displays the current auto-generated section and archived weekly release notes. |

## Workflow triggers

The **Release Notes Cycle** workflow runs in the following conditions:

- **Merged PR:** when a PR targeting `main` is closed and merged. Closed PR that are not merged are ignored.

- **Weekly schedule:** every Tuesday at 9:00 AM UTC for the weekly archive.

- **Manual run:** users can manually trigger the workflow from GitHub.

## How the workflow works

### 1. When a pull request is merged

GitHub starts the workflow after a PR is merged into `main`. The workflow checks out `main`, installs Node.js, and runs the update script in `pr` mode.

The script reads the PR number, title, author, merge date, and URL. It then adds a release notes under **Auto-generated release notes** in `docs/internal_release_notes.md`.

For example, a merged PR titled `docs: Added troubleshooting steps for sign-in` produces an entry similar to:

```markdown
- **[#42](https://github.com/OWNER/REPOSITORY/pull/42)** - docs: added troubleshooting steps for sign-in *by @octocat, merged 2026-08-16.*