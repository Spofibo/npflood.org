import enChrome from "../locales/en/chrome.json";
import enConsularFields from "../locales/en/fields/consular.json";
import enFindFields from "../locales/en/fields/find.json";
import enKerungFields from "../locales/en/fields/kerung.json";
import enSafeFields from "../locales/en/fields/safe.json";
import enTrekFields from "../locales/en/fields/trek.json";
import enForm from "../locales/en/form.json";
import enPages from "../locales/en/pages.json";
import enPaper from "../locales/en/paper.json";
import neChrome from "../locales/ne/chrome.json";
import neConsularFields from "../locales/ne/fields/consular.json";
import neFindFields from "../locales/ne/fields/find.json";
import neKerungFields from "../locales/ne/fields/kerung.json";
import neSafeFields from "../locales/ne/fields/safe.json";
import neTrekFields from "../locales/ne/fields/trek.json";
import neForm from "../locales/ne/form.json";
import nePages from "../locales/ne/pages.json";
import nePaper from "../locales/ne/paper.json";
import zhChrome from "../locales/zh/chrome.json";
import zhConsularFields from "../locales/zh/fields/consular.json";
import zhFindFields from "../locales/zh/fields/find.json";
import zhKerungFields from "../locales/zh/fields/kerung.json";
import zhSafeFields from "../locales/zh/fields/safe.json";
import zhTrekFields from "../locales/zh/fields/trek.json";
import zhForm from "../locales/zh/form.json";
import zhPages from "../locales/zh/pages.json";
import zhPaper from "../locales/zh/paper.json";
import { collectKeys } from "./nested-string";

const enFields = {
	kerung: enKerungFields,
	trek: enTrekFields,
	find: enFindFields,
	consular: enConsularFields,
	safe: enSafeFields,
};
const neFields = {
	kerung: neKerungFields,
	trek: neTrekFields,
	find: neFindFields,
	consular: neConsularFields,
	safe: neSafeFields,
};
const zhFields = {
	kerung: zhKerungFields,
	trek: zhTrekFields,
	find: zhFindFields,
	consular: zhConsularFields,
	safe: zhSafeFields,
};

export type UiLang = "ne" | "en" | "zh";
export type Namespace = "chrome" | "pages" | "form" | "fields" | "paper";
export type FormCopy = typeof enForm;
export type FieldsCopy = typeof enFields;
export type ChromeCopy = typeof enChrome;
export type PagesCopy = typeof enPages;
export type PaperCopy = typeof enPaper;

const catalogs = {
	ne: { chrome: neChrome, pages: nePages, form: neForm, fields: neFields, paper: nePaper },
	en: { chrome: enChrome, pages: enPages, form: enForm, fields: enFields, paper: enPaper },
	zh: { chrome: zhChrome, pages: zhPages, form: zhForm, fields: zhFields, paper: zhPaper },
} as const;

function assertSameKeys(locale: UiLang, namespace: Namespace): void {
	const english: string[] = [];
	const other: string[] = [];
	collectKeys(catalogs.en[namespace], "", english);
	collectKeys(catalogs[locale][namespace], "", other);
	english.sort();
	other.sort();
	if (english.length !== other.length) {
		throw new Error(`locale ${locale} namespace ${namespace} key count ${other.length} does not match en ${english.length}`);
	}
	for (let index = 0; index < english.length; index += 1) {
		if (english[index] !== other[index]) {
			throw new Error(`locale ${locale} namespace ${namespace} key mismatch at ${english[index]} vs ${other[index]}`);
		}
	}
}

assertSameKeys("ne", "chrome");
assertSameKeys("ne", "pages");
assertSameKeys("ne", "form");
assertSameKeys("ne", "fields");
assertSameKeys("ne", "paper");
assertSameKeys("zh", "chrome");
assertSameKeys("zh", "pages");
assertSameKeys("zh", "form");
assertSameKeys("zh", "fields");
assertSameKeys("zh", "paper");

export function isUiLang(value: string): value is UiLang {
	return value === "ne" || value === "en" || value === "zh";
}

export function chromeCopy(locale: UiLang): ChromeCopy {
	return catalogs[locale].chrome;
}

export function pagesCopy(locale: UiLang): PagesCopy {
	return catalogs[locale].pages;
}

export function formCopy(locale: UiLang): FormCopy {
	return catalogs[locale].form;
}

export function fieldsCopy(locale: UiLang): FieldsCopy {
	return catalogs[locale].fields;
}

export function paperCopy(locale: UiLang): PaperCopy {
	return catalogs[locale].paper;
}

export function localePath(locale: UiLang, path: string): string {
	if (!path.startsWith("/")) {
		throw new Error(`localePath expected a leading slash, received ${path}`);
	}
	if (locale === "ne") {
		return path;
	}
	if (path === "/") {
		return `/${locale}/`;
	}
	return `/${locale}${path}`;
}

export function pageLocale(current: string | undefined): UiLang {
	if (current !== undefined && isUiLang(current)) {
		return current;
	}
	return "ne";
}

export function localeFromPathname(pathname: string, current: string | undefined): UiLang {
	if (pathname === "/en" || pathname.startsWith("/en/")) {
		return "en";
	}
	if (pathname === "/zh" || pathname.startsWith("/zh/")) {
		return "zh";
	}
	return pageLocale(current);
}

export function htmlLang(locale: UiLang): string {
	if (locale === "ne") {
		return "ne";
	}
	if (locale === "en") {
		return "en";
	}
	return "zh";
}

export function ogLocale(locale: UiLang): string {
	if (locale === "ne") {
		return "ne_NP";
	}
	if (locale === "en") {
		return "en_US";
	}
	return "zh_CN";
}

export function schemaLanguage(locale: UiLang): string {
	if (locale === "ne") {
		return "ne-NP";
	}
	if (locale === "en") {
		return "en-US";
	}
	return "zh-CN";
}

export function hreflangAlternates(path: string): { lang: string; href: string }[] {
	return [
		{ lang: "ne-NP", href: path },
		{ lang: "en-US", href: localePath("en", path) },
		{ lang: "zh-CN", href: localePath("zh", path) },
		{ lang: "x-default", href: path },
	];
}
