# Quality Hub

Personal multi-project quality dashboard for xixinikl projects.

`quality-hub` is the multi-project control room. It does not run tests and it
does not need access to business source code. It reads each project's published
dashboard JSON:

- `data/latest.json`
- `data/index.json`

## Setup

This repository is deployed with GitHub Pages:

https://xixinikl.github.io/quality-hub/

## Project Registry

`projects.json` is the only project registry. Each project needs:

- `projectId`: stable machine id
- `projectName`: display name
- `dashboardUrl`: per-project dashboard URL
- `repository`: GitHub `owner/repo`

Each project keeps its own daily acceptance workflow. The hub only aggregates.

## Add A Project

1. Add a per-project `quality-dashboard`.
2. Confirm `<dashboardUrl>/data/latest.json` is reachable over HTTPS.
3. Add the project entry to `projects.json`.
4. Push to `main`; GitHub Pages serves the updated hub.

The hub is laptop-independent: personal and company computers only push code.
Daily acceptance reports are read from GitHub Pages.
