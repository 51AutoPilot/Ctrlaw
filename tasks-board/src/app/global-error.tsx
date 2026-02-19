'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1 style={{ color: '#c00' }}>Runtime Error</h1>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '60vh',
          overflow: 'auto',
        }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}
