import type { Metadata } from "next";
import { connection } from "next/server";
import Phones from "@/components/Phones";
import { listPhones } from "@/lib/db";

export const metadata: Metadata = {
  title: "Números de teléfono · Tresco",
};

export default async function TelefonosPage() {
  // Siempre datos frescos de la base, nunca prerenderizado en el build.
  await connection();
  const phones = await listPhones();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <Phones initialPhones={phones} />
    </main>
  );
}
