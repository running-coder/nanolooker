const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DNS,
});

module.exports = {
  Sentry,
};
