const env = import.meta.env

const protocol = (env.VITE_API_PROTOCOL ?? "https").trim()
const host = (env.VITE_API_HOST ?? "127.0.0.1").trim()
const port = (env.VITE_API_PORT ?? "").trim()
const timeoutMs = Number(env.VITE_API_TIMEOUT_MS ?? 10000)

function normalizeBasePath(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

const basePath = normalizeBasePath(env.VITE_API_BASE_PATH ?? "")

function buildBaseUrl(): string {
  const normalizedProtocol = protocol.endsWith(":")
    ? protocol.slice(0, -1)
    : protocol
  const hostWithOptionalPort = port ? `${host}:${port}` : host
  return `${normalizedProtocol}://${hostWithOptionalPort}${basePath}`
}

export const API_CONFIG = {
  protocol,
  host,
  port,
  basePath,
  timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 10000,
  baseUrl: buildBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  endpoints: {
    login: "/login",
    register: "/register",
  },
} as const

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_CONFIG.baseUrl}${normalizedPath}`
}
