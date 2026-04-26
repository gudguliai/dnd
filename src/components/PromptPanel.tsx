import { useState, useCallback } from 'react'
import './PromptPanel.css'
const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil']
const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling']
const CLASSES = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard']
const TONES = ['Heroic', 'Dramatic', 'Mysterious', 'Dark', 'Whimsical', 'Epic', 'Realistic']
interface PromptPanelProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
  isModelLoaded: boolean
}
export function PromptPanel({ onGenerate, isGenerating, isModelLoaded }: PromptPanelProps) {
  const [alignment, setAlignment] = useState('Random')
  const [race, setRace] = useState('Random')
  const [charClass, setCharClass] = useState('Random')
  const [tone, setTone] = useState('Random')
  const [customPrompt, setCustomPrompt] = useState('')
  const handleGenerate = useCallback(() => {
    const prompt = customPrompt || `Create a ${alignment.toLowerCase()} ${race.toLowerCase()} ${charClass.toLowerCase()} character with a ${tone.toLowerCase()} tone`
    onGenerate(prompt)
  }, [alignment, race, charClass, tone, customPrompt, onGenerate])
  const canGenerate = isModelLoaded && !isGenerating
  return (
    <div className="prompt-panel">
      <div className="quick-select">
        <select value={alignment} onChange={e => setAlignment(e.target.value)} disabled={!canGenerate}><option>Random</option>{ALIGNMENTS.map(a => <option key={a}>{a}</option>)}</select>
        <select value={race} onChange={e => setRace(e.target.value)} disabled={!canGenerate}><option>Random</option>{RACES.map(r => <option key={r}>{r}</option>)}</select>
        <select value={charClass} onChange={e => setCharClass(e.target.value)} disabled={!canGenerate}><option>Random</option>{CLASSES.map(c => <option key={c}>{c}</option>)}</select>
        <select value={tone} onChange={e => setTone(e.target.value)} disabled={!canGenerate}><option>Random</option>{TONES.map(t => <option key={t}>{t}</option>)}</select>
      </div>
      <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Or enter custom prompt..." disabled={!canGenerate} rows={3} />
      <button onClick={handleGenerate} disabled={!canGenerate}>{isGenerating ? 'Generating...' : 'Generate Character'}</button>
      {!isModelLoaded && <p className="loading">Loading model...</p>}
    </div>
  )
}
