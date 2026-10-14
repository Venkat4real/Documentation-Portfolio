---
layout: docs
title: Run Vale Before Pushing Documentation to GitHub
description: Install Vale, lint documentation locally, and resolve checks before merging a pull request.
category: Documentation tools
---
Vale is a command-line prose linter. It checks writing against style rules. Use it while editing documentation to catch style and terminology issues before you commit and push your changes.

Vale is configurable, so its results depend on the rules enabled by each repository. It can flag grammar and style patterns, but it does not replace a human review or guarantee that every sentence is correct.

## How this repository uses Vale

This repository configures Vale in the root `.vale.ini` file. Markdown files are checked against the built-in Vale rules and the Google Developer Documentation Style Guide. The project vocabulary in `.vale/styles/config/vocabularies/FriedNotes/accept.txt` allows project-specific terms such as `Ollama` and `Redoc`.

The GitHub Actions workflow in `.github/workflows/grammer-bot.yml` runs Vale on the `docs` directory when a pull request is opened or updated. It is not configured to run on every branch push. Running Vale locally before pushing lets you see and fix findings earlier.

## 1. Install Vale

Install the Vale command-line tool using a package manager for your operating system, or follow the [official installation instructions](https://vale.sh/docs/vale-cli/installation/). For example:

```sh
# macOS with Homebrew
brew install vale

# Windows with Chocolatey
choco install vale

# Debian or Ubuntu (if Vale is available in your configured package sources)
sudo apt install vale
```

Open a new terminal if needed, then confirm that Vale is available:

```sh
vale --version
```

## 2. Open a terminal at the repository root

Vale looks for `.vale.ini` as it checks files. Run the commands from the root of your clone, where that configuration file is located:

```sh
cd path/to/Documentation-Portfolio
```

If you are following this guide in another repository, use that repository's root directory instead.

## 3. Download or update the configured styles

Run this once after installing Vale, and again when the repository changes its style configuration:

```sh
vale sync
```

This syncs the style packages configured for the project. It requires an internet connection.

## 4. Check your changed documentation

To check all Markdown files in this repository's documentation folder, run:

```sh
vale docs
```

To check one file, pass its path instead:

```sh
vale docs/vale.md
```

Vale prints findings with the file name, line and column, a message, and the rule that produced the finding. A finding might look like this:

```text
docs/example.md:12:8: Use 'sign in' instead of 'login'. Google.Words
```

Here, `Google.Words` identifies the style rule. Find the corresponding sentence, decide whether the suggestion fits its meaning, and revise the text when appropriate. Run Vale again to confirm that the finding is resolved.

## 5. Fix findings

Vale suggestions are guidance, not automatic edits. Read each sentence in context. Fix genuine errors and follow the project's style where it makes sense. If a valid technical term is reported as a spelling issue, check whether it belongs in the project vocabulary before adding it; do not change accurate content just to silence a warning.

For each finding, use the reported file, line, and rule to locate the sentence. Correct the writing when the rule's suggestion fits. Then run Vale again on the file or directory to verify the change:

```sh
vale docs/your-file.md
```

If you think a finding is incorrect, review the rule and the sentence in context. Keep accurate technical content. For a valid project term that Vale repeatedly flags, propose adding it to the project vocabulary. If a finding remains unresolved, explain why in your pull request so reviewers can assess it.

## 6. Push your branch and open or update a pull request

Once you have reviewed the results, inspect and commit your changes:

```sh
git diff
git status
git add docs/your-file.md
git commit -m "docs: describe your change"
git push
```

Replace `docs/your-file.md` with the path to the file you changed. If you work on a branch, push that branch and open or update its pull request. The GitHub Actions Vale check will run there as well.

Pushing a branch does not, by itself, make this Vale workflow run. The workflow runs when a pull request is opened or updated (and can also be started manually). When it runs, the action is configured with `fail_on_error: true`; a failing Vale check appears in the pull request's checks. GitHub can block merging on that failure if the repository requires the check in its branch protection rules.

If the check fails, open the failed **Grammar Check** workflow from the pull request's **Checks** tab. Review its Vale annotations or log to find the file, line, and rule. Fix the relevant text locally, rerun Vale, then commit and push the fix to the same branch. The updated pull request triggers the check again. Once the required checks pass and the review requirements are met, use the pull request's **Merge** button to merge it.

## Troubleshooting

### `vale` is not recognized or not found

The installation directory may not be on your `PATH`, or the terminal may need to be restarted. Verify the installation and try `vale --version` again.

### Vale cannot find a style

Run `vale sync` from the repository root, then rerun the check. Confirm that `.vale.ini` is present and that you are using the intended repository configuration.

### A correct term is flagged

Vale does not know every product name, acronym, or project-specific term. Check the rule and project vocabulary; if the term is valid and should be accepted consistently, propose adding it to the vocabulary rather than suppressing a finding without context.

## Further reading

- [Vale documentation](https://vale.sh/docs/)
- [Vale installation instructions](https://vale.sh/docs/vale-cli/installation/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
