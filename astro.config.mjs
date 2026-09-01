// @ts-check
import sitemap from "@astrojs/sitemap";
import indexNow from "astro-indexnow";
import { defineConfig } from "astro/config";

const indexNowKey = process.env.INDEXNOW_KEY;
const integrations = [
	sitemap({
		i18n: {
			defaultLocale: "ne",
			locales: {
				ne: "ne-NP",
				en: "en-US",
				zh: "zh-CN",
			},
		},
	}),
];

if (typeof indexNowKey === "string" && indexNowKey.length > 0) {
	integrations.push(
		indexNow({
			key: indexNowKey,
		}),
	);
}

export default defineConfig({
	site: "https://npflood.org",
	trailingSlash: "always",
	integrations,
	i18n: {
		locales: ["ne", "en", "zh"],
		defaultLocale: "ne",
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
