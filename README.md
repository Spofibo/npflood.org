# npflood.org

Volunteer flood-response tools for the Bhote Koshi / Rasuwa / Kerung (Gyirong) situation.

The site is static Astro 7. There is no backend, no registry, and no inbox. People prepare a message here and give or send it themselves. Destinations stay empty until a real contact is confirmed in `src/config/destinations.ts`. Do not invent Consulate, TAAN, or donation details.

Nepali is the real home page at `/`. English is `/en/`. Chinese is `/zh/`. Assembled paper and SMS text stays trilingual. The UI on each page is one language.

Host: Cloudflare Worker `npflood-org`. Source: [github.com/Spofibo/npflood.org](https://github.com/Spofibo/npflood.org).

## Commands

```
npm install
npm run dev
npm run build
```

Deploy only when asked. `npm run deploy` builds and runs `wrangler deploy`.

IndexNow submissions run during `astro build` only if `INDEXNOW_KEY` is set. The verification file is `public/7c3e9a1b5d8f2e4a6c0b9d1f3a5e7c8b.txt`.

## Tools

- Status and phones: Nepal Police 100, fire 101, ambulance 102
- I am safe
- Looking for someone in Nepal
- Kerung / Gyirong message
- Trek party message
- Family search from abroad
- Help (held until a confirmed donation or volunteer contact exists)

Kerung and Trek are live message tools. They are not a registration, and they are not HELD.

## License

MIT. See `LICENSE`.
