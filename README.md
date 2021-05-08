# BananoLooker

## What is Banano ?

BANANO was forked in April 2018 from NANO. BANANO offers instant,
feeless and rich in potassium 🍌 transactions, thanks to the fact that
BANANO developers (several of them having being involved in NANO
itself) have kept big portions of the original code unchanged to keep
cross-chain compatibility between existing code libraries. However,
they have fined-tuned some parameters, such as Proof of Work
requirements and currency units. While the focus for now is on having
an ongoing free and fair distribution, BANANO is also experimenting
with feature additions such as a privacy layer (Camo BANANO), on-chain
messaging (MonkeyTalks) and more. In context of distribution, we aim
to use our meanwhile ready-to-strike infrastructure with easy-to-use
mobile wallets (Kalium) and tipbots on several major social media
platforms to onboard normies and crypto-noobs who have no idea yet
what a cryptocurrency is. We also might do IRL airdrops at some point.
Of note, key here is to make the start with crypto as easy as
possible, use a fun attitude and gamification to get new users started
without all the usual hassle, and then educate them to handle crypto
in general in a responsible way.

## Install

Copy the `.env` variables.

```bash
cp .env.template .env
```

```env
# NodeJS server port, default 3010
SERVER_PORT=
# Banano node RPC domain with port, default http://0.0.0.0:7072
RPC_DOMAIN=
# Used to get the ledger size given the nano node installation folder, default /nano/Nano
NODE_FOLDER=
# Error logging (optional)
SENTRY_DNS=
# Translations (optional)
GOOGLE_APPLICATION_CREDENTIALS=
```

- `npm install` - Install dependencies
- `npm start` - Start the Webserver
- `npm run start:server` - On another tab, start the NodeJS server

## Languages

The language set in the Browser determines the language that BananoLooker will load and default to `en` if it's not in the supported list. Since most languages were generated using Google Translation API, some translations may be inaccurate.

Many of the most common languages are supported.

- English (en)
- Français (fr)
- Español (es)
- العربية (ar)
- Deutsch (de)
- فارسی (fa)
- हिन्दी (hi)
- Italiano (it)
- 日本語 (ja)
- 한국어 (ko)
- Nederlands (nl)
- Język polski (pl)
- Português (pt)
- Pусский (ru)
- Türkçe (tr)
- Tiếng Việt (vi)
- 中文 (zh)

### Contribution

If you think some strings should be corrected open a PR with the corrections on the [language file](https://github.com/running-coder/nanolooker/tree/bananolooker/src/i18n/locales).

### Adding a new language or missing language keys

- Setup a Google translate API key at https://cloud.google.com/translate
- Add a file named `translate.json` at the root (same level as `package.json`) with your API credentials from Google
- Link that file using its path inside the `.env` under the key `GOOGLE_APPLICATION_CREDENTIALS=translate.json`
- run `npm run translate -- --language=LANGUAGE_CODE` where `LANGUAGE_CODE` is `ru`, `fr`, `es` or any new language supported by Google's API.
- run `npm run translate` to generate for all languages found in the `src/i18n/locale` from `en.json`

## Special thanks

### Donators

Thanks for financially contributing to BananoLooker hosting and development.
