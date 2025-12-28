# AI-Powered Commit Message & PR Assistant

A TypeScript-powered tool that automatically generates clean **commit messages**, **pull-request descriptions**, and **changelog entries** directly from your diffs. Now also available as an **installable npm package** with automated commit capabilities.

This project can be used as a **drop-in script**, a **CLI tool**, or as the foundation for a **VS Code extension**.

## Features

- Installable as an **npm package** for easy CLI usage
- **Auto commit** support for streamlined workflows
- **AI adapter** system for flexible LLM provider integration
- **Refactored PR description generation** for improved quality and consistency
- Add **context** for more precise and relevant message generation
- Generate:
  - Commit messages
  - Pull request descriptions
  - Changelog entries
- Parses git diffs with consistent rules
- Produces concise, structured, and conventional outputs
- Designed for lightweight automation in existing workflows
- Fully written in TypeScript

## Why It Exists

Writing commit messages, PR descriptions, and changelogs is repetitive and time-consuming. This tool speeds up your workflow by turning raw diffs into readable, structured, and consistent outputs, reducing human error and maintaining high quality across projects.

## Tech Stack

- TypeScript
- Node.js
- Git diff parsing
- AI adapter system supporting multiple LLM providers (OpenAI, Anthropic, etc.)
- Optional VS Code extension scaffolding

## What's New

### AI Adapter

The new AI adapter architecture provides a flexible, provider-agnostic interface for integrating with different LLM services. Switch between OpenAI, Anthropic Claude, or other providers without changing your core logic.

### PR Description Refactor

Enhanced pull request description generation with improved structure, better context awareness, and more consistent formatting across different types of changes.

## Roadmap

- VS Code extension integration
- Configurable output styles
- Support for Conventional Commits
- Batch processing for multi-commit diffs
- Changelog file auto-updater
- Additional AI provider support
