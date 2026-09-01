import type { Destination } from "../config/destinations";
import { trekDraftKey, trekFields, trekLegacyKey, trekMemberSpec, trekSessionKey } from "../config/trek-fields";
import { paperToText } from "../lib/assemble-shared";
import { assembleTrekPaper } from "../lib/assemble-trek";
import { el, cssIdSelector, localizeField, readFieldValue, readNestedString, renderField, showErrors } from "../lib/dom";
import { readFormPageConfig } from "../lib/form-page";
import { button, ensureStorageWarn, namedRemoveButton, paintAssembledPanel, renderNoteExplain, renderStorageWarn, showValidationBanner } from "../lib/form-ui";
import { setPrintMode } from "../lib/paper-print";
import type { FieldsCopy, FormCopy } from "../lib/i18n";
import { createNoteFromEntropy } from "../lib/note";
import { emptyMember, emptyTrekValues, isTrekDraft, stripTrekIdentifying, type MemberRow, type TrekValues } from "../lib/records";
import {
	loadFormDraft,
	loadFormSession,
	migrateLegacyForm,
	saveFormDraft,
	saveFormSession,
	storageAvailable,
	type StoredForm,
} from "../lib/storage";
import { validateFields, validateRepeatableRows, type FieldError } from "../lib/validate";

function readValues(form: HTMLElement): TrekValues {
	return {
		agency: readFieldValue(form, "agency", "text"),
		route: readFieldValue(form, "route", "textarea"),
		lastContactWhen: readFieldValue(form, "lastContactWhen", "text"),
		lastContactHow: readFieldValue(form, "lastContactHow", "select"),
	};
}

function readMembers(list: HTMLElement): MemberRow[] {
	const blocks = list.querySelectorAll<HTMLElement>("[data-member]");
	const rows: MemberRow[] = [];
	blocks.forEach((block, index) => {
		rows.push({
			name: readFieldValue(block, `members.${index}.name`, "text"),
			idNumber: readFieldValue(block, `members.${index}.idNumber`, "text"),
			nationality: readFieldValue(block, `members.${index}.nationality`, "text"),
		});
	});
	return rows;
}

function renderMember(
	row: MemberRow,
	index: number,
	onRemove: (index: number) => void,
	form: FormCopy,
	fieldCatalog: FieldsCopy,
): HTMLElement {
	const block = el("div", "repeat-block", null);
	block.dataset.member = "true";
	for (const field of trekMemberSpec.fields) {
		const value = row[field.id as keyof MemberRow];
		const localized = localizeField(field, fieldCatalog);
		const painted = field.id === "idNumber" ? { ...localized, hint: form.retypeIdHint } : localized;
		block.append(renderField(painted, `members.${index}.${field.id}`, value, form.selectPrompt));
	}
	const removeLabel = readNestedString(fieldCatalog, trekMemberSpec.removeKey);
	const nameInput = block.querySelector(`#${cssIdSelector(`members.${index}.name`)}`);
	if (nameInput === null) {
		throw new Error(`member name input missing at index ${index}`);
	}
	block.append(namedRemoveButton(removeLabel, nameInput, index, onRemove));
	return block;
}

function mount(root: HTMLElement, form: FormCopy, fieldCatalog: FieldsCopy, destination: Destination): void {
	migrateLegacyForm(trekLegacyKey, trekSessionKey);
	let saveFailed = false;
	let markedSent = false;
	const session = loadFormSession(trekSessionKey);
	const draft = loadFormDraft(trekDraftKey, isTrekDraft);
	if (session !== null) {
		markedSent = session.markedSent;
	}
	let record: StoredForm<TrekValues, MemberRow> = {
		status: "draft",
		note: session !== null ? session.note : createNoteFromEntropy(),
		values: draft !== null ? draft.values : emptyTrekValues(),
		rows: draft !== null ? draft.rows : [emptyMember()],
		assembledText: null,
		updatedAt: new Date().toISOString(),
	};
	const persist = (next: StoredForm<TrekValues, MemberRow>): void => {
		if (next.status === "sent") {
			markedSent = true;
		}
		const now = new Date().toISOString();
		const stripped = stripTrekIdentifying(next.values, next.rows);
		const sessionSaved = saveFormSession(trekSessionKey, {
			note: next.note,
			markedSent,
			updatedAt: now,
		});
		const draftSaved = saveFormDraft(trekDraftKey, {
			values: stripped.values,
			rows: stripped.rows,
			updatedAt: now,
		});
		saveFailed = sessionSaved === false || draftSaved === false;
		if (saveFailed === true) {
			ensureStorageWarn(root, form.storageWarn);
		}
	};
	persist(record);

	const paint = (): void => {
		root.replaceChildren();
		if (storageAvailable() === false || saveFailed === true) {
			root.append(renderStorageWarn(form.storageWarn));
		}
		if ((record.status === "assembled" || record.status === "sent") && record.assembledText !== null) {
			paintAssembledPanel(
				root,
				record,
				destination,
				form,
				assembleTrekPaper(record.values, record.rows, record.note, new Date(record.updatedAt)),
				(next) => {
					record = next;
					persist(record);
					paint();
				},
			);
			return;
		}
		paintForm();
	};

	const paintForm = (): void => {
		setPrintMode("page");
		const formEl = el("form", "stack", null) as HTMLFormElement;
		formEl.noValidate = true;
		for (const field of trekFields) {
			const value = record.values[field.id as keyof TrekValues];
			formEl.append(renderField(localizeField(field, fieldCatalog), field.id, value, form.selectPrompt));
		}
		const heading = el("h2", "tile-title", form.membersHeading);
		const membersBox = el("div", "field", null);
		membersBox.dataset.fieldId = "members";
		membersBox.append(heading);
		const list = el("div", "stack", null);
		const persistDraftFromDom = (): void => {
			record = {
				status: "draft",
				note: record.note,
				values: readValues(formEl),
				rows: readMembers(list),
				assembledText: null,
				updatedAt: new Date().toISOString(),
			};
			persist(record);
		};
		const redrawMembers = (): void => {
			list.replaceChildren();
			record.rows.forEach((row, index) => {
				list.append(
					renderMember(
						row,
						index,
						(removeIndex) => {
							persistDraftFromDom();
							record.rows = record.rows.filter((_, rowIndex) => rowIndex !== removeIndex);
							persist(record);
							redrawMembers();
						},
						form,
						fieldCatalog,
					),
				);
			});
		};
		const add = button(readNestedString(fieldCatalog, trekMemberSpec.addKey), "btn btn--quiet");
		add.addEventListener("click", (event) => {
			event.preventDefault();
			persistDraftFromDom();
			record.rows = [...record.rows, emptyMember()];
			persist(record);
			redrawMembers();
		});
		membersBox.append(list, add);
		formEl.append(membersBox);
		redrawMembers();
		const submit = button(markedSent === true ? form.prepareUpdate : form.prepare, "btn");
		submit.type = "submit";
		submit.formNoValidate = true;
		formEl.addEventListener("submit", (event) => {
			event.preventDefault();
			persistDraftFromDom();
			const errors: FieldError[] = [
				...validateFields(trekFields, record.values, "", form.emptyRequired),
				...validateRepeatableRows(
					trekMemberSpec.fields,
					record.rows,
					"members.",
					true,
					"members",
					form.emptyRequired,
					form.needOneMember,
				),
			];
			if (errors.length > 0) {
				showErrors(formEl, errors, form.errorMarker);
				showValidationBanner(formEl, form.validation);
				return;
			}
			const preparedOn = new Date();
			record = {
				status: "assembled",
				note: record.note,
				values: record.values,
				rows: record.rows,
				assembledText: paperToText(assembleTrekPaper(record.values, record.rows, record.note, preparedOn)),
				updatedAt: preparedOn.toISOString(),
			};
			persist(record);
			paint();
		});
		formEl.append(submit);
		formEl.addEventListener("input", () => {
			persistDraftFromDom();
		});
		root.append(renderNoteExplain(record.note, form));
		root.append(formEl);
	};

	paint();
}

const root = document.getElementById("trek-app");
const page = readFormPageConfig(document.getElementById("trek-config"), "Trek form root or config is missing");
if (root === null) {
	throw new Error("Trek form root is missing");
}
mount(root, page.form, page.fields, page.destination);
