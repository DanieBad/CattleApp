// PageLoader — shown by <Suspense> while a lazy page chunk is being fetched.
// Intentionally matches the existing auth-loading style in App.tsx so there's
// no jarring visual shift during navigation.
export const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      color: 'var(--primary)',
    }}
  >
    <div
      style={{
        width: '32px',
        height: '32px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  </div>
);
