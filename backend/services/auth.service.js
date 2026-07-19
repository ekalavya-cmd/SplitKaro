"use strict";

const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateAccessToken, generateRefreshToken } = require("./token.service");
const logger = require("../config/logger.config");

// Cost factor of 12 rather than the bcrypt default of 10.
// At 12, a single hash takes ~300–400 ms on modern hardware, which is
// imperceptible to a real user logging in but makes offline brute-force
// attacks ~4× more expensive than at 10. Appropriate for a project of
// this scale without requiring dedicated auth infrastructure.
const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────

/**
 * Returns a plain object representation of a User Sequelize instance with
 * all sensitive fields stripped. Centralised here so neither registerUser
 * nor loginUser duplicates the exclusion logic.
 *
 * @param {object} userInstance - Sequelize User model instance
 * @returns {object} safe user object
 */
function sanitizeUser(userInstance) {
  const { passwordHash, ...safe } = userInstance.get({ plain: true });
  return safe;
}

// ─────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Registers a new user with email + password credentials.
 *
 * Auto-issues access + refresh tokens on success (auto-login after
 * registration) — standard UX: the user shouldn't have to log in
 * immediately after creating their account.
 *
 * @param {{ name: string, email: string, password: string }} userData
 * @param {string} deviceInfo - passed through to refresh token for audit
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {{ status: number, message: string }}
 */
async function registerUser({ name, email, password }, deviceInfo = "unknown") {
  // Check for duplicate email before doing any hashing work
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw { status: 409, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    // googleId is left null — model validation requires at least one of
    // passwordHash/googleId to be non-null, which passwordHash satisfies here
    googleId: null,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, deviceInfo);

  // Log email so registrations are auditable; never log the password or hash
  logger.info(`New user registered: email=${email}, userId=${user.id}`);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates a user with email + password credentials.
 *
 * The "user not found" and "wrong password" cases intentionally return the
 * same generic message ("Invalid email or password.") to avoid leaking
 * which email addresses are registered in the system — a standard security
 * practice against user-enumeration attacks.
 *
 * @param {{ email: string, password: string }} credentials
 * @param {string} deviceInfo - passed through to refresh token for audit
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {{ status: number, message: string }}
 */
async function loginUser({ email, password }, deviceInfo = "unknown") {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Deliberate: same message as wrong-password to prevent email enumeration
    throw { status: 401, message: "Invalid email or password." };
  }

  if (!user.passwordHash) {
    // This account was created via Google OAuth — it has no password to compare
    // against. A specific message is acceptable here because it doesn't reveal
    // anything about whether a password was close to correct; it only explains
    // which auth method applies to this account.
    throw {
      status: 401,
      message: "This account uses Google Sign-In. Please log in with Google.",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Same generic message as the not-found case — intentional (see above)
    throw { status: 401, message: "Invalid email or password." };
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, deviceInfo);

  // Log email so logins are auditable; never log the password
  logger.info(`User logged in: email=${email}, userId=${user.id}`);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

module.exports = {
  registerUser,
  loginUser,
};
