export const NOTE_ADJECTIVES = [
   "able",
   "amber",
   "azure",
   "brief",
   "calm",
   "clear",
   "coral",
   "crisp",
   "dawn",
   "deep",
   "dry",
   "dusk",
   "fair",
   "firm",
   "gold",
   "green",
   "high",
   "kind",
   "late",
   "lime",
   "mild",
   "open",
   "pale",
   "quiet",
   "rapid",
   "sage",
   "silk",
   "stone",
   "true",
   "warm",
   "wide",
   "young",
] as const;

export const NOTE_NOUNS = [
   "basin",
   "bridge",
   "brook",
   "court",
   "creek",
   "field",
   "garden",
   "glen",
   "grove",
   "harbor",
   "hill",
   "knoll",
   "lamp",
   "lodge",
   "meadow",
   "orchard",
   "path",
   "pine",
   "porch",
   "ridge",
   "river",
   "slope",
   "spring",
   "stream",
   "terrace",
   "trail",
   "valley",
   "village",
   "well",
   "window",
   "wood",
   "yard",
] as const;

export const NOTE_DIGIT_COUNT = 1000;

export const NOTE_COMBINATIONS = NOTE_ADJECTIVES.length * NOTE_NOUNS.length * NOTE_DIGIT_COUNT;

function padDigits(value: number): string {
   if (value < 0 || value > 999) {
      throw new Error(`note digit must be 0-999, received ${value}`);
   }
   if (value < 10) {
      return `00${value}`;
   }
   if (value < 100) {
      return `0${value}`;
   }
   return String(value);
}

export function createNote(adjectiveIndex: number, nounIndex: number, digit: number): string {
   if (NOTE_ADJECTIVES.length !== 32) {
      throw new Error(`note adjectives must be 32, received ${NOTE_ADJECTIVES.length}`);
   }
   if (NOTE_NOUNS.length !== 32) {
      throw new Error(`note nouns must be 32, received ${NOTE_NOUNS.length}`);
   }
   const adjective = NOTE_ADJECTIVES[adjectiveIndex];
   const noun = NOTE_NOUNS[nounIndex];
   if (adjective === undefined) {
      throw new Error(`note adjective index ${adjectiveIndex} is out of range`);
   }
   if (noun === undefined) {
      throw new Error(`note noun index ${nounIndex} is out of range`);
   }
   return `${adjective}-${noun}-${padDigits(digit)}`;
}

export function createNoteFromEntropy(): string {
   const adjectiveIndex = Math.floor(Math.random() * NOTE_ADJECTIVES.length);
   const nounIndex = Math.floor(Math.random() * NOTE_NOUNS.length);
   const digit = Math.floor(Math.random() * NOTE_DIGIT_COUNT);
   return createNote(adjectiveIndex, nounIndex, digit);
}

export function isLatinNote(value: string): boolean {
   return /^[a-z]+-[a-z]+-[0-9]{3}$/.test(value);
}
