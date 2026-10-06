"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshIcon } from "@/components/icons";

const THRESHOLD = 80; // px de arrastre (ya amortiguado) para disparar la recarga
const MAX_PULL = 130;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS con la app agregada a inicio
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Una PWA instalada no tiene el "tirar para recargar" del navegador: lo recreamos.
export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    if (!isStandalone()) return;
    document.documentElement.classList.add("standalone");

    function onStart(e: TouchEvent) {
      const target = e.target as Element;
      if (
        window.scrollY > 0 ||
        e.touches.length > 1 ||
        target.closest("input, textarea, select") ||
        // Con un modal abierto (incluido su fondo) no se recarga.
        document.querySelector('[role="alertdialog"]')
      ) {
        start.current = null;
        return;
      }
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragging(true);
    }

    function onMove(e: TouchEvent) {
      if (!start.current) return;
      const dy = e.touches[0].clientY - start.current.y;
      const dx = Math.abs(e.touches[0].clientX - start.current.x);
      if (dy <= 0 || dx > dy || window.scrollY > 0) {
        pullRef.current = 0;
        setPull(0);
        return;
      }
      // Resistencia: cuanto más tirás, menos avanza.
      const damped = Math.min(MAX_PULL, dy * 0.5);
      pullRef.current = damped;
      setPull(damped);
    }

    function onEnd() {
      if (!start.current) return;
      start.current = null;
      setDragging(false);
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        window.location.reload();
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (pull === 0 && !refreshing) return null;

  const ready = pull >= THRESHOLD;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <div
      aria-hidden={!refreshing}
      role={refreshing ? "status" : undefined}
      aria-label={refreshing ? "Recargando" : undefined}
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center"
      style={{
        top: "env(safe-area-inset-top)",
        transform: `translateY(${pull - 44}px)`,
        transition: dragging ? "none" : "transform 200ms ease-out",
      }}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors ${
          ready || refreshing ? "text-accent" : "text-muted"
        }`}
        style={{ opacity: Math.max(progress, refreshing ? 1 : 0.2) }}
      >
        <span
          className="flex"
          style={refreshing ? undefined : { transform: `rotate(${progress * 300}deg)` }}
        >
          <RefreshIcon className={`size-5 ${refreshing ? "animate-spin" : ""}`} />
        </span>
      </div>
    </div>
  );
}
