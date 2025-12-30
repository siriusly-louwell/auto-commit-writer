# Auto Commit Writer

> AI-powered commit messages, PR descriptions, and changelog generation - all from your command line.

A TypeScript-powered CLI tool that automatically generates clean, conventional commit messages, pull request descriptions, and changelog entries directly from your git diffs. Stop spending time crafting commit messages and let AI do the heavy lifting.

## 🚀 Features

- **One-command commit generation** - Generate and optionally auto-commit in a single step
- **Smart PR descriptions** - Create comprehensive pull request descriptions from multiple commits
- **Changelog automation** - Generate changelog entries from your current changes
- **Multi-provider AI support** - Currently supports and works with OpenAI, Anthropic Claude, and Google Gemini
- **Context-aware** - Add custom context to guide AI generation
- **Flexible workflows** - Use with staged changes, commit history, or branch comparisons
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
cg commit --auto-commit
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

Create a changelog entry from your current changes:

```bash
cg changelog
```

**Output example:**

```
Generated Changelog:

### Added
- User authentication system with JWT support
- Login and registration API endpoints

### Changed
- Updated session management logic
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
cg pr --include-commits
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
- `--auto-commit` - Automatically stage and commit with the generated message

**Examples:**

```bash
cg commit
cg commit --auto-commit
cg commit --context "Refactoring for performance"
cg commit --context "Fixes #42" --auto-commit
```

### `cg changelog`

Generate a changelog entry from current changes.

**Options:**

- `--context <text>` - Add context to guide generation

**Examples:**

```bash
cg changelog
cg changelog --context "Breaking changes in API v2"
```

### `cg pr`

Generate a pull request description from multiple commits.

**Options:**

- `--base <branch>` - Base branch to compare against (default: `origin/main`)
- `--context <text>` - Add context to guide description generation
- `--include-commits` - Include individual commit messages in analysis for more comprehensive output

**Examples:**

```bash
cg pr
cg pr --base origin/develop
cg pr --include-commits
cg pr --base main --context "Part of the Q4 authentication initiative"
```

## 🔧 How It Works

1. **Diff Extraction** - Auto Commit Writer analyzes your git diff or commit history
2. **AI Processing** - Sends the diff to your chosen AI provider with specialized prompts
3. **Message Generation** - Receives a structured, conventional commit message or description
4. **Output** - Displays the generated text (and optionally commits it)

The tool uses different prompt strategies for commits, changelogs, and PR descriptions to ensure optimal results for each use case.

## 🤔 When to Use Each Command

| Command                   | When to Use                         | What It Analyzes             |
| ------------------------- | ----------------------------------- | ---------------------------- |
| `cg commit`               | Before staging changes              | Changes (git diff)           |
| `cg commit --auto-commit` | Quick commits without manual review | Changes (auto-stages all)    |
| `cg changelog`            | Documenting releases or updates     | Changes                      |
| `cg pr`                   | Creating pull requests              | All commits between branches |
| `cg pr --include-commits` | Complex PRs with many commits       | Commit messages + diffs      |

## ⚠️ Important Notes

- **Unstaged changes required** - Make sure you have not yet staged your changes (`git add`) before running `cg commit` or `cg changelog`
- **Committed changes required for PRs** - Run `cg pr` after committing your changes to your feature branch
- **Branch comparison** - `cg pr` compares your current branch against the specified base branch
- **API costs** - Each generation uses your AI provider's API and may incur costs
- **Review recommended** - Always review generated messages before using `--auto-commit`

## 🎨 Best Practices

1. **Review before auto-commit** - Run `cg commit` first to review, then use `--auto-commit` when confident
2. **Stage intentionally** - Stage related changes together for more coherent commit messages
3. **Use context** - Provide context for complex changes to get better results
4. **Choose the right provider** - Different AI models have different strengths:
   - OpenAI (GPT-4): Great all-around performance
   - Anthropic (Claude): Excellent at understanding context and nuance
   - Google (Gemini): Fast and cost-effective

## 🐛 Troubleshooting

### "No changes detected"

- Make sure you have staged changes: `git add .`
- For PRs, ensure you have committed changes on your branch

### "API key not found"

- Verify your `.env` file exists and contains the correct variables
- Check that `AI_PROVIDER` matches your API key (e.g., if `AI_PROVIDER=openai`, you need `OPENAI_API_KEY`)
- Ensure environment variables are loaded in your shell

### "Commit failed"

- Check that you're in a git repository
- Verify you have changes to commit
- Ensure you have permission to commit to the current branch

### PR command shows no changes

- Make sure you're on a branch different from your base branch
- Verify you have committed changes (not just staged)
- Check that your base branch exists (e.g., `origin/main`)

## 🛣️ Roadmap

- [ ] Support for `.env.local`, `.env.production`, and other env file variants
- [ ] Interactive mode for reviewing and editing generated messages
- [ ] Custom prompt templates
- [ ] Configuration file support (`.cgrc`)
- [ ] Conventional Commits format customization
- [ ] Batch processing for multiple commits
- [ ] VS Code extension integration
- [ ] Git hooks integration
- [ ] Changelog file auto-updater
- [ ] Additional AI provider support

## 📄 License

This project is currently unlicensed. Please contact the author for usage permissions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 💬 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review your environment variable configuration
3. Open an issue on the project repository

## ✨ Credits

Built with:

- TypeScript
- Node.js
- Commander.js for CLI
- Simple-git for git operations
- Multiple AI provider SDKs

---

**Made with ❤️ for the developer who value their time**
