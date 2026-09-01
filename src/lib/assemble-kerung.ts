import { kerungCompanionSpec, kerungFields, kerungProxyNameField } from "../config/kerung-fields";
import {
   assembledFieldValue,
   assembledValueText,
   fieldLabels,
   headerSections,
   includeAssembledField,
   paperLines,
   screenshotSections,
   type PaperField,
   type PaperSection,
} from "./assemble-shared";
import { fieldCatalogs } from "./i18n";
import type { CompanionRow, KerungValues } from "./records";

const catalogs = fieldCatalogs();

export function assembleKerungPaper(
   values: KerungValues,
   companions: CompanionRow[],
   note: string,
   preparedOn: Date,
): PaperSection[] {
   const asRecord: Record<string, string> = {
      name: values.name,
      passport: values.passport,
      wechatOrPhone: values.wechatOrPhone,
      location: values.location,
      nepalContact: values.nepalContact,
      medical: values.medical,
      proxy: values.proxy,
      proxyName: values.proxyName,
   };
   const sections: PaperSection[] = headerSections("kerungTitle", note, preparedOn, null);
   for (const field of kerungFields) {
      if (field.id === "medical") {
         continue;
      }
      const value = assembledFieldValue(kerungFields, field.id, asRecord, catalogs);
      const text = assembledValueText(value);
      if (includeAssembledField(field, text) === false) {
         continue;
      }
      sections.push({
         kind: "field",
         labels: fieldLabels(field.copyKey, catalogs),
         value,
      });
   }
   if (values.medical === "yes") {
      sections.push({ kind: "stack", lines: paperLines("medicalYes") });
   } else {
      sections.push({ kind: "stack", lines: paperLines("medicalNo") });
   }
   if (values.proxy === "yes") {
      sections.push({ kind: "group", labels: paperLines("proxyHeading") });
      sections.push({
         kind: "field",
         labels: fieldLabels(kerungProxyNameField.copyKey, catalogs),
         value: values.proxyName,
      });
   }
   if (companions.length > 0) {
      sections.push({ kind: "group", labels: paperLines("companionsHeading") });
      companions.forEach((companion, index) => {
         const row: Record<string, string> = {
            name: companion.name,
            passport: companion.passport,
            role: companion.role,
         };
         const fields: PaperField[] = [];
         for (const field of kerungCompanionSpec.fields) {
            fields.push({
               labels: fieldLabels(field.copyKey, catalogs),
               value: assembledFieldValue(kerungCompanionSpec.fields, field.id, row, catalogs),
            });
         }
         sections.push({
            kind: "item",
            index: index + 1,
            fields,
         });
      });
   }
   sections.push(...screenshotSections());
   return sections;
}
