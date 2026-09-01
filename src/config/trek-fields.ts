import type { FieldSpec, RepeatableSpec } from "./types";

export const trekLegacyKey = "npflood.trek.v1";
export const trekDraftKey = "npflood.trek.draft.v1";
export const trekSessionKey = "npflood.trek.session.v1";

export const trekFields: FieldSpec[] = [
   {
      id: "agency",
      kind: "text",
      required: true,
      copyKey: "trek.agency",
      options: null,
      autocomplete: "organization",
   },
   {
      id: "route",
      kind: "textarea",
      required: true,
      copyKey: "trek.route",
      options: null,
      autocomplete: null,
   },
   {
      id: "lastContactWhen",
      kind: "text",
      required: true,
      copyKey: "trek.lastContactWhen",
      options: null,
      autocomplete: null,
   },
   {
      id: "lastContactHow",
      kind: "select",
      required: true,
      copyKey: "trek.lastContactHow",
      options: [
         { value: "radio", copyKey: "trek.lastContactHow.options.radio" },
         { value: "satphone", copyKey: "trek.lastContactHow.options.satphone" },
         { value: "phone", copyKey: "trek.lastContactHow.options.phone" },
         { value: "in_person", copyKey: "trek.lastContactHow.options.in_person" },
         { value: "other", copyKey: "trek.lastContactHow.options.other" },
      ],
      autocomplete: null,
   },
];

export const trekMemberSpec: RepeatableSpec = {
   id: "members",
   addKey: "trek.member.add",
   removeKey: "trek.member.remove",
   fields: [
      {
         id: "name",
         kind: "text",
         required: true,
         copyKey: "trek.member.name",
         options: null,
         autocomplete: "name",
      },
      {
         id: "idNumber",
         kind: "text",
         required: true,
         copyKey: "trek.member.idNumber",
         options: null,
         autocomplete: "off",
      },
      {
         id: "nationality",
         kind: "text",
         required: false,
         copyKey: "trek.member.nationality",
         options: null,
         autocomplete: "country-name",
      },
   ],
};
