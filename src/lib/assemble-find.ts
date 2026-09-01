import { findFields } from "../config/find-fields";
import enFind from "../locales/en/fields/find.json";
import neFind from "../locales/ne/fields/find.json";
import zhFind from "../locales/zh/fields/find.json";
import { assembleFieldBlock } from "./assemble-shared";
import type { FindValues } from "./records";

const catalogs = {
	ne: { find: neFind },
	en: { find: enFind },
	zh: { find: zhFind },
};

export function assembleFindMessage(values: FindValues, note: string, preparedOn: Date): string {
	return assembleFieldBlock(
		"findTitle",
		"findCannotMatch",
		findFields,
		{
			missingName: values.missingName,
			age: values.age,
			lastSeen: values.lastSeen,
			appearance: values.appearance,
			reporterName: values.reporterName,
			reporterPhone: values.reporterPhone,
			relation: values.relation,
			alreadyReported: values.alreadyReported,
			reportReference: values.reportReference,
		},
		note,
		preparedOn,
		catalogs,
	);
}
