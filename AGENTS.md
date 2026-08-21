# Agent constraints

This repository is the public, static Elenkos Systems marketing site.

- Keep the deployable site Astro-only and static. Do not introduce Jekyll, Hugo, server-side handlers, analytics, authentication, or forms that collect data.
- Never expose private repository contents, report data, reviewer identities, AI assessments, credentials, internal endpoints, or customer information.
- Keep AI assessment output unavailable to the assigned human reviewer before independent submission in every explanation and diagram.
- Pin every GitHub Action and cross-repository source to an immutable full commit or digest. Disable persisted checkout credentials.
- Use Zed for the repository package contract and any future cross-repository dependency. Use pnpm only for the locked Astro toolchain.
- Do not add Flutter to the build unless it is a separately pinned, independently verified artifact with a measured accessibility or product benefit.
- Run `pnpm validate` and `zed validate --require-lock` before proposing a change.
- Never force-push, rewrite `main`, weaken Pages permissions, or bypass review controls.
