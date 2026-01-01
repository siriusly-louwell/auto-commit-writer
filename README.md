# Auto Commit Writer

> AI-powered commit messages, PR descriptions, and changelog generation - all from your command line.

A TypeScript-powered CLI tool that automatically generates clean, conventional commit messages, pull request descriptions, and changelog entries directly from your git diffs. Stop spending time crafting commit messages and let AI do the heavy lifting.

## 🚀 Features

- **One-command commit generation** - Generate and optionally auto-commit in a single step
- **Smart PR descriptions** - Create comprehensive pull request descriptions from multiple commits
- **Advanced changelog automation** - Generate version-aware changelogs with contributor tracking and commit linking
- **Multi-provider AI support** - Works with OpenAI, Anthropic Claude, and Google Gemini
- **Context-aware** - Add custom context to guide AI generation
- **Flexible workflows** - Use with staged changes, commit history, or branch comparisons
- **Semantic versioning** - Automatic version bumping based on conventional commits
- **Zero configuration** - Works out of the box with environment variables

## 📦 Installation

Install globally via npm:

```bash
npm install -g auto-commit-writer
```

After installation, the `cg` command will be available globally in your terminal.

## ⚙️ Setup

### Prerequisites

You'll need an API key from at least one of these AI providers:

- [OpenAI](https://platform.openai.com/api-keys) (GPT models)
- [Anthropic](https://console.anthropic.com/) (Claude models)
- [Google AI Studio](https://aistudio.google.com/app/apikey) (Gemini models)

### Environment Configuration

Auto Commit Writer reads from your system's environment variables. You have two options:

#### Option 1: Using a .env file (Recommended)

Create a `.env` file in your project root or home directory:

```env
# Choose one or more providers
AI_PROVIDER=openai  # Options: openai, anthropic, gemini

# Add corresponding API key(s)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
```

**Important Notes:**

- Only `.env` files are currently supported (not `.env.local`, `.env.production`, etc.)
- The package reads OS environment variables, so ensure your `.env` is loaded
- You only need the API key for your chosen provider

#### Option 2: Set environment variables directly

**macOS/Linux:**

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
```

**Windows (Command Prompt):**

```cmd
set AI_PROVIDER=openai
set OPENAI_API_KEY=sk-...
```

**Windows (PowerShell):**

```powershell
$env:AI_PROVIDER="openai"
$env:OPENAI_API_KEY="sk-..."
```

### Required Environment Variables

| Variable            | Description                                             | Required           |
| ------------------- | ------------------------------------------------------- | ------------------ |
| `AI_PROVIDER`       | AI provider to use (`openai`, `anthropic`, or `gemini`) | Yes                |
| `OPENAI_API_KEY`    | Your OpenAI API key                                     | If using OpenAI    |
| `ANTHROPIC_API_KEY` | Your Anthropic API key                                  | If using Anthropic |
| `GEMINI_API_KEY`    | Your Google Gemini API key                              | If using Gemini    |

## 🎯 Usage

### Generate a Commit Message

Generate a commit message from your staged changes:

```bash
cg commit
```

**Output example:**

```
Generated Commit Message:

feat: add user authentication system

- Implement JWT-based authentication
- Add login and registration endpoints
- Create user session management
```

### Auto-Commit Changes

Generate a commit message and automatically stage and commit all changes:

```bash
cg commit --auto
```

This command will:

1. Stage all changes (`git add .`)
2. Generate an AI-powered commit message
3. Commit with the generated message

### Add Context to Generation

Provide additional context to help the AI generate more relevant messages:

```bash
cg commit --context "This fixes the login bug reported in issue #123"
```

The AI will consider your context when crafting the commit message.

### Generate a Changelog Entry

Create a changelog entry from your commit history:

```bash
cg changelog --from v1.0.0
```

**Basic output example:**

```
Generated Changelog:

### Added
- User authentication system with JWT support
- Login and registration API endpoints

### Fixed
- Session timeout issues
- Memory leak in background sync
```

### Advanced Changelog with Version Management

Generate a complete changelog with version header, contributors, and commit links:

```bash
cg changelog --from v1.2.0 --ver "1.2.0" --ver-bump auto --contributors --links
```

**Advanced output example:**

```
## [1.3.0] - 2024-12-01 to 2024-12-15

### Added
- Real-time collaboration features
- Export to PDF functionality

### Fixed
- Memory leak in background sync [abc1234]
- Authentication timeout issues

### Contributors
- Alice Johnson <alice@example.com>
- Bob Smith <bob@example.com>
```

### Generate a Pull Request Description

Create a comprehensive PR description from your branch changes:

```bash
cg pr
```

By default, this compares your current branch against `origin/main`.

**Specify a different base branch:**

```bash
cg pr --base origin/develop
```

**Include individual commit messages for more comprehensive analysis:**

```bash
cg pr --deep
```

**Add context to your PR description:**

```bash
cg pr --context "This PR implements the new design system discussed in RFC #456"
```

## 📚 Command Reference

### `cg commit`

Generate a commit message from staged changes.

**Options:**

- `--context <text>` - Add context to guide message generation
- `--auto` - Automatically stage and commit with the generated message

**Examples:**

```bash
cg commit
cg commit --auto
cg commit --context "Refactoring for performance"
cg commit --context "Fixes #42" --auto
```

### `cg changelog`

Generate a changelog entry from commit history with advanced version management.

**Options:**

| Option              | Type    | Description                              | Example                        |
| ------------------- | ------- | ---------------------------------------- | ------------------------------ |
| `--from <ref>`      | string  | Start from commit/tag/branch             | `--from v1.0.0`                |
| `--to <ref>`        | string  | End at commit/tag/branch (default: HEAD) | `--to v1.1.0`                  |
| `--ver <version>`   | string  | Current/base version (e.g., 1.0.0)       | `--ver "1.0.0"`                |
| `--ver-bump <type>` | string  | Version bump: auto, major, minor, patch  | `--ver-bump minor`             |
| `--aud <type>`      | string  | Audience: technical, end-user, both      | `--aud end-user`               |
| `--contributors`    | boolean | Show all contributors                    | `--contributors`               |
| `--links`           | boolean | Include commit links                     | `--links`                      |
| `--context <text>`  | string  | Additional context                       | `--context "Security release"` |

**Basic Examples:**

```bash
# Simple changelog from last tag
cg changelog --from v1.0.0

# With version header
cg changelog --from v1.0.0 --ver "1.0.0"

# Auto-bump version (patch/minor/major based on commits)
cg changelog --from v1.0.0 --ver "1.0.0" --ver-bump auto

# Explicit version bump
cg changelog --from v1.0.0 --ver "1.0.0" --ver-bump minor

# Full-featured release changelog
cg changelog --from v1.0.0 --ver "1.0.0" --ver-bump auto --contributors --links
```

**Using Git References:**

```bash
# From a tag
cg changelog --from v1.0.0

# From a commit hash
cg changelog --from abc1234

# Between two tags
cg changelog --from v1.0.0 --to v1.1.0

# Last 10 commits
cg changelog --from HEAD~10

# From a branch
cg changelog --from main
```

**Audience Targeting:**

```bash
# For end users (default) - plain language
cg changelog --from v1.0.0 --aud end-user

# For developers - technical details
cg changelog --from v1.0.0 --aud technical

# For both audiences - balanced
cg changelog --from v1.0.0 --aud both
```

**Version Management:**

```bash
# Auto-detect version bump from commits
cg changelog --from v1.5.0 --ver "1.5.0" --ver-bump auto

# Explicit patch bump (1.5.0 → 1.5.1)
cg changelog --from v1.5.0 --ver "1.5.0" --ver-bump patch

# Minor version bump (1.5.0 → 1.6.0)
cg changelog --from v1.5.0 --ver "1.5.0" --ver-bump minor

# Major version bump (1.5.0 → 2.0.0)
cg changelog --from v1.5.0 --ver "1.5.0" --ver-bump major
```

**Complete Examples:**

```bash
# Release changelog with all features
cg changelog \
  --from v2.0.0 \
  --ver "2.0.0" \
  --ver-bump auto \
  --aud both \
  --contributors \
  --links \
  --context "Major release with new authentication system"

# Quick hotfix changelog
cg changelog \
  --from v1.5.2 \
  --ver "1.5.2" \
  --ver-bump patch \
  --aud end-user

# Internal development log
cg changelog \
  --from HEAD~20 \
  --aud technical \
  --contributors
```

### `cg pr`

Generate a pull request description from multiple commits.

**Options:**

- `--base <branch>` - Base branch to compare against (default: `origin/main`)
- `--context <text>` - Add context to guide description generation
- `--deep` - Include individual commit messages in analysis for more comprehensive output

**Examples:**

```bash
cg pr
cg pr --base origin/develop
cg pr --deep
cg pr --base main --context "Part of the Q4 authentication initiative"
```

## 🔧 How It Works

1. **Diff Extraction** - Auto Commit Writer analyzes your git diff or commit history
2. **AI Processing** - Sends the diff to your chosen AI provider with specialized prompts
3. **Message Generation** - Receives a structured, conventional commit message or description
4. **Output** - Displays the generated text (and optionally commits it)

The tool uses different prompt strategies for commits, changelogs, and PR descriptions to ensure optimal results for each use case.

## 📖 Understanding Git References

The `--from` and `--to` options in `cg changelog` accept any Git reference:

| Reference Type  | Example       | Description                             |
| --------------- | ------------- | --------------------------------------- |
| **Git tag**     | `v1.0.0`      | A tagged commit (must be created first) |
| **Commit hash** | `abc1234`     | Short hash (7+ characters)              |
| **Full hash**   | `abc123...`   | Full 40-character hash                  |
| **Branch**      | `main`        | Branch name                             |
| **Remote**      | `origin/main` | Remote tracking branch                  |
| **Relative**    | `HEAD~5`      | 5 commits before HEAD                   |

**Finding Git references:**

```bash
# List all tags
git tag -l

# Show recent commits with hashes
git log --oneline -20

# Show all branches
git branch -a
```

**Important:** Git tags must exist before you can use them. Create tags with:

```bash
git tag v1.0.0
```

## 🤔 When to Use Each Command

| Command            | When to Use                         | What It Analyzes                   |
| ------------------ | ----------------------------------- | ---------------------------------- |
| `cg commit`        | Before committing changes           | Unstaged/staged changes (git diff) |
| `cg commit --auto` | Quick commits without manual review | Changes (auto-stages all)          |
| `cg changelog`     | Documenting releases or updates     | Commit history between references  |
| `cg pr`            | Creating pull requests              | All commits between branches       |
| `cg pr --deep`     | Complex PRs with many commits       | Commit messages + diffs            |

## 💡 Changelog Use Cases

### Pre-Release Review

```bash
# Check what will be in next release
cg changelog --from v1.0.4 --ver "1.0.4" --ver-bump auto
```

### GitHub Release Notes

```bash
# Generate release notes file
cg changelog \
  --from v2.1.0 \
  --ver "2.1.0" \
  --ver-bump minor \
  --aud end-user \
  --contributors \
  --links > RELEASE_NOTES.md
```

### Security Patch

```bash
cg changelog \
  --from v1.8.3 \
  --ver "1.8.3" \
  --ver-bump patch \
  --aud both \
  --context "Security patch for CVE-2024-XXXXX" \
  --links
```

### Feature Preview

```bash
# Show stakeholders what's coming
cg changelog \
  --from main \
  --to feature/ai-assistant \
  --aud end-user \
  --context "Preview of upcoming AI assistant"
```

### Weekly Development Summary

```bash
cg changelog --from HEAD~20 --aud technical --contributors
```

## ⚠️ Important Notes

- **Changelog requires commit history** - Make sure you have committed your changes and have a reference point (tag, commit hash, or branch)
- **Tags must exist** - `--from v1.0.0` only works if you've created that tag with `git tag v1.0.0`
- **Commit hashes always work** - You can always use commit hashes from `git log` even without tags
- **Version bumping requires --ver** - You must specify the current version with `--ver` to use `--ver-bump`
- **Committed changes required for PRs** - Run `cg pr` after committing your changes to your feature branch
- **API costs** - Each generation uses your AI provider's API and may incur costs
- **Review recommended** - Always review generated messages before using `--auto`

## 🎨 Best Practices

### For Commits

1. **Review before auto-commit** - Run `cg commit` first to review, then use `--auto` when confident
2. **Stage intentionally** - Stage related changes together for more coherent commit messages
3. **Use context** - Provide context for complex changes to get better results

### For Changelogs

1. **Use semantic versioning** - Take advantage of `--ver-bump auto` for proper version management
2. **Tag your releases** - Create git tags for important versions: `git tag v1.0.0`
3. **Target your audience** - Use `--aud` to match your changelog to your readers
4. **Link commits** - Enable `--links` for public repositories to help users trace changes
5. **Show appreciation** - Use `--contributors` to acknowledge all contributors

### For PRs

1. **Use --deep for complex PRs** - Include commit messages when your PR has many logical changes
2. **Add context** - Explain the "why" behind the PR with `--context`
3. **Review the output** - AI-generated descriptions are starting points - refine as needed

### AI Provider Selection

Different AI models have different strengths:

- **OpenAI (GPT-4)**: Great all-around performance, excellent at following instructions
- **Anthropic (Claude)**: Excellent at understanding context and nuance, very reliable
- **Google (Gemini)**: Fast and cost-effective for simpler tasks

## 🛠 Troubleshooting

### Changelog Issues

**"No commits found between v1.0.0 and HEAD"**

- The tag doesn't exist. Check available tags with `git tag -l`
- Create the tag: `git tag v1.0.0` or use a commit hash instead

**"Error: --ver-bump requires --ver to be specified"**

- You must provide the current version when using `--ver-bump`
- Example: `--ver "1.0.0" --ver-bump auto`

**"Could not detect repository URL for commit linking"**

- No git remote configured. Add one: `git remote add origin <url>`
- Or skip linking with: remove the `--links` flag

### General Issues

**"No changes detected"**

- For `cg commit`: Make sure you have unstaged changes
- For `cg changelog`: Ensure you have commits between your references
- For PRs: Verify you have committed changes on your branch

**"API key not found"**

- Verify your `.env` file exists and contains the correct variables
- Check that `AI_PROVIDER` matches your API key
- Ensure environment variables are loaded in your shell

**"Commit failed"**

- Check that you're in a git repository
- Verify you have changes to commit
- Ensure you have permission to commit to the current branch

## 🛣️ Roadmap

- [ ] Support for `.env.local`, `.env.production`, and other env file variants
- [ ] Interactive mode for reviewing and editing generated messages
- [ ] Custom prompt templates
- [ ] Configuration file support (`.cgrc`)
- [ ] Conventional Commits format customization
- [ ] Batch processing for multiple commits
- [ ] VS Code extension integration
- [ ] Git hooks integration
- [ ] Changelog file auto-updater (prepend to CHANGELOG.md)
- [ ] Additional AI provider support
- [ ] Changelog templates (Keep a Changelog, etc.)
- [ ] Breaking change detection and migration guide generation

## 📄 License

This project is currently unlicensed. Please contact the author for usage permissions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 💬 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review your environment variable configuration
3. Ensure git tags exist if using them in `--from` or `--to`
4. Open an issue on the project repository

## ✨ Credits

Built with:

- TypeScript
- Node.js
- Commander.js for CLI
- Simple-git for git operations
- Multiple AI provider SDKs

---

**Made with ❤️ for developers who value their time**
