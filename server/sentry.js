const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === "development") {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    } else {
      console.error(hint.originalException || hint.syntheticException);
    }
    return event;
  },
});

module.exports = {
  Sentry,
};
