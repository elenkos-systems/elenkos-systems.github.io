# Elenkos Systems marketing site

The public Astro source for [elenkos-systems.github.io](https://elenkos-systems.github.io).

Elenkos Systems is a quality-engineering company built around independent bug evaluation: an AI assessment and a randomly assigned, conflict-aware human review remain blind to one another until the human submits. Agreement can qualify both the reporter and reviewer for credits; material disagreement opens additional human adjudication.

## Verify locally

Requirements: Node.js 22.22.1+, pnpm 11.22.0, and Zed CLI 0.2.3.

```sh
zed validate --require-lock
zed install --frozen --install-mode copy
pnpm install --frozen-lockfile --ignore-scripts
pnpm validate
```

The site intentionally does not import Flutter. A Flutter web build would add a second runtime and a much larger supply-chain surface without improving this static marketing experience.

## Publishing

Pull requests run the locked Astro, repository-contract, and Zed checks. A push to `main` rebuilds the same source and deploys the certified `dist/` artifact through GitHub Pages using OIDC. No PAT or application secret is required.

See [SECURITY.md](SECURITY.md) for private vulnerability reporting guidance.
