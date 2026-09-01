import type { FieldSpec } from "./types";

export const findStorageKey = "npflood.find.v1";

export const findFields: FieldSpec[] = [
	{
		id: "missingName",
		kind: "text",
		required: true,
		copyKey: "find.missingName",
		options: null,
		autocomplete: "off",
	},
	{
		id: "age",
		kind: "text",
		required: false,
		copyKey: "find.age",
		options: null,
		autocomplete: "off",
	},
	{
		id: "lastSeen",
		kind: "textarea",
		required: true,
		copyKey: "find.lastSeen",
		options: null,
		autocomplete: null,
	},
	{
		id: "appearance",
		kind: "textarea",
		required: true,
		copyKey: "find.appearance",
		options: null,
		autocomplete: null,
	},
	{
		id: "reporterName",
		kind: "text",
		required: true,
		copyKey: "find.reporterName",
		options: null,
		autocomplete: "name",
	},
	{
		id: "reporterPhone",
		kind: "text",
		required: true,
		copyKey: "find.reporterPhone",
		options: null,
		autocomplete: "tel",
	},
	{
		id: "relation",
		kind: "text",
		required: true,
		copyKey: "find.relation",
		options: null,
		autocomplete: "off",
	},
];
