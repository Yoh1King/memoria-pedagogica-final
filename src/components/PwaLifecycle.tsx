import { useEffect, useState } from "react";
import { Download, Share, WifiOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registerAppServiceWorker } from "@/lib/pwa";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
const IOS_HINT_KEY = "mp-ios-install-hint-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Install availability, iOS hint, update prompt and offline indicator. */
export function PwaLifecycle() {
  const [online, setOnline] = useState(true);
  const [installEvt, setInstallEvt] = useState<InstallEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const standalone = isStandalone();
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (!standalone) setInstallEvt(e as InstallEvent);
    };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const safari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (ios && safari && !standalone && !localStorage.getItem(IOS_HINT_KEY)) setIosHint(true);

    void registerAppServiceWorker((update) => {
      toast("Nova versão disponível", {
        duration: Infinity,
        action: { label: "Atualizar", onClick: update },
      });
    });

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismissIos = () => {
    localStorage.setItem(IOS_HINT_KEY, "1");
    setIosHint(false);
  };

  return (
    <>
      {!online && (
        <div
          role="status"
          className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground"
        >
          <WifiOff className="size-4 shrink-0" />
          Você está sem conexão. Alterações e novos dados dependem da internet.
        </div>
      )}
      {(installEvt || iosHint) && (
        <div
          className="fixed inset-x-3 z-40 mx-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground shadow-lg"
          style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          {installEvt ? (
            <>
              <Download className="mt-0.5 size-4 shrink-0" />
              <p className="flex-1">Instale o Memória Pedagógica para abrir como aplicativo.</p>
              <Button
                size="sm"
                onClick={async () => {
                  await installEvt.prompt();
                  setInstallEvt(null);
                }}
              >
                Instalar
              </Button>
            </>
          ) : (
            <>
              <Share className="mt-0.5 size-4 shrink-0" />
              <p className="flex-1">
                Para instalar, toque em <strong>Compartilhar</strong> e depois em{" "}
                <strong>Adicionar à Tela de Início</strong>.
              </p>
            </>
          )}
          <button
            type="button"
            aria-label="Fechar"
            className="-m-1 p-2 text-muted-foreground"
            onClick={() => (installEvt ? setInstallEvt(null) : dismissIos())}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
