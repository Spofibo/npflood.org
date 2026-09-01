import { trekFields, trekMemberSpec } from "../config/trek-fields";
import enTrek from "../locales/en/fields/trek.json";
import neTrek from "../locales/ne/fields/trek.json";
import zhTrek from "../locales/zh/fields/trek.json";
import {
	assembledFieldValue,
	assembledValueText,
	fieldLabels,
	headerSections,
	includeAssembledField,
	paperLines,
	screenshotSections,
	type PaperField,
	type PaperSection,
} from "./assemble-shared";
import type { MemberRow, TrekValues } from "./records";

const catalogs = {
	ne: { trek: neTrek },
	en: { trek: enTrek },
	zh: { trek: zhTrek },
};

export function assembleTrekPaper(
	values: TrekValues,
	members: MemberRow[],
	note: string,
	preparedOn: Date,
): PaperSection[] {
	const asRecord: Record<string, string> = {
		agency: values.agency,
		route: values.route,
		lastContactWhen: values.lastContactWhen,
		lastContactHow: values.lastContactHow,
	};
	const sections: PaperSection[] = headerSections("trekTitle", note, preparedOn, null);
	for (const field of trekFields) {
		const value = assembledFieldValue(trekFields, field.id, asRecord, catalogs);
		const text = assembledValueText(value);
		if (includeAssembledField(field, text) === false) {
			continue;
		}
		sections.push({
			kind: "field",
			labels: fieldLabels(field.copyKey, catalogs),
			value,
		});
	}
	sections.push({ kind: "group", labels: paperLines("membersHeading") });
	members.forEach((member, index) => {
		const row: Record<string, string> = {
			name: member.name,
			idNumber: member.idNumber,
			nationality: member.nationality,
		};
		const fields: PaperField[] = [];
		for (const field of trekMemberSpec.fields) {
			const value = assembledFieldValue(trekMemberSpec.fields, field.id, row, catalogs);
			const text = assembledValueText(value);
			if (includeAssembledField(field, text) === false) {
				continue;
			}
			fields.push({
				labels: fieldLabels(field.copyKey, catalogs),
				value,
			});
		}
		sections.push({
			kind: "item",
			index: index + 1,
			fields,
		});
	});
	sections.push(...screenshotSections());
	return sections;
}
