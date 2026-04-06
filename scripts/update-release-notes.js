const fs = require('fs');
const { execSync } = require('child_process');

const currentVersion = require('../package.json').version;
const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf-8' }).trim();

let commits = '';
if (lastTag) {
  commits = execSync(`git log ${lastTag}..HEAD --oneline --no-decorate`, { encoding: 'utf-8' }).trim();
} else {
  commits = execSync('git log --oneline --no-decorate | head -10', { encoding: 'utf-8' }).trim();
}

if (!commits) {
  console.log('No commits found since last tag');
  process.exit(0);
}

const releaseNotesPath = 'RELEASE_NOTES.md';
const currentContent = fs.readFileSync(releaseNotesPath, 'utf-8');

const commitList = commits.split('\n').map(line => `- ${line}`).join('\n');
const newSection = `## v${currentVersion}\n\n${commitList}\n\n`;
const updated = currentContent.replace('# Release Notes\n\n', `# Release Notes\n\n${newSection}`);

fs.writeFileSync(releaseNotesPath, updated);
console.log(`✓ Updated release notes for v${currentVersion}`);
