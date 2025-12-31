import { DomainInterface } from "../interfaces/Domain"

/**
 * Robust Base64 decoder that doesn't rely on Node.js Buffer or browser atob.
 * Safe for Hermes/React Native environments.
 */
const base64Decode = (input: string): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  let str = input.replace(/=+$/, "")
  let output = ""

  if (str.length % 4 === 1) return input // Not valid base64

  for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++));) {
    buffer = chars.indexOf(buffer)
    if (buffer === -1) return input // Contains invalid characters

    bs = bc % 4 ? bs * 64 + buffer : buffer
    if (bc++ % 4) {
      output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
    }
  }

  return output
}

const decoded = (tenant: DomainInterface) => {
  if (!tenant.domain) return ""

  try {
    // Attempt decoding using our local helper
    const decodedValue = base64Decode(tenant.domain)

    // Verify if it's printable ASCII (to avoid returning binary junk if it wasn't base64)
    if (/^[\x20-\x7E]*$/.test(decodedValue) && decodedValue.length > 0) {
      return decodedValue
    }
  } catch (e) {
    // Ignore error and return original
  }

  return tenant.domain
}

export default decoded
