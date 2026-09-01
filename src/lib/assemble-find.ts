import { findFields } from "../config/find-fields";
import enFind from "../locales/en/fields/find.json";
import neFind from "../locales/ne/fields/find.json";
import zhFind from "../locales/zh/fields/find.json";
import { fieldBlockSections, type PaperSection } from "./assemble-shared";
import type { FindValues } from "./records";

const catalogs = {
   ne: { find: neFind },
   en: { find: enFind },
   zh: { find: zhFind },
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
      catalogs,
   );
}
