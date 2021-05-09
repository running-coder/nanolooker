require("dotenv").config();
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const { join } = require("path");
const yargs = require("yargs");
const dot = require("dot-object");
const { Translate } = require("@google-cloud/translate").v2;
const omit = require("lodash/omit");

const BASE_LOCALE = "en";
const en = require(`../src/i18n/locales/${BASE_LOCALE}.json`);

const translate = new Translate();

const sourceToTranslate = dot.dot(en);
const locale = yargs.argv.language;
const localesFolder = join(__dirname, `..`, `/src/i18n/locales/`);

async function translateSource() {
  const localeFiles = await readdir(localesFolder);
  const locales = locale
    ? [locale]
    : localeFiles
        .map(file => {
          const [locale] =
            /[a-z]{2}\.json/.test(file) && !file.startsWith(BASE_LOCALE)
              ? file.split(".")
              : [];

          return locale;
        })
        .filter(Boolean);

  for (let y = 0; y < locales.length; y++) {
    const targetPath = join(localesFolder, `${locales[y]}.json`);

    const targetTranslations = fs.existsSync(targetPath)
      ? JSON.parse(fs.readFileSync(targetPath, "utf8"))
      : {};
    let targetToTranslate = {};
    let diffToTranslate = {};

    targetToTranslate = dot.dot(targetTranslations);
    diffToTranslate = omit(sourceToTranslate, Object.keys(targetToTranslate));

    // Nothing to translate comparing base to target
    if (!Object.keys(diffToTranslate)) continue;

    for (let i in diffToTranslate) {
      let [translations] = await translate.translate(
        diffToTranslate[i],
        locales[y],
      );
      translations = Array.isArray(translations)
        ? translations
        : [translations];
      console.log(`locale: ${locales[y]} Key: ${i}`);

      let translation = translations[0];
      if (/<d\s?>/.test(translation)) {
        // remove space with <0></0> Trans component
        translation
          .replace(/(<\d\s?>)\s?/g, "$1")
          .replace(/\s?<\/\s?(\d)>/g, "</$1>");
      }

      targetToTranslate[i] = translation;
    }

    fs.writeFileSync(
      targetPath,
      JSON.stringify(dot.object(targetToTranslate), null, 2),
    );
  }
}

translateSource();
