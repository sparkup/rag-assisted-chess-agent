# RAG‑Assisted Chess Agent

> A production‑oriented, **agent‑assisted chess analysis system** showcasing how classical engines, vector retrieval (RAG), and modern web architectures can be combined - with a clear path toward future LLM‑driven autonomy.

## Project Overview

**RAG‑Assisted Chess Agent** is an intelligent chess assistant designed to support players and learners with analysis, contextual knowledge, and educational content.

This repository represents an **initial foundation project**: it focuses on putting the right technical building blocks in place rather than delivering a fully autonomous AI agent. The system is intentionally designed to be **extended over time**, particularly toward the integration of a reasoning‑capable LLM that could evolve the assistant into a more autonomous, decision‑making agent.

In its current form, the project demonstrates how a human‑in‑the‑loop, agent‑assisted workflow can be implemented in a clean, production‑ready architecture.

## Live Demo

[**Current working demo version**](https://chess-agent.demo.sparkup.dev)

> The live demo showcases the current agent‑assisted capabilities. This repository itself focuses on code and architecture rather than deployment.

## Key Idea & Long‑Term Vision

Today, the system operates as an **agent‑assisted decision support tool** :

- It analyzes chess positions
- Retrieves contextual opening knowledge via vector search (RAG)
- Surfaces relevant educational resources
- Leaves final decisions entirely to the user

The **long‑term vision** (illustrated in the architecture diagrams) is to integrate a reasoning LLM capable of:

- Interpreting a live FEN game state
- Combining engine evaluations, opening knowledge, and retrieved context
- Producing higher‑level strategic explanations and recommendations

This repository therefore serves both as :

- A **technical showcase** of what is already implemented
- A **conceptual starting point** for a more advanced, autonomous chess agent in the future

## Current Features

- **Play against Stockfish** directly from the UI
- **Chess position analysis** powered by Stockfish
- **Vector‑based search (RAG)** over chess openings and knowledge
- **YouTube Data API integration** for curated educational content
- Modular frontend–backend separation
- Fully containerized services for local reproducibility

---

## Architecture Overview

The system is composed of clearly separated services:

- **Frontend** — Angular application providing the user interface
- **Backend** — FastAPI REST service orchestrating logic and integrations
- **Chess Engine** — Stockfish for evaluations and move suggestions
- **Vector Store** — Milvus for semantic retrieval of chess knowledge
- **Embedding Model** — `sentence‑transformers` for text embeddings

Architecture diagrams:

- [Architecture diagram (SVG)](docs/diagram.svg)
- [Architecture diagram (Mermaid source)](docs/diagram.mmd)

---

## Design Notes & Feasibility Studies

This project is supported by a small set of focused technical documents that explore key design decisions and feasibility constraints. These documents are part of the project narrative and help explain _why_ certain architectural choices were made.

### Chess Agent Feasibility Study

[`docs/chess-agent-feasibility-study.md`](docs/chess-agent-feasibility-study.md)

This document explores the feasibility of building a chess-focused agent by combining classical engines, retrieval-based knowledge, and future LLM-driven reasoning. It covers:

- The role and limitations of chess engines (e.g. Stockfish)
- How Retrieval-Augmented Generation (RAG) can complement engine analysis
- Early design trade-offs between assistance and autonomy
- Constraints that influenced the current agent-assisted approach

It serves as a conceptual foundation for the project and frames the long-term evolution toward a more autonomous chess agent.

### Chessboard Integration (Frontend)

[`docs/ngx-chessboard.md`](docs/ngx-chessboard.md)

This document focuses on frontend integration choices around interactive chessboards, with a particular emphasis on `ngx-chess-board`. It discusses:

- Why `ngx-chess-board` was selected over alternative libraries
- Integration considerations within an Angular application
- UX and interaction constraints for analysis-oriented workflows
- Limitations and future improvement areas for the board component

This document complements the backend architecture by detailing how users interact with the system at the UI level.

---

## Tech Stack

- **Frontend:** Angular (TypeScript)
- **Backend:** FastAPI (Python)
- **Chess Engine:** Stockfish
- **Vector Database:** Milvus
- **Embeddings:** sentence‑transformers
- **External APIs:** YouTube Data API
- **Containerization:** Docker

> Note: Production deployment, CI/CD, and infrastructure orchestration are intentionally kept out of scope for this GitHub‑focused repository.

---

## Repository Structure

```
backend/        # FastAPI backend source code
frontend/       # Angular frontend application
docs/           # Architecture diagrams, notes, and design documents
```

---

## Local Development (Optional)

This project can be run locally for exploration and development purposes.

**Requirements:**

- Docker
- Docker Compose

Basic workflow:

```bash
git clone https://github.com/sparkup/rag-assisted-chess-agent.git
cd rag-assisted-chess-agent

# Configure environment variables
cp .env.example .env

# Build and run services
make up
make init-frontend
```

## Project Status

- Core architecture in place
- Agent‑assisted workflows implemented
- Autonomous LLM‑based reasoning **not yet implemented**

This repository intentionally represents an **early but solid foundation**, designed to grow over time as more advanced agent capabilities are introduced.

## License

MIT License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software, provided that the original copyright notice and license terms are included.
