export function formatPreparedDate(date: Date, months: readonly string[]): string {
	if (months.length !== 12) {
		throw new Error(`formatPreparedDate expected 12 month names, received ${months.length}`);
	}
	const month = months[date.getMonth()];
	if (month === undefined) {
		throw new Error(`invalid month index ${date.getMonth()}`);
	}
	return `${date.getDate()} ${month} ${date.getFullYear()}`;
}
