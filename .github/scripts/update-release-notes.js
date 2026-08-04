const fs = require('fs');
const path = require('path');
const https = require('https');

const mode = process.argv[2];
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const eventPath = process.env.GITHUB_EVENT_PATH;
const releasePath = path.resolve(__dirname, '../../docs/internal_release_notes.md');

if (!['pr', 'weekly'].includes(mode)) {
  console.error('Usage: node update-release-notes.js <pr|weekly>');
  process.exit(1);
}

if (!repo) {
  console.error('GITHUB_REPOSITORY is required.');
  process.exit(1);
}

if (!token) {
  console.error('GITHUB_TOKEN is required.');
  process.exit(1);
}

function readReleaseNotes() {
  if (!fs.existsSync(releasePath)) {
    return '# Release Notes\n\n## Auto-generated release notes\n- This section receives automated updates\n';
  }
  return fs.readFileSync(releasePath, 'utf8');
}

function writeReleaseNotes(content) {
  fs.writeFileSync(releasePath, content, 'utf8');
}

function formatEntry(pr) {
  const number = pr.number;
  const title = (pr.title || '').replace(/\s+/g, ' ').trim();
  const url = pr.html_url || `https://github.com/${repo}/pull/${number}`;
  const author = pr.user?.login || 'unknown';
  const mergedAt = pr.merged_at ? pr.merged_at.slice(0, 10) : (pr.closed_at ? pr.closed_at.slice(0, 10) : new Date().toISOString().slice(0, 10));
  
  // Extract article link from PR body
  let articleLink = '';
  if (pr.body) {
    const linkMatch = pr.body.match(/Article:\s*\[.*?\]\((.*?)\)/i);
    if (linkMatch && linkMatch[1]) {
      articleLink = ` - [View Article](${linkMatch[1]})`;
    }
  }
  
  return `- **[#${number}](${url})** - ${title} *by @${author}, merged ${mergedAt}.*${articleLink}`;
}

function insertIntoAutoSection(content, block) {
  const marker = '## Auto-generated release notes';
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Could not find marker section '${marker}' in ${releasePath}`);
  }

  const afterMarker = content.indexOf('\n', markerIndex) + 1;
  const before = content.slice(0, afterMarker);
  const remainder = content.slice(afterMarker);

  // If there's a placeholder, remove it
  const placeholder = '- This section receives automated updates';
  let cleanRemainder = remainder.trimStart();
  if (cleanRemainder.startsWith(placeholder)) {
    cleanRemainder = cleanRemainder.slice(placeholder.length).trimStart();
  }

  return before + block + '\n' + cleanRemainder;
}

function alreadyContains(content, prNumber) {
  return content.includes(`[#${prNumber}]`) || content.includes(`PR #${prNumber}`);
}

async function runPrMode() {
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('GITHUB_EVENT_PATH is missing or invalid.');
    process.exit(1);
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) {
    console.log('No pull_request payload found. Skipping.');
    return;
  }

  if (!pr.merged) {
    console.log(`PR #${pr.number} was closed without merge. Skipping.`);
    return;
  }

  const content = readReleaseNotes();
  if (alreadyContains(content, pr.number)) {
    console.log(`PR #${pr.number} already exists in release notes. Skipping.`);
    return;
  }

  const entry = formatEntry(pr);
  const updated = insertIntoAutoSection(content, entry);
  writeReleaseNotes(updated);
  console.log(`Added PR #${pr.number} to release notes.`);
}

function formatWeekRange() {
  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = since.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);
  return `Week of ${startDate} to ${endDate}`;
}

async function runWeeklyMode() {
  const content = readReleaseNotes();
  const marker = '## Auto-generated release notes';
  const markerIndex = content.indexOf(marker);
  
  if (markerIndex === -1) {
    console.error('Marker not found.');
    return;
  }

  const afterMarker = content.indexOf('\n', markerIndex) + 1;
  const nextSectionIndex = content.indexOf('\n## ', afterMarker);
  
  let autoSectionContent = '';
  let restContent = '';
  
  if (nextSectionIndex === -1) {
    autoSectionContent = content.slice(afterMarker).trim();
    restContent = '';
  } else {
    autoSectionContent = content.slice(afterMarker, nextSectionIndex).trim();
    restContent = content.slice(nextSectionIndex).trim();
  }

  const placeholder = '- This section receives automated updates';
  if (!autoSectionContent || autoSectionContent === placeholder) {
    console.log('No new PRs in the auto-section. Nothing to rotate.');
    return;
  }

  const dateLabel = formatWeekRange();
  const newSection = `## Release Update - ${dateLabel}\n\n${autoSectionContent}\n\n`;
  const resetAutoSection = `${marker}\n- This section receives automated updates\n\n`;
  
  const updated = content.slice(0, markerIndex) + resetAutoSection + newSection + restContent;
  writeReleaseNotes(updated);
  console.log('Rotated auto-generated notes into a new weekly section.');
}

(async () => {
  try {
    if (mode === 'pr') {
      await runPrMode();
    } else {
      await runWeeklyMode();
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

