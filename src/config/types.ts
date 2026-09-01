export type FieldKind = "text" | "textarea" | "checkbox" | "select";

export type SelectOption = {
   value: string;
   copyKey: string;
};

export type FieldSpec = {
   id: string;
   kind: FieldKind;
   required: boolean;
   copyKey: string;
   options: SelectOption[] | null;
   autocomplete: string | null;
};

export type RepeatableSpec = {
   id: string;
   addKey: string;
   removeKey: string;
   fields: FieldSpec[];
};

export type LocalizedField = {
   id: string;
   kind: FieldKind;
   required: boolean;
   label: string;
   hint: string | null;
   options: { value: string; label: string }[] | null;
   autocomplete: string | null;
};
