import type { FieldSpec } from "../config/types";
import { readNestedString } from "./nested-string";

export type NoscriptLine = {
   label: string;
   hint: string;
};

export function noscriptFieldLines(fields: FieldSpec[], catalog: unknown): NoscriptLine[] {
   return fields.map((field) => {
      const label = readNestedString(catalog, `${field.copyKey}.label`);
      const hint = readNestedString(catalog, `${field.copyKey}.hint`);
      if (field.kind === "select" && field.options !== null) {
         const options = field.options.map((option) => readNestedString(catalog, option.copyKey)).join(", ");
         if (hint.length === 0) {
            return { label, hint: options };
         }
         return { label, hint: `${hint} ${options}` };
      }
      return { label, hint };
   });
}
