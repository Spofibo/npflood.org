import { trekFields, trekMemberSpec } from "../config/trek-fields";
import enTrek from "../locales/en/fields/trek.json";
import neTrek from "../locales/ne/fields/trek.json";
import zhTrek from "../locales/zh/fields/trek.json";
import { fieldValue, header, paperStack, screenshotLines, tri } from "./assemble-shared";
import type { MemberRow, TrekValues } from "./records";

const catalogs = {
	ne: { trek: neTrek },
	en: { trek: enTrek },
	zh: { trek: zhTrek },
};

export function assembleTrekMessage(
	values: TrekValues,
	members: MemberRow[],
	note: string,
	preparedOn: Date,
): string {
	const asRecord: Record<string, string> = {
		agency: values.agency,
		route: values.route,
		lastContactWhen: values.lastContactWhen,
		lastContactHow: values.lastContactHow,
	};
	const lines: string[] = [header("trekTitle", note, preparedOn, null), "", "---"];
	for (const field of trekFields) {
		lines.push("");
		lines.push(tri(field, fieldValue(trekFields, field.id, asRecord, catalogs), catalogs));
	}
	lines.push("");
	lines.push(paperStack("membersHeading").join(" / "));
	members.forEach((member, index) => {
		const row: Record<string, string> = {
			name: member.name,
			idNumber: member.idNumber,
			nationality: member.nationality,
		};
		lines.push("");
		lines.push(`${index + 1}.`);
		for (const field of trekMemberSpec.fields) {
			const value = fieldValue(trekMemberSpec.fields, field.id, row, catalogs);
			if (field.required === false && value.length === 0) {
				continue;
			}
			lines.push(tri(field, value, catalogs));
		}
	});
	lines.push("");
	lines.push(...screenshotLines());
	return lines.join("\n");
}
