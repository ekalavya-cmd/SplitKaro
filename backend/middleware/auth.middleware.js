"use strict";

const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../services/token.service");
const logger = require("../config/logger.config");

/**
 * Express middleware that verifies a Bearer access token from the
 * Authorization header and attaches req.userId to the request.
 *
 * We intentionally do NOT query the database here to confirm the user
 * still exists. For a 15-minute-lived access token this is a reasonable
 * tradeoff: the window in which a deleted/disabled account could still
 * make requests is bounded by the token TTL. Database-backed revocation
 * on every request would add a round-trip to every single authenticated
 * endpoint — a significant latency and load cost that isn't justified at
 * this project's scale. If instant revocation becomes a requirement, add
 * a Redis blocklist check here (not a DB query).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.debug(
      `authenticate: missing or malformed Authorization header — ${req.method} ${req.path}`
    );
    return res.status(401).json({ message: "Access token required" });
  }

  const token = authHeader.slice(7); // everything after "Bearer "

  try {
    const decoded = verifyAccessToken(token);
    // decoded.sub is the integer userId set in generateAccessToken
    req.userId = decoded.sub;
    next();
  } catch (err) {
    // jwt.TokenExpiredError signals an otherwise-valid token that has simply
    // expired — the frontend should silently attempt a refresh rather than
    // forcing a full re-login. All other errors (bad signature, malformed
    // token, wrong secret) are hard failures that require re-authentication.
    if (err.name === "TokenExpiredError") {
      logger.warn(
        `authenticate: access token expired — ${req.method} ${req.path}`
      );
      return res.status(401).json({ message: "Access token expired" });
    }

    logger.warn(
      `authenticate: invalid access token (${err.name}) — ${req.method} ${req.path}`
    );
    return res.status(401).json({ message: "Invalid access token" });
  }
}

module.exports = { authenticate };
