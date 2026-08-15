export default function Loading() {
  return (
    <main id="main-content" className="route-page global-route-state" aria-busy="true">
      <div className="global-route-state__header" aria-hidden="true">
        <span />
        <i />
      </div>
      <div className="global-route-state__grid" aria-hidden="true">
        <i /><i /><i />
      </div>
      <p className="sr-only" role="status">Səhifə yüklənir.</p>
    </main>
  );
}
