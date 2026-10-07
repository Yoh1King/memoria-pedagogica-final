/// <reference types="vite-plugin-pwa/client" />
// Single, guarded service-worker registration point for the app.

function isRefusedContext() {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const h = window.location.hostname;
  const zones = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (zones.some((z) => h === z || h.endsWith("." + z))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => (r.active ?? r.waiting ?? r.installing)?.scriptURL.endsWith("/sw.js"))
      .map((r) => r.unregister()),
  );
}

export async function registerAppServiceWorker(onNeedRefresh: (update: () => void) => void) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    await unregisterAppWorkers().catch(() => {});
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      onNeedRefresh(() => void updateSW(true));
    },
  });
}
