export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    name: 'semantic-gateway',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',
  },

  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434/api/embeddings',
    embedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '300', 10),
    semanticThreshold: parseFloat(
      process.env.REDIS_SEMANTIC_THRESHOLD ?? '0.88',
    ),
  },

  typeorm: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'semantic_gateway',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },

  rag: {
    topKCandidates: parseInt(process.env.RAG_TOP_K_CANDIDATES ?? '6', 10),
    topNReranked: parseInt(process.env.RAG_TOP_N_RERANKED ?? '2', 10),
    scoreThreshold: parseInt(process.env.RAG_SCORE_THRESHOLD ?? '5', 10),
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE ?? '200', 10),
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP ?? '1', 10),
  },
});
