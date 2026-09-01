import type { FieldSpec } from "./types";

export const safeLegacyKey = "npflood.safe.v1";
export const safeDraftKey = "npflood.safe.draft.v1";
export const safeSessionKey = "npflood.safe.session.v1";

export const safeFields: FieldSpec[] = [
   {
      id: "name",
      kind: "text",
      required: true,
      copyKey: "safe.name",
      options: null,
      autocomplete: "name",
   },
   {
      id: "location",
      kind: "textarea",
      required: true,
      copyKey: "safe.location",
      options: null,
      autocomplete: null,
   },
   {
      id: "familyPhone",
      kind: "text",
      required: true,
      copyKey: "safe.familyPhone",
      options: null,
      autocomplete: "tel",
   },
   {
      id: "line",
      kind: "text",
      required: false,
      copyKey: "safe.line",
      options: null,
      autocomplete: "off",
   },
];
