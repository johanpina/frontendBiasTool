declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const TOOL_NAME = "herramienta de sesgos";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackToolStart() {
  gtag("event", "tool_start", {
    tool_name: TOOL_NAME,
  });
}

export function trackStepComplete(stepName: string, stepIndex: number, totalSteps: number) {
  gtag("event", "section_complete", {
    tool_name: TOOL_NAME,
    section_name: stepName,
    section_index: stepIndex,
    progress_pct: Math.round(((stepIndex + 1) / totalSteps) * 100),
  });
}

export function trackToolComplete() {
  gtag("event", "tool_complete", {
    tool_name: TOOL_NAME,
  });
}

export function trackToolExport(format: string = "csv") {
  gtag("event", "tool_export", {
    tool_name: TOOL_NAME,
    format,
  });
}

export async function registerToolUser(email: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tool_users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ email, tool_name: TOOL_NAME }),
    });
  } catch {
    // No bloquear el flujo si el registro falla
  }
}
