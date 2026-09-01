import { kerungCompanionSpec, kerungFields } from "../config/kerung-fields";
import enKerung from "../locales/en/fields/kerung.json";
import neKerung from "../locales/ne/fields/kerung.json";
import zhKerung from "../locales/zh/fields/kerung.json";
import { fieldValue, header, paperStack, screenshotLines, tri } from "./assemble-shared";
import type { CompanionRow, KerungValues } from "./records";

const catalogs = {
	ne: { kerung: neKerung },
	en: { kerung: enKerung },
	zh: { kerung: zhKerung },
};

export function assembleKerungMessage(
	values: KerungValues,
	companions: CompanionRow[],
	note: string,
	preparedOn: Date,
): string {
	const asRecord: Record<string, string> = {
		name: values.name,
		passport: values.passport,
		wechatOrPhone: values.wechatOrPhone,
		location: values.location,
		nepalContact: values.nepalContact,
		medical: values.medical,
	};
	const lines: string[] = [header("kerungTitle", note, preparedOn, null), "", "---"];
	for (const field of kerungFields) {
		if (field.id === "medical") {
			continue;
		}
		lines.push("");
		lines.push(tri(field, fieldValue(kerungFields, field.id, asRecord, catalogs), catalogs));
	}
	lines.push("");
	if (values.medical === "yes") {
		lines.push(...paperStack("medicalYes"));
	} else {
		lines.push(...paperStack("medicalNo"));
	}
	if (companions.length > 0) {
		lines.push("");
		lines.push(paperStack("companionsHeading").join(" / "));
		companions.forEach((companion, index) => {
			const row: Record<string, string> = {
				name: companion.name,
				passport: companion.passport,
				role: companion.role,
			};
			lines.push("");
			lines.push(`${index + 1}.`);
			for (const field of kerungCompanionSpec.fields) {
				lines.push(tri(field, fieldValue(kerungCompanionSpec.fields, field.id, row, catalogs), catalogs));
			}
		});
	}
	lines.push("");
	lines.push(...screenshotLines());
	return lines.join("\n");
}
