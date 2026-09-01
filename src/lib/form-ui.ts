import type { Destination } from "../config/destinations";
import { destinationIsOpen } from "../config/destinations";
import { copyText, selectElementText } from "./clipboard";
import { el } from "./dom";
import type { FormCopy } from "./i18n";
import { clearAllStoredForms } from "./storage";
import type { StoredForm } from "./storage";

function isWeChatBrowser(userAgent: string): boolean {
	return userAgent.includes("MicroMessenger");
}

function smsShareHref(body: string, userAgent: string): string {
	const encoded = encodeURIComponent(body);
	if (/iPhone|iPad|iPod/i.test(userAgent) === true) {
		return `sms:&body=${encoded}`;
	}
	return `sms:?body=${encoded}`;
}

function whatsappShareHref(body: string): string {
	return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

function shareLink(href: string, label: string, accessibleName: string): HTMLAnchorElement {
	const link = document.createElement("a");
	link.className = "btn btn--quiet";
	link.href = href;
	link.textContent = label;
	link.setAttribute("aria-label", accessibleName);
	if (href.startsWith("https://")) {
		link.rel = "noopener noreferrer";
	}
	return link;
}

export function renderSendPanel(
	destination: Destination,
	messageEl: HTMLElement,
	copy: FormCopy,
): HTMLElement {
	const panel = el("div", "stack", null);
	const actions = el("div", "btn-row", null);
	const copyBtn = document.createElement("button");
	copyBtn.type = "button";
	copyBtn.className = "btn";
	copyBtn.textContent = copy.copy;
	const copyStatus = el("div", "hint", null);
	copyStatus.id = "copy-message-status";
	copyStatus.setAttribute("aria-live", "polite");
	copyStatus.setAttribute("aria-atomic", "true");
	copyStatus.setAttribute("aria-label", copy.copyStatus);
	copyBtn.addEventListener("click", () => {
		void copyText(messageEl.textContent ?? "").then((result) => {
			if (result === "copied") {
				copyStatus.textContent = copy.copied;
				return;
			}
			selectElementText(messageEl);
			copyStatus.textContent = copy.copyFallback;
		});
	});
	const printBtn = document.createElement("button");
	printBtn.type = "button";
	printBtn.className = "btn btn--quiet";
	printBtn.textContent = copy.print;
	printBtn.addEventListener("click", () => {
		window.print();
	});
	const body = messageEl.textContent ?? "";
	const userAgent = navigator.userAgent;
	const inWeChat = isWeChatBrowser(userAgent) === true;
	if (inWeChat === false) {
		actions.append(
			copyBtn,
			printBtn,
			shareLink(smsShareHref(body, userAgent), copy.sms, copy.smsName),
			shareLink(whatsappShareHref(body), copy.whatsapp, copy.whatsappName),
		);
	} else {
		actions.append(copyBtn, printBtn);
	}
	panel.append(actions, copyStatus);

	const send = el("div", "refcard stack", null);
	send.append(el("p", null, copy.takeToPerson));
	if (inWeChat === true) {
		send.append(el("p", null, copy.inWeChat));
	}
	if (destinationIsOpen(destination) === true) {
		send.append(el("p", null, copy.namedContact));
		if (destination.wechatId !== null && destination.wechatId.length > 0) {
			const line = el("p", null, null);
			line.append(document.createTextNode(`${copy.wechatId} ${destination.wechatId}`));
			send.append(line);
		}
		if (destination.phone !== null && destination.phone.length > 0) {
			const line = el("p", null, null);
			line.append(document.createTextNode(`${copy.phoneLabel} `));
			const link = document.createElement("a");
			link.href = `tel:${destination.phone}`;
			link.textContent = destination.phone;
			line.append(link);
			send.append(line);
		}
		if (destination.qrImageSrc !== null && destination.qrImageSrc.length > 0) {
			const image = document.createElement("img");
			image.src = destination.qrImageSrc;
			image.alt = copy.wechatId;
			image.width = 220;
			image.height = 220;
			send.append(image);
		}
		if (destination.officialChannelUrl !== null && destination.officialChannelUrl.length > 0) {
			const official = document.createElement("a");
			official.href = destination.officialChannelUrl;
			official.rel = "noopener noreferrer";
			official.textContent = copy.officialCheck;
			send.append(official);
		}
	}
	send.append(el("p", null, copy.phoneAlso));
	panel.append(send);

	const shared = el("div", "note stack", null);
	shared.append(el("p", null, copy.sharedPhone));
	const clearBtn = document.createElement("button");
	clearBtn.type = "button";
	clearBtn.className = "btn btn--quiet";
	clearBtn.textContent = copy.clearDevice;
	clearBtn.addEventListener("click", () => {
		clearAllStoredForms();
		window.location.reload();
	});
	shared.append(clearBtn);
	panel.append(shared);
	return panel;
}

export function renderNoteExplain(note: string, copy: FormCopy): HTMLElement {
	const box = el("div", "note stack", null);
	const word = el("p", "tile-title", note);
	box.append(word);
	box.append(el("p", null, copy.noteExplain));
	return box;
}

export function renderBanner(kind: "warn" | "ok", text: string): HTMLElement {
	const banner = el("div", `banner banner--${kind}`, text);
	if (kind === "warn") {
		banner.setAttribute("role", "alert");
	}
	return banner;
}

export function renderStorageWarn(text: string): HTMLElement {
	const banner = renderBanner("warn", text);
	banner.id = "storage-warn";
	return banner;
}

export function ensureStorageWarn(root: HTMLElement, text: string): void {
	if (document.getElementById("storage-warn") !== null) {
		return;
	}
	root.prepend(renderStorageWarn(text));
}

export function showValidationBanner(form: HTMLElement, text: string): void {
	form.querySelectorAll(":scope > .banner").forEach((node) => {
		node.remove();
	});
	const banner = renderBanner("warn", text);
	banner.setAttribute("aria-live", "assertive");
	form.prepend(banner);
}

export function button(label: string, className: string): HTMLButtonElement {
	const node = document.createElement("button");
	node.type = "button";
	node.className = className;
	node.textContent = label;
	return node;
}

export function namedRemoveButton(
	removeLabel: string,
	nameInput: Element | null,
	index: number,
	onRemove: (index: number) => void,
): HTMLButtonElement {
	const remove = button(removeLabel, "btn btn--quiet");
	const syncName = (): void => {
		const typed = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : "";
		const who = typed.length > 0 ? typed : String(index + 1);
		remove.setAttribute("aria-label", `${removeLabel} ${who}`);
	};
	syncName();
	if (nameInput instanceof HTMLInputElement) {
		nameInput.addEventListener("input", syncName);
	}
	remove.addEventListener("click", (event) => {
		event.preventDefault();
		onRemove(index);
	});
	return remove;
}

export function paintAssembledPanel<TValues extends Record<string, string>, TRow>(
	root: HTMLElement,
	record: StoredForm<TValues, TRow>,
	destination: Destination,
	form: FormCopy,
	onChange: (next: StoredForm<TValues, TRow>) => void,
): void {
	if (record.assembledText === null) {
		throw new Error("assembled record is missing message text");
	}
	if (record.status === "assembled") {
		root.append(renderBanner("warn", form.readyUnsent));
	} else {
		root.append(renderBanner("ok", form.markedSent));
	}
	root.append(renderNoteExplain(record.note, form));
	const region = el("div", "stack", null);
	region.setAttribute("aria-live", "polite");
	const heading = el("h2", "tile-title", form.assembledHeading);
	heading.tabIndex = -1;
	const card = el("div", "refcard", null);
	const pre = document.createElement("pre");
	pre.textContent = record.assembledText;
	card.append(pre);
	region.append(heading, card);
	root.append(region);
	root.append(renderSendPanel(destination, pre, form));
	if (record.status === "assembled") {
		const ask = el("div", "stack", null);
		ask.append(el("p", null, form.askSent));
		const mark = button(form.markSent, "btn");
		mark.addEventListener("click", () => {
			onChange({
				status: "sent",
				note: record.note,
				values: record.values,
				rows: record.rows,
				assembledText: record.assembledText,
				updatedAt: new Date().toISOString(),
			});
		});
		ask.append(mark);
		root.append(ask);
	}
	const back = button(record.status === "sent" ? form.prepareUpdate : form.editAgain, "btn btn--quiet");
	back.addEventListener("click", () => {
		onChange({
			status: "draft",
			note: record.note,
			values: record.values,
			rows: record.rows,
			assembledText: record.assembledText,
			updatedAt: new Date().toISOString(),
		});
	});
	root.append(back);
	heading.focus();
	heading.scrollIntoView({ block: "center", inline: "nearest" });
}
