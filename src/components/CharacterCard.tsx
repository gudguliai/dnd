import './CharacterCard.css'
interface DnDCharacter { name: string; race: string; class: string; level: number; alignment: string; background: string; ability_scores: { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number }; backstory?: string; personality_trait?: string; }
interface CharacterCardProps { character: DnDCharacter | null }
export function CharacterCard({ character }: CharacterCardProps) {
  if (!character) return null
  return (
    <div className="character-card">
      <h2 style={{color: 'var(--gold)'}}>{character.name}</h2>
      <p className="subtitle" style={{color: 'var(--text-muted)'}}>{character.race} {character.class} {character.level}</p>
      <p style={{color: 'var(--text-secondary)'}}>{character.alignment} | {character.background}</p>
      <div className="stats">
        <div><strong>STR:</strong> {character.ability_scores.strength}</div>
        <div><strong>DEX:</strong> {character.ability_scores.dexterity}</div>
        <div><strong>CON:</strong> {character.ability_scores.constitution}</div>
        <div><strong>INT:</strong> {character.ability_scores.intelligence}</div>
        <div><strong>WIS:</strong> {character.ability_scores.wisdom}</div>
        <div><strong>CHA:</strong> {character.ability_scores.charisma}</div>
      </div>
      {character.backstory && <div className="section"><h3>Backstory</h3><p>{character.backstory}</p></div>}
    </div>
  )
}
