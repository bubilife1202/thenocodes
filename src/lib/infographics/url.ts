const IMAGE_PATH_PATTERN = /\.(?:png|jpe?g|webp|gif|avif)$/i;

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase();
  const firstHextet = normalized.split(":")[0] ?? "";

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized.startsWith("::ffff:") ||
    firstHextet.startsWith("fc") ||
    firstHextet.startsWith("fd") ||
    firstHextet === "fe80" ||
    firstHextet === "fe90" ||
    firstHextet === "fea0" ||
    firstHextet === "feb0"
  );
}

function isBlockedHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    isPrivateIpv4(normalized) ||
    isPrivateIpv6(normalized)
  );
}

export function isSafeInfographicImageUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return false;
    if (isBlockedHost(url.hostname)) return false;
    if (!IMAGE_PATH_PATTERN.test(url.pathname)) return false;

    return true;
  } catch {
    return false;
  }
}
