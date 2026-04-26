import { useState, useCallback, useEffect } from 'react';
import { modelLoader } from '../services/modelLoader';
import { MODEL_LOAD_CONFIG } from '../config';

export function useModelLoader(options: { maxRetries?: number; timeoutMs?: number } = {}) {
  const { maxRetries = MODEL_LOAD_CONFIG.maxRetries, timeoutMs = MODEL_LOAD_CONFIG.timeoutMs } = options;
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadWithRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeoutMs);
        });
        const loadPromise = modelLoader.loadModel((p) => setProgress(p));
        await Promise.race([loadPromise, timeoutPromise]);
        setIsLoading(false);
        setIsLoaded(true);
        return;
      } catch (err) {
        setRetryCount((c) => c + 1);
        if (attempt === maxRetries - 1) {
          setError(err as Error);
          setIsLoading(false);
          throw new Error('Model loading failed');
        }
      }
    }
  }, [maxRetries, timeoutMs]);

  useEffect(() => { loadWithRetry(); }, [loadWithRetry]);
  return { error, isLoading, progress, retryCount, isLoaded, retry: loadWithRetry };
}
