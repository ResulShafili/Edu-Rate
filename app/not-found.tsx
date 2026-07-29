import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="route-page" tabIndex={-1}>
      <section className="ui-state" aria-labelledby="not-found-title">
        <span className="ui-eyebrow">404</span>
        <h1 id="not-found-title">Bu səhifə tapılmadı.</h1>
        <p>Keçid köhnəlmiş və ya ünvan səhv yazılmış ola bilər.</p>
        <Link className="kuds-primary-button" href="/"><ArrowLeft size={15} aria-hidden="true" /> Ana səhifəyə qayıt</Link>
      </section>
    </main>
  );
}
