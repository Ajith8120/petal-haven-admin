// Set VITE_API_BASE_URL for deployments where the API is hosted separately.
// In local development, use the hostname that served the app so phones on the
// same Wi-Fi reach the computer running the backend instead of their own localhost.
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const apiOrigin = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '')
  : `${window.location.protocol}//${window.location.hostname}:5000`

export const apiUrl = (path) => `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
export const apiAssetUrl = (path) => (
  path.startsWith('http') ? path : apiUrl(path)
)
