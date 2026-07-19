"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis.config");
const logger = require("../config/logger.config");

// Redis key prefix for refresh tokens
const REFRESH_TOKEN_PREFIX = "refresh_token";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ─────────────────────────────────────────────
// ACCESS TOKENS
// ─────────────────────────────────────────────

/**
 * Signs a short-lived JWT access token for the given userId (integer).
 * Payload: { sub: userId }
 * @param {number} userId
 * @returns {string} signed JWT
 */
function generateAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw { status: 500, message: "JWT_ACCESS_SECRET is not configured." };
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: "15m" });
}

/**
 * Verifies a JWT access token and returns the decoded payload.
 * Throws if the token is invalid or expired — the caller (auth middleware)
 * is responsible for handling the HTTP response shape.
 * @param {string} token
 * @returns {object} decoded JWT payload
 */
function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw { status: 500, message: "JWT_ACCESS_SECRET is not configured." };
  }
  // jwt.verify throws on invalid/expired tokens — let it propagate to caller
  return jwt.verify(token, secret);
}

// ─────────────────────────────────────────────
// REFRESH TOKENS (Redis-backed, rotating)
// ─────────────────────────────────────────────

/**
 * Generates a rotating refresh token, stores a SHA-256 hash of it in Redis,
 * and returns the composite client-facing token string ({userId}.{tokenId}.{rawToken}).
 *
 * The composite format embeds userId so the refresh endpoint can identify the
 * Redis key without a second cookie. The raw token is NEVER stored — only its
 * hash lives in Redis. Store the composite string in an httpOnly cookie.
 *
 * NOTE: This format was changed from {tokenId}.{rawToken} to
 * {userId}.{tokenId}.{rawToken} during step 5e to make the refresh controller
 * self-contained without requiring a separate userId cookie.
 *
 * @param {number} userId
 * @param {string} deviceInfo
 * @returns {Promise<string>} composite token: "{userId}.{tokenId}.{rawToken}"
 */
async function generateRefreshToken(userId, deviceInfo = "unknown") {
  const tokenId = crypto.randomUUID();
  const rawToken = crypto.randomBytes(40).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const redisKey = `${REFRESH_TOKEN_PREFIX}:${userId}:${tokenId}`;
  const payload = JSON.stringify({
    hashedToken,
    deviceInfo,
    createdAt: Date.now(),
  });

  await redisClient.set(redisKey, payload, { EX: REFRESH_TOKEN_TTL_SECONDS });

  logger.debug(`Refresh token issued for userId=${userId}, device="${deviceInfo}"`);

  // Composite format: userId lets the refresh endpoint find the right Redis
  // key; tokenId identifies the specific token; rawToken is what the client
  // proves they hold. The hash of rawToken is what lives in Redis.
  return `${userId}.${tokenId}.${rawToken}`;
}

/**
 * Verifies a client-supplied refresh token via constant-time hash comparison.
 * On success, rotates the token by deleting the Redis key (one-time use).
 * On hash mismatch, the key is also immediately deleted (aggressive invalidation)
 * — any mismatch is treated as evidence of token theft/reuse and forces re-login.
 *
 * Returns the tokenId string on success, or null if invalid/not found/mismatch.
 * Does NOT throw — invalid tokens are expected input, not exceptional errors.
 *
 * The caller (refresh controller) is responsible for splitting the three-part
 * composite cookie value ({userId}.{tokenId}.{rawToken}) and passing:
 *   - userId as the first argument (integer)
 *   - "{tokenId}.{rawToken}" as the second argument
 *
 * @param {number} userId
 * @param {string} clientToken - two-part composite "{tokenId}.{rawToken}"
 * @returns {Promise<string|null>} tokenId on success, null otherwise
 */
async function verifyRefreshToken(userId, clientToken) {
  // Split into tokenId and rawToken — if either part is missing, bail early
  const dotIndex = clientToken ? clientToken.indexOf(".") : -1;
  if (dotIndex === -1) {
    logger.warn(`verifyRefreshToken: malformed clientToken for userId=${userId}`);
    return null;
  }
  const tokenId = clientToken.substring(0, dotIndex);
  const rawToken = clientToken.substring(dotIndex + 1);

  if (!tokenId || !rawToken) {
    logger.warn(`verifyRefreshToken: empty tokenId or rawToken for userId=${userId}`);
    return null;
  }

  const redisKey = `${REFRESH_TOKEN_PREFIX}:${userId}:${tokenId}`;
  const stored = await redisClient.get(redisKey);

  if (!stored) {
    logger.warn(
      `verifyRefreshToken: key not found in Redis for userId=${userId}, tokenId=${tokenId} — token may be expired, already rotated, or invalid`
    );
    return null;
  }

  const { hashedToken } = JSON.parse(stored);

  // Hash the incoming raw token and compare via constant-time comparison
  // to prevent timing attacks that could leak token validity information
  const incomingHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const storedBuf = Buffer.from(hashedToken, "hex");
  const incomingBuf = Buffer.from(incomingHash, "hex");

  // timingSafeEqual requires equal-length buffers — mismatch length means
  // definitely different tokens (e.g., corrupted input), so bail without throwing
  if (storedBuf.length !== incomingBuf.length) {
    logger.warn(
      `verifyRefreshToken: hash length mismatch for userId=${userId}, tokenId=${tokenId}`
    );
    return null;
  }

  const isMatch = crypto.timingSafeEqual(storedBuf, incomingBuf);

  if (!isMatch) {
    // Hash mismatch — treat as evidence of token theft/reuse and immediately
    // invalidate the key (aggressive invalidation). Any mismatch forces re-login.
    await redisClient.del(redisKey);
    logger.warn(
      `verifyRefreshToken: hash mismatch for userId=${userId}, tokenId=${tokenId} — possible token reuse/theft attempt. Key deleted; re-authentication required.`
    );
    return null;
  }

  // Rotate: delete the key immediately so this token can never be used again
  await redisClient.del(redisKey);
  logger.debug(`Refresh token rotated for userId=${userId}, tokenId=${tokenId}`);

  return tokenId;
}

/**
 * Revokes all refresh tokens for a user (e.g., on logout or password change).
 * Uses SCAN-based iteration — never KEYS — because KEYS blocks the Redis event
 * loop and is unsafe in any production or multi-client environment.
 *
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function revokeAllUserTokens(userId) {
  const pattern = `${REFRESH_TOKEN_PREFIX}:${userId}:*`;
  const keysToDelete = [];

  // SCAN iterates in cursor-based batches; it is non-blocking unlike KEYS.
  // Each yielded item is an ARRAY of key strings (one batch), not a single key,
  // so we spread each batch into keysToDelete rather than pushing the array itself.
  for await (const batch of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keysToDelete.push(...batch);
  }

  if (keysToDelete.length > 0) {
    // node-redis v6 del() only reliably accepts a single key per call — use
    // Promise.all to issue all deletes in parallel rather than serially.
    await Promise.all(keysToDelete.map((key) => redisClient.del(key)));
  }

  logger.info(
    `revokeAllUserTokens: revoked ${keysToDelete.length} refresh token(s) for userId=${userId}`
  );
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeAllUserTokens,
};
