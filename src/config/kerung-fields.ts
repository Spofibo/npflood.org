import type { FieldSpec, RepeatableSpec } from "./types";

export const kerungStorageKey = "npflood.kerung.v1";

export const kerungFields: FieldSpec[] = [
	{
		id: "name",
		kind: "text",
		required: true,
		copyKey: "kerung.name",
		options: null,
		autocomplete: "name",
	},
	{
		id: "passport",
		kind: "text",
		required: true,
		copyKey: "kerung.passport",
		options: null,
		autocomplete: "off",
	},
	{
		id: "wechatOrPhone",
		kind: "text",
		required: true,
		copyKey: "kerung.wechatOrPhone",
		options: null,
		autocomplete: "tel",
	},
	{
		id: "location",
		kind: "textarea",
		required: true,
		copyKey: "kerung.location",
		options: null,
		autocomplete: null,
	},
	{
		id: "nepalContact",
		kind: "text",
		required: true,
		copyKey: "kerung.nepalContact",
		options: null,
		autocomplete: "tel",
	},
	{
		id: "medical",
		kind: "checkbox",
		required: false,
		copyKey: "kerung.medical",
		options: null,
		autocomplete: null,
	},
];

export const kerungCompanionSpec: RepeatableSpec = {
	id: "companions",
	addKey: "kerung.companion.add",
	removeKey: "kerung.companion.remove",
	fields: [
		{
			id: "name",
			kind: "text",
			required: true,
			copyKey: "kerung.companion.name",
			options: null,
			autocomplete: "name",
		},
		{
			id: "passport",
			kind: "text",
			required: true,
			copyKey: "kerung.companion.passport",
			options: null,
			autocomplete: "off",
		},
		{
			id: "role",
			kind: "select",
			required: true,
			copyKey: "kerung.companion.role",
			options: [
				{ value: "driver", copyKey: "kerung.companion.role.options.driver" },
				{ value: "helper", copyKey: "kerung.companion.role.options.helper" },
				{ value: "family", copyKey: "kerung.companion.role.options.family" },
				{ value: "other", copyKey: "kerung.companion.role.options.other" },
			],
			autocomplete: null,
		},
	],
};
