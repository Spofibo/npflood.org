import { findFields, findStorageKey } from "../config/find-fields";
import { assembleFindMessage } from "../lib/assemble-find";
import { readFormPageConfig } from "../lib/form-page";
import { emptyFindValues, isFindRecord } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

const root = document.getElementById("find-app");
if (root === null) {
	throw new Error("Find form root is missing");
}
const page = readFormPageConfig(document.getElementById("find-config"), "Find config is missing");
mountSimpleForm(root, page.destination, {
	storageKey: findStorageKey,
	fields: findFields,
	emptyValues: emptyFindValues,
	isRecord: isFindRecord,
	assemble: assembleFindMessage,
	form: page.form,
	fieldCatalog: page.fields,
});
