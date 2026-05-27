export default function Logo({ size = 32, showText = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src="/logo.png"
        alt="PsiConnect"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {showText && (
        <span style={{
          fontSize:      size > 28 ? '16px' : '14px',
          fontWeight:    '500',
          color:         'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}>
          PsiConnect
        </span>
      )}
    </div>
  );
}
