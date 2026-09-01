import type { FieldSpec, LocalizedField } from "../config/types";
import type { FieldsCopy } from "./i18n";
import { readNestedString } from "./nested-string";
import type { FieldError } from "./validate";

export { readNestedString };

export function localizeField(field: FieldSpec, catalog: FieldsCopy): LocalizedField {
   const label = readNestedString(catalog, `${field.copyKey}.label`);
   const hintRaw = readNestedString(catalog, `${field.copyKey}.hint`);
   const hint = hintRaw.length === 0 ? null : hintRaw;
   let options: LocalizedField["options"] = null;
   if (field.options !== null) {
      options = field.options.map((option) => ({
         value: option.value,
         label: readNestedString(catalog, option.copyKey),
      }));
   }
   return {
      id: field.id,
      kind: field.kind,
      required: field.required,
      label,
      hint,
      options,
      autocomplete: field.autocomplete,
   };
}

export function el(tag: string, className: string | null, text: string | null): HTMLElement {
   const node = document.createElement(tag);
   if (className !== null) {
      node.className = className;
   }
   if (text !== null) {
      node.textContent = text;
   }
   return node;
}

function bindDescribedBy(control: HTMLElement, ids: string[]): void {
   const present = ids.filter((id) => id.length > 0);
   if (present.length === 0) {
      control.removeAttribute("aria-describedby");
      return;
   }
   control.setAttribute("aria-describedby", present.join(" "));
}

export function renderField(field: LocalizedField, name: string, value: string, selectPrompt: string): HTMLElement {
   const wrap = el("div", "field", null);
   wrap.dataset.fieldId = name;
   const hintId = `${name}-hint`;
   const errorId = `${name}-error`;
   if (field.kind === "textarea") {
      const label = el("label", "field-label", field.label);
      label.setAttribute("for", name);
      wrap.append(label);
      if (field.hint !== null) {
         const hint = el("div", "hint", field.hint);
         hint.id = hintId;
         wrap.append(hint);
      }
      const input = document.createElement("textarea");
      input.id = name;
      input.name = name;
      input.value = value;
      if (field.required === true) {
         input.setAttribute("aria-required", "true");
      }
      bindDescribedBy(input, field.hint !== null ? [hintId] : []);
      wrap.append(input);
      return wrap;
   }
   if (field.kind === "checkbox") {
      const choice = el("label", "choice", null);
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = name;
      input.name = name;
      input.checked = value === "yes";
      choice.append(input);
      choice.append(document.createTextNode(field.label));
      wrap.append(choice);
      if (field.hint !== null) {
         const hint = el("div", "hint", field.hint);
         hint.id = hintId;
         input.setAttribute("aria-describedby", hintId);
         wrap.append(hint);
      }
      return wrap;
   }
   if (field.kind === "select") {
      const label = el("label", "field-label", field.label);
      label.setAttribute("for", name);
      wrap.append(label);
      if (field.hint !== null) {
         const hint = el("div", "hint", field.hint);
         hint.id = hintId;
         wrap.append(hint);
      }
      const input = document.createElement("select");
      input.id = name;
      input.name = name;
      if (field.required === true) {
         input.setAttribute("aria-required", "true");
      }
      bindDescribedBy(input, field.hint !== null ? [hintId] : []);
      const prompt = document.createElement("option");
      prompt.value = "";
      prompt.textContent = selectPrompt;
      input.append(prompt);
      if (field.options !== null) {
         for (const option of field.options) {
            const node = document.createElement("option");
            node.value = option.value;
            node.textContent = option.label;
            if (option.value === value) {
               node.selected = true;
            }
            input.append(node);
         }
      }
      wrap.append(input);
      return wrap;
   }
   const label = el("label", "field-label", field.label);
   label.setAttribute("for", name);
   wrap.append(label);
   if (field.hint !== null) {
      const hint = el("div", "hint", field.hint);
      hint.id = hintId;
      wrap.append(hint);
   }
   const input = document.createElement("input");
   input.type = "text";
   input.id = name;
   input.name = name;
   input.value = value;
   if (field.required === true) {
      input.setAttribute("aria-required", "true");
   }
   if (field.autocomplete !== null) {
      input.autocomplete = field.autocomplete;
   }
   bindDescribedBy(input, field.hint !== null ? [hintId] : []);
   wrap.append(input);
   return wrap;
}

export function readFieldValue(root: HTMLElement, name: string, kind: FieldSpec["kind"]): string {
   const node = root.querySelector(`#${cssIdSelector(name)}`);
   if (node === null) {
      return "";
   }
   if (kind === "checkbox" && node instanceof HTMLInputElement) {
      if (node.checked === true) {
         return "yes";
      }
      return "no";
   }
   if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
      return node.value;
   }
   return "";
}

export function showErrors(root: HTMLElement, errors: FieldError[], errorMarker: string): void {
   const existing = root.querySelectorAll(".error");
   existing.forEach((node) => {
      node.remove();
   });
   root.querySelectorAll(".field--error").forEach((node) => {
      node.classList.remove("field--error");
   });
   root.querySelectorAll("[aria-invalid]").forEach((node) => {
      node.removeAttribute("aria-invalid");
      const described = node.getAttribute("aria-describedby");
      if (described === null) {
         return;
      }
      const kept = described.split(" ").filter((id) => id.endsWith("-hint"));
      if (kept.length === 0) {
         node.removeAttribute("aria-describedby");
         return;
      }
      node.setAttribute("aria-describedby", kept.join(" "));
   });
   let firstControl: HTMLElement | null = null;
   for (const error of errors) {
      const field = root.querySelector(`[data-field-id="${cssAttrValue(error.fieldId)}"]`);
      if (!(field instanceof HTMLElement)) {
         throw new Error(`cannot paint error: no field with data-field-id ${error.fieldId}`);
      }
      field.classList.add("field--error");
      const message = el("div", "error", `${errorMarker} ${error.message}`);
      message.id = `${error.fieldId}-error`;
      field.append(message);
      const control = field.querySelector("input, textarea, select");
      if (control instanceof HTMLElement) {
         control.setAttribute("aria-invalid", "true");
         const described = control.getAttribute("aria-describedby");
         const next = described === null ? message.id : `${described} ${message.id}`;
         control.setAttribute("aria-describedby", next);
         if (firstControl === null) {
            firstControl = control;
         }
      }
   }
   if (firstControl !== null) {
      firstControl.focus();
      firstControl.scrollIntoView({ block: "center", inline: "nearest" });
   }
}

function cssAttrValue(value: string): string {
   return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function cssIdSelector(value: string): string {
   if (typeof CSS !== "undefined" && CSS.escape !== undefined) {
      return CSS.escape(value);
   }
   return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\./g, "\\.");
}
