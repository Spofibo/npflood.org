import { consularStorageKey } from "../config/consular-fields";
import { findStorageKey } from "../config/find-fields";
import { kerungStorageKey } from "../config/kerung-fields";
import { safeStorageKey } from "../config/safe-fields";
import { trekStorageKey } from "../config/trek-fields";

export type FormStatus = "draft" | "assembled" | "sent";

export type StoredForm<TValues, TRow> = {
	status: FormStatus;
	note: string;
	values: TValues;
	rows: TRow[];
	assembledText: string | null;
	updatedAt: string;
};

const formStorageKeys = [findStorageKey, consularStorageKey, safeStorageKey, kerungStorageKey, trekStorageKey];

export function storageAvailable(): boolean {
	try {
		const probe = "__npflood_probe";
		window.localStorage.setItem(probe, "1");
		window.localStorage.removeItem(probe);
		return true;
	} catch {
		return false;
	}
}

export function loadStoredForm<TValues, TRow>(
	key: string,
	isRecord: (value: unknown) => value is StoredForm<TValues, TRow>,
): StoredForm<TValues, TRow> | null {
	if (storageAvailable() === false) {
		return null;
	}
	const raw = window.localStorage.getItem(key);
	if (raw === null) {
		return null;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		console.warn("stored form is not valid JSON", { key });
		return null;
	}
	if (isRecord(parsed) === false) {
		console.warn("stored form has an unexpected shape", { key });
		return null;
	}
	return parsed;
}

function isQuotaError(error: unknown): boolean {
	if (error instanceof DOMException === false) {
		return false;
	}
	return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22;
}

export function saveStoredForm<TValues, TRow>(key: string, record: StoredForm<TValues, TRow>): boolean {
	if (storageAvailable() === false) {
		return false;
	}
	try {
		window.localStorage.setItem(key, JSON.stringify(record));
		return true;
	} catch (error) {
		if (isQuotaError(error) === true) {
			console.warn("stored form save exceeded quota", { key });
			return false;
		}
		throw error;
	}
}

export function clearStoredForm(key: string): void {
	if (storageAvailable() === false) {
		return;
	}
	window.localStorage.removeItem(key);
}

export function clearAllStoredForms(): void {
	if (storageAvailable() === false) {
		return;
	}
	for (const key of formStorageKeys) {
		window.localStorage.removeItem(key);
	}
}

export function isFormStatus(value: unknown): value is FormStatus {
	return value === "draft" || value === "assembled" || value === "sent";
}

export function isStringRecord(value: unknown): value is Record<string, string> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}
	const entries = Object.entries(value);
	return entries.every((entry) => typeof entry[1] === "string");
}
