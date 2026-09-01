import type { Destination } from "../config/destinations";
import type { FieldsCopy, FormCopy, PaperCopy } from "./i18n";

export type FormPageConfig = {
   destination: Destination;
   form: FormCopy;
   fields: FieldsCopy;
   paper: PaperCopy;
};

export function readFormPageConfig(raw: HTMLElement | null, missingError: string): FormPageConfig {
   if (raw === null || raw.textContent === null) {
      throw new Error(missingError);
   }
   const parsed: unknown = JSON.parse(raw.textContent);
   if (parsed === null || typeof parsed !== "object") {
      throw new Error(missingError);
   }
   const record = parsed as Record<string, unknown>;
   if (!("destination" in record) || !("form" in record) || !("fields" in record) || !("paper" in record)) {
      throw new Error(missingError);
   }
   return {
      destination: record.destination as Destination,
      form: record.form as FormCopy,
      fields: record.fields as FieldsCopy,
      paper: record.paper as PaperCopy,
   };
}
