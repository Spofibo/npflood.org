import { isFormStatus, isStringRecord, type StoredForm } from "./storage";

export type KerungValues = {
	minor: string;
	name: string;
	passport: string;
	wechatOrPhone: string;
	location: string;
	nepalContact: string;
	medical: string;
};

export type CompanionRow = {
	name: string;
	passport: string;
	role: string;
};

export type TrekValues = {
	agency: string;
	route: string;
	lastContactWhen: string;
	lastContactHow: string;
};

export type MemberRow = {
	name: string;
	idNumber: string;
	nationality: string;
};

export type FindValues = {
	missingName: string;
	age: string;
	lastSeen: string;
	appearance: string;
	reporterName: string;
	reporterPhone: string;
	relation: string;
};

export type ConsularValues = {
	yourName: string;
	country: string;
	missingName: string;
	lastKnownPlace: string;
	reachYou: string;
};

export type SafeValues = {
	name: string;
	location: string;
	familyPhone: string;
	line: string;
};

export function emptyKerungValues(): KerungValues {
	return {
		minor: "",
		name: "",
		passport: "",
		wechatOrPhone: "",
		location: "",
		nepalContact: "",
		medical: "no",
	};
}

export function emptyTrekValues(): TrekValues {
	return {
		agency: "",
		route: "",
		lastContactWhen: "",
		lastContactHow: "",
	};
}

export function emptyCompanion(): CompanionRow {
	return {
		name: "",
		passport: "",
		role: "",
	};
}

export function emptyMember(): MemberRow {
	return {
		name: "",
		idNumber: "",
		nationality: "",
	};
}

export function emptyFindValues(): FindValues {
	return {
		missingName: "",
		age: "",
		lastSeen: "",
		appearance: "",
		reporterName: "",
		reporterPhone: "",
		relation: "",
	};
}

export function emptyConsularValues(): ConsularValues {
	return {
		yourName: "",
		country: "",
		missingName: "",
		lastKnownPlace: "",
		reachYou: "",
	};
}

export function emptySafeValues(): SafeValues {
	return {
		name: "",
		location: "",
		familyPhone: "",
		line: "",
	};
}

function isCompanionRow(value: unknown): value is CompanionRow {
	if (isStringRecord(value) === false) {
		return false;
	}
	return "name" in value && "passport" in value && "role" in value;
}

function isMemberRow(value: unknown): value is MemberRow {
	if (isStringRecord(value) === false) {
		return false;
	}
	return "name" in value && "idNumber" in value && "nationality" in value;
}

function isKerungValues(value: unknown): value is KerungValues {
	if (isStringRecord(value) === false) {
		return false;
	}
	return (
		"minor" in value &&
		"name" in value &&
		"passport" in value &&
		"wechatOrPhone" in value &&
		"location" in value &&
		"nepalContact" in value &&
		"medical" in value
	);
}

function isTrekValues(value: unknown): value is TrekValues {
	if (isStringRecord(value) === false) {
		return false;
	}
	return (
		"agency" in value &&
		"route" in value &&
		"lastContactWhen" in value &&
		"lastContactHow" in value
	);
}

export function isKerungRecord(value: unknown): value is StoredForm<KerungValues, CompanionRow> {
	if (value === null || typeof value !== "object") {
		return false;
	}
	const record = value as Record<string, unknown>;
	if (isFormStatus(record.status) === false) {
		return false;
	}
	if (typeof record.note !== "string") {
		return false;
	}
	if (record.assembledText !== null && typeof record.assembledText !== "string") {
		return false;
	}
	if (typeof record.updatedAt !== "string") {
		return false;
	}
	if (isKerungValues(record.values) === false) {
		return false;
	}
	if (!Array.isArray(record.rows)) {
		return false;
	}
	return record.rows.every(isCompanionRow);
}

export function isTrekRecord(value: unknown): value is StoredForm<TrekValues, MemberRow> {
	if (value === null || typeof value !== "object") {
		return false;
	}
	const record = value as Record<string, unknown>;
	if (isFormStatus(record.status) === false) {
		return false;
	}
	if (typeof record.note !== "string") {
		return false;
	}
	if (record.assembledText !== null && typeof record.assembledText !== "string") {
		return false;
	}
	if (typeof record.updatedAt !== "string") {
		return false;
	}
	if (isTrekValues(record.values) === false) {
		return false;
	}
	if (!Array.isArray(record.rows)) {
		return false;
	}
	return record.rows.every(isMemberRow);
}

function isFindValues(value: unknown): value is FindValues {
	if (isStringRecord(value) === false) {
		return false;
	}
	return (
		"missingName" in value &&
		"age" in value &&
		"lastSeen" in value &&
		"appearance" in value &&
		"reporterName" in value &&
		"reporterPhone" in value &&
		"relation" in value
	);
}

function isConsularValues(value: unknown): value is ConsularValues {
	if (isStringRecord(value) === false) {
		return false;
	}
	return (
		"yourName" in value &&
		"country" in value &&
		"missingName" in value &&
		"lastKnownPlace" in value &&
		"reachYou" in value
	);
}

function isSafeValues(value: unknown): value is SafeValues {
	if (isStringRecord(value) === false) {
		return false;
	}
	return "name" in value && "location" in value && "familyPhone" in value && "line" in value;
}

function isStoredEnvelope(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== "object") {
		return false;
	}
	const record = value as Record<string, unknown>;
	if (isFormStatus(record.status) === false) {
		return false;
	}
	if (typeof record.note !== "string") {
		return false;
	}
	if (record.assembledText !== null && typeof record.assembledText !== "string") {
		return false;
	}
	if (typeof record.updatedAt !== "string") {
		return false;
	}
	if (!Array.isArray(record.rows)) {
		return false;
	}
	return true;
}

export function isFindRecord(value: unknown): value is StoredForm<FindValues, never> {
	if (isStoredEnvelope(value) === false) {
		return false;
	}
	return isFindValues(value.values) === true && value.rows.length === 0;
}

export function isConsularRecord(value: unknown): value is StoredForm<ConsularValues, never> {
	if (isStoredEnvelope(value) === false) {
		return false;
	}
	return isConsularValues(value.values) === true && value.rows.length === 0;
}

export function isSafeRecord(value: unknown): value is StoredForm<SafeValues, never> {
	if (isStoredEnvelope(value) === false) {
		return false;
	}
	return isSafeValues(value.values) === true && value.rows.length === 0;
}
