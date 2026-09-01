import { consularFields } from "../config/consular-fields";
import enConsular from "../locales/en/fields/consular.json";
import neConsular from "../locales/ne/fields/consular.json";
import zhConsular from "../locales/zh/fields/consular.json";
import { assembleFieldBlock } from "./assemble-shared";
import type { ConsularValues } from "./records";

const catalogs = {
	ne: { consular: neConsular },
	en: { consular: enConsular },
	zh: { consular: zhConsular },
};

export function assembleConsularMessage(values: ConsularValues, note: string, preparedOn: Date): string {
	return assembleFieldBlock(
		"consularTitle",
		"consularCannotMatch",
		consularFields,
		{
			yourName: values.yourName,
			country: values.country,
			missingName: values.missingName,
			lastKnownPlace: values.lastKnownPlace,
			reachYou: values.reachYou,
		},
		note,
		preparedOn,
		catalogs,
	);
}
