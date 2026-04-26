import { DnDCharacter } from '../services/characterGenerator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCharacter(character: Partial<DnDCharacter>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!character.name || character.name === 'Unknown') {
    warnings.push('Character has no name');
  }

  if (!character.race || character.race === 'Human') {
    warnings.push('Character race defaults to Human');
  }

  if (!character.class || character.class === 'Fighter') {
    warnings.push('Character class defaults to Fighter');
  }

  // Ability scores range check
  const scores = character.ability_scores;
  if (scores) {
    const allScores = [
      scores.strength,
      scores.dexterity,
      scores.constitution,
      scores.intelligence,
      scores.wisdom,
      scores.charisma,
    ];

    for (const score of allScores) {
      if (score < 1 || score > 30) {
        errors.push(`Invalid ability score: ${score}`);
      }
    }

    const sum = allScores.reduce((a, b) => a + b, 0);
    if (sum < 60 || sum > 100) {
      warnings.push(`Unusual ability score sum: ${sum} (expected 60-100)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
