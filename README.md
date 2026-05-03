# Semantic Gateway

> A production-grade RAG (Retrieval-Augmented Generation) API built with NestJS — designed to answer natural language queries using your own documents, with semantic caching, intelligent reranking, and automated quality evaluation.

---

## What This Does

Most APIs answer structured queries — give me order 456, fetch user 99. But real users ask questions in plain English: *"Can I still return this?"*, *"Why hasn't my order arrived?"*, *"What's the cancellation policy?"*

Semantic Gateway bridges that gap. It takes a natural language question, finds the most relevant chunks from your document store using vector similarity search, and uses an LLM to generate a precise, grounded answer — all within a single API call.

It is not a chatbot. It is a backend service your existing applications can call.

---

## Architecture

```
User Query
    │
    ▼
SemanticController (NestJS)
    │
    ▼
Redis Semantic Cache ──── HIT ──► Return cached answer (< 5ms)
    │
   MISS
    │
    ├──► EmbeddingService     (nomic-embed-text via Ollama)
    ├──► IntentService        (embedding-based category classification)
    │
    ▼
VectorService
    ├── Sentence-aware chunking
    ├── Metadata filtering (category, source)
    └── Cosine similarity search → top 6 candidates
    │
    ▼
RerankService
    └── Single LLM call scores all candidates → top 2
    │
    ▼
LlmService (Groq · llama-3.1-8b-instant)
    └── RAG prompt with injected context → answer
    │
    ├──► Return answer to client
    │
    └──► EvalService (async, non-blocking)
             ├── Faithfulness score (0-10)
             ├── Relevance score (0-10)
             └── Logged to Postgres eval_logs table
```

---

## Features

- **RAG Pipeline** — retrieves relevant document chunks and injects them as context before calling the LLM, preventing hallucination on your domain data
- **Sentence-aware chunking** — splits documents at sentence boundaries with configurable overlap, preserving semantic meaning across chunk edges
- **Embedding-based intent classification** — dynamically classifies query intent against known document categories using cosine similarity, no hardcoded keywords
- **Metadata filtering** — narrows vector search to relevant document categories before scoring, reducing noise and improving accuracy
- **Two-stage retrieval** — vector search (broad recall) followed by LLM reranking (precise relevance), promoted better chunks that cosine similarity alone misses
- **Redis semantic cache** — caches answers by query embedding similarity, serving near-identical queries instantly without re-running the pipeline
- **Eval pipeline** — automatically scores every response for faithfulness and relevance using a secondary LLM call, logs results to Postgres for continuous quality monitoring
- **LLM fallback** — when retrieval confidence is low, falls back to direct LLM response with `verified: false` flag and `hallucinationRisk: high` logged
- **Winston logging** — structured JSON logs written to file, colored console output in development

---

## Tech Stack

| Layer | Technology |
|---|---|
| API Framework | NestJS (TypeScript) |
| Embedding Model | nomic-embed-text via Ollama (local) |
| LLM | llama-3.1-8b-instant via Groq API |
| Vector Storage | In-memory (pgvector migration planned) |
| Cache | Redis (ioredis) |
| Eval Storage | PostgreSQL via TypeORM |
| Logging | Winston + nest-winston |

---

## Project Structure

```
src/
├── semantic/           # Core RAG orchestration
│   ├── semantic.controller.ts
│   ├── semantic.service.ts
│   └── semantic.module.ts
├── vector/             # Document storage + similarity search
│   ├── vector.service.ts
│   └── vector.module.ts
├── embedding/          # Text → vector conversion
│   ├── embedding.service.ts
│   └── embedding.module.ts
├── intent/             # Query category classification
│   ├── intent.service.ts
│   └── intent.module.ts
├── rerank/             # Two-stage retrieval reranking
│   ├── rerank.service.ts
│   └── rerank.module.ts
├── llm/                # LLM API client (Groq)
│   ├── llm.service.ts
│   └── llm.module.ts
├── cache/              # Redis semantic cache
│   ├── cache.service.ts
│   └── cache.module.ts
├── eval/               # Automated response evaluation
│   ├── eval.service.ts
│   ├── eval.module.ts
│   └── entity/
│       └── eval-log.entity.ts
├── chunking/           # Sentence-aware document chunking
│   ├── chunking.service.ts
│   └── chunking.module.ts
├── documents/          # Document ingestion
│   ├── documents.service.ts
│   └── documents.module.ts
└── logger/             # Winston logger setup
    └── logger.module.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for Redis and Postgres)
- Ollama installed locally
- Groq API key (free tier available at console.groq.com)

### 1. Clone and install

```bash
git clone https://github.com/your-username/semantic-gateway.git
cd semantic-gateway
npm install
```

### 2. Start Ollama and pull models

```bash
# Install Ollama from ollama.com, then:
ollama pull nomic-embed-text   # embedding model
ollama pull mistral            # optional local LLM
```

### 3. Start Redis

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 4. Start Postgres with pgvector

```bash
docker run -d \
  --name pgvector-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=semantic_gateway \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Create the eval logs table:

```sql
CREATE TABLE eval_logs (
  id                 SERIAL PRIMARY KEY,
  query              TEXT NOT NULL,
  answer             TEXT NOT NULL,
  context            TEXT,
  source             VARCHAR(10) NOT NULL,
  faithfulness       FLOAT,
  relevance          FLOAT NOT NULL,
  rerank_score       FLOAT,
  verified           BOOLEAN DEFAULT FALSE,
  hallucination_risk VARCHAR(10) NOT NULL,
  latency_ms         INT,
  created_at         TIMESTAMP DEFAULT NOW()
);
```

### 5. Configure environment

```bash
cp .env.example .env
```

```env
GROQ_API_KEY=your_groq_api_key_here
OLLAMA_URL=http://localhost:11434/api/embeddings
```

### 6. Run

```bash
npm run start:dev
```

---

## API

### Query the semantic gateway

```bash
GET /semantic?q=your+question+here
```

**Example:**

```bash
curl "http://localhost:3000/semantic?q=what+is+the+return+window+for+electronics"
```

**Response:**

```json
{
  "query": "what is the return window for electronics",
  "result": {
    "source": "RAG",
    "vectorScore": 0.593,
    "rerankScore": 10,
    "answer": "The return window for electronics is 3 days."
  }
}
```

**Response fields:**

| Field | Description |
|---|---|
| `source` | `RAG` (grounded answer) / `LLM` (fallback) / `CACHE` (served from Redis) |
| `vectorScore` | Cosine similarity of top retrieved chunk (0-1) |
| `rerankScore` | LLM relevance score of final chunk (0-10) |
| `answer` | Generated answer |

### Add documents

```bash
POST /documents
Content-Type: application/json

{ "content": "Your document text here" }
```

---

## How RAG Prevents Hallucination

Without RAG the LLM answers from its training data — which does not include your business documents, policies, or internal data. It will either make something up or say it doesn't know.

With RAG:

1. Your query is embedded into a vector
2. The most semantically similar document chunks are retrieved
3. Those chunks are injected into the LLM prompt as context
4. The LLM is instructed to answer **only from the provided context**
5. The eval pipeline scores whether it stayed within bounds

The LLM becomes a reasoning and language engine — your documents become its source of truth.

---

## Eval Pipeline

Every response is automatically evaluated after it is returned to the client (non-blocking):

```sql
-- Average faithfulness over last 100 requests
SELECT AVG(faithfulness)
FROM eval_logs
ORDER BY created_at DESC
LIMIT 100;

-- Find potential hallucinations
SELECT query, answer, faithfulness
FROM eval_logs
WHERE faithfulness < 5
ORDER BY created_at DESC;

-- RAG hit rate
SELECT
  COUNT(*) FILTER (WHERE source = 'RAG') AS rag_hits,
  COUNT(*) FILTER (WHERE source = 'LLM') AS llm_fallbacks,
  COUNT(*) FILTER (WHERE source = 'CACHE') AS cache_hits
FROM eval_logs;
```

---

## Roadmap

- [x] pgvector integration (persistent vector storage)
- [x] RAGAS evaluation microservice (Python + FastAPI)
- [x] Document upload API with auto-chunking
- [x] Hybrid search (BM25 + vector)
- [x] Kubernetes deployment
- [x] Eval stats dashboard endpoint

---

## Key Concepts

**Chunking** — large documents are split into overlapping sentence-boundary-aware chunks. Each chunk gets its own embedding. This ensures precise retrieval at the paragraph level rather than the document level.

**Semantic caching** — query embeddings are compared against cached query embeddings. Queries with cosine similarity above 0.88 return the cached answer, avoiding redundant pipeline execution for near-identical questions.

**Reranking** — vector search retrieves the top 6 candidates by cosine similarity. A secondary LLM call scores all 6 candidates against the query in one request and selects the top 2. This promotes chunks that are genuinely relevant but ranked lower by embedding similarity alone.

**Eval pipeline** — faithfulness measures whether every claim in the answer is supported by the retrieved context. Relevance measures whether the answer addresses the question. Both are scored 0-10 and logged with source, latency, and timestamp.

---

## Author

**Aswin Sai** — Backend Engineer  
NestJS · Distributed Systems · AI Backend Integration

---

## License

MIT
