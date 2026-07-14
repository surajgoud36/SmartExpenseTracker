import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Key by userId when authenticated, IP otherwise.
// Two people behind the same office/campus NAT shouldn't share a bucket.
// ipKeyGenerator normalizes IPv6 to a subnet so users can't rotate addresses to bypass limits.
const keyByUser = (req) => req.userId || ipKeyGenerator(req.ip);

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,               // plenty for normal dashboard use
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, slow down a little." },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,                // 30 chat messages/hour/user
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: keyByUser,
  message: {
    message: "You've hit the hourly chat limit. Try again in a bit.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,                // 10 login/register attempts per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  message: {
    message: "Too many attempts. Please wait 15 minutes and try again.",
  },
});