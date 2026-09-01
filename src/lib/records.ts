import { isStringRecord, type FormDraft } from "./storage";

export type KerungValues = {
   minor: string;
   name: string;
   passport: string;
   wechatOrPhone: string;
   location: string;
   nepalContact: string;
   medical: string;
   proxy: string;
   proxyName: string;
};

export type CompanionRow = {
   name: string;
   passport: string;
   role: string;
};

export type TrekValues = {
   agency: string;
   route: string;
   lastContactWhen: string;
   lastContactHow: string;
};

export type MemberRow = {
   name: string;
   idNumber: string;
   nationality: string;
};

export type FindValues = {
   missingName: string;
   age: string;
   lastSeen: string;
   appearance: string;
   reporterName: string;
   reporterPhone: string;
   relation: string;
   alreadyReported: string;
   reportReference: string;
};

export type ConsularValues = {
   yourName: string;
   country: string;
   missingName: string;
   lastKnownPlace: string;
   reachYou: string;
};

export type SafeValues = {
   name: string;
   location: string;
   familyPhone: string;
   line: string;
};

export function emptyKerungValues(): KerungValues {
   return {
      minor: "",
      name: "",
      passport: "",
      wechatOrPhone: "",
      location: "",
      nepalContact: "",
      medical: "no",
      proxy: "no",
      proxyName: "",
   };
}

export function emptyTrekValues(): TrekValues {
   return {
      agency: "",
      route: "",
      lastContactWhen: "",
      lastContactHow: "",
   };
}

export function emptyCompanion(): CompanionRow {
   return {
      name: "",
      passport: "",
      role: "",
   };
}

export function stripKerungIdentifying(
   values: KerungValues,
   rows: CompanionRow[],
): { values: KerungValues; rows: CompanionRow[] } {
   return {
      values: {
         minor: values.minor,
         name: values.name,
         passport: "",
         wechatOrPhone: values.wechatOrPhone,
         location: values.location,
         nepalContact: values.nepalContact,
         medical: values.medical,
         proxy: values.proxy,
         proxyName: values.proxyName,
      },
      rows: rows.map((row) => ({
         name: row.name,
         passport: "",
         role: row.role,
      })),
   };
}

export function stripTrekIdentifying(values: TrekValues, rows: MemberRow[]): { values: TrekValues; rows: MemberRow[] } {
   return {
      values: {
         agency: values.agency,
         route: values.route,
         lastContactWhen: values.lastContactWhen,
         lastContactHow: values.lastContactHow,
      },
      rows: rows.map((row) => ({
         name: row.name,
         idNumber: "",
         nationality: row.nationality,
      })),
   };
}

export function emptyMember(): MemberRow {
   return {
      name: "",
      idNumber: "",
      nationality: "",
   };
}

export function emptyFindValues(): FindValues {
   return {
      missingName: "",
      age: "",
      lastSeen: "",
      appearance: "",
      reporterName: "",
      reporterPhone: "",
      relation: "",
      alreadyReported: "no",
      reportReference: "",
   };
}

export function emptyConsularValues(): ConsularValues {
   return {
      yourName: "",
      country: "",
      missingName: "",
      lastKnownPlace: "",
      reachYou: "",
   };
}

export function emptySafeValues(): SafeValues {
   return {
      name: "",
      location: "",
      familyPhone: "",
      line: "",
   };
}

function isCompanionRow(value: unknown): value is CompanionRow {
   if (isStringRecord(value) === false) {
      return false;
   }
   return "name" in value && "passport" in value && "role" in value;
}

function isMemberRow(value: unknown): value is MemberRow {
   if (isStringRecord(value) === false) {
      return false;
   }
   return "name" in value && "idNumber" in value && "nationality" in value;
}

function isKerungValues(value: unknown): value is KerungValues {
   if (isStringRecord(value) === false) {
      return false;
   }
   return (
      "minor" in value &&
      "name" in value &&
      "passport" in value &&
      "wechatOrPhone" in value &&
      "location" in value &&
      "nepalContact" in value &&
      "medical" in value &&
      "proxy" in value &&
      "proxyName" in value
   );
}

function isTrekValues(value: unknown): value is TrekValues {
   if (isStringRecord(value) === false) {
      return false;
   }
   return (
      "agency" in value &&
      "route" in value &&
      "lastContactWhen" in value &&
      "lastContactHow" in value
   );
}

function isDraftEnvelope(value: unknown): value is Record<string, unknown> {
   if (value === null || typeof value !== "object") {
      return false;
   }
   const record = value as Record<string, unknown>;
   if (typeof record.updatedAt !== "string") {
      return false;
   }
   if (!Array.isArray(record.rows)) {
      return false;
   }
   return true;
}

export function isKerungDraft(value: unknown): value is FormDraft<KerungValues, CompanionRow> {
   if (isDraftEnvelope(value) === false) {
      return false;
   }
   if (isKerungValues(value.values) === false) {
      return false;
   }
   return value.rows.every(isCompanionRow);
}

export function isTrekDraft(value: unknown): value is FormDraft<TrekValues, MemberRow> {
   if (isDraftEnvelope(value) === false) {
      return false;
   }
   if (isTrekValues(value.values) === false) {
      return false;
   }
   return value.rows.every(isMemberRow);
}

export function isFindDraft(value: unknown): value is FormDraft<FindValues, never> {
   if (isDraftEnvelope(value) === false) {
      return false;
   }
   return isFindValues(value.values) === true && value.rows.length === 0;
}

export function isConsularDraft(value: unknown): value is FormDraft<ConsularValues, never> {
   if (isDraftEnvelope(value) === false) {
      return false;
   }
   return isConsularValues(value.values) === true && value.rows.length === 0;
}

export function isSafeDraft(value: unknown): value is FormDraft<SafeValues, never> {
   if (isDraftEnvelope(value) === false) {
      return false;
   }
   return isSafeValues(value.values) === true && value.rows.length === 0;
}

function isFindValues(value: unknown): value is FindValues {
   if (isStringRecord(value) === false) {
      return false;
   }
   return (
      "missingName" in value &&
      "age" in value &&
      "lastSeen" in value &&
      "appearance" in value &&
      "reporterName" in value &&
      "reporterPhone" in value &&
      "relation" in value &&
      "alreadyReported" in value &&
      "reportReference" in value
   );
}

function isConsularValues(value: unknown): value is ConsularValues {
   if (isStringRecord(value) === false) {
      return false;
   }
   return (
      "yourName" in value &&
      "country" in value &&
      "missingName" in value &&
      "lastKnownPlace" in value &&
      "reachYou" in value
   );
}

function isSafeValues(value: unknown): value is SafeValues {
   if (isStringRecord(value) === false) {
      return false;
   }
   return "name" in value && "location" in value && "familyPhone" in value && "line" in value;
}
