import type { FieldSpec } from "./types";

export const consularStorageKey = "npflood.consular.v1";

export const consularFields: FieldSpec[] = [
	{
		id: "yourName",
		kind: "text",
		required: true,
		copyKey: "consular.yourName",
		options: null,
		autocomplete: "name",
	},
	{
		id: "country",
		kind: "text",
		required: true,
		copyKey: "consular.country",
		options: null,
		autocomplete: "country-name",
	},
	{
		id: "missingName",
		kind: "text",
		required: true,
		copyKey: "consular.missingName",
		options: null,
		autocomplete: "off",
	},
	{
		id: "lastKnownPlace",
		kind: "textarea",
		required: true,
		copyKey: "consular.lastKnownPlace",
		options: null,
		autocomplete: null,
	},
	{
		id: "reachYou",
		kind: "textarea",
		required: true,
		copyKey: "consular.reachYou",
		options: null,
		autocomplete: null,
	},
];
