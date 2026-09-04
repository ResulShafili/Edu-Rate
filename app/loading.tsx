/**
 * Suspense yüklənmə vəziyyəti.
 *
 * QEYD: burada əvvəl `<main id="main-content">` istifadə olunurdu. Yüklənmə
 * zamanı əsl səhifə də DOM-da olduğuna görə sənəddə İKİ `<main>` və təkrar
 * `main-content` id-si yaranırdı: bu, HTML standartına ziddir və "Əsas məzmuna
 * keç" keçidi əsl məzmun əvəzinə bu placeholder-ə tullanırdı. Ona görə burada
 * landmark və id verilmir — sadəcə vəziyyət bildirən bir qutudur.
 */
export default function Loading() {
  return (
    <div className="route-page global-route-state" aria-busy="true">
      <div className="global-route-state__header" aria-hidden="true">
        <span />
        <i />
      </div>
      <div className="global-route-state__grid" aria-hidden="true">
        <i /><i /><i />
      </div>
      <p className="sr-only" role="status">Səhifə yüklənir.</p>
    </div>
  );
}
