interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  withLabel?: boolean;
}

export default function ThemeToggle({ theme, onToggle, withLabel = false }: ThemeToggleProps) {
  const next = theme === 'dark' ? '浅色' : '深色';

  return (
    <button
      type="button"
      className={withLabel ? 'icon-btn' : 'icon-btn'}
      onClick={onToggle}
      title={`切换到${next}模式`}
      aria-label={`切换到${next}模式`}
      style={withLabel ? { width: 'auto', padding: '0 10px', gap: 6 } : undefined}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.4A8.2 8.2 0 1 1 9.6 4a6.6 6.6 0 0 0 10.4 10.4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {withLabel ? <span style={{ fontSize: 13 }}>{next}</span> : null}
    </button>
  );
}
