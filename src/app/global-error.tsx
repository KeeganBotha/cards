"use client";

// Last-resort boundary: catches errors thrown by the root layout itself.
// Must render its own <html>/<body> because the layout is gone at this point,
// and styles from the layout may be unavailable — keep it dependency-free.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1>Something went wrong</h1>
        <p>The app hit an unexpected error — reload to continue.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
