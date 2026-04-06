// Logo do PsiConnect — ícone de cérebro baseado na imagem enviada
export default function Logo({ size = 36, showText = true }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Ícone de cérebro com fundo verde arredondado */}
      <div
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        className="bg-brand-600 flex items-center justify-center flex-shrink-0"
      >
        <svg
          width={size * 0.58}
          height={size * 0.58}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cérebro simplificado — dois hemisférios */}
          <path
            d="M12 3C10.5 3 9.2 3.8 8.5 5C7.2 5.1 6 5.9 5.5 7.1C4.3 7.5 3.5 8.6 3.5 9.9C3.5 10.7 3.8 11.4 4.3 11.9C4.1 12.4 4 12.9 4 13.5C4 15.4 5.3 17 7 17.4V19H12V3Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M12 3C13.5 3 14.8 3.8 15.5 5C16.8 5.1 18 5.9 18.5 7.1C19.7 7.5 20.5 8.6 20.5 9.9C20.5 10.7 20.2 11.4 19.7 11.9C19.9 12.4 20 12.9 20 13.5C20 15.4 18.7 17 17 17.4V19H12V3Z"
            fill="white"
            opacity="0.95"
          />
          {/* Linha central */}
          <line x1="12" y1="4" x2="12" y2="19" stroke="#0d9488" strokeWidth="0.8" opacity="0.5" />
          {/* Base */}
          <rect x="9" y="19" width="6" height="1.5" rx="0.75" fill="white" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          Psi<span className="text-brand-600">Connect</span>
        </span>
      )}
    </div>
  );
}
