import type { FieldSpec } from "../config/types";
import enPaper from "../locales/en/paper.json";
import nePaper from "../locales/ne/paper.json";
import zhPaper from "../locales/zh/paper.json";
import { formatGregorianPrepared, formatNepaliPrepared } from "./date";
import { readNestedString } from "./nested-string";

export type FieldCatalogs = {
	ne: unknown;
	en: unknown;
	zh: unknown;
};

function triLabel(copyKey: string, catalogs: FieldCatalogs): string {
	const ne = readNestedString(catalogs.ne, `${copyKey}.label`);
	const en = readNestedString(catalogs.en, `${copyKey}.label`);
	const zh = readNestedString(catalogs.zh, `${copyKey}.label`);
	return `${ne} / ${en} / ${zh}`;
}

function optionLabel(copyKey: string, catalogs: FieldCatalogs): string {
	const ne = readNestedString(catalogs.ne, copyKey);
	const en = readNestedString(catalogs.en, copyKey);
	const zh = readNestedString(catalogs.zh, copyKey);
	return `${ne} / ${en} / ${zh}`;
}

export function paperStack(key: string): string[] {
	return [readNestedString(nePaper, key), readNestedString(enPaper, key), readNestedString(zhPaper, key)];
}

function paperMonths(catalog: unknown): string[] {
	if (catalog === null || typeof catalog !== "object" || !("months" in catalog)) {
		throw new Error("paper catalog is missing months");
	}
	const months = (catalog as { months: unknown }).months;
	if (!Array.isArray(months) || months.length !== 12) {
		throw new Error("paper months must be 12 strings");
	}
	if (months.every((item) => typeof item === "string") === false) {
		throw new Error("paper months must be 12 strings");
	}
	return months;
}

export function fieldValue(
	fields: FieldSpec[],
	id: string,
	values: Record<string, string>,
	catalogs: FieldCatalogs,
): string {
	const field = fields.find((item) => item.id === id);
	const raw = values[id];
	if (field === undefined || raw === undefined) {
		throw new Error(`missing field ${id} while assembling a message`);
	}
	if (field.kind === "select" && field.options !== null) {
		const option = field.options.find((item) => item.value === raw);
		if (option === undefined) {
			return raw;
		}
		return optionLabel(option.copyKey, catalogs);
	}
	return raw.trim();
}

export function tri(field: FieldSpec, value: string, catalogs: FieldCatalogs): string {
	return `${triLabel(field.copyKey, catalogs)}\n${value}`;
}

export function header(titleKey: string, note: string, preparedOn: Date, extraKey: string | null): string {
	const lines = [
		...paperStack(titleKey),
		"",
		...paperStack("notRegistration"),
	];
	if (extraKey !== null) {
		lines.push("");
		lines.push(...paperStack(extraKey));
	}
	lines.push("");
	lines.push(`${readNestedString(nePaper, "noteLine")}: ${note}`);
	lines.push(`${readNestedString(enPaper, "noteLine")}: ${note}`);
	lines.push(`${readNestedString(zhPaper, "noteLine")}: ${note}`);
	lines.push("");
	lines.push(`${readNestedString(nePaper, "prepared")}: ${formatNepaliPrepared(preparedOn, paperMonths(nePaper))}`);
	lines.push(`${readNestedString(enPaper, "prepared")}: ${formatGregorianPrepared(preparedOn, paperMonths(enPaper))}`);
	lines.push(`${readNestedString(zhPaper, "prepared")}: ${formatGregorianPrepared(preparedOn, paperMonths(zhPaper))}`);
	return lines.join("\n");
}

export function screenshotLines(): string[] {
	return [...paperStack("screenshot"), "", ...paperStack("closing")];
}

export function assembleFieldBlock(
	titleKey: string,
	extraKey: string | null,
	fields: FieldSpec[],
	values: Record<string, string>,
	note: string,
	preparedOn: Date,
	catalogs: FieldCatalogs,
): string {
	const lines: string[] = [header(titleKey, note, preparedOn, extraKey), "", "---"];
	for (const field of fields) {
		const value = fieldValue(fields, field.id, values, catalogs);
		if (field.kind === "checkbox" && field.required === false && value !== "yes") {
			continue;
		}
		if (field.required === false && value.length === 0) {
			continue;
		}
		lines.push("");
		lines.push(tri(field, value, catalogs));
	}
	lines.push("");
	lines.push(...screenshotLines());
	return lines.join("\n");
}
