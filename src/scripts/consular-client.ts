import { consularDraftKey, consularFields, consularLegacyKey, consularSessionKey } from "../config/consular-fields";
import { assembleConsularPaper } from "../lib/assemble-simple";
import { readFormPageConfig } from "../lib/form-page";
import { emptyConsularValues, isConsularDraft } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

const root = document.getElementById("consular-app");
if (root === null) {
   throw new Error("Consular form root is missing");
}
const page = readFormPageConfig(document.getElementById("consular-config"), "Consular config is missing");
mountSimpleForm(root, page.destination, {
   draftKey: consularDraftKey,
   sessionKey: consularSessionKey,
   legacyKey: consularLegacyKey,
   fields: consularFields,
   emptyValues: emptyConsularValues,
   isDraft: isConsularDraft,
   paper: assembleConsularPaper,
   form: page.form,
   fieldCatalog: page.fields,
});
