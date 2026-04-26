import { Wllama } from '@wllama/wllama';
import { MODEL_LOAD_CONFIG, WASM_PATHS } from '../config';

// const MODEL_URL = 'https://huggingface.co/gudguli/dnd-character-gen-3b/resolve/main/dnd-llm-q4_k_m.gguf';
const MODEL_URL = 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf';

// Module-level logging to track singleton
const MODULE_ID = Math.random().toString(36).substring(7);
console.log('[modelLoader.ts] Module loaded, ID:', MODULE_ID);

class ModelLoaderService {
  private wllama: Wllama | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private loadError: Error | null = null;

  async loadModel(onProgress?: (progress: number) => void): Promise<void> {
    console.log('[ModelLoader] loadModel called');

    if (this.isLoading && this.loadPromise) {
      console.log('[ModelLoader] Already loading, waiting...');
      return this.loadPromise;
    }

    if (this.wllama) {
      console.log('[ModelLoader] Already have wllama instance, returning');
      return;
    }

    if (this.loadError) {
      console.log('[ModelLoader] Clearing previous error');
      this.loadError = null;
      this.loadPromise = null;
    }

    this.isLoading = true;
    this.loadPromise = this.doLoad(onProgress);
    
  try {
    await this.loadPromise;
  } catch (err) {
    this.loadError = new Error('Model load failed');
    throw this.loadError;
  } finally {
    this.isLoading = false;
  }
  }

  private async doLoad(onProgress?: (progress: number) => void): Promise<void> {
    console.log('[ModelLoader] Creating Wllama...');
    
    this.wllama = new Wllama({
      'single-thread/wllama.wasm': WASM_PATHS.singleThread,
      'multi-thread/wllama.wasm': WASM_PATHS.multiThread,
    });
    
    console.log('[ModelLoader] Loading model from:', MODEL_URL);

    await this.wllama.loadModelFromUrl(MODEL_URL, {
      n_ctx: MODEL_LOAD_CONFIG.nCtx,
      progressCallback: ({ loaded, total }) => {
        const progress = Math.round((loaded / total) * 100);
        onProgress?.(progress);
      },
    });
    
    console.log('[ModelLoader] Model loaded, running warmup...');
    await this.wllama.createChatCompletion([{ role: 'user', content: 'warmup' }], { nPredict: MODEL_LOAD_CONFIG.nPredict });
    console.log('[ModelLoader] Model loaded successfully!');
  }

  getWllama(): Wllama {
    console.log('[ModelLoader] getWllama called, hasWllama:', !!this.wllama);
    if (!this.wllama) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }
    return this.wllama;
  }

  isLoaded(): boolean {
    return this.wllama !== null;
  }
  
  getError(): Error | null {
    return this.loadError;
  }
  
  debug(): void {
    console.log('[ModelLoader] Debug:', {
      hasWllama: !!this.wllama,
      isLoading: this.isLoading,
      hasPromise: !!this.loadPromise,
      hasError: !!this.loadError,
      moduleId: MODULE_ID
    });
  }
}

// Create singleton
const modelLoader = new ModelLoaderService();

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).__modelLoader = modelLoader;
  console.log('[modelLoader.ts] Exposed to window.__modelLoader');
}

export { modelLoader };
