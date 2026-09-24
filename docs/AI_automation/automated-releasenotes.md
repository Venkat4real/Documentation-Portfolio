---
layout: docs
title: Automated Internal Release Notes
description: This document explains how the Automated Internal Release Notes works.
---

## Automated Internal Release Notes

This Repository uses GitHub Actions to generate and update the [internal release notes](../internal_release_notes.html). When a pull request (PR) is merged into `main`, the workflow creates a summary(release notes) from the PR. The **PR title** is the summary. One summary is added for each PR merge and every Tuesday, system groups the collected release notes for the week into a weekly section. 

The result is a lightweight Internal release notes that is generated from the work already reviewed and merged in GitHub. 

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| GitHub Actions workflow | `.github/workflows/release-notes-cycle.yml` | Starts the automation, runs the script, and commits an updated Internal release notes file. |
| Update script | `.github/scripts/update-release-notes.js` | Formats PR details, adds entries, and creates the weekly archive. |
| Release-notes file | `docs/internal_release_notes.md` | Displays the current auto-generated section and archived weekly release notes. |

## Workflow Triggers

The **Release Notes Cycle** workflow runs in the following conditions:

- **Merged PR:** When a PR targeting `main` is closed and merged. Closed PR that are not merged are ignored.
- **Weekly schedule:** Every Tuesday at 9:00 AM UTC for the weekly archive.
- **Manual run:** Users can manually trigger the workflow from GitHub.

## How the Workflow Works

### 1. When a Pull Request Is Merged

GitHub starts the workflow after a PR is merged into `main`. The workflow checks out `main`, installs Node.js, and runs the update script in `pr` mode.

The script reads the PR number, title, author, merge date, and URL. It then adds a release notes under **Auto-generated release notes** in `docs/internal_release_notes.md`.

For example, a merged PR titled `docs: Added troubleshooting steps for sign-in` produces an entry similar to:

```markdown
- **[#42](https://github.com/OWNER/REPOSITORY/pull/42)** -docs: added troubleshooting steps for sign-in *by @octocat, merged 2026-08-16.*
```

If the PR description includes an article link in this format, the entry also includes a **View Article** link:

```markdown
Article: [Sign-in troubleshooting](https://example.com/docs/sign-in-troubleshooting)
```

The script skips a PR that is already recorded, so re-running the workflow does not create a duplicate entry.

### 2. Manual Trigger

Users can manually trigger the release notes workflow.

To run the workflow manually:

1. Open the Repository on GitHub.
2. Select **Actions**.
3. Select **Release Notes Cycle** from the workflow list.
4. Select **Run workflow** and confirm the branch.
5. Choose **Run workflow**.

Use a manual run to retry a failed automation run or to archive the current entries before the next scheduled Tuesday run. A manual run uses weekly mode, so it creates the same weekly archive as the scheduled run.

<img src="image-2.png" alt="Manual trigger" width="800">

### 3. The weekly run archives the entries

On Tuesday, the workflow runs the script in `weekly` mode. It moves the release notes currently under **Auto-generated release notes** into a new section named with the preceding seven-day date range, then restores an empty auto-generated section.

```text
PR merged → entry added to Auto-generated release notes
Tuesday 09:00 UTC → entries moved to Release Update -Week of YYYY-MM-DD to YYYY-MM-DD
```

If no PR entries have been added since the previous archive, the weekly run makes no changes.

![Weekly automated release notes](image-1.png)

## Writing useful commit messages and PR titles

The automated release-note uses the **PR title**, not the individual commit messages. Write the PR title as a concise, reader-friendly summary of the change. Clear commit messages are still valuable for code review and troubleshooting, and using a consistent style makes both easier to scan.

This is only applicable for Internal release notes.

Use this pattern where it fits:

```text
type: concise description of the change
```

Common types include `docs`, `feat`, `fix`, and `test`.

| Change | Good commit message or PR title | Avoid |
| --- | --- | --- |
| New documentation | `docs: added installation prerequisites` | `updated docs` |
| Documentation correction | `docs: corrected API authentication example` | `fix` |
| New user-facing capability | `feat: added CSV export to activity reports` | `new feature` |
| Bug fix | `fix: prevent duplicate release-note entries` | `bug fixes` |
| Maintenance work | `chore: update Node.js version in release workflow` | `changes` |
| Refactoring | `refactor: simplify release-note date formatting` | `cleanup` |

For a PR containing several commits, give the PR a title that describes the outcome rather than repeating every implementation detail. For example:

```text
docs: published a guide on automated release notes [Automated Release Notes](docs/internal_release_notes.md)
```

This is more useful in the release notes than a vague title such as `final changes` or `updates`.

## Troubleshooting

- **A merged PR did not appear:** Confirm that it targeted and was merged into `main`, then inspect the Release Notes Cycle run in the Actions tab.
- **The weekly run did not create a section:** This is expected when the auto-generated section has no new PR entries.
- **The entry text is unclear:** Rename the PR title before merging whenever possible. The automation uses that title as the release-note summary.
- **The workflow cannot push changes:** Check that the workflow retains `contents: write` permission and that branch-protection rules allow GitHub Actions to push to `main`.
