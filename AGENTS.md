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

## Repository-local Git worktrees

- Create or use a Git worktree only when the human operator explicitly authorizes it for the current task. Concurrency or a dirty checkout is not permission by itself.
- Put every authorized worktree at `<repository-root>/tmp/worktrees/<name>`; from the repository root, use `./tmp/worktrees/<name>`. Never place worktrees beside repositories or organization directories.
- Keep `tmp`, `temp`, `tmp/worktrees`, and `temp/worktrees` ignored in the repository-root `.gitignore`. Do not commit files from those directories.
- Relocate or remove a worktree only when the operator explicitly requests it. Before removal, preserve and publish intended changes, verify its commit is represented on the target branch, and confirm there are no tracked, untracked, ignored-sensitive, or in-use files that must survive. Remove it with `git worktree remove <path>` without `--force`; never delete a worktree directory with `rm`.
