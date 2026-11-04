const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function shortenUrl(url) {
  let res;
  try {
    res = await fetch(`/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data; // { code, shortUrl, originalUrl }
}
