import { createHmac, timingSafeEqual } from "node:crypto"
import type { Request, Response, NextFunction } from "express"

import { config, isProduction } from "./config.js"
import { pool } from "./db.js"

export const SESSION_COOKIE = "ye_dood_admin"

interface SessionPayload {
  adminId: string
  username: string
  expiresAt: number
  sessionVersion: number
}

function sign(value: string) {
  return createHmac("sha256", config.SESSION_SECRET).update(value).digest("base64url")
}

export function createSession(adminId: string, username: string, sessionVersion: number) {
  const expiresAt = Date.now() + config.ADMIN_SESSION_HOURS * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ adminId, username, expiresAt, sessionVersion } satisfies SessionPayload))
    .toString("base64url")
  return `${payload}.${sign(payload)}`
}

function readSession(value: string | undefined): SessionPayload | null {
  if (!value) return null
  const [payload, signature, extra] = value.split(".")
  if (!payload || !signature || extra) return null

  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (
      typeof parsed !== "object" || parsed === null ||
      !("adminId" in parsed) || typeof parsed.adminId !== "string" ||
      !("username" in parsed) || typeof parsed.username !== "string" ||
      !("expiresAt" in parsed) || typeof parsed.expiresAt !== "number" ||
      !("sessionVersion" in parsed) || typeof parsed.sessionVersion !== "number" ||
      parsed.expiresAt <= Date.now()
    ) return null
    return parsed as SessionPayload
  } catch {
    return null
  }
}

export function setSessionCookie(response: Response, token: string) {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: config.ADMIN_SESSION_HOURS * 60 * 60 * 1000,
    path: "/api",
  })
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api",
  })
}

export interface AuthenticatedRequest extends Request {
  admin?: SessionPayload
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const session = readSession(request.cookies?.[SESSION_COOKIE])
    if (!session) {
      response.status(401).json({ error: { code: "UNAUTHORIZED", message: "ابتدا وارد پنل مدیریت شوید." } })
      return
    }
    const result = await pool.query(
      "SELECT session_version FROM admin_users WHERE id = $1 AND username = $2",
      [session.adminId, session.username],
    )
    if (result.rowCount !== 1 || result.rows[0].session_version !== session.sessionVersion) {
      clearSessionCookie(response)
      response.status(401).json({ error: { code: "SESSION_EXPIRED", message: "نشست مدیریت معتبر نیست؛ دوباره وارد شوید." } })
      return
    }
    request.admin = session
    next()
  } catch (error) {
    next(error)
  }
}
