export interface AdminCredentials {
  username: string
  passwordHash: string
}

const CREDENTIALS_KEY = "ye-dood-admin-auth"
const SESSION_KEY = "ye-dood-admin-session"
const ATTEMPTS_KEY = "ye-dood-admin-login-attempts"
const LOCKOUT_MS = 60_000
const MAX_ATTEMPTS = 5

function hash(value: string): string {
  let result = 0

  for (let index = 0; index < value.length; index++) {
    result = (result << 5) - result + value.charCodeAt(index)
    result |= 0
  }

  return String(result)
}

const defaultCredentials: AdminCredentials = {
  username: "admin",
  passwordHash: hash("admin123"),
}

export function getCredentials(): AdminCredentials {
  if (typeof window === "undefined") {
    return defaultCredentials
  }

  const saved = localStorage.getItem(CREDENTIALS_KEY)

  if (!saved) {
    return defaultCredentials
  }

  try {
    const parsed = JSON.parse(saved)

    if (parsed && typeof parsed.username === "string") {
      return {
        username: parsed.username,
        passwordHash:
          typeof parsed.passwordHash === "string"
            ? parsed.passwordHash
            : defaultCredentials.passwordHash,
      }
    }

    return defaultCredentials
  } catch {
    return defaultCredentials
  }
}

export function saveCredentials(credentials: AdminCredentials) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
}

export function login(username: string, password: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || "0")
  const lockedUntil = Number(
    localStorage.getItem(`${ATTEMPTS_KEY}-until`) || "0",
  )

  if (lockedUntil > Date.now()) {
    return false
  }

  const credentials = getCredentials()
  const ok =
    username.trim() === credentials.username &&
    hash(password) === credentials.passwordHash

  if (ok) {
    localStorage.setItem(SESSION_KEY, "1")
    localStorage.removeItem(ATTEMPTS_KEY)
    localStorage.removeItem(`${ATTEMPTS_KEY}-until`)
  } else {
    const nextAttempts = attempts + 1
    localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts))

    if (nextAttempts >= MAX_ATTEMPTS) {
      localStorage.setItem(
        `${ATTEMPTS_KEY}-until`,
        String(Date.now() + LOCKOUT_MS),
      )
    }
  }

  return ok
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return localStorage.getItem(SESSION_KEY) === "1"
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
): { ok: boolean; error?: string } {
  const credentials = getCredentials()

  if (hash(currentPassword) !== credentials.passwordHash) {
    return { ok: false, error: "رمز عبور فعلی اشتباه است." }
  }

  if (!newPassword || newPassword.length < 4) {
    return {
      ok: false,
      error: "رمز عبور جدید باید حداقل ۴ کاراکتر باشد.",
    }
  }

  saveCredentials({
    username: credentials.username,
    passwordHash: hash(newPassword),
  })

  return { ok: true }
}
