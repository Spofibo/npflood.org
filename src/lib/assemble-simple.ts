import { consularFields } from "../config/consular-fields";
import { findFields } from "../config/find-fields";
import { safeFields } from "../config/safe-fields";
import { fieldBlockSections, type PaperSection } from "./assemble-shared";
import { fieldCatalogs } from "./i18n";
import type { ConsularValues, FindValues, SafeValues } from "./records";

const catalogs = fieldCatalogs();

export function assembleFindPaper(values: FindValues, note: string, preparedOn: Date): PaperSection[] {
   return fieldBlockSections(
      "findTitle",
      "findCannotMatch",
      findFields,
      {
         missingName: values.missingName,
         age: values.age,
         lastSeen: values.lastSeen,
         appearance: values.appearance,
         reporterName: values.reporterName,
         alreadyReported: values.alreadyReported,
         reportReference: values.reportReference,
         relation: values.relation,
         reporterPhone: values.reporterPhone,
      },
      note,
      preparedOn,
      catalogs,
   );
}

export function assembleSafePaper(values: SafeValues, note: string, preparedOn: Date): PaperSection[] {
   return fieldBlockSections(
      "safeTitle",
      null,
      safeFields,
      {
         name: values.name,
         location: values.location,
         familyPhone: values.familyPhone,
         line: values.line,
      },
      note,
      preparedOn,
      catalogs,
   );
}

export function assembleConsularPaper(values: ConsularValues, note: string, preparedOn: Date): PaperSection[] {
   return fieldBlockSections(
      "consularTitle",
      "consularCannotMatch",
      consularFields,
      {
         yourName: values.yourName,
         country: values.country,
         missingName: values.missingName,
         lastKnownPlace: values.lastKnownPlace,
         reachYou: values.reachYou,
      },
      note,
      preparedOn,
      catalogs,
   );
}
