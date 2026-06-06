import { API_CONFIG, buildApiUrl } from "../config/api"

export type UserProfile = {
  id: number
  name: string
  email: string
}

export type ApiResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      message: string
    }

type LoginPayload = {
  id?: number
  name?: string
  email?: string
  error?: string
}

type RegisterPayload = {
  id?: number
  error?: string
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function getErrorMessage(
  response: Response,
  payload: { error?: string } | null,
  fallback: string,
): string {
  if (payload?.error && payload.error.trim()) {
    return payload.error
  }

  if (response.status >= 500) {
    return "Server error. Please try again later."
  }

  return fallback
}

export async function loginUser(
  username: string,
  password: string,
): Promise<ApiResult<UserProfile>> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, API_CONFIG.timeoutMs)

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.endpoints.login), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    })

    const payload = await parseJsonResponse<LoginPayload>(response)

    if (!response.ok) {
      return {
        ok: false,
        message: getErrorMessage(response, payload, "Unable to login."),
      }
    }

    // Backend can currently return {} on invalid password; treat missing id as auth failure.
    if (
      payload == null ||
      typeof payload.id !== "number" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return {
        ok: false,
        message: "Invalid username or password.",
      }
    }

    return {
      ok: true,
      data: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
      },
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message: "Request timed out. Please try again.",
      }
    }

    return {
      ok: false,
      message: "Network error. Please check your connection.",
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function registerUser(
  username: string,
  password: string,
  email: string,
): Promise<ApiResult<{ id: number }>> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, API_CONFIG.timeoutMs)

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.endpoints.register), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        id: -1,
        name: username,
        email,
        password,
      }),
      signal: controller.signal,
    })

    const payload = await parseJsonResponse<RegisterPayload>(response)

    if (!response.ok) {
      return {
        ok: false,
        message: getErrorMessage(response, payload, "Unable to register."),
      }
    }

    if (payload?.error) {
      return {
        ok: false,
        message: payload.error,
      }
    }

    if (payload == null || typeof payload.id !== "number") {
      return {
        ok: false,
        message: "Registration response is missing the user id.",
      }
    }

    return {
      ok: true,
      data: { id: payload.id },
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message: "Request timed out. Please try again.",
      }
    }

    return {
      ok: false,
      message: "Network error. Please check your connection.",
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
