import * as timeago from "timeago.js";
import ar from "timeago.js/lib/lang/ar";
import de from "timeago.js/lib/lang/de";
import es from "timeago.js/lib/lang/es";
import fa from "timeago.js/lib/lang/fa";
import fr from "timeago.js/lib/lang/fr";
import hi from "timeago.js/lib/lang/hi_IN";
import it from "timeago.js/lib/lang/it";
import ja from "timeago.js/lib/lang/ja";
import ko from "timeago.js/lib/lang/ko";
import nl from "timeago.js/lib/lang/nl";
import pl from "timeago.js/lib/lang/pl";
import pt from "timeago.js/lib/lang/pt_BR";
import ru from "timeago.js/lib/lang/ru";
import tr from "timeago.js/lib/lang/tr";
import vi from "timeago.js/lib/lang/vi";
import zh from "timeago.js/lib/lang/zh_CN";

interface Languages {
  [key: string]: any;
}

const languages = {
  fr,
  es,
  ar,
  de,
  fa,
  hi,
  it,
  ja,
  ko,
  nl,
  pl,
  pt,
  ru,
  tr,
  vi,
  zh,
};

export const registerTimeago = (language: keyof Languages) => {
  // @ts-ignore
  timeago.register(language, languages[language]);
};
