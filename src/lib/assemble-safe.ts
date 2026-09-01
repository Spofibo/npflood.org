import { safeFields } from "../config/safe-fields";
import enSafe from "../locales/en/fields/safe.json";
import neSafe from "../locales/ne/fields/safe.json";
import zhSafe from "../locales/zh/fields/safe.json";
import { assembleFieldBlock } from "./assemble-shared";
import type { SafeValues } from "./records";

const catalogs = {
	ne: { safe: neSafe },
	en: { safe: enSafe },
	zh: { safe: zhSafe },
};

export function assembleSafeMessage(values: SafeValues, note: string, preparedOn: Date): string {
	return assembleFieldBlock(
		"safeTitle",
		null,
		safeFields,
		{
			name: values.name,
			location: values.location,
			familyPhone: values.familyPhone,
			line: values.line,
		},
		note,
		preparedOn,
		catalogs,
	);
}
