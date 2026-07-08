<div align="center">

# 🦌 DeerFlow+ (deer-flow-plus)

## 🔓 **Built-in Execution Flow Tracing — ZERO LangSmith Required.**

> **不用上 LangSmith，不用花一分钱，你的 Agent 链路在本地就能被看见。**

**DeerFlow+ is a community-maintained fork of bytedance/deer-flow that ships with native execution observability. Every LangGraph checkpoint, every sub-agent call, every tool invocation, every model inference — inspectable right inside the chat UI, with zero external services, zero cloud round-trips, and zero per-trace fees.**

---

[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?logo=python&logoColor=white)](./backend/pyproject.toml)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](./Makefile)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Upstream](https://img.shields.io/badge/upstream-bytedance%2Fdeer--flow-blueviolet)](https://github.com/bytedance/deer-flow)
[![✅ No LangSmith Required](https://img.shields.io/badge/%E2%9C%85%20No%20LangSmith-Required-success)]()
[![Self-hosted tracing](https://img.shields.io/badge/tracing-self--hosted-informational)]()
[![100% Local](https://img.shields.io/badge/runs-100%25%20Locally-9cf)]()
[![0$ Fee](https://img.shields.io/badge/fees-%240-ff69b4)]()

**[ 🚀 Quick Start ](#quick-start) · [ ✨ Why DeerFlow+ ](#core-enhancements-over-official-bytedancedeer-flow) · [ 🔓 Zero LangSmith Deep Dive ](#why-zero-langsmith) · [ 📊 3-way Comparison ](#deerflow-vs-official-deerflow-vs-langsmith-saas) · [ 🔧 Architecture ](#architecture)**

> **Run agents. See every step. Pay nothing.** 🦌 → 🔍 → 💡
>
> *(Launch agents → inspect every checkpoint node → iterate faster — all without a single call to langchain.com.)*

</div>

---

## 📑 Table of Contents

- [🦌 DeerFlow+](#deerflow-deer-flow-plus)
  - [🔓 Why Zero LangSmith ](#why-zero-langsmith)
  - [📊 DeerFlow+ vs Official DeerFlow vs LangSmith SaaS](#deerflow-vs-official-deerflow-vs-langsmith-saas)
  - [✨ Core Enhancements over Official bytedance/deer-flow](#core-enhancements-over-official-bytedancedeer-flow)
  - [🚀 Quick Start](#quick-start)
    - [0. One-Line Agent Setup (for Claude Code / Codex / Cursor / Windsurf)](#0-one-line-agent-setup-for-claude-code-codex-cursor-windsurf)
    - [1. Clone & Config](#1-clone-config)
    - [2. Configure Models](#2-configure-models)
    - [3. Run with Docker (Recommended)](#3-run-with-docker-recommended)
    - [4. Run Locally (Development)](#4-run-locally-development)
    - [5. Access the App & Use Execution Flow 🔍](#5-access-the-app-use-execution-flow)
  - [🔧 Architecture](#architecture)
    - [How the Built-in Execution Flow Works (no LangSmith callbacks required)](#how-the-built-in-execution-flow-works-no-langsmith-callbacks-required)
  - [🧩 Advanced Config](#advanced-config)
    - [Sandbox Modes](#sandbox-modes)
    - [MCP Servers & Skills](#mcp-servers-skills)
    - [IM Channels (Feishu / Slack / Telegram)](#im-channels-feishu-slack-telegram)
    - [🔒 LangSmith — optional if you really want it](#langsmith-optional-if-you-really-want-it)
  - [🎯 Recommended Models](#recommended-models)
  - [📖 Documentation](#documentation)
  - [⚠️ Security Notice](#security-notice)
  - [🤝 Contributing](#contributing)
    - [Relation to Upstream bytedance/deer-flow](#relation-to-upstream-bytedancedeer-flow)
  - [📜 License](#license)
  - [🙏 Acknowledgments](#acknowledgments)

---

## 🔓 🛡️ Why **Zero LangSmith** ?

> **TL;DR** — DeerFlow already uses LangGraph. LangGraph's official way to "see what the agent is doing" is **LangSmith**, a paid SaaS run by LangChain Inc. in the US. DeerFlow+ gives you the same (and in many cases, **better-integrated**) execution trace visibility **100% locally inside the chat UI you already use**, with no accounts, no API keys, no per-trace billing, no data leaving your network.

### 🧮 LangSmith SaaS pricing vs. DeerFlow+ (spoiler: DeerFlow+ wins at every scale)

| What you get                | LangSmith (Free Tier) | LangSmith (Pro) | LangSmith (Team) | **DeerFlow+** |
|-----------------------------|:---------------------:|:---------------:|:----------------:|:-------------:|
| Traces / month              | **5,000** only        | 50,000          | 500,000          | **∞ Unlimited** |
| Price / month               | $0                    | **$39**         | **$299**         | **$0 Forever** |
| Runs in your browser / UI   | ❌ Opens external `smith.langchain.com` tab | ❌ External tab | ❌ External tab  | ✅ **Embedded right in the DeerFlow chat panel** |
| Data location               | ☁️ LangChain servers (USA) | ☁️ USA | ☁️ USA | ✅ **Local SQLite on your disk / private network only** |
| Works air-gapped / offline  | ❌ Impossible         | ❌ Impossible   | ❌ Impossible    | ✅ **Yes, fully works offline** |
| Works on corporate intranet | ❌ Usually blocked by egress firewalls / DLP | ❌ Still blocked | ❌ Still blocked | ✅ **Yes — no outbound traffic ever** |
| No LangChain account needed | ❌ Requires sign-up    | ❌ Requires billing | ❌ Requires enterprise contract | ✅ **Zero accounts, zero API keys** |
| GDPR / China data residency | ❌ US-hosted only     | ❌ US-hosted only | ✉️ Ask for enterprise (extra $$$) | ✅ **You own the data — compliance already solved** |

### 💸 Real-world math

If your DeerFlow+ agent runs 10 conversations/day × 20 steps each = 6,000 traces/month:

- with **LangSmith Free Tier**: ❌ **You're over quota on day 15.** Traces stop being recorded until next month.
- with **LangSmith Pro**: **$468 / year** just for basic tracing.
- with **LangSmith Team**: **$3,588 / year.**
- with **DeerFlow+**: ✅ **$0. Same (or better) visibility. Forever. And the UI is one click away inside chat.**

### 🔒 Privacy & Compliance

Running an agent for internal docs, customer tickets, or code that contains proprietary information?

- ❌ **LangSmith** uploads **every prompt, every tool argument, every model output, every checkpoint state** to third-party servers in the United States. Even with "self-hosted datasets," execution-level spans still transit the LangSmith API by default.
- ✅ **DeerFlow+** reads execution traces **directly from LangGraph's local SQLite checkpointer** at `backend/.deer-flow/checkpoints.db`. **Nothing leaves your machine.** No API calls, no callbacks, no telemetry. You can even pull the network cable and the trace panel keeps working perfectly.

### 🎚️ Native vs. External UX

With LangSmith you:
1. Start a chat in DeerFlow
2. Agent does something wrong / interesting
3. **Leave DeerFlow** → open a new tab → log in to LangSmith → filter by session → find your run → click 3 layers deep → finally see the spans
4. Context-switch back to DeerFlow to fix the prompt / rerun

With DeerFlow+ Execution Flow panel:
1. Start a chat in DeerFlow
2. Agent does something wrong / interesting
3. **Scroll down in the same window.** The Execution Flow panel is already there, live-updating with green/red status pills.
4. Click any step → input / output / metadata pop open inline.
5. Fix and rerun. **Zero context switch.**

---

## 📊 DeerFlow+ vs Official DeerFlow vs LangSmith SaaS

| Capability | Official bytedance/deer-flow | Official deer-flow **+ LangSmith Paid** | **DeerFlow+ (this repo)** |
|-----------|:---:|:---:|:---:|
| LangGraph super-agent harness | ✅ | ✅ | ✅ |
| Sub-agents, skills, sandboxes, MCP | ✅ | ✅ | ✅ |
| Multi-model providers | ✅ | ✅ | ✅ |
| **Chat-level execution trace UI** | ❌ *(no UI; use LangSmith)* | ❌ *(opens LangSmith in a new tab)* | ✅ **Embedded Execution Flow panel** |
| Per-step: status, node type, filters | ❌ Only via LangSmith UI | ✅ (LangSmith) | ✅ (built-in) |
| Click a step → checkpoint I/O + metadata | ❌ Only via LangSmith UI | ✅ (LangSmith) | ✅ (built-in) |
| Works without internet | ✅ for agent runs | ❌ **NO — LangSmith requires egress** | ✅ **Yes — 100% offline** |
| Cost for 10k traces / month | $0 agent + $?? for DIY solution | **$39 / mo (LangSmith Pro)** | **$0 forever** |
| Trace data stays on your network | N/A | ❌ Goes to USA | ✅ **Always** |
| Works inside mainland China | ✅ Agent runs fine | ❌ LangSmith blocked / very slow + data residency risk | ✅ **Zero issues** |
| Local SQLite checkpointer preserved | ✅ | ✅ | ✅ |
| vLLM / Ollama local LLM wrapper | ❌ (bring-your-own) | ❌ (bring-your-own) | ✅ `LocalChatModel` built-in |
| Showcase demo threads UI | ❌ | ❌ | ✅ `/workspace/demo` |
| Landing page → direct work mode | ❌ (marketing page first) | ❌ same | ✅ direct redirect |
| Skill scripts hardening (no hardcoded keys) | ❌ public skills may contain placeholders | ❌ same | ✅ API-key env-var only |
| MIT-licensed, fork-friendly | ✅ | ✅ *(LangSmith is separate & proprietary)* | ✅ Fully MIT |

---

## ✨ Core Enhancements over Official bytedance/deer-flow

| # | Feature | What it does |
|---|---------|--------------|
| **1** ⭐⭐⭐ | **🔓 Execution Flow panel · No LangSmith required** | **Built-in, 100% local trace UI for every LangGraph step.** Replaces the need for LangSmith SaaS entirely. Real-time, chat-embedded panel showing node phases (before/after agent & model), tool calls, middleware — all with status colors, filters, and click-to-expand checkpoint details. Zero external services, zero fees, zero data leaving your network. Works fully offline. |
| **2** | **🤖 Local LLM provider (vLLM / Ollama ready)** | Ships with `LocalChatModel` so you can run DeerFlow+ against **any OpenAI-compatible local inference endpoint**. Auto-normalizes multi-modal payloads and strips unsupported `thinking` params for gateways that don't speak them. |
| **3** | **🎬 Demo threads showcase** | `/workspace/demo` — browse pre-baked conversation demos. Perfect for onboarding teammates, internal reviews, and conference talks without firing up real LLM calls. |
| **4** | **🎨 Full-stack UI/UX polish** | Direct-to-workspace landing (no marketing page by default), responsive container widths so Execution Flow renders correctly on laptops and narrow monitors, safe clipboard guard for non-HTTPS deployments, Demo entry in sidebar. |
| **5** | **🐳 Docker production readiness** | Checkpointer SQLite database persists across container restarts via bind mount. Nginx config pre-wires the `/api/execution` route. `DEER_FLOW_ROOT` is auto-injected by the launch scripts. |
| **6** | **🔒 Skill-script security hardening** | Public image-generation / video-generation skills no longer ship with a hardcoded inline API key fallback. Keys must be provided via the `AGNES_API_KEY` env var — eliminating the risk of accidental credential leakage when redistributing forks. |

---

## 🚀 Quick Start

> **DeerFlow+ is a drop-in fork.** Every setup command from the official [bytedance/deer-flow](https://github.com/bytedance/deer-flow) Quick Start works identically below. If you already know how to run DeerFlow, you already know how to run DeerFlow+ — and you get the Execution Flow panel **for free, immediately, no extra config**.

### 0. One-Line Agent Setup (for Claude Code / Codex / Cursor / Windsurf)

```text
Help me clone deer-flow-plus if needed, then bootstrap it for local development by following the Quick Start section of https://raw.githubusercontent.com/<your-gh-handle>/deer-flow-plus/main/README.md
```

### 1. Clone & Config

```bash
# Clone this fork
git clone https://github.com/<your-gh-handle>/deer-flow-plus.git
cd deer-flow-plus

# Generate local config files (creates .env.example → .env, config.yaml.example → config.yaml)
make config
```

### 2. Configure Models

Edit `config.yaml` and define at least one model:

```yaml
models:
  # Option A — Cloud (OpenAI-compatible)
  - name: gpt-4o-mini
    display_name: GPT-4o Mini
    use: langchain_openai:ChatOpenAI
    model: gpt-4o-mini
    api_key: $OPENAI_API_KEY
    max_tokens: 4096
    temperature: 0.7

  # Option B — vLLM / Ollama / any OpenAI-compatible local endpoint
  - name: local-qwen2.5
    display_name: Qwen2.5-7B (Local vLLM)
    use: deerflow.models.local_provider:LocalChatModel   # DeerFlow+ addition
    base_url: http://localhost:8000/v1
    model: qwen2.5-7b-instruct
    max_tokens: 8192
```

Then set your API keys. Edit `.env` in project root (recommended):

```dotenv
TAVILY_API_KEY=your-tavily-key              # Optional but recommended for web search
OPENAI_API_KEY=your-openai-key
INFOQUEST_API_KEY=your-infoquest-key        # Optional (BytePlus search)
# AGNES_API_KEY=...                         # Only needed if you use the image/video skills
```

### 3. Run with Docker (Recommended)

```bash
make docker-init    # Pull sandbox image (once, or when image updates)
make docker-start   # Start all services (auto-detects sandbox mode from config.yaml)
```

Production:

```bash
make up     # Build images locally + start all production services
make down   # Stop & remove containers
```

### 4. Run Locally (Development)

```bash
make check       # Prerequisites: Node 22+, pnpm, uv, nginx
make install     # Backend + frontend deps
make setup-sandbox   # Optional: pre-pull sandbox Docker image
make dev         # Start everything (backend gateway, langgraph server, frontend dev server, nginx)
```

### 5. Access the App & Use Execution Flow 🔍

Open **http://localhost:2026** in your browser.

1. Pick a workspace and start a conversation.
2. Send any message that triggers the agent (e.g. "Search the web for the latest DeerFlow news and summarize.").
3. **Scroll to the bottom of the conversation.** You'll see the new **Execution Flow** panel live-updating with green/red pills, step names, node types, and timestamps.
4. Click **any row** to expand the full checkpoint I/O, metadata, phase (before/after agent / model / tool / middleware), and raw checkpoint state — all without leaving the chat. **No LangSmith sign-up, no browser tab switch, no API key, no fees.** ✅

---

## 🔧 Architecture

DeerFlow+ retains the upstream **3-layer separation** and adds one new, **purely additive** HTTP gateway router + one frontend panel:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Browser (frontend)                           │
│  ┌──────────────────────┐   ┌──────────────────────────────────────┐ │
│  │ Conversation messages│   │  🆕 Execution Flow panel (chat-end)  │ │
│  └──────────┬───────────┘   └──────────────────┬───────────────────┘ │
└─────────────┼──────────────────────────────────┼─────────────────────┘
              │ REST / WS                        │ REST GET
              ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Nginx Gateway (:2026)                         │
└─────────────┬──────────────────────────────────┬─────────────────────┘
              ▼                                  ▼
┌─────────────────────────────┐   ┌──────────────────────────────────┐ │
│  Gateway REST/WS (:8001)    │   │  🆕 execution/* router (NEW)     │ │
│  (messages/auth/workspaces) │   │  ├── /history/{thread_id}        │ │
└─────────────┬───────────────┘   │  └── /detail/{thread_id}/{ckpt}  │ │
              │                   └──────────────┬───────────────────┘ │
              ▼                                  ▼                     │
┌──────────────────────────────────────────────────────────────────────┤
│          LangGraph Harness Server (:2024) + SQLite Checkpointer      │
│   lead_agent → sub_agents → tools → model nodes → memory → sandbox  │
│   backend/.deer-flow/checkpoints.db  ←  DeerFlow+ reads DIRECTLY    │
└──────────────────────────────────────────────────────────────────────┘
```

### How the Built-in Execution Flow Works (no LangSmith callbacks required)

DeerFlow+ **does not rely on LangChain's tracing callbacks at all**, so it can't accidentally send spans anywhere. The Execution Flow feature is based entirely on **reading LangGraph's own local SQLite checkpointer** (`backend/.deer-flow/checkpoints.db`):

1. **LangGraph writes checkpoints.** Every node (agent / model / tool / middleware) runs through the standard LangGraph state machine. With the default SQLiteSaver checkpointer, each step writes a tuple into the on-disk SQLite database — exactly the same mechanism LangGraph uses for resume-on-crash and state persistence.
2. **DeerFlow+ adds a tiny read-only gateway router.** `backend/app/gateway/routers/execution.py` exposes two `GET` endpoints:
   - `GET /api/execution/history/{thread_id}?limit=1000` — groups checkpoints by `step_id` + annotates `node_type` (agent / model / tool / middleware / skill / harness) + `status` (success / error).
   - `GET /api/execution/detail/{thread_id}/{checkpoint_id}` — returns the full checkpoint `config`, `metadata`, `channel_values`, and raw `writes` so the UI can render exact node inputs and outputs.
3. **The frontend ExecutionFlow React component polls once on mount + on message settle**, renders status pills, filter chips (All / Agent / Model / Tool / Error), and a clickable detail drawer per step — all inside the existing conversation view.

This architecture has three massive advantages over a callback-based tracer (like LangSmith):

| Property | Callback tracing (LangSmith) | DeerFlow+ checkpointer-reading |
|---------|---|---|
| Spans are lost if tracing errors | ❌ Yes (callback exception drops the span) | ✅ **No.** Checkpoint was already written to SQLite by LangGraph regardless. |
| Works for historical sessions | ❌ Only if callbacks were enabled at trace time | ✅ **Yes.** Reconstruct any old thread from existing checkpoints. |
| Network dependency | ⚠️ Yes (every span POSTs outbound) | ✅ **None.** Pure local DB read. |

---

## 🧩 Advanced Config

### Sandbox Modes

DeerFlow+ supports all upstream sandbox execution modes:
- **Local** — runs sandbox code directly on the host
- **Docker** — runs in isolated Docker containers
- **Docker + Kubernetes** — provisions sandboxes via the optional `provisioner` service (enabled when `config.yaml` sets `sandbox.use: deerflow.community.aio_sandbox:AioSandboxProvider` with a `provisioner_url`)

See the upstream [Sandbox Configuration Guide](backend/docs/CONFIGURATION.md#sandbox).

### MCP Servers & Skills

DeerFlow+ supports configurable MCP Servers and extensible skills (including HTTP/SSE MCP with OAuth: `client_credentials` & `refresh_token` flows). See the upstream [MCP Server Guide](backend/docs/MCP_SERVER.md).

### IM Channels (Feishu / Slack / Telegram)

Receive tasks from IM — none of them need a public IP.

| Channel | Transport | Difficulty |
|---------|-----------|------------|
| Telegram | Bot API (long-polling) | Easy |
| Slack | Socket Mode | Medium |
| Feishu / Lark | WebSocket | Medium |

Minimal `config.yaml` snippet:

```yaml
channels:
  langgraph_url: http://localhost:2024
  gateway_url:   http://localhost:8001
  feishu:  { enabled: true, app_id: $FEISHU_APP_ID,  app_secret: $FEISHU_APP_SECRET  }
  slack:   { enabled: true, app_token: $SLACK_APP_TOKEN, bot_token: $SLACK_BOT_TOKEN }
  telegram:{ enabled: true, bot_token: $TG_BOT_TOKEN }
```

### 🔒 LangSmith — *optional* if you really want it

DeerFlow+ **doesn't need LangSmith**, and the Execution Flow panel is what 99% of users will want to use daily. But if for some reason you *also* want to mirror traces to LangSmith (e.g., for cross-team sharing on public internet), DeerFlow+ fully respects the standard `LANGSMITH_API_KEY` / `LANGCHAIN_TRACING_V2=true` env vars — exactly like upstream. Set them in `.env`:

```dotenv
# Optional. DeerFlow+ works perfectly without these.
LANGCHAIN_TRACING_V2=true
LANGSMITH_API_KEY=lsv2_pt_xxxx
```

---

## 🎯 Recommended Models

DeerFlow+ works with any LangChain `ChatModel` and any OpenAI-compatible endpoint via the built-in `LocalChatModel`.

Community favorites that the upstream DeerFlow team also recommends:
- **Doubao-Seed-2.0-Code** (Volcengine) — great for coding agents
- **DeepSeek-V3 / Kimi 2.5** — strong reasoning + Chinese
- **Qwen2.5-72B-Instruct / Llama-3.1-70B** via your own vLLM deployment — 100% private, with DeerFlow+'s `LocalChatModel`
- **GPT-4o / Claude 3.5 Sonnet / Gemini 2.5 Flash** via OpenRouter — plug-and-play with `base_url`

---

## 📖 Documentation

| Resource | Location |
|----------|----------|
| This README (DeerFlow+) | `./README.md` |
| Official DeerFlow documentation (upstream) | [bytedance/deer-flow docs](https://github.com/bytedance/deer-flow) |
| Config reference | `backend/docs/CONFIGURATION.md` |
| MCP Server guide | `backend/docs/MCP_SERVER.md` |
| Contributing guide (applies to both) | `CONTRIBUTING.md` |
| Official website (demos & news) | [deerflow.tech](https://deerflow.tech) |

---

## ⚠️ Security Notice

1. **DeerFlow+ intentionally removes all hardcoded skill-script API keys** (e.g. `image-generation`, `video-generation`). If you use those skills, supply keys via env vars (`AGNES_API_KEY`, etc.) — never commit them.
2. The Execution Flow router reads checkpoints read-only, but the SQLite file contains **full checkpoint state including tool args and model outputs**. Treat `backend/.deer-flow/checkpoints.db` as sensitive and don't expose the gateway (`:8001`) directly to the internet — always go through the fronting Nginx (`:2026`) in production.
3. DeerFlow inherits all upstream security boundaries: the code-execution sandbox must be isolated (Docker / Kubernetes modes for production), and you should restrict which skills are enabled in untrusted environments.

---

## 🤝 Contributing

Contributions to DeerFlow+ (the Execution Flow panel and this fork's extras) are very welcome!

### Relation to Upstream bytedance/deer-flow

DeerFlow+ is a **source-available community fork** that tracks [bytedance/deer-flow](https://github.com/bytedance/deer-flow) as its upstream. Our changes are intentionally **small, modular, and additive** so they can be rebased cleanly on top of upstream releases:

```
upstream main (bytedance/deer-flow)  →  deer-flow-plus/main (this repo: + execution/* router + ExecutionFlow.tsx + i18n + local_provider + demo + polish)
```

The Execution Flow change ships as **one commit on top of a base snapshot** — you can verify this with `git log --oneline` and review the diff as a single patch. This makes it trivial to:
- forward-port the feature to new upstream tags, or
- submit the execution trace feature as a clean **PR back to upstream** if the DeerFlow maintainers want to adopt it natively.

---

## 📜 License

DeerFlow+ is released under the **MIT License** — identical to the upstream bytedance/deer-flow project. See [`LICENSE`](./LICENSE).

---

## 🙏 Acknowledgments

- 🙌 The entire [bytedance/deer-flow](https://github.com/bytedance/deer-flow) team at ByteDance for building such a powerful, MIT-licensed Super Agent Harness. DeerFlow+ is a tribute to their great work — it simply would not exist without DeerFlow itself.
- The [LangGraph](https://github.com/langchain-ai/langgraph) team at LangChain for the excellent SQLite checkpointer design that makes the Execution Flow panel possible. DeerFlow+ chooses to read that local data directly rather than paying LangChain SaaS to re-serve it back to us — with zero disrespect intended. 😄
- **You**, the user reading this far — star this repo if it saved you a LangSmith bill. ⭐

