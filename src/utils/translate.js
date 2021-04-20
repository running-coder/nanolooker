require("dotenv").config();
const fs = require("fs");
const { join } = require("path");
const yargs = require("yargs");
const dot = require("dot-object");
const { Translate } = require("@google-cloud/translate").v2;
const omit = require("lodash/omit");

const en = require("./locales/en.json");

const translate = new Translate();

const target = yargs.argv.language;
const targetPath = join(__dirname, `/locales/${target}.json`);
let sourceToTranslate = dot.dot(en);

let targetToTranslate = {};

if (fs.existsSync(targetPath)) {
  const targetTranslations = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  targetToTranslate = dot.dot(targetTranslations);

  sourceToTranslate = omit(sourceToTranslate, Object.keys(targetToTranslate));
}

async function translateSource() {
  for (let i in sourceToTranslate) {
    let [translations] = await translate.translate(
      sourceToTranslate[i],
      target,
    );
    translations = Array.isArray(translations) ? translations : [translations];
    console.log(`Key: ${i}`);

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

translateSource();
