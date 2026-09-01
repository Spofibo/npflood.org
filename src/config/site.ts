export const site = {
	hostname: "npflood.org",
	origin: "https://npflood.org",
	name: "npflood.org",
	ogImagePath: "/og.png",
	sourceRepo: "https://github.com/Spofibo/npflood.org",
};

export function absoluteUrl(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		throw new Error(`absoluteUrl expected a path, received ${path}`);
	}
	if (!path.startsWith("/")) {
		throw new Error(`absoluteUrl expected a leading slash, received ${path}`);
	}
	if (path === "/") {
		return `${site.origin}/`;
	}
	return `${site.origin}${path}`;
}
