---
title: repomap
slug: repomap-en
description: A command-line tool that documents multi-repo platforms with AI. It analyzes the code locally with AST, reconstructs how services connect to each other, and generates a navigable documentation site — without sending your code to the model.
tags:
  - { name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178c6' }
  - { name: 'Node.js', icon: 'simple-icons:nodedotjs', color: '#5FA04E' }
  - { name: 'Claude AI', icon: 'simple-icons:anthropic', color: '#D97757' }
  - { name: 'Ollama', icon: 'simple-icons:ollama', color: '#ffffff' }
  - { name: 'Jest', icon: 'simple-icons:jest', color: '#C21325' }
accent: '#D97757'
liveUrl: https://www.npmjs.com/package/@repomap/cli
repoUrl: https://github.com/Yeinthony/repomap
featured: true
role: Creator and lead developer
stats:
  - { value: '5', label: 'npm packages' }
  - { value: '~11.6K', label: 'lines of code' }
  - { value: '11', label: 'CLI commands' }
  - { value: '12+', label: 'languages via AST' }
challenges:
  - Reconstructing how services call each other using static analysis alone, without running the code
  - Tracing dynamic Spring chains (`@Value` → field → concatenation → HTTP call) with a fixed-point loop
  - Documenting with an LLM without sending it the full code or blowing up the token cost
learnings:
  - Designing an adapter architecture that makes adding a new LLM additive, not invasive
  - Real cost and latency optimization with LLMs (cache-warming, parallel generation, token budgeting)
  - How to model a complex pipeline (AST → graph → AI → render) while keeping it observable and extensible
contributions:
  - Design and implementation of the full monorepo (core, CLI and 3 adapters) published as 5 npm packages
  - Cross-repo static detection engine, including first-class support for Java/Spring Boot
  - Documentation-site renderer with an interactive graph and pan/zoom diagrams
---

You join a new project. Five services, three teams, zero documentation. Before you touch a single line of code, you spend days — sometimes weeks — reverse-engineering how it all fits together: which service calls which, where each endpoint lives, why that one environment variable breaks everything in production. **repomap exists so that takes two minutes instead of two weeks.**

## The problem

Architecture documentation has two enemies. The first is that **nobody writes it**: when the project is spread across several repos, no single person holds the whole map in their head. The second is that, when it does exist, **it goes stale the next day**: it's written once, the code keeps changing, and the docs become a tidy lie.

The AI tools that appeared to solve this usually bring two more problems: they ask you to send all your code to a cloud model — a hard no for many teams — and the token bill scales with the size of the repo.

## Why I built it

I built it because I lived all three: the pain of landing on a platform with no map, the frustration of maintaining docs that age on their own, and the discomfort of having to choose between documenting with AI or protecting privacy and budget.

I wanted a tool that **understands the architecture by reading the code, not guessing**, that can regenerate itself on every change, and that's honest with your code: the model never sees the whole thing, just enough to write good prose.

## What it does

You point repomap at the folder that holds your repos, wait two to five minutes, and get a framework-quality static HTML site:

```bash
npm install -g @repomap/cli
cd ~/workspaces/my-platform
repomap init      # detects your repos and asks for config
repomap generate  # analyzes, builds the graph and generates the docs
repomap serve     # opens it in the browser
```

The site includes a general **overview**, a **page per service**, an **integrations** page (who talks to whom), an **interactive graph** of dependencies, and **Mermaid diagrams** with pan and zoom. And it's not a one-off: in `watch` mode or via GitHub Action, the documentation **regenerates itself** when the code changes — and only the affected section, not the whole site.

## How it works

The design principle is a single sentence: **the analysis is done by code, the writing is done by AI.**

1. **AST per repo, in parallel.** Each repository is analyzed with [graphify](https://github.com/Yeinthony/graphify-y), a static-analysis engine in Python that extracts symbols and relationships without running anything. The custom static detectors run in parallel.
2. **Global merge.** The per-repo graphs are merged into a cross-repo graph, and a detector walks the code looking for HTTP calls between services.
3. **Compaction.** All that knowledge is distilled into a structural text skeleton: around **5% of the real code size**.
4. **AI.** That skeleton — and only that — is handed to the LLM (Claude, Claude Code or Ollama) to write the prose, examples and analogies.
5. **Render.** The result is turned into HTML, Markdown or JSON, and cached for incremental regeneration.

## The technical challenges

### Reconstructing the connections without running the code

The hardest part — and the one I'm proudest of — is detecting which service hits which **just by reading the code**. The detector looks for outbound calls (`fetch`, `axios`, `requests`, `httpx`...) and resolves each one to a target repo: by literal URL, by environment-variable convention (`${PAYMENTS_SERVICE_URL}/...`) or by service name in `docker-compose`. Every relation carries its evidence, so no connection is invented.

The extreme case was Java/Spring. There the URL is almost never written next to the call: it lives in a `@Value("${core-catalog.base-url}")` annotation, gets stored in a field, is concatenated with a path in another method, and only then is it used. I solved it with a **fixed-point tracer**: a loop that makes several passes propagating bindings (`@Value` → field → concatenation → `restTemplate.exchange(...)`) until no new relations appear. There's even a fallback for when the code picks the URL at runtime: it emits one synthetic call per possible base, so no dependency is lost.

### Sending the LLM only the 5% that matters

Sending all the code doesn't scale in cost or privacy. Compaction builds a layered digest with a token budget: first the most trustworthy context (READMEs and package.json, "the authors' ground truth"), then the static signals (endpoints, deps, docker) and finally the structural derivatives (cross-repo relations, graph communities). When the budget runs out, a symbol ranking guarantees that **the API surface holding the system up survives** the trimming: files backing an endpoint rank first.

### Making the AI cheap and fast

Documenting a platform means many calls to the model. So it wouldn't cost a fortune or take forever, I designed two things. An **adapter** pattern (Claude via API, Claude Code via subscription, local and free Ollama) that decouples the engine from any provider. And an orchestration with **cache-warming**: the call that writes the cacheable prefix fires first, and only once the cache is warm do the per-service calls open up in parallel — reusing that cache at ~90% off. Each call receives only its own slice of the graph.

## What I took away

repomap forced me to think like a systems designer, not just a programmer: a multi-stage pipeline that has to be observable, extensible and honest about its limits (the repo itself documents what it doesn't detect, instead of pretending it does everything). I learned to integrate LLMs for real — measuring tokens, latency and cost per provider — and to design an architecture where adding a language or a new model means adding, not rewriting. It's the project where I went furthest combining serious static analysis with AI applied with judgment.
