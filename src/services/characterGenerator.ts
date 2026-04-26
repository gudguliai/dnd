import { modelLoader } from './modelLoader';
import { MODEL_PARAMS } from '../config';

// Debug: Log modelLoader instance
console.log('[characterGenerator.ts] Imported modelLoader:', modelLoader);
console.log('[characterGenerator.ts] modelLoader.isLoaded():', modelLoader.isLoaded());

const USE_HYBRID = false;
const WORKER_URL = '';

export interface DnDCharacter {
  name: string;
  race: string;
  class: string;
  subclass: string;
  level: number;
  alignment: string;
  background: string;
  ability_scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  equipment: string[];
  spells: string[] | null;
  backstory: string;
  personality_trait: string;
  ideal: string;
  bond: string;
  flaw: string;
}

class CharacterGeneratorService {
  /**
   * Post-process JSON to fix common formatting issues from the model
   */
  private fixJson(jsonString: string): string {
    // Remove markdown code blocks (opening and closing fences)
    let cleaned = jsonString.replace(/```[\w]*\n?/g, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    
    // Extract just the first JSON object if there's extra content
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      cleaned = match[0];
    }
    
    return cleaned;
  }

/**
 * Validate and sanitize the character object
 */
private sanitizeCharacter(char: any): DnDCharacter {
// Helper for case-insensitive property access
const getProp = (obj: any, name: string, fallback: any = undefined) => {
	if ( (!obj)  ) return fallback;
	// Try lowercase first, then original case
	const lowerName = name.toLowerCase();
	for (const key of Object.keys(obj)) {
		if (key.toLowerCase() === lowerName) {
			return obj[key];
		}
	}
	return fallback;
};

// Helper for ability scores with case-insensitive access
const getAbilityScore = (scoreName: string) => {
	// Try multiple possible keys for the scores object
	const scoresObj = char?.ability_scores || char?.Ability_Scores || char?.Ability_scores || {};
	if (!scoresObj || typeof scoresObj !== 'object') return 10;
	
	// Search for matching key (case-insensitive)
	for (const key of Object.keys(scoresObj)) {
		if (key.toLowerCase() === scoreName.toLowerCase()) {
			return this.clampAbilityScore(scoresObj[key]);
		}
	}
	return 10; // Default if not found
};

const defaultCharacter: DnDCharacter = {
name: getProp(char, 'name', 'Unknown'),
race: getProp(char, 'race', 'Human'),
class: getProp(char, 'class', 'Fighter'),
subclass: getProp(char, 'subclass', ''),
level: Math.min(Math.max(Number(getProp(char, 'level', 1)) || 1, 1), 20),
alignment: getProp(char, 'alignment', 'True Neutral'),
background: getProp(char, 'background', 'Soldier'),
ability_scores: {
strength: getAbilityScore('strength'),
dexterity: getAbilityScore('dexterity'),
constitution: getAbilityScore('constitution'),
intelligence: getAbilityScore('intelligence'),
wisdom: getAbilityScore('wisdom'),
charisma: getAbilityScore('charisma'),
},
skills: Array.isArray(char?.skills) ? char.skills : [],
equipment: Array.isArray(char?.equipment) ? char.equipment : [],
spells: char?.spells ?? char?.Spells ?? null,
backstory: getProp(char, 'backstory', ''),
personality_trait: getProp(char, 'personality_trait', ''),
ideal: getProp(char, 'ideal', ''),
bond: getProp(char, 'bond', ''),
flaw: getProp(char, 'flaw', ''),
};

return defaultCharacter;
}

  private clampAbilityScore(score: unknown): number {
    const num = Number(score);
    if (isNaN(num)) return 10;
    return Math.min(Math.max(num, 1), 30);
  }

  async generateCharacter(prompt: string, onToken?: (token: string) => void): Promise<DnDCharacter> {
    // Try worker fallback first if hybrid mode is enabled
    if (USE_HYBRID && WORKER_URL) {
      try {
        const response = await fetch(`${WORKER_URL}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        return this.sanitizeCharacter(data);
      } catch (error) {
        console.warn('Worker failed, falling back to local:', error);
      }
    }

    console.log('[CharacterGenerator] generateCharacter called');
    console.log('[CharacterGenerator] modelLoader.isLoaded():', modelLoader.isLoaded());

    // Debug: call debug method if available
    if ('debug' in modelLoader) {
      (modelLoader as any).debug();
    }

    const wllama = modelLoader.getWllama();
    console.log('[CharacterGenerator] chatTemplate:', wllama.getChatTemplate()?.slice(0, 100));

const response = await wllama.createChatCompletion(
[
{
role: 'system',
content: 'You are a D&D 5e character generator. Given a description, output ONLY a valid JSON object with no markdown formatting.',
},
{ role: 'user', content: prompt },
],
{
nPredict: MODEL_PARAMS.nPredict,
sampling: { temp: MODEL_PARAMS.temp, top_p: MODEL_PARAMS.topP, penalty_repeat: 1.1, penalty_last_n: MODEL_PARAMS.topK },
onNewToken: (_token, _piece, currentText) => {
onToken?.(currentText);
},
}
);

// Response is a string
const rawOutput = response as string;
console.log('[CharacterGenerator] raw output (first 200):', rawOutput.slice(0, 200));

// Try to parse with post-processing
let parsed: unknown;
let lastError: Error | null = null;

// Attempt 1: Direct parse
try {
parsed = JSON.parse(rawOutput);
console.log('[CharacterGenerator] parsed JSON:', JSON.stringify(parsed).slice(0, 200));
} catch (e) {
lastError = new Error('Failed to parse JSON directly');

      // Attempt 2: Fix JSON and retry
      try {
        const fixed = this.fixJson(rawOutput);
        parsed = JSON.parse(fixed);
      } catch (e2) {
        // Attempt 3: Extract JSON-like content
        const jsonMatch = rawOutput.match(/\{[\s\S]*?\}(?=\s*$|\s*\{)/);
        if (jsonMatch) {
          try {
            const fixed = this.fixJson(jsonMatch[0]);
            parsed = JSON.parse(fixed);
          } catch (e3) {
            throw new Error('Failed to parse character JSON');
          }
        } else {
          throw new Error('Failed to parse character JSON');
        }
      }
    }

try {
return this.sanitizeCharacter(parsed);
} catch (sanitizeError) {
console.error('[CharacterGenerator] sanitizeCharacter error:', sanitizeError);
console.error('[CharacterGenerator] parsed object:', parsed);
throw new Error(`Failed to sanitize character: ${(sanitizeError as Error).message}`);
}
}
}

export const characterGenerator = new CharacterGeneratorService();
