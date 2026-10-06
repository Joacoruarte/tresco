"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import {
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  CopyIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { copyText, openWhatsApp, telHref } from "@/lib/contact";

import type { Phone, PhoneType } from "@/lib/db";

type PhoneInput = Omit<Phone, "id">;

const input =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-accent";
const primaryBtn =
  "rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50";
const ghostBtn =
  "rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-accent hover:text-accent";
const actionBtn =
  "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98]";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Algo salió mal");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const sortPhones = (list: Phone[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));

type Channel = "both" | "phone" | "whatsapp";
type Filter = "all" | Channel;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "both", label: "Ambos" },
  { value: "phone", label: "Solo teléfono" },
  { value: "whatsapp", label: "Solo WhatsApp" },
];

function channelOf(p: Phone): Channel {
  if (p.type === "phone") return "phone";
  return p.whatsappOnly ? "whatsapp" : "both";
}

// "José" matchea "jose": sin mayúsculas ni tildes.
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export default function Phones({ initialPhones }: { initialPhones: Phone[] }) {
  const [phones, setPhones] = useState(initialPhones);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Phone | null>(null);
  const [query, setQuery] = useState("");

  const [filter, setFilter] = useState<Filter>("all");

  const q = normalize(query);
  const matching = q
    ? phones.filter((p) => normalize(p.name).includes(q))
    : phones;
  const counts: Record<Filter, number> = {
    all: matching.length,
    both: 0,
    phone: 0,
    whatsapp: 0,
  };
  for (const p of matching) counts[channelOf(p)]++;
  const visible =
    filter === "all"
      ? matching
      : matching.filter((p) => channelOf(p) === filter);

  async function create(data: PhoneInput) {
    const created = await request<Phone>("/api/phones", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setPhones((p) => sortPhones([...p, created]));
    setAdding(false);
  }

  async function update(id: number, data: PhoneInput) {
    const updated = await request<Phone>(`/api/phones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setPhones((p) => sortPhones(p.map((x) => (x.id === id ? updated : x))));
  }

  async function remove(id: number) {
    await request(`/api/phones/${id}`, { method: "DELETE" });
    setPhones((p) => p.filter((x) => x.id !== id));
    setToDelete(null);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/" className={ghostBtn} aria-label="Volver">
          ←
        </Link>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Números de teléfono
        </h2>
      </div>

      {adding ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <PhoneForm
            submitLabel="Agregar"
            onSubmit={create}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className={`${primaryBtn} flex items-center justify-center gap-2`}
        >
          <PlusIcon className="size-5" />
          Agregar número
        </button>
      )}

      {phones.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Buscar por nombre"
              aria-label="Buscar por nombre"
              autoComplete="off"
              className={`${input} pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:text-foreground"
              >
                <CloseIcon className="size-4" />
              </button>
            )}
          </div>
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filtrar por tipo"
          >
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-card text-foreground hover:border-accent"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      active ? "bg-white/25" : "bg-border text-muted"
                    }`}
                  >
                    {counts[f.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phones.length === 0 && (
        <p className="text-sm text-muted">Todavía no hay números cargados.</p>
      )}

      {phones.length > 0 && visible.length === 0 && (
        <p className="text-sm text-muted">
          No hay números que coincidan
          {q && <> con &ldquo;{query.trim()}&rdquo;</>}
          {filter !== "all" && (
            <>
              {" "}
              en &ldquo;{FILTERS.find((f) => f.value === filter)?.label}&rdquo;
            </>
          )}
          .
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {visible.map((p) => (
          <PhoneCard
            key={p.id}
            phone={p}
            onUpdate={(data) => update(p.id, data)}
            onDelete={() => setToDelete(p)}
          />
        ))}
      </ul>

      {toDelete && (
        <ConfirmModal
          title="Eliminar número"
          message={`¿Seguro que querés eliminar a ${toDelete.name} (${toDelete.phone})? No se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => remove(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function PhoneCard({
  phone: p,
  onUpdate,
  onDelete,
}: {
  phone: Phone;
  onUpdate: (data: PhoneInput) => Promise<void>;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const canCall = !(p.type === "whatsapp" && p.whatsappOnly);
  const canWhatsApp = p.type === "whatsapp";

  if (editing) {
    return (
      <li className="rounded-xl border border-accent bg-card p-4">
        <PhoneForm
          initial={p}
          submitLabel="Guardar"
          onSubmit={async (data) => {
            await onUpdate(data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-medium">{p.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="tabular-nums">{p.phone}</span>
              <CopyButton text={p.phone} />
            </span>
            {canWhatsApp && (
              <span className="inline-flex items-center gap-1 text-xs text-[#25D366]">
                <WhatsAppIcon className="size-3.5" />
                {p.whatsappOnly ? "Solo WhatsApp" : "WhatsApp"}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "Ocultar opciones" : "Más opciones"}
          className="-m-1 shrink-0 rounded-lg p-1.5 text-muted transition hover:text-foreground"
        >
          <ChevronIcon
            className={`size-5 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`mt-3 grid gap-2 ${
          canCall && canWhatsApp ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {canCall && (
          <a
            href={telHref(p.phone)}
            className={`${actionBtn} bg-accent text-white hover:opacity-90`}
          >
            <PhoneIcon className="size-4" />
            Llamar
          </a>
        )}
        {canWhatsApp && (
          <button
            onClick={() => openWhatsApp(p.phone)}
            className={`${actionBtn} bg-[#1fa855] text-white hover:bg-[#1b934b]`}
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
          <button onClick={() => setEditing(true)} className={ghostBtn}>
            Editar
          </button>
          <button
            onClick={onDelete}
            className={`${ghostBtn} hover:border-red-500 hover:text-red-500`}
          >
            Eliminar
          </button>
        </div>
      )}
    </li>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => copyText(text).then(() => setCopied(true))}
      aria-label={copied ? "Número copiado" : "Copiar número"}
      title="Copiar número"
      className={`relative inline-flex rounded-md p-1.5 transition ${
        copied ? "text-[#25D366]" : "text-muted hover:text-foreground"
      }`}
    >
      {/* Mismo tamaño en ambos estados y el aviso flota: sin layout shift. */}
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
      {copied && (
        <span
          role="status"
          className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow"
        >
          Copiado
        </span>
      )}
    </button>
  );
}

function PhoneForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: PhoneInput;
  submitLabel: string;
  onSubmit: (data: PhoneInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [type, setType] = useState<PhoneType>(initial?.type ?? "phone");
  const [whatsappOnly, setWhatsappOnly] = useState(
    initial?.whatsappOnly ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name,
        phone,
        type,
        whatsappOnly: type === "whatsapp" && whatsappOnly,
      });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={saving} className="flex flex-col gap-2">
        <input
          className={input}
          placeholder="Nombre (ej: Proveedor muzzarella)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
        />
        <input
          className={input}
          placeholder="Teléfono (ej: 11 5555-1234)"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
          required
        />
        <select
          className={input}
          value={type}
          onChange={(e) => setType(e.target.value as PhoneType)}
          aria-label="Tipo de contacto"
        >
          <option value="phone">Teléfono</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        {type === "whatsapp" && (
          <>
            <label className="flex items-center gap-2 px-1 py-1 text-sm">
              <input
                type="checkbox"
                checked={whatsappOnly}
                onChange={(e) => setWhatsappOnly(e.target.checked)}
                className="size-4 accent-[#1fa855]"
              />
              Solo WhatsApp (sin botón de llamar)
            </label>
            <p className="px-1 text-xs text-muted">
              Cargalo con código de área y sin el 15. Si no tiene código de país
              se asume Argentina (+54 9).
            </p>
          </>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className={`${primaryBtn} flex-1`}>
            {saving ? "Guardando…" : submitLabel}
          </button>
          <button type="button" onClick={onCancel} className={ghostBtn}>
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
