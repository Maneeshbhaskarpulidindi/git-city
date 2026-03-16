"use client";

const ACCENT = "#4285F4";

interface DinzoCardProps {
  onClose: () => void;
}

export default function DinzoCard({ onClose }: DinzoCardProps) {
  return (
    <>
      {/* Nav hints — desktop only */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden text-right text-[9px] leading-loose text-muted sm:block">
        <div><span style={{ color: ACCENT }}>ESC</span> close</div>
      </div>

      {/* Card container */}
      <div className="pointer-events-auto fixed z-40
        bottom-0 left-0 right-0
        sm:bottom-auto sm:left-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
      >
        <div className="relative border-t-[3px] border-border bg-bg-raised/95 backdrop-blur-sm
          w-full max-h-[50vh] overflow-y-auto sm:w-[320px] sm:border-[3px] sm:max-h-[85vh]
          animate-[slide-up_0.2s_ease-out] sm:animate-none"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-[10px] text-muted transition-colors hover:text-cream z-10"
          >
            ESC
          </button>

          {/* Drag handle on mobile */}
          <div className="flex justify-center py-2 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 sm:pt-4">
            <div className="flex items-center gap-3">
              {/* Logo icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center border-2 rounded-lg"
                style={{ borderColor: ACCENT, backgroundColor: ACCENT + "11" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3a9 9 0 0 1 6.36 2.64l-1.42 1.42A7 7 0 1 0 19 12h-3l4-4 4 4h-3a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"
                    fill={ACCENT}
                  />
                  <line x1="12" y1="12" x2="15" y2="8" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.5" fill={ACCENT} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: ACCENT }}>
                  Dinzo
                </p>
                <p className="text-[10px] text-muted">Controle financeiro pessoal</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border" />

          {/* Info */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-[10px] text-muted leading-relaxed">
              Organize contas, cartoes e gastos num so lugar. Categorias com IA, lembretes de pagamento e relatorios visuais. Mais pratico que qualquer planilha.
            </p>

            {/* Features */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="text-[9px] text-muted">Open Finance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="text-[9px] text-muted">Categorias com IA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="text-[9px] text-muted">iOS, Android & Web</span>
              </div>
            </div>

            {/* Sponsored badge */}
            <div className="flex items-center gap-1.5 pt-1">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              <span className="text-[9px]" style={{ color: ACCENT + "99" }}>Sponsored landmark</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border" />

          {/* Action */}
          <div className="px-4 py-3">
            <a
              href="https://dinzo.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-center text-[10px] font-bold uppercase tracking-wider border-2 transition-all hover:brightness-110"
              style={{
                borderColor: ACCENT,
                color: ACCENT,
                backgroundColor: ACCENT + "11",
              }}
            >
              Visit dinzo.com.br
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
