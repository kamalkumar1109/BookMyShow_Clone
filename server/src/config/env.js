/**
 * Central place for environment-backed config.
 * In production, set JWT_SECRET and MONGODB_URI (and Stripe keys) in the host env or .env (not committed).
 */
const jwtSecret =
  process.env.JWT_SECRET || "dev-only-insecure-jwt-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn(
    "[config] WARNING: JWT_SECRET is not set. Set a strong secret in production.",
  );
}

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/book-my-show";

module.exports = {
  jwtSecret,
  mongoUri,
};
