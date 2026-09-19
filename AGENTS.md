# AGENTS.md

## Agent skills

### Issue tracker

Issues live in GitHub Issues (ericbfriday/hot-for-e-skins-2026), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Defaults: five canonical roles, label strings equal to role names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Build discipline

`pnpm build` must pass with zero errors and zero warnings — warnings have historically been real bugs. The single-chunk output is deliberate. See `docs/architecture.md`.

### Where decisions live

Per-ticket decisions, deviations, and integration contracts are in each issue's resolution comment on GitHub (the richest source). `docs/spec/` is canon from the spec map; `docs/architecture.md` is the as-built module map and hard invariants; the final known-issues ledger is #32's resolution comment.
