// Model loading
export const MODEL_LOAD_CONFIG = {
  maxRetries: 3,
  timeoutMs: 120000,
  nCtx: 2048,
  nPredict: 1, // warmup
} as const;

// Model parameters
export const MODEL_PARAMS = {
  nPredict: 800,
  temp: 0.7,
  topP: 0.9,
  minP: 0.11,
  topK: 64,
} as const;

// WASM paths
export const WASM_PATHS = {
  singleThread: '/node_modules/@wllama/wllama/src/single-thread/wllama.wasm',
  multiThread: '/node_modules/@wllama/wllama/src/multi-thread/wllama.wasm',
} as const;
