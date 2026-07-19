"use strict";

const authService = require("../services/auth.service");
const tokenService = require("../services/token.service");
const logger = require("../config/logger.config");

// Cookie configuration shared by all endpoints that set/clear the refresh token
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    // secure should be true in production so the cookie is only sent over HTTPS.
    // In local development over http://localhost, secure: false is required or
    // the browser will silently drop the cookie. IMPORTANT: ensure NODE_ENV is
    // set to "production" in the actual deployment environment.
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SEVEN_DAYS_MS,
  };
}

// ─── input validators ────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterInput({ name, email, password }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Name is required.";
  }
  if (name.trim().length > 100) {
    return "Name must be 100 characters or fewer.";
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return "A valid email address is required.";
  }
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  // bcrypt silently truncates passwords longer than 72 bytes — we reject them
  // instead so the user is never surprised by a truncation they didn't know about.
  if (password.length > 72) {
    return "Password must be 72 characters or fewer.";
  }
  return null; // no error
}

function validateLoginInput({ email, password }) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return "Email is required.";
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    return "Password is required.";
  }
  return null;
}

// ─── error handler helper ────────────────────────────────────────────────────

function handleServiceError(err, res, context) {
  if (err && typeof err.status === "number" && typeof err.message === "string") {
    // Expected service error (validation / auth failure)
    return res.status(err.status).json({ message: err.message });
  }
  // Unexpected error — log full details server-side, never leak them to client
  logger.error(`${context}: unexpected error`, err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

// ─── controllers ─────────────────────────────────────────────────────────────

async function register(req, res) {
  const { name, email, password } = req.body;
  const deviceInfo = req.headers["user-agent"] || "unknown";

  const validationError = validateRegisterInput({ name, email, password });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      { name: name.trim(), email: email.trim().toLowerCase(), password },
      deviceInfo
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    return res.status(201).json({ message: "Registration successful.", user, accessToken });
  } catch (err) {
    return handleServiceError(err, res, "register");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const deviceInfo = req.headers["user-agent"] || "unknown";

  const validationError = validateLoginInput({ email, password });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      { email: email.trim().toLowerCase(), password },
      deviceInfo
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    return res.status(200).json({ message: "Login successful.", user, accessToken });
  } catch (err) {
    return handleServiceError(err, res, "login");
  }
}

async function refresh(req, res) {
  const composite = req.cookies?.refreshToken;

  if (!composite) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  // The composite cookie value is "{userId}.{tokenId}.{rawToken}".
  // We split off the userId prefix (first segment), then pass the remainder
  // "{tokenId}.{rawToken}" to verifyRefreshToken as its two-part clientToken.
  const firstDot = composite.indexOf(".");
  if (firstDot === -1) {
    res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Invalid or expired refresh token. Please log in again." });
  }

  const userId = parseInt(composite.substring(0, firstDot), 10);
  const tokenPart = composite.substring(firstDot + 1); // "{tokenId}.{rawToken}"

  if (!userId || isNaN(userId)) {
    res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Invalid or expired refresh token. Please log in again." });
  }

  try {
    const deviceInfo = req.headers["user-agent"] || "unknown";
    const result = await tokenService.verifyRefreshToken(userId, tokenPart);

    if (!result) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Invalid or expired refresh token. Please log in again." });
    }

    // Issue brand-new token pair (the old refresh token was already deleted by verifyRefreshToken)
    const newAccessToken = tokenService.generateAccessToken(userId);
    const newRefreshToken = await tokenService.generateRefreshToken(userId, deviceInfo);

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return handleServiceError(err, res, "refresh");
  }
}

async function logout(req, res) {
  // req.userId is set by the authenticate middleware applied at the route level
  const userId = req.userId;
  const composite = req.cookies?.refreshToken;

  // Explicitly revoke just this session's refresh token from Redis rather than
  // only clearing the cookie. Clearing the cookie alone would let the token
  // remain valid in Redis until its natural 7-day TTL — an attacker who
  // copied the cookie value could still use it. Explicit revocation closes
  // that window immediately.
  if (composite) {
    const firstDot = composite.indexOf(".");
    if (firstDot !== -1) {
      const tokenPart = composite.substring(firstDot + 1);
      // verifyRefreshToken deletes the key on both match AND mismatch (aggressive
      // invalidation policy), so this effectively revokes the token regardless.
      await tokenService.verifyRefreshToken(userId, tokenPart).catch(() => {
        // Swallow errors here — we're logging out anyway; a Redis hiccup shouldn't
        // prevent the cookie from being cleared and the 200 from being sent.
      });
    }
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully." });
}

async function logoutAllDevices(req, res) {
  const userId = req.userId;

  try {
    await tokenService.revokeAllUserTokens(userId);
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out from all devices." });
  } catch (err) {
    return handleServiceError(err, res, "logoutAllDevices");
  }
}

module.exports = { register, login, refresh, logout, logoutAllDevices };
