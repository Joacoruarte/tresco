// Links para llamar / abrir WhatsApp a partir del número cargado a mano.

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// WhatsApp necesita formato internacional sin "+". Si el número no trae
// código de país asumimos Argentina celular: 54 + 9 + área + número.
export function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+") || digits.startsWith("54")) return digits;
  return `549${digits.replace(/^0/, "")}`;
}

function isMobile() {
  const ua = navigator.userAgent;
  // iPadOS se presenta como Mac; lo delata el touch.
  return (
    /Android|iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function openWhatsApp(phone: string) {
  const n = whatsappNumber(phone);
  if (isMobile()) {
    // Abre la app nativa (WhatsApp o WhatsApp Business; si están las dos, elige el sistema).
    window.location.href = `whatsapp://send?phone=${n}`;
  } else {
    window.open(`https://web.whatsapp.com/send?phone=${n}`, "_blank", "noopener,noreferrer");
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Sin HTTPS (ej: probando desde el celu por la IP local) no hay Clipboard API.
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}
