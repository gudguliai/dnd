import { useState, useCallback } from 'react'
import { characterGenerator, type DnDCharacter } from './services/characterGenerator'
import { PromptPanel } from './components/PromptPanel'
import { CharacterCard } from './components/CharacterCard'
import { StreamingCharacterCard } from './components/StreamingCharacterCard'
import { ModelDownloadTracker } from './components/ModelDownloadTracker'
import { useModelLoader } from './hooks/useModelLoader'
import './index.css'

function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [character, setCharacter] = useState<DnDCharacter | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawOutput, setRawOutput] = useState<string>('')
  const [modelLoadError, setModelLoadError] = useState<Error | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const { error: modelLoaderError, progress, isLoading, retry } = useModelLoader()

  const handleModelLoaded = useCallback(() => {
    setIsModelLoaded(true)
    setModelLoadError(null)
    setError(null)
  }, [])

  const handleModelError = useCallback((err: Error) => {
    setModelLoadError(err)
  }, [])

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true)
    setError(null)
    setRawOutput('')
    setModelLoadError(null)
    try {
      const newCharacter = await characterGenerator.generateCharacter(prompt, (token) => {
        setRawOutput((prev) => prev + token)
      })
      setCharacter(newCharacter)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(`Generation failed: ${message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', newTheme)
      return newTheme
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 style={{ color: 'var(--gold)' }}>D&D Character Generator</h1>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>AI-powered D&D 5e character creator</p>
        <ModelDownloadTracker
          onModelLoaded={handleModelLoaded}
          onModelError={handleModelError}
          retry={retry}
          isLoading={isLoading}
          progress={progress}
          error={modelLoaderError}
        />
      </header>

      <main className="app-main">
        <PromptPanel onGenerate={handleGenerate} isGenerating={isGenerating} isModelLoaded={isModelLoaded} />
        {error && <div className="error-message" style={{ color: 'var(--error)'}}>{error}</div>}
        {isGenerating && (
          <div className="generating-indicator">
            <div className="spinner"></div>
            <p>Generating character...</p>
            <StreamingCharacterCard rawOutput={rawOutput} isStreaming={isGenerating} />
            {rawOutput && (
              <details className="raw-output">
                <summary>View raw output</summary>
                <pre className="raw-pre">{rawOutput}</pre>
              </details>
            )}
          </div>
        )}
        <CharacterCard character={character} />
      </main>

      <footer className="app-footer" style={{ color: 'var(--text-muted)'}}>
        <p>Powered by Llama 3.2 3B Instruct fine-tuned on Open5e SRD data</p>
        <p>Running entirely in your browser using WebAssembly</p>
      </footer>
    </div>
  )
}

export default App
