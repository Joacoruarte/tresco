// Esqueleto con la misma estructura que <Phones /> para que no salte al cargar.
function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-border ${className}`} />;
}

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div
        className="flex w-full max-w-md flex-col gap-5"
        aria-busy="true"
        aria-label="Cargando números"
      >
        <div className="flex items-center gap-3">
          <Bone className="h-[38px] w-[42px]" />
          <Bone className="h-8 w-56" />
        </div>
        <Bone className="h-11 w-full" />
        {/* Buscador + chips de filtro */}
        <div className="flex flex-col gap-3">
          <Bone className="h-[46px] w-full" />
          <div className="-mx-4 flex gap-2 overflow-hidden px-4">
            {["w-[90px]", "w-[97px]", "w-[139px]", "w-[152px]"].map((w, i) => (
              <Bone key={i} className={`h-[34px] shrink-0 rounded-full ${w}`} />
            ))}
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <Bone className="h-5 w-36" />
                  <Bone className="h-4 w-44" />
                </div>
                <Bone className="size-6" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Bone className="h-10" />
                <Bone className="h-10" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
