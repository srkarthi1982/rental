# Contributing to Ansiversa Rental

Thank you for your interest in improving Ansiversa Rental.

## How this product is used

This repository is the full Rental platform for `rental.ansiversa.com`.
Changes here should preserve the approved platform shell and keep the architecture
generic for cars, homes, equipment, and future rental categories.

## Contribution steps

1. Create a branch:

```bash
git checkout -b feature/my-change
```

2. Make your changes.
3. Run the app locally:

```bash
npm install
npm run dev
```

4. Ensure the product builds:

```bash
npm run typecheck
npm run build
```

5. Commit and push.
6. Open a pull request and clearly describe:

- What changed
- Why it changed
- Any impact on shared Ansiversa standards

## Guidelines

- Keep the platform generic until a vertical is explicitly approved.
- Do not hard-code Rental into a car-only architecture.
- Preserve shared auth/session/middleware behavior.
- Always update `AGENTS.md` after completing a repo task.
