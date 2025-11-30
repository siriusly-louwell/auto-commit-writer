# AI-Powered Commit Message & PR Assistant

A TypeScript-powered tool that automatically generates clean **commit messages**, **pull-request descriptions**, and **changelog entries** directly from your diffs.

This project can be used as a **drop-in script** or as the foundation for a future **VS Code extension**.

## Features

- Parses git diffs with consistent rules  
- Generates concise and structured commit messages  
- Produces PR descriptions with summaries, change lists, and context  
- Creates changelog-ready entries  
- Designed for lightweight automation in existing workflows  
- Fully written in TypeScript

## Why It Exists

Writing commit messages and PR descriptions is repetitive. This tool speeds up your workflow by turning raw diffs into readable, conventional outputs while keeping quality and structure consistent across projects.

## Tech Stack

- TypeScript  
- Node.js  
- Git diff parsing  
- OpenAI/LLM API (or other model providers)  
- Optional VS Code extension scaffolding

## Roadmap

- VS Code extension integration  
- Configurable output styles  
- Support for Conventional Commits  
- Batch processing for multi-commit diffs  
- Changelog file auto-updater
