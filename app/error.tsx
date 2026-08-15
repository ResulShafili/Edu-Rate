"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("EduRate route error", error);
  }, [error]);

  return (
    <main id="main-content" className="route-page global-route-state is-error" tabIndex={-1}>
      <AlertCircle aria-hidden="true" />
      <span>Səhifə açılmadı</span>
      <h1>Bir problem yarandı.</h1>
      <p>Məlumatlarınız dəyişdirilmədi. Yenidən cəhd edin və ya ana səhifəyə qayıdın.</p>
      <div>
        <button type="button" onClick={reset}><RotateCcw size={16} /> Yenidən yoxla</button>
        <Link href="/">Ana səhifə</Link>
      </div>
    </main>
  );
}
