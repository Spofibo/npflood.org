# npflood.org

Volunteer flood-response tools for the Bhote Koshi / Rasuwa / Kerung (Gyirong) situation.

Live site: [https://npflood.org/](https://npflood.org/). Worker: `npflood-org`. Source: [github.com/Spofibo/npflood.org](https://github.com/Spofibo/npflood.org).

Static Astro 7 on a Cloudflare Worker. No backend, no registry, and no inbox. People prepare a message here and give or send it themselves.

How a person uses the site is in `INFO.md`. How to change copy, routes, and contacts is in `CONTRIBUTING.md`. Security reports go through GitHub Security Advisories; see `SECURITY.md`.

## Languages

Nepali is the home page at `/`. English is `/en/`. Chinese is `/zh/`. Do not add a `/ne/` prefix. That would bounce the QR target.

Each page UI is one language. Assembled paper and SMS text stays trilingual.

UI strings live in `src/locales/{ne,en,zh}/` (`chrome`, `pages`, `form`, `paper`, and `fields/*`). Same keys in all three locales. `t()` throws if a key is missing. There is no English fallback.

## Pages

- Status and phones (`/status/`): Police 100, fire 101, ambulance 102, Bipad Helpline 1234, National Emergency Operation Centre 1149. Consulate, TAAN, and district flood lines stay empty until confirmed.
- I am safe (`/safe/`)
- Looking for someone in Nepal (`/find/`): prepares a note, and links to official lists and the government DNA pathway that this site does not operate
- Kerung / Gyirong message (`/kerung/`)
- Trek party message (`/trek/`)
- Family search from abroad (`/consular/`)
- Help (`/help/`): official donation links. Volunteer coordinators stay empty until confirmed.

Kerung and Trek are live message tools. They are not a registration. They do not name a Consulate or TAAN inbox until `src/config/destinations.ts` has a confirmed contact.

Page-specific extra numbers (Child Helpline 1098, Missing Child Response 104, Tourist Police 1144, the published Nepal Police DNA helpline) belong only on the pages that need them. Do not invent numbers, WeChat IDs, or donation accounts.

## Confirmed facts

Write confirmed values only. Do not invent placeholders.

- Destinations: `src/config/destinations.ts`
- Donation URLs: `src/config/donations.ts`
- Official find lists and DNA mailbox: `src/config/official-lists.ts`
- Operator mailbox: `src/config/site.ts` (`contact@npflood.org`, inbound for officials and organisations)

Identifying draft answers stay in the browser and expire after 6 hours. The Latin note stays 30 days. Passport numbers and trek ID numbers are not saved.

## Commands

Node 22.12 or newer.

```
npm install
npm run dev
npm run build
```

`npm run deploy` builds and runs `wrangler deploy`. Do not deploy from a pull request unless a maintainer asks.

IndexNow submissions run during `astro build` only if `INDEXNOW_KEY` is set. The verification file is `public/7c3e9a1b5d8f2e4a6c0b9d1f3a5e7c8b.txt`.

Workers Observability is on in `wrangler.jsonc`: logs, invocation logs, and traces at 100% sample. That applies after the next deploy.

## License

MIT. See `LICENSE`.
