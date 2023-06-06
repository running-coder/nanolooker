const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  beforeSend: (event, hint) => {
    if (process.env.NODE_ENV === "development") {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    }
    return event;
  },
});

process.on("uncaughtException", err => {
  console.log("Error", err);
  Sentry.captureException(err);
});

process.on("exit", code => {
  Sentry.captureException(new Error("Exiting with code"), { extra: { code } });
  process.exit(code);
});

process.on("unhandledRejection", (reason, promise) => {
  Sentry.captureException(new Error("Unhandled promise rejection"), {
    extra: { reason, promise },
  });
});

module.exports = {
  Sentry,
};
