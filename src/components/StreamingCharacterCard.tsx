import { useState, useEffect } from 'react';
import type { DnDCharacter } from '../services/characterGenerator';
import './StreamingCharacterCard.css';

interface StreamingCharacterCardProps {
  rawOutput: string;
  isStreaming: boolean;
}

interface PartialCharacter {
  name?: string;
  race?: string;
  class?: string;
  subclass?: string;
  level?: number;
  alignment?: string;
  background?: string;
  ability_scores?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  skills?: string[];
  equipment?: string[];
  spells?: string[];
  backstory?: string;
  personality_trait?: string;
  ideal?: string;
  bond?: string;
  flaw?: string;
}

const SECTIONS = [
  'name',
  'race',
  'class',
  'level',
  'alignment',
  'background',
  'ability_scores',
  'skills',
  'equipment',
  'spells',
  'personality_trait',
  'ideal',
  'bond',
  'flaw',
  'backstory',
] as const;

function parsePartialJson(rawOutput: string): PartialCharacter {
  try {
    // Clean up the output
    let cleaned = rawOutput.trim();
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\w]*\n?/g, '');
    cleaned = cleaned.trim();
    
    // Try to extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}?/);
    if (!jsonMatch) {
      return {};
    }
    
    let jsonStr = jsonMatch[0];
    
    // Try to parse as-is first
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // If that fails, try to fix common issues
    }
    
    // Fix trailing commas
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
    
    // Fix missing quotes on keys
    jsonStr = jsonStr.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // Fix single quotes to double quotes for values
    jsonStr = jsonStr.replace(/'([^']*)'/g, '"$1"');
    
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // If still failing, return what we have
      return {};
    }
  } catch {
    return {};
  }
}

function hasValue(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return false;
    }
    if (key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return current !== undefined && current !== null;
}

export function StreamingCharacterCard({ rawOutput, isStreaming }: StreamingCharacterCardProps) {
  const [partialChar, setPartialChar] = useState<PartialCharacter>({});
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!rawOutput) {
      setPartialChar({});
      setCompletedSections(new Set());
      return;
    }
    
    const parsed = parsePartialJson(rawOutput);
    setPartialChar(parsed);
    
    // Update completed sections
    const newCompleted = new Set<string>();
    SECTIONS.forEach(section => {
      if (hasValue(parsed, section)) {
        newCompleted.add(section);
      }
    });
    setCompletedSections(newCompleted);
  }, [rawOutput]);
  
  const completedCount = completedSections.size;
  const totalSections = SECTIONS.length;
  const progress = (completedCount / totalSections) * 100;
  
  if (!rawOutput && !isStreaming) {
    return null;
  }
  
  return (
    <div className="streaming-character-card">
      <div className="streaming-header">
        <h3>Character Generation Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {completedCount} / {totalSections} sections
        </span>
      </div>
      
      <div className="streaming-sections">
        {SECTIONS.map(section => {
          const isComplete = completedSections.has(section);
          const hasValue = partialChar[section] !== undefined;
          const value = partialChar[section];
          
          if (!hasValue && !isStreaming) {
            return null;
          }
          
          return (
            <div 
              key={section} 
              className={`streaming-section ${isComplete ? 'complete' : 'pending'} ${hasValue ? 'has-value' : ''}`}
            >
              <div className="section-header">
                <span className="section-name">{section.replace(/_/g, ' ').toUpperCase()}</span>
                <span className={`status-indicator ${isComplete ? 'complete' : 'streaming'}`}>
                  {isComplete ? '✓' : isStreaming ? '⏳' : '○'}
                </span>
              </div>
              {hasValue && (
                <div className="section-value">
                  {typeof value === 'object' ? (
                    <div className="ability-scores-preview">
                      {Object.entries(value).map(([stat, score]) => (
                        <div key={stat} className="ability-preview">
                          <span className="ability-label">{stat.substring(0, 3).toUpperCase()}</span>
                          <span className="ability-value">{String(score)}</span>
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(value) ? (
                    <span className="array-value">{value.join(', ')}</span>
                  ) : (
                    <span className="scalar-value">{String(value)}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {isStreaming && (
        <div className="streaming-indicator">
          <div className="pulse"></div>
          <span>Generating character data...</span>
        </div>
      )}
    </div>
  );
}

export { parsePartialJson };
