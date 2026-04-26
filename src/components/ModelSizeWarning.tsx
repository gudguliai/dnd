import { useState } from 'react';
import './ModelSizeWarning.css';

const DOWNLOAD_SPEED_MBPS = 5;
const STORAGE_KEY = 'skipModelWarning';

interface ModelSizeWarningProps {
  modelSizeMB: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModelSizeWarning({ modelSizeMB, onConfirm, onCancel }: ModelSizeWarningProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const estimatedTime = modelSizeMB / DOWNLOAD_SPEED_MBPS;

  return (
    <div className="model-size-warning-overlay">
      <div className="model-size-warning">
        <h3>Large Download Required</h3>
        <p>This app requires downloading a {modelSizeMB}MB AI model to your browser.</p>
        <p>
          Estimated time: {estimatedTime < 1 ? 'Less than 1 minute' : `${Math.round(estimatedTime)} minutes`} (on a typical connection)
        </p>
        <ul>
          <li>Model runs entirely in your browser (no server)</li>
          <li>Requires ~2GB RAM</li>
          <li>May not work on mobile devices</li>
        </ul>
        <label>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          Don't show again
        </label>
        <div className="warning-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            className="confirm"
        onClick={() => {
          if (dontShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true');
          }
          onConfirm();
        }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
