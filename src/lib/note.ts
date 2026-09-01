export function createNote(
	adjectiveIndex: number,
	nounIndex: number,
	adjectives: readonly string[],
	nouns: readonly string[],
): string {
	if (adjectives.length === 0) {
		throw new Error("note adjectives list is empty");
	}
	if (nouns.length === 0) {
		throw new Error("note nouns list is empty");
	}
	const adjective = adjectives[adjectiveIndex % adjectives.length];
	const noun = nouns[nounIndex % nouns.length];
	if (adjective === undefined || noun === undefined) {
		throw new Error("note word lookup failed");
	}
	return `${adjective}-${noun}`;
}

export function createNoteFromEntropy(adjectives: readonly string[], nouns: readonly string[]): string {
	const adjectiveIndex = Math.floor(Math.random() * adjectives.length);
	const nounIndex = Math.floor(Math.random() * nouns.length);
	return createNote(adjectiveIndex, nounIndex, adjectives, nouns);
}
