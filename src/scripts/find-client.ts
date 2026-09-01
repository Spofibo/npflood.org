import { findDraftKey, findFields, findLegacyKey, findSessionKey } from "../config/find-fields";
import { assembleFindPaper } from "../lib/assemble-find";
import { readFormPageConfig } from "../lib/form-page";
import { emptyFindValues, isFindDraft } from "../lib/records";
import { mountSimpleForm } from "../lib/simple-form";

function ageShowsChildLine(raw: string): boolean {
   const trimmed = raw.trim();
   if (trimmed.length === 0) {
      return true;
   }
   if (/^\d+$/.test(trimmed) === false) {
      return true;
   }
   const age = Number.parseInt(trimmed, 10);
   return age < 18;
}

function syncChildDial(): void {
   const childDial = document.getElementById("find-child-dial");
   if (childDial === null) {
      throw new Error("Find child dial wrapper is missing");
   }
   const age = document.getElementById("age");
   const value = age instanceof HTMLInputElement ? age.value : "";
   if (ageShowsChildLine(value) === true) {
      childDial.classList.remove("hidden");
   } else {
      childDial.classList.add("hidden");
   }
}

const root = document.getElementById("find-app");
if (root === null) {
   throw new Error("Find form root is missing");
}
const page = readFormPageConfig(document.getElementById("find-config"), "Find config is missing");
mountSimpleForm(root, page.destination, {
   draftKey: findDraftKey,
   sessionKey: findSessionKey,
   legacyKey: findLegacyKey,
   fields: findFields,
   emptyValues: emptyFindValues,
   isDraft: isFindDraft,
   paper: assembleFindPaper,
   form: page.form,
   fieldCatalog: page.fields,
});

const pageRoot = root.parentElement;
if (pageRoot === null) {
   throw new Error("Find page root is missing");
}
pageRoot.addEventListener("input", (event) => {
   const target = event.target;
   if (target instanceof HTMLElement && target.id === "age") {
      syncChildDial();
   }
});
syncChildDial();
