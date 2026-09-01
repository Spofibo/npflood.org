import type { Destination } from "../config/destinations";
import { kerungCompanionSpec, kerungFields, kerungStorageKey } from "../config/kerung-fields";
import { assembleKerungMessage } from "../lib/assemble-kerung";
import { el, cssIdSelector, localizeField, readFieldValue, readNestedString, renderField, showErrors } from "../lib/dom";
import { readFormPageConfig } from "../lib/form-page";
import { button, ensureStorageWarn, namedRemoveButton, paintAssembledPanel, renderBanner, renderNoteExplain, renderStorageWarn, showValidationBanner } from "../lib/form-ui";
import type { FieldsCopy, FormCopy } from "../lib/i18n";
import { createNoteFromEntropy } from "../lib/note";
import { emptyCompanion, emptyKerungValues, isKerungRecord, type CompanionRow, type KerungValues } from "../lib/records";
import { loadStoredForm, saveStoredForm, storageAvailable, type StoredForm } from "../lib/storage";
import { validateFields, validateRepeatableRows, type FieldError } from "../lib/validate";

function readValues(form: HTMLElement): KerungValues {
	const yes = form.querySelector("#minor-yes");
	const no = form.querySelector("#minor-no");
	let minor = "";
	if (yes instanceof HTMLInputElement && yes.checked === true) {
		minor = "yes";
	} else if (no instanceof HTMLInputElement && no.checked === true) {
		minor = "no";
	}
	return {
		minor,
		name: readFieldValue(form, "name", "text"),
		passport: readFieldValue(form, "passport", "text"),
		wechatOrPhone: readFieldValue(form, "wechatOrPhone", "text"),
		location: readFieldValue(form, "location", "textarea"),
		nepalContact: readFieldValue(form, "nepalContact", "text"),
		medical: readFieldValue(form, "medical", "checkbox"),
	};
}

function readCompanions(list: HTMLElement): CompanionRow[] {
	const blocks = list.querySelectorAll<HTMLElement>("[data-companion]");
	const rows: CompanionRow[] = [];
	blocks.forEach((block, index) => {
		rows.push({
			name: readFieldValue(block, `companions.${index}.name`, "text"),
			passport: readFieldValue(block, `companions.${index}.passport`, "text"),
			role: readFieldValue(block, `companions.${index}.role`, "select"),
		});
	});
	return rows;
}

function formatDialName(template: string, label: string, number: string): string {
	if (template.includes("{label}") === false || template.includes("{number}") === false) {
		throw new Error("dialName template must contain {label} and {number}");
	}
	return template.split("{label}").join(label).split("{number}").join(number);
}

function readKerungDial(raw: HTMLElement | null): { policeLabel: string; dialName: string } {
	if (raw === null || raw.textContent === null) {
		throw new Error("Kerung dial copy is missing");
	}
	const parsed: unknown = JSON.parse(raw.textContent);
	if (parsed === null || typeof parsed !== "object") {
		throw new Error("Kerung dial copy is missing");
	}
	const record = parsed as Record<string, unknown>;
	if (typeof record.policeLabel !== "string" || typeof record.dialName !== "string") {
		throw new Error("Kerung dial copy is missing");
	}
	return {
		policeLabel: record.policeLabel,
		dialName: record.dialName,
	};
}

function renderCompanion(
	row: CompanionRow,
	index: number,
	onRemove: (index: number) => void,
	form: FormCopy,
	fieldCatalog: FieldsCopy,
): HTMLElement {
	const block = el("div", "repeat-block", null);
	block.dataset.companion = "true";
	for (const field of kerungCompanionSpec.fields) {
		const value = row[field.id as keyof CompanionRow];
		block.append(renderField(localizeField(field, fieldCatalog), `companions.${index}.${field.id}`, value, form.selectPrompt));
	}
	const removeLabel = readNestedString(fieldCatalog, kerungCompanionSpec.removeKey);
	const nameInput = block.querySelector(`#${cssIdSelector(`companions.${index}.name`)}`);
	if (nameInput === null) {
		throw new Error(`companion name input missing at index ${index}`);
	}
	block.append(namedRemoveButton(removeLabel, nameInput, index, onRemove));
	return block;
}

function mount(
	root: HTMLElement,
	form: FormCopy,
	fieldCatalog: FieldsCopy,
	destination: Destination,
	policeLabel: string,
	dialName: string,
): void {
	let record: StoredForm<KerungValues, CompanionRow>;
	let saveFailed = false;
	const persist = (next: StoredForm<KerungValues, CompanionRow>): void => {
		const stored: StoredForm<KerungValues, CompanionRow> = {
			status: next.status,
			note: next.note,
			values: next.values,
			rows: next.rows,
			assembledText: next.assembledText,
			updatedAt: new Date().toISOString(),
		};
		saveFailed = saveStoredForm(kerungStorageKey, stored) === false;
		if (saveFailed === true) {
			ensureStorageWarn(root, form.storageWarn);
		}
	};
	const loaded = loadStoredForm(kerungStorageKey, isKerungRecord);
	if (loaded === null) {
		record = {
			status: "draft",
			note: createNoteFromEntropy(form.noteAdjectives, form.noteNouns),
			values: emptyKerungValues(),
			rows: [],
			assembledText: null,
			updatedAt: new Date().toISOString(),
		};
		persist(record);
	} else {
		record = loaded;
	}

	const paint = (): void => {
		root.replaceChildren();
		if (storageAvailable() === false || saveFailed === true) {
			root.append(renderStorageWarn(form.storageWarn));
		}
		if (record.status === "assembled" || record.status === "sent") {
			paintAssembledPanel(root, record, destination, form, (next) => {
				record = next;
				persist(record);
				paint();
			});
			return;
		}
		paintForm();
	};

	const paintForm = (): void => {
		const formEl = el("form", "stack", null) as HTMLFormElement;
		formEl.noValidate = true;
		const minorBox = el("fieldset", "field", null);
		minorBox.dataset.fieldId = "minor";
		const legend = el("legend", "field-label", readNestedString(fieldCatalog, "kerung.minor.question"));
		const choices = el("div", "choices", null);
		const yesId = "minor-yes";
		const noId = "minor-no";
		const yesLabel = el("label", "choice", null);
		const yes = document.createElement("input");
		yes.type = "radio";
		yes.name = "minor";
		yes.id = yesId;
		yes.value = "yes";
		yes.setAttribute("aria-required", "true");
		if (record.values.minor === "yes") {
			yes.checked = true;
		}
		yesLabel.append(yes);
		yesLabel.append(document.createTextNode(readNestedString(fieldCatalog, "kerung.minor.yes")));
		const noLabel = el("label", "choice", null);
		const no = document.createElement("input");
		no.type = "radio";
		no.name = "minor";
		no.id = noId;
		no.value = "no";
		if (record.values.minor === "no") {
			no.checked = true;
		}
		noLabel.append(no);
		noLabel.append(document.createTextNode(readNestedString(fieldCatalog, "kerung.minor.no")));
		choices.append(yesLabel, noLabel);
		minorBox.append(legend, choices);
		formEl.append(minorBox);

		const policeLink = document.createElement("a");
		policeLink.href = "tel:100";
		policeLink.textContent = "100";
		policeLink.setAttribute("aria-label", formatDialName(dialName, policeLabel, "100"));

		const rest = el("div", "stack", null);
		for (const field of kerungFields) {
			const value = record.values[field.id as keyof KerungValues];
			rest.append(renderField(localizeField(field, fieldCatalog), field.id, value, form.selectPrompt));
		}
		const companionsHeading = el("h2", "tile-title", form.companionsHeading);
		rest.append(companionsHeading);
		const list = el("div", "stack", null);
		const redrawCompanions = (): void => {
			list.replaceChildren();
			record.rows.forEach((row, index) => {
				list.append(
					renderCompanion(
						row,
						index,
						(removeIndex) => {
							persistDraftFromDom();
							record.rows = record.rows.filter((_, rowIndex) => rowIndex !== removeIndex);
							persist(record);
							redrawCompanions();
						},
						form,
						fieldCatalog,
					),
				);
			});
		};
		const add = button(readNestedString(fieldCatalog, kerungCompanionSpec.addKey), "btn btn--quiet");
		add.addEventListener("click", (event) => {
			event.preventDefault();
			persistDraftFromDom();
			record.rows = [...record.rows, emptyCompanion()];
			persist(record);
			redrawCompanions();
		});
		rest.append(list, add);
		redrawCompanions();

		const submit = button(form.prepare, "btn");
		submit.type = "submit";
		submit.formNoValidate = true;
		formEl.addEventListener("submit", (event) => {
			event.preventDefault();
			if (yes.checked === true) {
				persistDraftFromDom();
				policeLink.focus();
				policeLink.scrollIntoView({ block: "center", inline: "nearest" });
				return;
			}
			if (no.checked === false) {
				showErrors(formEl, [
					{
						fieldId: "minor",
						message: form.emptyRequired,
					},
				]);
				showValidationBanner(formEl, form.validation);
				return;
			}
			persistDraftFromDom();
			const errors: FieldError[] = validateFields(kerungFields, record.values, "", form.emptyRequired);
			const companionErrors = validateRepeatableRows(
				kerungCompanionSpec.fields,
				record.rows,
				"companions.",
				false,
				"companions",
				form.emptyRequired,
				form.needOneMember,
			);
			const all = [...errors, ...companionErrors];
			if (all.length > 0) {
				showErrors(formEl, all);
				showValidationBanner(formEl, form.validation);
				return;
			}
			const text = assembleKerungMessage(record.values, record.rows, record.note, new Date());
			record = {
				status: "assembled",
				note: record.note,
				values: record.values,
				rows: record.rows,
				assembledText: text,
				updatedAt: new Date().toISOString(),
			};
			persist(record);
			paint();
		});
		rest.append(submit);

		const persistDraftFromDom = (): void => {
			record = {
				status: "draft",
				note: record.note,
				values: readValues(formEl),
				rows: readCompanions(list),
				assembledText: record.assembledText,
				updatedAt: new Date().toISOString(),
			};
			persist(record);
		};

		formEl.addEventListener("input", () => {
			persistDraftFromDom();
		});

		const minorStop = el("div", "stack", null);
		minorStop.append(renderBanner("warn", form.minorStop));
		const dial = el("div", "dial-block stack", null);
		dial.append(el("div", null, policeLabel));
		dial.append(policeLink);
		minorStop.append(dial);

		const syncMinor = (): void => {
			if (yes.checked === true) {
				rest.classList.add("hidden");
				minorStop.classList.remove("hidden");
			} else {
				rest.classList.remove("hidden");
				minorStop.classList.add("hidden");
			}
		};
		yes.addEventListener("change", () => {
			persistDraftFromDom();
			syncMinor();
		});
		no.addEventListener("change", () => {
			persistDraftFromDom();
			syncMinor();
		});
		syncMinor();

		formEl.append(rest, minorStop);
		root.append(renderNoteExplain(record.note, form));
		root.append(formEl);
	};

	paint();
}

const root = document.getElementById("kerung-app");
const configNode = document.getElementById("kerung-config");
const page = readFormPageConfig(configNode, "Kerung form root or config is missing");
const dial = readKerungDial(configNode);
if (root === null) {
	throw new Error("Kerung form root is missing");
}
mount(root, page.form, page.fields, page.destination, dial.policeLabel, dial.dialName);
