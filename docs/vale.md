# How to Run Vale Grammar and Style Checks Locally

Good documentation is not only about clear technical content. Consistent grammar, terminology, punctuation, and writing style are equally important.

When documentation grows across multiple pages and contributors, manually reviewing every sentence becomes difficult. **Vale** helps solve this problem by automatically checking documentation against a defined set of grammar and style rules.

This article explains what Vale is, why it is useful for technical writers, and how to run Vale locally against your documentation.

## What is Vale?

[Vale](https://vale.sh/) is an open-source prose linter. It works similarly to a code linter, but instead of checking source code, it checks **prose**.

Vale can identify issues such as:a

- Grammar and spelling problems
- Inconsistent terminology
- Passive voice
- Complex or unclear sentences
- Incorrect capitalization
- Unwanted words and phrases
- Punctuation issues
- Violations of an organization's writing style

For example, a style guide might require writers to use **"sign in"** instead of **"login"** when describing an action.

Vale can automatically detect these inconsistencies and report them before documentation is published.

## Why Use Vale for Technical Documentation?

Technical documentation is often written by multiple people. Without automated style checks, different contributors may use different terminology or writing styles.

For example, one page might say:

> Click the button to log in.

Another page might say:

> Click the button to login.

Both sentences may be understandable, but inconsistent terminology can make documentation feel less polished.

Vale allows teams to encode these writing preferences as rules and apply them consistently across the documentation.

A typical documentation workflow might look like this:

```text
Write documentation
       ↓
Run Vale locally
       ↓
Fix grammar/style issues
       ↓
Commit changes
       ↓
CI runs Vale
       ↓
Publish documentation