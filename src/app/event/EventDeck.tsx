"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PitchStats } from "@/lib/pitch-stats";

const ACCENT = "#c8e64a";
const CREAM = "#e8dcc8";
const TOTAL_SLIDES = 9;

const SLIDE_LABELS = [
  "Cover",
  "Cidade",
  "Audiência",
  "Números",
  "Real Oficial",
  "Prova Real",
  "Formatos",
  "Fluxo",
  "CTA",
];

const QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://thegitcity.com/advertise&color=c8e64a&bgcolor=0d0f18";

export default function EventDeck({ stats }: { stats: PitchStats }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");

  const go = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= TOTAL_SLIDES || idx === active) return;
      setDir(idx > active ? "next" : "prev");
      setActive(idx);
    },
    [active]
  );

  const next = useCallback(() => go(active + 1), [go, active]);
  const prev = useCallback(() => go(active - 1), [go, active]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    function onStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  const slides = [
    <SlideCover key="cover" stats={stats} />,
    <SlideCity key="city" stats={stats} />,
    <SlideAudience key="audience" />,
    <SlideNumbers key="numbers" />,
    <SlideRealOficial key="real" />,
    <SlideSocialProof key="proof" />,
    <SlideFormats key="formats" />,
    <SlideFlow key="flow" />,
    <SlideCTA key="cta" />,
  ];

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-bg font-pixel uppercase text-warm select-none">
      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto px-6 pb-20 pt-12 sm:px-12 sm:pt-16 md:px-20"
        key={active}
        style={{
          animation: `${dir === "next" ? "slideInRight" : "slideInLeft"} 0.3s ease-out`,
        }}
      >
        {slides[active]}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t-[2px] border-border bg-bg/80 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-dim transition-colors hover:text-cream sm:text-sm"
          >
            &larr; City
          </Link>
          <span className="text-sm text-muted sm:text-base">
            <span style={{ color: CREAM }}>
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="text-dim"> / {TOTAL_SLIDES}</span>
          </span>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-1.5 px-8 md:flex">
          {SLIDE_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => go(i)}
              className="group relative"
              aria-label={label}
            >
              <div
                className="h-1.5 w-8 transition-all lg:w-10"
                style={{
                  background: i === active ? ACCENT : i < active ? ACCENT + "60" : "#2a2a30",
                }}
              />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={active === 0}
            className="btn-press border-[2px] border-border px-3 py-1.5 text-sm text-cream transition-colors hover:border-border-light disabled:opacity-30 sm:px-4 sm:py-2 sm:text-base"
          >
            &larr;
          </button>
          <button
            onClick={next}
            disabled={active === TOTAL_SLIDES - 1}
            className="btn-press border-[2px] border-border px-3 py-1.5 text-sm text-cream transition-colors hover:border-border-light disabled:opacity-30 sm:px-4 sm:py-2 sm:text-base"
          >
            &rarr;
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}

/* ─────────────── slides ─────────────── */

function SlideCover({ stats }: { stats: PitchStats }) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-base text-muted normal-case sm:text-lg">
        Build in Public Meetup 2026
      </p>
      <div className="text-6xl sm:text-8xl lg:text-[10rem]">
        <span style={{ color: CREAM }}>GIT</span>{" "}
        <span style={{ color: ACCENT }}>CITY</span>
      </div>
      <p className="text-xl text-muted normal-case sm:text-3xl">
        Anuncie onde {stats.formattedDevelopers} devs olham
      </p>
    </div>
  );
}

function SlideCity({ stats }: { stats: PitchStats }) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Cada perfil do GitHub vira um prédio 3D
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        <BigStat value={stats.formattedDevelopers} label="prédios reais" />
        <BigStat value="$0" label="gasto em marketing" />
        <BigStat value={stats.formattedDaysOld.replace(" days old", "")} label="dias no ar" />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        100% orgânico
      </p>
    </div>
  );
}

function SlideAudience() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        A audiência
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        <BigStat value="100%" label="devs verificados via GitHub" />
        <BigStat value="0" label="bots" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        <BigStat value="12%" label="bounce rate" />
        <BigStat value="100%" label="viewability" />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        Não dá pra visitar a cidade sem ver o seu anúncio
      </p>
    </div>
  );
}

function SlideNumbers() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Performance real
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        <BigStat value="83K+" label="impressões" />
        <BigStat value="420+" label="cliques" />
        <BigStat value="1.26%" label="melhor CTR" />
      </div>
      <div className="w-full max-w-xl space-y-4">
        <CTRBar name="Git City" value={1.26} max={1.5} highlight />
        <CTRBar name="X (Twitter)" value={0.8} max={1.5} />
        <CTRBar name="Google Display" value={0.5} max={1.5} />
        <CTRBar name="LinkedIn" value={0.4} max={1.5} />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        2.5x a média da indústria
      </p>
    </div>
  );
}

function SlideRealOficial() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Real Oficial
      </p>
      <p className="text-base text-muted normal-case sm:text-lg">
        5 anúncios pagos em 7 dias
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        <BigStat value="83K+" label="impressões" />
        <BigStat value="420" label="cliques" />
        <BigStat value="1.26%" label="melhor CTR" />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        Maior anunciante da Git City
      </p>
    </div>
  );
}

function SlideSocialProof() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Casos reais
      </p>

      {/* Case 1: BorkCloud */}
      <div className="w-full max-w-2xl border-[3px] border-border bg-bg-raised p-6 sm:p-8">
        <p className="text-lg text-cream normal-case sm:text-2xl">
          BorkCloud
        </p>
        <p className="mt-2 text-sm text-muted normal-case sm:text-base">
          Anúncio criado hoje nesse evento
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          <BigStat value="765" label="impressões" />
          <BigStat value="4" label="cliques" />
          <BigStat value="4h" label="no ar" />
        </div>
      </div>

      {/* Case 2: SaaS dev */}
      <div className="w-full max-w-2xl border-[3px] p-6 sm:p-8" style={{ borderColor: ACCENT, backgroundColor: ACCENT + "08" }}>
        <p className="text-lg text-cream normal-case sm:text-2xl">
          Himetrica.com
        </p>
        <p className="mt-2 text-sm text-muted normal-case sm:text-base">
          Anúncio de 7 dias
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          <BigStat value="300" label="usuários enviados" />
          <BigStat value="2" label="conversões" />
        </div>
      </div>
    </div>
  );
}

function SlideFormats() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        5 formatos de anúncio
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <FormatIcon icon="&#9992;" name="Avião" slots={8} />
        <FormatIcon icon="&#9670;" name="Dirigível" slots={4} />
        <FormatIcon icon="&#128203;" name="Billboard" slots={10} />
        <FormatIcon icon="&#128260;" name="Rooftop" slots={10} />
        <FormatIcon icon="&#128161;" name="LED Wrap" slots={10} />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        Slots limitados por formato
      </p>
    </div>
  );
}

function SlideFlow() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Do zero ao anúncio ao vivo
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        <StepBig n="01" label="Escolha" />
        <Arrow />
        <StepBig n="02" label="Customize" />
        <Arrow />
        <StepBig n="03" label="Pague" />
        <Arrow />
        <StepBig n="04" label="Ao vivo" />
      </div>
      <p className="text-lg normal-case sm:text-2xl" style={{ color: ACCENT }}>
        Menos de 2 minutos. Sem criar conta.
      </p>
    </div>
  );
}

function SlideCTA() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      <div className="text-5xl sm:text-7xl lg:text-[9rem]">
        <span style={{ color: CREAM }}>GIT</span>{" "}
        <span style={{ color: ACCENT }}>CITY</span>
      </div>
      <p className="text-xl text-cream normal-case sm:text-3xl">
        Seu produto na frente de devs reais
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={QR_URL}
        alt="QR Code para thegitcity.com/advertise"
        width={220}
        height={220}
        className="border-[4px] border-border"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="border-[3px] px-8 py-4 sm:px-12 sm:py-5" style={{ borderColor: ACCENT, backgroundColor: ACCENT + "10" }}>
        <p className="text-sm text-muted normal-case sm:text-base">
          Cupom de desconto
        </p>
        <p className="mt-2 text-3xl sm:text-5xl" style={{ color: ACCENT }}>
          GITCITY30
        </p>
        <p className="mt-2 text-base text-cream normal-case sm:text-xl">
          30% off no primeiro mês
        </p>
      </div>
      <p className="text-base text-muted normal-case sm:text-lg">
        thegitcity.com/advertise
      </p>
    </div>
  );
}

/* ─────────────── sub-components ─────────────── */

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-5xl sm:text-7xl" style={{ color: ACCENT }}>
        {value}
      </p>
      <p className="text-sm text-muted normal-case sm:text-base">{label}</p>
    </div>
  );
}

function CTRBar({
  name,
  value,
  max,
  highlight,
}: {
  name: string;
  value: number;
  max: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="w-32 shrink-0 text-right text-sm normal-case sm:text-base"
        style={{ color: highlight ? CREAM : undefined }}
      >
        {name}
      </span>
      <div className="relative h-8 flex-1 overflow-hidden rounded-sm">
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: highlight ? ACCENT : "#2a2a30",
          }}
        />
      </div>
      <span
        className="w-16 text-right text-base font-bold sm:text-lg"
        style={{ color: highlight ? ACCENT : undefined }}
      >
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function FormatIcon({ icon, name, slots }: { icon: string; name: string; slots: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-20 w-20 items-center justify-center border-[3px] border-border text-3xl sm:h-24 sm:w-24 sm:text-4xl">
        {icon}
      </div>
      <p className="text-sm text-cream sm:text-base">{name}</p>
      <p className="text-xs text-dim normal-case">{slots} slots</p>
    </div>
  );
}

function StepBig({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-4xl sm:text-6xl" style={{ color: ACCENT }}>
        {n}
      </p>
      <p className="text-sm text-cream normal-case sm:text-lg">{label}</p>
    </div>
  );
}

function Arrow() {
  return (
    <span className="hidden text-2xl text-dim sm:block">&rarr;</span>
  );
}
