export async function copyText(text: string): Promise<"copied" | "fallback"> {
   if (typeof navigator !== "undefined" && navigator.clipboard !== undefined && navigator.clipboard.writeText !== undefined) {
      try {
         await navigator.clipboard.writeText(text);
         return "copied";
      } catch {
         // Clipboard API often throws in WeChat, HTTP, or without permission.
      }
   }
   if (copyWithExecCommand(text) === true) {
      return "copied";
   }
   return "fallback";
}

function copyWithExecCommand(text: string): boolean {
   if (typeof document === "undefined") {
      return false;
   }
   const area = document.createElement("textarea");
   area.value = text;
   area.setAttribute("readonly", "");
   area.style.position = "fixed";
   area.style.left = "-9999px";
   document.body.append(area);
   area.select();
   let ok = false;
   try {
      ok = document.execCommand("copy");
   } catch {
      ok = false;
   }
   area.remove();
   return ok;
}

export function selectElementText(element: HTMLElement): void {
   const selection = window.getSelection();
   if (selection === null) {
      return;
   }
   const range = document.createRange();
   range.selectNodeContents(element);
   selection.removeAllRanges();
   selection.addRange(range);
}
