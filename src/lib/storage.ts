import { consularDraftKey, consularLegacyKey, consularSessionKey } from "../config/consular-fields";
import { findDraftKey, findLegacyKey, findSessionKey } from "../config/find-fields";
import { kerungDraftKey, kerungLegacyKey, kerungSessionKey } from "../config/kerung-fields";
import { safeDraftKey, safeLegacyKey, safeSessionKey } from "../config/safe-fields";
import { trekDraftKey, trekLegacyKey, trekSessionKey } from "../config/trek-fields";

export type FormStatus = "draft" | "assembled" | "sent";

export type StoredForm<TValues, TRow> = {
   status: FormStatus;
   note: string;
   values: TValues;
   rows: TRow[];
   assembledText: string | null;
   updatedAt: string;
};

export type FormDraft<TValues, TRow> = {
   values: TValues;
   rows: TRow[];
   updatedAt: string;
};

export type FormSession = {
   note: string;
   markedSent: boolean;
   updatedAt: string;
};

export const DRAFT_TTL_MS = 6 * 60 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const formKeys = [
   { draft: findDraftKey, session: findSessionKey, legacy: findLegacyKey },
   { draft: consularDraftKey, session: consularSessionKey, legacy: consularLegacyKey },
   { draft: safeDraftKey, session: safeSessionKey, legacy: safeLegacyKey },
   { draft: kerungDraftKey, session: kerungSessionKey, legacy: kerungLegacyKey },
   { draft: trekDraftKey, session: trekSessionKey, legacy: trekLegacyKey },
] as const;

export function storageAvailable(): boolean {
   try {
      const probe = "__npflood_probe";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return true;
   } catch {
      return false;
   }
}

function isQuotaError(error: unknown): boolean {
   if (error instanceof DOMException === false) {
      return false;
   }
   return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22;
}

function parseTime(iso: string): number | null {
   const ms = Date.parse(iso);
   if (Number.isNaN(ms) === true) {
      return null;
   }
   return ms;
}

function isFresh(updatedAt: string, ttlMs: number, nowMs: number): boolean {
   const then = parseTime(updatedAt);
   if (then === null) {
      return false;
   }
   return nowMs - then <= ttlMs;
}

function readJson(key: string): unknown | null {
   if (storageAvailable() === false) {
      return null;
   }
   const raw = window.localStorage.getItem(key);
   if (raw === null) {
      return null;
   }
   try {
      return JSON.parse(raw);
   } catch {
      console.warn("stored json is not valid", { key });
      return null;
   }
}

function writeJson(key: string, value: unknown): boolean {
   if (storageAvailable() === false) {
      return false;
   }
   try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
   } catch (error) {
      if (isQuotaError(error) === true) {
         console.warn("stored save exceeded quota", { key });
         return false;
      }
      throw error;
   }
}

export function isFormStatus(value: unknown): value is FormStatus {
   return value === "draft" || value === "assembled" || value === "sent";
}

export function isStringRecord(value: unknown): value is Record<string, string> {
   if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return false;
   }
   const entries = Object.entries(value);
   return entries.every((entry) => typeof entry[1] === "string");
}

function isFormSession(value: unknown): value is FormSession {
   if (value === null || typeof value !== "object") {
      return false;
   }
   const record = value as Record<string, unknown>;
   return typeof record.note === "string" && typeof record.markedSent === "boolean" && typeof record.updatedAt === "string";
}

export function migrateLegacyForm(legacyKey: string, sessionKey: string): void {
   if (storageAvailable() === false) {
      return;
   }
   const raw = window.localStorage.getItem(legacyKey);
   if (raw === null) {
      return;
   }
   try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object") {
         const record = parsed as Record<string, unknown>;
         if (typeof record.note === "string") {
            const session: FormSession = {
               note: record.note,
               markedSent: record.status === "sent",
               updatedAt: new Date().toISOString(),
            };
            writeJson(sessionKey, session);
         }
      }
   } catch {
      console.warn("legacy form json is not valid", { key: legacyKey });
   }
   window.localStorage.removeItem(legacyKey);
}

export function loadFormSession(key: string): FormSession | null {
   const parsed = readJson(key);
   if (parsed === null) {
      return null;
   }
   if (isFormSession(parsed) === false) {
      console.warn("stored session has an unexpected shape", { key });
      window.localStorage.removeItem(key);
      return null;
   }
   if (isFresh(parsed.updatedAt, SESSION_TTL_MS, Date.now()) === false) {
      window.localStorage.removeItem(key);
      return null;
   }
   return parsed;
}

export function saveFormSession(key: string, session: FormSession): boolean {
   return writeJson(key, session);
}

export function loadFormDraft<TValues, TRow>(
   key: string,
   isDraft: (value: unknown) => value is FormDraft<TValues, TRow>,
): FormDraft<TValues, TRow> | null {
   const parsed = readJson(key);
   if (parsed === null) {
      return null;
   }
   if (isDraft(parsed) === false) {
      console.warn("stored draft has an unexpected shape", { key });
      window.localStorage.removeItem(key);
      return null;
   }
   if (isFresh(parsed.updatedAt, DRAFT_TTL_MS, Date.now()) === false) {
      window.localStorage.removeItem(key);
      return null;
   }
   return parsed;
}

export function saveFormDraft<TValues, TRow>(key: string, draft: FormDraft<TValues, TRow>): boolean {
   return writeJson(key, draft);
}

export function clearAllStoredForms(): void {
   if (storageAvailable() === false) {
      return;
   }
   for (const keys of formKeys) {
      window.localStorage.removeItem(keys.draft);
      window.localStorage.removeItem(keys.session);
      window.localStorage.removeItem(keys.legacy);
   }
}
