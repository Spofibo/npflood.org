import { safeFields, safeStorageKey } from "../config/safe-fields";
import { assembleSafeMessage } from "../lib/assemble-safe";
import { readFormPageConfig } from "../lib/form-page";
import { emptySafeValues, isSafeRecord } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

const root = document.getElementById("safe-app");
if (root === null) {
	throw new Error("Safe form root is missing");
}
const page = readFormPageConfig(document.getElementById("safe-config"), "Safe config is missing");
mountSimpleForm(root, page.destination, {
	storageKey: safeStorageKey,
	fields: safeFields,
	emptyValues: emptySafeValues,
	isRecord: isSafeRecord,
	assemble: assembleSafeMessage,
	form: page.form,
	fieldCatalog: page.fields,
});
