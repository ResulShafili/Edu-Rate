"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <section className="ui-state is-error" role="alert">
        <h1>Səhifə yüklənmədi.</h1>
        <p>Məlumatlar qorunub. Bağlantını yoxlayıb yenidən cəhd et.</p>
        <button type="button" className="kuds-primary-button" onClick={reset}><RotateCcw size={15} aria-hidden="true" /> Yenidən yoxla</button>
      </section>
    </main>
  );
}
