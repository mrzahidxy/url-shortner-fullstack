import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./UrlShortener.module.css";
import type {
  ShortenApiResponse,
  ShortenRequestPayload,
  ShortenSuccessResponse,
} from "../types/api";

type Theme = "light" | "dark";

interface ShortHistoryEntry {
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

const MAX_HISTORY = 5;

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("byteurl-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const UrlShortener = (): JSX.Element => {
  const [url, setUrl] = useState<string>("");
  const [shortUrl, setShortUrl] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<ShortHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem("byteurl-history");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored) as ShortHistoryEntry[];
      return parsed.slice(0, MAX_HISTORY);
    } catch {
      return [];
    }
  });
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("byteurl-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("byteurl-history", JSON.stringify(history));
  }, [history]);

  const trimmedUrl = useMemo(() => url.trim(), [url]);

  const validateUrl = (): string | null => {
    if (!trimmedUrl) {
      return "Please enter a URL to shorten";
    }

    try {
      const parsed = new URL(trimmedUrl);
      if (!/^https?:/.test(parsed.protocol)) {
        return "URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Please provide a valid URL";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setStatus("");
    setError("");
    setShortUrl("");
    setCopied(false);

    if (!apiBaseUrl) {
      setError("API URL is not configured");
      return;
    }

    const validationError = validateUrl();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: ShortenRequestPayload = { url: trimmedUrl };
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ShortenApiResponse;

      if (!response.ok || "error" in data) {
        const message =
          ("error" in data && data.error) || "Failed to shorten URL";
        throw new Error(message);
      }

      const newShortUrl = (data as ShortenSuccessResponse).shortUrl;
      setShortUrl(newShortUrl);
      setStatus("Link shortened successfully");

      setHistory((prev) => {
        const entry: ShortHistoryEntry = {
          originalUrl: trimmedUrl,
          shortUrl: newShortUrl,
          createdAt: new Date().toISOString(),
        };

        const deduped = [entry, ...prev.filter((h) => h.shortUrl !== newShortUrl)];
        return deduped.slice(0, MAX_HISTORY);
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while shortening the URL";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setUrl(event.target.value);
    if (error) setError("");
  };

  const handleCopy = async (): Promise<void> => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setStatus("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy. Please copy manually.");
    }
  };

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.surface}`} aria-live="polite">
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.eyebrow}>ByteURL</span>
            <h1 className={styles.title}>Simplify your links</h1>
            <p className={styles.subtitle}>
              Shorten, copy, and keep recent links all in one place.
            </p>
          </div>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle dark or light mode"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.primary}>
            <form className={styles.formCard} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor="url-input">
                Enter your long URL
                <span className={styles.badge}>Secure · https ready</span>
              </label>
              <div className={styles.inputGroup}>
                <input
                  id="url-input"
                  name="url"
                  type="url"
                  className={styles.input}
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/your/long/link"
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "url-error" : undefined}
                />
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? <span className={styles.spinner} /> : "Shorten URL"}
                </button>
              </div>
              <p className={styles.helper}>
                We keep it simple: your link is validated before shortening.
              </p>

              <div className={styles.feedbackRow}>
                {error && (
                  <div className={styles.error} id="url-error" role="alert">
                    {error}
                  </div>
                )}
                {status && !error && (
                  <div className={styles.success} role="status">
                    ✓ {status}
                  </div>
                )}
              </div>

              {shortUrl && (
                <div className={styles.resultCard}>
                  <div className={styles.resultLink}>
                    <span className={styles.label}>Your shortened link</span>
                    <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                      {shortUrl}
                    </a>
                  </div>
                  <div className={styles.resultActions}>
                    <button
                      type="button"
                      className={styles.copyButton}
                      onClick={handleCopy}
                    >
                      {copied ? "Copied ✓" : "Copy link"}
                    </button>
                    <span className={styles.badge}>
                      {new URL(shortUrl).hostname}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>

          <aside className={styles.secondary} aria-live="polite">
            <div className={styles.history}>
              <div className={styles.label}>
                Recent links
                <span className={styles.badge}>Saved locally</span>
              </div>
              {history.length === 0 ? (
                <p className={styles.emptyState}>
                  Shorten a URL to see it appear here.
                </p>
              ) : (
                <ul className={styles.historyList}>
                  {history.map((entry) => (
                    <li
                      key={`${entry.shortUrl}-${entry.createdAt}`}
                      className={styles.historyItem}
                    >
                      <a
                        href={entry.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {entry.shortUrl}
                      </a>
                      <div className={styles.historyMeta}>
                        <span>{entry.originalUrl}</span>
                        <span aria-hidden="true">•</span>
                        <span>
                          {new Date(entry.createdAt).toLocaleString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </section>
      <p className={styles.srOnly}>
        URL shortener form with loading, validation, history, and copy actions.
      </p>
    </main>
  );
};

export default UrlShortener;
