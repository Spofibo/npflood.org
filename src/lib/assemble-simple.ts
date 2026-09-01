import { consularFields } from "../config/consular-fields";
import { findFields } from "../config/find-fields";
import { safeFields } from "../config/safe-fields";
import enConsular from "../locales/en/fields/consular.json";
import enFind from "../locales/en/fields/find.json";
import enSafe from "../locales/en/fields/safe.json";
import neConsular from "../locales/ne/fields/consular.json";
import neFind from "../locales/ne/fields/find.json";
import neSafe from "../locales/ne/fields/safe.json";
import zhConsular from "../locales/zh/fields/consular.json";
import zhFind from "../locales/zh/fields/find.json";
import zhSafe from "../locales/zh/fields/safe.json";
import { fieldBlockSections, type PaperSection } from "./assemble-shared";
import type { ConsularValues, FindValues, SafeValues } from "./records";

const findCatalogs = {
   ne: { find: neFind },
   en: { find: enFind },
   zh: { find: zhFind },
};

const safeCatalogs = {
   ne: { safe: neSafe },
   en: { safe: enSafe },
   zh: { safe: zhSafe },
};

const consularCatalogs = {
   ne: { consular: neConsular },
   en: { consular: enConsular },
   zh: { consular: zhConsular },
};

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
      findCatalogs,
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
      safeCatalogs,
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
      consularCatalogs,
   );
}
