import { useState, useEffect } from 'react'
import './ModelDownloadTracker.css'
interface ModelDownloadTrackerProps { onModelLoaded: () => void; onModelError?: (error: Error) => void; retry?: () => Promise<void>; isLoading?: boolean; progress?: number; error?: Error | null; }
export function ModelDownloadTracker({ onModelLoaded, onModelError, retry, isLoading, progress, error }: ModelDownloadTrackerProps) {
  const [downloadedMB] = useState(0)
  const totalMB = 1900
  useEffect(() => { if (progress !== undefined && progress >= 100) { onModelLoaded() } }, [progress, onModelLoaded])
  useEffect(() => { if (error && onModelError) { onModelError(error) } }, [error, onModelError])
  const status = error ? 'error' : isLoading ? (progress !== undefined && progress >= 100 ? 'loading' : 'downloading') : 'ready'
  if (status === 'ready') { return <div className="model-status ready"><span className="status-icon">✓</span><span>Model ready</span></div> }
  if (status === 'error') { return (<div className="model-status error"><span className="status-icon">✗</span><span>Error: {error?.message}</span>{retry && <button onClick={retry}>Retry</button>}</div>) }
  return (
    <div className="model-download-tracker">
      <div className="download-info"><span className="status-icon">⬇</span><span className="status-text">{status === 'downloading' && 'Downloading model...'}{status === 'loading' && 'Initializing model...'}</span></div>
      <div className="progress-container">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress || 0}%` }} /></div>
        <div className="progress-details"><span className="progress-percent">{progress || 0}%</span><span className="progress-size">{downloadedMB} MB / ~{totalMB} MB</span></div>
      </div>
      <p className="download-note">First load only. Model is cached for future visits.</p>
    </div>
  )
}
