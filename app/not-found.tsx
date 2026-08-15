import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="route-page global-route-state is-error" tabIndex={-1}>
      <SearchX aria-hidden="true" />
      <span>404 · Səhifə tapılmadı</span>
      <h1>Bu ünvan mövcud deyil.</h1>
      <p>Keçid dəyişmiş və ya səhifə silinmiş ola bilər.</p>
      <div><Link href="/"><ArrowLeft size={16} /> Ana səhifəyə qayıt</Link></div>
    </main>
  );
}
