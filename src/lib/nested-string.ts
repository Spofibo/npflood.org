export function readNestedString(root: unknown, key: string): string {
   const parts = key.split(".");
   let node: unknown = root;
   for (const part of parts) {
      if (node === null || typeof node !== "object" || Array.isArray(node) || !(part in node)) {
         throw new Error(`missing translation key ${key}`);
      }
      node = (node as Record<string, unknown>)[part];
   }
   if (typeof node !== "string") {
      throw new Error(`translation key ${key} is not a string`);
   }
   return node;
}

export function collectKeys(value: unknown, prefix: string, keys: string[]): void {
   if (value === null || typeof value !== "object") {
      if (prefix.length > 0) {
         keys.push(prefix);
      }
      return;
   }
   if (Array.isArray(value)) {
      value.forEach((item, index) => {
         collectKeys(item, `${prefix}[${index}]`, keys);
      });
      return;
   }
   const entries = Object.entries(value);
   if (entries.length === 0 && prefix.length > 0) {
      keys.push(prefix);
      return;
   }
   for (const [key, child] of entries) {
      const next = prefix.length === 0 ? key : `${prefix}.${key}`;
      collectKeys(child, next, keys);
   }
}
