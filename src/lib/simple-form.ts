import type { Destination } from "../config/destinations";
import type { FieldSpec } from "../config/types";
import { el, localizeField, readFieldValue, renderField, showErrors } from "./dom";
import type { FieldsCopy, FormCopy } from "./i18n";
import { button, ensureStorageWarn, paintAssembledPanel, renderNoteExplain, renderStorageWarn, showValidationBanner } from "./form-ui";
import { createNoteFromEntropy } from "./note";
import {
	loadFormDraft,
	loadFormSession,
	migrateLegacyForm,
	saveFormDraft,
	saveFormSession,
	storageAvailable,
	type FormDraft,
	type StoredForm,
} from "./storage";
import { validateFields } from "./validate";

export type SimpleFormConfig<TValues extends Record<string, string>> = {
	draftKey: string;
	sessionKey: string;
	legacyKey: string;
	fields: FieldSpec[];
	emptyValues: () => TValues;
	isDraft: (value: unknown) => value is FormDraft<TValues, never>;
	assemble: (values: TValues, note: string, preparedOn: Date) => string;
	form: FormCopy;
	fieldCatalog: FieldsCopy;
};

function readValues<TValues extends Record<string, string>>(
	form: HTMLElement,
	fields: FieldSpec[],
	emptyValues: () => TValues,
): TValues {
	const next = emptyValues();
	for (const field of fields) {
		next[field.id as keyof TValues] = readFieldValue(form, field.id, field.kind) as TValues[keyof TValues];
	}
	return next;
}

export function mountSimpleForm<TValues extends Record<string, string>>(
	root: HTMLElement,
	destination: Destination,
	config: SimpleFormConfig<TValues>,
): void {
	migrateLegacyForm(config.legacyKey, config.sessionKey);
	let saveFailed = false;
	let markedSent = false;
	const session = loadFormSession(config.sessionKey);
	const draft = loadFormDraft(config.draftKey, config.isDraft);
	if (session !== null) {
		markedSent = session.markedSent;
	}
	let record: StoredForm<TValues, never> = {
		status: "draft",
		note: session !== null ? session.note : createNoteFromEntropy(),
		values: draft !== null ? draft.values : config.emptyValues(),
		rows: [],
		assembledText: null,
		updatedAt: new Date().toISOString(),
	};

	const persist = (next: StoredForm<TValues, never>): void => {
		if (next.status === "sent") {
			markedSent = true;
		}
		const now = new Date().toISOString();
		const sessionSaved = saveFormSession(config.sessionKey, {
			note: next.note,
			markedSent,
			updatedAt: now,
		});
		const draftSaved = saveFormDraft(config.draftKey, {
			values: next.values,
			rows: [],
			updatedAt: now,
		});
		saveFailed = sessionSaved === false || draftSaved === false;
		if (saveFailed === true) {
			ensureStorageWarn(root, config.form.storageWarn);
		}
	};

	persist(record);

	const paint = (): void => {
		root.replaceChildren();
		if (storageAvailable() === false || saveFailed === true) {
			root.append(renderStorageWarn(config.form.storageWarn));
		}
		if ((record.status === "assembled" || record.status === "sent") && record.assembledText !== null) {
			paintAssembledPanel(root, record, destination, config.form, (next) => {
				record = next;
				persist(record);
				paint();
			});
			return;
		}
		paintForm();
	};

	const paintForm = (): void => {
		const form = el("form", "stack", null) as HTMLFormElement;
		form.noValidate = true;
		for (const field of config.fields) {
			const value = record.values[field.id];
			form.append(
				renderField(
					localizeField(field, config.fieldCatalog),
					field.id,
					value === undefined ? "" : value,
					config.form.selectPrompt,
				),
			);
		}
		const persistDraftFromDom = (): void => {
			record = {
				status: "draft",
				note: record.note,
				values: readValues(form, config.fields, config.emptyValues),
				rows: [],
				assembledText: null,
				updatedAt: new Date().toISOString(),
			};
			persist(record);
		};
		const submit = button(markedSent === true ? config.form.prepareUpdate : config.form.prepare, "btn");
		submit.type = "submit";
		submit.formNoValidate = true;
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			persistDraftFromDom();
			const errors = validateFields(config.fields, record.values, "", config.form.emptyRequired);
			if (errors.length > 0) {
				showErrors(form, errors, config.form.errorMarker);
				showValidationBanner(form, config.form.validation);
				return;
			}
			record = {
				status: "assembled",
				note: record.note,
				values: record.values,
				rows: record.rows,
				assembledText: config.assemble(record.values, record.note, new Date()),
				updatedAt: new Date().toISOString(),
			};
			persist(record);
			paint();
		});
		form.append(submit);
		form.addEventListener("input", () => {
			persistDraftFromDom();
		});
		root.append(renderNoteExplain(record.note, config.form));
		root.append(form);
	};

	paint();
}
