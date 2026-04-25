// Validation utilities — no external dependencies

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

export const isValidPassword = (pwd) => pwd.length >= 8

export const isValidMonto = (val) => {
  const n = Number(val)
  return !isNaN(n) && n > 0 && n <= 99_999_999
}

// Trim + hard cap on length to prevent oversized payloads
export const sanitizeText = (text, maxLen = 500) =>
  text.trim().slice(0, maxLen)

export const sanitizeName = (text) =>
  text.trim().slice(0, 100).replace(/[<>]/g, '')
