import type { FieldSpec } from "../config/types";
import { formatGregorianPrepared, formatNepaliPrepared } from "./date";
import { paperCatalogs, type UiLang } from "./i18n";
import { readNestedString } from "./nested-string";

const papers = paperCatalogs();

export type FieldCatalogs = {
   ne: unknown;
   en: unknown;
   zh: unknown;
};

export type PaperLine = {
   lang: UiLang;
   text: string;
};

export type PaperField = {
   labels: PaperLine[];
   value: string | PaperLine[];
};

export type PaperSection =
   | { kind: "titles"; lines: PaperLine[] }
   | { kind: "notice"; lines: PaperLine[] }
   | { kind: "note"; labels: PaperLine[]; note: string }
   | { kind: "prepared"; lines: PaperLine[] }
   | { kind: "rule" }
   | { kind: "field"; labels: PaperLine[]; value: string | PaperLine[] }
   | { kind: "stack"; lines: PaperLine[] }
   | { kind: "group"; labels: PaperLine[] }
   | { kind: "item"; index: number; fields: PaperField[] };

function paperMonths(catalog: unknown): string[] {
   if (catalog === null || typeof catalog !== "object" || !("months" in catalog)) {
      throw new Error("paper catalog is missing months");
   }
   const months = (catalog as { months: unknown }).months;
   if (!Array.isArray(months) || months.length !== 12) {
      throw new Error("paper months must be 12 strings");
   }
   if (months.every((item) => typeof item === "string") === false) {
      throw new Error("paper months must be 12 strings");
   }
   return months;
}

export function paperLines(key: string): PaperLine[] {
   return [
      { lang: "ne", text: readNestedString(papers.ne, key) },
      { lang: "en", text: readNestedString(papers.en, key) },
      { lang: "zh", text: readNestedString(papers.zh, key) },
   ];
}

export function fieldLabels(copyKey: string, catalogs: FieldCatalogs): PaperLine[] {
   return [
      { lang: "ne", text: readNestedString(catalogs.ne, `${copyKey}.label`) },
      { lang: "en", text: readNestedString(catalogs.en, `${copyKey}.label`) },
      { lang: "zh", text: readNestedString(catalogs.zh, `${copyKey}.label`) },
   ];
}

function optionLines(copyKey: string, catalogs: FieldCatalogs): PaperLine[] {
   return [
      { lang: "ne", text: readNestedString(catalogs.ne, copyKey) },
      { lang: "en", text: readNestedString(catalogs.en, copyKey) },
      { lang: "zh", text: readNestedString(catalogs.zh, copyKey) },
   ];
}

export function assembledValueText(value: string | PaperLine[]): string {
   if (typeof value === "string") {
      return value;
   }
   return value.map((line) => line.text).join(" / ");
}

export function assembledFieldValue(
   fields: FieldSpec[],
   id: string,
   values: Record<string, string>,
   catalogs: FieldCatalogs,
): string | PaperLine[] {
   const field = fields.find((item) => item.id === id);
   const raw = values[id];
   if (field === undefined || raw === undefined) {
      throw new Error(`missing field ${id} while assembling a message`);
   }
   if (field.kind === "select" && field.options !== null) {
      const option = field.options.find((item) => item.value === raw);
      if (option === undefined) {
         return raw;
      }
      return optionLines(option.copyKey, catalogs);
   }
   return raw.trim();
}

export function includeAssembledField(field: FieldSpec, value: string): boolean {
   if (field.kind === "checkbox" && field.required === false && value !== "yes") {
      return false;
   }
   if (field.required === false && value.length === 0) {
      return false;
   }
   return true;
}

function joinLabels(lines: PaperLine[]): string {
   return lines.map((line) => line.text).join(" / ");
}

export function paperToText(sections: PaperSection[]): string {
   const lines: string[] = [];
   let previous: PaperSection["kind"] | null = null;
   for (const section of sections) {
      if (section.kind === "titles") {
         for (const line of section.lines) {
            lines.push(line.text);
         }
         previous = section.kind;
         continue;
      }
      if (section.kind === "notice" || section.kind === "stack") {
         lines.push("");
         for (const line of section.lines) {
            lines.push(line.text);
         }
         previous = section.kind;
         continue;
      }
      if (section.kind === "note") {
         lines.push("");
         for (const line of section.labels) {
            lines.push(`${line.text}: ${section.note}`);
         }
         previous = section.kind;
         continue;
      }
      if (section.kind === "prepared") {
         lines.push("");
         for (const line of section.lines) {
            lines.push(line.text);
         }
         previous = section.kind;
         continue;
      }
      if (section.kind === "rule") {
         lines.push("");
         lines.push("---");
         previous = section.kind;
         continue;
      }
      if (section.kind === "field") {
         if (previous !== "group") {
            lines.push("");
         }
         lines.push(`${joinLabels(section.labels)}\n${assembledValueText(section.value)}`);
         previous = section.kind;
         continue;
      }
      if (section.kind === "group") {
         lines.push("");
         lines.push(joinLabels(section.labels));
         previous = section.kind;
         continue;
      }
      lines.push("");
      lines.push(`${section.index}.`);
      for (const field of section.fields) {
         lines.push(`${joinLabels(field.labels)}\n${assembledValueText(field.value)}`);
      }
      previous = section.kind;
   }
   return lines.join("\n");
}

export function headerSections(
   titleKey: string,
   note: string,
   preparedOn: Date,
   extraKey: string | null,
): PaperSection[] {
   const sections: PaperSection[] = [
      { kind: "titles", lines: paperLines(titleKey) },
      { kind: "notice", lines: paperLines("notRegistration") },
   ];
   if (extraKey !== null) {
      sections.push({ kind: "notice", lines: paperLines(extraKey) });
   }
   sections.push({
      kind: "note",
      labels: paperLines("noteLine"),
      note,
   });
   sections.push({
      kind: "prepared",
      lines: [
         {
            lang: "ne",
            text: `${readNestedString(papers.ne, "prepared")}: ${formatNepaliPrepared(preparedOn, paperMonths(papers.ne))}`,
         },
         {
            lang: "en",
            text: `${readNestedString(papers.en, "prepared")}: ${formatGregorianPrepared(preparedOn, paperMonths(papers.en))}`,
         },
         {
            lang: "zh",
            text: `${readNestedString(papers.zh, "prepared")}: ${formatGregorianPrepared(preparedOn, paperMonths(papers.zh))}`,
         },
      ],
   });
   sections.push({ kind: "rule" });
   return sections;
}

export function screenshotSections(): PaperSection[] {
   return [
      { kind: "stack", lines: paperLines("screenshot") },
      { kind: "stack", lines: paperLines("closing") },
   ];
}

function pushFieldSection(
   sections: PaperSection[],
   field: FieldSpec,
   value: string | PaperLine[],
   catalogs: FieldCatalogs,
): void {
   const text = typeof value === "string" ? value : assembledValueText(value);
   if (includeAssembledField(field, text) === false) {
      return;
   }
   sections.push({
      kind: "field",
      labels: fieldLabels(field.copyKey, catalogs),
      value,
   });
}

export function fieldBlockSections(
   titleKey: string,
   extraKey: string | null,
   fields: FieldSpec[],
   values: Record<string, string>,
   note: string,
   preparedOn: Date,
   catalogs: FieldCatalogs,
): PaperSection[] {
   const sections: PaperSection[] = headerSections(titleKey, note, preparedOn, extraKey);
   for (const field of fields) {
      pushFieldSection(sections, field, assembledFieldValue(fields, field.id, values, catalogs), catalogs);
   }
   sections.push(...screenshotSections());
   return sections;
}
