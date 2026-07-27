# Contributing

Thanks for helping grow the Spartan NG ecosystem.

## Setup

```bash
npm install
npm start          # site at http://localhost:4200
npm run build:lib  # library → dist/ngx-spartan-color-picker
npm run build:site
```

## Guidelines

- Keep components modern Angular: signals, `input()` / `model()`, `OnPush`, native control flow.
- Peer on `@spartan-ng/brain` — do not vendor overlay behavior.
- Style with Spartan CSS variables / Tailwind tokens so the picker matches helm.
- Prefer accessibility fixes and small API surface over feature sprawl.
- Run `npm test` and `npm run build:lib` before opening a PR.

## Pull requests

1. Keep changes focused.
2. Ensure `npm test`, `npm run build:lib`, and `npm run build:site` succeed.
3. Add a short note on why the change helps Spartan apps.
