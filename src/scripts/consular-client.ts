import { consularFields, consularStorageKey } from "../config/consular-fields";
import { assembleConsularMessage } from "../lib/assemble-consular";
import { readFormPageConfig } from "../lib/form-page";
import { emptyConsularValues, isConsularRecord } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

const root = document.getElementById("consular-app");
if (root === null) {
	throw new Error("Consular form root is missing");
}
const page = readFormPageConfig(document.getElementById("consular-config"), "Consular config is missing");
mountSimpleForm(root, page.destination, {
	storageKey: consularStorageKey,
	fields: consularFields,
	emptyValues: emptyConsularValues,
	isRecord: isConsularRecord,
	assemble: assembleConsularMessage,
	form: page.form,
	fieldCatalog: page.fields,
});
