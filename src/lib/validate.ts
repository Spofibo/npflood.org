import type { FieldSpec } from "../config/types";

export type FieldError = {
	fieldId: string;
	message: string;
};

export function textIsFilled(value: string): boolean {
	return value.trim().length > 0;
}

export function validateFields(
	fields: FieldSpec[],
	values: Record<string, string>,
	idPrefix: string,
	emptyRequired: string,
): FieldError[] {
	const errors: FieldError[] = [];
	for (const field of fields) {
		if (field.required === false) {
			continue;
		}
		if (field.kind === "checkbox") {
			continue;
		}
		const value = values[field.id];
		if (value === undefined || textIsFilled(value) === false) {
			errors.push({
				fieldId: `${idPrefix}${field.id}`,
				message: emptyRequired,
			});
		}
	}
	return errors;
}

export function validateRepeatableRows(
	fields: FieldSpec[],
	rows: Record<string, string>[],
	rowPrefix: string,
	requireAtLeastOne: boolean,
	emptyGroupErrorId: string,
	emptyRequired: string,
	needOneMember: string,
): FieldError[] {
	if (requireAtLeastOne === true && rows.length === 0) {
		return [
			{
				fieldId: emptyGroupErrorId,
				message: needOneMember,
			},
		];
	}
	const errors: FieldError[] = [];
	rows.forEach((row, index) => {
		const rowErrors = validateFields(fields, row, `${rowPrefix}${index}.`, emptyRequired);
		for (const error of rowErrors) {
			errors.push(error);
		}
	});
	return errors;
}
