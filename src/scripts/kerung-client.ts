import type { Destination } from "../config/destinations";
import { kerungCompanionSpec, kerungDraftKey, kerungFields, kerungLegacyKey, kerungProxyField, kerungProxyNameField, kerungSessionKey } from "../config/kerung-fields";
import { assembleKerungPaper } from "../lib/assemble-kerung";
import { paperToText } from "../lib/assemble-shared";
import { el, cssIdSelector, localizeField, readFieldValue, readNestedString, renderField, showErrors } from "../lib/dom";
import { readFormPageConfig } from "../lib/form-page";
import { button, ensureStorageWarn, namedRemoveButton, paintAssembledPanel, renderBanner, renderNoteExplain, renderStorageWarn, showValidationBanner } from "../lib/form-ui";
import { setPrintMode } from "../lib/paper-print";
import type { FieldsCopy, FormCopy, PaperCopy } from "../lib/i18n";
import { createNoteFromEntropy } from "../lib/note";
import { emptyCompanion, emptyKerungValues, isKerungDraft, stripKerungIdentifying, type CompanionRow, type KerungValues } from "../lib/records";
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
      proxy: readFieldValue(form, "proxy", "checkbox"),
      proxyName: readFieldValue(form, "proxyName", "text"),
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

function readKerungDial(raw: HTMLElement | null): {
   policeLabel: string;
   childHelplineLabel: string;
   dialName: string;
   policeSource: string;
   childSource: string;
   verified: string;
} {
   if (raw === null || raw.textContent === null) {
      throw new Error("Kerung dial copy is missing");
   }
   const parsed: unknown = JSON.parse(raw.textContent);
   if (parsed === null || typeof parsed !== "object") {
      throw new Error("Kerung dial copy is missing");
   }
   const record = parsed as Record<string, unknown>;
   if (
      typeof record.policeLabel !== "string" ||
      typeof record.childHelplineLabel !== "string" ||
      typeof record.dialName !== "string" ||
      typeof record.policeSource !== "string" ||
      typeof record.childSource !== "string" ||
      typeof record.verified !== "string"
   ) {
      throw new Error("Kerung dial copy is missing");
   }
   return {
      policeLabel: record.policeLabel,
      childHelplineLabel: record.childHelplineLabel,
      dialName: record.dialName,
      policeSource: record.policeSource,
      childSource: record.childSource,
      verified: record.verified,
   };
}

function renderDialLink(
   label: string,
   number: string,
   dialName: string,
   sourceLabel: string,
   verified: string,
): { block: HTMLElement; link: HTMLAnchorElement } {
   const block = el("div", "dial-block stack", null);
   block.append(el("div", null, label));
   const link = document.createElement("a");
   link.href = `tel:${number}`;
   link.textContent = number;
   link.setAttribute("aria-label", formatDialName(dialName, label, number));
   block.append(link);
   block.append(el("p", "dial-meta", sourceLabel));
   block.append(el("p", "dial-meta", verified));
   return { block, link };
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
      const localized = localizeField(field, fieldCatalog);
      const painted =
         field.id === "passport" ? { ...localized, hint: form.retypeIdHint } : localized;
      block.append(renderField(painted, `companions.${index}.${field.id}`, value, form.selectPrompt));
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
   paper: PaperCopy,
   destination: Destination,
   dial: {
      policeLabel: string;
      childHelplineLabel: string;
      dialName: string;
      policeSource: string;
      childSource: string;
      verified: string;
   },
): void {
   migrateLegacyForm(kerungLegacyKey, kerungSessionKey);
   let saveFailed = false;
   let markedSent = false;
   const session = loadFormSession(kerungSessionKey);
   const draft = loadFormDraft(kerungDraftKey, isKerungDraft);
   if (session !== null) {
      markedSent = session.markedSent;
   }
   let record: StoredForm<KerungValues, CompanionRow> = {
      status: "draft",
      note: session !== null ? session.note : createNoteFromEntropy(),
      values: draft !== null ? draft.values : emptyKerungValues(),
      rows: draft !== null ? draft.rows : [],
      assembledText: null,
      updatedAt: new Date().toISOString(),
   };
   const persist = (next: StoredForm<KerungValues, CompanionRow>): void => {
      if (next.status === "sent") {
         markedSent = true;
      }
      const now = new Date().toISOString();
      const stripped = stripKerungIdentifying(next.values, next.rows);
      const sessionSaved = saveFormSession(kerungSessionKey, {
         note: next.note,
         markedSent,
         updatedAt: now,
      });
      const draftSaved = saveFormDraft(kerungDraftKey, {
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
            assembleKerungPaper(record.values, record.rows, record.note, new Date(record.updatedAt)),
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

      const childDial = renderDialLink(
         dial.childHelplineLabel,
         "1098",
         dial.dialName,
         dial.childSource,
         dial.verified,
      );
      const policeDial = renderDialLink(dial.policeLabel, "100", dial.dialName, dial.policeSource, dial.verified);
      const childLink = childDial.link;

      const rest = el("div", "stack", null);
      for (const field of kerungFields) {
         const value = record.values[field.id as keyof KerungValues];
         const localized = localizeField(field, fieldCatalog);
         const painted = field.id === "passport" ? { ...localized, hint: form.retypeIdHint } : localized;
         rest.append(renderField(painted, field.id, value, form.selectPrompt));
      }
      rest.append(renderField(localizeField(kerungProxyField, fieldCatalog), "proxy", record.values.proxy, form.selectPrompt));
      const proxyNameBlock = renderField(
         localizeField(kerungProxyNameField, fieldCatalog),
         "proxyName",
         record.values.proxyName,
         form.selectPrompt,
      );
      rest.append(proxyNameBlock);
      const syncProxy = (): void => {
         const proxyInput = rest.querySelector("#proxy");
         if (proxyInput instanceof HTMLInputElement && proxyInput.checked === true) {
            proxyNameBlock.classList.remove("hidden");
         } else {
            proxyNameBlock.classList.add("hidden");
         }
      };
      const proxyInput = rest.querySelector("#proxy");
      if (proxyInput instanceof HTMLInputElement) {
         proxyInput.addEventListener("change", () => {
            syncProxy();
         });
      }
      syncProxy();
      const companionsHeading = el("h2", "tile-title", paper.companionsHeading);
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

      const submit = button(markedSent === true ? form.prepareUpdate : form.prepare, "btn");
      submit.type = "submit";
      submit.formNoValidate = true;
      formEl.addEventListener("submit", (event) => {
         event.preventDefault();
         if (yes.checked === true) {
            persistDraftFromDom();
            childLink.focus();
            childLink.scrollIntoView({ block: "center", inline: "nearest" });
            return;
         }
         if (no.checked === false) {
            showErrors(formEl, [
               {
                  fieldId: "minor",
                  message: form.emptyRequired,
               },
            ], form.errorMarker);
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
         if (record.values.proxy === "yes" && record.values.proxyName.trim().length === 0) {
            all.push({
               fieldId: "proxyName",
               message: form.emptyRequired,
            });
         }
         if (all.length > 0) {
            showErrors(formEl, all, form.errorMarker);
            showValidationBanner(formEl, form.validation);
            return;
         }
         const preparedOn = new Date();
         record = {
            status: "assembled",
            note: record.note,
            values: record.values,
            rows: record.rows,
            assembledText: paperToText(assembleKerungPaper(record.values, record.rows, record.note, preparedOn)),
            updatedAt: preparedOn.toISOString(),
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
            assembledText: null,
            updatedAt: new Date().toISOString(),
         };
         persist(record);
      };

      formEl.addEventListener("input", () => {
         persistDraftFromDom();
      });

      const minorStop = el("div", "stack", null);
      minorStop.append(renderBanner("warn", form.minorStop));
      minorStop.append(childDial.block, policeDial.block);

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
mount(root, page.form, page.fields, page.paper, page.destination, dial);
