# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Commands

- Run dev server: `deno task dev`
- Run all tests: `deno task test`
- Run specific test:
  `deno test --allow-net --allow-read --allow-env --allow-ffi tests/unit/<test_file>.ts`
- Generate types: `deno task types`
- Lint code: `deno lint`

## Code Style Guidelines

- Imports: Group by external dependencies first, then internal modules
- Types: Use TypeScript properly with `strict: true`
- Error handling: Use `ts-results` library with `Ok/Err` pattern
- Response format: Follow consistent status/message pattern in JSON responses
- Use camelCase for variables and functions, PascalCase for classes
- Log errors appropriately with context (e.g.,
  `console.error("[server error] - ..."`)
- Use async/await for asynchronous operations
- Config should be loaded from config.json file with type assertions
