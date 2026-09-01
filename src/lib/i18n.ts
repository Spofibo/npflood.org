import en from "../locales/en";
import ne from "../locales/ne";
import zh from "../locales/zh";
import { collectKeys } from "./nested-string";

export type UiLang = "ne" | "en" | "zh";
type Namespace = "chrome" | "pages" | "form" | "fields" | "paper";
export type FormCopy = typeof en.form;
export type FieldsCopy = typeof en.fields;
export type ChromeCopy = typeof en.chrome;
export type PagesCopy = typeof en.pages;
export type PaperCopy = typeof en.paper;

const catalogs = {
   ne,
   en,
   zh,
} as const;

const namespaces: Namespace[] = ["chrome", "pages", "form", "fields", "paper"];
const otherLocales: UiLang[] = ["ne", "zh"];

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

for (const locale of otherLocales) {
   for (const namespace of namespaces) {
      assertSameKeys(locale, namespace);
   }
}

const localeIds = {
   ne: { og: "ne_NP", schema: "ne-NP", hreflang: "ne-NP" },
   en: { og: "en_US", schema: "en-US", hreflang: "en-US" },
   zh: { og: "zh_CN", schema: "zh-CN", hreflang: "zh-CN" },
} as const;

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

export function fieldCatalogs(): { ne: FieldsCopy; en: FieldsCopy; zh: FieldsCopy } {
   return {
      ne: catalogs.ne.fields,
      en: catalogs.en.fields,
      zh: catalogs.zh.fields,
   };
}

export function paperCatalogs(): { ne: PaperCopy; en: PaperCopy; zh: PaperCopy } {
   return {
      ne: catalogs.ne.paper,
      en: catalogs.en.paper,
      zh: catalogs.zh.paper,
   };
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

export function localeFromPathname(pathname: string, current: string | undefined): UiLang {
   if (pathname === "/en" || pathname.startsWith("/en/")) {
      return "en";
   }
   if (pathname === "/zh" || pathname.startsWith("/zh/")) {
      return "zh";
   }
   if (current === "ne" || current === "en" || current === "zh") {
      return current;
   }
   return "ne";
}

export function ogLocale(locale: UiLang): string {
   return localeIds[locale].og;
}

export function schemaLanguage(locale: UiLang): string {
   return localeIds[locale].schema;
}

export function hreflangAlternates(path: string): { lang: string; href: string }[] {
   return [
      { lang: localeIds.ne.hreflang, href: path },
      { lang: localeIds.en.hreflang, href: localePath("en", path) },
      { lang: localeIds.zh.hreflang, href: localePath("zh", path) },
      { lang: "x-default", href: path },
   ];
}

const chooserPageIds = ["danger", "status", "needs", "safe", "find", "kerung", "trek", "consular", "help"] as const;

export function chooserPagePath(pages: PagesCopy, id: string): string {
   for (const pageId of chooserPageIds) {
      if (pageId === id) {
         return pages[pageId].path;
      }
   }
   throw new Error(`chooser id ${id} is not a page`);
}
