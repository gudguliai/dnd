// dnd-character-gen/src/services/grammarRules.ts
// GBNF grammar for D&D character JSON
// This grammar ensures the LLM outputs valid JSON structure

export const characterJsonGrammar = `
root ::= object
object ::= "{" ws object-content ws "}"
object-content ::= string ":" ws value ("," ws string ":" ws value)*
string ::= "\\"" char* "\\""
char ::= [^"\\\\\\n] | "\\\\" ["\\\\/bfnrt] | "u" [0-9a-fA-F]{4}
value ::= "true" | "false" | "null" | number | string | array | object
number ::= "-"? [0-9]+ ("." [0-9]+)?
array ::= "[" ws (value ("," ws value)*)? ws "]"
ws ::= [ \\t\\n]*
`;

export function getCharacterGrammar(): string {
  return characterJsonGrammar;
}
