import { useState } from "react";
import { shortenUrl } from "./api.js";

export default function App() { 
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);
    try {
      setResult(await shortenUrl(url));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="page">
      <h1 className="title">Paste a long link.<br />Get a short one.</h1>

      <form className="form" onSubmit={onSubmit}>
        {/* <label htmlFor="url" className="sr-only">Long URL</label> */}
        <input
          id="url"
          type="text"
          inputMode="url"
          placeholder="https://example.com/a/very/long/path?with=params"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Shortening…" : "Shorten link"}
        </button>
      </form>

      <div aria-live="polite" className="status">
        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result">
            <p className="was">{result.originalUrl}</p>
            <div className="now">
              <a href={result.shortUrl} target="_blank" rel="noreferrer">{result.shortUrl}</a>
              <button type="button" className="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
