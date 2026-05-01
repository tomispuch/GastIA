// Validation utilities — no external dependencies

// Fecha local del dispositivo en formato AAAA-MM-DD (evita el bug de UTC con toISOString)
export function localDateStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

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
