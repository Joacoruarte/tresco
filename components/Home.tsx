"use client";

import BigPizzaLogo from "@/components/BigPizzaLogo";

const LINKS = [
  {
    label: "Gastos y movimientos",
    href: "https://docs.google.com/spreadsheets/d/1q5rT_Yhgy5kPGoZ_v6lOadIEwUhOem5n10ODDpyc2mE/edit?gid=312492291#gid=312492291",
  },
  {
    label: "Checklist de apertura",
    href: "https://docs.google.com/spreadsheets/d/1RnEkKkSYhtkqaQyxhtlDtsakFOz88V_R8dlD67B9wAQ/edit?gid=339431042#gid=339431042",
  },
  {
    label: "Drive general",
    href: "https://drive.google.com/drive/u/1/folders/1QZJ85vfYX0FvSMiTBRejSlPVDaNrWeV6",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-6xl font-extrabold tracking-tight sm:text-7xl">
          Tresco<span className="text-accent">.</span>
        </h1>
        <div className="flex flex-col items-center gap-3">
          <BigPizzaLogo className="h-auto w-40 sm:w-48" />
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            Big Pizza Colegiales
          </p>
        </div>
      </div>

      <nav className="flex w-full max-w-sm flex-col gap-3">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 font-medium transition hover:border-accent hover:text-accent active:scale-[0.98]"
          >
            {link.label}
            <span aria-hidden>↗</span>
          </a>
        ))}
      </nav>
    </main>
  );
}
