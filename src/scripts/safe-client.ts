import { safeDraftKey, safeFields, safeLegacyKey, safeSessionKey } from "../config/safe-fields";
import { assembleSafePaper } from "../lib/assemble-safe";
import { readFormPageConfig } from "../lib/form-page";
import { emptySafeValues, isSafeDraft } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

const root = document.getElementById("safe-app");
if (root === null) {
	throw new Error("Safe form root is missing");
}
const page = readFormPageConfig(document.getElementById("safe-config"), "Safe config is missing");
mountSimpleForm(root, page.destination, {
	draftKey: safeDraftKey,
	sessionKey: safeSessionKey,
	legacyKey: safeLegacyKey,
	fields: safeFields,
	emptyValues: emptySafeValues,
	isDraft: isSafeDraft,
	paper: assembleSafePaper,
	form: page.form,
	fieldCatalog: page.fields,
});
