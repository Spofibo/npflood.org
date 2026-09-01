import type { PaperLine, PaperSection } from "./assemble-shared";
import { el } from "./dom";

export function setPrintMode(mode: "card" | "page"): void {
	if (mode === "card") {
		document.body.dataset.print = "card";
		return;
	}
	delete document.body.dataset.print;
}

function langAttr(lang: PaperLine["lang"]): string {
	if (lang === "ne") {
		return "ne";
	}
	if (lang === "en") {
		return "en";
	}
	return "zh";
}

function langLine(line: PaperLine, className: string | null): HTMLElement {
	const node = el("p", className, line.text);
	node.lang = langAttr(line.lang);
	return node;
}

function valueBlock(value: string | PaperLine[], className: string): HTMLElement {
	if (typeof value === "string") {
		return el("p", className, value);
	}
	const box = el("div", className, null);
	for (const line of value) {
		box.append(langLine(line, null));
	}
	return box;
}

function renderSection(section: PaperSection): HTMLElement | null {
	if (section.kind === "titles") {
		const box = el("div", "print-card__titles", null);
		for (const line of section.lines) {
			box.append(langLine(line, null));
		}
		return box;
	}
	if (section.kind === "notice") {
		const box = el("div", "print-card__notice", null);
		for (const line of section.lines) {
			box.append(langLine(line, null));
		}
		return box;
	}
	if (section.kind === "note") {
		const box = el("div", "print-card__note", null);
		for (const line of section.labels) {
			box.append(langLine(line, "print-card__label"));
		}
		box.append(el("p", "print-card__note-word", section.note));
		return box;
	}
	if (section.kind === "prepared") {
		const box = el("div", "print-card__dates", null);
		for (const line of section.lines) {
			box.append(langLine(line, null));
		}
		return box;
	}
	if (section.kind === "rule") {
		return null;
	}
	if (section.kind === "field") {
		const box = el("div", "print-card__field", null);
		for (const line of section.labels) {
			box.append(langLine(line, "print-card__label"));
		}
		box.append(valueBlock(section.value, "print-card__value"));
		return box;
	}
	if (section.kind === "stack") {
		const box = el("div", "print-card__stack", null);
		for (const line of section.lines) {
			box.append(langLine(line, null));
		}
		return box;
	}
	if (section.kind === "group") {
		const box = el("div", "print-card__group", null);
		for (const line of section.labels) {
			box.append(langLine(line, null));
		}
		return box;
	}
	const box = el("div", "print-card__item", null);
	box.append(el("p", "print-card__item-index", String(section.index)));
	for (const field of section.fields) {
		const row = el("div", "print-card__field", null);
		for (const line of field.labels) {
			row.append(langLine(line, "print-card__label"));
		}
		row.append(valueBlock(field.value, "print-card__value"));
		box.append(row);
	}
	return box;
}

export function renderPrintCard(sections: PaperSection[]): HTMLElement {
	const card = el("article", "print-card print-only", null);
	for (const section of sections) {
		const node = renderSection(section);
		if (node !== null) {
			card.append(node);
		}
	}
	return card;
}
