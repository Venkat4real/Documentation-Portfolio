---
layout: docs
title: Automated release notes with GitHub Actions
description: Learn how the release notes workflow records merged pull requests and creates a weekly archive.
---

## Automated release notes with GitHub Actions

This repository uses GitHub Actions to generate and update the [internal release notes](../internal_release_notes.md) . When a pull request (PR) is merged into `main`, the workflow creates an entry from the PR metadata. Each Tuesday, it groups the accumulated entries into a dated weekly section.

The result is a lightweight release history that is generated from the work already reviewed and merged in GitHub.

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| GitHub Actions workflow | `.github/workflows/release-notes-cycle.yml` | Starts the automation, runs the script, and commits an updated release-notes file. |
| Update script | `.github/scripts/update-release-notes.js` | Formats PR details, adds entries, and creates the weekly archive. |
| Release-notes file | `docs/internal_release_notes.md` | Contains the current auto-generated section and archived weekly sections. |

## Workflow triggers

The **Release Notes Cycle** workflow runs in the following situations:

- **Merged PR:** A PR targeting `main` is closed and merged. Closed PRs that are not merged are ignored.
- **Weekly schedule:** Every Tuesday at 9:00 AM UTC.
- **Manual run:** A repository maintainer starts the workflow from the Actions tab.

## How the workflow works

### 1. A pull request is merged

GitHub starts the workflow after a PR is merged into `main`. The workflow checks out `main`, installs Node.js, and runs the update script in `pr` mode.

The script reads the PR number, title, author, merge date, and URL. It then adds an entry under **Auto-generated release notes** in `docs/internal_release_notes.md`.

For example, a merged PR titled `docs: add troubleshooting steps for sign-in` produces an entry similar to:

```markdown
- **[#42](https://github.com/OWNER/REPOSITORY/pull/42)** - docs: add troubleshooting steps for sign-in *by @octocat, merged 2026-08-16.*
```

If the PR description includes an article link in this format, the entry also includes a **View Article** link:

```markdown
Article: [Sign-in troubleshooting](https://example.com/docs/sign-in-troubleshooting)
```

The script skips a PR that is already recorded, so re-running the workflow does not create a duplicate entry.

### 2. The workflow commits the update

If the script changes the release-notes file, GitHub Actions commits and pushes the update to `main` as `github-actions[bot]`. If there is nothing new to write, the commit step completes without creating a commit.

### 3. The weekly run archives the entries

On Tuesday, the workflow runs the script in `weekly` mode. It moves the entries currently under **Auto-generated release notes** into a new section named with the preceding seven-day date range, then restores an empty auto-generated section.

```text
PR merged → entry added to Auto-generated release notes
Tuesday 09:00 UTC → entries moved to Release Update - Week of YYYY-MM-DD to YYYY-MM-DD
```

If no PR entries have been added since the previous archive, the weekly run makes no changes.

![Weekly automated release notes](image-1.png)

## Writing useful commit messages and PR titles

The generated release-note entry uses the **PR title**, not the individual commit messages. Write the PR title as a concise, reader-friendly summary of the change. Clear commit messages are still valuable for code review and troubleshooting, and using a consistent style makes both easier to scan.

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
docs: publish a guide to automated release notes
```

This is more useful in the release notes than a vague title such as `final changes` or `updates`.

## Run the workflow manually

To run the workflow outside its normal schedule:

1. Open the repository on GitHub.
2. Select **Actions**.
3. Select **Release Notes Cycle** from the workflow list.
4. Select **Run workflow** and confirm the branch.
5. Choose **Run workflow**.

Use a manual run to retry a failed automation run or to archive the current entries before the next scheduled Tuesday run. A manual run uses weekly mode, so it creates the same weekly archive as the scheduled run.

<img src="image-2.png" alt="Manual trigger" width="800">

## Troubleshooting

- **A merged PR did not appear:** Confirm that it targeted and was merged into `main`, then inspect the Release Notes Cycle run in the Actions tab.
- **The weekly run did not create a section:** This is expected when the auto-generated section has no new PR entries.
- **The entry text is unclear:** Rename the PR title before merging whenever possible. The automation uses that title as the release-note summary.
- **The workflow cannot push changes:** Check that the workflow retains `contents: write` permission and that branch-protection rules allow GitHub Actions to push to `main`.
