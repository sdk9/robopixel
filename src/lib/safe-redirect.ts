export function safeInternalRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return undefined;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.includes("\\") || decoded.startsWith("//")) return undefined;
    const resolved = new URL(value, "https://robotcodehub.com");
    return resolved.origin === "https://robotcodehub.com"
      ? `${resolved.pathname}${resolved.search}${resolved.hash}`
      : undefined;
  } catch {
    return undefined;
  }
}
