export const normalizeClientRedirect = (
  redirectUrl: string | null | undefined,
  fallback = '/',
) => {
  if (!redirectUrl) return fallback
  if (typeof window === 'undefined') return fallback
  try {
    const url = new URL(redirectUrl, window.location.origin)
    if (url.origin !== window.location.origin) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
