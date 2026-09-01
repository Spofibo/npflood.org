# Contributing

This site has to work on a bad radio: WeChat, a shared wet phone, JavaScript late or off. Prefer a small first download over a neat architecture.

## Before you change copy or contacts

- Do not invent phone numbers, WeChat IDs, donation accounts, or official names.
- Write real contacts only in `src/config/destinations.ts`, and only when confirmed.
- UI strings live in `src/locales/{ne,en,zh}/`. Same keys in all three files. `t()` throws if a key is missing. There is no English fallback.
- Assembled paper and SMS text must stay trilingual.

## Before you change routes

- Nepali stays at `/`, `/status/`, `/kerung/`, and the other unprefixed paths.
- English is `/en/…`. Chinese is `/zh/…`.
- Do not add a `/ne/` prefix. That would bounce the QR target.

## How to send a change

1. Open an issue if the change is more than a small fix.
2. Keep the diff small and in the existing style.
3. Run `npm run build`.
4. Open a pull request with what you verified.

Do not deploy from a pull request unless a maintainer asks.
