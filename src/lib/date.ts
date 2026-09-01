const BS_MONTH_DAYS: Record<number, readonly number[]> = {
   2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
   2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
   2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
   2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
};

const BS_MONTH_NAMES_NE = [
   "बैशाख",
   "जेठ",
   "असार",
   "श्रावण",
   "भाद्र",
   "आश्विन",
   "कार्तिक",
   "मंसिर",
   "पुष",
   "माघ",
   "फाल्गुन",
   "चैत्र",
] as const;

const BS_RANGE_START_UTC_MS = Date.UTC(2025, 3, 14);

type BsDate = {
	year: number;
	month: number;
	day: number;
};

const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function pad2(value: number): string {
   if (value < 10) {
      return `0${value}`;
   }
   return String(value);
}

export function formatVerifiedNpt(iso: string, months: readonly string[]): string {
   if (months.length !== 12) {
      throw new Error(`formatVerifiedNpt expected 12 month names, received ${months.length}`);
   }
   const ms = Date.parse(iso);
   if (Number.isNaN(ms) === true) {
      throw new Error(`formatVerifiedNpt received invalid time ${iso}`);
   }
   const npt = new Date(ms + NPT_OFFSET_MS);
   const month = months[npt.getUTCMonth()];
   if (month === undefined) {
      throw new Error(`invalid month index ${npt.getUTCMonth()}`);
   }
   return `${npt.getUTCDate()} ${month} ${npt.getUTCFullYear()}, ${pad2(npt.getUTCHours())}:${pad2(npt.getUTCMinutes())} NPT`;
}

function formatClock(date: Date): string {
	return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatGregorianPrepared(date: Date, months: readonly string[]): string {
   if (months.length !== 12) {
      throw new Error(`formatGregorianPrepared expected 12 month names, received ${months.length}`);
   }
   const month = months[date.getMonth()];
   if (month === undefined) {
      throw new Error(`invalid month index ${date.getMonth()}`);
   }
   return `${date.getDate()} ${month} ${date.getFullYear()}, ${formatClock(date)}`;
}

function gregorianToBs(date: Date): BsDate | null {
   const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
   if (utc < BS_RANGE_START_UTC_MS) {
      return null;
   }
   let remaining = Math.round((utc - BS_RANGE_START_UTC_MS) / 86400000);
   const years = [2082, 2083, 2084, 2085];
   for (const year of years) {
      const months = BS_MONTH_DAYS[year];
      if (months === undefined) {
         throw new Error(`BS month table missing year ${year}`);
      }
      for (let monthIndex = 0; monthIndex < months.length; monthIndex += 1) {
         const length = months[monthIndex];
         if (length === undefined) {
            throw new Error(`BS month table missing ${year}-${monthIndex + 1}`);
         }
         if (remaining < length) {
            return {
               year,
               month: monthIndex + 1,
               day: remaining + 1,
            };
         }
         remaining -= length;
      }
   }
   return null;
}

export function formatNepaliPrepared(date: Date, gregorianMonths: readonly string[]): string {
   const bs = gregorianToBs(date);
   if (bs === null) {
      return formatGregorianPrepared(date, gregorianMonths);
   }
   const monthName = BS_MONTH_NAMES_NE[bs.month - 1];
   if (monthName === undefined) {
      throw new Error(`BS month name missing for month ${bs.month}`);
   }
   return `${bs.day} ${monthName} ${bs.year}, ${formatClock(date)}`;
}
